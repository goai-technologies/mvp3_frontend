// Environment Configuration
export const config = {
  // API Configuration
  // Production API Base URL
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://transform-api.llmredi.ai',
  
  // Production API Base URL (uncomment for production deployment)
  // API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://parthgoai.pythonanywhere.com',
  
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
