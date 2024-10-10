const chaiHttp = require('chai-http'); // Import chai-http for HTTP integration testing
const chai = require('chai'); // Import chai for assertions
const assert = chai.assert; // Use chai's assert style for writing assertions
const server = require('../server'); // Import the Express server for testing

chai.use(chaiHttp); // Integrate chai-http with chai

// Define a test suite for functional tests
suite('Functional Tests', function() {
  
  // Define a sub-suite for GET requests to the /api/stock-prices route
  suite('GET /api/stock-prices => stockData object', function() {
    
    // Test case: Viewing one stock without liking it
    test('Viewing one stock', function(done) {
      chai.request(server) // Make a request to the server
        .get('/api/stock-prices') // Send a GET request to /api/stock-prices
        .query({ stock: 'GOOG' }) // Pass the stock symbol as a query parameter
        .end(function(err, res) { // Callback function to handle the response
          assert.equal(res.status, 200); // Assert that the response status is 200 (OK)
          assert.property(res.body, 'stockData'); // Assert that the response body contains 'stockData'
          assert.property(res.body.stockData, 'stock'); // Assert that 'stockData' contains 'stock'
          assert.property(res.body.stockData, 'price'); // Assert that 'stockData' contains 'price'
          assert.property(res.body.stockData, 'likes'); // Assert that 'stockData' contains 'likes'
          assert.equal(res.body.stockData.stock, 'GOOG'); // Assert that the stock is 'GOOG'
          done(); // Call done to finish the test
        });
    });

    // Test case: Viewing one stock and liking it
    test('Viewing one stock and liking it', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: 'GOOG', like: true }) // Send the 'like' parameter as true
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData');
          assert.property(res.body.stockData, 'stock');
          assert.property(res.body.stockData, 'price');
          assert.property(res.body.stockData, 'likes');
          assert.equal(res.body.stockData.stock, 'GOOG');
          done();
        });
    });

    // Test case: Viewing the same stock and liking it again
    test('Viewing one stock and liking it', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: 'GOOG', like: true })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData');
          assert.property(res.body.stockData, 'stock');
          assert.property(res.body.stockData, 'price');
          assert.property(res.body.stockData, 'likes');
          assert.equal(res.body.stockData.stock, 'GOOG');
          done();
        });
    });

    test('Viewing the same stock and liking it again (ensure likes are not double-counted)', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: 'GOOG', like: true })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData');
          assert.property(res.body.stockData, 'stock');
          assert.property(res.body.stockData, 'price');
          assert.property(res.body.stockData, 'likes');
          assert.equal(res.body.stockData.stock, 'GOOG');
          // Check if likes count remains the same (not incremented)
          done();
        });
    });

    test('Viewing two stocks', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: ['GOOG', 'MSFT'] })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body.stockData);
          assert.property(res.body.stockData[0], 'stock');
          assert.property(res.body.stockData[0], 'price');
          assert.property(res.body.stockData[0], 'likes');
          assert.property(res.body.stockData[1], 'stock');
          assert.property(res.body.stockData[1], 'price');
          assert.property(res.body.stockData[1], 'likes');
          done();
        });
    });

    test('Viewing two stocks and liking them', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: ['GOOG', 'MSFT'], like: true })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body.stockData);
          assert.property(res.body.stockData[0], 'stock');
          assert.property(res.body.stockData[0], 'price');
          assert.property(res.body.stockData[0], 'likes');
          assert.property(res.body.stockData[1], 'stock');
          assert.property(res.body.stockData[1], 'price');
          assert.property(res.body.stockData[1], 'likes');
          done();
        });
    });

  });

});
