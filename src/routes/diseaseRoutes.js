const express = require('express');
const router = express.Router();

const { predictDisease } = require('../controllers/diseaseController');
const pool = require('../config/db');

router.post('/predict', predictDisease);

router.get('/symptoms', async (req, res) => {
  const searchQuery = req.query.q;

  if (!searchQuery || searchQuery.trim() === '') {
    return res.json([]);
  }

  try {
    const result = await pool.query(
      `SELECT name 
       FROM symptoms 
       WHERE name ILIKE $1 
       ORDER BY name 
       LIMIT 10`,
      [`%${searchQuery}%`]
    );

    res.json(result.rows.map(row => row.name));
  } catch (err) {
    console.error('Symptom search error:', err.message);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

module.exports = router;