const pool = require('../config/db');

const predictDisease = async (req, res) => {
  const { symptoms } = req.body;

  if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
    return res.status(400).json({
      error: 'Please provide a valid symptoms array',
    });
  }

  try {
    const query = `
      SELECT 
        d.id,
        d.name,
        COUNT(ds.symptom_id) FILTER (WHERE s.name = ANY($1)) * 100.0 
        / COUNT(ds.symptom_id) AS match_percentage
      FROM diseases d
      JOIN disease_symptoms ds ON d.id = ds.disease_id
      JOIN symptoms s ON s.id = ds.symptom_id
      GROUP BY d.id, d.name
      ORDER BY match_percentage DESC;
    `;

    const result = await pool.query(query, [symptoms]);

    // Process and score matched diseases
    const matchedDiseases = result.rows
      .filter(disease => disease.match_percentage > 30)
      .map(disease => ({
        id: disease.id,
        name: disease.name,
        match: parseFloat(disease.match_percentage).toFixed(2),
        isTopMatch: false
      }));

    if (matchedDiseases.length === 0) {
      return res.status(404).json({
        message: 'No matching diseases found. Please try different symptoms or consult a healthcare provider.',
      });
    }

    // Mark the top result as primary match
    matchedDiseases[0].isTopMatch = true;

    res.json(matchedDiseases);

  } catch (err) {
    console.error('Disease prediction error:', err.message);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};

module.exports = { predictDisease };