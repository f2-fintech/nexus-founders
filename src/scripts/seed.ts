import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = "mongodb://localhost:27017/nexus-founders";

// ─── Schemas inline (no model import issues) ───
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  role: { type: String, enum: ["admin", "founder"], default: "founder" },
}, { timestamps: true });

const FounderSchema = new mongoose.Schema({
  name: String, role: String, company: String, photo: String,
  linkedin: String, instagram: String, googleplus: String,
  twitter: String, facebook: String, youtube: String,
  order: { type: Number, default: 0 }, active: { type: Boolean, default: true },
}, { timestamps: true });

const SiteContentSchema = new mongoose.Schema({
  key: { type: String, unique: true }, value: String,
  type: { type: String, default: "text" },
  section: String, label: String, updatedBy: String,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Founder = mongoose.models.Founder || mongoose.model("Founder", FounderSchema);
const SiteContent = mongoose.models.SiteContent || mongoose.model("SiteContent", SiteContentSchema);

const foundersData = [
  { name: "Harpreet Singh", role: "Founder", company: "Nexus Founders & F2 Fintech", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Harpreet-Singh-1-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", instagram: "#", googleplus: "#", order: 1 },
  { name: "Abhinav Awal", role: "Co-Founder", company: "F2 Fintech Pvt.Ltd", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Abhinav-Awal-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", instagram: "#", googleplus: "#", order: 2 },
  { name: "Paritosh Sharma", role: "Founder", company: "ShunyaAI", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Paritosh-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", instagram: "#", googleplus: "#", order: 3 },
  { name: "Vardan Dhall", role: "Founder", company: "IndieGuru", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Vardan-Dhall-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", instagram: "#", googleplus: "#", order: 4 },
  { name: "Saurabh Sharma", role: "Founder", company: "Sqaby Technologies", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Saurabh-Sharma-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", instagram: "#", googleplus: "#", order: 5 },
  { name: "Shubham Mishra", role: "Founder", company: "Accelaronix", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Shubham-Mishra-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", instagram: "#", googleplus: "#", order: 6 },
  { name: "Sandeep Kumar", role: "Founder", company: "Dot2dot", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Sandeep-Kumar-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", googleplus: "#", order: 7 },
  { name: "Mayank Mittal", role: "Founder", company: "Advocate Assist AI", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Mayank-Mittal-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", instagram: "#", googleplus: "#", order: 8 },
  { name: "Dalip Singh", role: "Founder", company: "Blendifii International", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Dalip-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", googleplus: "#", order: 9 },
  { name: "Abhishek Sharma", role: "Founder", company: "Diagnomitra", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Abhishek-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", instagram: "#", googleplus: "#", order: 10 },
  { name: "Chetan Chitra", role: "Co-Founder", company: "Raltix AI Innovation", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Chetan-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", instagram: "#", googleplus: "#", order: 11 },
  { name: "Mj Khadim", role: "Founder", company: "Greater Noida Flats", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/MJ-Khadim-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", instagram: "#", googleplus: "#", order: 12 },
  { name: "Mayurakshi Verma", role: "Founder", company: "M AASHIYANA (NGO)", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Mayurakshi-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", googleplus: "#", order: 13 },
  { name: "Shubham Verma", role: "Founder", company: "Boxsam", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Shubham-Verma-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", instagram: "#", googleplus: "#", order: 14 },
  { name: "Arun", role: "Founder", company: "Acquire Modular Pvt Ltd", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Arun-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", instagram: "#", googleplus: "#", order: 15 },
  { name: "Tanuj Agarwal", role: "Co-Founder", company: "Kay Group & Paper Deals", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Tanuj-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", facebook: "#", googleplus: "#", order: 16 },
  { name: "Dileep Jaiswal", role: "Co-founder & MD", company: "Balj Services", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Dileep-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", instagram: "#", order: 17 },
  { name: "Rahul Aggarwal", role: "Founder", company: "Joyz AI", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Rahul-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", instagram: "#", order: 18 },
  { name: "Lavkush Yadav", role: "Founder", company: "Cars96 & Clean4Wheels", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Lavkush-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", googleplus: "#", order: 19 },
  { name: "Lalit Kumar Bansal", role: "Early Stage Investor", company: "Akkrit ventures", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Lalit-Kumar-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", order: 20 },
  { name: "Bharat Bhuttan", role: "Creator", company: "Learning Mavericks", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Bharat-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", instagram: "#", youtube: "#", order: 21 },
  { name: "Tarun Kapoor", role: "Author & Consultant", company: "Book Fraternity", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Tarun-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", instagram: "#", order: 22 },
  { name: "Utpal Rai", role: "Founder", company: "UrsTech Solution", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Utpal-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", googleplus: "#", order: 23 },
  { name: "Pawan D Kumar", role: "Co-Founder", company: "Zielony Air Purifier", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Pawan-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", googleplus: "#", order: 24 },
  { name: "Neha Gupta", role: "Founder", company: "Nehmeer24care LLP", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Neha-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", googleplus: "#", order: 25 },
  { name: "Harsh Panwar", role: "Co-Founder", company: "LawSeek", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Harsh-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", instagram: "#", order: 26 },
  { name: "Shahnawaz Rao", role: "Founder", company: "NXTMile Mobility", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Shahnawaz-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", instagram: "#", googleplus: "#", order: 27 },
  { name: "Ashirwad Rastogi", role: "Founder", company: "Cast My Memory", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Ashirwad-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", instagram: "#", googleplus: "#", order: 28 },
  { name: "Abhinav Gupta", role: "Founder", company: "DepX", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Abhinav-Gupta-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", twitter: "#", order: 29 },
  { name: "Amit B", role: "Business Development Head", company: "Researchwire Knowledge Solutions Pvt. Ltd.", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Amit-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", order: 30 },
  { name: "Pranay Kumar", role: "Joint Secretary", company: "Drone Tech Excellence Association", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Pranay-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", instagram: "#", order: 31 },
  { name: "Subhash C Thakur", role: "Founder", company: "Lokawiz", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Subhash-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", googleplus: "#", order: 32 },
  { name: "Tushar Dublish", role: "Founder", company: "ActionSync", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Tushar-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", instagram: "#", googleplus: "#", order: 33 },
  { name: "Soumitra Bhowmik", role: "Co-Founder & CEO", company: "XON CYBERNETCIS PVT LTD", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Soumitra-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", facebook: "#", googleplus: "#", order: 34 },
  { name: "Dev Tyagi", role: "Chief Technology Officer", company: "Codefancy Lab", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Dev-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", instagram: "#", googleplus: "#", order: 35 },
  { name: "Umesh Khatari", role: "Co-Founder", company: "Rgyan", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Umesh-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", instagram: "#", order: 36 },
  { name: "CA Arjun Dubey", role: "Founder", company: "Stealth AI Startup", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Arjun-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", instagram: "#", googleplus: "#", order: 37 },
  { name: "Vikas Sharma", role: "Founder", company: "The Wings India Tourism", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Vikas-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", instagram: "#", googleplus: "#", order: 38 },
  { name: "Gautham Jha", role: "Director", company: "Venator Minds", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Gautham-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", instagram: "#", order: 39 },
  { name: "Kumar Saurabh", role: "Investor", company: "T9L Qube", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Kumar-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", instagram: "#", order: 40 },
  { name: "Amir Jamal", role: "Political Consultant", company: "Arikap Consultants", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Amir-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", instagram: "#", googleplus: "#", order: 41 },
  { name: "Rajesh Ranjan", role: "Investor", company: "O2 Angels Network", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Rajesh-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", googleplus: "#", order: 42 },
  { name: "Saurav Kumar", role: "General Manager", company: "KIET Group of Institutions", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Saurav-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", facebook: "#", order: 43 },
  { name: "Rohit Jaiswal", role: "Director of Operations", company: "Drive Unlimited", photo: "https://nexusfounders.com/wp-content/uploads/elementor/thumbs/Rohit-r4kpb1u6h8q01gm0kqzv7iqwqb9fj8aicwnl2nv7io.jpeg", linkedin: "#", order: 44 },
];

const siteContentData = [
  { key: "hero_edition", value: "Nexus Founders 16th Edition–7th Aug 2026 at IIM Lucknow Noida Campus, Sector 62", type: "text", section: "hero", label: "Hero Edition Tag" },
  { key: "hero_title", value: "Building Business Legacies with Founders", type: "text", section: "hero", label: "Hero Main Title" },
  { key: "hero_desc", value: "Welcome to Founder Nexus, a vibrant community where innovators thrive! Connect with dynamic entrepreneurs and visionary leaders. Join us for engaging discussions, insightful events, and collaboration opportunities that empower you to reach new heights in your entrepreneurial journey.", type: "text", section: "hero", label: "Hero Description" },
  { key: "hero_video_url", value: "https://www.youtube.com/embed/tuwzvorehqM?start=8", type: "url", section: "hero", label: "Hero YouTube Embed URL" },
  { key: "ecosystem_title", value: "About the Noida Ecosystem", type: "text", section: "ecosystem", label: "Ecosystem Section Title" },
  { key: "fostering_title", value: "Fostering Growth and Collaboration in Noida", type: "text", section: "fostering", label: "Fostering Banner Title" },
  { key: "mentorship_title", value: "Mentorship and Networking", type: "text", section: "mentorship", label: "Mentorship Title" },
  { key: "mentorship_desc", value: "Nexus Founder facilitates mentorship programs and networking events to connect founders and CEOs, providing valuable support and guidance.", type: "text", section: "mentorship", label: "Mentorship Description" },
  { key: "knowledge_title", value: "Knowledge Sharing", type: "text", section: "knowledge", label: "Knowledge Title" },
  { key: "knowledge_desc", value: "The platform hosts workshops, seminars, and webinars to share industry insights, best practices, and innovative solutions.", type: "text", section: "knowledge", label: "Knowledge Description" },
  { key: "investment_title", value: "Investment Opportunities", type: "text", section: "investment", label: "Investment Title" },
  { key: "investment_desc", value: "Nexus Founder connects startups with potential investors, fostering a robust ecosystem for funding and growth.", type: "text", section: "investment", label: "Investment Description" },
  { key: "community_title", value: "Community Engagement", type: "text", section: "community", label: "Community Title" },
  { key: "community_desc", value: "The platform hosts workshops, seminars, and webinars to share industry insights, best practices, and innovative solutions.", type: "text", section: "community", label: "Community Description" },
  { key: "directory_subtitle", value: "Page Last Updated on 30th June 2026", type: "text", section: "directory", label: "Directory Subtitle" },
  { key: "stat_founders", value: "150+", type: "text", section: "directory", label: "Founders Count Stat" },
  { key: "stat_locations", value: "7+", type: "text", section: "directory", label: "Locations Stat" },
  { key: "stat_next_event", value: "1st Aug 2026", type: "text", section: "directory", label: "Next Event Date Stat" },
];

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected!");

  // Seed Users
  const adminPwd = await bcrypt.hash("admin123", 12);
  const founderPwd = await bcrypt.hash("founder123", 12);
  await User.deleteMany({});
  await User.create([
    { email: "admin@nexusfounders.com", password: adminPwd, name: "Admin", role: "admin" },
    { email: "founder@nexusfounders.com", password: founderPwd, name: "Founder User", role: "founder" },
  ]);
  console.log("Users seeded");

  // Seed Founders
  await Founder.deleteMany({});
  await Founder.insertMany(foundersData.map(f => ({ ...f, active: true })));
  console.log(`${foundersData.length} founders seeded`);

  // Seed SiteContent
  await SiteContent.deleteMany({});
  await SiteContent.insertMany(siteContentData);
  console.log(`${siteContentData.length} content items seeded`);

  await mongoose.disconnect();
  console.log("Seed completed successfully!");
  process.exit(0);
}

seed().catch(err => { console.error("Seed error:", err); process.exit(1); });