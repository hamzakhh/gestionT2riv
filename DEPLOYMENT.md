# Render Deployment Guide

This document explains how the association management system is deployed on Render.com.

## Architecture Overview

The application consists of two main services:

### 1. Backend Service (`association-backend`)
- **Technology**: Node.js with Express
- **Database**: MongoDB
- **Purpose**: REST API server handling authentication, data management, and business logic
- **Deploy URL**: `https://backandassociation.onrender.com/`

### 2. Frontend Service (`association-frontend`)
- **Technology**: React with Vite
- **Purpose**: User interface for the association management system
- **Build Output**: Static files served from `dist/` directory

## Deployment Configuration Files

### Main Configuration: `render.yaml`
Configures both backend and frontend services with:
- Auto-deployment on git push
- PR preview environments
- Environment variables
- Health checks
- Performance optimizations

### Frontend Configuration: `frontend-separe/render.yaml`
Specifically configures the React frontend:
- Static site deployment
- Build optimization
- Asset caching strategies
- Environment-specific variables

### Environment Variables: `frontend-separe/.env.production`
Production environment variables for the frontend:
- API endpoint configuration
- Application settings
- Feature flags

## Deployment Process

### Automatic Deployment
1. **Push to main branch**: Both services automatically deploy
2. **Pull requests**: Preview environments created for testing
3. **Health checks**: Render monitors service health automatically

### Manual Configuration Required
The following variables must be configured manually in Render dashboard:

#### Backend Service
- `MONGODB_URI`: MongoDB connection string
- `FRONTEND_URL`: Frontend application URL for CORS

#### Frontend Service
- `VITE_API_URL`: Backend API URL (automatically set to `https://backandassociation.onrender.com/`)

## Performance Optimizations

### Frontend Caching
- Static assets cached for 1 year
- HTML files set to no-cache
- Optimized build output with Vite

### Backend Rate Limiting
- 100 requests per 15 minutes per IP
- Configurable windows and limits
- Protection against abuse

## Security Features

### Authentication
- JWT tokens with configurable expiration
- Secure secret generation
- Refresh token support

### File Uploads
- Maximum file size: 5MB
- Temporary upload directory
- Secure file handling

## Monitoring and Health

### Health Checks
- Backend: `/api/health` endpoint
- Frontend: Root path `/` accessibility
- Automatic restart on failure

### Environment-Specific Settings
- Production optimizations enabled
- Development features disabled
- Error reporting configured

## Custom Domain Setup (Optional)

To use a custom domain, uncomment and configure in `frontend-separe/render.yaml`:

```yaml
domains:
  - yourdomain.com
  - www.yourdomain.com
```

## Troubleshooting

### Common Issues
1. **Build failures**: Check dependencies in `package.json`
2. **Environment variables**: Verify all required variables are set
3. **Database connection**: Ensure MongoDB URI is correct and accessible
4. **CORS errors**: Verify FRONTEND_URL matches deployed frontend URL

### Logs and Monitoring
- Render provides real-time logs for both services
- Health check status visible in dashboard
- Performance metrics available in Render console

## Deployment Commands

### Local Testing
```bash
# Backend
cd backend-separe
npm install
npm start

# Frontend
cd frontend-separe
npm install
npm run build
npm run preview
```

### Production Deployment
```bash
# Push to trigger deployment
git add .
git commit -m "Deploy to production"
git push origin main
```

## Support

For Render-specific issues:
- Check Render documentation: https://render.com/docs
- Review deployment logs in Render dashboard
- Verify environment variables are correctly set

For application-specific issues:
- Check application logs in both services
- Verify API connectivity between frontend and backend
- Test authentication and database connectivity
