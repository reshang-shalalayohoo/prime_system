const ReferenceValueModel = require('../models/referenceValue.model');

/**
 * Severity Classification Service
 * 
 * Classifies sensor readings against configured SSNM/NOPT reference thresholds.
 * Returns color-coded status: green (sufficient), yellow (moderate), red (critical).
 */

// Standard thresholds for soil moisture and water level (not in reference_values table)
const STANDARD_THRESHOLDS = {
  soil_moisture: { greenMin: 40, greenMax: 80, yellowMin: 25, yellowMax: 90 },
  water_level:   { greenMin: 30, greenMax: 70, yellowMin: 15, yellowMax: 85 }
};

/**
 * Classify a single value against a range.
 * @param {number} value - The sensor reading value
 * @param {number} min - Reference min_sufficient
 * @param {number} max - Reference max_sufficient
 * @returns {{ status: string, color: string, label: string }}
 */
function classifyAgainstRange(value, min, max) {
  if (value === null || value === undefined) {
    return { status: 'unknown', color: 'gray', label: 'No Data' };
  }

  // Calculate buffer zone (20% of the range for yellow zone)
  const buffer = (max - min) * 0.2;
  const yellowLow = min - buffer;
  const yellowHigh = max + buffer;

  if (value >= min && value <= max) {
    return { status: 'sufficient', color: 'green', label: 'Sufficient' };
  } else if (value >= yellowLow && value < min) {
    return { status: 'moderate', color: 'yellow', label: 'Moderate (Low)' };
  } else if (value > max && value <= yellowHigh) {
    return { status: 'moderate', color: 'yellow', label: 'Moderate (High)' };
  } else if (value < yellowLow) {
    return { status: 'critical', color: 'red', label: 'Critical (Deficient)' };
  } else {
    return { status: 'critical', color: 'red', label: 'Critical (Excess)' };
  }
}

/**
 * Classify a standard parameter (soil moisture or water level).
 */
function classifyStandard(value, paramKey) {
  if (value === null || value === undefined) {
    return { status: 'unknown', color: 'gray', label: 'No Data' };
  }

  const t = STANDARD_THRESHOLDS[paramKey];
  if (!t) return { status: 'unknown', color: 'gray', label: 'Unknown' };

  if (value >= t.greenMin && value <= t.greenMax) {
    return { status: 'sufficient', color: 'green', label: 'Normal' };
  } else if ((value >= t.yellowMin && value < t.greenMin) || (value > t.greenMax && value <= t.yellowMax)) {
    return { status: 'moderate', color: 'yellow', label: 'Needs Attention' };
  } else {
    return { status: 'critical', color: 'red', label: value < t.yellowMin ? 'Critical (Low)' : 'Critical (High)' };
  }
}

/**
 * Classify all readings for a device given its field's growth stage.
 * @param {object} reading - Sensor reading with nitrogen, phosphorus, potassium, soil_moisture, water_level
 * @param {string} growthStage - The growth stage of the field (e.g., 'Vegetative')
 * @returns {object} Severity classifications for each parameter
 */
async function classifyReading(reading, growthStage) {
  if (!reading) {
    return {
      nitrogen: { status: 'unknown', color: 'gray', label: 'No Data', value: null },
      phosphorus: { status: 'unknown', color: 'gray', label: 'No Data', value: null },
      potassium: { status: 'unknown', color: 'gray', label: 'No Data', value: null },
      soil_moisture: { status: 'unknown', color: 'gray', label: 'No Data', value: null },
      water_level: { status: 'unknown', color: 'gray', label: 'No Data', value: null },
      overall: 'unknown',
      overallColor: 'gray'
    };
  }

  // Fetch reference values for the growth stage
  const refs = await ReferenceValueModel.getByGrowthStage(growthStage || 'Vegetative');
  const refMap = {};
  refs.forEach(r => { refMap[r.nutrient] = r; });

  // Classify NPK against configured thresholds
  const nRef = refMap['nitrogen'] || { min_sufficient: 25, max_sufficient: 50 };
  const pRef = refMap['phosphorus'] || { min_sufficient: 15, max_sufficient: 30 };
  const kRef = refMap['potassium'] || { min_sufficient: 20, max_sufficient: 45 };

  const classifications = {
    nitrogen: {
      ...classifyAgainstRange(reading.nitrogen, nRef.min_sufficient, nRef.max_sufficient),
      value: reading.nitrogen,
      min: nRef.min_sufficient,
      max: nRef.max_sufficient
    },
    phosphorus: {
      ...classifyAgainstRange(reading.phosphorus, pRef.min_sufficient, pRef.max_sufficient),
      value: reading.phosphorus,
      min: pRef.min_sufficient,
      max: pRef.max_sufficient
    },
    potassium: {
      ...classifyAgainstRange(reading.potassium, kRef.min_sufficient, kRef.max_sufficient),
      value: reading.potassium,
      min: kRef.min_sufficient,
      max: kRef.max_sufficient
    },
    soil_moisture: {
      ...classifyStandard(reading.soil_moisture, 'soil_moisture'),
      value: reading.soil_moisture
    },
    water_level: {
      ...classifyStandard(reading.water_level, 'water_level'),
      value: reading.water_level
    }
  };

  // Overall severity = worst status across all parameters
  const colors = Object.values(classifications).map(c => c.color);
  let overallColor = 'green';
  if (colors.includes('red')) overallColor = 'red';
  else if (colors.includes('yellow')) overallColor = 'yellow';
  else if (colors.includes('gray')) overallColor = 'gray';

  classifications.overall = overallColor === 'green' ? 'sufficient' : overallColor === 'yellow' ? 'moderate' : overallColor === 'red' ? 'critical' : 'unknown';
  classifications.overallColor = overallColor;

  return classifications;
}

module.exports = { classifyReading, classifyAgainstRange, classifyStandard };
