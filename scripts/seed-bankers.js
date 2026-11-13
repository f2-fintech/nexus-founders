const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dns = require("dns");
const fs = require("fs");
const path = require("path");

try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match && !process.env[match[1]]) {
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        process.env[match[1]] = value.trim();
      }
    });
  }
} catch (e) {}

try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch (e) {}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/nexus-founders";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["admin", "founder", "banker"], default: "founder" },
    bankerProfile: {
      bankName: String,
      designation: String,
      department: String,
      city: String,
      phone: String,
      ticketSizeMin: String,
      ticketSizeMax: String,
      bio: String,
      linkedinUrl: String,
      isVerified: { type: Boolean, default: true },
      onlineStatus: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

const sampleBankers = [
  {
    name: "Vikram Malhotra",
    email: "vikram.malhotra@hdfcbank.com",
    password: "password123",
    role: "banker",
    bankerProfile: {
      bankName: "HDFC Bank",
      designation: "Vice President - Startup & New-Age Banking",
      department: "Startup & Venture Debt",
      city: "Mumbai",
      phone: "+91 98201 11223",
      ticketSizeMin: "₹50 Lakhs",
      ticketSizeMax: "₹50 Crores",
      bio: "Focusing on credit lines, escrow setups, and working capital solutions for high-growth tech enterprises.",
      isVerified: true,
      onlineStatus: true,
    },
  },
  {
    name: "Ananya Sengupta",
    email: "ananya.s@icicibank.com",
    password: "password123",
    role: "banker",
    bankerProfile: {
      bankName: "ICICI Bank",
      designation: "Head - Emerging Corporates & SME Lending",
      department: "Commercial & SME Banking",
      city: "Bengaluru",
      phone: "+91 98450 33445",
      ticketSizeMin: "₹1 Crore",
      ticketSizeMax: "₹75 Crores",
      bio: "Empowering tech startups and cross-border ventures with liquidity, treasury management, and syndication.",
      isVerified: true,
      onlineStatus: true,
    },
  },
  {
    name: "Rahul Deshmukh",
    email: "rahul.d@sbi.co.in",
    password: "password123",
    role: "banker",
    bankerProfile: {
      bankName: "State Bank of India (SBI)",
      designation: "Chief Manager - SME Project Finance",
      department: "SME Project Finance",
      city: "Delhi NCR",
      phone: "+91 98112 55667",
      ticketSizeMin: "₹25 Lakhs",
      ticketSizeMax: "₹30 Crores",
      bio: "Leading government-backed startup initiatives, CGTMSE coverage, and customized term loans.",
      isVerified: true,
      onlineStatus: true,
    },
  },
  {
    name: "Pooja Varma",
    email: "pooja.v@kotak.com",
    password: "password123",
    role: "banker",
    bankerProfile: {
      bankName: "Kotak Mahindra Bank",
      designation: "Senior Relationship Director - Structured Debt",
      department: "Corporate Banking & Syndication",
      city: "Hyderabad",
      phone: "+91 99887 77889",
      ticketSizeMin: "₹2 Crores",
      ticketSizeMax: "₹100 Crores",
      bio: "Structuring tailored mezzanine debt, bridge loans, and co-lending syndicates across India.",
      isVerified: true,
      onlineStatus: true,
    },
  },
];

async function seed() {
  console.log("Connecting to MongoDB:", MONGODB_URI.substring(0, 30) + "...");
  await mongoose.connect(MONGODB_URI);

  for (const b of sampleBankers) {
    const existing = await User.findOne({ email: b.email });
    const hashedPassword = await bcrypt.hash(b.password, 12);
    if (!existing) {
      await User.create({
        ...b,
        password: hashedPassword,
      });
      console.log(`✅ Created banker: ${b.name} (${b.bankerProfile.bankName})`);
    } else {
      existing.bankerProfile = b.bankerProfile;
      existing.role = "banker";
      await existing.save();
      console.log(`ℹ️ Updated banker: ${b.name} (${b.bankerProfile.bankName})`);
    }
  }

  console.log("\n✨ Seeding completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
