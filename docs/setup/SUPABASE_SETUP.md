# Supabase Cloud Setup Guide

Complete guide for setting up INTEGRITY with Supabase Cloud database.

## Quick Start (5 minutes)

### 1. Create Supabase Project

1. Visit [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - **Project name**: `integrity-demo`
   - **Database password**: Create strong password
   - **Region**: Choose closest to you
4. Click "Create new project"

### 2. Get Credentials

After project is created:

1. Go to **Settings > API**
2. Copy these values:
   - `SUPABASE_URL` - Project URL (starts with `https://`)
   - `SUPABASE_ANON_KEY` - Publishable Key (starts with `sb_anon_`)

Example:
```
SUPABASE_URL=https://omxyeagavmybmyqppudf.supabase.co
SUPABASE_ANON_KEY=sb_publishable_UEbY4BlonnynGiN7j4c_rg_S3C1nv7c
```

### 3. Initialize Database

1. In Supabase, go to **SQL Editor**
2. Click "New Query"
3. Paste contents of [init-db.sql](../init-db.sql)
4. Click "Run"
5. ✅ Database is now initialized

### 4. Configure Backend

```bash
# Copy environment template
cp backend/.env.example backend/.env.local
```

Edit `backend/.env.local`:
```
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=sb_anon_your_key
DATABASE_URL=postgresql://postgres:your_password@db.your-project.supabase.co:5432/postgres
```

### 5. Configure Frontend

```bash
# Copy environment template
cp frontend/.env.example frontend/.env.local
```

Edit `frontend/.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=sb_anon_your_key
VITE_API_URL=http://localhost:5000/api/v1
```

### 6. Start Development

```bash
npm run dev
```

## Find Your Credentials in Supabase

### Location 1: Settings > API
- **Project URL**: Copy this
- **Publishable Key**: Use this in frontend
- **Service Role Key**: Use this in backend (if needed)

### Location 2: Database Password
- Settings > Database > Database Password (the one you created)

## Environment Variables Reference

| Variable | Source | Purpose |
|----------|--------|---------|
| `SUPABASE_URL` | Settings > API > Project URL | Backend & Frontend |
| `SUPABASE_ANON_KEY` | Settings > API > Publishable Key | Frontend (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings > API > Service Role Key | Backend (private) |
| `DATABASE_URL` | Settings > Database > Connection String | Direct PostgreSQL |

## Verify Setup

### Health Check
```bash
curl http://localhost:5000/health
```

Should return:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### Test Database Connection
```bash
psql $DATABASE_URL -c "SELECT 1"
```

## Troubleshooting

### Connection Refused
- Verify `SUPABASE_URL` is correct
- Verify network connection to Supabase
- Check credentials in `.env.local`

### Wrong Credentials
- Go to Supabase Settings > API
- Copy values again (exact copy)
- Restart backend: `npm run dev:backend`

### Database Not Initialized
1. Go to Supabase SQL Editor
2. Run init-db.sql again
3. Check for error messages
4. Verify all tables created: `\dt` in SQL console

## Production Deployment

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for production setup with:
- Vercel (frontend)
- Railway or Heroku (backend)
- Production Supabase project

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [INTEGRITY Implementation Plan](./IMPLEMENTATION_PLAN.md)
