// API Service for Website Scraping Platform
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5002';
const API_URL = `${API_BASE_URL}/api`;

class ApiService {
  constructor() {
    this.baseURL = API_URL;
    this.token = localStorage.getItem('auth_token') || null;
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Get headers with authentication
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Make API request
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // System & Health
  async getApiStatus() {
    return this.makeRequest('/status');
  }

  // Authentication
  async registerUser(userData) {
    return this.makeRequest('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async loginUser(credentials) {
    const response = await this.makeRequest('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.makeRequest('/me');
  }

  // Scraping Jobs
  async startScrapingJob(jobData) {
    return this.makeRequest('/scrape', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async getAllJobs(filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const endpoint = filters.status || filters.limit ? `/jobs?${queryParams}` : '/jobs';
    return this.makeRequest(endpoint);
  }

  async getJobDetails(jobId) {
    return this.makeRequest(`/jobs/${jobId}`);
  }

  // Optimization API
  async optimizeJob(jobId) {
    return this.makeRequest('/optimize', {
      method: 'POST',
      body: JSON.stringify({ job_id: jobId }),
    });
  }

  async downloadJobData(jobId) {
    const url = `${this.baseURL}/jobs/${jobId}/download`;
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }
    
    return response.blob();
  }

  // Domains
  async getAllDomains() {
    return this.makeRequest('/domains');
  }

  // Utility methods
  async checkJobStatus(jobId) {
    return this.getJobDetails(jobId);
  }

  async waitForJobCompletion(jobId, maxWaitTime = 300000) { // 5 minutes default
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        const job = await this.getJobDetails(jobId);
        
        if (job.status === 'completed') {
          return job;
        } else if (job.status === 'failed') {
          throw new Error(`Job failed: ${job.error || 'Unknown error'}`);
        }
        
        // Wait 2 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Error checking job status:', error);
        throw error;
      }
    }
    
    throw new Error('Job completion timeout');
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
