# INTEGRITY API - Phase 08 Development

## Overview

This is the backend API for the INTEGRITY project - an intelligent test selection, risk assessment, and quality analytics platform built with .NET 7 and ASP.NET Core.

**Phase 08 Status**: ✅ In Development (Core services + Controllers)

## Architecture

### Tech Stack
- **Runtime**: .NET 7
- **Framework**: ASP.NET Core 7
- **Language**: C# with nullable reference types
- **Database**: Azure SQL Database (Entity Framework Core 7)
- **Caching**: Redis via IDistributedCache
- **Authentication**: OAuth 2.0 / JWT Bearer tokens
- **API Documentation**: Swagger/OpenAPI v3.0

### Project Structure
```
src/INTEGRITY.API/
├── Controllers/
│   └── AllControllers.cs         # 6 main controllers + Health
├── Services/
│   ├── HeatMapService.cs         # Heat map generation (80% complete)
│   ├── TestSelectionService.cs   # Test selection algorithm (80% complete)
│   ├── RiskAssessmentService.cs  # Risk scoring (80% complete)
│   ├── DashboardAdminAuditServices.cs  # Dashboard, Admin, Audit services
│   └── ServiceInterfaces.cs      # All service interfaces
├── Data/
│   ├── IntegrityDbContext.cs     # Entity Framework Core configuration
│   └── Repositories/
│       └── RepositoryPattern.cs  # Generic repository + UnitOfWork
├── Models/
│   └── Entities.cs               # 8 domain entities
├── DTOs/
│   └── AllDtos.cs                # 15+ request/response DTOs
├── Startup.cs                     # Startup configuration + DI
├── appsettings.json              # Production configuration
├── appsettings.Development.json  # Local development configuration
└── INTEGRITY.API.csproj          # Project file with dependencies
```

## Core Services

### 1. HeatMapService (80% Complete)
**Purpose**: Generate code coverage heat maps by module with risk scoring

**Main Endpoint**: `POST /api/v1/heatmap/generate`

**Algorithm**:
1. Retrieves test execution history (last 30 days)
2. Calculates coverage percentage per module
3. Scores risk: `RiskScore = (LOC × complexity × defect_rate) / 100`
4. Caches result in Redis (4-hour TTL)

**Response Time Target**: < 2 minutes (cached)

**TODOs**:
- [ ] Integrate with SonarQube API for LOC/complexity metrics
- [ ] Implement ML.NET complexity calculation model
- [ ] Add branch/tag filtering

### 2. TestSelectionService (80% Complete)
**Purpose**: Intelligent test selection based on code changes and risk tolerance

**Main Endpoint**: `POST /api/v1/test-selection/recommend`

**Algorithm**:
1. Maps changed files to affected modules
2. Finds all tests covering changed modules
3. Scores tests by priority (direct hit +100, transitive +50, related +25)
4. Applies risk tolerance heuristics:
   - AGGRESSIVE: Top 10% of tests (fast, high risk)
   - BALANCED: Top 30% of tests (recommended)
   - CONSERVATIVE: All tests (slow, comprehensive)

**Response Time Target**: < 2 minutes

**TODOs**:
- [ ] Implement ML.NET historical prediction model
- [ ] Build dependency graph traversal
- [ ] Calculate execution time estimates with ML

### 3. RiskAssessmentService (80% Complete)
**Purpose**: Predict defect escape probability for code changes

**Main Endpoint**: `POST /api/v1/risk-assessment/evaluate`

**Algorithm**:
1. Calculates code complexity delta (LOC + cyclomatic complexity)
2. Analyzes dependency impact (critical path detection)
3. Identifies coverage gaps in changed code
4. Scores test coverage adequacy
5. Predicts escape probability (0-1 scale)

**Output**: RiskScore (0-10) + EscapeRate (0-1) + Contributing Factors

**TODOs**:
- [ ] ML.NET regression model for escape rate prediction
- [ ] Historical defect analysis pipeline
- [ ] SonarQube security/bug integration

### 4. DashboardService (100% Complete - Basic)
**Purpose**: Aggregate metrics for 3 role-based dashboards

**Endpoints**:
- `GET /api/v1/dashboard/executive` - KPIs, trends, cost savings
- `GET /api/v1/dashboard/qa` - Coverage, flaky tests, gaps
- `GET /api/v1/dashboard/developer/{userId}` - Personal PR quality, risk

**Executive Dashboard Metrics**:
- Quality Score (test pass rate × coverage)
- Defect Escape Rate (predicted from risk model)
- Cost Savings YTD (time saved × $100/hr)
- Release Velocity (deployments/week)

### 5. AdminService (100% Complete - Basic)
**Purpose**: Project and connection CRUD operations

**Endpoints**:
- `POST /api/v1/admin/projects` - Create project
- `GET /api/v1/admin/projects/{projectId}` - Get project details
- `POST /api/v1/admin/projects/{projectId}/connections` - Create connection
- `POST /api/v1/admin/projects/{projectId}/connections/{connectionId}/test` - Test connection

**Supported Connection Types**:
- Azure DevOps (ADO)
- GitHub / GitLab
- SonarQube
- Datadog
- Slack

### 6. AuditService (100% Complete - Basic)
**Purpose**: Immutable audit trail for compliance

**Features**:
- Logs all data modifications (user, timestamp, changes)
- Queryable by project, user, action, entity
- Cannot be deleted (compliance requirement)

## Data Model

### Key Entities (Multi-Tenant)
```
Project
├── Users (multi)
├── Connections (ADO, GitHub, SonarQube, etc.)
├── ProjectMappings
├── HeatMaps
├── TestExecutions
├── RiskAssessments
└── AuditTrail
```

### Multi-Tenancy Implementation
- All entities have `ProjectId` foreign key
- All queries filtered by ProjectId
- ProjectId indexed for performance

## API Endpoints

### Heat Map API
```
POST   /api/v1/heatmap/generate          - Generate new heat map
GET    /api/v1/heatmap/{projectId}/latest - Get latest cached heat map
GET    /api/v1/heatmap/{projectId}/history - Get historical heat maps (TODO)
GET    /api/v1/heatmap/{projectId}/trends  - Get coverage trends (TODO)
```

### Test Selection API
```
POST   /api/v1/test-selection/recommend   - Recommend test set
GET    /api/v1/test-selection/{projectId}/accuracy - Selection accuracy (TODO)
POST   /api/v1/test-selection/{projectId}/feedback  - Log feedback (TODO)
```

### Risk Assessment API
```
POST   /api/v1/risk-assessment/evaluate           - Evaluate change risk
GET    /api/v1/risk-assessment/{projectId}/history - Historical risks (TODO)
GET    /api/v1/risk-assessment/{projectId}/trends  - Risk trends (TODO)
```

### Dashboard API
```
GET    /api/v1/dashboard/executive            - Executive KPIs
GET    /api/v1/dashboard/qa                   - QA metrics
GET    /api/v1/dashboard/developer/{userId}   - Developer dashboard
```

### Admin API
```
POST   /api/v1/admin/projects                                  - Create project
GET    /api/v1/admin/projects/{projectId}                     - Get project
POST   /api/v1/admin/projects/{projectId}/connections         - Create connection
GET    /api/v1/admin/projects/{projectId}/connections/{id}    - Get connection
POST   /api/v1/admin/projects/{projectId}/connections/{id}/test - Test connection
```

### Health Check
```
GET    /api/v1/health                       - Service health status
```

## Getting Started

### Prerequisites
- .NET 7 SDK or runtime
- SQL Server (local or Azure SQL Database)
- Redis (optional, falls back to in-memory cache)
- Visual Studio 2022 or VS Code

### Local Development Setup

1. **Clone and navigate to API directory**:
   ```bash
   cd src/INTEGRITY.API
   ```

2. **Restore NuGet packages**:
   ```bash
   dotnet restore
   ```

3. **Update database connection string** in `appsettings.Development.json`:
   ```json
   "DefaultConnection": "Server=localhost;Database=INTEGRITY_Dev;Trusted_Connection=true;"
   ```

4. **Create database and run migrations** (EF Core Code-First):
   ```bash
   dotnet ef database update
   ```

5. **Run the API**:
   ```bash
   dotnet run --environment Development
   ```

6. **Access Swagger UI**:
   - Navigate to `http://localhost:5000`
   - Swagger API documentation available at `http://localhost:5000/swagger`

### Docker Development (Planned)

```bash
# Build Docker image
docker build -t integrity-api .

# Run with docker-compose (includes SQL + Redis)
docker-compose -f docker-compose.yml up

# API accessible at http://localhost:8080/api
```

## Caching Strategy

### Performance Targets (from FM-7)
- Dashboard queries: < 5 seconds
- Test selection: < 2 minutes
- Risk assessment: < 30 seconds

### Cache Configuration (appsettings.json)
```json
"Caching": {
  "HeatMapTtlMinutes": 240,           // 4 hours
  "TestSelectionTtlMinutes": 30,      // 30 minutes
  "DashboardMetricsTtlMinutes": 5,    // 5 minutes
  "CacheKeyPrefix": "INTEGRITY:"
}
```

### Cache Keys
- `INTEGRITY:HeatMap:{projectId}` - Latest heat map data
- `INTEGRITY:Tests:{projectId}:{fileHash}` - Test recommendations
- `INTEGRITY:Risk:{projectId}:{commitSha}` - Risk assessment
- `INTEGRITY:Dashboard:{projectId}:{role}` - Dashboard metrics

## Authentication

### OAuth 2.0 + JWT
Configured in `appsettings.json`:
```json
"Auth": {
  "Authority": "https://login.microsoftonline.com/[tenant-id]/v2.0",
  "Audience": "https://[app-id-uri]"
}
```

### Bearer Token
Include in request header:
```bash
Authorization: Bearer <jwt-token>
```

## Role-Based Access Control (RBAC)

### User Roles
- **Admin**: Full access (project creation, connections, admin operations)
- **ProjectManager**: Project + team management
- **Developer**: Read heat maps, test selection, dashboards
- **QA**: Full dashboard + test coverage management
- **Executive**: Read-only dashboards

## Performance Optimization

### Database Indexes (EF Core Fluent API)
```csharp
.HasIndex(h => h.ProjectId)
.HasIndex(t => new { t.ProjectId, t.CreatedAt })
```

### Async/Await
- All operations are async for scalability
- Long-running tasks (>30 sec) can be offloaded to Azure Functions

### Caching Tiers
1. Redis (distributed cache for scale-out)
2. In-memory cache (local development fallback)

## Remaining Work (Phase 08 - In Progress)

### ✅ Completed
- [x] Database schema + EF Core configuration
- [x] Repository pattern + Unit of Work
- [x] All DTOs for API contracts
- [x] HeatMapService (80% complete)
- [x] TestSelectionService (80% complete)
- [x] RiskAssessmentService (80% complete)
- [x] DashboardService (basic implementation)
- [x] AdminService (basic CRUD)
- [x] AuditService (logging framework)
- [x] All API Controllers (6 main + Health)
- [x] Startup configuration + DI container
- [x] Swagger/OpenAPI documentation
- [x] appsettings configuration (prod + dev)

### ⏳ In Progress
- [ ] Authentication middleware implementation
- [ ] Authorization middleware (role-based claims)
- [ ] Integration handlers (ConnectionManagerService, IntegrationFactory)
- [ ] SonarQube API integration
- [ ] Azure DevOps API integration
- [ ] Slack webhook handler
- [ ] ML.NET model training/prediction

### 📋 Not Started
- [ ] Azure Functions (async job orchestration)
- [ ] Unit tests (xUnit + Moq)
- [ ] Integration tests
- [ ] Docker containerization
- [ ] CI/CD pipeline (Azure DevOps)
- [ ] React frontend (Phase 08 end)
- [ ] API Gateway / Load Balancing

## Error Handling

### Standard HTTP Status Codes
- `200 OK` - Success
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Error Response Format
```json
{
  "error": "Error message",
  "statusCode": 400,
  "timestamp": "2024-05-01T12:34:56Z"
}
```

## Monitoring & Logging

### Application Insights Integration (Planned)
- Performance telemetry
- Exception tracking
- Request/response logging
- Custom events

### Logging Levels
- Development: Debug + Information
- Production: Information + Warning + Error

### Log Output Destinations
- Console (local development)
- Azure Application Insights (production)

## Database Migration

### Create Migration
```bash
dotnet ef migrations add MigrationName
```

### Apply Migration
```bash
dotnet ef database update
```

## Security Considerations

### Credential Storage
- All sensitive data (API keys, passwords) encrypted via Azure Key Vault
- Never store credentials in code or config files
- Use managed identities where possible

### SQL Injection Prevention
- All queries use parameterized queries via Entity Framework
- No raw SQL strings concatenated with user input

### CORS Configuration
- Restricted to specific origins (React frontend URL)
- Credentials allowed only from trusted sources

## Dependencies

### NuGet Packages
- `Microsoft.EntityFrameworkCore.SqlServer` (7.0.x) - ORM
- `Azure.Identity` - Azure authentication
- `Azure.Security.KeyVault.Secrets` - Credential management
- `StackExchange.Redis` - Redis client
- `Microsoft.ML` - Machine Learning

### External Services
- Azure SQL Database
- Azure Cache for Redis
- Azure Key Vault
- Azure DevOps (REST API)
- SonarQube (REST API)
- Slack (Webhook API)

## Troubleshooting

### Database Connection Issues
```bash
# Test connection string
dotnet ef dbcontext validate

# View current migrations
dotnet ef migrations list
```

### Redis Connection Issues
```bash
# Check if Redis is running
redis-cli ping  # Should return "PONG"

# View Redis memory usage
redis-cli info memory
```

### API Won't Start
```bash
# Check ports in use
netstat -ano | findstr :5000

# Run with verbose logging
dotnet run --environment Development --verbosity debug
```

## Next Steps

1. **Implement Authentication Middleware** - OAuth 2.0 token validation
2. **Create Integration Handlers** - Connect to ADO, GitHub, SonarQube
3. **Implement Azure Functions** - Async job orchestration
4. **Write Unit Tests** - 85%+ coverage for core services
5. **Deploy to Azure** - App Service + SQL Database + Redis
6. **Build React Frontend** - 4 role-based dashboards

## Support & Documentation

- **API Docs**: http://localhost:5000/swagger
- **Code Standards**: See [08-development/code-standards.md](../../phases/08-development/code-standards.md)
- **Architecture Decisions**: See [Phase 05 ADRs](../../phases/05-architecture/adr/)
- **Technical Spec**: See [08-development/tech-doc.md](../../phases/08-development/tech-doc.md)

---

**Project**: INTEGRITY  
**Phase**: 08 Development  
**Version**: 1.0.0-alpha  
**Last Updated**: May 1, 2024
