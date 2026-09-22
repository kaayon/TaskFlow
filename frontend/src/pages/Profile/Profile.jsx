import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0, active: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, tasksRes] = await Promise.all([
        axios.get('/api/user'),
        axios.get('/api/tasks'),
      ]);
      setUser(userRes.data);
      setFormData({
        name: userRes.data.name || '',
        email: userRes.data.email || '',
        bio: userRes.data.bio || '',
      });

      const tasks = tasksRes.data;
      setTaskStats({
        total: tasks.length,
        completed: tasks.filter((t) => t.completed).length,
        active: tasks.filter((t) => !t.completed).length,
      });
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put('/api/user', formData);
      setUser(res.data);
      setEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const completionRate =
    taskStats.total > 0
      ? Math.round((taskStats.completed / taskStats.total) * 100)
      : 0;

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="content-container">
        <h1 className="profile-page-title">Profile</h1>

        {/* Profile Card */}
        <div className="profile-card animate-fade-in">
          <div className="profile-header">
            <div className="profile-avatar">
              <span className="profile-initials">{getInitials(user?.name)}</span>
            </div>
            <div className="profile-info">
              {editing ? (
                <form onSubmit={handleSave} className="profile-form">
                  <div className="profile-form-group">
                    <label className="label" htmlFor="profile-name">Name</label>
                    <input
                      id="profile-name"
                      type="text"
                      name="name"
                      className="input"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="profile-form-group">
                    <label className="label" htmlFor="profile-email">Email</label>
                    <input
                      id="profile-email"
                      type="email"
                      name="email"
                      className="input"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="profile-form-group">
                    <label className="label" htmlFor="profile-bio">Bio</label>
                    <textarea
                      id="profile-bio"
                      name="bio"
                      className="input textarea"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself"
                      rows={3}
                    />
                  </div>
                  <div className="profile-form-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          name: user.name || '',
                          email: user.email || '',
                          bio: user.bio || '',
                        });
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h2 className="profile-name">{user?.name || 'User'}</h2>
                  <p className="profile-email">{user?.email || 'user@example.com'}</p>
                  {user?.bio && <p className="profile-bio">{user.bio}</p>}
                  <button
                    className="btn btn-secondary btn-sm profile-edit-btn"
                    onClick={() => setEditing(true)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="profile-stats animate-fade-in-up">
          <div className="profile-stat-card">
            <div className="profile-stat-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="profile-stat-data">
              <span className="profile-stat-value">{taskStats.total}</span>
              <span className="profile-stat-label">Total Tasks</span>
            </div>
          </div>

          <div className="profile-stat-card">
            <div className="profile-stat-icon active-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="profile-stat-data">
              <span className="profile-stat-value">{taskStats.active}</span>
              <span className="profile-stat-label">Active</span>
            </div>
          </div>

          <div className="profile-stat-card">
            <div className="profile-stat-icon completed-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="profile-stat-data">
              <span className="profile-stat-value">{taskStats.completed}</span>
              <span className="profile-stat-label">Completed</span>
            </div>
          </div>

          <div className="profile-stat-card">
            <div className="profile-stat-icon rate-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="profile-stat-data">
              <span className="profile-stat-value">{completionRate}%</span>
              <span className="profile-stat-label">Completion Rate</span>
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="profile-activity animate-fade-in-up">
          <h3 className="profile-section-title">Activity Overview</h3>
          <div className="activity-bar-container">
            <div className="activity-bar">
              <div
                className="activity-bar-fill completed-fill"
                style={{ width: taskStats.total > 0 ? `${(taskStats.completed / taskStats.total) * 100}%` : '0%' }}
              ></div>
              <div
                className="activity-bar-fill active-fill"
                style={{ width: taskStats.total > 0 ? `${(taskStats.active / taskStats.total) * 100}%` : '0%' }}
              ></div>
            </div>
            <div className="activity-legend">
              <div className="activity-legend-item">
                <span className="legend-dot completed-dot"></span>
                <span>Completed ({taskStats.completed})</span>
              </div>
              <div className="activity-legend-item">
                <span className="legend-dot active-dot"></span>
                <span>Active ({taskStats.active})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="profile-account animate-fade-in-up">
          <h3 className="profile-section-title">Account</h3>
          <div className="account-details">
            <div className="account-row">
              <span className="account-label">Member since</span>
              <span className="account-value">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Today'}
              </span>
            </div>
            <div className="account-row">
              <span className="account-label">Last updated</span>
              <span className="account-value">
                {user?.updatedAt
                  ? new Date(user.updatedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Today'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
