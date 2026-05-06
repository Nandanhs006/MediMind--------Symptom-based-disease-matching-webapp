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

<<<<<<< HEAD
    const matchedDiseases = result.rows
      .filter(disease => disease.match_percentage > 30)
      .map(disease => ({
        id: disease.id,
        name: disease.name,
        match: parseFloat(disease.match_percentage).toFixed(2)
      }));

    if (matchedDiseases.length === 0) {
      return res.status(404).json({
        message: 'No matching diseases found',
      });
=======
    // Enhanced scoring with multiple metrics
    const scoredDiseases = result.rows.map(row => {
      const { id, name, total_disease_symptoms, matched_symptoms } = row;
      
      // Calculate different scoring metrics
      const matchRatio = matched_symptoms / total_disease_symptoms; // % of disease symptoms matched
      const completenessRatio = matched_symptoms / normalizedSymptoms.length; // % of user symptoms matched
      
      // Weighted score considering both metrics
      const baseScore = (matchRatio * 0.6 + completenessRatio * 0.4) * 100;
      
      // Bonus for multiple matching symptoms (stronger indicator)
      const symptomBonus = matched_symptoms >= 3 ? 5 : matched_symptoms >= 2 ? 2 : 0;
      
      // Final confidence score
      const confidence = Math.min(100, baseScore + symptomBonus);
      
      return {
        id,
        name,
        confidence: parseFloat(confidence).toFixed(2),
        matched_count: matched_symptoms,
        total_symptoms: total_disease_symptoms,
        severity: calculateSeverity(confidence)
      };
    });

    // Filter by minimum threshold and sort
    const sortedDiseases = scoredDiseases
      .sort((a, b) => parseFloat(b.confidence) - parseFloat(a.confidence));
    
    // More strict filtering - only show diseases with decent match
    const matchedDiseases = sortedDiseases
      .filter(disease => disease.confidence >= 40)
      .slice(0, 6); // Return top 6 matches max

    if (matchedDiseases.length === 0) {
      // If no strong matches, show the best match with lower threshold
      const anyMatch = sortedDiseases
        .filter(disease => disease.confidence >= 25)
        .slice(0, 3);
      
      if (anyMatch.length === 0) {
        return res.status(404).json({
          message: 'No matching diseases found. Please try different symptoms or consult a healthcare provider.',
        });
      }

      // Mark the top result
      anyMatch[0].isTopMatch = true;
      return res.json(anyMatch);
>>>>>>> parent of f626f5e (Revert "Enhance results display with prominent top match")
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