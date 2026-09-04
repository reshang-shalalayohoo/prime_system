const DeviceModel = require('../models/device.model');
const ActivityLogModel = require('../models/activityLog.model');
const crypto = require('crypto');

const DeviceController = {
  async getAll(req, res) {
    try {
      const devices = await DeviceModel.getAll();
      res.json(devices);
    } catch (err) {
      console.error('Get devices error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async create(req, res) {
    try {
      const { device_code, device_name, field_id } = req.body;

      if (!device_code) {
        return res.status(400).json({ error: 'Device code is required.' });
      }

      const existing = await DeviceModel.findByDeviceCode(device_code);
      if (existing) {
        return res.status(409).json({ error: 'Device code already exists.' });
      }

      // Generate unique API key
      const apiKey = `prime-${device_code.toLowerCase()}-${crypto.randomBytes(12).toString('hex')}`;

      const device = await DeviceModel.create({
        deviceCode: device_code,
        apiKey,
        deviceName: device_name || device_code,
        fieldId: field_id || null
      });

      await ActivityLogModel.create({
        userId: req.user.id,
        action: 'Registered Device',
        entityType: 'device',
        entityId: device.id,
        details: `Registered device ${device_code}${field_id ? ' and assigned to field' : ''}`
      });

      res.status(201).json(device);
    } catch (err) {
      console.error('Create device error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { status, battery_level, device_name, field_id } = req.body;

      const device = await DeviceModel.findById(parseInt(id));
      if (!device) {
        return res.status(404).json({ error: 'Device not found.' });
      }

      const updated = await DeviceModel.updateStatus(parseInt(id), {
        status: status || device.status,
        batteryLevel: battery_level !== undefined ? battery_level : device.battery_level
      });

      res.json(updated);
    } catch (err) {
      console.error('Update device error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async getOnlineCount(req, res) {
    try {
      const count = await DeviceModel.getOnlineCount();
      res.json({ count });
    } catch (err) {
      console.error('Get online count error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
};

module.exports = DeviceController;
