const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('../models/Task');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'taskflow_jwt_secret_key_2026_super_secure';

// Helper to check if Mongoose is connected to MongoDB
const isMongoConnected = () => mongoose.connection.readyState === 1;

// In-Memory Fallback Store (Used when MongoDB is offline)
const inMemoryStore = {
  users: [
    {
      _id: 'user_default_1',
      name: 'TaskFlow User',
      email: 'user@example.com',
      passwordHash: '$2a$10$wN9Q9mC55Hn2k0h7e7JgUOHtJ7yG8Z1dF0O3hK1aB8F6vU.X0Y6/G', // hashed 'password123'
      bio: 'Productivity enthusiast using TaskFlow.',
      avatar: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  tasks: [
    {
      _id: 'task_sample_1',
      title: 'Welcome to TaskFlow!',
      description: 'Create, edit, organize by priority (low, medium, high), and track your progress.',
      priority: 'high',
      completed: false,
      user: null,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      _id: 'task_sample_2',
      title: 'Explore task priority levels',
      description: 'You can set tasks to low, medium, or high priority to focus on what matters most.',
      priority: 'medium',
      completed: false,
      user: null,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      updatedAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      _id: 'task_sample_3',
      title: 'Review completed assignments',
      description: 'Mark tasks as completed by checking the box next to them.',
      priority: 'low',
      completed: true,
      user: null,
      createdAt: new Date(Date.now() - 10800000).toISOString(),
      updatedAt: new Date(Date.now() - 10800000).toISOString(),
    },
  ],
};

const generateId = () => {
  return new mongoose.Types.ObjectId().toString();
};

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ------------------- TASK OPERATIONS -------------------

async function getTasks({ filter, priority, search, userId }) {
  if (isMongoConnected()) {
    const query = {};
    if (userId) {
      query.$or = [{ user: userId }, { user: null }];
    }
    if (filter === 'active') query.completed = false;
    if (filter === 'completed') query.completed = true;
    if (priority && ['low', 'medium', 'high'].includes(priority)) {
      query.priority = priority;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    return await Task.find(query).sort({ createdAt: -1 });
  }

  // Fallback In-Memory
  let list = [...inMemoryStore.tasks];
  if (userId) {
    list = list.filter((t) => !t.user || t.user === userId || t.user === userId.toString());
  }
  if (filter === 'active') list = list.filter((t) => !t.completed);
  if (filter === 'completed') list = list.filter((t) => t.completed);
  if (priority && ['low', 'medium', 'high'].includes(priority)) {
    list = list.filter((t) => t.priority === priority);
  }
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(
      (t) =>
        (t.title && t.title.toLowerCase().includes(s)) ||
        (t.description && t.description.toLowerCase().includes(s))
    );
  }
  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function getTaskById(id, userId) {
  if (isMongoConnected()) {
    const task = await Task.findById(id);
    return task;
  }
  return inMemoryStore.tasks.find((t) => t._id.toString() === id.toString()) || null;
}

async function createTask({ title, description, priority, user }) {
  const cleanTitle = (title || '').trim();
  const cleanDesc = (description || '').trim();
  const cleanPriority = ['low', 'medium', 'high'].includes(priority) ? priority : 'medium';

  if (!cleanTitle) {
    throw new Error('Task title is required');
  }
  if (cleanTitle.length > 200) {
    throw new Error('Title cannot exceed 200 characters');
  }
  if (cleanDesc.length > 1000) {
    throw new Error('Description cannot exceed 1000 characters');
  }

  if (isMongoConnected()) {
    return await Task.create({
      title: cleanTitle,
      description: cleanDesc,
      priority: cleanPriority,
      user: user || null,
      completed: false,
    });
  }

  // Fallback In-Memory
  const newTask = {
    _id: generateId(),
    title: cleanTitle,
    description: cleanDesc,
    priority: cleanPriority,
    completed: false,
    user: user || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  inMemoryStore.tasks.unshift(newTask);
  return newTask;
}

async function updateTask(id, { title, description, priority, completed }) {
  if (isMongoConnected()) {
    const updateData = {};
    if (title !== undefined) {
      if (!title.trim()) throw new Error('Task title cannot be empty');
      updateData.title = title.trim();
    }
    if (description !== undefined) {
      updateData.description = description.trim();
    }
    if (priority !== undefined) {
      if (!['low', 'medium', 'high'].includes(priority)) {
        throw new Error('Priority must be low, medium, or high');
      }
      updateData.priority = priority;
    }
    if (completed !== undefined) {
      updateData.completed = Boolean(completed);
    }

    const updated = await Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    return updated;
  }

  // Fallback In-Memory
  const index = inMemoryStore.tasks.findIndex((t) => t._id.toString() === id.toString());
  if (index === -1) return null;

  const current = inMemoryStore.tasks[index];
  if (title !== undefined) {
    if (!title.trim()) throw new Error('Task title cannot be empty');
    current.title = title.trim();
  }
  if (description !== undefined) {
    current.description = description.trim();
  }
  if (priority !== undefined) {
    if (!['low', 'medium', 'high'].includes(priority)) {
      throw new Error('Priority must be low, medium, or high');
    }
    current.priority = priority;
  }
  if (completed !== undefined) {
    current.completed = Boolean(completed);
  }
  current.updatedAt = new Date().toISOString();
  return current;
}

async function deleteTask(id) {
  if (isMongoConnected()) {
    return await Task.findByIdAndDelete(id);
  }

  const index = inMemoryStore.tasks.findIndex((t) => t._id.toString() === id.toString());
  if (index === -1) return null;
  const removed = inMemoryStore.tasks.splice(index, 1)[0];
  return removed;
}

// ------------------- USER & AUTH OPERATIONS -------------------

async function registerUser({ name, email, password, bio, avatar }) {
  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = password || '';

  if (!cleanName) throw new Error('Name is required');
  if (!cleanEmail) throw new Error('Email is required');
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(cleanEmail)) {
    throw new Error('Please provide a valid email address');
  }
  if (!cleanPassword || cleanPassword.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  if (isMongoConnected()) {
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      throw new Error('Email is already registered');
    }
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      bio: (bio || '').trim(),
      avatar: (avatar || '').trim(),
    });
    const token = generateToken(user);
    return { token, user: user.toJSON() };
  }

  // Fallback In-Memory
  const existing = inMemoryStore.users.find((u) => u.email === cleanEmail);
  if (existing) {
    throw new Error('Email is already registered');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(cleanPassword, salt);
  const newUser = {
    _id: generateId(),
    name: cleanName,
    email: cleanEmail,
    passwordHash,
    bio: (bio || '').trim(),
    avatar: (avatar || '').trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  inMemoryStore.users.push(newUser);

  const token = generateToken(newUser);
  const { passwordHash: _, ...safeUser } = newUser;
  return { token, user: safeUser };
}

async function loginUser({ email, password }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = password || '';

  if (!cleanEmail || !cleanPassword) {
    throw new Error('Please provide email and password');
  }

  if (isMongoConnected()) {
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      throw new Error('Invalid email or password');
    }
    const isMatch = await user.comparePassword(cleanPassword);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }
    const token = generateToken(user);
    return { token, user: user.toJSON() };
  }

  // Fallback In-Memory
  const user = inMemoryStore.users.find((u) => u.email === cleanEmail);
  if (!user) {
    throw new Error('Invalid email or password');
  }
  const isMatch = await bcrypt.compare(cleanPassword, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user);
  const { passwordHash: _, ...safeUser } = user;
  return { token, user: safeUser };
}

async function getUserProfile(userId) {
  if (isMongoConnected()) {
    if (userId) {
      const user = await User.findById(userId);
      if (user) return user.toJSON();
    }
    let defaultUser = await User.findOne();
    if (!defaultUser) {
      defaultUser = await User.create({
        name: 'TaskFlow User',
        email: 'user@example.com',
        password: 'defaultPassword123',
        bio: 'Organizing tasks with TaskFlow.',
      });
    }
    return defaultUser.toJSON();
  }

  // Fallback In-Memory
  if (userId) {
    const found = inMemoryStore.users.find((u) => u._id.toString() === userId.toString());
    if (found) {
      const { passwordHash: _, ...safe } = found;
      return safe;
    }
  }
  const defaultUser = inMemoryStore.users[0];
  const { passwordHash: _, ...safe } = defaultUser;
  return safe;
}

async function updateUserProfile(userId, { name, email, bio, avatar }) {
  if (isMongoConnected()) {
    let user;
    if (userId) {
      user = await User.findById(userId);
    }
    if (!user) {
      user = await User.findOne();
    }
    if (!user) {
      user = await User.create({
        name: name || 'TaskFlow User',
        email: email || 'user@example.com',
        password: 'defaultPassword123',
        bio: bio || '',
        avatar: avatar || '',
      });
      return user.toJSON();
    }

    if (name !== undefined) user.name = name.trim();
    if (email !== undefined) user.email = email.trim().toLowerCase();
    if (bio !== undefined) user.bio = bio.trim();
    if (avatar !== undefined) user.avatar = avatar.trim();
    await user.save();
    return user.toJSON();
  }

  // Fallback In-Memory
  let user = userId
    ? inMemoryStore.users.find((u) => u._id.toString() === userId.toString())
    : inMemoryStore.users[0];

  if (!user) {
    user = inMemoryStore.users[0];
  }

  if (name !== undefined) user.name = name.trim();
  if (email !== undefined) user.email = email.trim().toLowerCase();
  if (bio !== undefined) user.bio = bio.trim();
  if (avatar !== undefined) user.avatar = avatar.trim();
  user.updatedAt = new Date().toISOString();

  const { passwordHash: _, ...safe } = user;
  return safe;
}

module.exports = {
  isMongoConnected,
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
