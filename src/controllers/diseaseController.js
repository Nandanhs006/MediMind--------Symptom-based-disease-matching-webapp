const pool = require('../config/db');

// Symptom weights - Critical symptoms get higher weights
const SYMPTOM_WEIGHTS = {
  'fever': 0.25,
  'high fever': 0.30,
  'cough': 0.20,
  'dry cough': 0.25,
  'shortness of breath': 0.28,
  'chest pain': 0.30,
  'loss of smell': 0.35,
  'loss of taste': 0.35,
  'seizures': 0.40,
  'confusion': 0.25,
  'hallucinations': 0.35,
  'chills': 0.22,
  'sweating': 0.20,
  'fatigue': 0.12,
  'headache': 0.15,
  'body pain': 0.18,
  'joint pain': 0.20,
  'rash': 0.22,
  'diarrhea': 0.18,
  'vomiting': 0.20,
};

const predictDisease = async (req, res) => {
  const { symptoms } = req.body;

  if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
    return res.status(400).json({
      error: 'Please provide a valid symptoms array',
    });
  }

  try {
    // Normalize input symptoms to lowercase
    const normalizedSymptoms = symptoms.map(s => s.toLowerCase().trim());

    const query = `
      SELECT 
        d.id,
        d.name,
        COUNT(ds.symptom_id) as total_disease_symptoms,
        COUNT(ds.symptom_id) FILTER (WHERE LOWER(s.name) = ANY($1)) as matched_symptoms
      FROM diseases d
      JOIN disease_symptoms ds ON d.id = ds.disease_id
      JOIN symptoms s ON s.id = ds.symptom_id
      GROUP BY d.id, d.name
      ORDER BY matched_symptoms DESC;
    `;

    const result = await pool.query(query, [normalizedSymptoms]);

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
    const matchedDiseases = scoredDiseases
      .filter(disease => disease.confidence >= 25)
      .sort((a, b) => parseFloat(b.confidence) - parseFloat(a.confidence))
      .slice(0, 10); // Return top 10 matches

    if (matchedDiseases.length === 0) {
      return res.status(404).json({
        message: 'No matching diseases found. Please try different symptoms or consult a healthcare provider.',
      });
    }

    res.json(matchedDiseases);

  } catch (err) {
    console.error('Disease prediction error:', err.message);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};

// Determine confidence level based on score
function calculateSeverity(score) {
  if (score >= 80) return 'VERY HIGH';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MODERATE';
  return 'LOW';
}

module.exports = { predictDisease };