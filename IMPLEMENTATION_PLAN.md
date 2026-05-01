# INTEGRITY Implementation Plan

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    INTEGRITY Monorepo                       │
└────────┬────────────────────────────────────────────┬───────┘
         │                                            │
    ┌────▼─────┐                            ┌────────▼────────┐
    │ Backend   │                            │ Frontend        │
    │ Node.js   │                            │ React + Vite    │
    │ Express   │                            │                 │
    └────┬─────┘                            └────────┬────────┘
         │                                            │
         │ :5000/api/v1                               │ :5173
         │                                            │
    ┌────▼──────────────────────────────────────────┐│
    │                                                 │
    │    Supabase Cloud                              │
    │    ├─ PostgreSQL (connected via pg driver)     │
    │    └─ Auth (JWT tokens)                        │
    │                                                 │
    └─────────────────────────────────────────────────┘
```

## Project Structure

```
integrity-monorepo/
├── backend/
│   ├── src/
│   │   ├── server.js                 # Express app entry point
│   │   ├── db/
│   │   │   └── supabase.js           # Supabase + PostgreSQL clients
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT verification
│   │   │   ├── errorHandler.js       # Error handling
│   │   │   └── requestLogger.js      # Request logging
│   │   ├── routes/
│   │   │   ├── health.js             # Health check
│   │   │   ├── projects.js           # Project CRUD
│   │   │   ├── heatmaps.js           # Heat map generation
│   │   │   ├── testSelection.js      # Test selection
│   │   │   ├── riskAssessment.js     # Risk assessment
│   │   │   └── dashboard.js          # Dashboard aggregation
│   │   └── utils/
│   │       ├── cache.js              # Redis caching
│   │       └── validators.js         # Input validation
│   ├── tests/
│   │   ├── health.test.js
│   │   ├── projects.test.js
│   │   └── integration/
│   ├── package.json
│   ├── .env.example                  # Environment template
│   ├── .env.local                    # Local environment (git-ignored)
│   └── server.js                     # Start script
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx                  # React entry point
│   │   ├── App.jsx                   # Router & root component
│   │   ├── theme.js                  # MUI theme
│   │   ├── pages/
│   │   │   ├── Login.jsx             # Authentication page
│   │   │   ├── Dashboard.jsx         # Main dashboard
│   │   │   ├── ExecutiveDashboard.jsx
│   │   │   ├── QADashboard.jsx
│   │   │   ├── DeveloperDashboard.jsx
│   │   │   └── AdminPanel.jsx
│   │   ├── components/
│   │   │   ├── Layout.jsx            # Main layout wrapper
│   │   │   ├── HeatMapVisualization.jsx
│   │   │   ├── TestList.jsx
│   │   │   ├── RiskIndicator.jsx
│   │   │   ├── MetricCard.jsx
│   │   │   └── Navigation.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Global auth state
│   │   ├── services/
│   │   │   └── api.js                # API client wrapper
│   │   ├── __tests__/
│   │   │   └── App.test.jsx
│   │   └── styles/
│   │       └── global.css            # Global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env.example
│   └── .env.local                    # Local environment (git-ignored)
│
├── docs/
│   ├── DATABASE_SCHEMA.md            # PostgreSQL schema documentation
│   ├── API_REFERENCE.md              # API endpoint documentation
│   ├── DEPLOYMENT.md                 # Deployment instructions
│   └── ARCHITECTURE.md               # Technical architecture details
│
├── package.json                      # Root monorepo config
├── README.md                         # Project readme
└── .gitignore
```

## Getting Started (Local Development)

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Supabase account (credentials already configured)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd integrity-monorepo

# Install root and all workspace dependencies
npm run install:all
```

2. **Configure environment variables:**

Backend:
```bash
cp backend/.env.example backend/.env.local
# Edit backend/.env.local with your values
```

Frontend:
```bash
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with your values
```

3. **Database setup (Supabase):**

Tables are already created in Supabase Cloud. If you need to reset:
```bash
# Run the init-db.sql script in Supabase SQL Editor:
# https://app.supabase.com/project/[YOUR-PROJECT]/sql/new

-- Tables are already created, no action needed
-- All 10 core tables exist in Supabase
```

### Development Workflow

**Start both backend and frontend with hot-reload:**
```bash
npm run dev
```

This starts:
- Backend API: http://localhost:5000
- Frontend App: http://localhost:5173
- API proxy: Frontend requests to `/api/*` are forwarded to backend

**Start individual services:**
```bash
npm run dev:backend    # Only backend (port 5000)
npm run dev:frontend   # Only frontend (port 5173)
```

**Running tests:**
```bash
npm run test           # All tests
npm run test:backend   # Backend tests only
npm test --workspace=frontend  # Frontend tests only
```

## API Endpoints

### Authentication
- Base: `http://localhost:5000/api/v1`
- All endpoints (except `/health`) require `Authorization: Bearer {jwt-token}` header

### Core Endpoints

**Health Check**
```
GET /health
Response: { status: "ok", database: "connected", uptime: 1234.5 }
```

**Projects**
```
GET    /projects              # List all projects
GET    /projects/:id          # Get project by ID
POST   /projects              # Create new project
PUT    /projects/:id          # Update project
DELETE /projects/:id          # Delete project
```

**Heat Maps**
```
POST   /heatmaps/generate     # Generate new heat map
GET    /heatmaps/:projectId   # Get latest heat map for project
```

**Test Selection**
```
POST   /test-selection/recommend
Request: {
  projectId: string,
  changedFiles: string[],
  riskTolerance: "AGGRESSIVE" | "BALANCED" | "CONSERVATIVE"
}
Response: {
  selectedTests: [{ id, name, duration, priority }],
  estimatedTime: number
}
```

**Risk Assessment**
```
POST   /risk-assessment/evaluate
Request: {
  projectId: string,
  changedFiles: string[],
  affectedModules: string[]
}
Response: {
  riskScore: number,
  factors: [{ name, weight, score }],
  recommendation: "APPROVE" | "REVIEW" | "REJECT"
}
```

**Dashboard**
```
GET    /dashboard/executive/:projectId  # Executive KPIs
GET    /dashboard/qa/:projectId         # QA metrics
GET    /dashboard/developer/:projectId  # Developer stats
```

## Frontend Flows

### Authentication Flow
```
1. User visits http://localhost:5173
2. Redirected to /login (no session)
3. Enters credentials → Supabase Auth
4. JWT token stored in localStorage
5. Redirected to /dashboard
6. AuthContext provides token for API calls
7. All API requests include Authorization header
```

### Dashboard Flow
```
1. ExecutiveDashboard
   - Loads executive KPIs from /dashboard/executive/:projectId
   - Displays: Overall quality score, escape rate, defect trend
   
2. QADashboard
   - Loads QA metrics from /dashboard/qa/:projectId
   - Displays: Test coverage, flaky tests, execution time
   
3. DeveloperDashboard
   - Loads developer stats from /dashboard/developer/:projectId
   - Displays: Personal PR quality, test selection accuracy
   
4. HeatMap View
   - Calls /heatmaps/:projectId/latest
   - Renders module-level risk visualization
```

## Database Schema

### Core Tables

**projects**
- `id` (UUID, PK)
- `name` (string)
- `description` (text)
- `owner_id` (UUID, FK → users.id)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**heat_maps**
- `id` (UUID, PK)
- `project_id` (UUID, FK → projects.id)
- `data` (jsonb) - Module risk data
- `created_at` (timestamp)

**test_executions**
- `id` (UUID, PK)
- `project_id` (UUID, FK → projects.id)
- `test_name` (string)
- `status` (enum: PASSED, FAILED, SKIPPED)
- `duration_ms` (integer)
- `executed_at` (timestamp)

**risk_assessments**
- `id` (UUID, PK)
- `project_id` (UUID, FK → projects.id)
- `score` (numeric)
- `factors` (jsonb)
- `created_at` (timestamp)

[See docs/DATABASE_SCHEMA.md for complete schema]

## Deployment

### Frontend (Vercel)
```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys on push
# Set environment variables in Vercel dashboard:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_API_URL (production backend URL)
```

### Backend (Railway/Heroku)
```bash
# Deploy using Railway CLI
railway up

# Or use Heroku:
git push heroku main

# Environment variables (set in platform dashboard):
# - NODE_ENV=production
# - SUPABASE_URL
# - SUPABASE_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - DATABASE_URL
```

## Environment Variables

### Backend (.env.local)
```
NODE_ENV=development
PORT=5000
SUPABASE_URL=https://omxyeagavmybmyqppudf.supabase.co
SUPABASE_KEY=sb_publishable_UEbY4BlonnynGiN7j4c_rg_S3C1nv7c
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://user:password@localhost/integrity
REDIS_URL=redis://localhost:6379
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000/api/v1
VITE_SUPABASE_URL=https://omxyeagavmybmyqppudf.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_UEbY4BlonnynGiN7j4c_rg_S3C1nv7c
```

## Development Commands

```bash
# Install all dependencies
npm run install:all

# Start development (backend + frontend)
npm run dev

# Start only backend
npm run dev:backend

# Start only frontend
npm run dev:frontend

# Build for production
npm run build

# Run tests
npm run test

# Lint code
npm run lint
npm run lint:fix

# View structure
ls -la
# Shows: backend/, frontend/, docs/, package.json, README.md
```

## Testing Strategy

### Backend (Jest + Supertest)
- Unit tests for business logic
- Integration tests for API endpoints
- Mock Supabase client for isolation
- Target: 85%+ coverage

### Frontend (Vitest)
- Component tests with React Testing Library
- Integration tests for user flows
- Mock API client
- Target: 75%+ coverage

## Next Steps

### Phase 1: Core Implementation (This Sprint)
- [ ] Implement backend route logic (database queries)
- [ ] Create frontend dashboard pages
- [ ] Write integration tests
- [ ] Deploy to staging

### Phase 2: Advanced Features
- [ ] Heat map visualization with D3/Canvas
- [ ] Real-time updates via Supabase subscriptions
- [ ] Machine learning for test selection
- [ ] Historical analytics

### Phase 3: Operations
- [ ] Monitoring & alerting
- [ ] Backup & recovery procedures
- [ ] Documentation and training
- [ ] Security audit

## Troubleshooting

### Port already in use
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### Database connection errors
```bash
# Verify Supabase credentials
echo $SUPABASE_URL
echo $SUPABASE_KEY

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Authentication issues
```bash
# Clear localStorage
localStorage.clear()

# Clear cookies
# Settings > Clear browsing data > Cookies
```

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Material-UI Component Library](https://mui.com/)
