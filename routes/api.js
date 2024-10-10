'use strict';
const axios = require('axios');

module.exports = function (app) {
  app.route('/api/stock-prices').get(async function (req, res) {
    try {
      const stockSymbol = req.query.stock;
      const like = req.query.like === 'true'; // Capture the "like" query parameter

      if (!stockSymbol) {
        return res.status(400).json({ error: 'Missing stock symbol' });
      }

      // Handle if the stock query parameter is an array (for comparing two stocks)
      const stockSymbols = Array.isArray(stockSymbol) ? stockSymbol : [stockSymbol];

      // Fetch data for each stock symbol and store the results
      const stockDataPromises = stockSymbols.map(async (symbol) => {
        try {
          const response = await axios.get(
            `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`
          );

          return {
            stock: symbol,
            price: response.data.latestPrice,
            likes: 0, // Implement your logic for handling likes if required
          };
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error);
          return null;
        }
      });

      const stockDataResults = await Promise.all(stockDataPromises);
      const filteredStockData = stockDataResults.filter((data) => data !== null);

      // Check if two stocks are passed for comparison
      if (filteredStockData.length === 2) {
        const relLikes = filteredStockData[0].likes - filteredStockData[1].likes;

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
      res.status(500).json({ error: 'An error occurred while processing the request.' });
    }
  });
};
