const bcrypt = require('bcrypt');
const UserModel = require('../models/user.model');
const { generateToken } = require('../utils/jwt');

const AuthController = {
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
      }

      const user = await UserModel.findByUsername(username);
      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password.' });
      }

      if (!user.is_active) {
        return res.status(403).json({ error: 'Account is deactivated. Contact your administrator.' });
      }

      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid username or password.' });
      }

      const token = generateToken(user);

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name,
          role: user.role
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Internal server error during login.' });
    }
  },

  async register(req, res) {
    try {
      const { username, email, password, fullName } = req.body;

      if (!username || !password || !fullName) {
        return res.status(400).json({ error: 'Username, password, and full name are required.' });
      }

      if (username.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
      }

      const existing = await UserModel.findByUsername(username);
      if (existing) {
        return res.status(409).json({ error: 'Username already exists.' });
      }

      if (email) {
        const existingEmail = await UserModel.findByEmail(email);
        if (existingEmail) {
          return res.status(409).json({ error: 'Email already in use.' });
        }
      }

      const passwordHash = await bcrypt.hash(password, 10);
      // Public registration ALWAYS creates farmer accounts — admin accounts are created separately
      const user = await UserModel.create({
        username,
        email,
        passwordHash,
        fullName,
        role: 'farmer'
      });

      const token = generateToken(user);

      res.status(201).json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name,
          role: user.role
        }
      });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ error: 'Internal server error during registration.' });
    }
  },

  async getMe(req, res) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at
      });
    } catch (err) {
      console.error('GetMe error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
};

module.exports = AuthController;
