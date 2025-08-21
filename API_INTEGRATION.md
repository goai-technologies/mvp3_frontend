# API Integration Guide - Website Scraping Platform

## Overview
This document outlines the integration of the Website Scraping API with the React frontend application. The API provides comprehensive website scraping, job management, and domain tracking capabilities.

## API Base Configuration

### Environment Variables
Create a `.env` file in your project root with:
```bash
REACT_APP_API_BASE_URL=http://localhost:5002
REACT_APP_DEBUG_MODE=false
```

### API Endpoints
Base URL: `http://localhost:5002/api`

## Core API Services

### 1. Authentication (`/api/auth`)
- **POST** `/register` - User registration
- **POST** `/login` - User authentication
- **GET** `/me` - Get current user info

### 2. Scraping Jobs (`/api/scraping`)
- **POST** `/scrape` - Start new scraping job
- **GET** `/jobs` - List all jobs
- **GET** `/jobs/{job_id}` - Get job details
- **GET** `/jobs/{job_id}/download` - Download scraped data

### 3. Domain Management (`/api/domains`)
- **GET** `/domains` - List all scraped domains

### 4. System Health (`/api/system`)
- **GET** `/status` - API health check

## Frontend Integration Points

### LoginScreen
- **API Call**: `POST /api/login`
- **Purpose**: Authenticate users and obtain JWT token
- **Integration**: Replaces mock login with real API authentication

### DashboardScreen
- **API Calls**: 
  - `GET /api/jobs` - Load recent scraping jobs
  - `POST /api/scrape` - Start new scraping job
- **Purpose**: Display job history and initiate new scraping tasks
- **Integration**: Shows real job status, progress, and completion states

### ProcessingScreen
- **API Call**: `GET /api/jobs/{job_id}` (polling)
- **Purpose**: Monitor job progress in real-time
- **Integration**: Real-time status updates with automatic redirect on completion

### API Service Layer
Located at `src/services/api.js`, provides:
- Centralized API communication
- JWT token management
- Error handling and retry logic
- Request/response interceptors

## Data Flow

### 1. User Authentication
```
User Input → LoginScreen → API Service → /api/login → JWT Token → Local Storage
```

### 2. Job Creation
```
Domain Input → DashboardScreen → API Service → /api/scrape → Job ID → Processing
```

### 3. Job Monitoring
```
ProcessingScreen → API Service → /api/jobs/{id} → Status Updates → Completion
```

### 4. Data Retrieval
```
Completed Job → API Service → /api/jobs/{id} → Report Data → Comparison Screen
```

## Error Handling

### Network Errors
- Automatic retry with exponential backoff
- User-friendly error messages
- Fallback to mock data when API unavailable

### Authentication Errors
- Automatic token refresh
- Redirect to login on 401 responses
- Clear invalid tokens from storage

### Job Errors
- Detailed error messages from API
- Graceful degradation for failed jobs
- Retry mechanisms for transient failures

## Security Features

### JWT Authentication
- Bearer token in Authorization header
- Automatic token storage in localStorage
- Secure token transmission over HTTPS

### Input Validation
- Client-side validation before API calls
- Server-side validation for all inputs
- XSS protection through proper encoding

## Performance Optimizations

### Real-time Updates
- Polling every 2 seconds for job status
- Configurable polling intervals
- Automatic cleanup on component unmount

### Caching Strategy
- Job data cached in React state
- Minimal API calls through smart polling
- Efficient re-renders with proper state management

## Testing

### API Testing
Use the provided Postman collection:
- Import `Website_Scraping_API.postman_collection.json`
- Set environment variables
- Run complete workflow tests

### Frontend Testing
- Mock API responses for development
- Real API integration for production
- Error boundary testing for API failures

## Deployment Considerations

### Environment Configuration
- Production API endpoints
- Secure token storage
- CORS configuration
- Rate limiting awareness

### Monitoring
- API response time tracking
- Error rate monitoring
- User experience metrics
- Job completion analytics

## Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure API server allows frontend domain
2. **Authentication Failures**: Check JWT token validity and expiration
3. **Job Timeouts**: Verify API server health and job processing
4. **Network Issues**: Implement proper error handling and retry logic

### Debug Mode
Enable debug mode in environment:
```bash
REACT_APP_DEBUG_MODE=true
```

This will log all API requests and responses to the console.

## Future Enhancements

### Planned Features
- WebSocket support for real-time updates
- Offline mode with job queuing
- Advanced job scheduling
- Bulk domain processing
- API rate limiting awareness
- Enhanced error reporting

### API Versioning
- Support for multiple API versions
- Backward compatibility
- Feature flag management
- Gradual rollout capabilities
