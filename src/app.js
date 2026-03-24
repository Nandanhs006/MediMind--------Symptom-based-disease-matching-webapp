const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const diseaseRoutes = require('./routes/diseaseRoutes');
app.use('/api', diseaseRoutes);

module.exports = app;