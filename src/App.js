import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faHome, faUser, faQuestionCircle, faSignOutAlt, faSearch, 
  faDownload, faMagicWandSparkles, faCheckDouble, faExclamationTriangle,
  faExclamationCircle, faCheckCircle, faRobot, faTachometerAlt,
  faEnvelope, faComments, faBook, faTimes, faInfoCircle,
  faFilePdf, faFileExcel, faCode, faSpinner, faChevronDown, faChevronUp,
  faChartLine, faShieldAlt, faUniversalAccess, faArrowRight, faCheck,
  faTimesCircle, faChartBar, faExternalLinkAlt, faGlobe
} from '@fortawesome/free-solid-svg-icons';

import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginScreen from './components/LoginScreen';
import DashboardScreen from './components/DashboardScreen';
import ProcessingScreen from './components/ProcessingScreen';
import ReportScreen from './components/ReportScreen';
import ComparisonScreen from './components/ComparisonScreen';
import InsightsScreen from './components/InsightsScreen';
import ProfileScreen from './components/ProfileScreen';
import HelpScreen from './components/HelpScreen';
import NotificationContainer from './components/NotificationContainer';
import ProtectedRoute from './components/ProtectedRoute';

import './styles/index.css';

// Initialize Font Awesome icons
library.add(
  faHome, faUser, faQuestionCircle, faSignOutAlt, faSearch, 
  faDownload, faMagicWandSparkles, faCheckDouble, faExclamationTriangle,
  faExclamationCircle, faCheckCircle, faRobot, faTachometerAlt,
  faEnvelope, faComments, faBook, faTimes, faInfoCircle,
  faFilePdf, faFileExcel, faCode, faSpinner, faChevronDown, faChevronUp,
  faChartLine, faShieldAlt, faUniversalAccess, faArrowRight, faCheck,
  faTimesCircle, faChartBar, faExternalLinkAlt, faGlobe
);

// Add a 404 page component
const NotFoundPage = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  React.useEffect(() => {
    // Redirect to dashboard or login based on authentication
    const token = localStorage.getItem('llmredi_token');
    if (token) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="not-found-page">
      <h1>Page Not Found</h1>
      <p>Redirecting...</p>
    </div>
  );
};

// Component to conditionally render Footer
function AppLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardScreen />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardScreen />
            </ProtectedRoute>
          } />
          <Route path="/processing" element={
            <ProtectedRoute>
              <ProcessingScreen />
            </ProtectedRoute>
          } />
          <Route path="/report/original" element={
            <ProtectedRoute>
              <ReportScreen type="original" />
            </ProtectedRoute>
          } />
          <Route path="/report/optimized" element={
            <ProtectedRoute>
              <ReportScreen type="optimized" />
            </ProtectedRoute>
          } />
          <Route path="/comparison" element={
            <ProtectedRoute>
              <ComparisonScreen />
            </ProtectedRoute>
          } />
          <Route path="/insights" element={
            <ProtectedRoute>
              <InsightsScreen />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfileScreen />
            </ProtectedRoute>
          } />
          <Route path="/help" element={
            <ProtectedRoute>
              <HelpScreen />
            </ProtectedRoute>
          } />
          {/* Catch-all route for 404 handling */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {!isLoginPage && <Footer />}
      <NotificationContainer />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppLayout />
      </Router>
    </AppProvider>
  );
}

export default App;
