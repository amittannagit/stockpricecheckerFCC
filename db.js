const { MongoClient } = require('mongodb');

let db;

async function connectDB() {
  try {
    const client = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log('Successfully connected to MongoDB');
    db = client.db('stockPriceDB'); // Use or create a database named 'stockPriceDB'
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

function getDB() {
  return db;
}

module.exports = { connectDB, getDB };
