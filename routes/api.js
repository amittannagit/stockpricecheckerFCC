'use strict';

const axios = require('axios'); // Import axios for making HTTP requests
const { getDB } = require('../db'); // Import the getDB function to access your MongoDB instance

// Define the API routes for stock price checking
module.exports = function (app) {
  // Route for fetching stock prices
  app.route('/api/stock-prices').get(async function (req, res) {
    try {
      // Extract the stock symbol and like parameter from the query
      const stockSymbol = req.query.stock;
      const like = req.query.like === 'true'; // Convert "like" query parameter to boolean

      // Validate if a stock symbol was provided
      if (!stockSymbol) {
        return res.status(400).json({ error: 'Missing stock symbol' }); // Send error response if missing
      }

      // Handle the case where stock symbols are provided as an array (for comparison)
      const stockSymbols = Array.isArray(stockSymbol) ? stockSymbol : [stockSymbol];

      // Get the MongoDB database instance
      const db = getDB(); 

      // Fetch stock data for each symbol and store the results
      const stockDataPromises = stockSymbols.map(async (symbol) => {
        try {
          // Fetch the stock price from the external API
          const response = await axios.get(
            `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`
          );

          // Prepare the stock data object
          const stockData = {
            stock: symbol,
            price: response.data.latestPrice, // Extract the latest price from the response
            likes: 0, // Initialize likes; this will be updated if the "like" parameter is true
          };

          // If the "like" parameter is true, update the likes in MongoDB
          if (like) {
            const ip = req.ip; // Get the user's IP address

            // Update the likes array in MongoDB, adding the IP if not already present
            await db.collection('stock').findOneAndUpdate(
              { stock: symbol },
              { $addToSet: { likes: ip } }, // Use $addToSet to ensure unique likes
              { upsert: true, returnDocument: 'after' } // Create a new document if none exists
            );

            // Fetch the updated stock data to include the like count
            const updatedStockData = await db.collection('stock').findOne({ stock: symbol });
            stockData.likes = updatedStockData.likes.length; // Update likes with the count from the database
          }

          return stockData; // Return the stock data to the caller
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error);
          return null; // Return null in case of error
        }
      });

      // Wait for all stock data promises to resolve
      const stockDataResults = await Promise.all(stockDataPromises);
      const filteredStockData = stockDataResults.filter((data) => data !== null); // Filter out any null results

      // Check if two stocks are passed for comparison
      if (filteredStockData.length === 2) {
        // Calculate relative likes between the two stocks
        const relLikes = filteredStockData[0].likes - filteredStockData[1].likes;

        // Return the stock data along with relative likes
        return res.json({
          stockData: [
            { ...filteredStockData[0], rel_likes: relLikes },
            { ...filteredStockData[1], rel_likes: -relLikes },
          ],
        });
      }

      // If only one stock is requested, return the stock data directly
      res.json({ stockData: filteredStockData[0] });
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({ error: 'An error occurred while processing the request.' }); // Send error response if an exception occurs
    }
  });
};
