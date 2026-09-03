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
    const req = protocol.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }, timeout: 10000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, destPath).then(resolve);
      }
      if (res.statusCode !== 200) {
        console.warn(`Status ${res.statusCode} downloading ${url}`);
        return resolve(null);
      }
      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on("finish", () => {
        file.close(() => resolve(destPath));
      });
    });
    req.on("error", (err) => {
      console.error("Error downloading", url, err.message);
      resolve(null);
    });
    req.on("timeout", () => {
      req.destroy();
      console.warn("Timeout downloading", url);
      resolve(null);
    });
  });
}

// Split the page by person sections / blurbs
// Let's find each et_pb_column containing an image and header
const columnRegex = /<div class="[^"]*et_pb_column[^"]*">([\s\S]*?)<\/div>\s*<!-- \.et_pb_column -->/g;

const founders = [];
let match;

while ((match = columnRegex.exec(html)) !== null) {
  const colHtml = match[1];

  // Must contain an image or header to be a person card
  const imgMatch = colHtml.match(/<img[^>]+src="([^">]+)"/i);
  const srcsetMatch = colHtml.match(/srcset="([^">]+)"/i);
  const nameMatch = colHtml.match(/<h[1-6][^>]*class="[^"]*et_pb_module_header[^"]*"[^>]*>[\s\S]*?<span>([^<]+)<\/span>/i)
                 || colHtml.match(/<h[1-6][^>]*class="[^"]*et_pb_module_header[^"]*"[^>]*>([^<]+)<\/h[1-6]>/i);

  if (!nameMatch) continue;

  const name = nameMatch[1].trim();
  if (name.toLowerCase().includes("directory") || name.toLowerCase().includes("nexus") && !colHtml.includes("et_pb_social_media_follow")) {
    // skip non-person headers
    continue;
  }

  // Get best image URL
  let imgUrl = imgMatch ? imgMatch[1].trim() : "";
  if (srcsetMatch) {
    // Pick the largest source from srcset
    const parts = srcsetMatch[1].split(",").map(s => s.trim().split(" "));
    if (parts.length > 0) {
      imgUrl = parts[0][0]; // first one is usually original
    }
  }

  // Role and Company in subsequent text blocks
  const textInners = [];
  const textInnerRegex = /<div class="et_pb_text_inner">([\s\S]*?)<\/div>/g;
  let textMatch;
  while ((textMatch = textInnerRegex.exec(colHtml)) !== null) {
    const rawText = textMatch[1].replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#8211;/g, "-").replace(/\s+/g, " ").trim();
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

  // Social Links
  const socials = {};
  const socialRegex = /<a\s+href="([^"]+)"[^>]*class="[^"]*et_pb_social_icon[^"]*et_pb_social_network_link[^"]*et_pb_social_media_follow_network_([a-z0-9_-]+)[^"]*"/gi;
  let sMatch;
  while ((sMatch = socialRegex.exec(colHtml)) !== null) {
    const link = sMatch[1];
    const network = sMatch[2].toLowerCase();
    if (network.includes("linkedin")) socials.linkedin = link;
    else if (network.includes("instagram")) socials.instagram = link;
    else if (network.includes("google")) socials.googleplus = link;
    else if (network.includes("twitter") || network.includes("x")) socials.twitter = link;
    else if (network.includes("facebook")) socials.facebook = link;
    else if (network.includes("youtube")) socials.youtube = link;
  }

  // Also check general social follow links
  const genericSocialRegex = /<li[^>]*class="[^"]*et_pb_social_media_follow_network_([a-z0-9_-]+)[^"]*"[^>]*>\s*<a\s+href="([^"]+)"/gi;
  while ((sMatch = genericSocialRegex.exec(colHtml)) !== null) {
    const network = sMatch[1].toLowerCase();
    const link = sMatch[2];
    if (network.includes("linkedin") && !socials.linkedin) socials.linkedin = link;
    else if (network.includes("instagram") && !socials.instagram) socials.instagram = link;
    else if (network.includes("google") && !socials.googleplus) socials.googleplus = link;
    else if ((network.includes("twitter") || network.includes("x")) && !socials.twitter) socials.twitter = link;
    else if (network.includes("facebook") && !socials.facebook) socials.facebook = link;
    else if (network.includes("youtube") && !socials.youtube) socials.youtube = link;
  }

  founders.push({
    name,
    role,
    company,
    imgUrl,
    socials,
    order: founders.length + 1
  });
}

console.log(`Extracted ${founders.length} attendees from HTML!`);
founders.slice(0, 10).forEach(f => {
  console.log(`- ${f.name} | ${f.role} | ${f.company} | Img: ${f.imgUrl ? "YES" : "NO"} | Socials: ${Object.keys(f.socials).join(",")}`);
});