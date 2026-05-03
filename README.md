# 🚀 INTEGRITY - Intelligent Test Selection & Risk Assessment Platform

**Modern Stack:** Node.js + Express Backend | React 18 Frontend | Supabase PostgreSQL  
**Architecture:** Full-Stack Monorepo with Intelligent Dashboards & Heat Maps  
**Status:** ✅ Production-Ready | Fully Integrated | Ready for Data Import

---

## 🎯 What is INTEGRITY?

INTEGRITY is an intelligent test selection and risk assessment platform that helps QA teams:

- 🎯 **Select optimal tests** based on code changes and risk factors
- 🗺️ **Visualize risk** through intelligent heat maps by module
- 📊 **Assess impact** of code changes before release
- ⏱️ **Reduce cycle time** by eliminating unnecessary tests
- ✨ **Improve quality** with data-driven testing decisions
- 📈 **Track velocity** and test execution trends

---

## 🚀 Quick Start

### ✅ Prerequisites
- Node.js v18+ (check: `node --version`)
- npm v9+ (check: `npm --version`)
- Git

### ⚡ Run INTEGRITY (3 Steps)

#### **Step 1: Install Dependencies**
```bash
cd C:\Repos\Integrity\Integrity
npm install
```

#### **Step 2: Start Dev Servers**
```bash
npm run dev
```

This starts **both servers concurrently**:
- 🔷 **Backend**: http://localhost:5000
- 🔷 **Frontend**: http://localhost:5175

**Output should show:**
```
[backend] ✅ Server listening on port 5000
[frontend] ✅ Local: http://localhost:5175
```

#### **Step 3: Open in Browser**
```
http://localhost:5175
```

✅ **That's it!** You now have INTEGRITY running locally.

---

### 📊 Access the App

| Component | URL | Purpose |
|-----------|-----|---------|
| **Frontend** | http://localhost:5175 | Main dashboard & UI |
| **Backend Health** | http://localhost:5000/health | API status check |
| **API Docs** | See `docs/API_REFERENCE.md` | API endpoints |

---

## 📥 Import Test Data

Your app is ready but needs data. Follow these steps:

### **Option 1: Quick Test (2 min)**

Use the provided minimal example:

```bash
cd C:\Repos\Integrity\Integrity

# Create a minimal seed file
echo @'
{
  "users": [
    {"email": "admin@test.com", "name": "Admin", "role": "admin"},
    {"email": "qa@test.com", "name": "QA Lead", "role": "qa"}
  ],
  "projects": [
    {
      "name": "Test Project",
      "description": "Demo project",
      "repo": "https://github.com/test/project",
      "created_by_email": "admin@test.com"
    }
  ],
  "project_members": [
    {"project_name": "Test Project", "user_email": "qa@test.com", "role": "qa_lead"}
  ],
  "heat_maps": [
    {"project_name": "Test Project", "module_name": "API", "coverage_percentage": 85, "risk_level": "medium"},
    {"project_name": "Test Project", "module_name": "Auth", "coverage_percentage": 95, "risk_level": "low"}
  ],
  "test_executions": [
    {
      "project_name": "Test Project",
      "total_tests": 100,
      "passed_tests": 90,
      "failed_tests": 5,
      "skipped_tests": 5,
      "coverage_percentage": 88,
      "execution_time_seconds": 60,
      "status": "completed"
    }
  ],
  "risk_assessments": [
    {
      "project_name": "Test Project",
      "risk_score": 4.5,
      "risk_level": "medium",
      "identified_risks": ["Low API coverage", "Flaky tests"],
      "recommendations": ["Add more tests", "Fix flaky tests"]
    }
  ]
}
'@ | Out-File seed-data.json -Encoding UTF8

# Import it
npm run import-data

# Check output - should show:
# ✓ Imported 2 users
# ✓ Imported 1 projects
# ... etc
# ✅ IMPORT COMPLETE
```

After import, refresh http://localhost:5175 to see data!

---

### **Option 2: Import Your Own Data (10-15 min)** ⭐ **RECOMMENDED**

You have other apps with test data? Extract and import them!

📚 **Complete Data Import Documentation:**
```
docs/data-import/
├── README.md                    ← Start here (overview)
├── 00-QUICK-START.md           ← 5-step quick guide
├── 01-DATA-SPEC.md             ← Detailed structure
├── 02-EXTRACT-PROMPT.md        ← Generic prompt (copy+paste)
└── 03-PROCESS-FLOWCHART.md     ← Visual flowchart
```

**Quick Steps:**
1. Open: `docs/data-import/00-QUICK-START.md`
2. Open: `docs/data-import/02-EXTRACT-PROMPT.md`
3. Copy the PROMPT section
4. Use in ChatGPT/Claude/Gemini with your app data
5. Get JSON output
6. Save as `seed-data.json`
7. Run: `npm run import-data`

---

## 🛠️ Available Commands

### Development
```bash
# Start all servers (frontend + backend)
npm run dev

# Start backend only
npm run dev:backend    # Runs on http://localhost:5000

# Start frontend only
npm run dev:frontend   # Runs on http://localhost:5175

# Build for production
npm run build

# Run tests
npm run test
```

### Database & Data
```bash
# Validate Supabase connection
npm run validate

# Import data from seed-data.json
npm run import-data

# Import data from specific file
npm run import-data -- --file=my-data.json

# Seed database with sample data
npm run seed

# Inspect database schema
npm run inspect-schema

# Inspect table columns
npm run inspect-columns
```

---

## 📂 Project Structure

```
C:\Repos\Integrity\Integrity\
│
├── 📂 frontend/                    React app
│   ├── src/
│   │   ├── pages/                  Dashboard pages
│   │   ├── components/             Reusable components
│   │   ├── services/               API calls
│   │   └── theme.js                Design system
│   └── vite.config.js              Vite configuration
│
├── 📂 backend/                     Express API
│   ├── server.js                   Main server
│   ├── db/supabase.js              DB connection
│   ├── routes/                     API endpoints
│   ├── middleware/                 Auth, logging, etc
│   └── .env.local                  Environment vars
│
├── 📂 scripts/                     Utility scripts
│   ├── import-data.js              Main import script
│   ├── validate-supabase.js        Connection tester
│   └── ... (others)
│
├── 📂 docs/                        Documentation
│   ├── data-import/               Data import guides
│   ├── API_REFERENCE.md           API docs
│   ├── DATABASE_SCHEMA.md          DB schema
│   ├── FRONTEND_DESIGN.md          Design system
│   └── ... (more docs)
│
├── seed-data.json                 Your imported data (create this)
├── package.json                   Monorepo config
└── README.md                      This file
```

---

## 🗄️ Database Setup

### Current Setup: Supabase Cloud

INTEGRITY uses **Supabase** (cloud PostgreSQL) already configured:

**Database Info:**
- 📍 Host: `omxyeagavmybmyqppudf.supabase.co`
- 🔐 Project: `omxyeagavmybmyqppudf`
- 📊 Tables: 10 core tables (users, projects, heat_maps, test_executions, risk_assessments, etc.)
- ✅ Status: Connected & Ready

**Tables Created:**
```
✓ users                    - Application users
✓ projects                 - Projects & repos
✓ connections              - External integrations
✓ project_members          - Team membership
✓ integration_mappings     - Repository mappings
✓ heat_maps                - Coverage by module
✓ test_executions          - Test run results
✓ risk_assessments         - Risk scores
✓ audit_logs               - Audit trail
✓ admin_logs               - Admin changes
```

**Access Database:**
- 🔗 Dashboard: https://app.supabase.com
- 📊 Table Editor: Supabase → Table Editor
- 🔍 SQL Editor: Supabase → SQL Editor

---

## 🎨 Frontend Features

### 4 Specialized Dashboards
1. **Executive Dashboard** - High-level KPIs
2. **QA Dashboard** - Test metrics & coverage
3. **Developer Dashboard** - Personal productivity
4. **Admin Panel** - Project management

### 10 Advanced Components
- Data tables with sorting & filtering
- Heat maps with risk visualization
- Charts (bar, line, trend analysis)
- Export functionality (CSV, JSON, TSV)
- Forms with validation
- Modals & dialogs
- And more...

### Design System
- **Primary**: Navy Blue (#1e3a8a)
- **Secondary**: Teal (#0d9488)
- **Responsive**: 4 breakpoints (mobile, tablet, desktop, wide)
- **Material-UI v5**: Professional components

---

## 🔌 API Endpoints

All endpoints prefixed with `/api/v1`

### Projects
```
GET    /projects              - List all projects
GET    /projects/:id          - Get project details
POST   /projects              - Create project
```

### Heat Maps
```
GET    /heatmaps/:projectId   - Get project heat map
```

### Test Selection
```
POST   /test-selection/recommend - Recommend tests
```

### Risk Assessment
```
POST   /risk-assessment/evaluate - Evaluate risk
```

### Dashboard
```
GET    /dashboard/executive/:projectId
GET    /dashboard/qa/:projectId
GET    /dashboard/developer/:projectId
```

### Health
```
GET    /health                - API status
```

Full API reference: [docs/API_REFERENCE.md](docs/API_REFERENCE.md)

---

## 🔐 Environment Variables

### Backend (.env.local)
```
NODE_ENV=development
PORT=5000
SUPABASE_URL=https://omxyeagavmybmyqppudf.supabase.co
SUPABASE_KEY=sb_publishable_...
DATABASE_URL=postgresql://postgres:password@...
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000/api/v1
VITE_SUPABASE_URL=https://omxyeagavmybmyqppudf.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

---

## 📚 Documentation

### Getting Started
- [Quick Start](#-quick-start) - Get running in 3 minutes
- [Data Import Guide](docs/data-import/README.md) - Import test data from other apps

### Data Import (4 documents)
- [00-QUICK-START.md](docs/data-import/00-QUICK-START.md) - 5-step guide
- [01-DATA-SPEC.md](docs/data-import/01-DATA-SPEC.md) - Detailed structure
- [02-EXTRACT-PROMPT.md](docs/data-import/02-EXTRACT-PROMPT.md) - Ready-to-use prompt
- [03-PROCESS-FLOWCHART.md](docs/data-import/03-PROCESS-FLOWCHART.md) - Visual flowchart

### Technical Documentation
- [API_REFERENCE.md](docs/API_REFERENCE.md) - All API endpoints
- [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) - Database structure
- [FRONTEND_DESIGN.md](docs/FRONTEND_DESIGN.md) - Design system & components
- [ADVANCED_COMPONENTS.md](docs/ADVANCED_COMPONENTS.md) - Component reference
- [SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) - Supabase configuration

---

## 🚨 Troubleshooting

### "Port 5000 already in use"
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Restart
npm run dev
```

### "Cannot connect to Supabase"
```bash
# Validate connection
npm run validate

# Check credentials in backend/.env.local
cat backend\.env.local

# Verify internet connection
```

### "Module not found" errors
```bash
# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install
```

### "Frontend won't load"
```bash
# Check frontend server is running
# Terminal should show: Local: http://localhost:5175

# If not, try:
npm run dev:frontend

# Try different port if 5175 is busy
# Vite fallback: 5174, 5173
```

### "Data import fails"
```bash
# Validate JSON format
npm run inspect-schema

# Check seed-data.json syntax
# Use https://jsonlint.com/ to validate

# See detailed error:
npm run import-data (watch for specific error messages)
```

---

## 🤖 Using AI to Extract Data

If you have test data in another system:

1. **Open:** [docs/data-import/02-EXTRACT-PROMPT.md](docs/data-import/02-EXTRACT-PROMPT.md)
2. **Copy** the PROMPT section
3. **Use in** ChatGPT, Claude, or Gemini
4. **Provide** your app context and data
5. **Get** JSON output
6. **Save** as `seed-data.json`
7. **Run** `npm run import-data`

The prompt handles all conversions and validations automatically!

---

## ✨ Features

### Dashboards
- ✅ Executive dashboard with KPIs
- ✅ QA metrics and coverage tracking
- ✅ Developer productivity dashboard
- ✅ Admin project management

### Data Management
- ✅ Multi-project support
- ✅ Role-based access (admin, qa, developer, executive, manager)
- ✅ Team member management
- ✅ Integration mappings

### Analytics
- ✅ Heat maps by module
- ✅ Test execution trends
- ✅ Risk assessments
- ✅ Coverage analysis

### Import/Export
- ✅ JSON data import
- ✅ Multi-format export (CSV, JSON, TSV)
- ✅ Batch import with validation
- ✅ Automated field mapping

---

## 🔄 Development Workflow

### Add New Data to Existing Project

1. Update your source system with new data
2. Run AI extraction again with updated data
3. Update `seed-data.json`
4. Run `npm run import-data`
5. Dashboard auto-updates

### Make Backend Changes

```bash
# Edit files in backend/
# Changes auto-reload with npm run dev:backend

# Test via http://localhost:5000/health
curl http://localhost:5000/health

# View logs in terminal
```

### Make Frontend Changes

```bash
# Edit files in frontend/src/
# Changes auto-reload with hot module replacement

# Refresh browser or it auto-reloads
```

---

## 📋 Next Steps

1. ✅ **Run the app** - `npm run dev`
2. ✅ **Open dashboard** - http://localhost:5175
3. ✅ **Import data** - Follow [Data Import Guide](docs/data-import/README.md)
4. ✅ **Explore dashboards** - See your test data
5. 🚀 **Customize** - Add your own projects and data

---

## 📞 Support

### Documentation
- **Quick Answers**: This README
- **Data Import**: [docs/data-import/README.md](docs/data-import/README.md)
- **API Details**: [docs/API_REFERENCE.md](docs/API_REFERENCE.md)
- **Database**: [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)

### Common Issues
See [Troubleshooting](#-troubleshooting) section above

### Database Access
- Dashboard: https://app.supabase.com
- Project: omxyeagavmybmyqppudf
- Use SQL Editor or Table Editor for direct access

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React 18)                  │
│  Dashboard | Components | Material-UI | Responsive     │
│              (http://localhost:5175)                     │
└──────────────────────┬──────────────────────────────────┘
                       │
                  HTTP API
                   (CORS)
                       │
┌──────────────────────▼──────────────────────────────────┐
│               Backend (Express.js)                       │
│ Routes | Middleware | Validators | Error Handling      │
│          (http://localhost:5000)                         │
└──────────────────────┬──────────────────────────────────┘
                       │
               PostgreSQL Client
                       │
┌──────────────────────▼──────────────────────────────────┐
│           Supabase Cloud (PostgreSQL)                   │
│  Projects | Users | Heat Maps | Test Results           │
│           (Cloud Database)                              │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Project Status

### ✅ Completed
- [x] Backend API (6 routes + health check)
- [x] Frontend dashboards (4 specialized)
- [x] Advanced components (10 reusable)
- [x] Supabase integration
- [x] Data import system
- [x] Design system
- [x] API documentation
- [x] Data import documentation

### 🚀 Ready to Use
- [x] Local development environment
- [x] Data extraction prompts
- [x] Import scripts & validation
- [x] Responsive UI
- [x] Role-based dashboards

### 📌 Future Enhancements
- [ ] Backend unit tests
- [ ] Frontend component tests
- [ ] CI/CD pipeline
- [ ] Production deployment
- [ ] Advanced analytics
- [ ] Machine learning models

---

## 📄 License

Proprietary - All rights reserved.

---

## 🚀 Quick Links

| Link | Purpose |
|------|---------|
| http://localhost:5175 | Main application |
| http://localhost:5000/health | API health check |
| https://app.supabase.com | Database dashboard |
| [docs/data-import/](docs/data-import/) | Data import guides |
| [docs/API_REFERENCE.md](docs/API_REFERENCE.md) | API documentation |

---

**INTEGRITY | Intelligent Test Selection & Risk Assessment**  
**v1.0.0 | Node.js + React + Supabase | May 2026**

```
                    npm run dev
                        ↓
        ✨ Application Ready ✨
         http://localhost:5175
```
