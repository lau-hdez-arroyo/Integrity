# INTEGRITY Complete User Flow Testing Guide

## Overview
This guide covers testing the complete authentication and role-based access control flow implemented in INTEGRITY.

## Test Scenarios

### Scenario 1: Login with Single Project Assignment
**User:** qa.tester@integrity.dev (QA role)
**Expected Flow:** 
1. Login → PostLoginRedirect → Fetches projects (1 project) → Automatically selects project → Redirects to /dashboard/qa
2. QADashboard should display with project-specific data

**Steps:**
```
1. Navigate to http://localhost:5173/login
2. Enter email: qa.tester@integrity.dev
3. Enter password: Integrity@2026
4. Click Login
5. Should see loading screen "Preparing your dashboard..."
6. Should redirect automatically to QA Dashboard
7. Verify dashboard shows correct project name and data
```

---

### Scenario 2: Login with Multiple Projects
**User:** admin@integrity.dev (Admin role)
**Expected Flow:**
1. Login → PostLoginRedirect → Fetches projects (multiple) → Redirects to /project-selection
2. Shows all available projects as cards
3. User selects a project → Redirects to /admin (admin dashboard)

**Steps:**
```
1. Navigate to http://localhost:5173/login
2. Enter email: admin@integrity.dev
3. Enter password: Admin@2026
4. Click Login
5. Should see loading screen "Preparing your dashboard..."
6. Should redirect to Project Selection page
7. Should see 4 project cards (PayFlow, Banking, Gateway, INTEGRITY Demo)
8. Click any project card
9. Should redirect to Admin Panel
10. Verify admin controls are available
```

---

### Scenario 3: Project Switching via Dropdown
**User:** admin@integrity.dev (already logged in with project selected)
**Expected Flow:**
1. See ProjectDropdown in header showing current project
2. Click dropdown → See list of all projects
3. Select different project → Updates context and stays on current page
4. Project-specific data updates

**Steps:**
```
1. Login as admin and select a project
2. Look for project name dropdown in header (next to user menu)
3. Click dropdown
4. Should see "YOUR PROJECTS (4)" header
5. Should see 4 projects with "Active" label on current project
6. Click different project
7. Verify dropdown closes and data updates
8. Check that new project is now marked as "Active"
```

---

### Scenario 4: Project Switching via Logo Click
**User:** admin@integrity.dev (already logged in)
**Expected Flow:**
1. Click INTEGRITY logo in top-left → Opens project menu
2. Shows all projects
3. Click project → Selects and updates context

**Steps:**
```
1. Login as admin and be in any dashboard
2. Click "INTEGRITY" text in top-left header
3. Should see project menu with 4 projects
4. Click any project
5. Menu should close
6. Current page should remain same but project context updated
```

---

### Scenario 5: Role-Based Access Control - Denied
**User:** qa.tester@integrity.dev (QA role)
**Expected Flow:**
1. User manually navigates to /admin (admin only)
2. RoleProtectedRoute intercepts and shows "Access Denied"
3. Admin panel should not be accessible

**Steps:**
```
1. Login as qa.tester@integrity.dev (QA role)
2. Select project
3. Note the URL in browser: http://localhost:5173/dashboard/qa
4. Manually change URL to: http://localhost:5173/admin
5. Should see "Access Denied - You do not have permission to access this page"
6. Should have button to go back
7. AdminPanel should not load
```

---

### Scenario 6: Executive Dashboard Access
**User:** executive@integrity.dev (Executive role)
**Expected Flow:**
1. Login → PostLoginRedirect → Selects project → Redirects to /dashboard/executive
2. Executive dashboard shows executive-specific metrics

**Steps:**
```
1. Navigate to http://localhost:5173/login
2. Enter email: executive@integrity.dev
3. Enter password: Executive@2026
4. Click Login
5. Should redirect to /dashboard/executive (if single project) or /project-selection (if multiple)
6. Verify executive dashboard displays (KPIs, trends, reports)
```

---

### Scenario 7: Developer Dashboard Access
**User:** developer@integrity.dev (Developer role)
**Expected Flow:**
1. Login → PostLoginRedirect → Selects project → Redirects to /dashboard/developer
2. Developer dashboard shows development metrics

**Steps:**
```
1. Navigate to http://localhost:5173/login
2. Enter email: developer@integrity.dev
3. Enter password: Developer@2026
4. Click Login
5. Should redirect to /dashboard/developer
6. Verify developer dashboard displays (build stats, deployments, errors)
```

---

### Scenario 8: Projects Dashboard Navigation
**User:** Any authenticated user
**Expected Flow:**
1. From any dashboard, click "Projects" stat card
2. Navigates to /projects page
3. Shows all 4 projects with details
4. Can select project to switch

**Steps:**
```
1. Login as admin
2. Select a project
3. You're now on main dashboard (/dashboard)
4. Look for "Projects" stat card showing number "4"
5. Click on "Projects" stat
6. Should navigate to /projects page
7. Should see 4 project cards with descriptions
8. Click "Select Project" on any card
9. Should switch to that project
```

---

### Scenario 9: No Projects Assigned
**User:** Create a test user with no project_members assignments
**Expected Flow:**
1. Login → PostLoginRedirect → Fetches projects (0 projects) → Redirects to /no-projects
2. Shows "No Projects Available" page
3. User can logout

**Steps:**
```
1. In Supabase, create new user or modify existing to have no project_members rows
2. Login with this user
3. Should redirect to /no-projects page
4. Should see warning icon and message
5. Click "Logout"
6. Should return to login page
```

---

### Scenario 10: Project-Specific Data Isolation
**User:** admin@integrity.dev (Admin role)
**Expected Flow:**
1. Select Project A → See Project A's test data
2. Switch to Project B → See Project B's test data
3. Data should be different for each project

**Steps:**
```
1. Login as admin
2. Go to Project Selection
3. Select "PayFlow Platform"
4. Note the test count and risk scores
5. Switch project (via dropdown or logo)
6. Select "Mobile Banking App"
7. Verify different test counts and risk scores
8. Data should reflect each project's unique dummy data
```

---

## Key Test Assertions

- [ ] Login redirects to /post-login instead of /dashboard
- [ ] PostLoginRedirect determines destination based on project count
- [ ] Single project auto-selects and redirects to role-specific dashboard
- [ ] Multiple projects redirect to /project-selection
- [ ] ProjectDropdown visible in header when multiple projects
- [ ] ProjectDropdown shows correct active project
- [ ] ProjectDropdown allows switching projects
- [ ] INTEGRITY logo click opens project menu
- [ ] RoleProtectedRoute blocks unauthorized role access
- [ ] AuthContext stores userRole from user_metadata
- [ ] localStorage has 'userRole' and 'selectedProject' after login
- [ ] Dashboard displays correct project name
- [ ] Project-specific data loads correctly
- [ ] Navigating to unauthorized dashboard shows "Access Denied"
- [ ] Users with no projects see "No Projects" page
- [ ] All 4 projects have differentiated dummy data
- [ ] Project switching doesn't require re-login

---

## Known Test Credentials

| Email | Password | Role | Projects |
|-------|----------|------|----------|
| admin@integrity.dev | Admin@2026 | admin | All 4 |
| qa.tester@integrity.dev | Integrity@2026 | qa | 1 (Testing only) |
| executive@integrity.dev | Executive@2026 | executive | All 4 |
| developer@integrity.dev | Developer@2026 | Developer | All 4 |

---

## Troubleshooting

**Issue: User stuck on /post-login with infinite loading**
- Check browser console for errors
- Verify /users/me/projects endpoint is responding
- Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env

**Issue: Role protection not working**
- Verify localStorage has 'userRole' set
- Check user_metadata.role in Supabase Auth
- Verify RoleProtectedRoute component is imported in App.jsx

**Issue: ProjectDropdown not visible**
- Only shows when projects.length > 1
- Check ProjectContext has projects populated
- Verify ProjectDropdown is imported in Navigation

**Issue: Project data not differentiating**
- Run `npm run seed:dummy` in backend to generate project-specific data
- Verify seed script has correct project_ids
- Check that dashboards are querying by selectedProject

---

## Performance Expectations

- Login flow should complete in <2 seconds
- Project selection/data load should be <1 second
- Project switching should update immediately
- No console errors or warnings

