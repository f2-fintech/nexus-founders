const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const mongoose = require("mongoose");

const html = fs.readFileSync(path.join(__dirname, "page_raw.html"), "utf8");
const OUT_DIR = path.join(__dirname, "../../public/founders");

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function downloadImage(url, destPath) {
  return new Promise((resolve) => {
    if (!url || !url.startsWith("http")) return resolve(null);
    const protocol = url.startsWith("https") ? https : http;
    const req = protocol.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }, timeout: 15000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, destPath).then(resolve);
      }
      if (res.statusCode !== 200) {
        return resolve(null);
      }
      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on("finish", () => {
        file.close(() => resolve(destPath));
      });
    });
    req.on("error", () => resolve(null));
    req.on("timeout", () => { req.destroy(); resolve(null); });
  });
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function run() {
  const columnRegex = /<div class="[^"]*et_pb_column[^"]*">([\s\S]*?)<\/div>\s*<!-- \.et_pb_column -->/g;
  const founders = [];
  let match;

  while ((match = columnRegex.exec(html)) !== null) {
    const colHtml = match[1];

    const imgMatch = colHtml.match(/<img[^>]+src="([^">]+)"/i);
    const srcsetMatch = colHtml.match(/srcset="([^">]+)"/i);
    const nameMatch = colHtml.match(/<h[1-6][^>]*class="[^"]*et_pb_module_header[^"]*"[^>]*>[\s\S]*?<span>([^<]+)<\/span>/i)
                   || colHtml.match(/<h[1-6][^>]*class="[^"]*et_pb_module_header[^"]*"[^>]*>([^<]+)<\/h[1-6]>/i);

    if (!nameMatch) continue;

    const name = nameMatch[1].replace(/&amp;/g, "&").trim();
    if (name.toLowerCase().includes("directory") || name.toLowerCase().includes("nexus") && !colHtml.includes("et_pb_social_media_follow")) {
      continue;
    }

    let imgUrl = imgMatch ? imgMatch[1].trim() : "";
    if (srcsetMatch) {
      const parts = srcsetMatch[1].split(",").map(s => s.trim().split(" "));
      if (parts.length > 0) {
        imgUrl = parts[0][0];
      }
    }

    const textInners = [];
    const textInnerRegex = /<div class="et_pb_text_inner">([\s\S]*?)<\/div>/g;
    let textMatch;
    while ((textMatch = textInnerRegex.exec(colHtml)) !== null) {
      const rawText = textMatch[1].replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#8211;/g, "-").replace(/&#8217;/g, "'").replace(/\s+/g, " ").trim();
      if (rawText) textInners.push(rawText);
    }

    let role = "Founder";
    let company = "";

    if (textInners.length >= 2) {
      role = textInners[0];
      company = textInners[1];
    } else if (textInners.length === 1) {
      role = textInners[0];
    }

    const socials = {};
    const liRegex = /<li[^>]*class=['"][^'"]*et-social-([a-z0-9-]+)[^'"]*['"][^>]*>[\s\S]*?<a\s+href=['"]([^'"]+)['"]/gi;
    let sMatch;
    while ((sMatch = liRegex.exec(colHtml)) !== null) {
      const network = sMatch[1].toLowerCase();
      const link = sMatch[2];
      if (network.includes("linkedin")) socials.linkedin = link;
      else if (network.includes("instagram")) socials.instagram = link;
      else if (network.includes("google")) socials.googleplus = link;
      else if (network.includes("twitter") || network.includes("x")) socials.twitter = link;
      else if (network.includes("facebook")) socials.facebook = link;
      else if (network.includes("youtube")) socials.youtube = link;
    }

    const order = founders.length + 1;
    founders.push({
      name,
      role,
      company,
      imgUrl,
      socials,
      order
    });
  }

  console.log(`Parsed ${founders.length} attendees. Downloading images concurrently...`);

  const batchSize = 10;
  for (let i = 0; i < founders.length; i += batchSize) {
    const batch = founders.slice(i, i + batchSize);
    await Promise.all(batch.map(async (f) => {
      if (!f.imgUrl) return;
      const ext = path.extname(f.imgUrl.split("?")[0]) || ".png";
      const filename = `founder_${f.order}_${slugify(f.name)}${ext}`;
      const destPath = path.join(OUT_DIR, filename);
      const res = await downloadImage(f.imgUrl, destPath);
      if (res && fs.existsSync(destPath) && fs.statSync(destPath).size > 500) {
        f.localPhoto = `/founders/${filename}`;
      } else {
        f.localPhoto = f.imgUrl; // fallback to online URL
      }
    }));
    process.stdout.write(`\rDownloaded batch ${Math.min(i + batchSize, founders.length)} / ${founders.length}`);
  }

  console.log("\nConnecting to MongoDB...");
  await mongoose.connect("mongodb://127.0.0.1:27017/nexus-founders");

  const FounderSchema = new mongoose.Schema({
    name: String, role: String, company: String, photo: String,
    linkedin: String, instagram: String, googleplus: String,
    twitter: String, facebook: String, youtube: String,
    order: Number, active: Boolean
  }, { timestamps: true });

  const Founder = mongoose.models.Founder || mongoose.model("Founder", FounderSchema);

  await Founder.deleteMany({});
  
  const docs = founders.map(f => ({
    name: f.name,
    role: f.role,
    company: f.company,
    photo: f.localPhoto || f.imgUrl || "",
    linkedin: f.socials.linkedin || "",
    instagram: f.socials.instagram || "",
    googleplus: f.socials.googleplus || "",
    twitter: f.socials.twitter || "",
    facebook: f.socials.facebook || "",
    youtube: f.socials.youtube || "",
    order: f.order,
    active: true
  }));

  await Founder.insertMany(docs);
  console.log(`\nSuccessfully stored all ${docs.length} founders into MongoDB!`);
  
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});