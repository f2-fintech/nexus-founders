const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const OUT_DIR = path.join(__dirname, "../../public/images");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function downloadImage(url, destPath) {
  return new Promise((resolve) => {
    if (!url || !url.startsWith("http")) return resolve(null);
    const protocol = url.startsWith("https") ? https : http;
    protocol.get(url, { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 15000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, destPath).then(resolve);
      }
      if (res.statusCode !== 200) return resolve(null);
      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on("finish", () => file.close(() => resolve(destPath)));
    }).on("error", () => resolve(null));
  });
}

const images = [
  { url: "https://nexusfounders.com/wp-content/uploads/2025/06/logo.png", name: "logo.png" },
  { url: "https://nexusfounders.com/wp-content/uploads/2024/12/DSC_0725-1-scaled.jpg", name: "eco1.jpg" },
  { url: "https://nexusfounders.com/wp-content/uploads/2024/11/Nexus-Founders.jpg", name: "eco2.jpg" },
  { url: "https://nexusfounders.com/wp-content/uploads/2024/12/Nexus-Founders-F2-Fintech-.jpg", name: "eco3.jpg" },
];

Promise.all(images.map(img => downloadImage(img.url, path.join(OUT_DIR, img.name)))).then(() => {
  console.log("Home images downloaded locally!");
  process.exit(0);
});