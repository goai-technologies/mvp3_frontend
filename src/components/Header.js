import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useApp } from '../context/AppContext';

const Header = () => {
  const { state, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show header on login page
  if (location.pathname === '/login' || !state.isLoggedIn) {
    return null;
  }

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/dashboard' || path === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="container">
        <div className="nav-brand">
          <div className="logo-container" onClick={() => handleNavigation('/dashboard')}>
            <img 
              src="/llm_redi_png.png" 
              alt="LLMredi Logo" 
              className="logo"
            />
          </div>
        </div>
        <nav className="nav-menu">
          <button
            onClick={() => handleNavigation('/dashboard')}
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon="home" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => handleNavigation('/profile')}
            className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon="user" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => handleNavigation('/llm-analyzer')}
            className={`nav-link ${isActive('/llm-analyzer') ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon="robot" />
            <span>LLM Analyzer</span>
          </button>
          <button
            onClick={() => handleNavigation('/brand-analysis')}
            className={`nav-link ${isActive('/brand-analysis') ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon="chart-bar" />
            <span>Brand LLM Analysis</span>
          </button>
          <button
            onClick={() => handleNavigation('/competition-analysis')}
            className={`nav-link ${isActive('/competition-analysis') ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon="balance-scale" />
            <span>Competition Analysis</span>
          </button>
          <button
            onClick={() => handleNavigation('/help')}
            className={`nav-link ${isActive('/help') ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon="question-circle" />
            <span>Help</span>
          </button>
          <button
            onClick={handleLogout}
            className="nav-link logout"
          >
            <FontAwesomeIcon icon="sign-out-alt" />
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
