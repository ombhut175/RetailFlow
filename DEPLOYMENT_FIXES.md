# Deployment Authentication Fixes

## Issues Fixed

### 1. Frontend API Client Configuration
- **Problem**: Frontend was using hardcoded localhost URL for client-side requests
- **Solution**: Updated `apiClient.ts` to properly use `NEXT_PUBLIC_API_URL` environment variable
- **File**: `frontend/src/lib/api/apiClient.ts`

### 2. Backend Cookie Configuration
- **Problem**: Cross-domain cookies not properly configured for production
- **Solution**: Enhanced cookie settings with proper `sameSite: 'none'` and `secure: true` for production
- **File**: `backend/src/modules/auth/auth.controller.ts`

### 3. Enhanced Debugging
- **Added**: Better logging in API client to debug request URLs
- **Added**: Production-specific cookie handling

## Required Environment Variables

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://nest-js-app-18x9.onrender.com
```

### Backend (Render.com)
```
DATABASE_URL=postgresql://postgres.ehjdrprteopuddgqhokl:wTkY2KleHT9UcydB@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
FRONTEND_URL=https://demo2-5l4s.vercel.app
NODE_ENV=production
PORT=5099
REDIRECT_TO_FRONTEND_URL=https://demo2-5l4s.vercel.app/login
SUPABASE_ANON_KEY=sb_publishable__ipy2Iz6gShuH-dd5q2pfA_52NIEv0I
SUPABASE_SERVICE_ROLE_KEY=sb_secret_smFIYGDDE4tbPode6SF-KQ_qD-KvwuO
SUPABASE_URL=https://ehjdrprteopuddgqhokl.supabase.co
```

## Deployment Steps

### 1. Deploy Backend Changes
1. Push the updated backend code to your repository
2. Render.com will automatically redeploy
3. Check logs to ensure CORS is configured correctly

### 2. Deploy Frontend Changes
1. Push the updated frontend code to your repository
2. Vercel will automatically redeploy
3. Verify that `NEXT_PUBLIC_API_URL` is set in Vercel dashboard

### 3. Test Authentication Flow
1. Visit your deployed frontend: https://demo2-5l4s.vercel.app
2. Try logging in
3. Check browser developer tools for:
   - Network requests going to correct backend URL
   - Cookies being set properly
   - No CORS errors

## Debugging Tips

### Check Frontend API Calls
1. Open browser developer tools
2. Go to Network tab
3. Try logging in
4. Verify requests are going to `https://nest-js-app-18x9.onrender.com/api/auth/login`

### Check Backend Logs
1. Go to Render.com dashboard
2. Check your backend service logs
3. Look for CORS configuration messages
4. Look for authentication request logs

### Check Cookies
1. After successful login, check browser developer tools
2. Go to Application/Storage tab
3. Check Cookies section
4. Verify `auth_token` cookie is set with proper domain

## Common Issues and Solutions

### Issue: "Network Error" or requests to localhost
- **Cause**: Frontend not using correct API URL
- **Solution**: Verify `NEXT_PUBLIC_API_URL` is set in Vercel and redeploy

### Issue: CORS errors
- **Cause**: Backend CORS not configured for frontend domain
- **Solution**: Verify `FRONTEND_URL` is set correctly in backend environment

### Issue: Cookies not being sent
- **Cause**: Cross-domain cookie configuration
- **Solution**: Ensure backend sets `sameSite: 'none'` and `secure: true` in production

### Issue: Authentication works on login but fails on subsequent requests
- **Cause**: Cookie domain or path issues
- **Solution**: Check cookie configuration and ensure `withCredentials: true` in frontend

## Testing Checklist

- [ ] Login works and redirects to dashboard
- [ ] Dashboard shows user information
- [ ] Refresh page maintains authentication
- [ ] Logout works and redirects to login
- [ ] No CORS errors in browser console
- [ ] Cookies are set with correct domain and security settings