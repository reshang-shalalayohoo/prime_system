const ReferenceValueModel = require('../models/referenceValue.model');

/**
 * PRIME Nutrient Assessment Engine
 * Implements SSNM/NOPT-based classification of soil nutrient levels.
 * 
 * For each nutrient (N, P, K), the reading is compared against
 * configured reference thresholds for the given growth stage:
 *   - Below min_sufficient → "Deficient"
 *   - Between min_sufficient and max_sufficient → "Sufficient"
 *   - Above max_sufficient → "Excess"
 * 
 * A fertilizer recommendation is generated based on the combined
 * nutrient status classification.
 */

function classifyNutrient(value, minSufficient, maxSufficient) {
  if (value < minSufficient) return 'Deficient';
  if (value > maxSufficient) return 'Excess';
  return 'Sufficient';
}

function validateReading(reading) {
  const errors = [];
  
  if (reading.soil_moisture < 0 || reading.soil_moisture > 100) {
    errors.push(`Soil moisture ${reading.soil_moisture}% is out of valid range (0-100%)`);
  }
  if (reading.water_level < 0 || reading.water_level > 100) {
    errors.push(`Water level ${reading.water_level}% is out of valid range (0-100%)`);
  }
  if (reading.nitrogen < 0 || reading.nitrogen > 200) {
    errors.push(`Nitrogen ${reading.nitrogen} mg/kg is out of valid range (0-200)`);
  }
  if (reading.phosphorus < 0 || reading.phosphorus > 200) {
    errors.push(`Phosphorus ${reading.phosphorus} mg/kg is out of valid range (0-200)`);
  }
  if (reading.potassium < 0 || reading.potassium > 200) {
    errors.push(`Potassium ${reading.potassium} mg/kg is out of valid range (0-200)`);
  }
  
  return { isValid: errors.length === 0, errors };
}

function generateFertilizerRecommendation(nStatus, pStatus, kStatus) {
  const deficients = [];
  const excesses = [];
  
  if (nStatus === 'Deficient') deficients.push('nitrogen');
  if (pStatus === 'Deficient') deficients.push('phosphorus');
  if (kStatus === 'Deficient') deficients.push('potassium');
  
  if (nStatus === 'Excess') excesses.push('nitrogen');
  if (pStatus === 'Excess') excesses.push('phosphorus');
  if (kStatus === 'Excess') excesses.push('potassium');

  // All sufficient
  if (deficients.length === 0 && excesses.length === 0) {
    return {
      fertilizerType: 'None Required',
      applicationRate: '0 kg/ha',
      recommendationText: 'All nutrient levels (N, P, K) are within the sufficient range. No additional fertilizer application is needed at this time. Continue regular monitoring to maintain optimal nutrient levels.'
    };
  }

  let fertilizerType = '';
  let applicationRate = '';
  const textParts = [];

  // Handle deficiencies
  if (deficients.length === 3) {
    fertilizerType = 'Complete (14-14-14)';
    applicationRate = '100 kg/ha';
    textParts.push('All three nutrients are deficient. Apply Complete fertilizer (14-14-14) at 100 kg/ha to address nitrogen, phosphorus, and potassium deficiencies simultaneously.');
  } else if (deficients.length === 2) {
    if (deficients.includes('nitrogen') && deficients.includes('phosphorus')) {
      fertilizerType = 'Ammonium Phosphate (16-20-0)';
      applicationRate = '75 kg/ha';
      textParts.push('Apply Ammonium Phosphate (16-20-0) at 75 kg/ha to correct nitrogen and phosphorus deficiencies.');
    } else if (deficients.includes('nitrogen') && deficients.includes('potassium')) {
      fertilizerType = 'Complete (14-14-14)';
      applicationRate = '75 kg/ha';
      textParts.push('Apply Complete fertilizer (14-14-14) at 75 kg/ha to address nitrogen and potassium deficiencies.');
    } else {
      fertilizerType = 'Complete (14-14-14)';
      applicationRate = '75 kg/ha';
      textParts.push('Apply Complete fertilizer (14-14-14) at 75 kg/ha to address phosphorus and potassium deficiencies.');
    }
  } else if (deficients.length === 1) {
    if (deficients[0] === 'nitrogen') {
      fertilizerType = 'Urea (46-0-0)';
      applicationRate = '50 kg/ha';
      textParts.push('Nitrogen is deficient. Apply Urea (46-0-0) at 50 kg/ha to correct the nitrogen deficiency and support crop growth.');
    } else if (deficients[0] === 'phosphorus') {
      fertilizerType = 'Solophos (0-18-0)';
      applicationRate = '40 kg/ha';
      textParts.push('Phosphorus is deficient. Apply Solophos (0-18-0) at 40 kg/ha to correct the phosphorus deficiency and promote root development.');
    } else {
      fertilizerType = 'Muriate of Potash (0-0-60)';
      applicationRate = '35 kg/ha';
      textParts.push('Potassium is deficient. Apply Muriate of Potash (0-0-60) at 35 kg/ha to correct the potassium deficiency and strengthen crop resistance.');
    }
  }

  // Handle excesses
  if (excesses.length > 0) {
    const excessNames = excesses.map(n => n.charAt(0).toUpperCase() + n.slice(1));
    textParts.push(`${excessNames.join(' and ')} level(s) exceed the optimal range. Reduce or suspend ${excessNames.join(' and ').toLowerCase()} application to avoid nutrient toxicity.`);
    
    if (deficients.length === 0) {
      fertilizerType = 'Reduce Application';
      applicationRate = 'Decrease current rates';
    }
  }

  return {
    fertilizerType,
    applicationRate,
    recommendationText: textParts.join(' ')
  };
}

async function assessNutrients(reading, growthStage) {
  // Get reference values for the growth stage
  const nRef = await ReferenceValueModel.getByNutrientAndStage('nitrogen', growthStage);
  const pRef = await ReferenceValueModel.getByNutrientAndStage('phosphorus', growthStage);
  const kRef = await ReferenceValueModel.getByNutrientAndStage('potassium', growthStage);

  if (!nRef || !pRef || !kRef) {
    // Fallback defaults if reference values are not configured
    const defaults = {
      nitrogen: { min: 30, max: 60 },
      phosphorus: { min: 15, max: 35 },
      potassium: { min: 20, max: 45 }
    };

    const nStatus = classifyNutrient(reading.nitrogen, defaults.nitrogen.min, defaults.nitrogen.max);
    const pStatus = classifyNutrient(reading.phosphorus, defaults.phosphorus.min, defaults.phosphorus.max);
    const kStatus = classifyNutrient(reading.potassium, defaults.potassium.min, defaults.potassium.max);

    const rec = generateFertilizerRecommendation(nStatus, pStatus, kStatus);

    return {
      nStatus,
      pStatus,
      kStatus,
      ...rec,
      usedDefaults: true
    };
  }

  const nStatus = classifyNutrient(reading.nitrogen, nRef.min_sufficient, nRef.max_sufficient);
  const pStatus = classifyNutrient(reading.phosphorus, pRef.min_sufficient, pRef.max_sufficient);
  const kStatus = classifyNutrient(reading.potassium, kRef.min_sufficient, kRef.max_sufficient);

  const rec = generateFertilizerRecommendation(nStatus, pStatus, kStatus);

  return {
    nStatus,
    pStatus,
    kStatus,
    ...rec,
    usedDefaults: false
  };
}

module.exports = { assessNutrients, validateReading, classifyNutrient };
