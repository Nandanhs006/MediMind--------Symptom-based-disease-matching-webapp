const express = require('express');
const path = require('path');

console.log("APP FILE LOADED");

const app = express();

app.use(express.json());

// serve root index.html for home page - BEFORE everything else
app.get('/', (req, res) => {
  console.log('GET / route hit');
  res.sendFile(path.resolve(__dirname, '../index.html'));
});

// serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API routes
const diseaseRoutes = require('./routes/diseaseRoutes');
app.use('/api', diseaseRoutes);

module.exports = app;