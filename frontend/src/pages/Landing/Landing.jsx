import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge animate-fade-in">
              <span className="hero-badge-dot"></span>
              Simple task management
            </div>
            <h1 className="hero-title animate-fade-in-up">
              Organize your work,<br />
              <span className="hero-title-muted">clear your mind.</span>
            </h1>
            <p className="hero-subtitle animate-fade-in-up">
              A minimalist task manager built for focus. Create, organize, and
              track your tasks without the clutter. Just what you need, nothing
              you don't.
            </p>
            <div className="hero-actions animate-fade-in-up">
              <Link to="/home" className="btn btn-primary btn-lg">
                Get Started
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <a href="#features" className="btn btn-secondary btn-lg">
                Learn More
              </a>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="hero-visual animate-fade-in-up">
            <div className="hero-mock">
              <div className="mock-header">
                <div className="mock-dots">
                  <span></span><span></span><span></span>
                </div>
                <span className="mock-title">My Tasks</span>
                <div style={{ width: 48 }}></div>
              </div>
              <div className="mock-tasks">
                <div className="mock-task">
                  <div className="mock-check checked"></div>
                  <div className="mock-task-content">
                    <span className="mock-task-title done">Design system review</span>
                    <span className="mock-task-meta">Completed</span>
                  </div>
                </div>
                <div className="mock-task">
                  <div className="mock-check"></div>
                  <div className="mock-task-content">
                    <span className="mock-task-title">Update project documentation</span>
                    <span className="mock-task-meta">In Progress · Medium</span>
                  </div>
                </div>
                <div className="mock-task highlighted">
                  <div className="mock-check"></div>
                  <div className="mock-task-content">
                    <span className="mock-task-title">Plan Q4 roadmap</span>
                    <span className="mock-task-meta">High Priority</span>
                  </div>
                </div>
                <div className="mock-task">
                  <div className="mock-check"></div>
                  <div className="mock-task-content">
                    <span className="mock-task-title">Schedule team standup</span>
                    <span className="mock-task-meta">Low Priority</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features" id="features">
        <div className="container">
          <div className="features-header">
            <h2 className="features-title">Everything you need, nothing you don't</h2>
            <p className="features-subtitle">
              Built with simplicity at its core. Focus on what matters — getting things done.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="feature-title">Organize</h3>
              <p className="feature-desc">
                Create tasks with descriptions and priorities. Keep your work structured and accessible at a glance.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="feature-title">Prioritize</h3>
              <p className="feature-desc">
                Set priority levels to focus on what's important. Never lose track of urgent tasks again.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="feature-title">Track</h3>
              <p className="feature-desc">
                Monitor your progress with real-time stats. See how much you've accomplished and what's still ahead.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to get organized?</h2>
            <p className="cta-subtitle">
              Start managing your tasks today. It's free, simple, and built to help you focus.
            </p>
            <Link to="/home" className="btn btn-primary btn-lg">
              Start Now
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <span className="footer-brand">TaskFlow</span>
            <span className="footer-copy">© {new Date().getFullYear()} All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
