import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useApp } from '../context/AppContext';
import { useAudit } from '../hooks/useAudit';
import apiService from '../services/api';

const ProcessingScreen = () => {
  const { state } = useApp();
  const { currentStep, getStepStatus } = useAudit();
  const navigate = useNavigate();
  const [jobStatus, setJobStatus] = useState(null);
  const [isPolling, setIsPolling] = useState(false);

  // Poll job status from API
  useEffect(() => {
    if (state.currentJobId && !isPolling) {
      setIsPolling(true);
      let completionCheckCount = 0;
      const maxCompletionChecks = 3; // Check up to 3 times after completion status
      
      const pollJobStatus = async () => {
        try {
          const job = await apiService.getJobDetails(state.currentJobId);
          setJobStatus(job);
          
          if (job.status === 'completed') {
            // Ensure we have valid statistics before proceeding
            if (job.stats && (job.stats.pages_scraped > 0 || job.stats.total_urls > 0 || completionCheckCount >= maxCompletionChecks)) {
              // Job completed with stats, redirect to comparison with a shorter delay
              setTimeout(() => {
                navigate('/comparison', { state: { jobId: job.job_id, domain: job.domain } });
              }, 1500);
            } else {
              // Status is completed but stats not ready, continue polling for a few more attempts
              completionCheckCount++;
              if (completionCheckCount >= maxCompletionChecks) {
                // Max attempts reached, proceed anyway but with longer delay to let backend finish
                setTimeout(() => {
                  navigate('/comparison', { state: { jobId: job.job_id, domain: job.domain } });
                }, 3000);
              }
            }
          } else if (job.status === 'failed') {
            // Job failed, show error
            alert(`Job failed: ${job.error || 'Unknown error'}`);
            navigate('/dashboard');
          } else {
            // Reset completion check count for non-completed statuses
            completionCheckCount = 0;
          }
        } catch (error) {
          console.error('Error polling job status:', error);
        }
      };

      // Poll every 2 seconds
      const interval = setInterval(pollJobStatus, 2000);
      pollJobStatus(); // Initial call

      return () => {
        clearInterval(interval);
        setIsPolling(false);
      };
    }
  }, [state.currentJobId, navigate, isPolling]);

  useEffect(() => {
    // Redirect to comparison when audit is completed
    if (state.auditStatus === 'completed') {
      setTimeout(() => {
        navigate('/comparison');
      }, 2000);
    }
  }, [state.auditStatus, navigate]);

  const steps = [
    {
      id: 'scraping',
      icon: 'download',
      title: 'Scraping Website',
      description: 'Extracting content and structure'
    },
    {
      id: 'initialAudit',
      icon: 'search',
      title: 'Initial Audit',
      description: 'Analyzing current SEO and AI-readiness'
    },
    {
      id: 'optimizing',
      icon: 'magic-wand-sparkles',
      title: 'Optimizing Code',
      description: 'Applying AI-driven improvements'
    },
    {
      id: 'finalAudit',
      icon: 'check-double',
      title: 'Final Audit',
      description: 'Validating improvements'
    }
  ];

  const getProgressPercentage = (stepId) => {
    return state.auditProgress[stepId] || 0;
  };

  return (
    <div className="screen">
      <div className="container">
                  <div className="processing-header">
            <h1>Improving Website</h1>
            <p>Processing {state.currentDomain}...</p>
          {jobStatus && (
            <div className="job-status">
              <span className={`status-badge status-${jobStatus.status}`}>
                {jobStatus.status}
              </span>
              {jobStatus.job_id && (
                <span className="job-id">Job ID: {jobStatus.job_id}</span>
              )}
            </div>
          )}
        </div>
        
        {/* Overall Job Progress */}
        {jobStatus && jobStatus.progress && (
          <div className="overall-progress">
            <h3>Overall Progress</h3>
            <div className="progress-container-large">
              <div className="progress-bar-large">
                <div 
                  className="progress-fill-large"
                  style={{ width: `${jobStatus.progress}%` }}
                ></div>
              </div>
              <span className="progress-text-large">{jobStatus.progress}%</span>
            </div>
          </div>
        )}

        <div className="progress-steps">
          {steps.map((step) => {
            const status = getStepStatus(step.id);
            const progress = getProgressPercentage(step.id);
            
            return (
              <div
                key={step.id}
                className={`step ${status === 'active' ? 'active' : ''}`}
              >
                <div className="step-icon">
                  <FontAwesomeIcon icon={step.icon} />
                </div>
                <div className="step-content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Job Statistics */}
        {jobStatus && (
          <div className="job-statistics">
            <h3>Job Statistics</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-number">
                  {jobStatus.stats?.pages_scraped || 
                   (jobStatus.status === 'completed' && !jobStatus.stats?.pages_scraped ? 'Loading...' : '0')}
                </span>
                <span className="stat-label">Pages Scraped</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">
                  {jobStatus.stats?.assets_downloaded || 
                   (jobStatus.status === 'completed' && !jobStatus.stats?.assets_downloaded ? 'Loading...' : '0')}
                </span>
                <span className="stat-label">Assets Downloaded</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">
                  {jobStatus.stats?.total_urls || 
                   (jobStatus.status === 'completed' && !jobStatus.stats?.total_urls ? 'Loading...' : '0')}
                </span>
                <span className="stat-label">Total URLs</span>
              </div>
              {jobStatus.stats?.errors_count > 0 && (
                <div className="stat-card error">
                  <span className="stat-number">{jobStatus.stats.errors_count}</span>
                  <span className="stat-label">Errors</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="estimated-time">
          <p>Estimated completion: <span>3-5 minutes</span></p>
        </div>
      </div>
    </div>
  );
};

export default ProcessingScreen;
