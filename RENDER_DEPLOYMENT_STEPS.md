# Backend Deployment to Render.com - Quick Start

## What I've Set Up

I've configured your backend for deployment to Render.com:

### Files Created/Modified:
1. **render.yaml** - Infrastructure as code configuration for Render
2. **.env.example** - Environment variables template
3. **DEPLOYMENT.md** - Detailed deployment guide
4. **render-build.sh** - Build script (optional)
5. **src/app.ts** - Updated CORS configuration for production
6. **.gitignore** - Updated to exclude sensitive files

## Quick Deployment Steps

### Option 1: Using render.yaml (Recommended - Fastest)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push
   ```

2. **Go to Render.com**
   - Sign up/Login at https://render.com
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Select the repository containing the backend
   - Render will automatically detect and read `render.yaml`
   - Review the configuration and click "Apply Blueprint"

3. **Render will automatically:**
   - Create a PostgreSQL database
   - Create a web service for your backend
   - Set up environment variables
   - Deploy your application

### Option 2: Manual Setup (More Control)

1. **Create PostgreSQL Database**
   - Go to Render.com → New → PostgreSQL
   - Name: `ingata-postgres`
   - Select free tier
   - Save the connection details

2. **Create Web Service**
   - Go to Render.com → New → Web Service
   - Connect your GitHub repository
   - Configure:
     - Build Command: `npm install && npm run build`
     - Start Command: `npm start`
   - Add environment variables (see below)

3. **Set Environment Variables**

**Required:**
```
NODE_ENV=production
PORT=10000
DATABASE_URL=<from_render_database>
DATABASE_URL_UNPOOLED=<external_database_url>
JWT_SECRET=<generate_random_secret>
FRONTEND_URL=https://your-frontend.vercel.app
```

**Optional (for email):**
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@ingata.com
```

## After Deployment

### 1. Run Database Migrations
Go to your web service on Render → Click "Shell" → Run:
```bash
npm run migration:run
```

### 2. Update Frontend API URL
In your frontend (Vercel), update the API configuration:

```typescript
// frontend/src/services/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-backend-app.onrender.com';
```

Add this environment variable in Vercel:
```
NEXT_PUBLIC_API_URL=https://your-backend-app.onrender.com
```

### 3. Test the Deployment
- Check the Render dashboard for logs
- Visit your backend URL: `https://your-backend-app.onrender.com`
- Test health endpoint: `https://your-backend-app.onrender.com/api/v1/health`

## Important Notes

### Free Tier Limitations
- **Database:** Free tier PostgreSQL spins down after 90 days of inactivity
- **Web Service:** Free tier spins down after 15 minutes of inactivity
- **Cold starts:** First request after spin-down takes 30-60 seconds
- **For production:** Consider upgrading to Starter plan ($7/month)

### Getting Database URLs
After creating the database on Render:
- **DATABASE_URL:** Use the "Internal Database URL" (for pooled connections)
- **DATABASE_URL_UNPOOLED:** Use the "External Database URL" (for migrations)

### CORS Configuration
I've updated the CORS configuration in `src/app.ts` to accept requests from:
- Your Vercel frontend (set via FRONTEND_URL env var)
- Local development (localhost:3000)

Update the FRONTEND_URL env var in Render to match your actual Vercel frontend URL.

### Security Reminders
- Never commit `.env` file
- Use strong JWT_SECRET
- Use app-specific passwords for email
- Enable SSL (Render does this by default)

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure TypeScript compiles locally: `npm run build`
- Verify all dependencies are in package.json

### Database Connection Fails
- Verify DATABASE_URL is correct
- Check database is in same region as app
- Ensure SSL is enabled (default on Render)

### Migration Fails
- Use DATABASE_URL_UNPOOLED for migrations
- Check if database tables already exist
- Review migration logs in Render shell

### API Calls Fail from Frontend
- Check CORS configuration
- Verify FRONTEND_URL env var is set correctly
- Check Vercel environment variables for NEXT_PUBLIC_API_URL

## Next Steps

1. Deploy backend to Render
2. Run database migrations
3. Update frontend API URL
4. Test all API endpoints
5. Monitor logs in Render dashboard

## Support

- Render Documentation: https://render.com/docs
- Troubleshooting Guide: See `DEPLOYMENT.md` for detailed information
- Render Support: https://render.com/support
