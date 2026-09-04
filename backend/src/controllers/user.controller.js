const bcrypt = require('bcrypt');
const UserModel = require('../models/user.model');
const FieldModel = require('../models/field.model');
const ActivityLogModel = require('../models/activityLog.model');

const UserController = {
  async getAll(req, res) {
    try {
      const users = await UserModel.getAll();
      res.json(users);
    } catch (err) {
      console.error('Get users error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async create(req, res) {
    try {
      const { username, email, password, full_name, role } = req.body;

      if (!username || !password || !full_name) {
        return res.status(400).json({ error: 'Username, password, and full name are required.' });
      }

      const existing = await UserModel.findByUsername(username);
      if (existing) {
        return res.status(409).json({ error: 'Username already exists.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await UserModel.create({
        username,
        email,
        passwordHash,
        fullName: full_name,
        role: role || 'farmer'
      });

      // Create a default field for farmers
      if (user.role === 'farmer') {
        await FieldModel.create({
          name: `${full_name}'s Field`,
          location: 'To be updated',
          areaHectares: 1.0,
          cropType: 'Palay',
          growthStage: 'Vegetative',
          userId: user.id
        });
      }

      await ActivityLogModel.create({
        userId: req.user.id,
        action: 'Created User',
        entityType: 'user',
        entityId: user.id,
        details: `Created ${role || 'farmer'} account: ${username}`
      });

      res.status(201).json(user);
    } catch (err) {
      console.error('Create user error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      if (is_active === undefined) {
        return res.status(400).json({ error: 'is_active field is required.' });
      }

      // Prevent self-deactivation
      if (parseInt(id) === req.user.id && !is_active) {
        return res.status(400).json({ error: 'You cannot deactivate your own account.' });
      }

      const user = await UserModel.updateStatus(parseInt(id), is_active);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      await ActivityLogModel.create({
        userId: req.user.id,
        action: is_active ? 'Activated User' : 'Deactivated User',
        entityType: 'user',
        entityId: parseInt(id),
        details: `${is_active ? 'Activated' : 'Deactivated'} user: ${user.username}`
      });

      res.json(user);
    } catch (err) {
      console.error('Update user status error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
};

module.exports = UserController;
