import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import apiService from '../services/api';

const LLMReadinessAnalyzer = () => {
  const [domain, setDomain] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  // Previous analyses state
  const [previousAnalyses, setPreviousAnalyses] = useState([]);
  const [isPrevLoading, setIsPrevLoading] = useState(false);
  const [prevError, setPrevError] = useState(null);
  const [expandedAnalysisId, setExpandedAnalysisId] = useState(null);
  const resultsRef = useRef(null);
  
  // Refs for cleanup
  const timerRef = useRef(null);
  const typewriterRef = useRef(null);
  const animationRef = useRef(null);
  const [openEvaluators, setOpenEvaluators] = useState({
    comprehensive: true,
    technical: true,
    contentQuality: true,
    redTeam: true,
    consensus: true
  });
  // Expand/collapse for parameter summary table
  const [openParamRows, setOpenParamRows] = useState({});
  
  // Loading states
  const [currentAgent, setCurrentAgent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(210); // 3 minutes 30 seconds total
  const [agentMessages, setAgentMessages] = useState('');
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [error, setError] = useState(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup timers and animations
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (typewriterRef.current) {
        clearInterval(typewriterRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Load previous analyses on mount
  useEffect(() => {
    const fetchHistory = async () => {
      setIsPrevLoading(true);
      setPrevError(null);
      try {
        const data = await apiService.getLLMAnalysisHistory();
        // Normalize array (API returns { success, analyses: [...] })
        const items = Array.isArray(data)
          ? data
          : (data?.analyses || data?.results || data?.data || []);
        setPreviousAnalyses(items);
      } catch (e) {
        setPrevError(e.message || 'Failed to load previous analyses');
      } finally {
        setIsPrevLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Open a previous analysis in the results view
  const openHistoryAnalysis = (item) => {
    if (!item) return;
    const selectedDomain = item.domain || item.input?.domain || item.request?.domain || '';
    setDomain(selectedDomain);
    setError(null);
    setIsAnalyzing(false);
    // Many fields align with our existing renderer; set directly
    setAnalysisResults(item);
    // Scroll to results after React paints
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  // Agent configuration - 210 seconds (3:30) divided equally among 5 agents = 42 seconds each
  const mockAgentSteps = [
    { 
      name: "Master Comprehensive Evaluator", 
      message: "Analyzing content structure & LLM readiness…",
      icon: "user-graduate",
      duration: 42000 // 42 seconds
    },
    { 
      name: "Technical Deep-Dive Validator", 
      message: "Running schema & speed tests…",
      icon: "cogs",
      duration: 42000 // 42 seconds
    },
    { 
      name: "Content Quality & Trust Specialist", 
      message: "Auditing factual claims & author credibility…",
      icon: "shield-alt",
      duration: 42000 // 42 seconds
    },
    { 
      name: "Red Team Critic", 
      message: "Stress testing weaknesses & risks…",
      icon: "user-secret",
      duration: 42000 // 42 seconds
    },
    { 
      name: "Consensus Builder", 
      message: "Reconciling evaluator findings into final score…",
      icon: "balance-scale",
      duration: 42000 // 42 seconds
    }
  ];

  // Real API integration (no mock fallback)
  const runAnalysis = async () => {
    if (!domain.trim()) {
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setCurrentAgent(0);
    setProgress(0);
    setTimeRemaining(210);
    setAnalysisResults(null);
    
    // Start the loading animation immediately
    startLoadingAnimation();
    
    // Start API call
    const apiCall = async () => {
      try {
        console.log('Starting API call to:', domain);
        
        // Use centralized API service
        const data = await apiService.makeRequest('/agentanalyse', {
          method: 'POST',
          body: JSON.stringify({ domain }),
        });
        
        console.log('API response received:', data);
        return { success: true, data };
      } catch (error) {
        console.error('API call failed:', error);
        return { success: false, error: error.message };
      }
    };
    
    // Execute API call
    const apiResult = await apiCall();
    if (apiResult.success) {
      setAnalysisResults(apiResult.data);
    } else {
      setError(apiResult.error || 'Failed to fetch analysis');
    }
    
    setProgress(100);
    
    // End analysis state after showing results
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 1000);
  };

  // Mock generator removed – we only display real API results now

  // Loading animation management
  const startLoadingAnimation = () => {
    let currentAgentIndex = 0;
    let progressValue = 0;
    
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeRemaining(prevTime => {
        const newTime = prevTime - 1;
        if (newTime <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return newTime;
      });
    }, 1000);
    
    const processNextAgent = () => {
      if (currentAgentIndex >= mockAgentSteps.length) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        return;
      }
      
      const agent = mockAgentSteps[currentAgentIndex];
      
      // Set current agent as active
      setCurrentAgent(currentAgentIndex);
        setShowTypewriter(true);
        
        // Typewriter effect for agent message
        typeMessage(agent.message);
        
        // Progress calculation (each agent gets equal portion of progress)
        const progressPerAgent = 100 / mockAgentSteps.length;
      const targetProgress = (currentAgentIndex + 1) * progressPerAgent;
        
        // Animate progress over agent duration
        animateProgress(progressValue, targetProgress, agent.duration);
        progressValue = targetProgress;
        
      // Move to next agent
      currentAgentIndex++;
      
      // Schedule next agent after current one completes (with slight randomness for realism)
      const randomDelay = agent.duration + (Math.random() * 6000 - 3000); // ±3 seconds randomness
      setTimeout(() => {
        processNextAgent();
      }, Math.max(randomDelay, 30000)); // Minimum 30 seconds
    };
    
    // Start with first agent
    processNextAgent();
  };

  // Typewriter effect
  const typeMessage = (message) => {
    setAgentMessages('');
    let index = 0;
    
    // Clear any existing typewriter interval
    if (typewriterRef.current) {
      clearInterval(typewriterRef.current);
    }
    
    typewriterRef.current = setInterval(() => {
      if (index < message.length) {
        setAgentMessages(message.substring(0, index + 1));
        index++;
      } else {
        clearInterval(typewriterRef.current);
        typewriterRef.current = null;
      }
    }, 50); // 50ms per character
  };

  // Progress animation
  const animateProgress = (start, end, duration) => {
    const startTime = Date.now();
    
    // Clear any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      const currentProgress = start + (end - start) * progressRatio;
      
      setProgress(currentProgress);
      
      if (progressRatio < 1) {
        animationRef.current = requestAnimationFrame(updateProgress);
      } else {
        animationRef.current = null;
      }
    };
    
    updateProgress();
  };

  // Format time remaining display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper functions
  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getConfidenceColor = (confidence) => {
    const colors = {
      high: 'success',
      medium: 'warning',
      low: 'error'
    };
    return colors[confidence] || 'warning';
  };

  const toggleEvaluator = (evaluatorKey) => {
    setOpenEvaluators(prev => ({
      ...prev,
      [evaluatorKey]: !prev[evaluatorKey]
    }));
  };

  // Process API response for display
  const processedResults = analysisResults ? {
    // Prefer the master evaluator's score/grade from raw_output.data
    finalScore: analysisResults.evaluations?.master_comprehensive_evaluator?.raw_output?.data?.llm_readiness_score || 
                analysisResults.consensus?.reconciled_assessment?.final_llm_readiness_score || 0,
    letterGrade: analysisResults.evaluations?.master_comprehensive_evaluator?.raw_output?.data?.letter_grade || 
                 analysisResults.consensus?.reconciled_assessment?.letter_grade || 'N/A',
    confidenceLevel: analysisResults.consensus?.reconciled_assessment?.grade_confidence || 'medium',
    domain: analysisResults.domain || domain,
    analysisId: analysisResults.analysis_id || 'N/A',
    
    // Category scores: prefer consensus reconciled scores when present; fallback to master evaluator category scores
    categoryBreakdowns: (() => {
      const reconciled = analysisResults.consensus?.category_reconciliation;
      if (Array.isArray(reconciled) && reconciled.length > 0) {
        return reconciled.reduce((acc, item) => {
          if (item && item.category && (typeof item.reconciled_score === 'number')) {
            acc[item.category] = Math.round(item.reconciled_score);
          }
          return acc;
        }, {});
      }
      return analysisResults.evaluations?.master_comprehensive_evaluator?.raw_output?.data?.category_scores || {};
    })(),
    categoryDetails: analysisResults.evaluations?.master_comprehensive_evaluator?.raw_output?.data?.categories || [],
    
    // Master evaluator summary
    summary: analysisResults.evaluations?.master_comprehensive_evaluator?.raw_output?.data?.summary || '',
    llmVisibilityAssessment: analysisResults.evaluations?.master_comprehensive_evaluator?.raw_output?.data?.llm_visibility_assessment || '',
    evaluatorParamSummary: (() => {
      const summary = [];
      // Master Comprehensive Evaluator
      const masterCats = analysisResults.evaluations?.master_comprehensive_evaluator?.raw_output?.data?.categories || [];
      let masterTotal = 0, masterPassed = 0;
      masterCats.forEach(cat => {
        (cat.metrics || []).forEach(m => {
          masterTotal += 1;
          const max = typeof m.max_score === 'number' && m.max_score > 0 ? m.max_score : 0;
          const score = typeof m.score === 'number' ? m.score : 0;
          if (max > 0 && (score / max) * 100 >= 60) masterPassed += 1;
        });
      });
      summary.push({ evaluator: 'Master Comprehensive Evaluator', total: masterTotal, passed: masterPassed, failed: Math.max(masterTotal - masterPassed, 0) });

      // Technical Deep-Dive Validator
      const tech = analysisResults.evaluations?.["technical_deep-dive_validator"]?.raw_output || {};
      let techTotal = 0, techPassed = 0;
      (tech.technical_categories || []).forEach(cat => {
        (cat.sub_metrics || []).forEach(sub => {
          const vr = sub.validation_results || {};
          Object.keys(vr).forEach(k => {
            if (typeof vr[k] === 'boolean') {
              techTotal += 1;
              if (vr[k]) techPassed += 1;
            }
          });
        });
      });
      (tech.technical_tests_performed || []).forEach(test => {
        techTotal += 1;
        if ((test.status || '').toLowerCase() === 'passed') techPassed += 1;
      });
      summary.push({ evaluator: 'Technical Deep-Dive Validator', total: techTotal, passed: techPassed, failed: Math.max(techTotal - techPassed, 0) });

      // Content Quality & Trust Specialist
      const content = analysisResults.evaluations?.["content_quality_&_trust_specialist"]?.raw_output || {};
      let contTotal = 0, contPassed = 0;
      const contentBools = {
        author_contact_availability: content.author_analysis?.author_contact_availability,
        content_review_process_evidence: content.editorial_standards?.content_review_process_evidence,
        fact_checking_indicators: content.editorial_standards?.fact_checking_indicators,
        correction_policy_present: content.editorial_standards?.correction_policy_present,
        update_frequency_appropriate: content.editorial_standards?.update_frequency_appropriate,
        trust_badge_presence: content.institutional_credibility?.trust_badge_presence,
      };
      Object.values(contentBools).forEach(v => {
        if (typeof v === 'boolean') {
          contTotal += 1;
          if (v) contPassed += 1;
        }
      });
      (content.trust_signal_assessment || []).forEach(ts => {
        if (typeof ts.presence === 'boolean') {
          contTotal += 1;
          if (ts.presence) contPassed += 1;
        }
      });
      summary.push({ evaluator: 'Content Quality & Trust Specialist', total: contTotal, passed: contPassed, failed: Math.max(contTotal - contPassed, 0) });

      // Red Team Critic & Weakness Identifier
      const red = analysisResults.evaluations?.red_team_critic?.raw_output || {};
      const redFailed = ['critical_weaknesses_identified','systematic_problems','competitive_vulnerabilities','future_proofing_risks','hidden_technical_issues','critical_action_items']
        .reduce((acc, key) => acc + ((red[key] && Array.isArray(red[key])) ? red[key].length : 0), 0);
      summary.push({ evaluator: 'Red Team Critic & Weakness Identifier', total: redFailed, passed: 0, failed: redFailed });

      // Consensus Builder & Final Reconciliation
      const cons = analysisResults.consensus || {};
      let consTotal = 0, consPassed = 0;
      if (typeof cons.reconciliation_completed === 'boolean') {
        consTotal += 1; if (cons.reconciliation_completed) consPassed += 1;
      }
      (cons.category_reconciliation || []).forEach(item => {
        if (typeof item.reconciled_score === 'number') {
          consTotal += 1;
          if (item.reconciled_score >= 60) consPassed += 1;
        }
      });
      summary.push({ evaluator: 'Consensus Builder & Final Reconciliation', total: consTotal, passed: consPassed, failed: Math.max(consTotal - consPassed, 0) });

      return summary;
    })(),
    evaluatorParamDetails: (() => {
      const details = {};
      // Master Comprehensive Evaluator
      const masterCats = analysisResults.evaluations?.master_comprehensive_evaluator?.raw_output?.data?.categories || [];
      details['Master Comprehensive Evaluator'] = [];
      masterCats.forEach(cat => {
        (cat.metrics || []).forEach(m => {
          const max = typeof m.max_score === 'number' && m.max_score > 0 ? m.max_score : 0;
          const score = typeof m.score === 'number' ? m.score : 0;
          const passed = max > 0 ? (score / max) * 100 >= 60 : false;
          details['Master Comprehensive Evaluator'].push({
            name: `${cat.name} • ${m.name}`,
            value: `${score}/${max}`,
            passed
          });
        });
      });

      // Technical Deep-Dive Validator
      const tech = analysisResults.evaluations?.["technical_deep-dive_validator"]?.raw_output || {};
      details['Technical Deep-Dive Validator'] = [];
      (tech.technical_categories || []).forEach(cat => {
        (cat.sub_metrics || []).forEach(sub => {
          const vr = sub.validation_results || {};
          Object.keys(vr).forEach(k => {
            if (typeof vr[k] === 'boolean') {
              details['Technical Deep-Dive Validator'].push({
                name: `${cat.name} • ${sub.name} • ${k.replace(/_/g, ' ')}`,
                value: vr[k] ? 'yes' : 'no',
                passed: !!vr[k]
              });
            }
          });
        });
      });
      (tech.technical_tests_performed || []).forEach(test => {
        const status = (test.status || '').toLowerCase();
        details['Technical Deep-Dive Validator'].push({
          name: `Test • ${test.test_name}`,
          value: status,
          passed: status === 'passed'
        });
      });

      // Content Quality & Trust Specialist
      const content = analysisResults.evaluations?.["content_quality_&_trust_specialist"]?.raw_output || {};
      details['Content Quality & Trust Specialist'] = [];
      const contentBools = [
        ['Author Contact Available', content.author_analysis?.author_contact_availability],
        ['Review Process Evidence', content.editorial_standards?.content_review_process_evidence],
        ['Fact Checking Indicators', content.editorial_standards?.fact_checking_indicators],
        ['Correction Policy Present', content.editorial_standards?.correction_policy_present],
        ['Update Frequency Appropriate', content.editorial_standards?.update_frequency_appropriate],
        ['Trust Badge Presence', content.institutional_credibility?.trust_badge_presence],
      ];
      contentBools.forEach(([label, val]) => {
        if (typeof val === 'boolean') {
          details['Content Quality & Trust Specialist'].push({
            name: label,
            value: val ? 'yes' : 'no',
            passed: !!val
          });
        }
      });
      (content.trust_signal_assessment || []).forEach(ts => {
        if (typeof ts.presence === 'boolean') {
          details['Content Quality & Trust Specialist'].push({
            name: `Trust Signal • ${ts.signal_type}`,
            value: ts.presence ? 'present' : 'absent',
            passed: !!ts.presence
          });
        }
      });

      // Red Team Critic & Weakness Identifier
      const red = analysisResults.evaluations?.red_team_critic?.raw_output || {};
      details['Red Team Critic & Weakness Identifier'] = [];
      const redKeys = [
        ['Critical Weakness', red.critical_weaknesses_identified],
        ['Systematic Problem', red.systematic_problems],
        ['Competitive Vulnerability', red.competitive_vulnerabilities],
        ['Future-Proofing Risk', red.future_proofing_risks],
        ['Hidden Technical Issue', red.hidden_technical_issues],
        ['Critical Action Item', red.critical_action_items]
      ];
      redKeys.forEach(([label, arr]) => {
        (arr || []).forEach(item => {
          const title = item.issue || item.specific_issue || item.vulnerability || item.risk_description || item.action || 'Item';
          details['Red Team Critic & Weakness Identifier'].push({
            name: `${label} • ${title}`,
            value: 'present',
            passed: false
          });
        });
      });

      // Consensus Builder & Final Reconciliation
      const cons = analysisResults.consensus || {};
      details['Consensus Builder & Final Reconciliation'] = [];
      if (typeof cons.reconciliation_completed === 'boolean') {
        details['Consensus Builder & Final Reconciliation'].push({
          name: 'Reconciliation Completed',
          value: cons.reconciliation_completed ? 'yes' : 'no',
          passed: !!cons.reconciliation_completed
        });
      }
      (cons.category_reconciliation || []).forEach(item => {
        if (typeof item.reconciled_score === 'number') {
          details['Consensus Builder & Final Reconciliation'].push({
            name: `Category • ${item.category}`,
            value: `${Math.round(item.reconciled_score)}%`,
            passed: item.reconciled_score >= 60
          });
        }
      });

      return details;
    })(),
    
    // Individual evaluator data
    evaluators: {
      comprehensive: {
        score: analysisResults.evaluations?.master_comprehensive_evaluator?.raw_output?.data?.llm_readiness_score || 0,
        grade: analysisResults.evaluations?.master_comprehensive_evaluator?.raw_output?.data?.letter_grade || 'N/A',
        gradeDescriptive: analysisResults.evaluations?.master_comprehensive_evaluator?.raw_output?.data?.letter_grade_descriptive || '',
        summary: analysisResults.evaluations?.master_comprehensive_evaluator?.raw_output?.data?.summary || '',
        criticalItems: analysisResults.evaluations?.master_comprehensive_evaluator?.raw_output?.data?.top_5_critical_items || [],
        warnings: analysisResults.evaluations?.master_comprehensive_evaluator?.raw_output?.data?.top_5_warnings || [],
        categories: analysisResults.evaluations?.master_comprehensive_evaluator?.raw_output?.data?.categories || [],
        categoryScores: analysisResults.evaluations?.master_comprehensive_evaluator?.raw_output?.data?.category_scores || {}
      },
      technical: {
        score: analysisResults.evaluations?.["technical_deep-dive_validator"]?.raw_output?.technical_readiness_score || 0,
        confidenceLevel: analysisResults.evaluations?.["technical_deep-dive_validator"]?.raw_output?.confidence_level || 'medium',
        technicalCategories: analysisResults.evaluations?.["technical_deep-dive_validator"]?.raw_output?.technical_categories || [],
        technicalTests: analysisResults.evaluations?.["technical_deep-dive_validator"]?.raw_output?.technical_tests_performed || [],
        criticalIssues: analysisResults.evaluations?.["technical_deep-dive_validator"]?.raw_output?.critical_technical_issues || [],
        recommendations: analysisResults.evaluations?.["technical_deep-dive_validator"]?.raw_output?.technical_recommendations || []
      },
      contentQuality: {
        trustScore: analysisResults.evaluations?.["content_quality_&_trust_specialist"]?.raw_output?.content_trust_score || 0,
        confidenceLevel: analysisResults.evaluations?.["content_quality_&_trust_specialist"]?.raw_output?.confidence_level || 'medium',
        contentAnalysis: analysisResults.evaluations?.["content_quality_&_trust_specialist"]?.raw_output?.content_analysis || {},
        authorAnalysis: analysisResults.evaluations?.["content_quality_&_trust_specialist"]?.raw_output?.author_analysis || {},
        institutionalCredibility: analysisResults.evaluations?.["content_quality_&_trust_specialist"]?.raw_output?.institutional_credibility || {},
        editorialStandards: analysisResults.evaluations?.["content_quality_&_trust_specialist"]?.raw_output?.editorial_standards || {},
        trustSignals: analysisResults.evaluations?.["content_quality_&_trust_specialist"]?.raw_output?.trust_signal_assessment || [],
        credibilityIssues: analysisResults.evaluations?.["content_quality_&_trust_specialist"]?.raw_output?.content_credibility_issues || [],
        recommendations: analysisResults.evaluations?.["content_quality_&_trust_specialist"]?.raw_output?.content_recommendations || []
      },
      redTeam: {
        score: analysisResults.evaluations?.red_team_critic?.raw_output?.critical_assessment_score || 0,
        riskLevel: analysisResults.evaluations?.red_team_critic?.raw_output?.overall_risk_level || 'medium',
        confidenceLevel: analysisResults.evaluations?.red_team_critic?.raw_output?.confidence_level || 'medium',
        criticalWeaknesses: analysisResults.evaluations?.red_team_critic?.raw_output?.critical_weaknesses_identified || [],
        systematicProblems: analysisResults.evaluations?.red_team_critic?.raw_output?.systematic_problems || [],
        competitiveVulnerabilities: analysisResults.evaluations?.red_team_critic?.raw_output?.competitive_vulnerabilities || [],
        futureProofingRisks: analysisResults.evaluations?.red_team_critic?.raw_output?.future_proofing_risks || [],
        evidenceChallenges: analysisResults.evaluations?.red_team_critic?.raw_output?.evidence_challenges || [],
        hiddenTechnicalIssues: analysisResults.evaluations?.red_team_critic?.raw_output?.hidden_technical_issues || [],
        criticalActionItems: analysisResults.evaluations?.red_team_critic?.raw_output?.critical_action_items || [],
        overallRiskAssessment: analysisResults.evaluations?.red_team_critic?.raw_output?.overall_risk_assessment || {}
      },
      consensus: {
        evaluator: analysisResults.consensus?.evaluator || 'Consensus Builder & Final Reconciliation',
        assessmentDate: analysisResults.consensus?.assessment_date || '',
        reconciliationCompleted: analysisResults.consensus?.reconciliation_completed || false,
        evaluatorSummary: analysisResults.consensus?.evaluator_summary || {},
        reconciledAssessment: analysisResults.consensus?.reconciled_assessment || {},
        categoryReconciliation: analysisResults.consensus?.category_reconciliation || [],
        criticalConsensusFindings: analysisResults.consensus?.critical_consensus_findings || {},
        reconciledRecommendations: analysisResults.consensus?.reconciled_recommendations || {},
        qualityAssuranceSummary: analysisResults.consensus?.quality_assurance_summary || {},
        finalConsolidatedSummary: analysisResults.consensus?.final_consolidated_summary || ''
      }
    },
    
    // Recommendations
    recommendations: {
      immediate: analysisResults.consensus?.reconciled_recommendations?.immediate_priorities || [],
      strategic: analysisResults.consensus?.reconciled_recommendations?.strategic_initiatives || []
    }
  } : null;

  return (
    <div className="llm-analyzer">
      <div className="container">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <h1>LLM Readiness Analyzer</h1>
            <p className="hero-subtitle">
              5 Specialized AI Agents collaboratively evaluating your domain for AI visibility & trust
            </p>
            
            <div className="analyzer-input-section">
              <div className="input-group">
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="Enter domain (e.g., example.com)"
                  className="domain-input"
                  disabled={isAnalyzing}
                />
                <button
                  onClick={runAnalysis}
                  disabled={isAnalyzing || !domain.trim()}
                  className="cta-button"
                >
                  {isAnalyzing ? (
                    <>
                      <FontAwesomeIcon icon="spinner" spin />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon="search" />
                      <span>Run Analysis</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Previous Analyses */}
        {!isAnalyzing && (
          <div className="previous-analyses-section">
            <div className="process-container">
              <div className="process-header">
                <h2>Previous Analyses</h2>
                <p className="process-subtitle">Click a row to view details</p>
              </div>
              {isPrevLoading && (
                <div className="loading-inline">Loading previous analyses…</div>
              )}
              {prevError && (
                <div className="error-inline">{prevError}</div>
              )}
              {!isPrevLoading && !prevError && previousAnalyses.length === 0 && (
                <div className="empty-inline">No previous analyses found.</div>
              )}
              {!isPrevLoading && previousAnalyses.length > 0 && (
                <div className="category-table-container">
                  <div className="category-table">
                    <div className="table-header">
                      <div className="metric-col">Domain</div>
                      <div>Date</div>
                      <div>Analysis ID</div>
                    </div>
                    {previousAnalyses.map((item, idx) => {
                      const id = item.id || item.analysis_id || item.analysisId || idx;
                      const domainVal = item.domain || item.input?.domain || item.request?.domain || '—';
                      const dateStr = item.created_at || item.createdAt || item.timestamp || item.date || '';
                      return (
                        <div key={id} className="metric-row" onClick={() => openHistoryAnalysis(item)} style={{cursor:'pointer'}}>
                          <div className="metric-info">
                            <span className="metric-name">{domainVal}</span>
                          </div>
                          <div className="score-cell">{String(dateStr)}</div>
                          <div className="score-cell">{String(id)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analysis Process Overview */}
        {!isAnalyzing && !processedResults && !error && (
          <div className="process-overview-section">
            <div className="process-container">
              <div className="process-header">
                <h2>How Our AI Agent Analysis Works</h2>
                <p className="process-subtitle">
                  Our comprehensive evaluation system deploys 5 specialized AI agents that work in sequence to thoroughly assess your domain's readiness for AI platforms and LLM citation. Each agent brings unique expertise to analyze different aspects of your website.
                </p>
              </div>

              <div className="agents-overview">
                <h3 className="agents-section-title">Meet Our 5 Specialized AI Agents</h3>
                {mockAgentSteps.map((agent, index) => (
                  <div key={index} className="agent-preview-card">
                    <div className="agent-preview-header">
                      <div className="agent-preview-avatar">
                        <FontAwesomeIcon icon={agent.icon} />
                      </div>
                      <div className="agent-preview-info">
                        <h3>Agent {index + 1}: {agent.name}</h3>
                        <p className="agent-preview-message">{agent.message}</p>
                        <p className="agent-description">This agent specializes in analyzing specific parameters to ensure comprehensive evaluation.</p>
                      </div>
                      <div className="agent-step-number">Agent {index + 1}</div>
                    </div>
                    
                    <div className="agent-tests-preview">
                      <h4 className="agent-parameters-title">Agent Parameters & Analysis:</h4>
                      {index === 0 && (
                        <div className="test-categories">
                          <span className="test-tag">LLM Readability & Chunk Relevance</span>
                          <span className="test-tag">Semantic Density & Entity Coverage</span>
                          <span className="test-tag">Contextual Information Architecture</span>
                          <span className="test-tag">Content Structure Analysis</span>
                          <span className="test-tag">AI Citation Optimization</span>
                        </div>
                      )}
                      {index === 1 && (
                        <div className="test-categories">
                          <span className="test-tag">Schema Markup Quality</span>
                          <span className="test-tag">Knowledge Graph Compatibility</span>
                          <span className="test-tag">Content Extraction Efficiency</span>
                          <span className="test-tag">Processing Speed & Performance</span>
                          <span className="test-tag">AI Crawler Compatibility</span>
                          <span className="test-tag">Multimodal Technical Implementation</span>
                        </div>
                      )}
                      {index === 2 && (
                        <div className="test-categories">
                          <span className="test-tag">Citation Worthiness & Factual Accuracy</span>
                          <span className="test-tag">Source Authority & Expertise Signals</span>
                          <span className="test-tag">Author Analysis & Credibility</span>
                          <span className="test-tag">Institutional Trust Signals</span>
                          <span className="test-tag">Editorial Standards Assessment</span>
                        </div>
                      )}
                      {index === 3 && (
                        <div className="test-categories">
                          <span className="test-tag">Critical Weaknesses Identification</span>
                          <span className="test-tag">Systematic Problems Analysis</span>
                          <span className="test-tag">Competitive Vulnerabilities</span>
                          <span className="test-tag">Future-Proofing Risk Assessment</span>
                          <span className="test-tag">Hidden Technical Issues Detection</span>
                        </div>
                      )}
                      {index === 4 && (
                        <div className="test-categories">
                          <span className="test-tag">Multi-Agent Score Reconciliation</span>
                          <span className="test-tag">Cross-Agent Consensus Building</span>
                          <span className="test-tag">Final Assessment Validation</span>
                          <span className="test-tag">Prioritized Action Recommendations</span>
                          <span className="test-tag">Quality Assurance Summary</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="analysis-timeline">
                <h3>What to Expect from Our AI Agent Analysis</h3>
                <div className="timeline-items">
                  <div className="timeline-item">
                    <div className="timeline-icon">
                      <FontAwesomeIcon icon="clock" />
                    </div>
                    <div className="timeline-content">
                      <h4>Sequential Agent Deployment (3:30 minutes)</h4>
                      <p>Watch as each specialized AI agent performs deep analysis with multiple parameter evaluations and real-time validations</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-icon">
                      <FontAwesomeIcon icon="users" />
                    </div>
                    <div className="timeline-content">
                      <h4>Multi-Agent Comprehensive Scanning</h4>
                      <p>Our 5 AI agents collaborate to analyze your site structure, content quality, technical implementation, and AI readiness parameters</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-icon">
                      <FontAwesomeIcon icon="chart-line" />
                    </div>
                    <div className="timeline-content">
                      <h4>Agent-Consensus Scoring & Recommendations</h4>
                      <p>Receive multi-agent validated insights with prioritized recommendations based on cross-agent analysis and consensus building</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="key-metrics">
                <h3>Key Areas Our AI Agents Evaluate</h3>
                <div className="metrics-grid">
                  <div className="metric-preview">
                    <FontAwesomeIcon icon="robot" className="metric-icon" />
                    <h4>AI Content Processing</h4>
                    <p>Comprehensive analysis of how well AI systems can understand and extract information from your content structure and semantic elements</p>
                  </div>
                  <div className="metric-preview">
                    <FontAwesomeIcon icon="shield-alt" className="metric-icon" />
                    <h4>Trust & Citation Signals</h4>
                    <p>Deep evaluation of authority markers, credibility indicators, and trust parameters that influence AI citation decisions</p>
                  </div>
                  <div className="metric-preview">
                    <FontAwesomeIcon icon="cogs" className="metric-icon" />
                    <h4>Technical AI Accessibility</h4>
                    <p>Thorough assessment of schema markup, structured data implementation, and technical optimization for AI crawler compatibility</p>
                  </div>
                  <div className="metric-preview">
                    <FontAwesomeIcon icon="users" className="metric-icon" />
                    <h4>User-AI Interaction</h4>
                    <p>Strategic optimization analysis for conversational queries, voice search compatibility, and AI-driven user engagement metrics</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Experience */}
        {isAnalyzing && (
          <div className="loading-section">
            <div className="loading-container">
              <div className="loading-header">
                <h2>AI Agent Analysis in Progress</h2>
                <div className="time-remaining">
                  Agent deployment time remaining: {formatTime(timeRemaining)}
                </div>
                <p className="agent-progress-subtitle">
                  Our specialized AI agents are working sequentially to analyze your domain parameters
                </p>
              </div>

              {/* Progress Bar */}
              <div className="progress-container">
                <div className="progress-label">Multi-Agent Analysis Progress</div>
                <div className="progress-bar-main">
                  <div 
                    className="progress-fill-main" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="progress-text-main">{Math.round(progress)}% Complete</div>
              </div>

              {/* Agent Cards */}
              <div className="agent-cards">
                {mockAgentSteps.map((agent, index) => (
                  <div 
                    key={index} 
                    className={`agent-card ${index === currentAgent ? 'active' : index < currentAgent ? 'completed' : 'pending'}`}
                  >
                    <div className="agent-header">
                      <div className="agent-avatar">
                        <FontAwesomeIcon icon={agent.icon} />
                      </div>
                      <div className="agent-info">
                        <h3>AI Agent {index + 1}: {agent.name}</h3>
                        {index === currentAgent && (
                          <div className="agent-message">
                            <span className="agent-status">🤖 Agent Active:</span> {agentMessages}
                            {showTypewriter && <span className="cursor">|</span>}
                          </div>
                        )}
                        {index < currentAgent && (
                          <div className="agent-completed">
                            <FontAwesomeIcon icon="check-circle" />
                            Agent analysis complete
                          </div>
                        )}
                        {index > currentAgent && (
                          <div className="agent-pending">Agent waiting for deployment...</div>
                        )}
                      </div>
                    </div>
                    
                    {/* Running tests animation for active agent */}
                    {index === currentAgent && (
                      <div className="running-tests">
                        <div className="test-dots">
                          <span className="dot"></span>
                          <span className="dot"></span>
                          <span className="dot"></span>
                        </div>
                        <span>Agent analyzing parameters...</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {timeRemaining < 10 && (
                <div className="extended-analysis">
                  Final agent validations in progress… cross-agent parameter verification underway.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="error-section">
            <div className="error-container">
              <FontAwesomeIcon icon="exclamation-triangle" />
              <h3>Analysis Failed</h3>
              <p>{error}</p>
              <button onClick={() => setError(null)} className="retry-button">
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Results Section */}
        {processedResults && !isAnalyzing && (
          <div className="results-section" ref={resultsRef}>
            {/* Summary Card */}
            <div className="summary-card">
              <div className="summary-header">
                <h2>Analysis Results for {processedResults.domain}</h2>
                <div className="analysis-meta">
                  <span className="analysis-id">Analysis ID: {processedResults.analysisId}</span>
                </div>
              </div>
              
              <div className="summary-content">
                  <div className="score-display">
                    <div className="final-score">
                      <div className={`score-circle ${getScoreColor(processedResults.finalScore)}`}>
                        <span className="score-number">{processedResults.finalScore}</span>
                        <span className="score-label">LLM Readiness</span>
                      </div>
                    </div>
                    
                    <div className="score-details">
                      <div className="grade-display">
                        <span className="grade-label">Grade:</span>
                        <span className={`grade-value ${getScoreColor(processedResults.finalScore)}`}>
                          {processedResults.letterGrade}
                        {processedResults.evaluators.comprehensive.gradeDescriptive && 
                          <span className="grade-descriptive">({processedResults.evaluators.comprehensive.gradeDescriptive})</span>
                        }
                        </span>
                      </div>
                      
                      <div className="confidence-display">
                        <span className="confidence-label">Confidence:</span>
                        <span className={`confidence-value ${getConfidenceColor(processedResults.confidenceLevel)}`}>
                          <FontAwesomeIcon 
                            icon={processedResults.confidenceLevel === 'high' ? 'check-circle' : 
                                  processedResults.confidenceLevel === 'medium' ? 'exclamation-circle' : 'times-circle'} 
                          />
                          {processedResults.confidenceLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="progress-section">
                    <div className="progress-label">Overall LLM Readiness Score</div>
                    <div className="progress-bar">
                      <div 
                        className={`progress-fill ${getScoreColor(processedResults.finalScore)}`}
                        style={{ width: `${processedResults.finalScore}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">{processedResults.finalScore}/100</div>
                  </div>

                {/* Summary Text */}
                {processedResults.summary && (
                  <div className="summary-text">
                    <h4>Executive Summary</h4>
                    <p>{processedResults.summary}</p>
                  </div>
                )}

                {/* LLM Visibility Assessment */}
                {processedResults.llmVisibilityAssessment && (
                  <div className="visibility-assessment">
                    <h4>AI Visibility Assessment</h4>
                    <p>{processedResults.llmVisibilityAssessment}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Parameter Summary by Evaluator */}
            <div className="visualization-section">
              <h3>Parameter Summary by Evaluator</h3>
              <div className="category-table-container">
                <div className="category-table">
                  <div className="table-header">
                    <div className="metric-col">Evaluator</div>
                    <div>Total Params</div>
                    <div>Passed</div>
                    <div>Failed</div>
                  </div>
                  {processedResults.evaluatorParamSummary.map(item => (
                    <div key={item.evaluator} className="metric-row" onClick={() => setOpenParamRows(prev => ({...prev, [item.evaluator]: !prev[item.evaluator]}))}>
                      <div className="metric-info">
                        <span className="metric-name">{item.evaluator}</span>
                      </div>
                      <div className="score-cell">{item.total}</div>
                      <div className="score-cell good">{item.passed}</div>
                      <div className="score-cell poor">{item.failed}</div>
                    </div>
                  ))}
                  {/* Row details */}
                  {processedResults.evaluatorParamSummary.map(item => (
                    openParamRows[item.evaluator] ? (
                      <div key={`${item.evaluator}-details`} className="metric-row details-row">
                        <div className="details-cell" style={{ gridColumn: '1 / -1' }}>
                          <div className="param-details-list">
                            {processedResults.evaluatorParamDetails[item.evaluator]?.map((p, idx) => (
                              <div key={idx} className={`param-detail ${p.passed ? 'pass' : 'fail'}`}>
                                <span className="param-name">{p.name}</span>
                                <span className="param-value">{p.value}</span>
                                <span className={`param-status ${p.passed ? 'good' : 'poor'}`}>{p.passed ? 'Pass' : 'Fail'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : null
                  ))}
                  {(() => {
                    const totals = processedResults.evaluatorParamSummary.reduce((acc, it) => {
                      acc.total += it.total || 0;
                      acc.passed += it.passed || 0;
                      acc.failed += it.failed || 0;
                      return acc;
                    }, { total: 0, passed: 0, failed: 0 });
                    return (
                      <div className="metric-row">
                        <div className="metric-info">
                          <span className="metric-name"><strong>Total</strong></span>
                        </div>
                        <div className="score-cell"><strong>{totals.total}</strong></div>
                        <div className="score-cell good"><strong>{totals.passed}</strong></div>
                        <div className="score-cell poor"><strong>{totals.failed}</strong></div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Detailed Category Metrics */}
              {processedResults.categoryDetails.length > 0 && (
                <div className="detailed-categories">
                  <h4>Detailed Category Analysis</h4>
                  {processedResults.categoryDetails.map((category, index) => (
                    <div key={index} className="category-detail-card">
                      <div className="category-detail-header">
                        <h5>{category.name}</h5>
                        <div className="category-scores">
                          <span className="category-score">{category.score}/{category.max_score}</span>
                          <span className={`category-percentage ${getScoreColor((category.score / category.max_score) * 100)}`}>
                            {Math.round((category.score / category.max_score) * 100)}%
                          </span>
                        </div>
                      </div>
                      
                      {category.metrics && (
                        <div className="category-metrics">
                          {category.metrics.map((metric, metricIndex) => (
                            <div key={metricIndex} className="metric-item">
                              <div className="metric-header">
                                <span className="metric-name">{metric.name}</span>
                                <span className="metric-score">{metric.score}/{metric.max_score}</span>
                              </div>
                              {metric.comments && (
                                <p className="metric-comment">{metric.comments}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Evaluator Panels */}
            <div className="evaluators-section">
              <h3>Detailed Evaluator Results</h3>
              
              <div className="evaluator-panels">
                {/* Master Comprehensive Evaluator */}
                <div className="evaluator-panel">
                  <div 
                    className="evaluator-header"
                    onClick={() => toggleEvaluator('comprehensive')}
                  >
                    <h4>Master Comprehensive Evaluator</h4>
                    <div className="evaluator-summary">
                      <span className={`evaluator-score ${getScoreColor(processedResults.evaluators.comprehensive.score)}`}>
                        Score: {processedResults.evaluators.comprehensive.score} ({processedResults.evaluators.comprehensive.grade})
                      </span>
                      <FontAwesomeIcon 
                        icon={openEvaluators.comprehensive ? 'chevron-up' : 'chevron-down'} 
                      />
                    </div>
                  </div>
                  
                  {openEvaluators.comprehensive && (
                    <div className="evaluator-content">
                      {processedResults.evaluators.comprehensive.summary && (
                      <div className="content-section">
                          <h5>Summary</h5>
                          <p className="evaluator-summary-text">{processedResults.evaluators.comprehensive.summary}</p>
                        </div>
                      )}
                      
                      {/* Category Scores */}
                      {Object.keys(processedResults.evaluators.comprehensive.categoryScores).length > 0 && (
                        <div className="content-section">
                          <h5>Category Scores</h5>
                          <div className="category-scores-grid">
                            {Object.entries(processedResults.evaluators.comprehensive.categoryScores).map(([category, score]) => (
                              <div key={category} className="category-score-item">
                                <span className="category-name">{category}</span>
                                <span className={`category-score ${getScoreColor(score)}`}>{score}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {processedResults.categoryDetails.length > 0 && (
                        <div className="content-section">
                          <h5>Detailed Category Analysis</h5>
                          <div className="detailed-categories">
                            {processedResults.categoryDetails.map((category, index) => (
                              <div key={index} className="category-detail-card">
                                <div className="category-detail-header">
                                  <h6>{category.name}</h6>
                                  <div className="category-scores">
                                    <span className="category-score">{category.score}/{category.max_score}</span>
                                    <span className={`category-percentage ${getScoreColor((category.score / category.max_score) * 100)}`}>
                                      {Math.round((category.score / category.max_score) * 100)}%
                                    </span>
                                  </div>
                                </div>
                                {category.metrics && (
                                  <div className="category-metrics">
                                    {category.metrics.map((metric, metricIndex) => (
                                      <div key={metricIndex} className="metric-item">
                                        <div className="metric-header">
                                          <span className="metric-name">{metric.name}</span>
                                          <span className="metric-score">{metric.score}/{metric.max_score}</span>
                                        </div>
                                        {metric.comments && (
                                          <p className="metric-comment">{metric.comments}</p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="content-section">
                        <h5>Top 5 Critical Items</h5>
                        <ul>
                          {processedResults.evaluators.comprehensive.criticalItems.map((item, index) => (
                            <li key={index} className="critical-item">
                              <FontAwesomeIcon icon="exclamation-triangle" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="content-section">
                        <h5>Top 5 Warnings</h5>
                        <ul>
                          {processedResults.evaluators.comprehensive.warnings.map((warning, index) => (
                            <li key={index} className="warning-item">
                              <FontAwesomeIcon icon="exclamation-circle" />
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Technical Deep-Dive Validator */}
                <div className="evaluator-panel">
                  <div 
                    className="evaluator-header"
                    onClick={() => toggleEvaluator('technical')}
                  >
                    <h4>Technical Deep-Dive Validator</h4>
                    <div className="evaluator-summary">
                      <span className={`evaluator-score ${getScoreColor(processedResults.evaluators.technical.score)}`}>
                        Score: {processedResults.evaluators.technical.score}
                      </span>
                      <span className={`confidence-badge ${getConfidenceColor(processedResults.evaluators.technical.confidenceLevel)}`}>
                        {processedResults.evaluators.technical.confidenceLevel} confidence
                      </span>
                      <FontAwesomeIcon 
                        icon={openEvaluators.technical ? 'chevron-up' : 'chevron-down'} 
                      />
                    </div>
                  </div>
                  
                  {openEvaluators.technical && (
                    <div className="evaluator-content">
                      {/* Technical Categories */}
                      {processedResults.evaluators.technical.technicalCategories.length > 0 && (
                        <div className="content-section">
                          <h5>Technical Categories</h5>
                          <div className="technical-categories">
                            {processedResults.evaluators.technical.technicalCategories.map((category, index) => (
                              <div key={index} className="technical-category-item">
                                <div className="category-header">
                                  <h6>{category.name}</h6>
                                  <span className={`category-score ${getScoreColor((category.score / category.max_score) * 100)}`}>
                                    {category.score}/{category.max_score}
                                  </span>
                                </div>
                                {category.sub_metrics && (
                                  <div className="sub-metrics">
                                    {category.sub_metrics.map((metric, metricIndex) => (
                                      <div key={metricIndex} className="sub-metric">
                                        <span className="metric-name">{metric.name}</span>
                                        <span className="metric-score">{metric.score}</span>
                                        {metric.validation_results && (
                                          <div className="validation-results">
                                            {Object.entries(metric.validation_results).map(([key, value]) => (
                                              <div key={key} className="validation-item">
                                                <span className="validation-key">{key.replace(/_/g, ' ')}:</span>
                                                <span className="validation-value">
                                                  {typeof value === 'boolean' ? (value ? '✓' : '✗') : value}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="content-section">
                        <h5>Technical Tests Performed</h5>
                        <div className="technical-tests">
                          {processedResults.evaluators.technical.technicalTests.map((test, index) => (
                            <div key={index} className="test-item">
                              <div className="test-header">
                              <FontAwesomeIcon 
                                  icon={test.status === 'passed' ? 'check-circle' : 'times-circle'} 
                                  className={test.status === 'passed' ? 'success' : 'error'}
                              />
                                <span className={test.status === 'passed' ? 'test-passed' : 'test-failed'}>
                                  {test.test_name}
                              </span>
                            </div>
                              {test.details && <p className="test-details">{test.details}</p>}
                              {test.extraction_rate && <p className="test-rate">Extraction Rate: {test.extraction_rate}</p>}
                              {test.load_time_desktop && (
                                <div className="performance-metrics">
                                  <span>Desktop: {test.load_time_desktop}</span>
                                  <span>Mobile: {test.load_time_mobile}</span>
                                </div>
                              )}
                              {test.errors_found && test.errors_found.length > 0 && (
                                <div className="test-errors">
                                  <h6>Errors Found:</h6>
                                  <ul>
                                    {test.errors_found.map((error, errorIndex) => (
                                      <li key={errorIndex}>{error}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="content-section">
                        <h5>Critical Technical Issues</h5>
                        <ul>
                          {processedResults.evaluators.technical.criticalIssues.map((issue, index) => (
                            <li key={index} className="critical-item">
                              <div className="issue-header">
                              <FontAwesomeIcon icon="exclamation-triangle" />
                                <span className={`severity-badge ${issue.severity}`}>{issue.severity}</span>
                              </div>
                              <div className="issue-content">
                                <p className="issue-description">{issue.issue}</p>
                                <p className="issue-impact">{issue.impact}</p>
                                {issue.estimated_fix_time && (
                                  <p className="fix-time">Estimated fix time: {issue.estimated_fix_time}</p>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {processedResults.evaluators.technical.recommendations.length > 0 && (
                        <div className="content-section">
                          <h5>Technical Recommendations</h5>
                          <div className="recommendations-list">
                            {processedResults.evaluators.technical.recommendations.map((rec, index) => (
                              <div key={index} className="recommendation-item">
                                <div className="rec-header">
                                  <span className="rec-priority">Priority {rec.priority}</span>
                                  <span className={`rec-complexity ${rec.technical_complexity}`}>
                                    {rec.technical_complexity} complexity
                                  </span>
                                </div>
                                <p className="rec-action">{rec.action}</p>
                                <p className="rec-improvement">Expected improvement: {rec.expected_improvement}</p>
                                {rec.implementation_steps && (
                                  <div className="implementation-steps">
                                    <h6>Implementation Steps:</h6>
                                    <ol>
                                      {rec.implementation_steps.map((step, stepIndex) => (
                                        <li key={stepIndex}>{step}</li>
                                      ))}
                                    </ol>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Content Quality & Trust Specialist */}
                <div className="evaluator-panel">
                  <div 
                    className="evaluator-header"
                    onClick={() => toggleEvaluator('contentQuality')}
                  >
                    <h4>Content Quality & Trust Specialist</h4>
                    <div className="evaluator-summary">
                      <span className={`evaluator-score ${getScoreColor(processedResults.evaluators.contentQuality.trustScore)}`}>
                        Score: {processedResults.evaluators.contentQuality.trustScore}
                      </span>
                      <span className={`confidence-badge ${getConfidenceColor(processedResults.evaluators.contentQuality.confidenceLevel)}`}>
                        {processedResults.evaluators.contentQuality.confidenceLevel} confidence
                      </span>
                      <FontAwesomeIcon 
                        icon={openEvaluators.contentQuality ? 'chevron-up' : 'chevron-down'} 
                      />
                    </div>
                  </div>
                  
                  {openEvaluators.contentQuality && (
                    <div className="evaluator-content">
                      {/* Content Analysis */}
                      {Object.keys(processedResults.evaluators.contentQuality.contentAnalysis).length > 0 && (
                        <div className="content-section">
                          <h5>Content Analysis</h5>
                          <div className="analysis-metrics">
                            {processedResults.evaluators.contentQuality.contentAnalysis.total_pages_analyzed && (
                              <div className="metric-row">
                                <span className="metric-label">Pages Analyzed:</span>
                                <span className="metric-value">{processedResults.evaluators.contentQuality.contentAnalysis.total_pages_analyzed}</span>
                        </div>
                            )}
                            {processedResults.evaluators.contentQuality.contentAnalysis.total_claims_identified && (
                              <div className="metric-row">
                                <span className="metric-label">Claims Identified:</span>
                                <span className="metric-value">{processedResults.evaluators.contentQuality.contentAnalysis.total_claims_identified}</span>
                              </div>
                            )}
                            {processedResults.evaluators.contentQuality.contentAnalysis.verification_ratio && (
                              <div className="metric-row">
                                <span className="metric-label">Verification Ratio:</span>
                                <span className={`metric-value ${getScoreColor(processedResults.evaluators.contentQuality.contentAnalysis.verification_ratio * 100)}`}>
                                  {Math.round(processedResults.evaluators.contentQuality.contentAnalysis.verification_ratio * 100)}%
                                </span>
                              </div>
                            )}
                            {processedResults.evaluators.contentQuality.contentAnalysis.citation_quality_score && (
                              <div className="metric-row">
                          <span className="metric-label">Citation Quality:</span>
                                <span className={`metric-value ${getScoreColor(processedResults.evaluators.contentQuality.contentAnalysis.citation_quality_score)}`}>
                                  {processedResults.evaluators.contentQuality.contentAnalysis.citation_quality_score}/100
                                </span>
                        </div>
                            )}
                      </div>
                        </div>
                      )}
                      
                      {/* Author Analysis */}
                      {Object.keys(processedResults.evaluators.contentQuality.authorAnalysis).length > 0 && (
                      <div className="content-section">
                          <h5>Author Analysis</h5>
                          <div className="analysis-metrics">
                            {processedResults.evaluators.contentQuality.authorAnalysis.authored_content_percentage && (
                              <div className="metric-row">
                                <span className="metric-label">Authored Content:</span>
                                <span className="metric-value">{processedResults.evaluators.contentQuality.authorAnalysis.authored_content_percentage}%</span>
                              </div>
                            )}
                            {processedResults.evaluators.contentQuality.authorAnalysis.author_bio_completeness && (
                              <div className="metric-row">
                                <span className="metric-label">Bio Completeness:</span>
                                <span className={`metric-value ${getScoreColor(processedResults.evaluators.contentQuality.authorAnalysis.author_bio_completeness)}`}>
                                  {processedResults.evaluators.contentQuality.authorAnalysis.author_bio_completeness}/100
                                </span>
                              </div>
                            )}
                            {processedResults.evaluators.contentQuality.authorAnalysis.credentials_relevance_score && (
                              <div className="metric-row">
                                <span className="metric-label">Credentials Relevance:</span>
                                <span className={`metric-value ${getScoreColor(processedResults.evaluators.contentQuality.authorAnalysis.credentials_relevance_score)}`}>
                                  {processedResults.evaluators.contentQuality.authorAnalysis.credentials_relevance_score}/100
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Institutional Credibility */}
                      {Object.keys(processedResults.evaluators.contentQuality.institutionalCredibility).length > 0 && (
                        <div className="content-section">
                          <h5>Institutional Credibility</h5>
                          <div className="analysis-metrics">
                            {processedResults.evaluators.contentQuality.institutionalCredibility.about_page_quality_score && (
                              <div className="metric-row">
                                <span className="metric-label">About Page Quality:</span>
                                <span className={`metric-value ${getScoreColor(processedResults.evaluators.contentQuality.institutionalCredibility.about_page_quality_score)}`}>
                                  {processedResults.evaluators.contentQuality.institutionalCredibility.about_page_quality_score}/100
                                </span>
                              </div>
                            )}
                            {processedResults.evaluators.contentQuality.institutionalCredibility.contact_information_completeness && (
                              <div className="metric-row">
                                <span className="metric-label">Contact Info Completeness:</span>
                                <span className={`metric-value ${getScoreColor(processedResults.evaluators.contentQuality.institutionalCredibility.contact_information_completeness)}`}>
                                  {processedResults.evaluators.contentQuality.institutionalCredibility.contact_information_completeness}/100
                                </span>
                              </div>
                            )}
                            {processedResults.evaluators.contentQuality.institutionalCredibility.organizational_transparency && (
                              <div className="metric-row">
                                <span className="metric-label">Organizational Transparency:</span>
                                <span className={`metric-value ${getScoreColor(processedResults.evaluators.contentQuality.institutionalCredibility.organizational_transparency)}`}>
                                  {processedResults.evaluators.contentQuality.institutionalCredibility.organizational_transparency}/100
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Trust Signal Assessment */}
                      {processedResults.evaluators.contentQuality.trustSignals.length > 0 && (
                        <div className="content-section">
                          <h5>Trust Signal Assessment</h5>
                          <div className="trust-signals">
                            {processedResults.evaluators.contentQuality.trustSignals.map((signal, index) => (
                              <div key={index} className="trust-signal-item">
                                <div className="signal-header">
                                  <span className="signal-type">{signal.signal_type}</span>
                                  <span className={`signal-presence ${signal.presence ? 'present' : 'absent'}`}>
                                    {signal.presence ? '✓ Present' : '✗ Absent'}
                                  </span>
                                </div>
                                <div className="signal-details">
                                  <span className="signal-quality">Quality: {signal.quality}/100</span>
                                  <span className={`signal-impact impact-${signal.impact_on_ai_citation}`}>
                                    AI Citation Impact: {signal.impact_on_ai_citation}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Content Credibility Issues */}
                      {processedResults.evaluators.contentQuality.credibilityIssues.length > 0 && (
                        <div className="content-section">
                          <h5>Content Credibility Issues</h5>
                          <ul>
                            {processedResults.evaluators.contentQuality.credibilityIssues.map((issue, index) => (
                              <li key={index} className="credibility-issue">
                                <div className="issue-header">
                                  <FontAwesomeIcon icon="exclamation-triangle" />
                                  <span className={`severity-badge ${issue.severity}`}>{issue.severity}</span>
                                </div>
                                <div className="issue-content">
                                  <p className="issue-description">{issue.issue}</p>
                                  <p className="issue-impact">{issue.impact}</p>
                                  {issue.pages_affected && (
                                    <p className="pages-affected">Pages affected: {issue.pages_affected}</p>
                                  )}
                                </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                      )}
                      
                      {/* Content Recommendations */}
                      {processedResults.evaluators.contentQuality.recommendations.length > 0 && (
                        <div className="content-section">
                          <h5>Content Recommendations</h5>
                          <div className="recommendations-list">
                            {processedResults.evaluators.contentQuality.recommendations.map((rec, index) => (
                              <div key={index} className="recommendation-item">
                                <div className="rec-header">
                                  <span className="rec-priority">Priority {rec.priority}</span>
                                  <span className={`rec-effort ${rec.effort_level}`}>{rec.effort_level} effort</span>
                                </div>
                                <p className="rec-action">{rec.action}</p>
                                <p className="rec-improvement">Expected improvement: {rec.expected_credibility_improvement}</p>
                                <p className="ai-impact">AI Citation Impact: {rec.ai_citation_impact}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Red Team Critic */}
                <div className="evaluator-panel">
                  <div 
                    className="evaluator-header"
                    onClick={() => toggleEvaluator('redTeam')}
                  >
                    <h4>Red Team Critic & Weakness Identifier</h4>
                    <div className="evaluator-summary">
                      <span className={`evaluator-score ${getScoreColor(processedResults.evaluators.redTeam.score)}`}>
                        Score: {processedResults.evaluators.redTeam.score}
                      </span>
                      <span className={`risk-badge ${getConfidenceColor(processedResults.evaluators.redTeam.riskLevel)}`}>
                        {processedResults.evaluators.redTeam.riskLevel} risk
                      </span>
                      <span className={`confidence-badge ${getConfidenceColor(processedResults.evaluators.redTeam.confidenceLevel)}`}>
                        {processedResults.evaluators.redTeam.confidenceLevel} confidence
                      </span>
                      <FontAwesomeIcon 
                        icon={openEvaluators.redTeam ? 'chevron-up' : 'chevron-down'} 
                      />
                    </div>
                  </div>
                  
                  {openEvaluators.redTeam && (
                    <div className="evaluator-content">
                      {/* Critical Weaknesses */}
                      {processedResults.evaluators.redTeam.criticalWeaknesses.length > 0 && (
                      <div className="content-section">
                        <h5>Critical Weaknesses Identified</h5>
                          <div className="weaknesses-list">
                          {processedResults.evaluators.redTeam.criticalWeaknesses.map((weakness, index) => (
                              <div key={index} className="weakness-item">
                                <div className="weakness-header">
                              <FontAwesomeIcon icon="shield-alt" />
                                  <span className={`severity-badge ${weakness.severity}`}>{weakness.severity}</span>
                                  <span className="weakness-category">{weakness.weakness_category}</span>
                                </div>
                                <div className="weakness-content">
                                  <p className="weakness-issue">{weakness.specific_issue}</p>
                                  {weakness.evidence && <p className="weakness-evidence">Evidence: {weakness.evidence}</p>}
                                  <p className="weakness-impact">{weakness.potential_impact}</p>
                                  {weakness.pages_affected && <p className="pages-affected">Pages affected: {weakness.pages_affected}</p>}
                                  <div className="weakness-metrics">
                                    <span className="competitive-risk">Competitive Risk: {weakness.competitive_risk}</span>
                                    <span className="failure-likelihood">Failure Likelihood: {weakness.failure_likelihood}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                      </div>
                        </div>
                      )}
                      
                      {/* Systematic Problems */}
                      {processedResults.evaluators.redTeam.systematicProblems.length > 0 && (
                        <div className="content-section">
                          <h5>Systematic Problems</h5>
                          <div className="systematic-problems">
                            {processedResults.evaluators.redTeam.systematicProblems.map((problem, index) => (
                              <div key={index} className="problem-item">
                                <h6>{problem.problem_type}</h6>
                                <div className="problem-details">
                                  <p><strong>Scope:</strong> {problem.scope}</p>
                                  <p><strong>Root Cause:</strong> {problem.root_cause}</p>
                                  <p><strong>Cascading Effects:</strong> {problem.cascading_effects}</p>
                                  <p><strong>Fix Complexity:</strong> {problem.fix_complexity}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Competitive Vulnerabilities */}
                      {processedResults.evaluators.redTeam.competitiveVulnerabilities.length > 0 && (
                        <div className="content-section">
                          <h5>Competitive Vulnerabilities</h5>
                          <div className="vulnerabilities-list">
                            {processedResults.evaluators.redTeam.competitiveVulnerabilities.map((vuln, index) => (
                              <div key={index} className="vulnerability-item">
                                <h6>{vuln.vulnerability}</h6>
                                <p className="competitive-gap">{vuln.competitive_gap}</p>
                                <div className="vulnerability-metrics">
                                  <span className="market-impact">Market Impact: {vuln.market_impact}</span>
                                  <span className="catch-up-difficulty">Catch-up Difficulty: {vuln.catch_up_difficulty}</span>
                                  <span className="strategic-risk">Strategic Risk: {vuln.strategic_risk}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Future-Proofing Risks */}
                      {processedResults.evaluators.redTeam.futureProofingRisks.length > 0 && (
                      <div className="content-section">
                        <h5>Future-Proofing Risks</h5>
                          <div className="future-risks">
                          {processedResults.evaluators.redTeam.futureProofingRisks.map((risk, index) => (
                              <div key={index} className="future-risk-item">
                                <div className="risk-header">
                              <FontAwesomeIcon icon="exclamation-triangle" />
                                  <span className="risk-type">{risk.risk_type}</span>
                                </div>
                                <p className="risk-description">{risk.risk_description}</p>
                                <p className="current-vulnerability">{risk.current_vulnerability}</p>
                                <div className="risk-metrics">
                                  <span className="mitigation-complexity">Mitigation: {risk.mitigation_complexity}</span>
                                  <span className="timeline-concern">Timeline: {risk.timeline_concern}</span>
                                </div>
                              </div>
                            ))}
                      </div>
                    </div>
                  )}
                      
                      {/* Evidence Challenges */}
                      {processedResults.evaluators.redTeam.evidenceChallenges.length > 0 && (
                        <div className="content-section">
                          <h5>Evidence Challenges</h5>
                          <div className="evidence-challenges">
                            {processedResults.evaluators.redTeam.evidenceChallenges.map((challenge, index) => (
                              <div key={index} className="challenge-item">
                                <h6>Challenged Claim</h6>
                                <p className="challenged-claim">{challenge.challenged_claim}</p>
                                <p className="counter-evidence"><strong>Counter-evidence:</strong> {challenge.counter_evidence}</p>
                                <p className="reliability-concern"><strong>Reliability Concern:</strong> {challenge.reliability_concern}</p>
                                <p className="recommended-evaluation"><strong>Recommended Re-evaluation:</strong> {challenge.recommended_re_evaluation}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Hidden Technical Issues */}
                      {processedResults.evaluators.redTeam.hiddenTechnicalIssues.length > 0 && (
                        <div className="content-section">
                          <h5>Hidden Technical Issues</h5>
                          <div className="hidden-issues">
                            {processedResults.evaluators.redTeam.hiddenTechnicalIssues.map((issue, index) => (
                              <div key={index} className="hidden-issue-item">
                                <div className="issue-header">
                                  <FontAwesomeIcon icon="bug" />
                                  <span className={`urgency-badge ${issue.fix_urgency}`}>{issue.fix_urgency}</span>
                                </div>
                                <p className="issue-description">{issue.issue}</p>
                                <p className="detection-method"><strong>Detection Method:</strong> {issue.detection_method}</p>
                                <p className="ai-impact"><strong>AI Impact:</strong> {issue.ai_impact}</p>
                                <p className="user-impact"><strong>User Impact:</strong> {issue.user_impact}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Critical Action Items */}
                      {processedResults.evaluators.redTeam.criticalActionItems.length > 0 && (
                        <div className="content-section">
                          <h5>Critical Action Items</h5>
                          <div className="action-items">
                            {processedResults.evaluators.redTeam.criticalActionItems.map((item, index) => (
                              <div key={index} className="action-item">
                                <div className="action-header">
                                  <span className="action-priority">Priority {item.priority}</span>
                                </div>
                                <p className="action-description">{item.action}</p>
                                <p className="risk-if-not-addressed"><strong>Risk if not addressed:</strong> {item.risk_if_not_addressed}</p>
                                <p className="effort-required"><strong>Effort required:</strong> {item.effort_required}</p>
                                <p className="success-measurement"><strong>Success measurement:</strong> {item.success_measurement}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Overall Risk Assessment */}
                      {Object.keys(processedResults.evaluators.redTeam.overallRiskAssessment).length > 0 && (
                        <div className="content-section">
                          <h5>Overall Risk Assessment</h5>
                          <div className="overall-assessment">
                            {processedResults.evaluators.redTeam.overallRiskAssessment.biggest_single_threat && (
                              <p><strong>Biggest Single Threat:</strong> {processedResults.evaluators.redTeam.overallRiskAssessment.biggest_single_threat}</p>
                            )}
                            {processedResults.evaluators.redTeam.overallRiskAssessment.systemic_risk_level && (
                              <p><strong>Systemic Risk Level:</strong> {processedResults.evaluators.redTeam.overallRiskAssessment.systemic_risk_level}</p>
                            )}
                            {processedResults.evaluators.redTeam.overallRiskAssessment.immediate_action_required && (
                              <p><strong>Immediate Action Required:</strong> {processedResults.evaluators.redTeam.overallRiskAssessment.immediate_action_required ? 'Yes' : 'No'}</p>
                            )}
                            {processedResults.evaluators.redTeam.overallRiskAssessment.long_term_viability_concern && (
                              <p><strong>Long-term Viability Concern:</strong> {processedResults.evaluators.redTeam.overallRiskAssessment.long_term_viability_concern}</p>
                            )}
                            {processedResults.evaluators.redTeam.overallRiskAssessment.recommendation && (
                              <p><strong>Recommendation:</strong> {processedResults.evaluators.redTeam.overallRiskAssessment.recommendation}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Consensus Builder */}
                <div className="evaluator-panel">
                  <div 
                    className="evaluator-header"
                    onClick={() => toggleEvaluator('consensus')}
                  >
                    <h4>{processedResults.evaluators.consensus.evaluator || 'Consensus Builder & Final Reconciliation'}</h4>
                    <div className="evaluator-summary">
                      <span className={`evaluator-score ${getScoreColor(processedResults.evaluators.consensus.reconciledAssessment.final_llm_readiness_score || 0)}`}>
                        Score: {processedResults.evaluators.consensus.reconciledAssessment.final_llm_readiness_score || 0}
                      </span>
                      {processedResults.evaluators.consensus.reconciledAssessment.grade_confidence && (
                        <span className={`confidence-badge ${getConfidenceColor(processedResults.evaluators.consensus.reconciledAssessment.grade_confidence)}`}>
                          {processedResults.evaluators.consensus.reconciledAssessment.grade_confidence} confidence
                        </span>
                      )}
                      {processedResults.evaluators.consensus.assessmentDate && (
                        <span className="assessment-date">{processedResults.evaluators.consensus.assessmentDate}</span>
                      )}
                      <FontAwesomeIcon 
                        icon={openEvaluators.consensus ? 'chevron-up' : 'chevron-down'} 
                      />
                    </div>
                  </div>
                  
                  {openEvaluators.consensus && (
                    <div className="evaluator-content">
                      {/* Reconciliation Status */}
                      <div className="content-section">
                        <h5>Reconciliation Status</h5>
                        <div className="reconciliation-status">
                          <span className={`status-badge ${processedResults.evaluators.consensus.reconciliationCompleted ? 'completed' : 'pending'}`}>
                            {processedResults.evaluators.consensus.reconciliationCompleted ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Evaluator Summary */}
                      {Object.keys(processedResults.evaluators.consensus.evaluatorSummary).length > 0 && (
                      <div className="content-section">
                          <h5>Evaluator Summary</h5>
                          <div className="evaluator-summary-grid">
                            {Object.entries(processedResults.evaluators.consensus.evaluatorSummary).map(([evaluator, summary]) => (
                              <div key={evaluator} className="evaluator-summary-item">
                                <h6>{evaluator.replace(/_/g, ' ').toUpperCase()}</h6>
                                <div className="summary-details">
                                  <span className={`summary-score ${getScoreColor(summary.score || 0)}`}>Score: {summary.score || 'N/A'}</span>
                                  <span className={`summary-confidence ${getConfidenceColor(summary.confidence)}`}>Confidence: {summary.confidence || 'N/A'}</span>
                                  {summary.key_strengths && (
                                    <div className="key-strengths">
                                      <strong>Strengths:</strong>
                                      <ul>
                                        {summary.key_strengths.map((strength, index) => (
                                          <li key={index}>{strength}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {summary.key_concerns && (
                                    <div className="key-concerns">
                                      <strong>Concerns:</strong>
                                      <ul>
                                        {summary.key_concerns.map((concern, index) => (
                                          <li key={index}>{concern}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Reconciled Assessment */}
                      {Object.keys(processedResults.evaluators.consensus.reconciledAssessment).length > 0 && (
                        <div className="content-section">
                          <h5>Reconciled Assessment</h5>
                          <div className="reconciled-assessment">
                            {processedResults.evaluators.consensus.reconciledAssessment.final_llm_readiness_score && (
                              <div className="assessment-item">
                                <span className="assessment-label">Final LLM Readiness Score:</span>
                                <span className={`assessment-value ${getScoreColor(processedResults.evaluators.consensus.reconciledAssessment.final_llm_readiness_score)}`}>
                                  {processedResults.evaluators.consensus.reconciledAssessment.final_llm_readiness_score}
                                </span>
                              </div>
                            )}
                            {processedResults.evaluators.consensus.reconciledAssessment.confidence_interval && (
                              <div className="assessment-item">
                                <span className="assessment-label">Confidence Interval:</span>
                                <span className="assessment-value">{processedResults.evaluators.consensus.reconciledAssessment.confidence_interval}</span>
                              </div>
                            )}
                            {processedResults.evaluators.consensus.reconciledAssessment.consensus_level && (
                              <div className="assessment-item">
                                <span className="assessment-label">Consensus Level:</span>
                                <span className={`assessment-value ${getConfidenceColor(processedResults.evaluators.consensus.reconciledAssessment.consensus_level)}`}>
                                  {processedResults.evaluators.consensus.reconciledAssessment.consensus_level}
                                </span>
                              </div>
                            )}
                            {processedResults.evaluators.consensus.reconciledAssessment.letter_grade && (
                              <div className="assessment-item">
                                <span className="assessment-label">Letter Grade:</span>
                                <span className="assessment-value">{processedResults.evaluators.consensus.reconciledAssessment.letter_grade}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Category Reconciliation */}
                      {processedResults.evaluators.consensus.categoryReconciliation.length > 0 && (
                        <div className="content-section">
                          <h5>Category Reconciliation</h5>
                          <div className="category-reconciliation">
                            {processedResults.evaluators.consensus.categoryReconciliation.map((category, index) => (
                              <div key={index} className="category-reconciliation-item">
                                <h6>{category.category}</h6>
                                <div className="reconciliation-details">
                                  <div className="evaluator-scores">
                                    <strong>Evaluator Scores:</strong>
                                    {Object.entries(category.evaluator_scores || {}).map(([evaluator, score]) => (
                                      <span key={evaluator} className="evaluator-score-item">
                                        {evaluator}: {score}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="reconciliation-metrics">
                                    <span className="variance">Variance: {category.variance}</span>
                                    <span className={`reconciled-score ${getScoreColor(category.reconciled_score)}`}>
                                      Reconciled Score: {category.reconciled_score}
                                    </span>
                                    <span className={`confidence ${getConfidenceColor(category.confidence)}`}>
                                      Confidence: {category.confidence}
                                    </span>
                                  </div>
                                  {category.consensus_notes && (
                                    <p className="consensus-notes">{category.consensus_notes}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Critical Consensus Findings */}
                      {Object.keys(processedResults.evaluators.consensus.criticalConsensusFindings).length > 0 && (
                        <div className="content-section">
                          <h5>Critical Consensus Findings</h5>
                          <div className="consensus-findings">
                            {processedResults.evaluators.consensus.criticalConsensusFindings.agreed_strengths && (
                              <div className="findings-group">
                                <h6>Agreed Strengths</h6>
                                <ul>
                                  {processedResults.evaluators.consensus.criticalConsensusFindings.agreed_strengths.map((strength, index) => (
                                    <li key={index} className="strength-item">
                              <FontAwesomeIcon icon="check-circle" />
                                      {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                            )}
                            
                            {processedResults.evaluators.consensus.criticalConsensusFindings.agreed_weaknesses && (
                              <div className="findings-group">
                                <h6>Agreed Weaknesses</h6>
                                <ul>
                                  {processedResults.evaluators.consensus.criticalConsensusFindings.agreed_weaknesses.map((weakness, index) => (
                                    <li key={index} className="weakness-item">
                                      <FontAwesomeIcon icon="exclamation-triangle" />
                                      {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                            )}
                            
                            {processedResults.evaluators.consensus.criticalConsensusFindings.disputed_areas && (
                              <div className="findings-group">
                                <h6>Disputed Areas</h6>
                                <ul>
                                  {processedResults.evaluators.consensus.criticalConsensusFindings.disputed_areas.map((dispute, index) => (
                                    <li key={index} className="dispute-item">
                                      <FontAwesomeIcon icon="question-circle" />
                                      {dispute}
                                    </li>
                                  ))}
                                </ul>
                    </div>
                  )}
                            
                            {processedResults.evaluators.consensus.criticalConsensusFindings.requires_further_investigation && (
                              <div className="findings-group">
                                <h6>Requires Further Investigation</h6>
                                <ul>
                                  {processedResults.evaluators.consensus.criticalConsensusFindings.requires_further_investigation.map((investigation, index) => (
                                    <li key={index} className="investigation-item">
                                      <FontAwesomeIcon icon="search" />
                                      {investigation}
                                    </li>
                                  ))}
                                </ul>
                </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Quality Assurance Summary */}
                      {Object.keys(processedResults.evaluators.consensus.qualityAssuranceSummary).length > 0 && (
                        <div className="content-section">
                          <h5>Quality Assurance Summary</h5>
                          <div className="qa-summary">
                            {processedResults.evaluators.consensus.qualityAssuranceSummary.assessment_reliability && (
                              <div className="qa-item">
                                <span className="qa-label">Assessment Reliability:</span>
                                <span className={`qa-value ${getConfidenceColor(processedResults.evaluators.consensus.qualityAssuranceSummary.assessment_reliability)}`}>
                                  {processedResults.evaluators.consensus.qualityAssuranceSummary.assessment_reliability}
                                </span>
                              </div>
                            )}
                            {processedResults.evaluators.consensus.qualityAssuranceSummary.recommendation_confidence && (
                              <div className="qa-item">
                                <span className="qa-label">Recommendation Confidence:</span>
                                <span className={`qa-value ${getConfidenceColor(processedResults.evaluators.consensus.qualityAssuranceSummary.recommendation_confidence)}`}>
                                  {processedResults.evaluators.consensus.qualityAssuranceSummary.recommendation_confidence}
                                </span>
                              </div>
                            )}
                            {processedResults.evaluators.consensus.qualityAssuranceSummary.next_assessment_recommended && (
                              <div className="qa-item">
                                <span className="qa-label">Next Assessment Recommended:</span>
                                <span className="qa-value">{processedResults.evaluators.consensus.qualityAssuranceSummary.next_assessment_recommended}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Final Consolidated Summary */}
                      {processedResults.evaluators.consensus.finalConsolidatedSummary && (
                        <div className="content-section">
                          <h5>Final Consolidated Summary</h5>
                          <div className="final-summary">
                            <p>{processedResults.evaluators.consensus.finalConsolidatedSummary}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Recommendations */}
            <div className="recommendations-section">
              <h3>Action Recommendations</h3>
              
              <div className="recommendations-grid">
                <div className="recommendation-card immediate">
                  <div className="recommendation-header">
                    <FontAwesomeIcon icon="exclamation-triangle" />
                    <h4>Immediate Priorities</h4>
                    <span className="priority-badge critical">Critical</span>
                  </div>
                  
                  <div className="recommendation-list">
                    {processedResults.recommendations.immediate.map((item, index) => (
                      <div key={index} className="recommendation-item">
                        <FontAwesomeIcon icon="check" />
                        <div className="recommendation-content">
                          {typeof item === 'string' ? (
                        <span>{item}</span>
                          ) : (
                            <div>
                              <span className="action">{item.action}</span>
                              {item.evaluator_agreement && (
                                <div className="recommendation-meta">
                                  <span className="agreement">Agreement: {item.evaluator_agreement}</span>
                                  {item.expected_impact && <span className="impact">Impact: {item.expected_impact}</span>}
                                  {item.confidence_in_recommendation && (
                                    <span className={`confidence ${getConfidenceColor(item.confidence_in_recommendation)}`}>
                                      Confidence: {item.confidence_in_recommendation}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="recommendation-card strategic">
                  <div className="recommendation-header">
                    <FontAwesomeIcon icon="chart-line" />
                    <h4>Strategic Initiatives</h4>
                    <span className="priority-badge strategic">Long-term</span>
                  </div>
                  
                  <div className="recommendation-list">
                    {processedResults.recommendations.strategic.map((item, index) => (
                      <div key={index} className="recommendation-item">
                        <FontAwesomeIcon icon="arrow-right" />
                        <div className="recommendation-content">
                          {typeof item === 'string' ? (
                        <span>{item}</span>
                          ) : (
                            <div>
                              <span className="action">{item.action}</span>
                              {item.evaluator_agreement && (
                                <div className="recommendation-meta">
                                  <span className="agreement">Agreement: {item.evaluator_agreement}</span>
                                  {item.timeline && <span className="timeline">Timeline: {item.timeline}</span>}
                                  {item.consensus_on_priority && (
                                    <span className={`priority ${getConfidenceColor(item.consensus_on_priority)}`}>
                                      Priority: {item.consensus_on_priority}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer Note */}
      <div className="analyzer-footer">
        <div className="container">
          <p className="framework-note">
            Powered by LLM Readiness Framework v2.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LLMReadinessAnalyzer;
