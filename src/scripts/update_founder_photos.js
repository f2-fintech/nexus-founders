const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const files = fs.readdirSync(path.join(__dirname, '../../public/founders'));

const URIS = [
  // Live Atlas
  'mongodb+srv://f2fintech-hrms:fintechhrmslts@f2fintech-hrms.1exq3rs.mongodb.net/nexus-founders?retryWrites=true&w=majority',
  // Local DB
  'mongodb://127.0.0.1:27017/nexus-founders',
];

async function updateDb(uri, label) {
  console.log(`\nConnecting to ${label}...`);
  try {
    const conn = await mongoose.createConnection(uri).asPromise();
    const foundersCol = conn.db.collection('founders');
    const founders = await foundersCol.find({}).sort({ order: 1 }).toArray();

    console.log(`Found ${founders.length} founders in ${label}. Updating photo paths...`);
    let updated = 0;

    for (const f of founders) {
      const prefix = `founder_${f.order}_`;
      const match = files.find(file => file.startsWith(prefix));
      if (match) {
        const localPath = `/founders/${match}`;
        await foundersCol.updateOne(
          { _id: f._id },
          { $set: { photo: localPath } }
        );
        updated++;
      }
    }

    console.log(`Updated ${updated} / ${founders.length} founder photo paths in ${label}!`);
    await conn.close();
  } catch (err) {
    console.error(`Error updating ${label}:`, err.message);
  }
}

async function run() {
  for (const uri of URIS) {
    const label = uri.includes('mongodb+srv') ? 'Live Atlas DB' : 'Local DB';
    await updateDb(uri, label);
  }
  console.log('\nAll databases successfully updated with local webp image paths!');
  process.exit(0);
}

run();
