# Quick Start Guide - INTEGRITY

Get INTEGRITY running locally in 5 minutes.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Supabase account (free plan works)
- Git

## Setup (5 minutes)

### 1. Clone Repository
```bash
git clone <repository-url>
cd Integrity
```

### 2. Get Supabase Credentials

1. Visit [Supabase](https://supabase.com)
2. Create free project or use existing
3. Get credentials from **Settings > API**:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY` (Publishable key)

### 3. Install Dependencies
```bash
npm run install:all
```

### 4. Configure Environment

**Backend:**
```bash
cp backend/.env.example backend/.env.local
```

Edit `backend/.env.local`:
```
NODE_ENV=development
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_publishable_key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co/postgres
```

**Frontend:**
```bash
cp frontend/.env.example frontend/.env.local
```

Edit `frontend/.env.local`:
```
VITE_API_URL=http://localhost:5000/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_publishable_key
```

### 5. Start Development Servers
```bash
npm run dev
```

You should see:
```
Backend running on http://localhost:5000
Frontend running on http://localhost:5173
```

### 6. Open in Browser
```
http://localhost:5173
```

## Verify Setup

### Health Check
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-05-01T...",
  "uptime": 12.34
}
```

### Test API Endpoint
```bash
curl http://localhost:5000/api/v1/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Common Issues

### Port 5000 Already in Use
```bash
# Find process on port 5000
lsof -i :5000

# Kill it
kill -9 <PID>
```

### Database Connection Failed
1. Verify Supabase URL and credentials in `.env.local`
2. Check if PostgreSQL connection string is correct
3. Test connection: `psql $DATABASE_URL -c "SELECT 1"`

### Frontend Can't Connect to API
1. Verify backend is running: `curl http://localhost:5000/health`
2. Check VITE_API_URL in `frontend/.env.local`
3. Check CORS configuration in `backend/server.js`

### VITE_SUPABASE_ANON_KEY Not Set
1. Verify `frontend/.env.local` exists
2. Restart frontend dev server: `npm run dev:frontend`

## Next Steps

### Create First Project
1. Open http://localhost:5173
2. Create account (Supabase Auth)
3. Create new project
4. Generate heat map
5. Get test recommendations

### Run Tests
```bash
# Backend tests
npm run test:backend

# Frontend tests
npm test --workspace=frontend
```

### Build for Production
```bash
npm run build
```

Outputs:
- `backend/dist/` - Express server
- `frontend/dist/` - React app

## Useful Commands

```bash
# View backend logs
npm run dev:backend

# View frontend logs
npm run dev:frontend

# Check all running services
netstat -tlnp | grep -E ":5000|:5173|:6379"

# Clear node_modules and reinstall
rm -rf node_modules backend/node_modules frontend/node_modules
npm run install:all

# Reset environment
npm run clean
npm run install:all
npm run dev
```

## Directory Structure Quick Reference

```
integrity-monorepo/
├── backend/          # Express API (port 5000)
├── frontend/         # React app (port 5173)
├── docs/            # Documentation
└── package.json     # Root config
```

## Environment Variables Reference

### Backend (.env.local)
| Variable | Example | Required |
|----------|---------|----------|
| NODE_ENV | development | Yes |
| PORT | 5000 | Yes |
| SUPABASE_URL | https://xxx.supabase.co | Yes |
| SUPABASE_KEY | sb_anon_xxx | Yes |
| DATABASE_URL | postgresql://user:pass@host/db | Yes |

### Frontend (.env.local)
| Variable | Example | Required |
|----------|---------|----------|
| VITE_API_URL | http://localhost:5000/api/v1 | Yes |
| VITE_SUPABASE_URL | https://xxx.supabase.co | Yes |
| VITE_SUPABASE_ANON_KEY | sb_anon_xxx | Yes |

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /health | Health check |
| GET | /api/v1/projects | List projects |
| POST | /api/v1/heatmaps/generate | Generate heat map |
| POST | /api/v1/test-selection/recommend | Get test recommendations |
| POST | /api/v1/risk-assessment/evaluate | Evaluate risk |

See [API_REFERENCE.md](./API_REFERENCE.md) for complete documentation.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.

## Documentation

- [Implementation Plan](./IMPLEMENTATION_PLAN.md) - Architecture overview
- [API Reference](./API_REFERENCE.md) - All endpoints
- [Database Schema](./DATABASE_SCHEMA.md) - Data model
- [Deployment Guide](./DEPLOYMENT.md) - Production setup

## Support

1. Check documentation in `/docs`
2. Review GitHub issues
3. Create new issue with details

## What's Next?

After setup works:
1. ✅ Create test project
2. ✅ Explore dashboards
3. ✅ Run API tests
4. ✅ Review code
5. ✅ Deploy to Vercel + Railway

Happy coding! 🚀
