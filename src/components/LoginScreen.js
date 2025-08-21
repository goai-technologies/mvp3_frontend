import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useApp } from '../context/AppContext';
import apiService from '../services/api';

const LoginScreen = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return;
    }

    setIsLoading(true);

    try {
      // Use real API for login
      const response = await apiService.loginUser({
        email: formData.email,
        password: formData.password
      });

      if (response.token && response.user) {
        const userData = {
          email: response.user.email || formData.email,
          name: response.user.username || 'User',
          company: response.user.company || 'Company',
          id: response.user.user_id || Date.now()
        };

        login(userData, response.token);
        setIsLoading(false);
        navigate('/dashboard');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      
      // Show user-friendly error message
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.message.includes('Invalid credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to server. Please try again later.';
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className="screen login-screen">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-container">
              <img 
                src="/llm_redi_png.png" 
                alt="LLMredi Logo" 
                className="logo-large"
              />
            </div>
            <p>Automated Website Improvement Platform - Making your website AI-ready for LLMs</p>
          </div>
          
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isLoading || !formData.email || !formData.password}
            >
              {isLoading ? (
                <>
                  <FontAwesomeIcon icon="spinner" spin />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <div className="login-footer">
            <p>Don't have an account? <a href="#signup">Sign up</a></p>
            <p><a href="#forgot">Forgot password?</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
