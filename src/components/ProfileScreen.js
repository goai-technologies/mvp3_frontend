import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const ProfileScreen = () => {
  const { state, updateUserProfile, showNotification } = useApp();
  const [formData, setFormData] = useState({
    firstName: state.currentUser?.name?.split(' ')[0] || 'John',
    lastName: state.currentUser?.name?.split(' ')[1] || 'Doe',
    email: state.currentUser?.email || 'john.doe@example.com',
    company: state.currentUser?.company || 'Acme Corp'
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    weeklyReports: true,
    autoAudits: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (e) => {
    const { name, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const updatedUser = {
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      company: formData.company
    };

    updateUserProfile(updatedUser);
    showNotification('Profile updated successfully!', 'success');
  };

  return (
    <div className="screen">
      <div className="container">
                  <div className="profile-header">
            <h1>Profile & Settings</h1>
            <p>Manage your account and website improvement preferences</p>
          </div>
        
        <div className="profile-content">
          <div className="profile-section">
            <h2>Account Information</h2>
            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="company">Company</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                />
              </div>
              <button type="submit" className="btn-primary">
                Update Profile
              </button>
            </form>
          </div>
          
          <div className="profile-section">
            <h2>Audit Preferences</h2>
            <div className="preferences">
              <div className="preference-item">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={preferences.emailNotifications}
                    onChange={handlePreferenceChange}
                  />
                  <span className="toggle-slider"></span>
                  Email notifications for completed audits
                </label>
              </div>
              <div className="preference-item">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    name="weeklyReports"
                    checked={preferences.weeklyReports}
                    onChange={handlePreferenceChange}
                  />
                  <span className="toggle-slider"></span>
                  Weekly performance summaries
                </label>
              </div>
              <div className="preference-item">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    name="autoAudits"
                    checked={preferences.autoAudits}
                    onChange={handlePreferenceChange}
                  />
                  <span className="toggle-slider"></span>
                  Automatic monthly audits
                </label>
              </div>
            </div>
          </div>
          
          <div className="profile-section">
            <h2>Security</h2>
            <div className="security-options">
              <button className="btn-outline">Change Password</button>
              <button className="btn-outline">Enable Two-Factor Authentication</button>
            </div>
          </div>
          
          <div className="profile-section">
            <h2>Subscription</h2>
            <div className="subscription-info">
              <div className="plan-card">
                <h3>Professional Plan</h3>
                <p className="plan-price">$49/month</p>
                <p>50 audits per month</p>
                <p>Advanced analytics</p>
                <p>Priority support</p>
                <button className="btn-secondary">Manage Subscription</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
