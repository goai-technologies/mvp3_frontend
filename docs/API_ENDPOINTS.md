# API Endpoints Documentation

## Base URL Configuration
**Single Source of Truth**: `http://localhost:5002`
- Configured in: `src/config/environment.js`
- Used by: `src/services/api.js`

## All API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/me` - Get current user info

### System & Health
- `GET /api/status` - API health check

### Scraping Jobs
- `POST /api/scrape` - Start scraping job
- `GET /api/jobs` - Get all jobs (with optional filters)
- `GET /api/jobs/{jobId}` - Get job details
- `GET /api/jobs/{jobId}/download` - Download job data
- `DELETE /api/cleanup` - Delete all jobs

### Optimization
- `POST /api/optimize` - Optimize job

### Domains
- `GET /api/domains` - Get all domains

### LLM Analysis
- `POST /api/agentanalyse` - LLM Readiness Analysis (used by LLMReadinessAnalyzer)
- `POST /api/llm-analyze` - Alternative LLM Analysis endpoint
- `POST /api/brand-llm-analysis` - Brand LLM Analysis
- `GET /api/brand-llm-analysis/previous` - Get previous brand analyses

## Configuration Details

### Environment Configuration (`src/config/environment.js`)
```javascript
export const config = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5002',
  // Production URL commented out:
  // API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://parthgoai.pythonanywhere.com',
};
```

### API Service (`src/services/api.js`)
- **Base URL**: `${config.API_BASE_URL}/api`
- **Authentication**: Bearer token in Authorization header
- **Content-Type**: application/json
- **Error Handling**: Centralized error handling with proper HTTP status codes

### Package.json Proxy
```json
"proxy": "http://localhost:5002"
```
This proxy is used for development and routes relative API calls to localhost:5002.

## Usage Patterns

### Centralized API Service
All components should use the centralized `apiService` from `src/services/api.js`:

```javascript
import apiService from '../services/api';

// Example usage
const data = await apiService.makeRequest('/endpoint', {
  method: 'POST',
  body: JSON.stringify(payload)
});
```

### Components Using API Service
1. **BrandAnalysisScreen** - Uses `analyzeBrandLLM()` and `getPreviousBrandAnalyses()`
2. **LLMReadinessAnalyzer** - Uses `makeRequest('/agentanalyse', ...)`
3. **AppContext** - Uses `getCurrentUser()` for authentication
4. **DashboardScreen** - Uses various job-related endpoints
5. **Other screens** - Use appropriate service methods

## Migration Completed
✅ All API calls now use the single base URL: `http://localhost:5002`
✅ Removed direct fetch() calls in favor of centralized API service
✅ Consistent error handling across all API calls
✅ Single source of truth for API configuration

