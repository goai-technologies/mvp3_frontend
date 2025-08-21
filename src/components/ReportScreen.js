import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useApp } from '../context/AppContext';
import { useReportData, useDownload } from '../hooks/useAudit';

const ReportScreen = ({ type = 'original' }) => {
  const { state } = useApp();
  const { getScoreStatus } = useReportData();
  const { exportToPDF } = useDownload();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // LLM Ready format audit data based on screenshots
  const reportData = type === 'original' ? {
    domain: state.currentDomain || 'example.com',
    scanDate: new Date().toLocaleDateString(),
    
    // Overall Score
    overallScore: 69.2,
    grade: 'C+',
    gradeDescription: 'Average (Needs Improvement)',
    
    // Individual AI Model Scores
    modelScores: {
      chatgpt: { score: 66.5, grade: 'C', description: 'Below Average' },
      gemini: { score: 71.8, grade: 'C+', description: 'Average (Needs Improvement)' },
      claude: { score: 70.4, grade: 'C+', description: 'Average (Needs Improvement)' }
    },
    
    // Category Scores matching LLM Ready format
    categories: {
      'AI Content Processing & Extraction': {
        combined: 62,
        metrics: {
          'LLM Readability & Chunk Relevance': {
            description: 'Content lacks clear structure and chunking, making it difficult for LLMs to summarize.',
            scores: { chatgpt: 50, gemini: 60, claude: 57 }
          },
          'Semantic Density & Entity Coverage': {
            description: 'Limited use of named entities and sparse semantic density.',
            scores: { chatgpt: 60, gemini: 65, claude: 63 }
          },
          'Contextual Information Architecture': {
            description: 'Lack of clear contextual information architecture.',
            scores: { chatgpt: 75, gemini: 69, claude: 73 }
          }
        }
      },
      'LLM Citation & Trust Signals': {
        combined: 57.5,
        metrics: {
          'Citation Worthiness & Factual Accuracy': {
            description: 'Limited factual citations reducing trustworthiness.',
            scores: { chatgpt: 50, gemini: 62, claude: 55 }
          },
          'Source Authority & Expertise Signals': {
            description: 'No authorship or institutional credibility on key content.',
            scores: { chatgpt: 50, gemini: 56, claude: 54 }
          },
          'AI Platform Visibility Score': {
            description: 'Limited visibility on major AI platforms.',
            scores: { chatgpt: 69, gemini: 62, claude: 63 }
          }
        }
      },
      'AI-User Interaction Optimization': {
        combined: 71,
        metrics: {
          'Direct Answer Optimization': {
            description: 'Content lacks question-based formatting used in LLM queries.',
            scores: { chatgpt: 70, gemini: 72, claude: 71 }
          },
          'Conversational Query Alignment': {
            description: 'Limited alignment with conversational queries.',
            scores: { chatgpt: 70, gemini: 76, claude: 72 }
          },
          'Voice Search Optimization': {
            description: 'Voice-search formatting is absent, impacting discovery.',
            scores: { chatgpt: 70, gemini: 75, claude: 70 }
          },
          'AI-Driven Click-Through Potential': {
            description: 'Low click-through potential for AI-driven queries.',
            scores: { chatgpt: 70, gemini: 63, claude: 66 }
          }
        }
      },
      'Technical AI Accessibility': {
        combined: 76.5,
        metrics: {
          'Structured Data for AI Consumption': {
            description: 'Missing JSON-LD schema blocks LLM understanding.',
            scores: { chatgpt: 75, gemini: 83, claude: 80 }
          },
          'Schema Markup Implementation': {
            description: 'No schema markup implementation detected.',
            scores: { chatgpt: 75, gemini: 80, claude: 78 }
          },
          'LLM Crawlability & Processing Speed': {
            description: 'JavaScript-only rendering hides content from AI parsers.',
            scores: { chatgpt: 75, gemini: 87, claude: 83 }
          },
          'Pre-rendering & JavaScript Optimization': {
            description: 'No pre-rendering or JavaScript optimization detected.',
            scores: { chatgpt: 75, gemini: 73, claude: 77 }
          },
          'Multimodal AI Compatibility': {
            description: 'No metadata for images or videos reduces multimodal visibility.',
            scores: { chatgpt: 75, gemini: 50, claude: 55 }
          }
        }
      },
      'AI Performance & Conversion': {
        combined: 83,
        metrics: {
          'AI Conversion Rate': {
            description: 'Low AI conversion rate.',
            scores: { chatgpt: 80, gemini: 90, claude: 88 }
          },
          'Response Latency for AI Systems': {
            description: 'Moderate response latency for AI systems.',
            scores: { chatgpt: 80, gemini: 87, claude: 85 }
          },
          'AI-Generated Summary Quality': {
            description: 'Low quality AI-generated summaries.',
            scores: { chatgpt: 80, gemini: 80, claude: 78 }
          }
        }
      }
    },
    
    // Combined Assessments
    assessments: {
      visibility: 'Overall AI visibility is limited by weak trust signals, inconsistent structured data, and lack of direct-answer formatting. Some crawlable sections exist, but improvements to schema, Q→A blocks, and authorship are needed to earn reliable citations.',
      summary: 'Combined analysis from ChatGPT and Gemini indicates average LLM readiness with major gaps in schema coverage, trust signals, and direct-answer formatting. Prioritize full-funnel JSON-LD, author bios and dates, Q→A blocks, and SSR/ISR to improve discoverability, summary quality, and AI-driven conversions.'
    },
    
    // Critical Items and Warnings
    criticalItems: [
      'Inconsistent or missing JSON-LD across key pages.',
      'No/weak authorship and organizational credibility on content.',
      'Client-side/JavaScript-only rendering limits first parse for LLMs.',
      'Missing concise Q→A blocks for direct answers.',
      'Alt text/captions missing on most media; weak multimodal metadata.'
    ],
    
    topWarnings: [
      'Inconsistent content chunking impairs summarization.',
      'Meta descriptions not aligned to question-style queries.',
      'Sparse named entities and industry benchmarks on product/service pages.',
      'No speakable schema for voice answers.',
      'Few outbound citations to authoritative, primary sources.'
    ]
  } : {
    // Optimized version with improved scores
    domain: state.currentDomain || 'example.com',
    scanDate: new Date().toLocaleDateString(),
    
    overallScore: 89.5,
    grade: 'B+',
    gradeDescription: 'Good (Above Average)',
    
    modelScores: {
      chatgpt: { score: 87.2, grade: 'B+', description: 'Good (Above Average)' },
      gemini: { score: 91.8, grade: 'A-', description: 'Excellent' },
      claude: { score: 89.5, grade: 'B+', description: 'Good (Above Average)' }
    },
    
    categories: {
      'AI Content Processing & Extraction': {
        combined: 88,
        metrics: {
          'LLM Readability & Chunk Relevance': {
            description: 'Content now has clear structure and chunking for optimal LLM summarization.',
            scores: { chatgpt: 85, gemini: 90, claude: 88 }
          },
          'Semantic Density & Entity Coverage': {
            description: 'Enhanced named entities and improved semantic density.',
            scores: { chatgpt: 88, gemini: 92, claude: 89 }
          },
          'Contextual Information Architecture': {
            description: 'Clear contextual information architecture implemented.',
            scores: { chatgpt: 90, gemini: 88, claude: 91 }
          }
        }
      },
      'LLM Citation & Trust Signals': {
        combined: 87,
        metrics: {
          'Citation Worthiness & Factual Accuracy': {
            description: 'Enhanced factual citations improving trustworthiness.',
            scores: { chatgpt: 85, gemini: 89, claude: 87 }
          },
          'Source Authority & Expertise Signals': {
            description: 'Strong authorship and institutional credibility established.',
            scores: { chatgpt: 88, gemini: 91, claude: 89 }
          },
          'AI Platform Visibility Score': {
            description: 'Improved visibility on major AI platforms.',
            scores: { chatgpt: 87, gemini: 90, claude: 88 }
          }
        }
      },
      'AI-User Interaction Optimization': {
        combined: 92,
        metrics: {
          'Direct Answer Optimization': {
            description: 'Question-based formatting implemented for optimal LLM queries.',
            scores: { chatgpt: 90, gemini: 94, claude: 91 }
          },
          'Conversational Query Alignment': {
            description: 'Strong alignment with conversational queries achieved.',
            scores: { chatgpt: 91, gemini: 95, claude: 92 }
          },
          'Voice Search Optimization': {
            description: 'Voice-search formatting implemented for better discovery.',
            scores: { chatgpt: 89, gemini: 93, claude: 90 }
          },
          'AI-Driven Click-Through Potential': {
            description: 'High click-through potential for AI-driven queries.',
            scores: { chatgpt: 88, gemini: 92, claude: 89 }
          }
        }
      },
      'Technical AI Accessibility': {
        combined: 94,
        metrics: {
          'Structured Data for AI Consumption': {
            description: 'Comprehensive JSON-LD schema implemented for LLM understanding.',
            scores: { chatgpt: 92, gemini: 96, claude: 94 }
          },
          'Schema Markup Implementation': {
            description: 'Full schema markup implementation completed.',
            scores: { chatgpt: 93, gemini: 95, claude: 94 }
          },
          'LLM Crawlability & Processing Speed': {
            description: 'Server-side rendering implemented for optimal AI parsing.',
            scores: { chatgpt: 94, gemini: 97, claude: 95 }
          },
          'Pre-rendering & JavaScript Optimization': {
            description: 'Pre-rendering and JavaScript optimization implemented.',
            scores: { chatgpt: 92, gemini: 94, claude: 93 }
          },
          'Multimodal AI Compatibility': {
            description: 'Comprehensive metadata for images and videos implemented.',
            scores: { chatgpt: 93, gemini: 95, claude: 94 }
          }
        }
      },
      'AI Performance & Conversion': {
        combined: 96,
        metrics: {
          'AI Conversion Rate': {
            description: 'High AI conversion rate achieved.',
            scores: { chatgpt: 94, gemini: 98, claude: 95 }
          },
          'Response Latency for AI Systems': {
            description: 'Low response latency for AI systems.',
            scores: { chatgpt: 93, gemini: 97, claude: 94 }
          },
          'AI-Generated Summary Quality': {
            description: 'High quality AI-generated summaries.',
            scores: { chatgpt: 95, gemini: 98, claude: 96 }
          }
        }
      }
    },
    
    assessments: {
      visibility: 'AI visibility significantly improved with strong trust signals, comprehensive structured data, and direct-answer formatting. All sections are now fully crawlable with enhanced schema, Q→A blocks, and authorship.',
      summary: 'Optimized website shows excellent LLM readiness with comprehensive schema coverage, strong trust signals, and direct-answer formatting. Full-funnel JSON-LD, author bios, Q→A blocks, and SSR/ISR implemented for maximum discoverability, summary quality, and AI-driven conversions.'
    },
    
    improvements: [
      'Comprehensive JSON-LD schema implemented across all key pages.',
      'Strong authorship and organizational credibility established.',
      'Server-side rendering implemented for optimal LLM parsing.',
      'Q→A blocks added for direct answer optimization.',
      'Enhanced alt text and multimodal metadata implemented.'
    ]
  };

  const handleDownload = () => {
    const filename = `${reportData.domain}-audit-${type}-${new Date().toISOString().split('T')[0]}`;
    exportToPDF(reportData, filename);
  };

  const isOptimized = type === 'optimized';

  const getGradeColor = (grade) => {
    if (grade.includes('A')) return 'excellent';
    if (grade.includes('B')) return 'good';
    if (grade.includes('C')) return 'fair';
    if (grade.includes('D') || grade.includes('F')) return 'poor';
    return 'fair';
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'fair';
    if (score >= 60) return 'poor';
    return 'critical';
  };

  const renderCategorySection = (categoryName, categoryData) => (
    <div key={categoryName} className="category-section">
      <div className="category-header">
        <h3>{categoryName}</h3>
        <div className="combined-score">
          Combined {categoryData.combined}/100
        </div>
      </div>
      
      <div className="metrics-table">
        <div className="table-header">
          <div className="metric-col">Metric</div>
          <div className="chatgpt-col">ChatGPT</div>
          <div className="gemini-col">Gemini</div>
          <div className="claude-col">Claude</div>
        </div>
        
        {Object.entries(categoryData.metrics).map(([metricName, metricData]) => (
          <div key={metricName} className="metric-row">
            <div className="metric-info">
              <div className="metric-name">{metricName}</div>
              <div className="metric-description">{metricData.description}</div>
            </div>
            <div className={`score-cell chatgpt ${getScoreColor(metricData.scores.chatgpt)}`}>
              {metricData.scores.chatgpt}%
            </div>
            <div className={`score-cell gemini ${getScoreColor(metricData.scores.gemini)}`}>
              {metricData.scores.gemini}%
            </div>
            <div className={`score-cell claude ${getScoreColor(metricData.scores.claude)}`}>
              {metricData.scores.claude}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="screen">
      <div className="container">
        <div className="report-header">
          <div className="report-title">
            <h1>Domain Detail Analysis (Multi-Model)</h1>
            <div className="domain-info">
              <div className="domain-details">
                <p><strong>Website:</strong> {reportData.domain}</p>
                <p><strong>Date:</strong> {reportData.scanDate}</p>
              </div>
              <div className="overall-grade">
                <div className={`grade-box ${getGradeColor(reportData.grade)}`}>
                  {reportData.grade} {reportData.gradeDescription}
                </div>
                <div className="llm-score">
                  LLM Readiness Score: {reportData.overallScore}/100
                </div>
              </div>
              <div className="model-scores">
                <div className="model-score">
                  <span className="model-name">ChatGPT:</span> {reportData.modelScores.chatgpt.score}/100 • {reportData.modelScores.chatgpt.grade} {reportData.modelScores.chatgpt.description}
                </div>
                <div className="model-score">
                  <span className="model-name">Gemini:</span> {reportData.modelScores.gemini.score}/100 • {reportData.modelScores.gemini.grade} {reportData.modelScores.gemini.description}
                </div>
                <div className="model-score">
                  <span className="model-name">Claude:</span> {reportData.modelScores.claude.score}/100 • {reportData.modelScores.claude.grade} {reportData.modelScores.claude.description}
                </div>
              </div>
            </div>
          </div>
          <div className="report-actions">
            <button 
              className="btn-secondary"
              onClick={() => navigate('/comparison')}
            >
              Compare Versions
            </button>
            <button 
              className="btn-primary"
              onClick={handleDownload}
            >
              <FontAwesomeIcon icon="download" />
              Download Report
            </button>
          </div>
        </div>

        {/* Combined Assessments */}
        <div className="assessments-section">
          <div className="assessment-card">
            <h3>Combined Visibility Assessment</h3>
            <p>{reportData.assessments.visibility}</p>
          </div>
          <div className="assessment-card">
            <h3>Combined Summary</h3>
            <p>{reportData.assessments.summary}</p>
          </div>
        </div>

        {/* Category Scores */}
        <div className="category-scores-section">
          <h2>Category Scores (Side-by-Side)</h2>
          {Object.entries(reportData.categories).map(([categoryName, categoryData]) => 
            renderCategorySection(categoryName, categoryData)
          )}
        </div>

        {/* Critical Items and Warnings */}
        <div className="issues-section">
          <div className="issues-grid">
            <div className="critical-items">
              <h3>
                <FontAwesomeIcon icon="times-circle" className="critical-icon" />
                Critical Items (Combined)
              </h3>
              <ul>
                {reportData.criticalItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            
            <div className="top-warnings">
              <h3>
                <FontAwesomeIcon icon="exclamation-triangle" className="warning-icon" />
                Top Warnings (Combined)
              </h3>
              <ul>
                {reportData.topWarnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportScreen;
