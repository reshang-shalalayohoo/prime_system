const DeviceModel = require('../models/device.model');
const FieldModel = require('../models/field.model');
const ActivityLogModel = require('../models/activityLog.model');
const { classifyReading } = require('../services/severity.service');
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

  /**
   * GET /devices/map-data
   * Returns all devices with latest readings and severity classification for map view.
   */
  async getMapData(req, res) {
    try {
      const devices = await DeviceModel.getAllWithLatestReadings();

      // Classify each device's readings
      const devicesWithSeverity = await Promise.all(devices.map(async (device) => {
        const severity = await classifyReading(device.latest_reading, device.field_growth_stage);
        return { ...device, severity };
      }));

      res.json(devicesWithSeverity);
    } catch (err) {
      console.error('Get map data error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },

  /**
   * GET /devices/:id/detail
   * Returns full device detail with readings, recommendation, and severity.
   */
  async getDetail(req, res) {
    try {
      const { id } = req.params;
      const device = await DeviceModel.getDetailWithReadings(parseInt(id));

      if (!device) {
        return res.status(404).json({ error: 'Device not found.' });
      }

      // Classify severity
      const severity = await classifyReading(device.latest_reading, device.field_growth_stage);
      device.severity = severity;

      res.json(device);
    } catch (err) {
      console.error('Get device detail error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async create(req, res) {
    try {
      const { device_code, device_name, field_id, latitude, longitude } = req.body;

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
        fieldId: field_id || null,
        latitude: latitude || null,
        longitude: longitude || null
      });

      await ActivityLogModel.create({
        userId: req.user.id,
        action: 'Registered Device',
        entityType: 'device',
        entityId: device.id,
        details: `Registered device ${device_code}${field_id ? ' and assigned to field' : ''}${latitude ? ` at [${latitude}, ${longitude}]` : ''}`
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
      const { status, battery_level, device_name, field_id, latitude, longitude } = req.body;

      const device = await DeviceModel.findById(parseInt(id));
      if (!device) {
        return res.status(404).json({ error: 'Device not found.' });
      }

      const updated = await DeviceModel.updateStatus(parseInt(id), {
        status: status || device.status,
        batteryLevel: battery_level !== undefined ? battery_level : device.battery_level
      });

      // Update location if provided
      if (latitude !== undefined && longitude !== undefined) {
        await DeviceModel.updateLocation(parseInt(id), { latitude, longitude });
      }

      const result = await DeviceModel.findById(parseInt(id));
      res.json(result);
    } catch (err) {
      console.error('Update device error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },

  /**
   * PATCH /devices/:id/location
   * Update device GPS coordinates.
   */
  async updateLocation(req, res) {
    try {
      const { id } = req.params;
      const { latitude, longitude } = req.body;

      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: 'Latitude and longitude are required.' });
      }

      const device = await DeviceModel.findById(parseInt(id));
      if (!device) {
        return res.status(404).json({ error: 'Device not found.' });
      }

      const updated = await DeviceModel.updateLocation(parseInt(id), { latitude, longitude });

      await ActivityLogModel.create({
        userId: req.user.id,
        action: 'Updated Device Location',
        entityType: 'device',
        entityId: parseInt(id),
        details: `Set location to [${latitude}, ${longitude}] for ${device.device_code}`
      });

      res.json(updated);
    } catch (err) {
      console.error('Update location error:', err);
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
  },

  async getFields(req, res) {
    try {
      const fields = await FieldModel.getAll();
      res.json(fields);
    } catch (err) {
      console.error('Get fields error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
};

module.exports = DeviceController;
