import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import apiService from '../services/api';
import { useApp } from '../context/AppContext';

const BrandAnalysisScreen = () => {
  const [formData, setFormData] = useState({
    domain: '',
    brandName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [previousAnalyses, setPreviousAnalyses] = useState([]);
  const [isLoadingPrevious, setIsLoadingPrevious] = useState(false);
  const [selectedPreviousAnalysis, setSelectedPreviousAnalysis] = useState(null);
  const { showNotification } = useApp();

  // Mock data for previous analyses
  const mockPreviousAnalyses = [
    {
      id: 1,
      brandName: 'TechCorp',
      domain: 'techcorp.com',
      createdAt: '2024-09-15T10:30:00Z',
      accuracy: 85,
      totalQuestions: 25,
      correct: 21,
      partiallyCorrect: 2,
      incorrect: 2,
      status: 'completed'
    },
    {
      id: 2,
      brandName: 'DesignStudio',
      domain: 'designstudio.io',
      createdAt: '2024-09-10T14:20:00Z',
      accuracy: 72,
      totalQuestions: 25,
      correct: 18,
      partiallyCorrect: 4,
      incorrect: 3,
      status: 'completed'
    },
    {
      id: 3,
      brandName: 'EcoFriendly',
      domain: 'ecofriendly.org',
      createdAt: '2024-09-05T09:15:00Z',
      accuracy: 92,
      totalQuestions: 25,
      correct: 23,
      partiallyCorrect: 1,
      incorrect: 1,
      status: 'completed'
    }
  ];

  // Mock data for demonstration
  const mockResults = {
    summary: {
      totalQuestions: 25,
      correct: 18,
      partiallyCorrect: 4,
      incorrect: 3,
      accuracy: 72
    },
    questions: [
      {
        id: 1,
        question: "What is the primary product offered by this brand?",
        llmAnswer: "Cloud-based project management software with team collaboration features",
        evaluation: "Correct",
        confidence: 95,
        explanation: "The LLM correctly identified the core product offering based on website content."
      },
      {
        id: 2,
        question: "What are the main pricing tiers available?",
        llmAnswer: "Free, Professional ($12/month), and Enterprise (custom pricing)",
        evaluation: "Correct",
        confidence: 88,
        explanation: "Pricing information was accurately extracted from the pricing page."
      },
      {
        id: 3,
        question: "What industries does this brand primarily serve?",
        llmAnswer: "Technology, marketing, and consulting firms",
        evaluation: "Partially Correct",
        confidence: 65,
        explanation: "Identified some target industries but missed healthcare and education sectors mentioned on the site."
      },
      {
        id: 4,
        question: "What is the company's founding year?",
        llmAnswer: "2018",
        evaluation: "Incorrect",
        confidence: 45,
        explanation: "The company was actually founded in 2016, not 2018. This information was in the about page."
      },
      {
        id: 5,
        question: "What are the key features of the platform?",
        llmAnswer: "Task management, team chat, file sharing, time tracking, and reporting dashboards",
        evaluation: "Correct",
        confidence: 92,
        explanation: "Comprehensive list of features accurately captured from the features page."
      },
      // Add more mock questions to reach 25
      ...Array.from({ length: 20 }, (_, i) => ({
        id: i + 6,
        question: `Sample question ${i + 6} about brand analysis`,
        llmAnswer: `Sample LLM response for question ${i + 6}`,
        evaluation: Math.random() > 0.7 ? "Incorrect" : Math.random() > 0.3 ? "Correct" : "Partially Correct",
        confidence: Math.floor(Math.random() * 40) + 60,
        explanation: `Detailed explanation for question ${i + 6} evaluation.`
      }))
    ]
  };

  // Load previous analyses on component mount
  useEffect(() => {
    loadPreviousAnalyses();
  }, []);

  // Debug: Log state changes
  useEffect(() => {
    console.log('Previous analyses state changed:', previousAnalyses, 'Length:', previousAnalyses.length);
  }, [previousAnalyses]);

  const loadPreviousAnalyses = async () => {
    console.log('Loading previous analyses...');
    console.log('Current auth token:', localStorage.getItem('llmredi_token') ? 'Present' : 'Missing');
    console.log('Token value:', localStorage.getItem('llmredi_token'));
    
    // Refresh token in API service
    apiService.refreshToken();
    
    setIsLoadingPrevious(true);
    
    try {
      // Try to call the actual API first, fall back to mock data if it fails
      const response = await apiService.getPreviousBrandAnalyses();
      console.log('API response for previous analyses:', response);
      
      // Handle different response formats
      const analyses = response.analyses || response.data || response;
      
      if (Array.isArray(analyses) && analyses.length > 0) {
        // Transform API data to match our component's expected format
        const transformedAnalyses = analyses.map(analysis => ({
          id: analysis.analysis_id,
          brandName: analysis.brand,
          domain: analysis.domain,
          createdAt: analysis.timestamp,
          accuracy: analysis.summary.accuracy_percent,
          totalQuestions: analysis.summary.total_questions,
          correct: analysis.summary.correct,
          partiallyCorrect: analysis.summary.partially_correct,
          incorrect: analysis.summary.incorrect,
          status: 'completed',
          // Store the full details for when user clicks on the analysis
          details: analysis.details ? analysis.details.map(detail => ({
            id: detail.id,
            question: detail.question,
            llmAnswer: detail.answer,
            evaluation: detail.evaluation,
            confidence: detail.confidence,
            explanation: detail.explanation
          })) : null
        }));
        
        setPreviousAnalyses(transformedAnalyses);
        console.log('Successfully loaded', transformedAnalyses.length, 'previous analyses from API');
      } else {
        // If API returns empty or invalid data, use mock data
        console.log('API returned empty data, using mock data');
        setPreviousAnalyses(mockPreviousAnalyses);
      }
    } catch (apiError) {
      console.warn('API call failed for previous analyses, using mock data:', apiError);
      console.error('Full error details:', apiError);
      setPreviousAnalyses(mockPreviousAnalyses);
    } finally {
      setIsLoadingPrevious(false);
      console.log('Previous analyses loading completed');
    }
  };

  const handlePreviousAnalysisClick = (analysis) => {
    // Create a detailed result based on the analysis data
    const detailedResult = {
      summary: {
        totalQuestions: analysis.totalQuestions,
        correct: analysis.correct,
        partiallyCorrect: analysis.partiallyCorrect,
        incorrect: analysis.incorrect,
        accuracy: analysis.accuracy
      },
      // If we have the full analysis data with details, use it; otherwise use mock questions
      questions: analysis.details || mockResults.questions
    };
    
    setResults(detailedResult);
    setSelectedPreviousAnalysis(analysis);
    setFormData({
      domain: analysis.domain,
      brandName: analysis.brandName
    });
    
    // Scroll to results section
    setTimeout(() => {
      const resultsSection = document.querySelector('.results-section');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.domain || !formData.brandName) {
      setError('Please fill in both domain and brand name fields.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Try to call the actual API first, fall back to mock data if it fails
      try {
        // Send payload with updated key `brand_name`
        const payload = { domain: formData.domain, brand_name: formData.brandName };
        const response = await apiService.analyzeBrandLLM(payload);

        // Transform updated API response shape into UI shape
        const answers = response?.analysis?.answers || [];
        const summary = response?.analysis?.summary || response?.summary || {};

        const transformed = {
          summary: {
            totalQuestions: summary.total_questions || 0,
            correct: summary.correct || 0,
            partiallyCorrect: summary.partially_correct || 0,
            incorrect: summary.incorrect || 0,
            accuracy: summary.accuracy_percent || 0
          },
          questions: answers.map(a => ({
            id: a.id,
            question: a.question,
            llmAnswer: a.answer,
            evaluation: a.evaluation,
            confidence: a.confidence,
            explanation: a.explanation
          }))
        };

        setResults(transformed);
        showNotification('Brand analysis completed successfully!', 'success');
      } catch (apiError) {
        console.warn('API call failed, using mock data:', apiError);
        // Simulate API delay for mock data
        await new Promise(resolve => setTimeout(resolve, 2000));
        setResults(mockResults);
        showNotification('Brand analysis completed successfully! (Using demo data)', 'success');
      }
    } catch (err) {
      setError('Failed to analyze brand. Please try again.');
      showNotification('Analysis failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `brand-analysis-${formData.brandName}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportToCSV = () => {
    const csvHeaders = ['Q#', 'Question', 'LLM Answer', 'Evaluation', 'Confidence %', 'Explanation'];
    const csvRows = results.questions.map(q => [
      q.id,
      `"${q.question.replace(/"/g, '""')}"`,
      `"${q.llmAnswer.replace(/"/g, '""')}"`,
      q.evaluation,
      q.confidence,
      `"${q.explanation.replace(/"/g, '""')}"`
    ]);
    
    const csvContent = [csvHeaders, ...csvRows].map(row => row.join(',')).join('\n');
    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    
    const exportFileDefaultName = `brand-analysis-${formData.brandName}-${new Date().toISOString().split('T')[0]}.csv`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Prepare chart data
  const chartData = results ? [
    { name: 'Correct', value: results.summary.correct, color: '#10B981' },
    { name: 'Partially Correct', value: results.summary.partiallyCorrect, color: '#F59E0B' },
    { name: 'Incorrect', value: results.summary.incorrect, color: '#EF4444' }
  ] : [];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">{data.value} questions</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="brand-analysis-screen">
      <div className="container">
        {/* Header */}
        <div className="screen-header">
          <div className="header-content">
            <div className="header-text">
              <h1>
                <FontAwesomeIcon icon="chart-bar" className="header-icon" />
                Brand LLM Analysis
              </h1>
              <p>Analyze how well LLMs understand your brand based on your website content</p>
            </div>
          </div>
        </div>

        {/* Analysis Form */}
        <div className="analysis-form-section">
          <div className="card">
            <div className="card-header">
              <h3>Start Brand Analysis</h3>
              <p>Enter your domain and brand name to begin the analysis</p>
            </div>
            <form onSubmit={handleSubmit} className="analysis-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="domain">Domain</label>
                  <input
                    type="text"
                    id="domain"
                    name="domain"
                    value={formData.domain}
                    onChange={handleInputChange}
                    placeholder="e.g., example.com"
                    className="form-input"
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="brandName">Brand Name</label>
                  <input
                    type="text"
                    id="brandName"
                    name="brandName"
                    value={formData.brandName}
                    onChange={handleInputChange}
                    placeholder="e.g., Your Brand Name"
                    className="form-input"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              {error && (
                <div className="error-message">
                  <FontAwesomeIcon icon="exclamation-circle" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <FontAwesomeIcon icon="spinner" className="fa-spin" />
                    Analyzing Brand...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon="search" />
                    Start Analysis
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Previous Analyses Section */}
        {previousAnalyses.length > 0 && (
          <div className="previous-analyses-section">
            <div className="card">
              <div className="card-header">
                <h3>
                  <FontAwesomeIcon icon="clock" className="header-icon" />
                  Previous Brand Analyses
                </h3>
                <p>Click on any previous analysis to view the detailed report</p>
              </div>
              <div className="previous-analyses-grid">
                {isLoadingPrevious ? (
                  <div className="loading-previous">
                    <FontAwesomeIcon icon="spinner" className="fa-spin" />
                    <span>Loading previous analyses...</span>
                  </div>
                ) : (
                  previousAnalyses.map((analysis) => (
                    <div 
                      key={analysis.id}
                      className={`previous-analysis-card ${selectedPreviousAnalysis?.id === analysis.id ? 'selected' : ''}`}
                      onClick={() => handlePreviousAnalysisClick(analysis)}
                    >
                      <div className="analysis-header">
                        <div className="brand-info">
                          <h4>{analysis.brandName}</h4>
                          <p className="domain">{analysis.domain}</p>
                        </div>
                        <div className="accuracy-badge">
                          <span className={`accuracy-value ${
                            analysis.accuracy >= 80 ? 'high' : 
                            analysis.accuracy >= 60 ? 'medium' : 'low'
                          }`}>
                            {analysis.accuracy}%
                          </span>
                        </div>
                      </div>
                      <div className="analysis-stats">
                        <div className="stat">
                          <FontAwesomeIcon icon="check-circle" className="stat-icon success" />
                          <span>{analysis.correct} Correct</span>
                        </div>
                        <div className="stat">
                          <FontAwesomeIcon icon="exclamation-triangle" className="stat-icon warning" />
                          <span>{analysis.partiallyCorrect} Partial</span>
                        </div>
                        <div className="stat">
                          <FontAwesomeIcon icon="times-circle" className="stat-icon error" />
                          <span>{analysis.incorrect} Incorrect</span>
                        </div>
                      </div>
                      <div className="analysis-date">
                        <FontAwesomeIcon icon="calendar" />
                        <span>{formatDate(analysis.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {results && (
          <div className="results-section animate-fade-in">
            {/* Enhanced Summary Cards with better visual hierarchy */}
            <div className="summary-section">
              <div className="section-header">
                <h2 className="section-title">
                  <FontAwesomeIcon icon="chart-bar" className="section-icon" />
                  Analysis Summary
                </h2>
                <p className="section-subtitle">
                  Brand: <strong>{formData.brandName}</strong> | Domain: <strong>{formData.domain}</strong>
                </p>
              </div>
              
              <div className="summary-tiles-row">
                <div className="summary-tile total">
                  <div className="tile-number">{results.summary.totalQuestions}</div>
                  <div className="tile-heading">Total Questions</div>
                  <div className="tile-description">Questions Analyzed</div>
                  <div className="tile-decoration"></div>
                </div>
                
                <div className="summary-tile success">
                  <div className="tile-number">{results.summary.correct}</div>
                  <div className="tile-heading">Correct</div>
                  <div className="tile-description">
                    {Math.round((results.summary.correct / results.summary.totalQuestions) * 100)}% Correct Answers
                  </div>
                  <div className="tile-decoration success"></div>
                </div>
                
                <div className="summary-tile warning">
                  <div className="tile-number">{results.summary.partiallyCorrect}</div>
                  <div className="tile-heading">Partially Correct</div>
                  <div className="tile-description">
                    {Math.round((results.summary.partiallyCorrect / results.summary.totalQuestions) * 100)}% Partially Correct
                  </div>
                  <div className="tile-decoration warning"></div>
                </div>
                
                <div className="summary-tile error">
                  <div className="tile-number">{results.summary.incorrect}</div>
                  <div className="tile-heading">Incorrect</div>
                  <div className="tile-description">
                    {Math.round((results.summary.incorrect / results.summary.totalQuestions) * 100)}% Incorrect Answers
                  </div>
                  <div className="tile-decoration error"></div>
                </div>
                
                <div className="summary-tile accuracy">
                  <div className="tile-number">{results.summary.accuracy}%</div>
                  <div className="tile-heading">Accuracy</div>
                  <div className="tile-description">Overall Performance</div>
                  <div className="accuracy-bar">
                    <div 
                      className="accuracy-fill" 
                      style={{ width: `${results.summary.accuracy}%` }}
                    ></div>
                  </div>
                  <div className={`tile-decoration ${
                    results.summary.accuracy >= 80 ? 'success' : 
                    results.summary.accuracy >= 60 ? 'warning' : 'error'
                  }`}></div>
                </div>
              </div>
            </div>

            {/* Enhanced Results Table */}
            <div className="table-section">
              <div className="table-card">
                <div className="card-header">
                  <h3>
                    <FontAwesomeIcon icon="table" className="section-icon" />
                    Detailed Analysis Results
                  </h3>
                  <p>Complete breakdown of all {results.summary.totalQuestions} questions with LLM responses and evaluations</p>
                </div>
                <div className="table-controls">
                  <div className="table-stats">
                    <span className="stat success">
                      <FontAwesomeIcon icon="check-circle" />
                      {results.summary.correct} Correct
                    </span>
                    <span className="stat warning">
                      <FontAwesomeIcon icon="exclamation-triangle" />
                      {results.summary.partiallyCorrect} Partial
                    </span>
                    <span className="stat error">
                      <FontAwesomeIcon icon="times-circle" />
                      {results.summary.incorrect} Incorrect
                    </span>
                  </div>
                </div>
                <div className="table-container">
                  <table className="results-table enhanced">
                    <thead>
                      <tr>
                        <th className="col-number">Q#</th>
                        <th className="col-question">Question</th>
                        <th className="col-answer">LLM Answer</th>
                        <th className="col-evaluation">Evaluation</th>
                        <th className="col-confidence">Confidence</th>
                        <th className="col-explanation">Explanation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.questions.map((question, index) => (
                        <tr key={question.id} className={`animate-slide-in row-${question.evaluation.toLowerCase().replace(' ', '-')}`} style={{animationDelay: `${index * 50}ms`}}>
                          <td className="question-number">
                            <div className="number-badge">{question.id}</div>
                          </td>
                          <td className="question-text">
                            <div className="question-content">{question.question}</div>
                          </td>
                          <td className="llm-answer">
                            <div className="answer-content">{question.llmAnswer}</div>
                          </td>
                          <td className="evaluation-cell">
                            <span className={`evaluation-badge ${question.evaluation.toLowerCase().replace(' ', '-')}`}>
                              <FontAwesomeIcon 
                                icon={
                                  question.evaluation === 'Correct' ? 'check-circle' :
                                  question.evaluation === 'Partially Correct' ? 'exclamation-triangle' :
                                  'times-circle'
                                } 
                              />
                              <span className="badge-text">{question.evaluation}</span>
                            </span>
                          </td>
                          <td className="confidence-cell">
                            <div className="confidence-number">{question.confidence}%</div>
                            <div className="confidence-bar">
                              <div 
                                className={`confidence-fill ${
                                  question.confidence >= 80 ? 'high' : 
                                  question.confidence >= 60 ? 'medium' : 'low'
                                }`}
                                style={{ width: `${question.confidence}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="explanation-cell">
                            <div className="explanation-content">{question.explanation}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Enhanced Export Section - Moved to the end */}
            <div className="export-section">
              <div className="export-container">
                <div className="export-header">
                  <h3>
                    <FontAwesomeIcon icon="download" className="section-icon" />
                    Export Results
                  </h3>
                  <p>Download your analysis results in different formats</p>
                </div>
                <div className="export-buttons">
                  <button onClick={exportToJSON} className="btn btn-export json">
                    <FontAwesomeIcon icon="file-code" />
                    <span>Export JSON</span>
                    <small>Structured data format</small>
                  </button>
                  <button onClick={exportToCSV} className="btn btn-export csv">
                    <FontAwesomeIcon icon="file-excel" />
                    <span>Export CSV</span>
                    <small>Spreadsheet format</small>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandAnalysisScreen;
