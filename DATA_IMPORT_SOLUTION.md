# 🚀 INTEGRITY Data Import - Solution Guide

## Current Status

✅ **Completed:**
- Full-stack app built (React + Express + Supabase)
- Both servers configured and tested
- 5 users, 3 projects, and comprehensive test data defined in `seed-data.json`
- Import script infrastructure created

⚠️ **Issue Identified:**
- Supabase tables have **Row-Level Security (RLS)** enabled
- The public/anonymous API key cannot insert data due to RLS policies
- Solution: Use SERVICE_ROLE_KEY or disable RLS

---

## Quick Solution (Choose One)

### Option 1: Disable RLS on Supabase Tables (Fastest - Dev Only)

**⚠️ WARNING: Only for development! Do NOT disable RLS in production.**

1. Go to Supabase Dashboard: https://app.supabase.com
2. Select your project: `omxyeagavmybmyqppudf`
3. Go to **SQL Editor** (or **Tables**)
4. For each table, disable RLS:
   - Click table name
   - Go to **Auth** / **Row Level Security** 
   - Toggle OFF for: `users`, `projects`, `project_members`, `heat_maps`, `test_executions`, `risk_assessments`
5. Run import:
   ```bash
   npm run import-dummy
   ```

---

### Option 2: Use SERVICE_ROLE_KEY (Recommended)

1. Go to Supabase Dashboard: https://app.supabase.com/project/omxyeagavmybmyqppudf/settings/api
2. Copy **service_role key** (starts with `eyJhbGc...`)
3. Edit `backend/.env.local`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Paste here
   ```
4. Restart backend:
   ```bash
   npm run dev:backend
   ```
5. Run import:
   ```bash
   npm run import-dummy
   ```

---

### Option 3: Manual Data Entry via UI (Workaround)

If you don't want to modify RLS/keys:

1. Start both servers:
   ```bash
   npm run dev
   ```

2. Open http://localhost:5175

3. Create data manually in Admin Panel

---

## Running After Fix

Once you've fixed the RLS issue using Option 1 or 2:

```bash
# Terminal 1: Start servers
npm run dev

# Terminal 2: Import dummy data (when backend is ready)
npm run import-dummy
```

### Expected Output:
```
✅ IMPORT COMPLETE

📊 Summary:
   Users:                5
   Projects:             3
   Project Members:      9
   Heat Maps:            13
   Test Executions:      6
   Risk Assessments:     3

🚀 Data imported successfully!
   Open http://localhost:5175 to see the data in dashboards
```

---

## Files Created for Import

| File | Purpose |
|------|---------|
| `seed-data.json` | Pre-defined dummy data (5 users, 3 projects, 13 modules) |
| `scripts/import-backend.js` | Import script that calls backend endpoint |
| `backend/routes/admin.js` | Backend endpoint that performs import |

---

## Troubleshooting

**Problem:** "RLS policy violation"
- **Solution:** Disable RLS (Option 1) or add SERVICE_ROLE_KEY (Option 2)

**Problem:** "Backend is not running"
- **Solution:** Run `npm run dev` in Terminal 1, wait 5 seconds, then try import

**Problem:** "File not found"
- **Solution:** Ensure you're in project root: `cd C:\Repos\Integrity\Integrity`

**Problem:** "Supabase configuration missing"
- **Solution:** Check `backend/.env.local` has `SUPABASE_URL` and `SUPABASE_KEY`

---

## Next Steps

Once data is imported:

1. ✅ Open http://localhost:5175
2. ✅ View dashboards with test data
3. ✅ Create more projects/users in Admin Panel
4. ✅ Deploy to production (Vercel + Railway)

---

## Security Note

- 🔒 Never commit SERVICE_ROLE_KEY to git
- 🔒 In production, use proper authentication (JWT)
- 🔒 Re-enable RLS on all tables before deploying
- 🔒 Use proper RLS policies for user-scoped data access
