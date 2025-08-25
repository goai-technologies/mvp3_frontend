import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { config } from '../config/environment.js';

// Check for existing authentication on app load
const getInitialAuthState = () => {
  const savedUser = localStorage.getItem('llmredi_user');
  const savedToken = localStorage.getItem('llmredi_token');
  
  if (savedUser && savedToken) {
    try {
      const userData = JSON.parse(savedUser);
      return {
        currentUser: userData,
        isLoggedIn: true,
        isAuthChecking: false
      };
    } catch (error) {
      console.error('Error parsing saved user data:', error);
      localStorage.removeItem('llmredi_user');
      localStorage.removeItem('llmredi_token');
    }
  }
  
  return {
    currentUser: null,
    isLoggedIn: false,
    isAuthChecking: true
  };
};

// Initial state
const initialState = {
  ...getInitialAuthState(),
  currentDomain: null,
  currentJobId: null,
  currentJobStats: null,
  auditProgress: {
    scraping: 0,
    initialAudit: 0,
    optimizing: 0,
    finalAudit: 0
  },
  auditStatus: 'idle', // idle, processing, completed, error
  recentAudits: [
    {
      id: 1,
      domain: 'example.com',
      date: '2 days ago',
      score: 85,
      status: 'completed'
    },
    {
      id: 2,
      domain: 'testsite.org',
      date: '1 week ago',
      score: 72,
      status: 'completed'
    },
    {
      id: 3,
      domain: 'demo.net',
      date: '3 days ago',
      score: 91,
      status: 'completed'
    }
  ],
  currentReport: null,
  notifications: []
};

// Action types
export const ACTIONS = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  AUTH_CHECKED: 'AUTH_CHECKED',
  START_AUDIT: 'START_AUDIT',
  UPDATE_PROGRESS: 'UPDATE_PROGRESS',
  COMPLETE_AUDIT: 'COMPLETE_AUDIT',
  SET_CURRENT_REPORT: 'SET_CURRENT_REPORT',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  UPDATE_USER_PROFILE: 'UPDATE_USER_PROFILE',
  SET_CURRENT_JOB: 'SET_CURRENT_JOB',
  UPDATE_JOB_STATS: 'UPDATE_JOB_STATS'
};

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOGIN:
      return {
        ...state,
        isLoggedIn: true,
        currentUser: action.payload
      };
    
    case ACTIONS.LOGOUT:
      return {
        ...state,
        isLoggedIn: false,
        currentUser: null,
        currentDomain: null,
        auditStatus: 'idle',
        currentReport: null,
        isAuthChecking: false
      };
    
    case ACTIONS.AUTH_CHECKED:
      return {
        ...state,
        isAuthChecking: false
      };
    
    case ACTIONS.START_AUDIT:
      return {
        ...state,
        currentDomain: action.payload.domain,
        currentJobId: action.payload.jobId || null,
        auditStatus: 'processing',
        auditProgress: {
          scraping: 0,
          initialAudit: 0,
          optimizing: 0,
          finalAudit: 0
        }
      };
    
    case ACTIONS.UPDATE_PROGRESS:
      return {
        ...state,
        auditProgress: {
          ...state.auditProgress,
          [action.payload.stage]: action.payload.progress
        }
      };
    
    case ACTIONS.COMPLETE_AUDIT:
      return {
        ...state,
        auditStatus: 'completed',
        currentReport: action.payload.report,
        recentAudits: [
          {
            id: Date.now(),
            domain: state.currentDomain,
            date: 'Just now',
            score: action.payload.report?.overallScore || 85,
            status: 'completed'
          },
          ...state.recentAudits.slice(0, 4) // Keep only 5 recent audits
        ]
      };
    
    case ACTIONS.SET_CURRENT_REPORT:
      return {
        ...state,
        currentReport: action.payload,
        currentDomain: action.payload?.domain
      };
    
    case ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: Date.now(),
            ...action.payload
          }
        ]
      };
    
    case ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload.id
        )
      };
    
    case ACTIONS.UPDATE_USER_PROFILE:
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          ...action.payload
        }
      };
    
    case ACTIONS.SET_CURRENT_JOB:
      return {
        ...state,
        currentJobId: action.payload.jobId,
        currentJobStats: action.payload.stats || null
      };
    
    case ACTIONS.UPDATE_JOB_STATS:
      return {
        ...state,
        currentJobStats: {
          ...state.currentJobStats,
          ...action.payload
        }
      };
    
    default:
      return state;
  }
}

// Create context
const AppContext = createContext();

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load saved state from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('llmredi_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({
          type: ACTIONS.LOGIN,
          payload: user
        });
      } catch (error) {
        console.warn('Failed to load saved user data:', error);
      }
    }
  }, []);

  // Save user data to localStorage when it changes
  useEffect(() => {
    if (state.currentUser) {
      localStorage.setItem('llmredi_user', JSON.stringify(state.currentUser));
    } else {
      localStorage.removeItem('llmredi_user');
    }
  }, [state.currentUser]);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const savedUser = localStorage.getItem('llmredi_user');
      const savedToken = localStorage.getItem('llmredi_token');
      
      if (savedUser && savedToken) {
        try {
          // Validate token with API using the config from environment
          const response = await fetch(`${config.API_BASE_URL}/api/me`, {
            headers: {
              'Authorization': `Bearer ${savedToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            // Token is valid, user is authenticated
            const userData = JSON.parse(savedUser);
            dispatch({
              type: ACTIONS.LOGIN,
              payload: userData
            });
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('llmredi_user');
            localStorage.removeItem('llmredi_token');
          }
        } catch (error) {
          console.error('Error validating token:', error);
          // Clear storage on error
          localStorage.removeItem('llmredi_user');
          localStorage.removeItem('llmredi_token');
        }
      }
      
      // Mark auth check as complete
      dispatch({ type: ACTIONS.AUTH_CHECKED });
    };
    
    checkAuthStatus();
  }, []);

  // Auto-remove notifications after 5 seconds
  useEffect(() => {
    state.notifications.forEach(notification => {
      if (!notification.persistent) {
        setTimeout(() => {
          dispatch({
            type: ACTIONS.REMOVE_NOTIFICATION,
            payload: { id: notification.id }
          });
        }, 5000);
      }
    });
  }, [state.notifications]);

  const value = {
    state,
    dispatch,
    
    // Helper functions
    login: (userData, token) => {
      // Save token to localStorage
      if (token) {
        localStorage.setItem('llmredi_token', token);
      }
      
      dispatch({
        type: ACTIONS.LOGIN,
        payload: userData
      });
    },
    
    logout: () => {
      // Clear token from localStorage
      localStorage.removeItem('llmredi_token');
      dispatch({ type: ACTIONS.LOGOUT });
    },
    
    startAudit: (domain, jobId = null) => {
      dispatch({
        type: ACTIONS.START_AUDIT,
        payload: { domain, jobId }
      });
    },
    
    updateProgress: (stage, progress) => {
      dispatch({
        type: ACTIONS.UPDATE_PROGRESS,
        payload: { stage, progress }
      });
    },
    
    completeAudit: (report) => {
      dispatch({
        type: ACTIONS.COMPLETE_AUDIT,
        payload: { report }
      });
    },
    
    showNotification: (message, type = 'info', persistent = false) => {
      dispatch({
        type: ACTIONS.ADD_NOTIFICATION,
        payload: { message, type, persistent }
      });
    },
    
    removeNotification: (id) => {
      dispatch({
        type: ACTIONS.REMOVE_NOTIFICATION,
        payload: { id }
      });
    },
    
    updateUserProfile: (updates) => {
      dispatch({
        type: ACTIONS.UPDATE_USER_PROFILE,
        payload: updates
      });
    },
    
    setCurrentJob: (jobId, stats = null) => {
      dispatch({
        type: ACTIONS.SET_CURRENT_JOB,
        payload: { jobId, stats }
      });
    },
    
    updateJobStats: (stats) => {
      dispatch({
        type: ACTIONS.UPDATE_JOB_STATS,
        payload: stats
      });
    }
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the app context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
