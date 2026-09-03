const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const MONGODB_URI = "mongodb://127.0.0.1:27017/nexus-founders";

const UserSchema = new mongoose.Schema({ email: String, password: String, name: String, role: String }, { timestamps: true });
const FounderSchema = new mongoose.Schema({ name: String, role: String, company: String, photo: String, linkedin: String, instagram: String, googleplus: String, twitter: String, facebook: String, youtube: String, order: Number, active: Boolean }, { timestamps: true });
const SiteContentSchema = new mongoose.Schema({ key: { type: String, unique: true }, value: String, type: String, section: String, label: String, updatedBy: String }, { timestamps: true });

const User = mongoose.model("User", UserSchema);
const Founder = mongoose.model("Founder", FounderSchema);
const SiteContent = mongoose.model("SiteContent", SiteContentSchema);

// Load all 178 founders scraped from nexusfounders.com/portfolio-2/
const foundersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'founders_scraped.json'), 'utf8'));

const siteContentData = [
  { key: "hero_edition", value: "Nexus Founders 16th Edition—7th Aug 2026 at IIM Lucknow Noida Campus, Sector 62", type: "text", section: "hero", label: "Hero Edition Tag" },
  { key: "hero_title", value: "Building Business Legacies with Founders", type: "text", section: "hero", label: "Hero Title" },
  { key: "hero_desc", value: "Welcome to Founder Nexus, a vibrant community where innovators thrive! Connect with dynamic entrepreneurs and visionary leaders.", type: "text", section: "hero", label: "Hero Description" },
  { key: "hero_video_url", value: "https://www.youtube.com/embed/tuwzvorehqM?start=8", type: "url", section: "hero", label: "Hero YouTube URL" },
  { key: "fostering_title", value: "Fostering Growth and Collaboration in Noida", type: "text", section: "fostering", label: "Fostering Title" },
  { key: "directory_subtitle", value: "Page Last Updated on 30th June 2026", type: "text", section: "directory", label: "Directory Subtitle" },
  { key: "stat_founders", value: "150+", type: "text", section: "directory", label: "Founders Stat" },
  { key: "stat_locations", value: "7+", type: "text", section: "directory", label: "Locations Stat" },
  { key: "stat_next_event", value: "1st Aug 2026", type: "text", section: "directory", label: "Next Event Stat" },
];

async function seed() {
  console.log("Connecting to MongoDB at", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log("Connected!");

  const adminPwd = await bcrypt.hash("admin123", 12);
  const founderPwd = await bcrypt.hash("founder123", 12);
  await User.deleteMany({});
  await User.create([
    { email: "admin@nexusfounders.com", password: adminPwd, name: "Admin", role: "admin" },
    { email: "founder@nexusfounders.com", password: founderPwd, name: "Founder User", role: "founder" },
  ]);
  console.log("✅ Users seeded (2)");

  await Founder.deleteMany({});
  await Founder.insertMany(foundersData);
  console.log("✅ Founders seeded (" + foundersData.length + ")");

  await SiteContent.deleteMany({});
  await SiteContent.insertMany(siteContentData);
  console.log("✅ Site content seeded (" + siteContentData.length + " items)");

  await mongoose.disconnect();
  console.log("✅ Seed completed successfully!");
  process.exit(0);
}

seed().catch(err => { console.error("Seed error:", err.message); process.exit(1); });