import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';

// Sample report data generator
const generateReportData = (domain, isOptimized = false) => {
  const baseScores = {
    seo: isOptimized ? 92 : 65,
    ai: isOptimized ? 89 : 58,
    performance: isOptimized ? 85 : 72
  };

  const issues = isOptimized ? [
    {
      id: 1,
      severity: 'moderate',
      title: 'Minor Image Optimization',
      description: 'Some images could be further compressed for better performance'
    },
    {
      id: 2,
      severity: 'minor',
      title: 'Cache Headers',
      description: 'Consider adding cache headers for static assets'
    }
  ] : [
    {
      id: 1,
      severity: 'critical',
      title: 'Missing Meta Description',
      description: 'Your homepage is missing a meta description tag'
    },
    {
      id: 2,
      severity: 'critical',
      title: 'No Structured Data',
      description: 'Missing schema markup for better AI understanding'
    },
    {
      id: 3,
      severity: 'moderate',
      title: 'Suboptimal Heading Structure',
      description: 'H1 tags are not properly structured'
    },
    {
      id: 4,
      severity: 'moderate',
      title: 'Missing Alt Text',
      description: 'Some images lack descriptive alt attributes'
    }
  ];

  const fixes = isOptimized ? [
    {
      id: 1,
      title: 'Added Meta Description',
      description: 'Implemented compelling meta description for homepage'
    },
    {
      id: 2,
      title: 'Implemented Structured Data',
      description: 'Added comprehensive schema markup for AI understanding'
    },
    {
      id: 3,
      title: 'Optimized Heading Structure',
      description: 'Restructured H1-H6 tags for better SEO hierarchy'
    },
    {
      id: 4,
      title: 'Enhanced Image Alt Text',
      description: 'Added descriptive alt attributes to all images'
    }
  ] : [];

  return {
    domain,
    isOptimized,
    timestamp: new Date().toISOString(),
    scores: baseScores,
    overallScore: Math.round((baseScores.seo + baseScores.ai + baseScores.performance) / 3),
    issues,
    fixes,
    metrics: {
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'critical').length,
      moderateIssues: issues.filter(i => i.severity === 'moderate').length,
      minorIssues: issues.filter(i => i.severity === 'minor').length
    }
  };
};

export const useAudit = () => {
  const { state, updateProgress, completeAudit, showNotification } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [reports, setReports] = useState({
    original: null,
    optimized: null
  });

  // Simulate audit processing
  const startAuditProcess = useCallback(async (domain) => {
    if (isProcessing) return;

    setIsProcessing(true);
    setCurrentStep('scraping');
    setReports({ original: null, optimized: null });

    try {
      // Step 1: Scraping
      await simulateProgress('scraping', 3000);
      setCurrentStep('initialAudit');

      // Step 2: Initial Audit
      await simulateProgress('initialAudit', 4000);
      const originalReport = generateReportData(domain, false);
      setReports(prev => ({ ...prev, original: originalReport }));
      setCurrentStep('optimizing');

      // Step 3: Optimizing
      await simulateProgress('optimizing', 5000);
      setCurrentStep('finalAudit');

      // Step 4: Final Audit
      await simulateProgress('finalAudit', 3000);
      const optimizedReport = generateReportData(domain, true);
      setReports(prev => ({ ...prev, optimized: optimizedReport }));

      // Complete audit
      completeAudit({
        domain,
        original: originalReport,
        optimized: optimizedReport,
        overallScore: optimizedReport.overallScore
      });

      setCurrentStep('completed');
    } catch (error) {
      console.error('Audit process failed:', error);
      showNotification('Audit process failed. Please try again.', 'error');
      setCurrentStep('error');
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, updateProgress, completeAudit, showNotification]);

  // Simulate progress for a step
  const simulateProgress = (step, duration) => {
    return new Promise((resolve) => {
      let progress = 0;
      const increment = 100 / (duration / 100);
      
      const interval = setInterval(() => {
        progress += increment;
        if (progress >= 100) {
          progress = 100;
          updateProgress(step, progress);
          clearInterval(interval);
          resolve();
        } else {
          updateProgress(step, progress);
        }
      }, 100);
    });
  };

  // Get step status
  const getStepStatus = useCallback((stepName) => {
    const steps = ['scraping', 'initialAudit', 'optimizing', 'finalAudit'];
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(stepName);

    if (currentStep === 'completed') return 'completed';
    if (currentStep === 'error') return 'error';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  }, [currentStep]);

  // Reset audit state
  const resetAudit = useCallback(() => {
    setIsProcessing(false);
    setCurrentStep(null);
    setReports({ original: null, optimized: null });
  }, []);

  return {
    isProcessing,
    currentStep,
    reports,
    auditProgress: state.auditProgress,
    startAuditProcess,
    getStepStatus,
    resetAudit
  };
};

export const useReportData = () => {
  const { state } = useApp();

  const getScoreStatus = (score) => {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'fair';
    return 'poor';
  };

  const getImprovementPercentage = (original, optimized) => {
    if (!original || !optimized) return 0;
    return Math.round(((optimized - original) / original) * 100);
  };

  const getComparisonData = (originalReport, optimizedReport) => {
    if (!originalReport || !optimizedReport) return null;

    return {
      seo: {
        before: originalReport.scores.seo,
        after: optimizedReport.scores.seo,
        improvement: optimizedReport.scores.seo - originalReport.scores.seo
      },
      ai: {
        before: originalReport.scores.ai,
        after: optimizedReport.scores.ai,
        improvement: optimizedReport.scores.ai - originalReport.scores.ai
      },
      performance: {
        before: originalReport.scores.performance,
        after: optimizedReport.scores.performance,
        improvement: optimizedReport.scores.performance - originalReport.scores.performance
      },
      issues: {
        before: originalReport.metrics,
        after: optimizedReport.metrics
      }
    };
  };

  return {
    currentReport: state.currentReport,
    getScoreStatus,
    getImprovementPercentage,
    getComparisonData
  };
};

export const useDownload = () => {
  const { showNotification } = useApp();

  const downloadReport = useCallback((reportData, filename) => {
    showNotification(`Downloading ${filename}...`, 'info');
    
    // Simulate download delay
    setTimeout(() => {
      try {
        // In a real app, you would generate and download the actual file
        // For now, we'll just create a simple text representation
        const reportContent = JSON.stringify(reportData, null, 2);
        const blob = new Blob([reportContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        showNotification('Report downloaded successfully!', 'success');
      } catch (error) {
        console.error('Download failed:', error);
        showNotification('Download failed. Please try again.', 'error');
      }
    }, 1000);
  }, [showNotification]);

  const exportToPDF = useCallback((reportData, filename) => {
    downloadReport(reportData, `${filename}.pdf`);
  }, [downloadReport]);

  const exportToExcel = useCallback((reportData, filename) => {
    downloadReport(reportData, `${filename}.xlsx`);
  }, [downloadReport]);

  const exportToJSON = useCallback((reportData, filename) => {
    downloadReport(reportData, `${filename}.json`);
  }, [downloadReport]);

  return {
    downloadReport,
    exportToPDF,
    exportToExcel,
    exportToJSON
  };
};
