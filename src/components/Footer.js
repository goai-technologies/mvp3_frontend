import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useApp } from '../context/AppContext';

const Footer = () => {
  const navigate = useNavigate();
  const { state } = useApp();
  
  const handleNavigation = (path) => {
    navigate(path);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section footer-brand">
            <div className="footer-logo">
              <img 
                src="/llm_redi_png.png" 
                alt="Logo" 
                className="logo"
              />
            </div>
            <p className="footer-description">
              Automated Website Improvement Platform - Making your website AI-ready for LLMs
            </p>
            <div className="footer-stats">
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Websites Improved</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">95%</span>
                <span className="stat-label">AI Readiness Score</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li>
                <button onClick={() => handleNavigation('/dashboard')} className="footer-link">
                  <FontAwesomeIcon icon="home" />
                  Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/report/original')} className="footer-link">
                  <FontAwesomeIcon icon="chart-line" />
                  Reports
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/comparison')} className="footer-link">
                  <FontAwesomeIcon icon="check-double" />
                  Comparison
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/insights')} className="footer-link">
                  <FontAwesomeIcon icon="magic-wand-sparkles" />
                  Insights
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/llm-analyzer')} className="footer-link">
                  <FontAwesomeIcon icon="robot" />
                  LLM Analyzer
                </button>
              </li>
            </ul>
          </div>

          {/* Account & Settings */}
          <div className="footer-section">
            <h3>Account</h3>
            <ul className="footer-links">
              <li>
                <button onClick={() => handleNavigation('/profile')} className="footer-link">
                  <FontAwesomeIcon icon="user" />
                  Profile & Settings
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/help')} className="footer-link">
                  <FontAwesomeIcon icon="question-circle" />
                  Help & Support
                </button>
              </li>
            </ul>
          </div>

          {/* Support & Resources */}
          <div className="footer-section">
            <h3>Support</h3>
            <ul className="footer-links">
              <li>
                <a href="mailto:support@example.com" className="footer-link">
                  <FontAwesomeIcon icon="envelope" />
                  Email Support
                </a>
              </li>
            </ul>
          </div>

          {/* AI Technologies */}
          <div className="footer-section">
            <h3>AI Models</h3>
            <div className="ai-models">
              <div className="ai-model">
                <FontAwesomeIcon icon="robot" />
                <span>ChatGPT</span>
              </div>
              <div className="ai-model">
                <FontAwesomeIcon icon="robot" />
                <span>Gemini</span>
              </div>
              <div className="ai-model">
                <FontAwesomeIcon icon="robot" />
                <span>Claude</span>
              </div>
            </div>
            <p className="ai-description">
              Multi-model analysis for comprehensive AI readiness evaluation
            </p>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="copyright">
              <p>&copy; {currentYear} Automated Website Improvement Platform. All rights reserved.</p>
              <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.5rem' }}>
                Powered by LLM Readiness Framework v2.
              </p>
            </div>
            <div className="footer-status">
              {state.isLoggedIn && (
                <div className="user-status">
                  <FontAwesomeIcon icon="check-circle" className="status-icon" />
                  <span>Logged in as {state.currentUser?.name || 'User'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
