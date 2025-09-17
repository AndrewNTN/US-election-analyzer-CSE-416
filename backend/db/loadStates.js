// AI Assisted Generation

require('dotenv').config();
const fs = require('fs');
const { MongoClient } = require('mongodb');

(async () => {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME || "cse416");
    const states = db.collection("states");

    const data = JSON.parse(fs.readFileSync("backend/db/seed.states.json", "utf8"));
    await states.deleteMany({ usps: { $in: ["CA","OR","FL"] } });
    await states.insertMany(data);
    await states.createIndex({ usps: 1 }, { unique: true });

    console.log("✅ seeded states:", await states.countDocuments({ usps: { $in: ["CA","OR","FL"] } }));
  } finally {
    await client.close();
  }
})();
