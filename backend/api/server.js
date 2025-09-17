// AI Assisted Generation

require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "cse416";

app.get('/api/health', async (_req, res) => {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    await client.db(dbName).command({ ping: 1 });
    await client.close();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.get('/api/states', async (_req, res) => {
  const client = new MongoClient(uri);
  await client.connect();
  const rows = await client.db(dbName).collection('states')
    .find({}, { projection: { _id: 0 } }).sort({ usps: 1 }).toArray();
  await client.close();
  res.json(rows);
});

app.listen(3001, () => console.log('API on :3001'));

// --- stub: next GUI contract ---
// returns minimal shape the GUI can use now; replace later with real aggregates
app.get('/api/states/:usps/summary', async (req, res) => {
  const { usps } = req.params;
  // just echo some placeholder numbers so charts can render
  const provisional = { e1a_total_cast: 1234, e2a: 100, e2b: 200, e2c: 150, e2d: 80, e2e: 60, e2f: 40, e2g: 30, e2h: 20, e2i: 10, e2_other: 5 };
  const registration = { active: 900000, inactive: 100000, registered_total: 1000000 };
  res.json({ usps, year: 2024, provisional, registration });
});
