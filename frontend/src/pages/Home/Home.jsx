import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('medium');

  // New task form
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');

  const titleInputRef = useRef(null);
  const editTitleRef = useRef(null);

  // Fetch tasks
  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (showForm && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [showForm]);

  useEffect(() => {
    if (editingId && editTitleRef.current) {
      editTitleRef.current.focus();
    }
  }, [editingId]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('/api/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create task
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError('Task title is required');
      return;
    }
    setFormError('');
    try {
      const res = await axios.post('/api/tasks', {
        title: newTitle.trim(),
        description: newDescription.trim(),
        priority: newPriority,
      });
      setTasks([res.data, ...tasks]);
      setNewTitle('');
      setNewDescription('');
      setNewPriority('medium');
      setShowForm(false);
    } catch (err) {
      setFormError('Failed to create task');
    }
  };

  // Toggle complete
  const handleToggle = async (task) => {
    try {
      const res = await axios.put(`/api/tasks/${task._id}`, {
        ...task,
        completed: !task.completed,
      });
      setTasks(tasks.map((t) => (t._id === task._id ? res.data : t)));
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  // Start editing
  const startEdit = (task) => {
    setEditingId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditPriority(task.priority || 'medium');
  };

  // Save edit
  const handleSaveEdit = async (taskId) => {
    if (!editTitle.trim()) return;
    try {
      const res = await axios.put(`/api/tasks/${taskId}`, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority,
      });
      setTasks(tasks.map((t) => (t._id === taskId ? res.data : t)));
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  // Delete task
  const handleDelete = async (taskId) => {
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t._id !== taskId));
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  // Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const activeTasks = totalTasks - completedTasks;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="home-loading">
        <div className="loading-spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="home">
      <div className="content-container">
        {/* Header */}
        <div className="home-header">
          <div className="home-header-left">
            <h1 className="home-title">Tasks</h1>
            <p className="home-subtitle">
              {totalTasks === 0
                ? 'No tasks yet. Create one to get started.'
                : `${activeTasks} active · ${completedTasks} completed`}
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
            id="create-task-btn"
          >
            {showForm ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Cancel
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                New Task
              </>
            )}
          </button>
        </div>

        {/* Create Task Form */}
        {showForm && (
          <form className="task-form animate-slide-down" onSubmit={handleCreate}>
            <div className="task-form-row">
              <input
                ref={titleInputRef}
                type="text"
                className="input"
                placeholder="Task title"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  setFormError('');
                }}
                id="new-task-title"
              />
            </div>
            <div className="task-form-row">
              <textarea
                className="input textarea"
                placeholder="Add a description (optional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
                id="new-task-description"
              />
            </div>
            <div className="task-form-footer">
              <div className="task-form-priority">
                <label className="label">Priority</label>
                <div className="priority-selector">
                  {['low', 'medium', 'high'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`priority-option ${newPriority === p ? 'selected' : ''} priority-${p}`}
                      onClick={() => setNewPriority(p)}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn btn-primary" id="submit-task-btn">
                Add Task
              </button>
            </div>
            {formError && <p className="form-error">{formError}</p>}
          </form>
        )}

        {/* Stats Bar */}
        {totalTasks > 0 && (
          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-value">{totalTasks}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">{activeTasks}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">{completedTasks}</span>
              <span className="stat-label">Done</span>
            </div>
            {totalTasks > 0 && (
              <>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <div className="stat-progress-bar">
                    <div
                      className="stat-progress-fill"
                      style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                    ></div>
                  </div>
                  <span className="stat-label">{Math.round((completedTasks / totalTasks) * 100)}%</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Filter Tabs */}
        {totalTasks > 0 && (
          <div className="filter-tabs">
            {['all', 'active', 'completed'].map((f) => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="filter-count">
                  {f === 'all'
                    ? totalTasks
                    : f === 'active'
                    ? activeTasks
                    : completedTasks}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Task List */}
        <div className="task-list">
          {filteredTasks.length === 0 && totalTasks > 0 && (
            <div className="empty-state">
              <p className="empty-state-text">
                No {filter === 'active' ? 'active' : 'completed'} tasks
              </p>
            </div>
          )}

          {totalTasks === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="empty-state-title">No tasks yet</p>
              <p className="empty-state-text">Click "New Task" to create your first task</p>
            </div>
          )}

          {filteredTasks.map((task) => (
            <div
              key={task._id}
              className={`task-item ${task.completed ? 'completed' : ''} ${editingId === task._id ? 'editing' : ''} animate-fade-in`}
            >
              {editingId === task._id ? (
                /* Edit Mode */
                <div className="task-edit-form">
                  <input
                    ref={editTitleRef}
                    type="text"
                    className="input"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Task title"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(task._id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                  <textarea
                    className="input textarea"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description"
                    rows={2}
                  />
                  <div className="task-edit-footer">
                    <div className="priority-selector">
                      {['low', 'medium', 'high'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          className={`priority-option ${editPriority === p ? 'selected' : ''} priority-${p}`}
                          onClick={() => setEditPriority(p)}
                        >
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                      ))}
                    </div>
                    <div className="task-edit-actions">
                      <button className="btn btn-ghost btn-sm" onClick={cancelEdit}>
                        Cancel
                      </button>
                      <button className="btn btn-primary btn-sm" onClick={() => handleSaveEdit(task._id)}>
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <>
                  <div className="task-left">
                    <div className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggle(task)}
                        aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
                      />
                    </div>
                    <div className="task-content">
                      <div className="task-title-row">
                        <span className={`task-title ${task.completed ? 'done' : ''}`}>
                          {task.title}
                        </span>
                        <span className={`badge badge-${task.priority}`}>
                          {task.priority}
                        </span>
                      </div>
                      {task.description && (
                        <p className="task-description">{task.description}</p>
                      )}
                      <span className="task-date">{formatDate(task.createdAt)}</span>
                    </div>
                  </div>
                  <div className="task-actions">
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => startEdit(task)}
                      title="Edit task"
                      aria-label="Edit task"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button
                      className="btn btn-danger btn-icon"
                      onClick={() => handleDelete(task._id)}
                      title="Delete task"
                      aria-label="Delete task"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
