const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());

const publicPath = path.join(__dirname, '../public');
const homePage = path.join(__dirname, '../index.html');

app.get('/', (req, res) => {
  res.sendFile(homePage, (err) => {
    if (err) {
      res.status(500).send('Error loading home page');
    }
  });
});

app.use(express.static(publicPath));

const diseaseRoutes = require('./routes/diseaseRoutes');
app.use('/api', diseaseRoutes);

module.exports = app;