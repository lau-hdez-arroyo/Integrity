# INTEGRITY - Autonomous Quality Intelligence Ecosystem

Project INTEGRITY is a strategic initiative designed to evolve the software testing paradigm from a reactive, manual-heavy process into an Autonomous Quality Intelligence Ecosystem. By shifting the focus from "test quantity" to "software integrity", INTEGRITY enables organizations to:

- 🎯 **Select optimal test sets** based on code changes and risk tolerance
- 📊 **Assess defect escape risk** with ML-powered predictions  
- 🔥 **Visualize code coverage** by module with heat maps
- 💰 **Reduce test execution time** by 30-70% while maintaining quality
- 📈 **Track quality metrics** via role-based dashboards

**Current Phase**: Phase 08 Development (Hybrid Approach - Core Services + Controllers)

---

## 🚀 Quick Start - Run Locally in 5 Minutes

### Prerequisites
- Docker Desktop (or Docker Engine + Docker Compose)
- .NET 7 SDK or runtime
- Windows PowerShell

### One-Command Setup

```powershell
# Navigate to project root
cd c:\Repos\Integrity\Integrity

# Full setup (starts Docker + API)
.\setup.ps1 -Command full

# In another terminal, start API
.\setup.ps1 -Command api
```

**That's it!** You now have:
- ✅ PostgreSQL database running (localhost:5432)
- ✅ Redis cache running (localhost:6379)
- ✅ API Swagger UI (http://localhost:5000/swagger)
- ✅ Database admin panel (http://localhost:5050)

### Access Your Demo

| Component | URL | Credentials |
|-----------|-----|-------------|
| **API Swagger** | http://localhost:5000/swagger | No auth (demo) |
| **API Health** | http://localhost:5000/api/v1/health | - |
| **pgAdmin** | http://localhost:5050 | admin@demo.local / admin |

### Test an Endpoint

Go to http://localhost:5000/swagger and try:

1. **POST** `/api/v1/heatmap/generate`
   - Project ID: `550e8400-e29b-41d4-a716-446655440000`
   - Returns: Coverage heat map with modules

2. **GET** `/api/v1/dashboard/executive`
   - Returns: Executive KPIs (quality, velocity, savings)

3. **GET** `/api/v1/health`
   - Returns: Service status

### Common Commands

```powershell
# Stop all Docker containers
.\setup.ps1 -Command stop

# Restart infrastructure
.\setup.ps1 -Command restart

# View database (pgAdmin)
# http://localhost:5050

# Reset database to clean state
.\setup.ps1 -Command reset

# View all options
.\setup.ps1 -Command help
```

---

## 📚 Documentation

### Getting Started
- **[README_DEMO.md](README_DEMO.md)** - Quick reference (1 page)
- **[DEMO_SETUP.md](DEMO_SETUP.md)** - Detailed setup guide (comprehensive)

### API & Backend
- **[projects/INTEGRITY/src/INTEGRITY.API/README.md](projects/INTEGRITY/src/INTEGRITY.API/README.md)** - API architecture and endpoints

### Project Phases
- **Phase 01-07**: ✅ All signed & approved (documentation)
- **Phase 08**: 🚀 Development in progress (backend + controllers)
  - [Tech Spec](projects/INTEGRITY/phases/08-development/tech-doc.md)
  - [Code Standards](projects/INTEGRITY/phases/08-development/code-standards.md)

---

## 📦 Architecture Overview

### Backend Stack
- **Language**: C# .NET 7
- **Framework**: ASP.NET Core 7
- **Database**: PostgreSQL 15 (Supabase compatible)
- **Cache**: Redis 7
- **ORM**: Entity Framework Core 7
- **API Documentation**: Swagger/OpenAPI 3.0

### Services (6 implemented)
1. **HeatMapService** - Code coverage heat maps by module
2. **TestSelectionService** - Intelligent test selection algorithm
3. **RiskAssessmentService** - Defect escape risk prediction
4. **DashboardService** - Role-based dashboard aggregation
5. **AdminService** - Project & connection management
6. **AuditService** - Compliance audit trail

### API Endpoints (14+)
```
Heat Map API
  POST   /api/v1/heatmap/generate
  GET    /api/v1/heatmap/{projectId}/latest

Test Selection API
  POST   /api/v1/test-selection/recommend

Risk Assessment API
  POST   /api/v1/risk-assessment/evaluate

Dashboard API
  GET    /api/v1/dashboard/executive
  GET    /api/v1/dashboard/qa
  GET    /api/v1/dashboard/developer/{userId}

Admin API
  POST   /api/v1/admin/projects
  GET    /api/v1/admin/projects/{projectId}
  POST   /api/v1/admin/projects/{projectId}/connections
  GET    /api/v1/admin/projects/{projectId}/connections/{id}
  POST   /api/v1/admin/projects/{projectId}/connections/{id}/test

Health Check
  GET    /api/v1/health
```

---

## 🗄️ Local Database Setup

### Docker Containers
- **PostgreSQL 15 Alpine** (port 5432)
  - Database: `integrity_demo`
  - Demo data: 1 project, 1 admin user, 1 ADO connection
  
- **Redis 7 Alpine** (port 6379)
  - Cache: HeatMap (4h), Tests (30m), Dashboard (5m)
  
- **pgAdmin 4** (port 5050)
  - Database administration UI

### Demo Data
```
Project ID: 550e8400-e29b-41d4-a716-446655440000
├── Name: "INTEGRITY Demo"
├── Repository: https://github.com/demo/integrity
├── User: admin@demo.local (Admin role)
└── Connection: ADO (Azure DevOps)
```

### Database Schema
The initialization script creates 10 tables:
- `users` - Application users by project
- `projects` - Projects and repositories
- `connections` - External system integrations
- `project_members` - Team membership
- `integration_mappings` - Repository to system mappings
- `heat_maps` - Coverage data by module
- `test_executions` - Test run history
- `risk_assessments` - Defect risk scores
- `audit_logs` - Immutable audit trail (compliance)
- `admin_logs` - Admin configuration changes

All tables support multi-tenant isolation via `project_id` foreign key.

---

## 🔧 Development Workflow

### 1. Local Development
```powershell
# Start everything
.\setup.ps1 -Command full
.\setup.ps1 -Command api

# API runs on http://localhost:5000
# pgAdmin runs on http://localhost:5050
# PostgreSQL on localhost:5432
# Redis on localhost:6379
```

### 2. Database Changes (EF Core)
```powershell
cd projects/INTEGRITY/src/INTEGRITY.API

# Create migration after model changes
dotnet ef migrations add MigrationName --environment Supabase.Local

# Apply migration
dotnet ef database update --environment Supabase.Local
```

### 3. API Testing
- Swagger UI: http://localhost:5000/swagger
- Health check: http://localhost:5000/api/v1/health
- cURL example:
  ```bash
  curl -X POST http://localhost:5000/api/v1/heatmap/generate \
    -H "Content-Type: application/json" \
    -d '{"projectId":"550e8400-e29b-41d4-a716-446655440000","repositoryBranchId":"main"}'
  ```

### 4. Database Administration
- Open: http://localhost:5050
- Email: admin@demo.local
- Password: admin
- Add Server: postgres / 5432 / postgres / postgres

---

## 📊 Demo Data & Testing

### Pre-loaded Data
The `init-db.sql` script automatically loads:
- 1 Project (INTEGRITY Demo)
- 1 Admin User (admin@demo.local)
- 1 ADO Connection (for demos)

### Testing Endpoints

**Heat Map Generation**:
```bash
curl -X POST http://localhost:5000/api/v1/heatmap/generate \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "550e8400-e29b-41d4-a716-446655440000",
    "repositoryBranchId": "main"
  }'
```

**Dashboard Query**:
```bash
curl http://localhost:5000/api/v1/dashboard/executive
```

**Health Check**:
```bash
curl http://localhost:5000/api/v1/health
```

---

## 🚨 Troubleshooting

### Docker Won't Start
```powershell
# Check if Docker Desktop is running
# Try: docker ps

# If containers fail:
.\setup.ps1 -Command restart
```

### PostgreSQL Connection Error
```powershell
# View logs
docker logs integrity-postgres

# Check if port 5432 is available
netstat -ano | findstr :5432
```

### .NET Dependencies Issue
```powershell
cd projects/INTEGRITY/src/INTEGRITY.API
dotnet restore
```

### Port Already in Use
Modify ports in `docker-compose.local.yml`:
```yaml
postgres:
  ports:
    - "5433:5432"  # Changed from 5432 to 5433
```

### Reset Everything to Clean State
```powershell
.\setup.ps1 -Command reset
```

---

## 📁 Project Structure

```
integrity/
├── README.md                           # This file
├── README_DEMO.md                      # Quick start reference
├── DEMO_SETUP.md                       # Detailed setup guide
├── setup.ps1                           # Automated setup script
├── docker-compose.local.yml            # Docker containers
├── init-db.sql                         # Database initialization
│
└── projects/INTEGRITY/
    ├── src/INTEGRITY.API/              # Backend API (.NET 7)
    │   ├── Controllers/                # 6 API controllers
    │   ├── Services/                   # 6 business services
    │   ├── Models/                     # 8 domain entities
    │   ├── Data/                       # EF Core context
    │   ├── DTOs/                       # 20+ request/response types
    │   ├── README.md                   # API documentation
    │   ├── appsettings.json            # Production config
    │   └── appsettings.Supabase.Local.json  # Local config
    │
    ├── phases/                         # SDLC phases 01-08
    │   ├── 01-discovery/
    │   ├── 02-strategy/
    │   ├── 03-planning/
    │   ├── 04-requirements/
    │   ├── 05-architecture/
    │   ├── 06-planning/
    │   ├── 07-governance/
    │   └── 08-development/
    │
    └── docs/
        ├── API specifications
        ├── Architecture decisions
        └── Design documents
```

---

## 🔐 Security & Configuration

### Local Demo (Current)
⚠️ **NOT for production**:
- Hardcoded credentials
- No HTTPS (local only)
- Basic authentication
- Database password: `postgres`

### Production Deployment
For cloud deployment (Azure):
- Use Azure Key Vault for secrets
- OAuth 2.0 / SAML integration
- Managed identity authentication
- TLS/HTTPS required
- Strong database passwords
- Network security groups

---

## 📋 Remaining Work (Phase 08)

### ✅ Completed
- [x] API Controllers (6 + Health)
- [x] Core Services (HeatMap, TestSelection, RiskAssessment)
- [x] Supporting Services (Dashboard, Admin, Audit)
- [x] Startup Configuration
- [x] Swagger/OpenAPI documentation
- [x] PostgreSQL/Supabase local setup
- [x] Docker multi-container environment
- [x] Automated setup script

### 🚀 In Progress
- [ ] Authentication middleware (OAuth 2.0)
- [ ] Authorization (role-based access control)
- [ ] Integration handlers (ADO, GitHub, SonarQube)

### 📌 Not Yet Started
- [ ] Azure Functions (async jobs)
- [ ] Unit tests (xUnit + Moq)
- [ ] React frontend
- [ ] CI/CD pipeline
- [ ] Production deployment

---

## 🤝 Contributing

1. Clone the repository
2. Run `.\setup.ps1 -Command full` to set up local environment
3. Create feature branch: `git checkout -b feature/xyz`
4. Make changes and test via Swagger UI
5. Commit with clear messages
6. Push and create Pull Request

---

## 📞 Support

For detailed information:
- **Quick Start**: See [README_DEMO.md](README_DEMO.md)
- **Setup Details**: See [DEMO_SETUP.md](DEMO_SETUP.md)
- **API Docs**: See [projects/INTEGRITY/src/INTEGRITY.API/README.md](projects/INTEGRITY/src/INTEGRITY.API/README.md)
- **Architecture**: See `projects/INTEGRITY/phases/05-architecture/`

---

## 📄 License

This project is proprietary and confidential. All rights reserved.

---

**Project**: INTEGRITY  
**Phase**: 08 Development (Hybrid Approach)  
**Version**: 1.0.0-alpha  
**Last Updated**: May 1, 2026  
**Status**: 🚀 In Active Development

For local demo execution: `.\setup.ps1 -Command full`
