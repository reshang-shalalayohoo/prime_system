const SensorReadingModel = require('../models/sensorReading.model');
const RecommendationModel = require('../models/recommendation.model');
const FieldModel = require('../models/field.model');
const { assessNutrients, validateReading } = require('./nutrientAssessment.service');
const AlertService = require('./alert.service');
const { getIO } = require('./socket.service');

/**
 * Recommendation Service
 * Orchestrates the full sensor-ingestion pipeline:
 * 1. Validate the raw sensor reading
 * 2. Save the reading to the database
 * 3. Run the SSNM/NOPT nutrient assessment
 * 4. Save the recommendation
 * 5. Generate alerts for deficiencies/excesses
 * 6. Broadcast results via Socket.io
 */

async function processSensorReading(device, rawData) {
  const { soil_moisture, water_level, nitrogen, phosphorus, potassium } = rawData;
  
  // Get the field associated with this device
  const field = await FieldModel.findById(device.field_id);
  if (!field) {
    throw Object.assign(new Error('Device is not assigned to a field'), { statusCode: 400 });
  }

  const readingData = {
    soil_moisture: parseFloat(soil_moisture),
    water_level: parseFloat(water_level),
    nitrogen: parseFloat(nitrogen),
    phosphorus: parseFloat(phosphorus),
    potassium: parseFloat(potassium)
  };

  // Step 1: Validate
  const validation = validateReading(readingData);
  
  // Step 2: Save sensor reading
  const sensorReading = await SensorReadingModel.create({
    deviceId: device.id,
    fieldId: field.id,
    soilMoisture: readingData.soil_moisture,
    waterLevel: readingData.water_level,
    nitrogen: readingData.nitrogen,
    phosphorus: readingData.phosphorus,
    potassium: readingData.potassium,
    isValid: validation.isValid,
    rawData: JSON.stringify(rawData)
  });

  // If invalid, create alerts and return
  if (!validation.isValid) {
    for (const error of validation.errors) {
      await AlertService.createAlert({
        fieldId: field.id,
        userId: field.user_id,
        type: 'invalid_reading',
        message: `Invalid sensor reading from ${device.device_code}: ${error}`,
        severity: 'warning'
      });
    }

    // Still broadcast the reading even if invalid
    broadcastUpdate('new-sensor-reading', { reading: sensorReading, field, device: { id: device.id, device_code: device.device_code } });

    return { reading: sensorReading, recommendation: null, isValid: false, validationErrors: validation.errors };
  }

  // Step 3: Nutrient assessment
  const assessment = await assessNutrients(readingData, field.growth_stage);

  // Step 4: Save recommendation
  const recommendation = await RecommendationModel.create({
    sensorReadingId: sensorReading.id,
    fieldId: field.id,
    nStatus: assessment.nStatus,
    pStatus: assessment.pStatus,
    kStatus: assessment.kStatus,
    fertilizerType: assessment.fertilizerType,
    applicationRate: assessment.applicationRate,
    recommendationText: assessment.recommendationText
  });

  // Step 5: Generate alerts for deficiencies and excesses
  const alertMessages = [];
  if (assessment.nStatus === 'Deficient') {
    alertMessages.push({
      type: 'nutrient_deficiency',
      message: `Nitrogen level (${readingData.nitrogen} mg/kg) is below the sufficient range for ${field.growth_stage} stage. ${assessment.fertilizerType !== 'None Required' ? 'Consider applying ' + assessment.fertilizerType + '.' : ''}`,
      severity: 'warning'
    });
  }
  if (assessment.pStatus === 'Deficient') {
    alertMessages.push({
      type: 'nutrient_deficiency',
      message: `Phosphorus level (${readingData.phosphorus} mg/kg) is below the sufficient range for ${field.growth_stage} stage. Consider corrective fertilizer application.`,
      severity: 'warning'
    });
  }
  if (assessment.kStatus === 'Deficient') {
    alertMessages.push({
      type: 'nutrient_deficiency',
      message: `Potassium level (${readingData.potassium} mg/kg) is below the sufficient range for ${field.growth_stage} stage. Consider corrective fertilizer application.`,
      severity: 'warning'
    });
  }
  if (assessment.nStatus === 'Excess') {
    alertMessages.push({
      type: 'nutrient_excess',
      message: `Nitrogen level (${readingData.nitrogen} mg/kg) exceeds the sufficient range for ${field.growth_stage} stage. Reduce nitrogen application.`,
      severity: 'warning'
    });
  }
  if (assessment.pStatus === 'Excess') {
    alertMessages.push({
      type: 'nutrient_excess',
      message: `Phosphorus level (${readingData.phosphorus} mg/kg) exceeds the sufficient range for ${field.growth_stage} stage. Reduce phosphorus application.`,
      severity: 'warning'
    });
  }
  if (assessment.kStatus === 'Excess') {
    alertMessages.push({
      type: 'nutrient_excess',
      message: `Potassium level (${readingData.potassium} mg/kg) exceeds the sufficient range for ${field.growth_stage} stage. Reduce potassium application.`,
      severity: 'warning'
    });
  }

  for (const alert of alertMessages) {
    const createdAlert = await AlertService.createAlert({
      fieldId: field.id,
      userId: field.user_id,
      ...alert
    });
    broadcastUpdate('new-alert', createdAlert);
  }

  // Step 6: Broadcast via Socket.io
  broadcastUpdate('new-sensor-reading', {
    reading: sensorReading,
    field,
    device: { id: device.id, device_code: device.device_code }
  });

  broadcastUpdate('new-recommendation', {
    recommendation,
    reading: sensorReading,
    field
  });

  return { reading: sensorReading, recommendation, isValid: true };
}

function broadcastUpdate(event, data) {
  try {
    const io = getIO();
    if (io) {
      io.emit(event, data);
    }
  } catch (e) {
    console.warn('Socket.io broadcast failed:', e.message);
  }
}

module.exports = { processSensorReading };
