const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const TARGET_URL = "https://nexusfounders.com/portfolio-2/";
const OUT_DIR = path.join(__dirname, "../../public/founders");

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    if (!url || !url.startsWith("http")) {
      return resolve(null);
    }
    const protocol = url.startsWith("https") ? https : http;
    protocol.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return resolve(null);
      }
      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on("finish", () => {
        file.close(() => resolve(destPath));
      });
    }).on("error", (err) => {
      console.error("Failed to download image:", url, err.message);
      resolve(null);
    });
  });
}

async function scrapeAndSave() {
  console.log("Fetching HTML from", TARGET_URL);
  const html = await fetchUrl(TARGET_URL);
  console.log("Fetched HTML length:", html.length);

  // Parse elementor team / person boxes or image boxes
  // Let's inspect the patterns in html
  fs.writeFileSync(path.join(__dirname, "page_raw.html"), html, "utf8");
  console.log("Saved raw HTML to page_raw.html");
}

scrapeAndSave().catch(console.error);