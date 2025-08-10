# 🚀 Railway Deployment Guide - DailyDev

## 📋 Overview

This guide explains how to deploy both the backend and frontend of DailyDev to Railway separately.

## 🏗️ Project Structure

```
daily-dev-journey/
├── server/          # Backend API
└── src/             # Frontend React App
```

## 🔧 Backend Deployment

### 1. Create Railway Project

1. Go to [Railway.app](https://railway.app)
2. Create new project
3. Choose "Deploy from GitHub repo"
4. Select your repository and the `daily-dev-journey/server` directory

### 2. Environment Variables

Set these environment variables in Railway:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dailydev
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
PORT=5000
```

### 3. MongoDB Setup

- Use MongoDB Atlas (free tier available)
- Or Railway's MongoDB service
- Update MONGODB_URI accordingly

### 4. Deploy

- Railway will automatically detect Node.js
- Build command: `npm install`
- Start command: `npm start` (already configured)

## 🌐 Frontend Deployment

### 1. Create Separate Railway Project

1. Create another Railway project
2. Choose "Deploy from GitHub repo"
3. Select your repository and the `daily-dev-journey` directory (root)

### 2. Build Configuration

- Build command: `npm run build`
- Start command: `npm run preview`
- Output directory: `dist`

### 3. Environment Variables

```
VITE_API_URL=https://your-backend-url.railway.app
```

### 4. Update API Configuration

After backend deployment, update `src/services/api.js` with the new backend URL.

## 🔗 Connecting Frontend to Backend

### 1. Update CORS in Backend

In `server/server.js`, update the CORS origin:

```javascript
origin: [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://your-frontend-url.railway.app", // Add this
],
```

### 2. Update Frontend API Calls

In `src/services/api.js`, update the base URL:

```javascript
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://your-backend-url.railway.app";
```

## 📱 Testing Deployment

### Backend Health Check

```
GET https://your-backend-url.railway.app/api/health
```

### Frontend

```
https://your-frontend-url.railway.app
```

## 🚨 Common Issues

### 1. Build Failures

- Ensure all dependencies are in package.json
- Check Node.js version compatibility

### 2. CORS Errors

- Verify CORS configuration in backend
- Check frontend URL is in allowed origins

### 3. MongoDB Connection

- Verify MONGODB_URI is correct
- Check network access from Railway

### 4. Port Issues

- Railway automatically sets PORT environment variable
- Ensure your app uses `process.env.PORT`

## 🔄 Updating Deployments

### Backend Updates

- Push changes to GitHub
- Railway automatically redeploys

### Frontend Updates

- Push changes to GitHub
- Railway automatically redeploys

## 📊 Monitoring

- Use Railway dashboard to monitor logs
- Check application health endpoints
- Monitor MongoDB connection status

## 🆘 Support

- Railway documentation: [docs.railway.app](https://docs.railway.app)
- Check Railway logs for detailed error messages
- Verify environment variables are set correctly
