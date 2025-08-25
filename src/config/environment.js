// Environment Configuration
export const config = {
  // API Configuration
  // Production API Base URL
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://parthgoai.pythonanywhere.com',
  
  // Local Development API Base URL (uncomment for local development)
  // API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5002',
  
  // Debug mode for API logging
  DEBUG_MODE: process.env.REACT_APP_DEBUG_MODE === 'true' || false,
  
  // Default timeout values
  DEFAULT_TIMEOUT: 300000, // 5 minutes
  
  // Polling intervals
  JOB_STATUS_POLL_INTERVAL: 2000, // 2 seconds
  
  // Feature flags
  ENABLE_REAL_TIME_UPDATES: true,
  ENABLE_JOB_DOWNLOAD: true,
};

export default config;
