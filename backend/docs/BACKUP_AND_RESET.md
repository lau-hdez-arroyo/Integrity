# INTEGRITY Database Backup & Reset Guide

## Overview

This guide explains how to backup the INTEGRITY project and reset the database to start fresh with new requirements.

---

## Part 1: Backup Process ✅ COMPLETED

### Git Backup (Recommended)

A backup has been created with:

```bash
# Backup Commit
Commit: 9b9ab08
Message: "BACKUP: Complete role-based auth implementation with QA/Developer/Executive dashboards and project switching"

# Tagged Backup
Tag: v1.0-auth-baseline
Description: "Role-based authentication system with project switching - Ready for major changes"
```

### What's Included in Backup

✅ All source code changes:
  - Role-based authentication system
  - PostLoginRedirect component
  - RoleProtectedRoute component
  - ProjectDropdown and ProjectSelector
  - AuthContext with role management
  - QA, Developer, Executive dashboards
  - Project switching functionality
  - Error boundaries and logging

✅ All documentation:
  - ROLES_PERMISSIONS_MATRIX.md
  - ROLES_MATRIX_QUICK.md
  - ARCHITECTURE_ROLES_DIAGRAM.md
  - ROLES_MATRIX_TABLES.md
  - TESTING_GUIDE.md

✅ All scripts:
  - create-test-users.js
  - seed-dummy-data.js
  - reset-database.js (new)
  - delete-test-users.js (new)
  - full-reset-cli.js (new)

### How to Restore from Backup

If you need to restore to this point:

```bash
# View backup tag
git tag v1.0-auth-baseline

# Restore to backup
git checkout v1.0-auth-baseline

# Or restore just the code changes
git reset --hard 9b9ab08
```

---

## Part 2: Database Reset

### Quick Start

To reset everything at once (recommended):

```bash
# From backend/ directory
npm run full:reset
```

This will:
1. Delete all test users from Supabase Auth
2. Truncate all database tables
3. Create fresh test users
4. Seed dummy data for all projects

### Individual Reset Steps

If you prefer manual control:

#### Step 1: Delete Test Users
```bash
npm run users:delete
```

Deletes these users from Supabase Auth:
- admin@integrity.dev
- qa.tester@integrity.dev
- executive@integrity.dev
- developer@integrity.dev
- laura.hernandez@payflow.com

#### Step 2: Reset Database Tables
```bash
npm run db:wipe
```

Truncates these tables (in dependency order):
- audit_logs
- admin_logs
- heat_maps
- risk_assessments
- test_executions
- integration_mappings
- connections
- project_members
- projects

#### Step 3: Create Test Users
```bash
npm run users:create
```

Recreates all test users with fresh credentials

#### Step 4: Seed Dummy Data
```bash
npm run seed:dummy
```

Populates projects with realistic dummy data:
- test_executions
- risk_assessments
- heat_maps

---

## Reset Commands Summary

```bash
# Full automated reset (recommended)
npm run full:reset

# Manual steps
npm run users:delete    # Delete auth users
npm run db:wipe         # Truncate tables
npm run users:create    # Create new auth users
npm run seed:dummy      # Populate dummy data

# Individual scripts
node scripts/delete-test-users.js
node scripts/reset-database.js
node scripts/create-test-users.js
node scripts/seed-dummy-data.js
node scripts/full-reset-cli.js
```

---

## After Reset - Fresh Start

### 1. Start the application
```bash
npm run dev
```

### 2. Login with fresh test users
```
Admin:
  Email: admin@integrity.dev
  Password: Admin@2026

QA:
  Email: qa.tester@integrity.dev
  Password: Integrity@2026

Developer:
  Email: developer@integrity.dev
  Password: Developer@2026

Executive:
  Email: executive@integrity.dev
  Password: Executive@2026
```

### 3. What's Ready
✅ All 4 projects with clean data
✅ All 5 test users with correct roles
✅ Fresh dummy data per project
✅ No existing sessions or stale data
✅ All tables properly populated

---

## Backup & Reset Script Files

### Files Created/Modified

```
backend/scripts/
├── reset-database.js      # Truncate all database tables
├── delete-test-users.js   # Delete test users from Auth
├── full-reset-cli.js      # Orchestrate complete reset (Node.js)
├── full-reset.sh          # Orchestrate complete reset (Bash)
├── create-test-users.js   # Create test users (existing)
└── seed-dummy-data.js     # Populate dummy data (existing)

backend/package.json
├── npm run full:reset     # New: Full reset command
├── npm run db:wipe        # New: Truncate tables
├── npm run users:delete   # New: Delete auth users
├── npm run users:create   # New: Create auth users
└── npm run seed:dummy     # Existing: Seed data
```

---

## Troubleshooting

### Reset fails due to foreign key constraints
**Solution:** Scripts are ordered by dependencies. Run `npm run full:reset` which handles ordering.

### Can't connect to Supabase
**Solution:** Check `.env.local` has correct credentials:
```bash
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Users stuck in CLOSE_WAIT state
**Solution:** Kill existing processes and restart
```bash
npm run dev  # This will start fresh
```

### Dummy data not populating correctly
**Solution:** Ensure projects were created first (included in full:reset)
```bash
npm run full:reset  # Runs in correct order
```

### Some tables not resetting
**Solution:** Check table names in `reset-database.js` match your schema
```js
const tablesToReset = [
  'audit_logs',
  'admin_logs',
  // ... etc
];
```

---

## What This Enables

After reset, you can safely:

✅ Modify the QA Dashboard to load the roles matrix
✅ Change authentication flows
✅ Restructure projects
✅ Modify user-project relationships
✅ Update role permissions
✅ Test new features without old data interference
✅ Ensure clean state for development

---

## Recovery Information

If something goes wrong:

### Restore from Git Backup
```bash
git reset --hard 9b9ab08
```

### Restore Just Database
- Manual Supabase dashboard restore
- Or re-run seed scripts

### Restore Just Code
```bash
git checkout backend/
git checkout frontend/
```

---

## Next Steps

You now have:
1. ✅ Clean backup at commit `9b9ab08` tagged as `v1.0-auth-baseline`
2. ✅ Empty database ready for fresh data
3. ✅ New test users ready to use
4. ✅ Fresh dummy data populated

**Ready to implement changes:**
- Modify QA Dashboard to display roles matrix
- Update other role requirements
- Add new features with clean slate

Run `npm run dev` to start with the fresh setup!
