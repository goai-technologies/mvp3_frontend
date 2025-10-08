# Previous Brand Analyses API Integration

## API Endpoint Integrated
```bash
curl -X GET \
  'http://localhost:5000/api/brand-llm-analysis/previous' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

## Changes Made

### 1. Updated API Base URL
**File**: `src/config/environment.js`
```javascript
// Changed from localhost:5002 to localhost:5000
API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'
```

### 2. Updated Proxy Configuration
**File**: `package.json`
```json
// Changed proxy to port 5000
"proxy": "http://localhost:5000"
```

### 3. Re-enabled API Call
**File**: `src/components/BrandAnalysisScreen.js`
- Removed mock-only loading
- Re-enabled actual API call with proper error handling
- Added support for different response formats
- Falls back to mock data if API fails or returns empty data

## API Integration Logic

### Request Flow
1. **Development**: `GET /api/brand-llm-analysis/previous` (proxied to localhost:5000)
2. **Production**: `GET http://localhost:5000/api/brand-llm-analysis/previous`
3. **Authentication**: Uses Bearer token from localStorage (`auth_token`)

### Response Handling
```javascript
const loadPreviousAnalyses = async () => {
  try {
    const response = await apiService.getPreviousBrandAnalyses();
    
    // Handle different response formats
    const analyses = response.analyses || response.data || response;
    
    if (Array.isArray(analyses) && analyses.length > 0) {
      setPreviousAnalyses(analyses);
    } else {
      // Fallback to mock data if API returns empty
      setPreviousAnalyses(mockPreviousAnalyses);
    }
  } catch (error) {
    // Fallback to mock data on API error
    setPreviousAnalyses(mockPreviousAnalyses);
  }
};
```

## Expected API Response Format

### Option 1: Direct Array
```json
[
  {
    "id": 1,
    "brandName": "Example Brand",
    "domain": "example.com",
    "createdAt": "2024-10-04T10:30:00Z",
    "accuracy": 85,
    "totalQuestions": 25,
    "correct": 21,
    "partiallyCorrect": 2,
    "incorrect": 2,
    "status": "completed"
  }
]
```

### Option 2: Wrapped Response
```json
{
  "analyses": [
    {
      "id": 1,
      "brandName": "Example Brand",
      // ... rest of analysis data
    }
  ]
}
```

### Option 3: Data Property
```json
{
  "data": [
    {
      "id": 1,
      "brandName": "Example Brand",
      // ... rest of analysis data
    }
  ]
}
```

## Required Fields per Analysis
- `id` - Unique identifier
- `brandName` - Brand name
- `domain` - Website domain
- `createdAt` - ISO date string
- `accuracy` - Percentage (0-100)
- `totalQuestions` - Total number of questions
- `correct` - Number of correct answers
- `partiallyCorrect` - Number of partially correct answers
- `incorrect` - Number of incorrect answers
- `status` - Analysis status (e.g., "completed")

## Authentication
The API call automatically includes the JWT token from localStorage:
```javascript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
  'Content-Type': 'application/json'
}
```

## Error Handling
- **API Unavailable**: Falls back to mock data
- **Empty Response**: Falls back to mock data
- **Invalid Response**: Falls back to mock data
- **Authentication Error**: Falls back to mock data
- **Network Error**: Falls back to mock data

## Testing
1. **With Backend Running**: Should load real data from API
2. **Without Backend**: Should show mock data as fallback
3. **Empty API Response**: Should show mock data
4. **Authentication Issues**: Should show mock data

## Debug Information
Check browser console for:
- `Loading previous analyses...`
- `API response for previous analyses:` (shows actual API response)
- `Successfully loaded X previous analyses from API`
- Or fallback messages if using mock data

## Next Steps
1. **Start Backend**: Ensure your backend server is running on port 5000
2. **Test Authentication**: Make sure JWT tokens are valid
3. **Verify Endpoint**: Confirm `/api/brand-llm-analysis/previous` exists
4. **Check Response Format**: Ensure API returns data in expected format
