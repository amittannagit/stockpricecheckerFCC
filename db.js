const { MongoClient } = require('mongodb'); // Import MongoClient from the MongoDB library

let db; // Variable to hold the database connection

// Function to connect to MongoDB
async function connectDB() {
  try {
    // Create a new MongoClient instance with connection options
    const client = new MongoClient(process.env.MONGO_URI, { 
      useNewUrlParser: true, // Use the new URL parser for MongoDB connection strings
      useUnifiedTopology: true // Use the new connection management engine
    });
    
    // Connect to the MongoDB server
    await client.connect();
    console.log('Successfully connected to MongoDB');

    // Set the database to use or create a new database named 'stockPriceDB'
    db = client.db('stockPriceDB'); 
  } catch (error) {
    // Log error if the connection fails
    console.error('Error connecting to MongoDB:', error);
  }
}

// Function to get the connected database instance
function getDB() {
  return db; // Return the database instance
}

// Export the connectDB and getDB functions for use in other files
module.exports = { connectDB, getDB };
