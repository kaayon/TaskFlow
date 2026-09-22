const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/user — get user profile (or create default)
router.get('/', async (req, res) => {
  try {
    let user = await User.findOne();
    if (!user) {
      user = await User.create({
        name: 'User',
        email: 'user@example.com',
        bio: '',
        avatar: '',
      });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
});

// PUT /api/user — update user profile
router.put('/', async (req, res) => {
  try {
    const { name, email, bio, avatar } = req.body;
    let user = await User.findOne();
    if (!user) {
      user = await User.create({ name, email, bio, avatar });
    } else {
      user = await User.findByIdAndUpdate(
        user._id,
        { name, email, bio, avatar },
        { new: true, runValidators: true }
      );
    }
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update user', error: err.message });
  }
});

module.exports = router;
