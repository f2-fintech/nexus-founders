const mongoose = require('mongoose');

const LOCAL_URI = 'mongodb://127.0.0.1:27017/nexus-founders';
const LIVE_URI = 'mongodb+srv://f2fintech-hrms:fintechhrmslts@f2fintech-hrms.1exq3rs.mongodb.net/nexus-founders?retryWrites=true&w=majority';

async function migrate() {
  console.log('--- Starting Migration from Local to Live Atlas ---');
  
  const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  console.log('Connected to Local DB');
  
  const liveConn = await mongoose.createConnection(LIVE_URI).asPromise();
  console.log('Connected to Live Atlas DB');

  const collections = await localConn.db.listCollections().toArray();
  console.log(`Found ${collections.length} collections locally.`);

  for (const colInfo of collections) {
    const colName = colInfo.name;
    if (colName.startsWith('system.')) continue;

    console.log(`\nMigrating collection: [${colName}]...`);
    const localCollection = localConn.db.collection(colName);
    const liveCollection = liveConn.db.collection(colName);

    const count = await localCollection.countDocuments();
    console.log(`  Local document count: ${count}`);

    if (count > 0) {
      const docs = await localCollection.find({}).toArray();
      
      // Clear live collection if exists to avoid duplicates
      await liveCollection.deleteMany({});
      
      // Insert all documents
      const insertResult = await liveCollection.insertMany(docs);
      console.log(`  Successfully inserted ${insertResult.insertedCount} documents into live DB.`);
    } else {
      console.log(`  Collection is empty, ensuring collection exists.`);
      await liveConn.db.createCollection(colName).catch(() => {});
    }

    // Copy indexes (except _id index)
    try {
      const indexes = await localCollection.indexes();
      for (const idx of indexes) {
        if (idx.name === '_id_') continue;
        const key = idx.key;
        const options = { ...idx };
        delete options.key;
        delete options.v;
        delete options.ns;
        await liveCollection.createIndex(key, options);
        console.log(`  Created index: ${idx.name}`);
      }
    } catch (idxErr) {
      console.warn(`  Warning copying indexes for ${colName}:`, idxErr.message);
    }
  }

  console.log('\n--- Migration Complete ---');
  
  // Verify live counts
  console.log('\nVerifying Live Database Counts:');
  const liveCols = await liveConn.db.listCollections().toArray();
  for (const c of liveCols) {
    const liveCount = await liveConn.db.collection(c.name).countDocuments();
    console.log(` - ${c.name}: ${liveCount} docs`);
  }

  await localConn.close();
  await liveConn.close();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
