const express = require('express');
const router = express.Router();
const storage = require('../services/storage');
const { optionalAuth } = require('../middleware/auth');

// Apply optionalAuth across task routes so req.user is set if token provided
router.use(optionalAuth);

// GET /api/tasks — list tasks with optional filtering & search
router.get('/', async (req, res) => {
  try {
    const { filter, priority, search } = req.query;
    const userId = req.user ? req.user.id : null;
    const tasks = await storage.getTasks({ filter, priority, search, userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: err.message });
  }
});

// GET /api/tasks/:id — get a single task by ID
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const task = await storage.getTaskById(req.params.id, userId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch task', error: err.message });
  }
});

// POST /api/tasks — create a new task
// Body: { title, description, priority }
router.post('/', async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    if (priority && !['low', 'medium', 'high'].includes(priority.toLowerCase())) {
      return res.status(400).json({
        message: 'Invalid priority level. Must be one of: low, medium, high',
      });
    }

    const userId = req.user ? req.user.id : null;
    const task = await storage.createTask({
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority ? priority.toLowerCase() : 'medium',
      user: userId,
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create task', error: err.message });
  }
});

// PUT /api/tasks/:id — update an existing task
// Body: { title, description, priority, completed }
router.put('/:id', async (req, res) => {
  try {
    const { title, description, priority, completed } = req.body;

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ message: 'Task title cannot be empty' });
    }

    if (priority !== undefined && !['low', 'medium', 'high'].includes(priority.toLowerCase())) {
      return res.status(400).json({
        message: 'Invalid priority level. Must be one of: low, medium, high',
      });
    }

    const userId = req.user ? req.user.id : null;
    const updated = await storage.updateTask(req.params.id, {
      title,
      description,
      priority: priority ? priority.toLowerCase() : undefined,
      completed,
      userId,
    });

    if (!updated) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update task', error: err.message });
  }
});

// PATCH /api/tasks/:id/toggle — toggle task completion status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const task = await storage.getTaskById(req.params.id, userId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const updated = await storage.updateTask(req.params.id, {
      completed: !task.completed,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Failed to toggle task', error: err.message });
  }
});

// DELETE /api/tasks/:id — delete a task
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const deleted = await storage.deleteTask(req.params.id, userId);
    if (!deleted) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task', error: err.message });
  }
});

module.exports = router;
