import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useApp } from '../context/AppContext';
import apiService from '../services/api';

const CompetitionAnalysisScreen = () => {
  const { showNotification } = useApp();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(null);
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [historicalAnalyses, setHistoricalAnalyses] = useState([]);
  const [formData, setFormData] = useState({
    domain: '',
    brand_name: ''
  });

  // Load initial data
  useEffect(() => {
    loadLatestAnalysis();
    loadHistoricalAnalyses();
  }, []);

  const loadLatestAnalysis = async () => {
    try {
      // Prefer persisted latest analysis if present
      const persisted = localStorage.getItem('latest_competition_analysis');
      if (persisted) {
        try {
          const parsed = JSON.parse(persisted);
          setLatestAnalysis(parsed);
          return;
        } catch (_) {}
      }
      // Fallback to API previous endpoint
      const analysis = await apiService.getLatestCompetitionAnalysis();
      if (analysis) setLatestAnalysis(analysis);
    } catch (error) {
      console.error('Error loading latest analysis:', error);
    }
  };

  const loadHistoricalAnalyses = async () => {
    try {
      const response = await apiService.getAllCompetitionAnalyses();
      const analyses = Array.isArray(response?.analyses) ? response.analyses : (Array.isArray(response) ? response : []);
      const normalized = analyses.map(a => ({
        analysis_id: a.analysis_id,
        timestamp: a.timestamp,
        brand: a.brand,
        domain: a.domain,
        summary: {
          accuracy_percent: a.analysis?.summary?.accuracy_percent ?? a.summary?.accuracy_percent ?? 0,
          competitor_count: Array.isArray(a.competitor_analyses) ? a.competitor_analyses.length : (a.summary?.competitor_count ?? 0)
        },
        // keep full object for "View"
        _full: a
      }));
      setHistoricalAnalyses(normalized);
    } catch (error) {
      console.error('Error loading historical analyses:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStartAnalysis = async () => {
    if (!formData.domain || !formData.brand_name) {
      showNotification('Please enter both domain and brand name', 'error');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress({
      stage: 'initializing',
      message: 'Starting competition analysis...',
      competitorsFound: 0,
      scrapingProgress: 0,
      analysisProgress: 0,
      estimatedTime: null
    });

    try {
      // Call the Competition Analysis endpoint with the required payload shape
      const response = await apiService.startCompetitionAnalysis({
        domain: formData.domain,
        brand_name: formData.brand_name
      });

      // Immediately show results from API
      if (response) {
        setLatestAnalysis(response);
        try { localStorage.setItem('latest_competition_analysis', JSON.stringify(response)); } catch (_) {}
        setIsAnalyzing(false);
        setAnalysisProgress(null);
        showNotification('Competition analysis completed successfully!', 'success');
      }
      
    } catch (error) {
      console.error('Error starting analysis:', error);
      showNotification(`Error starting analysis: ${error.message}`, 'error');
      setIsAnalyzing(false);
      setAnalysisProgress(null);
    }
  };

  const simulateProgress = (analysisId) => {
    // This would be replaced with real progress tracking via WebSocket or polling
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      
      if (progress < 30) {
        setAnalysisProgress(prev => ({
          ...prev,
          stage: 'discovering',
          message: 'Discovering competitors...',
          competitorsFound: Math.min(5, Math.floor(progress / 6)),
          estimatedTime: '3-5 minutes'
        }));
      } else if (progress < 70) {
        setAnalysisProgress(prev => ({
          ...prev,
          stage: 'scraping',
          message: 'Scraping competitor websites...',
          scrapingProgress: Math.min(100, progress),
          estimatedTime: '2-3 minutes'
        }));
      } else if (progress < 95) {
        setAnalysisProgress(prev => ({
          ...prev,
          stage: 'analyzing',
          message: 'Analyzing with AI...',
          analysisProgress: Math.min(100, progress),
          estimatedTime: '1-2 minutes'
        }));
      } else {
        clearInterval(interval);
        setAnalysisProgress(prev => ({
          ...prev,
          stage: 'completed',
          message: 'Analysis completed!',
          analysisProgress: 100
        }));
        
        setTimeout(() => {
          setIsAnalyzing(false);
          setAnalysisProgress(null);
          loadLatestAnalysis();
          loadHistoricalAnalyses();
          showNotification('Competition analysis completed successfully!', 'success');
        }, 1000);
      }
    }, 1000);
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return 'success';
    if (accuracy >= 60) return 'warning';
    return 'error';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewAnalysis = (row) => {
    const data = row?._full || row;
    if (data) {
      setLatestAnalysis(data);
      // scroll to latest analysis section
      setTimeout(() => {
        const el = document.querySelector('.analysis-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  const handleExportAnalysis = (row) => {
    const data = row?._full || row;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `competition-analysis-${data.brand}-${new Date(data.timestamp).toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="competition-analysis-screen">
      <div className="container">
        <div className="screen-header">
          <h1>
            <FontAwesomeIcon icon="balance-scale" />
            Competition Analysis
          </h1>
          <p>Analyze your brand against top competitors using AI-powered insights</p>
        </div>

        {/* New Analysis Section */}
        <section className="analysis-section">
          <div className="section-header">
            <h2>Start New Competition Analysis</h2>
          </div>
          
          <div className="analysis-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="domain">Domain</label>
                <input
                  type="text"
                  id="domain"
                  name="domain"
                  value={formData.domain}
                  onChange={handleInputChange}
                  placeholder="e.g., infosys.com"
                  disabled={isAnalyzing}
                />
              </div>
              <div className="form-group">
                <label htmlFor="brand_name">Brand Name</label>
                <input
                  type="text"
                  id="brand_name"
                  name="brand_name"
                  value={formData.brand_name}
                  onChange={handleInputChange}
                  placeholder="e.g., Infosys"
                  disabled={isAnalyzing}
                />
              </div>
              <div className="form-group">
                <button
                  className="btn btn-primary"
                  onClick={handleStartAnalysis}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <FontAwesomeIcon icon="spinner" spin />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon="search" />
                      Start Analysis
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Progress Display */}
            {analysisProgress && (
              <div className="analysis-progress">
                <div className="progress-header">
                  <h3>{analysisProgress.message}</h3>
                  {analysisProgress.estimatedTime && (
                    <span className="estimated-time">
                      <FontAwesomeIcon icon="clock" />
                      {analysisProgress.estimatedTime}
                    </span>
                  )}
                </div>
                
                <div className="progress-stats">
                  {analysisProgress.competitorsFound > 0 && (
                    <div className="progress-stat">
                      <FontAwesomeIcon icon="users" />
                      <span>{analysisProgress.competitorsFound} competitors found</span>
                    </div>
                  )}
                  
                  {analysisProgress.scrapingProgress > 0 && (
                    <div className="progress-stat">
                      <FontAwesomeIcon icon="globe" />
                      <span>Scraping: {Math.round(analysisProgress.scrapingProgress)}%</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${analysisProgress.scrapingProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {analysisProgress.analysisProgress > 0 && (
                    <div className="progress-stat">
                      <FontAwesomeIcon icon="robot" />
                      <span>Analysis: {Math.round(analysisProgress.analysisProgress)}%</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${analysisProgress.analysisProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Latest Analysis Section */}
        {latestAnalysis && (
          <section className="analysis-section">
            <div className="section-header">
              <h2>Latest Competition Analysis</h2>
              <span className="analysis-date">{formatDate(latestAnalysis.timestamp)}</span>
            </div>

            {/* Main Brand Summary */}
            <div className="brand-summary-card">
              <div className="brand-info">
                <h3>{latestAnalysis.brand}</h3>
                <span className="domain">{latestAnalysis.domain}</span>
                <span className="analysis-timestamp">
                  <FontAwesomeIcon icon="calendar" />
                  {formatDate(latestAnalysis.timestamp)}
                </span>
              </div>
              
              <div className="accuracy-score">
                <div className={`score-circle ${getAccuracyColor(latestAnalysis.analysis.summary.accuracy_percent)}`}>
                  <span className="score">{latestAnalysis.analysis.summary.accuracy_percent}%</span>
                  <span className="label">Accuracy</span>
                </div>
              </div>
              
              <div className="answer-distribution">
                <div className="distribution-item success">
                  <FontAwesomeIcon icon="check-circle" />
                  <span>{latestAnalysis.analysis.summary.correct} Correct</span>
                </div>
                <div className="distribution-item warning">
                  <FontAwesomeIcon icon="exclamation-triangle" />
                  <span>{latestAnalysis.analysis.summary.partially_correct} Partial</span>
                </div>
                <div className="distribution-item error">
                  <FontAwesomeIcon icon="times-circle" />
                  <span>{latestAnalysis.analysis.summary.incorrect} Incorrect</span>
                </div>
              </div>
            </div>

            {/* Competition Comparison Table */}
            <div className="competition-table-section">
              <h3>Competition Comparison</h3>
              <div className="competition-table-wrapper">
                <table className="competition-table">
                  <thead>
                    <tr>
                      <th>Brand</th>
                      <th>Overall Score</th>
                      <th>Correct</th>
                      <th>Partial</th>
                      <th>Incorrect</th>
                      <th>Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Main Brand Row */}
                    <tr className="main-brand-row">
                      <td>
                        <div className="brand-cell-content">
                          <strong>{latestAnalysis.brand}</strong>
                          <span className="domain-text">{latestAnalysis.domain}</span>
                        </div>
                      </td>
                      <td>
                        <div className={`score-badge ${getAccuracyColor(latestAnalysis.analysis.summary.accuracy_percent)}`}>
                          {latestAnalysis.analysis.summary.accuracy_percent}%
                        </div>
                      </td>
                      <td>
                        <div className="metric-cell success">
                          <FontAwesomeIcon icon="check-circle" />
                          {latestAnalysis.analysis.summary.correct}
                        </div>
                      </td>
                      <td>
                        <div className="metric-cell warning">
                          <FontAwesomeIcon icon="exclamation-triangle" />
                          {latestAnalysis.analysis.summary.partially_correct}
                        </div>
                      </td>
                      <td>
                        <div className="metric-cell error">
                          <FontAwesomeIcon icon="times-circle" />
                          {latestAnalysis.analysis.summary.incorrect}
                        </div>
                      </td>
                      <td>
                        <span className="performance-indicator main">
                          <FontAwesomeIcon icon="star" />
                          Main Brand
                        </span>
                      </td>
                    </tr>
                    
                    {/* Competitor Rows */}
                    {latestAnalysis.competitor_analyses.map((competitor, index) => (
                      <tr key={index}>
                        <td>
                          <div className="brand-cell-content">
                            <strong>{competitor.brand}</strong>
                            <span className="domain-text">{competitor.domain}</span>
                          </div>
                        </td>
                        <td>
                          <div className={`score-badge ${getAccuracyColor(competitor.analysis.summary.accuracy_percent)}`}>
                            {competitor.analysis.summary.accuracy_percent}%
                          </div>
                        </td>
                        <td>
                          <div className="metric-cell success">
                            <FontAwesomeIcon icon="check-circle" />
                            {competitor.analysis.summary.correct}
                          </div>
                        </td>
                        <td>
                          <div className="metric-cell warning">
                            <FontAwesomeIcon icon="exclamation-triangle" />
                            {competitor.analysis.summary.partially_correct}
                          </div>
                        </td>
                        <td>
                          <div className="metric-cell error">
                            <FontAwesomeIcon icon="times-circle" />
                            {competitor.analysis.summary.incorrect}
                          </div>
                        </td>
                        <td>
                          {competitor.analysis.summary.accuracy_percent > latestAnalysis.analysis.summary.accuracy_percent ? (
                            <span className="performance-indicator better">
                              <FontAwesomeIcon icon="arrow-up" />
                              Better
                            </span>
                          ) : competitor.analysis.summary.accuracy_percent < latestAnalysis.analysis.summary.accuracy_percent ? (
                            <span className="performance-indicator worse">
                              <FontAwesomeIcon icon="arrow-down" />
                              Worse
                            </span>
                          ) : (
                            <span className="performance-indicator equal">
                              <FontAwesomeIcon icon="minus" />
                              Equal
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detailed Analysis per Brand */}
            <div className="qa-section">
              <h3>Detailed Analysis</h3>
              
              {/* Main Brand Full Q&A */}
              <div className="brand-detailed-section">
                <div className="section-header compact">
                  <h4>
                    {latestAnalysis.brand} • {latestAnalysis.domain}
                  </h4>
                  <div className={`score-badge ${getAccuracyColor(latestAnalysis.analysis.summary.accuracy_percent)}`}>
                    {latestAnalysis.analysis.summary.accuracy_percent}% Accuracy
                  </div>
                </div>
              <div className="qa-grid">
                  {latestAnalysis.analysis.answers.map((answer, index) => (
                    <div key={`main-${answer.id}-${index}`} className="qa-card">
                      <div className="qa-question-header">
                        <span className="qa-qnum">Q{answer.id}</span>
                        <h4 className="qa-title">{answer.question}</h4>
                        <div className="qa-tags">
                          {answer.category && <span className="tag">{answer.category}</span>}
                          {answer.answer_status && <span className={`tag status ${answer.answer_status}`}>{answer.answer_status}</span>}
                          {answer.confidence_label && <span className="tag subtle">{answer.confidence_label}</span>}
                        </div>
                    </div>
                    <div className="answer-section">
                      <div className="main-brand-answer">
                        <h5>{latestAnalysis.brand} Answer:</h5>
                        <p>{answer.answer}</p>
                          <div className="answer-meta">
                            {answer.evaluation && (
                            <span className={`evaluation-badge ${answer.evaluation.toLowerCase().replace(' ', '-')}`}>
                          <FontAwesomeIcon 
                            icon={answer.evaluation === 'Correct' ? 'check-circle' : 
                                  answer.evaluation === 'Partially Correct' ? 'exclamation-triangle' : 
                                  'times-circle'} 
                          />
                            <span className="badge-text">{answer.evaluation}</span>
                            </span>
                            )}
                            <span className="confidence-badge">
                              {typeof answer.confidence === 'number' ? `${answer.confidence}% confidence` : (typeof answer.evaluation_score === 'number' ? `${answer.evaluation_score}% score` : '—')}
                            </span>
                          </div>
                          {(answer.sources_used && answer.sources_used.length > 0) && (
                            <div className="sources-list">
                              <h6>Sources</h6>
                              <ul>
                                {answer.sources_used.map((s, si) => (
                                  <li key={si}>
                                    {s.source_url ? (
                                      <a href={s.source_url} target="_blank" rel="noreferrer">
                                        {s.source_type || 'source'}
                                      </a>
                                    ) : (
                                      <span>{s.source_type || 'source'}</span>
                                    )}
                                    {s.quote && <span className="source-quote"> – {s.quote.slice(0, 180)}{s.quote.length > 180 ? '…' : ''}</span>}
                                  </li>
                                ))}
                              </ul>
                        </div>
                          )}
                          {(answer.supported_claims || answer.unsupported_claims || answer.missed_evidence || answer.context_quotes_used) && (
                            <div className="evidence-details">
                              {answer.supported_claims && answer.supported_claims.length > 0 && (
                                <div className="evidence-block">
                                  <h6>Supported claims</h6>
                                  <ul>
                                    {answer.supported_claims.map((c, ci) => (<li key={ci}>{c}</li>))}
                                  </ul>
                                </div>
                              )}
                              {answer.unsupported_claims && answer.unsupported_claims.length > 0 && (
                                <div className="evidence-block">
                                  <h6>Unsupported claims</h6>
                                  <ul>
                                    {answer.unsupported_claims.map((c, ci) => (<li key={ci}>{c}</li>))}
                                  </ul>
                                </div>
                              )}
                              {answer.missed_evidence && answer.missed_evidence.length > 0 && (
                                <div className="evidence-block">
                                  <h6>Missed evidence</h6>
                                  <ul>
                                    {answer.missed_evidence.map((c, ci) => (<li key={ci}>{c}</li>))}
                                  </ul>
                                </div>
                              )}
                              {answer.context_quotes_used && answer.context_quotes_used.length > 0 && (
                                <div className="evidence-block">
                                  <h6>Context quotes</h6>
                                  <ul>
                                    {answer.context_quotes_used.map((q, qi) => (<li key={qi}>{q}</li>))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                          {answer.discoverability_analysis && (
                            <div className="discoverability-meta">
                              <h6>Discoverability</h6>
                              <div className="meta-grid">
                                {Object.entries(answer.discoverability_analysis).map(([k, v]) => (
                                  <div key={k} className="meta-item">
                                    <span className="meta-label">{k.replace(/_/g, ' ')}</span>
                                    <span className="meta-value">{String(v)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {answer.explanation && (
                            <div className="explanation-block">
                              <h6>Explanation</h6>
                              <p>{answer.explanation}</p>
                            </div>
                          )}
                          {answer.recommendation && (
                            <div className="recommendation-block">
                              <h6>Recommendation</h6>
                              <span className={`recommendation-badge ${answer.recommendation.toLowerCase()}`}>
                                {answer.recommendation}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                        </div>
                      </div>
                      
              {/* Competitors Full Q&A */}
              {latestAnalysis.competitor_analyses.map((competitor, cIdx) => (
                <div key={`comp-block-${cIdx}`} className="brand-detailed-section">
                  <div className="section-header compact">
                    <h4>
                      {competitor.brand} • {competitor.domain}
                    </h4>
                    <div className={`score-badge ${getAccuracyColor(competitor.analysis.summary.accuracy_percent)}`}>
                      {competitor.analysis.summary.accuracy_percent}% Accuracy
                    </div>
                  </div>
                  <div className="qa-grid">
                    {competitor.analysis.answers.map((answer, index) => (
                      <div key={`comp-${cIdx}-${answer.id}-${index}`} className="qa-card">
                        <div className="qa-question-header">
                          <span className="qa-qnum">Q{answer.id}</span>
                          <h4 className="qa-title">{answer.question}</h4>
                          <div className="qa-tags">
                            {answer.category && <span className="tag">{answer.category}</span>}
                            {answer.answer_status && <span className={`tag status ${answer.answer_status}`}>{answer.answer_status}</span>}
                            {answer.confidence_label && <span className="tag subtle">{answer.confidence_label}</span>}
                          </div>
                        </div>
                        <div className="answer-section">
                          <div className="main-brand-answer">
                            <h5>{competitor.brand} Answer:</h5>
                            <p>{answer.answer || 'No answer available'}</p>
                            <div className="answer-meta">
                              {answer.evaluation && (
                              <span className={`evaluation-badge ${answer.evaluation.toLowerCase().replace(' ', '-')}`}>
                                  <FontAwesomeIcon 
                                icon={answer.evaluation === 'Correct' ? 'check-circle' : 
                                      answer.evaluation === 'Partially Correct' ? 'exclamation-triangle' : 
                                          'times-circle'} 
                                  />
                                <span className="badge-text">{answer.evaluation}</span>
                              </span>
                              )}
                              <span className="confidence-badge">
                                {typeof answer.confidence === 'number' ? `${answer.confidence}% confidence` : (typeof answer.evaluation_score === 'number' ? `${answer.evaluation_score}% score` : '—')}
                              </span>
                            </div>
                            {(answer.sources_used && answer.sources_used.length > 0) && (
                              <div className="sources-list">
                                <h6>Sources</h6>
                                <ul>
                                  {answer.sources_used.map((s, si) => (
                                    <li key={si}>
                                      {s.source_url ? (
                                        <a href={s.source_url} target="_blank" rel="noreferrer">
                                          {s.source_type || 'source'}
                                        </a>
                                      ) : (
                                        <span>{s.source_type || 'source'}</span>
                                      )}
                                      {s.quote && <span className="source-quote"> – {s.quote.slice(0, 180)}{s.quote.length > 180 ? '…' : ''}</span>}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {(answer.supported_claims || answer.unsupported_claims || answer.missed_evidence || answer.context_quotes_used) && (
                              <div className="evidence-details">
                                {answer.supported_claims && answer.supported_claims.length > 0 && (
                                  <div className="evidence-block">
                                    <h6>Supported claims</h6>
                                    <ul>
                                      {answer.supported_claims.map((c, ci) => (<li key={ci}>{c}</li>))}
                                    </ul>
                                  </div>
                                )}
                                {answer.unsupported_claims && answer.unsupported_claims.length > 0 && (
                                  <div className="evidence-block">
                                    <h6>Unsupported claims</h6>
                                    <ul>
                                      {answer.unsupported_claims.map((c, ci) => (<li key={ci}>{c}</li>))}
                                    </ul>
                                  </div>
                                )}
                                {answer.missed_evidence && answer.missed_evidence.length > 0 && (
                                  <div className="evidence-block">
                                    <h6>Missed evidence</h6>
                                    <ul>
                                      {answer.missed_evidence.map((c, ci) => (<li key={ci}>{c}</li>))}
                                    </ul>
                                  </div>
                                )}
                                {answer.context_quotes_used && answer.context_quotes_used.length > 0 && (
                                  <div className="evidence-block">
                                    <h6>Context quotes</h6>
                                    <ul>
                                      {answer.context_quotes_used.map((q, qi) => (<li key={qi}>{q}</li>))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                            {answer.discoverability_analysis && (
                              <div className="discoverability-meta">
                                <h6>Discoverability</h6>
                                <div className="meta-grid">
                                  {Object.entries(answer.discoverability_analysis).map(([k, v]) => (
                                    <div key={k} className="meta-item">
                                      <span className="meta-label">{k.replace(/_/g, ' ')}</span>
                                      <span className="meta-value">{String(v)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {answer.explanation && (
                              <div className="explanation-block">
                                <h6>Explanation</h6>
                                <p>{answer.explanation}</p>
                              </div>
                            )}
                            {answer.recommendation && (
                              <div className="recommendation-block">
                                <h6>Recommendation</h6>
                                <span className={`recommendation-badge ${answer.recommendation.toLowerCase()}`}>
                                  {answer.recommendation}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
              </div>
                </div>
              ))}
            </div>

            {/* Relevance Section */}
            {Array.isArray(latestAnalysis.relevance) && latestAnalysis.relevance.length > 0 && (
              <div className="relevance-section">
                <h3>Relevance Mapping</h3>
                <div className="relevance-grid">
                  {latestAnalysis.relevance.map((rel, ri) => (
                    <div key={ri} className="relevance-card">
                      <div className="relevance-header">
                        <strong>Q{rel.question_id}</strong>
                        <span className="brand-pill">{rel.brand}</span>
                        <span className="score-pill">{rel.relevance_score}</span>
                      </div>
                      {rel.relevant_sections && rel.relevant_sections.length > 0 && (
                        <ul className="relevant-sections">
                          {rel.relevant_sections.slice(0,5).map((sec, si) => (<li key={si}>{sec}</li>))}
                        </ul>
                      )}
                      {rel.gaps && rel.gaps.length > 0 && (
                        <div className="gaps-text">{rel.gaps}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Questions Section */}
            {Array.isArray(latestAnalysis.questions) && latestAnalysis.questions.length > 0 && (
              <div className="questions-section">
                <h3>Questions Evaluated</h3>
                <div className="questions-grid">
                  {latestAnalysis.questions.map((q, qi) => (
                    <div key={qi} className="question-card">
                      <div className="q-header">
                        <span className="q-id">Q{q.id}</span>
                        {q.category && <span className="tag">{q.category}</span>}
                      </div>
                      <div className="q-body">
                        <div className="q-text">{q.question}</div>
                        {q.why_this_matters && (
                          <div className="q-why">
                            <strong>Why it matters:</strong> {q.why_this_matters}
                          </div>
                        )}
                        {q.evaluation_criteria && (
                          <div className="q-criteria">
                            <strong>Evaluation criteria:</strong> {q.evaluation_criteria}
                          </div>
                        )}
                        {q.expected_findability && (
                          <div className="q-findability">
                            <strong>Expected findability:</strong> {q.expected_findability}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Competitors List Section */}
            <div className="competitors-list-section">
              <h3>Competitors Analyzed</h3>
              {Array.isArray(latestAnalysis.competitors) && latestAnalysis.competitors.length > 0 ? (
                <div className="competitors-grid">
                  {latestAnalysis.competitors.map((competitor, ci) => (
                    <div key={ci} className="competitor-card">
                      <div className="competitor-info">
                        <h4>{competitor.brand}</h4>
                        <span className="domain">{competitor.domain}</span>
                      </div>
                      <div className="competitor-status">
                        <FontAwesomeIcon icon="check-circle" className="status-icon" />
                        <span>Analyzed</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FontAwesomeIcon icon="users" className="empty-icon" />
                  <p>No competitors data available</p>
                </div>
              )}
            </div>

            {/* Analysis Metadata Section */}
            <div className="analysis-metadata-section">
              <h3>Analysis Details</h3>
              <div className="metadata-grid">
                <div className="metadata-card">
                  <h4>Analysis Information</h4>
                  <div className="metadata-items">
                    <div className="metadata-item">
                      <span className="label">Analysis ID:</span>
                      <span className="value">{latestAnalysis.analysis_id}</span>
                    </div>
                    <div className="metadata-item">
                      <span className="label">Timestamp:</span>
                      <span className="value">{formatDate(latestAnalysis.timestamp)}</span>
                    </div>
                    <div className="metadata-item">
                      <span className="label">Total Questions:</span>
                      <span className="value">{latestAnalysis.analysis.summary.total_questions}</span>
                    </div>
                    <div className="metadata-item">
                      <span className="label">Correct Answers:</span>
                      <span className="value success">{latestAnalysis.analysis.summary.correct}</span>
                    </div>
                    <div className="metadata-item">
                      <span className="label">Partially Correct:</span>
                      <span className="value warning">{latestAnalysis.analysis.summary.partially_correct}</span>
                    </div>
                    <div className="metadata-item">
                      <span className="label">Incorrect Answers:</span>
                      <span className="value error">{latestAnalysis.analysis.summary.incorrect}</span>
                    </div>
                  </div>
                </div>
                
                <div className="metadata-card">
                  <h4>Competition Overview</h4>
                  <div className="metadata-items">
                    <div className="metadata-item">
                      <span className="label">Competitors Analyzed:</span>
                      <span className="value">{latestAnalysis.competitor_analyses?.length || 0}</span>
                    </div>
                    <div className="metadata-item">
                      <span className="label">Main Brand:</span>
                      <span className="value">{latestAnalysis.brand}</span>
                    </div>
                    <div className="metadata-item">
                      <span className="label">Domain:</span>
                      <span className="value">{latestAnalysis.domain}</span>
                    </div>
                    <div className="metadata-item">
                      <span className="label">Overall Accuracy:</span>
                      <span className={`value ${getAccuracyColor(latestAnalysis.analysis.summary.accuracy_percent)}`}>
                        {latestAnalysis.analysis.summary.accuracy_percent}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Performance Breakdown */}
            <div className="category-performance-section">
              <h3>Performance by Category</h3>
              {(() => {
                const categories = {};
                latestAnalysis.analysis.answers.forEach(answer => {
                  if (answer.category) {
                    if (!categories[answer.category]) {
                      categories[answer.category] = { total: 0, correct: 0, partial: 0, incorrect: 0 };
                    }
                    categories[answer.category].total++;
                    if (answer.evaluation === 'Correct') categories[answer.category].correct++;
                    else if (answer.evaluation === 'Partially Correct') categories[answer.category].partial++;
                    else categories[answer.category].incorrect++;
                  }
                });
                
                const categoryEntries = Object.entries(categories);
                
                return categoryEntries.length > 0 ? (
                  <div className="category-breakdown">
                    {categoryEntries.map(([category, stats]) => {
                      const accuracy = Math.round((stats.correct / stats.total) * 100);
                      return (
                        <div key={category} className="category-card">
                          <div className="category-header">
                            <h4>{category}</h4>
                            <div className={`category-score ${getAccuracyColor(accuracy)}`}>
                              {accuracy}%
                            </div>
                          </div>
                          <div className="category-stats">
                            <div className="stat-item">
                              <span className="stat-label">Total:</span>
                              <span className="stat-value">{stats.total}</span>
                            </div>
                            <div className="stat-item success">
                              <span className="stat-label">Correct:</span>
                              <span className="stat-value">{stats.correct}</span>
                            </div>
                            <div className="stat-item warning">
                              <span className="stat-label">Partial:</span>
                              <span className="stat-value">{stats.partial}</span>
                            </div>
                            <div className="stat-item error">
                              <span className="stat-label">Incorrect:</span>
                              <span className="stat-value">{stats.incorrect}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FontAwesomeIcon icon="chart-bar" className="empty-icon" />
                    <p>No category data available</p>
                  </div>
                );
              })()}
            </div>

            {/* Answer Status Distribution */}
            <div className="answer-status-section">
              <h3>Answer Status Distribution</h3>
              {(() => {
                const statuses = {};
                latestAnalysis.analysis.answers.forEach(answer => {
                  if (answer.answer_status) {
                    statuses[answer.answer_status] = (statuses[answer.answer_status] || 0) + 1;
                  }
                });
                
                const statusEntries = Object.entries(statuses);
                
                return statusEntries.length > 0 ? (
                  <div className="status-breakdown">
                    {statusEntries.map(([status, count]) => (
                      <div key={status} className="status-card">
                        <div className="status-header">
                          <span className="status-name">{status.replace('_', ' ')}</span>
                          <span className="status-count">{count}</span>
                        </div>
                        <div className="status-bar">
                          <div 
                            className="status-fill" 
                            style={{ width: `${(count / latestAnalysis.analysis.answers.length) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FontAwesomeIcon icon="chart-pie" className="empty-icon" />
                    <p>No status data available</p>
                  </div>
                );
              })()}
            </div>

            {/* Confidence Distribution */}
            <div className="confidence-section">
              <h3>Confidence Distribution</h3>
              {(() => {
                const confidences = {};
                latestAnalysis.analysis.answers.forEach(answer => {
                  if (answer.confidence_label) {
                    confidences[answer.confidence_label] = (confidences[answer.confidence_label] || 0) + 1;
                  }
                });
                
                const confidenceEntries = Object.entries(confidences);
                
                return confidenceEntries.length > 0 ? (
                  <div className="confidence-breakdown">
                    {confidenceEntries.map(([confidence, count]) => (
                      <div key={confidence} className="confidence-card">
                        <div className="confidence-header">
                          <span className="confidence-name">{confidence}</span>
                          <span className="confidence-count">{count}</span>
                        </div>
                        <div className="confidence-bar">
                          <div 
                            className="confidence-fill" 
                            style={{ width: `${(count / latestAnalysis.analysis.answers.length) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FontAwesomeIcon icon="chart-line" className="empty-icon" />
                    <p>No confidence data available</p>
                  </div>
                );
              })()}
            </div>
          </section>
        )}

        {/* Historical Analyses Section */}
        {historicalAnalyses.length > 0 && (
          <section className="analysis-section">
            <div className="section-header">
              <h2>Previous Analyses</h2>
            </div>
            
            <div className="historical-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Brand</th>
                    <th>Competitors</th>
                    <th>Performance</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {historicalAnalyses.slice(0, 10).map((analysis, index) => (
                    <tr key={index}>
                      <td>{formatDate(analysis.timestamp)}</td>
                      <td>
                        <div className="brand-cell">
                          <strong>{analysis.brand}</strong>
                          <span className="domain">{analysis.domain}</span>
                        </div>
                      </td>
                      <td>{analysis.summary.competitor_count}</td>
                      <td>
                        <div className={`performance-badge ${getAccuracyColor(analysis.summary.accuracy_percent)}`}>
                          {analysis.summary.accuracy_percent}%
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-sm btn-outline" onClick={() => handleViewAnalysis(analysis)}>
                            <FontAwesomeIcon icon="eye" />
                            View
                          </button>
                          <button className="btn btn-sm btn-outline" onClick={() => handleExportAnalysis(analysis)}>
                            <FontAwesomeIcon icon="download" />
                            Export
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default CompetitionAnalysisScreen;
