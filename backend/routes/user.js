const express = require('express');
const router = express.Router();
const storage = require('../services/storage');
const { optionalAuth } = require('../middleware/auth');

// Apply optional auth
router.use(optionalAuth);

// GET /api/user — get user profile
router.get('/', async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const user = await storage.getUserProfile(userId);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
});

// PUT /api/user — update user profile
router.put('/', async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { name, email, bio, avatar } = req.body;
    const updated = await storage.updateUserProfile(userId, { name, email, bio, avatar });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update user', error: err.message });
  }
});

// POST /api/user/signup — Alias for user signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, bio, avatar } = req.body;
    const result = await storage.registerUser({ name, email, password, bio, avatar });
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

// POST /api/user/login — Alias for user login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await storage.loginUser({ email, password });
    res.json({
      message: 'Login successful',
      token: result.token,
      user: result.user,
    });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
});

module.exports = router;
