import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useApp } from '../context/AppContext';
import { useAudit } from '../hooks/useAudit';
import apiService from '../services/api';

const DashboardScreen = () => {
  const [domain, setDomain] = useState('');
  const [recentJobs, setRecentJobs] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [optimizingJobs, setOptimizingJobs] = useState(new Set());
  const [optimizationStatus, setOptimizationStatus] = useState({});
  const { state, startAudit, showNotification } = useApp();
  const { startAuditProcess } = useAudit();
  const navigate = useNavigate();

  // Load recent scraping jobs
  useEffect(() => {
    const loadRecentJobs = async () => {
      try {
        setIsLoadingJobs(true);
        const response = await apiService.getAllJobs({ limit: 5 });
        if (response.jobs) {
          setRecentJobs(response.jobs);
        }
      } catch (error) {
        console.error('Error loading recent jobs:', error);
      } finally {
        setIsLoadingJobs(false);
      }
    };

    loadRecentJobs();
  }, []);

  // Poll for job updates every 2 seconds for processing/pending jobs
  useEffect(() => {
    const pollJobs = async () => {
      const jobsToUpdate = recentJobs.filter(job => {
        // Poll processing/pending jobs
        if (job.status === 'processing' || job.status === 'pending' || job.status === 'running') {
          return true;
        }
        // Also poll recently completed jobs that might not have stats yet
        if (job.status === 'completed' && (!job.stats || !job.stats.pages_scraped)) {
          return true;
        }
        return false;
      });
      
      if (jobsToUpdate.length === 0) return;

      try {
        const updatedJobs = await Promise.all(
          jobsToUpdate.map(async (job) => {
            try {
              const jobDetails = await apiService.getJobDetails(job.job_id);
              return jobDetails;
            } catch (error) {
              console.error(`Error polling job ${job.job_id}:`, error);
              return job; // Keep existing job data on error
            }
          })
        );

        // Update jobs with new data
        setRecentJobs(prevJobs => 
          prevJobs.map(job => {
            const updatedJob = updatedJobs.find(updated => updated && updated.job_id === job.job_id);
            return updatedJob || job;
          })
        );
      } catch (error) {
        console.error('Error polling jobs:', error);
      }
    };

    const interval = setInterval(pollJobs, 2000);
    return () => clearInterval(interval);
  }, [recentJobs]);

  // Poll for optimizing jobs to check when optimization is complete
  useEffect(() => {
    const pollOptimizingJobs = async () => {
      const jobsToPoll = recentJobs.filter(job => 
        optimizingJobs.has(job.job_id) && job.status === 'completed'
      );
      
      if (jobsToPoll.length === 0) return;

      try {
        const updatedJobs = await Promise.all(
          jobsToPoll.map(async (job) => {
            try {
              const jobDetails = await apiService.getJobDetails(job.job_id);
              // Check if optimization is complete by looking for new_report
              if (jobDetails.stats && jobDetails.stats.new_report) {
                setOptimizingJobs(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(job.job_id);
                  return newSet;
                });
                
                // Update the job in recentJobs to show the new "Compare Reports" button
                setRecentJobs(prevJobs => 
                  prevJobs.map(job => 
                    job.job_id === job.job_id 
                      ? { ...job, stats: jobDetails.stats }
                      : job
                  )
                );
                
                showNotification(`Optimization completed for ${job.domain}!`, 'success');
              } else {
                // Update optimization status if still in progress
                const currentStatus = optimizationStatus[job.job_id] || 'Starting optimization...';
                let newStatus = currentStatus;
                
                if (jobDetails.status === 'processing') {
                  newStatus = 'Optimizing...';
                } else if (jobDetails.status === 'completed') {
                  newStatus = 'Finalizing optimization...';
                }
                
                if (newStatus !== currentStatus) {
                  setOptimizationStatus(prev => ({ ...prev, [job.job_id]: newStatus }));
                }
              }
              return jobDetails;
            } catch (error) {
              console.error(`Error polling optimizing job ${job.job_id}:`, error);
              return job;
            }
          })
        );

        // Update jobs with new data
        setRecentJobs(prevJobs => 
          prevJobs.map(job => {
            const updatedJob = updatedJobs.find(updated => updated.job_id === job.job_id);
            return updatedJob || job;
          })
        );
      } catch (error) {
        console.error('Error polling optimizing jobs:', error);
      }
    };

    const interval = setInterval(pollOptimizingJobs, 3000);
    return () => clearInterval(interval);
  }, [recentJobs, optimizingJobs, optimizationStatus, showNotification]);

  // Normalize domain input to ensure it has a protocol
  const normalizeDomain = (input) => {
    if (!input) return input;
    
    // Remove any leading/trailing whitespace
    const trimmed = input.trim();
    
    // If it already has a protocol, return as is
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    
    // If it starts with www., add https://
    if (trimmed.startsWith('www.')) {
      return `https://${trimmed}`;
    }
    
    // Otherwise, add https:// prefix
    return `https://${trimmed}`;
  };

  // Manual refresh function for job data
  const refreshJobData = async () => {
    try {
      setIsLoadingJobs(true);
      const response = await apiService.getAllJobs({ limit: 5 });
      if (response.jobs) {
        setRecentJobs(response.jobs);
        showNotification('Job data refreshed successfully', 'success');
      }
    } catch (error) {
      console.error('Error refreshing job data:', error);
      showNotification('Failed to refresh job data', 'error');
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!domain) return;

    try {
      setIsSubmitting(true);
      
      // Normalize the domain input
      const normalizedDomain = normalizeDomain(domain);
      
      // Start scraping job using real API
      const jobData = {
        domain: normalizedDomain,
        headless: true
      };

      const response = await apiService.startScrapingJob(jobData);
      
      if (response.job_id) {
        // Create new job object
        const newJob = {
          job_id: response.job_id,
          domain: normalizedDomain,
          status: response.status || 'pending', // Use API response status or default to pending
          progress: response.progress || 0,
          created_at: new Date().toISOString(),
          timestamp: Date.now()
        };

        // Add new job to the beginning of the list
        setRecentJobs(prevJobs => [newJob, ...prevJobs]);
        
        // Store job ID in context for tracking
        startAudit(normalizedDomain, response.job_id);
        
        // Clear the domain input
        setDomain('');
        
        // Start the actual audit process in background
        startAuditProcess(normalizedDomain, response.job_id);
        
        // Show success notification
        showNotification(`Scraping job started successfully for ${normalizedDomain}`, 'success');
      } else {
        throw new Error('Failed to start scraping job');
      }
    } catch (error) {
      console.error('Error starting scraping job:', error);
      showNotification(`Failed to start scraping: ${error.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewReport = async (auditDomain, jobId) => {
    if (!jobId) return;
    
    try {
      setIsLoadingReport(true);
      
      // Fetch the job details to get the current_report
      const jobDetails = await apiService.getJobDetails(jobId);
      
      console.log('Job Details API Response:', jobDetails);
      console.log('Stats object:', jobDetails?.stats);
      console.log('Current Report:', jobDetails?.stats?.current_report);
      
      if (jobDetails && jobDetails.stats && jobDetails.stats.current_report) {
        setSelectedReport(jobDetails.stats.current_report);
        setIsReportModalOpen(true);
      } else {
        showNotification('No report available for this job yet', 'warning');
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      showNotification('Failed to load report', 'error');
    } finally {
      setIsLoadingReport(false);
    }
  };

  // Handle optimization job start
  const handleOptimizeJob = async (jobId, domain) => {
    try {
      setOptimizingJobs(prev => new Set([...prev, jobId]));
      setOptimizationStatus(prev => ({ ...prev, [jobId]: 'Starting optimization...' }));
      
      await apiService.optimizeJob(jobId);
      
      // Update status to show optimization has started
      setOptimizationStatus(prev => ({ ...prev, [jobId]: 'Optimization started...' }));
      
      // Show success message
      showNotification(`Optimization started for ${domain}`, 'success');
      
    } catch (error) {
      console.error('Error starting optimization:', error);
      
      // Remove from optimizing jobs on error
      setOptimizingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
      
      // Clear status
      setOptimizationStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[jobId];
        return newStatus;
      });
      
      // Show error message to user
      showNotification(`Failed to start optimization for ${domain}. Please try again.`, 'error');
    }
  };

  const handleCompareReports = async (jobId, domain) => {
    try {
      const jobDetails = await apiService.getJobDetails(jobId);
      
      if (jobDetails.stats && jobDetails.stats.current_report && jobDetails.stats.new_report) {
        // Navigate to comparison screen with the job data
        navigate('/comparison', { 
          state: { 
            jobId, 
            domain, 
            currentReport: jobDetails.stats.current_report,
            newReport: jobDetails.stats.new_report
          } 
        });
      } else {
        showNotification('Both reports are required for comparison', 'warning');
      }
    } catch (error) {
      console.error('Error preparing comparison:', error);
      showNotification('Failed to prepare comparison', 'error');
    }
  };

  const getUserFirstName = () => {
    if (state.currentUser?.name) {
      return state.currentUser.name.split(' ')[0];
    }
    return 'there';
  };

  // Helper function to get category status based on percentage score
  const getCategoryStatus = (scorePercentage) => {
    if (scorePercentage >= 80) return 'passed';
    return 'partial';
  };

  // Helper function to get category color based on percentage score
  const getCategoryColor = (scorePercentage) => {
    if (scorePercentage >= 90) return '#28a745'; // Green
    if (scorePercentage >= 80) return '#17a2b8'; // Blue
    if (scorePercentage >= 70) return '#ffc107'; // Yellow
    if (scorePercentage >= 60) return '#fd7e14'; // Orange
    return '#dc3545'; // Red
  };

  return (
    <div className="screen">
      <div className="container">
        <div className="welcome-section">
          <h1>Welcome back, {getUserFirstName()}!</h1>
          <p>Start a new website improvement or review your recent reports</p>
        </div>
      
        <div className="audit-starter-card">
          <h2>Start New Audit</h2>
          <form className="audit-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="domain">Website Domain</label>
              <input
                type="text"
                id="domain"
                name="domain"
                placeholder="example.com or https://example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div style={{ textAlign: 'center' }}>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                <FontAwesomeIcon icon="search" />
                {isSubmitting ? 'Starting Audit...' : 'Start Audit'}
              </button>
            </div>
          </form>
        </div>

        <div className="recent-audits">
          <div className="section-header">
            <h2>Recent Jobs</h2>
            <button 
              className="btn-secondary small"
              onClick={refreshJobData}
              disabled={isLoadingJobs}
            >
              {isLoadingJobs ? (
                <>
                  <FontAwesomeIcon icon="spinner" spin />
                  Refreshing...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon="refresh" />
                  Refresh
                </>
              )}
            </button>
          </div>
          <div className="audit-cards">
            {isLoadingJobs ? (
              <div className="loading-state">
                <FontAwesomeIcon icon="spinner" spin />
                Loading recent jobs...
              </div>
            ) : recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <div key={job.job_id} className="audit-card">
                  <div className="audit-info">
                    <h3>{job.domain}</h3>
                    <p className="audit-date">
                      {new Date(job.created_at || job.timestamp || Date.now()).toLocaleDateString()}
                    </p>
                    <span className={`status-badge status-${job.status}`}>
                      {job.status}
                    </span>
                  </div>
                  
                  {/* Progress Section */}
                  <div className="audit-progress">
                    {job.status === 'processing' || job.status === 'pending' || job.status === 'running' ? (
                      <div className="progress-container">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${job.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">{job.progress || 0}%</span>
                      </div>
                    ) : (
                      <div className="audit-score">
                        <div className="score-circle">
                          {job.status === 'completed' ? '✓' : job.status === 'failed' ? '✗' : '...'}
                        </div>
                        <span>
                          {job.status === 'completed' ? 'Completed' : 
                           job.status === 'failed' ? 'Failed' : 
                           job.status === 'pending' ? 'Pending' : 
                           job.status === 'running' ? 'Running' : 'In Progress'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Job Statistics - Show for completed jobs */}
                  {job.status === 'completed' && (
                    <div className="job-stats">
                      <div className="stat-item">
                        <span className="stat-label">Pages</span>
                        <span className="stat-value">
                          {job.stats?.pages_scraped || (job.stats ? 'Loading...' : 0)}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Assets</span>
                        <span className="stat-value">
                          {job.stats?.assets_downloaded || (job.stats ? 'Loading...' : 0)}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">URLs</span>
                        <span className="stat-value">
                          {job.stats?.total_urls || (job.stats ? 'Loading...' : 0)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Optimization Status - Show when job is being optimized */}
                  {optimizingJobs.has(job.job_id) && (
                    <div className="optimization-status">
                      <div className="optimization-indicator">
                        <FontAwesomeIcon icon="spinner" spin />
                        <span className="optimization-text">
                          {optimizationStatus[job.job_id] || 'Optimizing...'}
                        </span>
                      </div>
                      <div className="optimization-progress">
                        <div className="progress-bar">
                          <div className="progress-fill optimizing"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="action-buttons">
                    {job.status === 'completed' && (
                      <>
                        {job.stats && job.stats.new_report ? (
                          // Show comparison button if optimization is complete
                          <button 
                            className="btn-primary"
                            onClick={() => handleCompareReports(job.job_id, job.domain)}
                          >
                            <FontAwesomeIcon icon="chart-line" />
                            Compare Reports
                          </button>
                        ) : (
                          // Show optimize button if no optimization yet
                          <button 
                            className="btn-secondary"
                            onClick={() => handleOptimizeJob(job.job_id, job.domain)}
                            disabled={optimizingJobs.has(job.job_id)}
                          >
                            {optimizingJobs.has(job.job_id) ? (
                              <>
                                <FontAwesomeIcon icon="spinner" spin />
                                Optimizing...
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon icon="magic-wand-sparkles" />
                                Optimize
                              </>
                            )}
                          </button>
                        )}
                        
                        <button 
                          className="btn-outline"
                          onClick={() => handleViewReport(job.domain, job.job_id)}
                          disabled={isLoadingReport}
                        >
                          {isLoadingReport ? 'Loading...' : 'View Report'}
                        </button>
                      </>
                    )}
                    
                    {job.status === 'failed' && (
                      <button className="btn-secondary">Retry</button>
                    )}
                    
                    {(job.status === 'processing' || job.status === 'pending' || job.status === 'running') && (
                      <span className="processing-status">Processing...</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-jobs">
                <p>No scraping jobs yet. Start your first audit above!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {isReportModalOpen && selectedReport && (
        <div className="report-modal-overlay" onClick={() => setIsReportModalOpen(false)}>
          <div className="report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="report-modal-header">
              <h2>LLM Discovery Optimization Audit Report</h2>
              <div className="report-domain-info">
                <span className="domain-label">Website: {selectedReport.domain || 'example.com'}</span>
                <span className="report-date">{new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <button 
                className="modal-close-btn"
                onClick={() => setIsReportModalOpen(false)}
              >
                ×
              </button>
            </div>
            
            <div className="report-modal-content">
              {/* Overall Score */}
              <div className="overall-score-section">
                <div className="score-display">
                  <div className="score-circle-large">
                    <span className="score-value">{selectedReport.llm_readiness_score || 0}</span>
                  </div>
                  <div className="score-details">
                    <h3>LLM Readiness Score</h3>
                    <div className={`grade-badge grade-${selectedReport.letter_grade?.toLowerCase() || 'b'}`}>
                      {selectedReport.letter_grade || 'B'} - {selectedReport.letter_grade_descriptive || 'Good'}
                    </div>
                  </div>
                </div>
                <p className="score-summary">{selectedReport.summary}</p>
              </div>

              {/* Categories */}
              <div className="categories-section">
                <h3>Category Scores</h3>
                <div className="categories-grid">
                  {selectedReport.categories?.map((category, index) => {
                    const scorePercentage = category.max_score > 0 ? (category.score / category.max_score) * 100 : 0;
                    return (
                      <div key={index} className="category-card">
                        <div className="category-header">
                          <h4>{category.name}</h4>
                          <div className="category-score">
                            {category.score}/{category.max_score} ({scorePercentage.toFixed(2)}%)
                          </div>
                        </div>
                        <div className="category-status">
                          <span className={`status-indicator ${getCategoryStatus(scorePercentage)}`}>
                            {getCategoryStatus(scorePercentage) === 'passed' ? '✓ Passed' : '⚠ Partial'}
                          </span>
                        </div>
                        <div className="category-progress">
                          <div className="progress-bar-category">
                            <div
                              className="progress-fill-category"
                              style={{
                                width: `${scorePercentage}%`,
                                backgroundColor: getCategoryColor(scorePercentage)
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="metrics-list">
                          {category.metrics?.map((metric, metricIndex) => {
                            const metricPercentage = metric.max_score > 0 ? (metric.score / metric.max_score) * 100 : 0;
                            return (
                              <div key={metricIndex} className="metric-item">
                                <div className="metric-header">
                                  <span className="metric-name">{metric.name}</span>
                                  <span className="metric-score">
                                    {metric.score}/{metric.max_score} ({metricPercentage.toFixed(2)}%)
                                  </span>
                                </div>
                                <p className="metric-comments">{metric.comments}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Critical Items */}
              {selectedReport.top_5_critical_items && selectedReport.top_5_critical_items.length > 0 && (
                <div className="critical-items-section">
                  <div className="critical-header">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>Critical Items - Action Required!</span>
                  </div>
                  <ul className="critical-list">
                    {selectedReport.top_5_critical_items.map((item, index) => (
                      <li key={index} className="critical-item">{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {selectedReport.top_5_warnings && selectedReport.top_5_warnings.length > 0 && (
                <div className="warnings-section">
                  <div className="warnings-header">
                    <i className="fas fa-exclamation-circle"></i>
                    <span>Warnings</span>
                  </div>
                  <ul className="warnings-list">
                    {selectedReport.top_5_warnings.map((warning, index) => (
                      <li key={index} className="warning-item">{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardScreen;
