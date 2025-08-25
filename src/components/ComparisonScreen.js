import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useApp } from '../context/AppContext';
import { useDownload } from '../hooks/useAudit';
import apiService from '../services/api';

const ComparisonScreen = () => {
  const { state } = useApp();
  const { exportToPDF } = useDownload();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [comparisonData, setComparisonData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [faviconUrl, setFaviconUrl] = useState(null);
  const [faviconLoading, setFaviconLoading] = useState(false);
  const [expandedImprovements, setExpandedImprovements] = useState(false);

  // Helper function to fetch favicon URL
  const getFaviconUrl = (domain) => {
    if (!domain || domain === 'Unknown Domain') return null;
    
    // Clean the domain to get just the hostname
    let cleanDomain = domain;
    try {
      // Remove protocol if present
      cleanDomain = domain.replace(/^https?:\/\//, '');
      // Remove www. if present
      cleanDomain = cleanDomain.replace(/^www\./, '');
      // Remove trailing slash and path
      cleanDomain = cleanDomain.split('/')[0];
      
      // Use DuckDuckGo's favicon service which works better with HTTPS and Netlify
      return `https://icons.duckduckgo.com/ip3/${cleanDomain}.ico`;
    } catch (error) {
      console.error('Error processing domain for favicon:', error);
      return null;
    }
  };

  // Handle favicon load error with multiple fallbacks
  const handleFaviconError = (e, domain) => {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    const currentSrc = e.target.src;
    
    // Fallback chain: DuckDuckGo -> Google -> Direct domain -> Hide
    if (currentSrc.includes('duckduckgo.com')) {
      // Try Google's favicon service
      e.target.src = `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=48`;
    } else if (currentSrc.includes('google.com')) {
      // Try direct domain favicon
      e.target.src = `https://${cleanDomain}/favicon.ico`;
    } else {
      // If all services fail, remove the favicon URL to show placeholder
      setFaviconLoading(false);
      setFaviconUrl(null);
    }
  };

  // Handle successful favicon load
  const handleFaviconLoad = () => {
    setFaviconLoading(false);
  };

  // Load favicon when comparison data changes
  useEffect(() => {
    if (comparisonData?.domain) {
      setFaviconLoading(true);
      const favicon = getFaviconUrl(comparisonData.domain);
      setFaviconUrl(favicon);
    }
  }, [comparisonData]);

  // Get data from navigation state or fetch from API
  useEffect(() => {
    const loadComparisonData = async () => {
      try {
        if (location.state?.currentReport && location.state?.newReport) {
          // Use data passed from navigation
          try {
            setIsLoading(true);
            setError(null);
            
            // Check if we have complete job details, if not fetch them
            let jobDetails = location.state.jobDetails;
            if (location.state.jobId && (!jobDetails || !jobDetails.detailed_improvements)) {

              jobDetails = await apiService.getJobDetails(location.state.jobId);
            }
            
            const data = createComparisonData(
              location.state.domain || 'Unknown Domain',
              location.state.currentReport,
              location.state.newReport,
              jobDetails
            );
            setComparisonData(data);
          } catch (error) {
            console.error('Error creating comparison data from navigation state:', error);
            setError('Failed to load comparison data from navigation state');
          } finally {
            setIsLoading(false);
          }
        } else if (location.state?.jobId) {
          // Fetch data from API using job ID
          try {
            setIsLoading(true);
            setError(null);
            
            const jobDetails = await apiService.getJobDetails(location.state.jobId);
            
            if (jobDetails && jobDetails.stats && jobDetails.stats.current_report && jobDetails.stats.new_report) {
              const data = createComparisonData(
                location.state.domain || jobDetails.domain || 'Unknown Domain',
                jobDetails.stats.current_report,
                jobDetails.stats.new_report,
                jobDetails
              );
              setComparisonData(data);
            } else {
              setError('Both current and new reports are required for comparison');
            }
          } catch (error) {
            console.error('Error fetching comparison data:', error);
            setError('Failed to load comparison data');
          } finally {
            setIsLoading(false);
          }
        } else {
          // No data available - show job selection interface
          setError(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Unexpected error in loadComparisonData:', error);
        setError('An unexpected error occurred');
        setIsLoading(false);
      }
    };

    loadComparisonData();
  }, [location.state]);

  // Load available jobs for selection
  const [availableJobs, setAvailableJobs] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  useEffect(() => {
    const loadAvailableJobs = async () => {
      if (!comparisonData && !isLoading && !error) {
        try {
          setIsLoadingJobs(true);
          const response = await apiService.getAllJobs();
          if (response && response.jobs) {
            // Filter jobs that have both current_report and new_report
            const comparableJobs = response.jobs.filter(job => 
              job && 
              job.stats && 
              job.stats.current_report && 
              job.stats.new_report &&
              job.status === 'completed'
            );
            setAvailableJobs(comparableJobs);
          } else {
            setAvailableJobs([]);
          }
        } catch (error) {
          console.error('Error loading available jobs:', error);
          setAvailableJobs([]);
        } finally {
          setIsLoadingJobs(false);
        }
      }
    };

    loadAvailableJobs();
  }, [comparisonData, isLoading, error]);

  const handleJobSelection = async (jobId) => {
    if (!jobId) {
      setError('Invalid job ID');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const jobDetails = await apiService.getJobDetails(jobId);
      
      if (jobDetails && jobDetails.stats && jobDetails.stats.current_report && jobDetails.stats.new_report) {
        const data = createComparisonData(
          jobDetails.domain || 'Unknown Domain',
          jobDetails.stats.current_report,
          jobDetails.stats.new_report,
          jobDetails
        );
        setComparisonData(data);
      } else {
        setError('Both current and new reports are required for comparison');
      }
    } catch (error) {
      console.error('Error fetching comparison data:', error);
      setError('Failed to load comparison data');
    } finally {
      setIsLoading(false);
    }
  };

  // Create comparison data from two reports
  const createComparisonData = (domain, currentReport, newReport, jobDetails = null) => {
    // Add null checks
    if (!currentReport || !newReport) {
      throw new Error('Both current and new reports are required');
    }
    

    
    const currentScore = currentReport.llm_readiness_score || 0;
    const newScore = newReport.llm_readiness_score || 0;
    
    // Simple percentage difference (not relative improvement)
    const currentPercentage = currentScore;
    const newPercentage = newScore;
    const improvement = newPercentage - currentPercentage;
    
    const data = {
      domain: domain || 'example.com',
      scanDate: new Date().toLocaleDateString(),
      
      // Overall improvement summary
      overall: {
        before: { 
          score: Number(currentPercentage.toFixed(2)), 
          grade: currentReport.letter_grade || 'N/A', 
          description: currentReport.letter_grade_descriptive || 'No description available' 
        },
        after: { 
          score: Number(newPercentage.toFixed(2)), 
          grade: newReport.letter_grade || 'N/A', 
          description: newReport.letter_grade_descriptive || 'No description available' 
        },
        improvement: improvement >= 0 ? `+${improvement.toFixed(2)}%` : `${improvement.toFixed(2)}%`
      },
      
      // Category comparisons based on actual report data
      categories: createCategoryComparisons(currentReport, newReport),
      
      // Issues resolution summary
      issues: createIssuesComparison(currentReport, newReport),
      
      // Key improvements summary
      keyImprovements: newReport.top_5_critical_items || [
        'Optimization completed successfully',
        'LLM readiness improved',
        'AI compatibility enhanced'
      ],
      
      // Detailed improvements with expandable information
      detailedImprovements: jobDetails?.detailed_improvements || jobDetails?.stats?.detailed_improvements || [],
      
      // Netlify deployment URLs
      deploymentUrls: {
        before: jobDetails?.stats?.netlify_site?.url || null,
        after: jobDetails?.stats?.optimized_netlify_site?.url || null
      },
      
      // GitHub repository URLs
      githubUrls: {
        before: jobDetails?.stats?.github_repository?.url || null,
        after: jobDetails?.stats?.optimized_github_repository?.url || null
      }
    };
    

    
    return data;
  };

  // Create category comparisons from actual report data
  const createCategoryComparisons = (currentReport, newReport) => {
    const categories = {};
    
    // Add null checks
    if (!currentReport?.categories || !newReport?.categories) {
      return categories;
    }
    
    // Process current report categories
    currentReport.categories.forEach((category, index) => {
      const newCategory = newReport.categories[index];
      if (newCategory && category) {
        const currentScore = category.score || 0;
        const currentMaxScore = category.max_score || 100;
        const newScore = newCategory.score || 0;
        const newMaxScore = newCategory.max_score || 100;
        
        // Calculate percentages
        const currentPercentage = currentMaxScore > 0 ? (currentScore / currentMaxScore) * 100 : 0;
        const newPercentage = newMaxScore > 0 ? (newScore / newMaxScore) * 100 : 0;
        
        // Simple percentage difference (not relative improvement)
        const improvement = newPercentage - currentPercentage;
        
        categories[category.name || `Category ${index + 1}`] = {
          before: { 
            score: Number(currentPercentage.toFixed(2)), 
            rawScore: currentScore,
            maxScore: currentMaxScore,
            status: getScoreStatus(currentPercentage) 
          },
          after: { 
            score: Number(newPercentage.toFixed(2)), 
            rawScore: newScore,
            maxScore: newMaxScore,
            status: getScoreStatus(newPercentage) 
          },
          improvement: improvement >= 0 ? `+${improvement.toFixed(2)}%` : `${improvement.toFixed(2)}%`,
          metrics: createMetricsComparison(category, newCategory)
        };
      }
    });
    
    return categories;
  };

  // Create metrics comparison
  const createMetricsComparison = (currentCategory, newCategory) => {
    const metrics = {};
    
    // Add null checks
    if (!currentCategory?.metrics || !newCategory?.metrics) {
      return metrics;
    }
    
    currentCategory.metrics.forEach((metric, index) => {
      const newMetric = newCategory.metrics[index];
      if (newMetric && metric) {
        const currentScore = metric.score || 0;
        const currentMaxScore = metric.max_score || 100;
        const newScore = newMetric.score || 0;
        const newMaxScore = newMetric.max_score || 100;
        
        // Calculate percentages
        const currentPercentage = currentMaxScore > 0 ? (currentScore / currentMaxScore) * 100 : 0;
        const newPercentage = newMaxScore > 0 ? (newScore / newMaxScore) * 100 : 0;
        
        // Simple percentage difference (not relative improvement)
        const improvement = newPercentage - currentPercentage;
        
        metrics[metric.name || `Metric ${index + 1}`] = {
          before: Number(currentPercentage.toFixed(2)),
          rawBefore: currentScore,
          maxBefore: currentMaxScore,
          after: Number(newPercentage.toFixed(2)),
          rawAfter: newScore,
          maxAfter: newMaxScore,
          improvement: improvement >= 0 ? `+${improvement.toFixed(2)}%` : `${improvement.toFixed(2)}%`
        };
      }
    });
    
    return metrics;
  };

  // Create issues comparison
  const createIssuesComparison = (currentReport, newReport) => {
    // Add null checks
    if (!currentReport || !newReport) {
      return {
        before: { critical: 0, moderate: 0, minor: 0, total: 0 },
        after: { critical: 0, moderate: 0, minor: 0, total: 0 },
        resolved: 0,
        resolutionRate: '0.00%'
      };
    }
    
    const currentCritical = currentReport.top_5_critical_items?.length || 0;
    const newCritical = newReport.top_5_critical_items?.length || 0;
    const currentWarnings = currentReport.top_5_warnings?.length || 0;
    const newWarnings = newReport.top_5_warnings?.length || 0;
    
    const totalBefore = currentCritical + currentWarnings;
    const totalAfter = newCritical + newWarnings;
    const resolved = totalBefore - totalAfter;
    
    return {
      before: { 
        critical: currentCritical, 
        moderate: currentWarnings, 
        minor: 0, 
        total: totalBefore 
      },
      after: { 
        critical: newCritical, 
        moderate: newWarnings, 
        minor: 0, 
        total: totalAfter 
      },
      resolved: resolved > 0 ? resolved : 0,
      resolutionRate: totalBefore > 0 ? `${((resolved / totalBefore) * 100).toFixed(2)}%` : '0.00%'
    };
  };

  // Helper function to get grade color
  const getGradeColor = (grade) => {
    if (!grade) return 'grade-default';
    
    const gradeUpper = grade.toString().toUpperCase();
    if (gradeUpper === 'A') return 'grade-a';
    if (gradeUpper === 'B') return 'grade-b';
    if (gradeUpper === 'C') return 'grade-c';
    if (gradeUpper === 'D') return 'grade-d';
    if (gradeUpper === 'F') return 'grade-f';
    return 'grade-default';
  };

  // Helper function to get score color
  const getScoreColor = (score) => {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'fair';
    if (score >= 60) return 'poor';
    return 'very-poor';
  };

  // Helper function to get score status
  const getScoreStatus = (score) => {
    if (score >= 80) return 'passed';
    return 'partial';
  };

  const handleDownload = () => {
    if (!comparisonData) return;
    
    const filename = `${comparisonData.domain}-comparison-${new Date().toISOString().split('T')[0]}`;
    exportToPDF(comparisonData, filename);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'excellent': return 'excellent';
      case 'good': return 'good';
      case 'fair': return 'fair';
      case 'poor': return 'poor';
      default: return 'fair';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="screen">
        <div className="container">
          <div className="loading-state">
            <FontAwesomeIcon icon="spinner" spin size="2x" />
            <h2>Loading Comparison Data...</h2>
            <p>Please wait while we prepare your optimization comparison report.</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="screen">
        <div className="container">
          <div className="error-state">
            <FontAwesomeIcon icon="exclamation-triangle" size="2x" />
            <h2>Error Loading Comparison</h2>
            <p>{error}</p>
            <div className="error-actions">
              <button className="btn-primary" onClick={() => window.location.reload()}>
                Refresh Page
              </button>
              <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Job selection state (when no comparison data is available)
  if (!comparisonData && !isLoading && !isLoadingJobs) {
    return (
      <div className="screen">
        <div className="container">
          <div className="job-selection-state">
            <div className="selection-header">
              <FontAwesomeIcon icon="chart-line" size="2x" />
              <h2>Select a Job for Comparison</h2>
              <p>Choose a completed job with optimization results to view the comparison</p>
            </div>
            {availableJobs.length > 0 ? (
              <div className="jobs-selection-grid">
                {availableJobs.map((job) => {
                  // Safety check for job data
                  if (!job || !job.job_id || !job.stats) {
                    return null;
                  }
                  
                  const currentScore = job.stats.current_report?.llm_readiness_score || 0;
                  const newScore = job.stats.new_report?.llm_readiness_score || 0;
                  
                  return (
                    <div key={job.job_id} className="job-selection-card" onClick={() => handleJobSelection(job.job_id)}>
                      <div className="job-selection-info">
                        <h3>{job.domain || 'Unknown Domain'}</h3>
                        <p className="job-date">
                          {new Date(job.created_at || job.timestamp || Date.now()).toLocaleDateString()}
                        </p>
                        <div className="job-scores">
                          <div className="score-item">
                            <span className="score-label">Before:</span>
                            <span className="score-value">
                              {Number((job.stats.current_report?.llm_readiness_score || 0).toFixed(2))}%
                            </span>
                          </div>
                          <div className="score-item">
                            <span className="score-label">After:</span>
                            <span className="score-value improved">
                              {Number((job.stats.new_report?.llm_readiness_score || 0).toFixed(2))}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="job-selection-action">
                        <FontAwesomeIcon icon="arrow-right" />
                        <span>View Comparison</span>
                      </div>
                    </div>
                  );
                }).filter(Boolean)} {/* Remove any null entries */}
              </div>
            ) : (
              <div className="no-comparable-jobs">
                <FontAwesomeIcon icon="info-circle" size="2x" />
                <h3>No Comparable Jobs Available</h3>
                <p>You need completed jobs with optimization results to view comparisons.</p>
                <div className="action-buttons">
                  <button
                    className="btn-primary"
                    onClick={() => navigate('/dashboard')}
                  >
                    Go to Dashboard
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => window.location.reload()}
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Safety check - ensure comparisonData exists before rendering
  if (!comparisonData) {
    return (
      <div className="screen">
        <div className="container">
          <div className="loading-state">
            <FontAwesomeIcon icon="spinner" spin size="2x" />
            <h2>Preparing Comparison...</h2>
            <p>Please wait while we load your comparison data.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="container">
        <div className="comparison-header">
          <h1>LLM Discovery Optimization Audit Report</h1>
          <div className="domain-info">
            <div className="website-header">
              {faviconUrl ? (
                <img 
                  src={faviconUrl} 
                  alt="Website favicon" 
                  className={`website-favicon ${faviconLoading ? 'loading' : ''}`}
                  onLoad={handleFaviconLoad}
                  onError={(e) => handleFaviconError(e, comparisonData?.domain)}
                />
              ) : (
                <div className="website-favicon-placeholder">
                  <FontAwesomeIcon icon="globe" />
                </div>
              )}
              <h2>Website: {comparisonData?.domain || 'Unknown Domain'}</h2>
            </div>
            <p className="scan-date">Comparison generated on {comparisonData?.scanDate || 'Unknown Date'}</p>
            <div className="overall-improvement">
              <span className="improvement-label">Overall Improvement</span>
              <span className="improvement-value">
                {comparisonData?.overall?.improvement || 'No data available'}
              </span>
            </div>
          </div>
        </div>

        {/* Overall Score Comparison */}
        <div className="overall-comparison">
          <div className="overall-card">
            <h3>Overall LLM Readiness</h3>
            <div className="score-comparison-large">
              <div className="score-before">
                <div className={`grade-badge ${getGradeColor(comparisonData?.overall?.before?.grade || 'N/A')}`}>
                  {comparisonData?.overall?.before?.grade || 'N/A'}
                </div>
                <div className="score-value">{comparisonData?.overall?.before?.score || 0}/100</div>
                <div className="score-description">{comparisonData?.overall?.before?.description || 'No description available'}</div>

                {comparisonData?.deploymentUrls?.before && (
                  <div className="deployment-link">
                    <a 
                      href={comparisonData.deploymentUrls.before} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="deployment-btn before"
                    >
                      <FontAwesomeIcon icon="external-link-alt" />
                      View Original Site
                    </a>
                  </div>
                )}
              </div>
              
              <div className="improvement-arrow">
                <FontAwesomeIcon icon="arrow-right" />
                <span className="improvement-text">{comparisonData?.overall?.improvement || 'No data available'}</span>
              </div>
              
              <div className="score-after">
                <div className={`grade-badge ${getGradeColor(comparisonData?.overall?.after?.grade || 'N/A')}`}>
                  {comparisonData?.overall?.after?.grade || 'N/A'}
                </div>
                <div className="score-value">{comparisonData?.overall?.after?.score || 0}/100</div>
                <div className="score-description">{comparisonData?.overall?.after?.description || 'No description available'}</div>
                {comparisonData?.deploymentUrls?.after && (
                  <div className="deployment-link">
                    <a 
                      href={comparisonData.deploymentUrls.after} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="deployment-btn after"
                    >
                      <FontAwesomeIcon icon="external-link-alt" />
                      View Optimized Site
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <h3>Issues Resolved</h3>
            <div className="summary-stat">
              <span className="stat-number">{comparisonData?.issues?.resolved || 0}</span>
              <span className="stat-label">out of {comparisonData?.issues?.before?.total || 0}</span>
            </div>
            <div className="stat-percentage">
              {comparisonData?.issues?.resolutionRate || '0%'} Success Rate
            </div>
          </div>
          
          <div className="summary-card">
            <h3>Biggest Improvement</h3>
            <div className="summary-stat">
              <span className="stat-number">
                {comparisonData?.categories ? 
                  Object.values(comparisonData.categories).reduce((max, category) => {
                    if (!category?.improvement) return max;
                    // Extract the percentage difference (remove + or - and %)
                    const improvement = parseFloat(category.improvement.replace(/[^\d.-]/g, ''));
                    return isNaN(improvement) ? max : (Math.abs(improvement) > Math.abs(max) ? improvement : max);
                  }, 0).toFixed(2) : '0.00'
                }%
              </span>
              <span className="stat-label">improvement</span>
            </div>
            <div className="stat-percentage">
              Best Category Improvement
            </div>
          </div>
          
          <div className="summary-card">
            <h3>Critical Issues</h3>
            <div className="summary-stat">
              <span className="stat-number">{comparisonData?.issues?.before?.critical || 0}</span>
              <span className="stat-label">→ {comparisonData?.issues?.after?.critical || 0}</span>
            </div>
            <div className="stat-percentage">
              {(comparisonData?.issues?.before?.critical || 0) - (comparisonData?.issues?.after?.critical || 0)} Critical Issues Fixed
            </div>
          </div>
        </div>
        
        {/* Category Comparisons */}
        <div className="category-comparisons">
          <h2>Category Scores</h2>
          {comparisonData?.categories ? 
            Object.entries(comparisonData.categories).map(([categoryName, categoryData]) => {
              if (!categoryData) return null;
              return (
                <div key={categoryName} className="category-comparison-card">
                  <div className="category-header">
                    <h3>{categoryName}</h3>
                    <div className="category-improvement">
                      {categoryData.improvement || 'No improvement data'}
                    </div>
                  </div>
                  <div className="progress-comparison">
                    <div className="progress-before">
                      <span className="progress-label">Before</span>
                      <div className="progress-bar-category">
                        <div
                          className="progress-fill-category"
                          style={{
                            width: `${(categoryData.before?.score || 0)}%`,
                            backgroundColor: getScoreColor(categoryData.before?.score || 0) === 'excellent' ? '#28a745' :
                                           getScoreColor(categoryData.before?.score || 0) === 'good' ? '#17a2b8' :
                                           getScoreColor(categoryData.before?.score || 0) === 'fair' ? '#ffc107' : '#dc3545'
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="progress-after">
                      <span className="progress-label">After</span>
                      <div className="progress-bar-category">
                        <div
                          className="progress-fill-category"
                          style={{
                            width: `${(categoryData.after?.score || 0)}%`,
                            backgroundColor: getScoreColor(categoryData.after?.score || 0) === 'excellent' ? '#28a745' :
                                           getScoreColor(categoryData.after?.score || 0) === 'good' ? '#17a2b8' :
                                           getScoreColor(categoryData.after?.score || 0) === 'fair' ? '#ffc107' : '#dc3545'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Metrics breakdown */}
                  {categoryData.metrics && Object.keys(categoryData.metrics).length > 0 && (
                    <div className="metrics-breakdown">
                      <h4>Metrics Breakdown</h4>
                      <div className="metrics-grid">
                        {Object.entries(categoryData.metrics).map(([metricName, metricData]) => {
                          if (!metricData) return null;
                          return (
                            <div key={metricName} className="metric-item">
                              <div className="metric-name">{metricName}</div>
                              <div className="metric-comparison">
                                <span className="metric-before">{metricData.before || 0}%</span>
                                <span className="metric-arrow">→</span>
                                <span className="metric-after">{metricData.after || 0}%</span>
                                <span className="metric-improvement">{metricData.improvement || 'No change'}</span>
                              </div>
                            </div>
                          );
                        }).filter(Boolean)}
                      </div>
                    </div>
                  )}
                </div>
              );
            }).filter(Boolean) : (
              <div className="no-categories">
                <p>No category data available for comparison.</p>
              </div>
            )
          }
        </div>
        
        {/* Key Improvements Section */}
        {comparisonData?.keyImprovements && comparisonData.keyImprovements.length > 0 && (
          <div className="key-improvements-section">
            <div className="improvements-header">
              <h2>Key Improvements</h2>

              {comparisonData?.detailedImprovements && comparisonData.detailedImprovements.length > 0 && (
                <button 
                  className="expand-details-btn"
                  onClick={() => setExpandedImprovements(!expandedImprovements)}
                >
                  <FontAwesomeIcon 
                    icon={expandedImprovements ? "chevron-up" : "chevron-down"} 
                    className="expand-icon" 
                  />
                  {expandedImprovements ? 'Hide Details' : 'Show Details'}
                </button>
              )}
            </div>
            
            <div className="improvements-list">
              {comparisonData.keyImprovements.map((improvement, index) => (
                <div key={index} className="improvement-item">
                  <FontAwesomeIcon icon="check-circle" className="improvement-icon" />
                  <span>{improvement}</span>
                </div>
              ))}
            </div>
            
            {/* Detailed Improvements - Expandable */}
            {expandedImprovements && comparisonData?.detailedImprovements && comparisonData.detailedImprovements.length > 0 && (
              <div className="detailed-improvements">
                <h3>Detailed Implementation Information</h3>
                {comparisonData.detailedImprovements.map((detail, detailIndex) => (
                  <div key={detailIndex} className="detail-group">
                    <div className="detail-timestamp">
                      <FontAwesomeIcon icon="clock" />
                      {new Date(detail.timestamp).toLocaleString()}
                    </div>
                    {Object.entries(detail.improvements || {}).map(([key, improvement]) => (
                      <div key={key} className="detail-item">
                        <h4 className="detail-title">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                        <p className="detail-description">{improvement.description}</p>
                        <div className="detail-files">
                          <FontAwesomeIcon icon="file-code" />
                          <span>Files modified: {improvement.files_modified?.length || 0}</span>
                          {improvement.lines_added > 0 && (
                            <span className="lines-added">+{improvement.lines_added} lines</span>
                          )}
                          {improvement.lines_removed > 0 && (
                            <span className="lines-removed">-{improvement.lines_removed} lines</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Summary Section */}
        <div className="comparison-summary">
          <h2>Summary</h2>
          <div className="summary-content">
            <p>
              The optimization process has improved the LLM readiness score from{' '}
              <strong>{comparisonData?.overall?.before?.score || 0}%</strong> to{' '}
              <strong>{comparisonData?.overall?.after?.score || 0}%</strong>, 
              representing a <strong>{comparisonData?.overall?.improvement || '0%'}</strong> improvement.
            </p>
            <p>
              This optimization has enhanced the website's compatibility with Large Language Models, 
              improving AI discovery and interaction capabilities.
            </p>
          </div>
        </div>
        
        <div className="action-buttons">
          <button 
            className="btn-secondary"
            onClick={() => navigate('/insights')}
          >
            View Insights
          </button>
          <button 
            className="btn-secondary"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
          <button 
            className="btn-primary"
            onClick={handleDownload}
          >
            <FontAwesomeIcon icon="download" />
            Download Comparison
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComparisonScreen;
