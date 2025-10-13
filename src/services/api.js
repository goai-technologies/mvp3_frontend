// API Service for Website Scraping Platform
import { config } from '../config/environment.js';

class ApiService {
  constructor() {
    // Always use explicit base URL to backend (localhost:5002 by default)
    this.baseURL = `${config.API_BASE_URL}/api`;
    this.token = localStorage.getItem('llmredi_token') || null;
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('llmredi_token', token);
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    localStorage.removeItem('llmredi_token');
  }

  // Refresh token from localStorage (useful for debugging)
  refreshToken() {
    this.token = localStorage.getItem('llmredi_token') || null;
    console.log('Token refreshed from localStorage:', this.token ? 'Present' : 'Missing');
    return this.token;
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

  // Cleanup Jobs
  async deleteAllJobs() {
    return this.makeRequest('/cleanup', {
      method: 'DELETE',
    });
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

  // LLM Readiness Analysis
  async analyzeLLMReadiness(domain) {
    console.log('Making API call to:', `${this.baseURL}/llm-analyze`);
    console.log('Domain:', domain);
    console.log('Auth token:', this.token ? 'Present' : 'Missing');
    
    return this.makeRequest('/llm-analyze', {
      method: 'POST',
      body: JSON.stringify({ domain }),
    });
  }

  // Get previous LLM readiness analyses history
  async getLLMAnalysisHistory() {
    console.log('Making API call to:', `${this.baseURL}/agentanalyse/history`);
    console.log('Auth token:', this.token ? 'Present' : 'Missing');
    return this.makeRequest('/agentanalyse/history', {
      method: 'GET',
    });
  }

  // Brand LLM Analysis
  async analyzeBrandLLM(brandData) {
    console.log('Making API call to:', `${this.baseURL}/brand-llm-analysis`);
    console.log('Brand data:', brandData);
    console.log('Auth token:', this.token ? 'Present' : 'Missing');
    
    return this.makeRequest('/brand-llm-analysis', {
      method: 'POST',
      body: JSON.stringify(brandData),
    });
  }

  // Get Previous Brand Analyses
  async getPreviousBrandAnalyses() {
    console.log('Making API call to:', `${this.baseURL}/brand-llm-analysis/all`);
    console.log('Auth token in API service:', this.token ? 'Present' : 'Missing');
    console.log('Token value in API service:', this.token);
    
    return this.makeRequest('/brand-llm-analysis/all', {
      method: 'GET',
    });
  }

  // Competition Analysis
  async startCompetitionAnalysis(analysisData) {
    console.log('Making API call to:', `${this.baseURL}/competition-analysis`);
    console.log('Analysis data:', analysisData);
    console.log('Auth token:', this.token ? 'Present' : 'Missing');
    
    return this.makeRequest('/competition-analysis', {
      method: 'POST',
      body: JSON.stringify(analysisData),
    });
  }

  async getLatestCompetitionAnalysis() {
    console.log('Making API call to:', `${this.baseURL}/competition-analysis/previous`);
    console.log('Auth token:', this.token ? 'Present' : 'Missing');
    
    return this.makeRequest('/competition-analysis/previous', {
      method: 'GET',
    });
  }

  async getAllCompetitionAnalyses() {
    console.log('Making API call to:', `${this.baseURL}/competition-analysis/all`);
    console.log('Auth token:', this.token ? 'Present' : 'Missing');
    
    return this.makeRequest('/competition-analysis/all', {
      method: 'GET',
    });
  }

  async getCompetitionAnalysis(analysisId) {
    console.log('Making API call to:', `${this.baseURL}/competition-analysis/${analysisId}`);
    console.log('Auth token:', this.token ? 'Present' : 'Missing');
    
    return this.makeRequest(`/competition-analysis/${analysisId}`, {
      method: 'GET',
    });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
