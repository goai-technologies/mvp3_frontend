import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useApp } from '../context/AppContext';
import { useDownload } from '../hooks/useAudit';

const InsightsScreen = () => {
  const { state } = useApp();
  const { exportToPDF, exportToExcel, exportToJSON } = useDownload();

  const domain = state.currentDomain || 'example.com';

  const handleExport = (format) => {
    const filename = `${domain}-insights`;
    const data = {
      domain,
      timestamp: new Date().toISOString(),
      insights: 'Comprehensive audit insights and recommendations'
    };

    switch (format) {
      case 'pdf':
        exportToPDF(data, filename);
        break;
      case 'excel':
        exportToExcel(data, filename);
        break;
      case 'json':
        exportToJSON(data, filename);
        break;
      default:
        break;
    }
  };

  const recommendations = [
    {
      id: 1,
      priority: 'high',
      title: 'Monitor Content Updates',
      description: 'Regularly update your content to maintain AI-readiness and SEO rankings. Consider implementing a content calendar.'
    },
    {
      id: 2,
      priority: 'medium',
      title: 'Implement Analytics Tracking',
      description: 'Add comprehensive analytics to track the impact of optimizations and identify new improvement opportunities.'
    },
    {
      id: 3,
      priority: 'low',
      title: 'Mobile Optimization',
      description: 'Further optimize mobile experience to improve user engagement and search rankings.'
    }
  ];

  const nextSteps = [
    {
      id: 1,
      title: 'Download Your Reports',
      description: 'Save both audit reports for your records and team sharing'
    },
    {
      id: 2,
      title: 'Schedule Regular Audits',
      description: 'Set up monthly audits to maintain optimal performance'
    },
    {
      id: 3,
      title: 'Monitor Performance',
      description: 'Track your website\'s performance using the recommended tools'
    }
  ];

  return (
    <div className="screen">
      <div className="container">
                  <div className="insights-header">
            <h1>Actionable Insights & Recommendations</h1>
            <p>Next steps to maintain and improve your AI-ready website</p>
          </div>
        
        <div className="insights-summary">
          <div className="summary-card">
            <h3>Overall Impact</h3>
            <div className="impact-metrics">
              <div className="impact-item">
                <span className="metric">85%</span>
                <span className="label">Issues Resolved</span>
              </div>
              <div className="impact-item">
                <span className="metric">+42%</span>
                <span className="label">Average Score Improvement</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="recommendations">
          <h2>Key Recommendations</h2>
          
          {recommendations.map((rec) => (
            <div key={rec.id} className={`recommendation-card priority-${rec.priority}`}>
              <div className="rec-header">
                <h3>{rec.title}</h3>
                <span className={`priority ${rec.priority}`}>
                  {rec.priority} Priority
                </span>
              </div>
              <p>{rec.description}</p>
              <div className="rec-actions">
                <button className="btn-outline">Learn More</button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="next-steps">
          <h2>Suggested Next Steps</h2>
          <div className="steps-list">
            {nextSteps.map((step, index) => (
              <div key={step.id} className="step-item">
                <div className="step-number">{index + 1}</div>
                <div className="step-content">
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="export-options">
          <h2>Export Options</h2>
          <div className="export-buttons">
            <button 
              className="btn-secondary"
              onClick={() => handleExport('pdf')}
            >
              <FontAwesomeIcon icon="file-pdf" />
              Download PDF Report
            </button>
            <button 
              className="btn-secondary"
              onClick={() => handleExport('excel')}
            >
              <FontAwesomeIcon icon="file-excel" />
              Export to Excel
            </button>
            <button 
              className="btn-secondary"
              onClick={() => handleExport('json')}
            >
              <FontAwesomeIcon icon="code" />
              Export JSON Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsScreen;
