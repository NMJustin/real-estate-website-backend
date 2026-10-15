# Backend Deployment Guide - Render.com

## Prerequisites
- A Render.com account (free tier available)
- GitHub repository with the backend code
- PostgreSQL database (can be created on Render)

## Deployment Steps

### 1. Push Backend to GitHub
Ensure your backend code is in a GitHub repository. If it's in a subdirectory of the frontend repo, you may want to separate it or use a monorepo structure.

### 2. Create PostgreSQL Database on Render
1. Go to [Render.com](https://render.com)
2. Click "New" → "PostgreSQL"
3. Name it: `ingata-postgres`
4. Select a region (choose closest to your users)
5. Select a plan (Free tier available)
6. Click "Create Database"

**Important:** Save the following information from Render:
- Internal Database URL (use this for DATABASE_URL)
- External Database URL (for direct connections)
- Database Name
- Username
- Password

### 3. Deploy Backend Application
1. Go to Render.com dashboard
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Select the backend repository
5. Configure:

**Build & Deploy:**
- Root Directory: `backend` (if in monorepo) or leave empty
- Build Command: `npm run build`
- Start Command: `npm start`

**Environment Variables:**
Add the following environment variables:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=<your_render_postgres_internal_url>
DATABASE_URL_UNPOOLED=<your_render_postgres_external_url>
JWT_SECRET=<generate_a_strong_random_secret>
```

**Email Configuration (Optional):**
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@ingata.com
```

6. Click "Create Web Service"

### 4. Run Database Migrations
After deployment, you'll need to run migrations. You can do this via Render's shell:

1. Go to your web service on Render
2. Click "Shell" in the top right
3. Run: `npm run migration:run`

Or you can add a `render-build.sh` script to run migrations automatically.

### 5. Update Frontend API URL
Update your frontend's API configuration to point to the new Render backend URL:

```typescript
// In frontend/src/services/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-backend-app.onrender.com';
```

### 6. Add CORS Configuration
Ensure your backend CORS allows requests from your Vercel frontend domain:

```typescript
// In backend/src/app.ts
app.use(cors({
  origin: ['https://your-frontend.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
```

## Alternative: Using render.yaml

If you prefer infrastructure as code, the `render.yaml` file is already included. To use it:

1. Go to Render.com dashboard
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will read the `render.yaml` file
5. Review and click "Apply Blueprint"

## Important Notes

### Free Tier Limitations
- Render's free tier spins down after 15 minutes of inactivity
- Cold starts may take 30-60 seconds
- For production, consider the Starter plan ($7/month)

### Database Connection
- Use the **Internal Database URL** for DATABASE_URL (for pooled connections)
- Use the **External Database URL** for DATABASE_URL_UNPOOLED (for migrations)
- The backend is already configured to handle both URLs

### Environment Variables
Never commit sensitive data like:
- DATABASE_URL
- JWT_SECRET
- Email passwords
- API keys

These should be set in Render's environment variables.

### Monitoring
- Render provides logs and metrics in the dashboard
- Check logs for any deployment or runtime errors
- Set up alerts for important events

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check if the database is in the same region as the app
- Ensure SSL is enabled (Render PostgreSQL uses SSL by default)

### Build Failures
- Check build logs in Render dashboard
- Ensure all dependencies are in package.json
- Verify TypeScript compiles locally first

### Runtime Errors
- Check runtime logs in Render dashboard
- Verify environment variables are set correctly
- Ensure database migrations have been run

## Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Configure email service
- [ ] Enable production database (not free tier if critical)
- [ ] Set up monitoring and alerts
- [ ] Configure custom domain (optional)
- [ ] Enable automatic backups (for database)
- [ ] Review CORS settings
- [ ] Test all API endpoints
- [ ] Set up log retention
