# Environment Configuration Guide

## 🔧 API Base URL Configuration

The application now uses the production API endpoint by default: **https://parthgoai.pythonanywhere.com**

### Current Configuration

The API base URL is configured in `src/config/environment.js`:

```javascript
// Production API Base URL (currently active)
API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://parthgoai.pythonanywhere.com',

// Local Development API Base URL (commented out)
// API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5002',
```

### 🔄 Switching Between Environments

#### Option 1: Using Environment Variables (Recommended)

Create a `.env` file in the project root with:

```bash
# For Production
REACT_APP_API_BASE_URL=https://parthgoai.pythonanywhere.com

# For Local Development
# REACT_APP_API_BASE_URL=http://localhost:5002
```

#### Option 2: Editing Configuration File

In `src/config/environment.js`, swap the commented lines:

```javascript
// For Local Development
API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5002',

// For Production
// API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://parthgoai.pythonanywhere.com',
```

### 📡 API Endpoints

All API calls now use the base URL: `https://parthgoai.pythonanywhere.com/api`

- **Authentication**: `https://parthgoai.pythonanywhere.com/api/login`
- **Registration**: `https://parthgoai.pythonanywhere.com/api/register`
- **Jobs**: `https://parthgoai.pythonanywhere.com/api/jobs`
- **Job Details**: `https://parthgoai.pythonanywhere.com/api/jobs/{jobId}`
- **Scraping**: `https://parthgoai.pythonanywhere.com/api/scrape`
- **Optimization**: `https://parthgoai.pythonanywhere.com/api/optimize`

### 🚀 Deployment Note

After changing the environment configuration:
1. Restart the development server: `npm start`
2. Clear browser cache if needed
3. Check browser console for any CORS or connection issues

### 🔍 Debugging

Set `REACT_APP_DEBUG_MODE=true` in your `.env` file to enable API request logging.
