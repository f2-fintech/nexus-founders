const mongoose = require("mongoose");
const dns = require("node:dns");

try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch (e) {}

const localUri = "mongodb://127.0.0.1:27017/nexus-founders";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    day: { type: String, required: true },
    month: { type: String, required: true },
    eventDate: { type: Date, required: true },
    desc: { type: String, required: true },
    address: { type: String, required: true },
    btnText: { type: String, default: "See More" },
    registrationLink: { type: String, default: "/events/register" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "upcomingevents" }
);

async function run() {
  console.log("Checking local database for events...");
  let localEvents = [];
  try {
    const localConn = await mongoose.createConnection(localUri).asPromise();
    const LocalEvent = localConn.model("UpcomingEvent", eventSchema);
    localEvents = await LocalEvent.find({}).lean();
    console.log(`Found ${localEvents.length} events in local database.`);
    await localConn.close();
  } catch (err) {
    console.log("Could not read local database (or local mongo is not running):", err.message);
  }

  // Fallback initial sample events if local has none
  const defaultEvents = [
    {
      title: "Founders Connect 2025",
      day: "25",
      month: "JAN",
      eventDate: new Date("2025-01-25T10:00:00Z"),
      desc: "An exclusive networking event connecting fintech founders, innovators, and investors to discuss the future of digital finance and emerging tech ecosystems.",
      address: "Innov8 Coworking, Connaught Place, New Delhi",
      btnText: "See More",
      registrationLink: "/events/register",
      isActive: true,
      order: 1
    },
    {
      title: "Venture Summit & Pitch Fest",
      day: "14",
      month: "FEB",
      eventDate: new Date("2025-02-14T11:00:00Z"),
      desc: "Pitch to leading angels and VC funds, gain mentorship from industry leaders, and accelerate your startup journey with seed funding opportunities.",
      address: "Cyber City Hub, DLF Phase 2, Gurugram",
      btnText: "See More",
      registrationLink: "/events/register",
      isActive: true,
      order: 2
    },
    {
      title: "AI & Web3 Founders Roundtable",
      day: "08",
      month: "MAR",
      eventDate: new Date("2025-03-08T14:00:00Z"),
      desc: "Deep dive into real-world AI applications, next-gen fintech automation, and smart contract integrations with top engineers and startup founders.",
      address: "WeWork Forum, Cyber City, Gurugram",
      btnText: "See More",
      registrationLink: "/events/register",
      isActive: true,
      order: 3
    }
  ];

  const eventsToSave = localEvents.length > 0 ? localEvents : defaultEvents;

  console.log(`Connecting to Live MongoDB Atlas...`);
  const liveConn = await mongoose.createConnection(liveUri).asPromise();
  const LiveEvent = liveConn.model("UpcomingEvent", eventSchema);

  const existingCount = await LiveEvent.countDocuments();
  console.log(`Current events count in live database: ${existingCount}`);

  if (existingCount === 0) {
    console.log(`Saving ${eventsToSave.length} events to live upcomingevents collection...`);
    const sanitized = eventsToSave.map(({ _id, __v, createdAt, updatedAt, ...rest }) => rest);
    await LiveEvent.insertMany(sanitized);
    console.log("Successfully created and saved upcomingevents in live database!");
  } else {
    console.log("Collection already exists in live database with events.");
  }

  const liveList = await LiveEvent.find({}).lean();
  console.log("\nLive Database Events:");
  liveList.forEach(ev => console.log(` - [${ev.day} ${ev.month}] ${ev.title} (Venue: ${ev.address})`));

  await liveConn.close();
  console.log("\nDone!");
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
