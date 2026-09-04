const { query } = require('../config/db');

async function deviceKeyMiddleware(req, res, next) {
  const apiKey = req.headers['x-device-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'Device API key is required. Provide x-device-api-key header.' });
  }

  try {
    const [rows] = await query('SELECT * FROM devices WHERE api_key = ?', [apiKey]);
    const device = rows[0];

    if (!device) {
      return res.status(401).json({ error: 'Invalid device API key.' });
    }

    // Update last communication timestamp and set status to online
    await query(
      "UPDATE devices SET last_communication = NOW(), status = 'online', updated_at = NOW() WHERE id = ?",
      [device.id]
    );

    req.device = device;
    next();
  } catch (err) {
    console.error('Device key middleware error:', err);
    res.status(500).json({ error: 'Internal server error during device authentication.' });
  }
}

module.exports = deviceKeyMiddleware;
