const express = require('express');
const path = require('path');

console.log("APP FILE LOADED");
console.log("Current __dirname:", __dirname);

const app = express();

app.use(express.json());

// Calculate paths
const publicPath = path.join(__dirname, '../public');
const indexPath = path.join(__dirname, '../index.html');

console.log("Public path:", publicPath);
console.log("Index path:", indexPath);

// serve root index.html for home page - BEFORE everything else
app.get('/', (req, res) => {
  console.log('GET / route hit');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Error loading home page');
    }
  });
});

// serve static files from public directory
app.use(express.static(publicPath));

// API routes
const diseaseRoutes = require('./routes/diseaseRoutes');
app.use('/api', diseaseRoutes);

module.exports = app;