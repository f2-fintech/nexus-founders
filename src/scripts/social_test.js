const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "page_raw.html"), "utf8");
const idx = html.indexOf("Harpreet Singh");
console.log("Harpreet block:\n", html.substring(idx - 200, idx + 1400));