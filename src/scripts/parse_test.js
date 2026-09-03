const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "page_raw.html"), "utf8");

// Check for Divi team member module: et_pb_team_member
// or Elementor: elementor-widget-image-box or similar
const diviMatches = html.match(/class="[^"]*et_pb_team_member[^"]*"/g);
console.log("Divi team members found:", diviMatches ? diviMatches.length : 0);

const elemMatches = html.match(/class="[^"]*elementor-widget-image-box[^"]*"/g);
console.log("Elementor image boxes found:", elemMatches ? elemMatches.length : 0);

// Let's print out sample snippet of et_pb_team_member or similar
const match = html.match(/<div class="[^"]*et_pb_team_member[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
if (match) {
  console.log("Sample Team Member HTML:\n", match[0].substring(0, 1000));
} else {
  // search for Harpreet Singh
  const idx = html.indexOf("Harpreet Singh");
  if (idx !== -1) {
    console.log("Found Harpreet Singh context:\n", html.substring(idx - 400, idx + 600));
  }
}