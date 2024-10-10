'use strict';

require('dotenv').config(); // Load environment variables from .env file
const express = require('express'); // Import Express framework
const bodyParser = require('body-parser'); // Middleware for parsing request bodies
const cors = require('cors'); // Middleware for enabling CORS
const helmet = require('helmet'); // Middleware for setting security headers
const { connectDB } = require('./db'); // Import the connectDB function to establish a connection to MongoDB

const apiRoutes = require('./routes/api.js'); // Import API routes
const fccTestingRoutes = require('./routes/fcctesting.js'); // Import testing routes
const runner = require('./test-runner'); // Import the test runner

const app = express(); // Create an Express application instance

// Serve static files from the /public directory
app.use('/public', express.static(process.cwd() + '/public'));

// Use Helmet for securing HTTP headers with a custom Content Security Policy
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"], // Only allow resources from the same origin
      scriptSrc: ["'self'"], // Only allow scripts from the same origin
      styleSrc: ["'self'"], // Only allow styles from the same origin
      imgSrc: ["'self'"], // Only allow images from the same origin
      connectSrc: ["'self'", 'https://stock-price-checker-proxy.freecodecamp.rocks'], // Allow connections to the stock API
    },
  })
);

// Enable CORS for all origins (for FCC testing purposes only)
app.use(cors({ origin: '*' }));

// Middleware for parsing JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route for the index page (static HTML)
app.route('/').get(function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html'); // Serve the index.html file
});

// Set up FCC testing routes
fccTestingRoutes(app);

// Connect to the database and then start the server
connectDB()
  .then(() => {
    // Set up API routes after successfully connecting to the database
    apiRoutes(app);

    // 404 Not Found Middleware
    app.use(function (req, res, next) {
      res.status(404).type('text').send('Not Found'); // Handle 404 errors
    });

    // Start the server and run tests if in test mode
    const listener = app.listen(process.env.PORT || 3000, function () {
      console.log('Your app is listening on port ' + listener.address().port);
      if (process.env.NODE_ENV === 'test') {
        console.log('Running Tests...');
        setTimeout(function () {
          try {
            runner.run(); // Run the test suite
          } catch (e) {
            console.log('Tests are not valid:');
            console.error(e);
          }
        }, 3500); // Delay to allow the server to start
      }
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err); // Log error if database connection fails
  });

module.exports = app; // Export the app for testing
