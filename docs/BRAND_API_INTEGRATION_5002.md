# Brand Analysis API Integration - Port 5002

## ✅ Configuration Complete

### API Endpoint
```bash
GET http://localhost:5002/api/brand-llm-analysis/previous
Authorization: Bearer {JWT_TOKEN}
```

### Changes Made

#### 1. API Base URL (Updated)
**File**: `src/config/environment.js`
```javascript
API_BASE_URL: 'http://localhost:5002'
```

#### 2. Proxy Configuration (Updated)
**File**: `package.json`
```json
"proxy": "http://localhost:5002"
```

#### 3. Authentication Token Fix (IMPORTANT!)
**File**: `src/services/api.js`
```javascript
// Fixed token storage key mismatch
this.token = localStorage.getItem('llmredi_token') || null;
// Previously was 'auth_token' - now matches AppContext
```

#### 4. API Call on Page Load
**File**: `src/components/BrandAnalysisScreen.js`
```javascript
// API is called automatically when page loads
useEffect(() => {
  loadPreviousAnalyses();
}, []);
```

## 🔍 How It Works

### When Page Loads:
1. **Component mounts** → `useEffect` triggers
2. **API call made** → `GET /api/brand-llm-analysis/previous`
3. **React proxy forwards** → `http://localhost:5002/api/brand-llm-analysis/previous`
4. **Authentication included** → Uses `llmredi_token` from localStorage
5. **Response handled** → Real data or fallback to mock data

### API Call Flow:
```
Frontend → /api/brand-llm-analysis/previous
   ↓ (React Proxy)
Backend → http://localhost:5002/api/brand-llm-analysis/previous
   ↓ (Response)
Frontend → Display analyses or fallback to mock data
```

## 🐛 Debug Information

### Console Logs to Check:
1. `Loading previous analyses...`
2. `Making API call to: /api/brand-llm-analysis/previous`
3. `Proxied to: http://localhost:5002/api/brand-llm-analysis/previous`
4. `Auth token: Present/Missing`
5. `API response for previous analyses:` (shows actual response)
6. `Successfully loaded X previous analyses from API` (if successful)
7. `API call failed for previous analyses, using mock data:` (if failed)

### Network Tab:
- Look for request to `/api/brand-llm-analysis/previous`
- Should show status 200 if backend is running
- Check response data structure

## 🎯 Expected Backend Response

Your backend should return one of these formats:

### Format 1: Direct Array
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

### Format 2: Wrapped Response
```json
{
  "analyses": [...],
  "data": [...],
  // Any of these property names will work
}
```

## 🚀 Testing Steps

### 1. Ensure Backend is Running
```bash
# Make sure your backend server is running on port 5002
# The endpoint should be available at:
# GET http://localhost:5002/api/brand-llm-analysis/previous
```

### 2. Check Authentication
- Make sure you're logged in
- Check that `llmredi_token` exists in localStorage
- Verify token is valid

### 3. Open Brand LLM Analysis Page
- Navigate to the page
- Check browser console for API logs
- Check Network tab for API request

### 4. Verify Results
- **With Backend**: Should show real previous analyses
- **Without Backend**: Should show mock data (fallback)
- **Empty Response**: Should show mock data (fallback)

## 🔧 Troubleshooting

### If No API Call is Made:
1. Check console for errors
2. Verify component is mounting correctly
3. Check if useEffect is running

### If API Call Fails:
1. Verify backend is running on port 5002
2. Check endpoint exists: `/api/brand-llm-analysis/previous`
3. Verify authentication token is present
4. Check CORS configuration on backend

### If Shows Mock Data:
1. Check console logs for API error messages
2. Verify API response format matches expected structure
3. Check Network tab for actual response data

## ✅ Current Status
- ✅ API base URL: `http://localhost:5002`
- ✅ Proxy configured: `http://localhost:5002`
- ✅ Authentication token: `llmredi_token` (fixed mismatch)
- ✅ API call on page load: Enabled
- ✅ Fallback to mock data: Working
- ✅ Debug logging: Enhanced

The API integration is now properly configured and should call your backend on port 5002 when the Brand LLM Analysis page loads!
