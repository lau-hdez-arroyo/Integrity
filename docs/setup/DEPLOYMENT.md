# Deployment Guide

Production deployment guide for INTEGRITY platform.

## Deployment Options

### Option 1: Frontend on Vercel + Backend on Railway (Recommended)

**Pros:**
- Fast, easy deployment
- Free tier available
- Serverless (no maintenance)
- Global CDN for frontend

**Cost:**
- Vercel: Free ($20/mo pro)
- Railway: ~$5-50/mo
- Supabase: Free-$25/mo
- **Total: ~$30-75/mo**

### Option 2: Full Heroku Stack

**Pros:**
- Single platform for both
- One dashboard
- Integrated CI/CD

**Cost:**
- Heroku: ~$50/mo (dyno hours)
- Supabase: Free-$25/mo
- **Total: ~$75-100/mo**

### Option 3: Azure (Enterprise)

**Pros:**
- Enterprise support
- Advanced security
- Integration with Microsoft tools

**Cost:** $100+/mo

---

## Frontend Deployment (Vercel)

### Step 1: Push to GitHub

```bash
git add .
git commit -m "refactor: Migrate to Node.js + React monorepo"
git push origin main
```

### Step 2: Connect Vercel

1. Visit [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Select GitHub repository: `Integrity`
4. Framework: **Next.js** (or leave auto-detect)
5. Root Directory: `frontend`
6. Click "Deploy"

### Step 3: Add Environment Variables

In Vercel dashboard → Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=sb_anon_xxxxx
VITE_API_URL=https://your-backend.railway.app/api/v1
```

### Step 4: Re-deploy

Vercel will auto-deploy on git push. Or click "Redeploy" in dashboard.

**Frontend URL:** `https://your-project-name.vercel.app`

---

## Backend Deployment (Railway)

### Step 1: Create Railway Account

1. Visit [Railway](https://railway.app)
2. Sign up with GitHub
3. Create new project

### Step 2: Connect GitHub Repository

1. Click "New Project"
2. Select "Deploy from GitHub"
3. Choose repository: `Integrity`
4. Click "Deploy"

### Step 3: Configure Environment Variables

In Railway dashboard → Project Settings → Environment Variables:

```
NODE_ENV=production
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=sb_anon_xxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...xxxxx
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

### Step 4: Set Root Directory

In Railway dashboard:
- Service Settings → Root Directory: `backend`

### Step 5: Deploy

Click "Deploy" or commits to main will auto-deploy.

**Backend URL:** `https://your-project.up.railway.app`

---

## Database (Supabase Cloud)

Supabase is already in production setup. No additional deployment needed.

### Verify Production Database

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select production project
3. Go to SQL Editor
4. Run: `SELECT COUNT(*) FROM projects;`

---

## Backend Deployment (Heroku Alternative)

### Step 1: Install Heroku CLI

```bash
npm install -g heroku
```

### Step 2: Login to Heroku

```bash
heroku login
```

### Step 3: Create Heroku App

```bash
cd backend
heroku create your-app-name
```

### Step 4: Add Environment Variables

```bash
heroku config:set NODE_ENV=production
heroku config:set SUPABASE_URL=https://your-project.supabase.co
heroku config:set SUPABASE_KEY=sb_anon_xxxxx
# ... add all other variables
```

### Step 5: Deploy

```bash
git subtree push --prefix backend heroku main
```

Or push entire repo:
```bash
git push heroku main
```

### Step 6: View Logs

```bash
heroku logs --tail
```

---

## Verification Checklist

After deployment:

- [ ] Frontend loads: `https://your-app.vercel.app`
- [ ] Can login with Supabase Auth
- [ ] Health check works: `curl https://your-api.railway.app/health`
- [ ] API requests work: `curl https://your-api.railway.app/api/v1/projects`
- [ ] Database queries execute
- [ ] Logs show no errors

### Health Check

```bash
curl https://your-backend-url/health
```

Expected:
```json
{
  "status": "ok",
  "database": "connected",
  "uptime": 1234.5
}
```

### Test API

```bash
curl -H "Authorization: Bearer YOUR_JWT" \
  https://your-backend-url/api/v1/projects
```

---

## Monitoring & Logging

### Vercel Logs
- Dashboard → Project → Deployments → Logs
- Real-time logs of frontend deployment

### Railway Logs
- Dashboard → Project → Services → Logs
- Real-time backend logs

### Supabase Logs
- Dashboard → Project → Logs
- Database and API logs

---

## Continuous Deployment (CI/CD)

### GitHub Actions Workflow

Optional: Add automated testing and deployment.

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm run install:all
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: success()
    steps:
      - uses: actions/checkout@v3
      - run: |
          # Frontend deploys automatically to Vercel on push
          # Backend: push to Railway or Heroku
          git push railway main
```

---

## Domain Configuration

### Add Custom Domain (Vercel)

1. In Vercel dashboard → Project Settings → Domains
2. Add your domain: `integrity.your-company.com`
3. Follow DNS configuration instructions
4. Wait 5-60 minutes for DNS propagation

### Add Custom Domain (Railway)

1. In Railway → Project → Project Settings → Domains
2. Add custom domain
3. Update DNS records
4. Wait for propagation

---

## SSL/TLS Certificates

Both Vercel and Railway provide free SSL certificates automatically.

- **Frontend:** Auto-configured by Vercel
- **Backend:** Auto-configured by Railway
- **Database:** Auto-configured by Supabase

No additional configuration needed.

---

## Scaling

### Frontend (Vercel)
- Automatically scales based on traffic
- Free tier: Up to 100 GB bandwidth/month
- Pro: Unlimited bandwidth

### Backend (Railway)
- Vertical scaling: Increase dyno type
- Horizontal scaling: Add more instances
- Pay per resource usage

### Database (Supabase)
- Free tier: 0.5 GB storage
- Pro: Unlimited storage with additional backup options
- Automatic scaling

---

## Backup & Recovery

### Database Backups (Supabase)
- Automatic daily backups (free)
- Point-in-time recovery available
- 7-day retention (free tier)

### Code Repository
- GitHub is your backup
- Clone anywhere: `git clone <repo>`

### Environment Variables
- Store in 1Password or similar
- Never commit to repository

---

## Production Environment Variables

Complete list for production:

```
# Application
NODE_ENV=production
PORT=5000

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=sb_anon_xxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
DATABASE_URL=postgresql://...

# Frontend (Vercel)
VITE_API_URL=https://your-api.railway.app/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=sb_anon_xxxxx
```

---

## Troubleshooting

### Frontend won't load
- Check Vercel deployment logs
- Verify VITE_API_URL is correct backend URL
- Clear browser cache

### Backend returns 500 error
- Check Railway logs
- Verify environment variables
- Test database connection

### API requests fail with 401
- Verify JWT token is valid
- Check Supabase credentials
- Check Authorization header format

### Database connection refused
- Verify DATABASE_URL in environment
- Check Supabase project is running
- Verify firewall rules allow connection

---

## Cost Estimation

### Minimum (Free Tier)
- Vercel: Free
- Railway: Free (limited)
- Supabase: Free (0.5GB)
- **Total: ~$0/mo** (limited usage)

### Standard (Recommended)
- Vercel: Free
- Railway: ~$10/mo
- Supabase: Free
- **Total: ~$10/mo**

### Production
- Vercel: $20/mo (pro)
- Railway: ~$50/mo
- Supabase: $25/mo
- **Total: ~$95/mo**

---

## Next Steps

1. Deploy frontend to Vercel
2. Deploy backend to Railway
3. Configure custom domains
4. Set up monitoring alerts
5. Create backup schedule
6. Document deployment process
7. Train team on production access

---

## Support

- Vercel Support: [vercel.com/support](https://vercel.com/support)
- Railway Support: [railway.app/support](https://railway.app/support)
- Supabase Support: [supabase.com/docs](https://supabase.com/docs)
