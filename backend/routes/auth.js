const express = require('express');
const router = express.Router();
const storage = require('../services/storage');
const { requireAuth } = require('../middleware/auth');

// POST /api/auth/register (or /api/auth/signup) — User registration
router.post(['/register', '/signup'], async (req, res) => {
  try {
    const { name, email, password, bio, avatar } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const result = await storage.registerUser({
      name,
      email,
      password,
      bio,
      avatar,
    });

    res.status(201).json({
      message: 'Account created successfully',
      token: result.token,
      user: result.user,
    });
  } catch (err) {
    const status = err.message.includes('already registered') ? 409 : 400;
    res.status(status).json({ message: err.message });
  }
});

// POST /api/auth/login — User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    const result = await storage.loginUser({ email, password });
    res.json({
      message: 'Login successful',
      token: result.token,
      user: result.user,
    });
  } catch (err) {
    res.status(401).json({ message: err.message || 'Invalid email or password' });
  }
});

// GET /api/auth/me — Get authenticated user details
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await storage.getUserProfile(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
});

// POST /api/auth/logout — Client-side logout notification
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

module.exports = router;
