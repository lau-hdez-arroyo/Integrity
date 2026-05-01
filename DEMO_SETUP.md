# INTEGRITY Demo Setup - Local Supabase

## Overview

This document provides step-by-step instructions for running the INTEGRITY application locally with **Supabase PostgreSQL** backend during development and demonstrations.

**Stack**:
- **Database**: PostgreSQL via Docker (Supabase-compatible)
- **Cache**: Redis via Docker
- **API**: .NET 7 ASP.NET Core (local)
- **Frontend**: React 18 (separate, planned)

## Prerequisites

### Required Software
- Docker Desktop (or Docker Engine + Docker Compose)
- .NET 7 SDK or runtime
- Node.js 18+ (for React frontend, when ready)
- Visual Studio Code or Visual Studio 2022
- Git

### Optional Tools
- DBeaver or pgAdmin (for database visualization)
- Postman or Thunder Client (for API testing)
- Redis Commander (for cache visualization)

## Quick Start (5 minutes)

### 1. Start Local Infrastructure (Docker)

```bash
# Navigate to project root
cd c:\Repos\Integrity\Integrity

# Start PostgreSQL + Redis + pgAdmin
docker-compose -f docker-compose.local.yml up -d

# Verify containers are running
docker ps

# Check PostgreSQL health
docker exec integrity-postgres pg_isready -U postgres
```

**Output**:
```
✓ postgres:5432 - accepting connections
✓ redis:6379 - ready
✓ pgAdmin:5050 - ready
```

### 2. Restore .NET Dependencies

```bash
cd projects/INTEGRITY/src/INTEGRITY.API

# Restore NuGet packages
dotnet restore

# List packages
dotnet list package
```

### 3. Create Database Schema

```bash
# Apply EF Core migrations to PostgreSQL
dotnet ef database update --environment Supabase.Local

# Verify tables created
docker exec integrity-postgres psql -U postgres -d integrity_demo -c "\dt"
```

### 4. Run API Locally

```bash
# Start API on http://localhost:5000
dotnet run --environment Supabase.Local

# Expected output:
# info: Microsoft.Hosting.Lifetime[14]
#       Now listening on: http://localhost:5000
#       Now listening on: https://localhost:5001
```

### 5. Test API

```bash
# In another terminal, test health endpoint
curl http://localhost:5000/api/v1/health

# Expected response:
# {"status":"Healthy","timestamp":"2024-05-01T12:34:56Z","version":"1.0.0"}
```

### 6. Access Swagger UI

```
http://localhost:5000/swagger
```

### 7. Access pgAdmin (Database Management)

```
http://localhost:5050
- Email: admin@demo.local
- Password: admin
```

Then add server connection:
- Host: postgres
- Port: 5432
- Username: postgres
- Password: postgres
- Database: integrity_demo

## File Structure

```
.
├── docker-compose.local.yml       # Docker containers (PostgreSQL, Redis, pgAdmin)
├── init-db.sql                    # Database initialization script
└── projects/INTEGRITY/src/INTEGRITY.API/
    ├── appsettings.Supabase.Local.json  # Configuration for local Supabase
    ├── INTEGRITY.API.csproj              # Uses Npgsql (PostgreSQL provider)
    ├── Data/IntegrityDbContext.cs        # EF Core context (PostgreSQL compatible)
    ├── Controllers/                      # API endpoints
    ├── Services/                         # Business logic
    ├── Models/                           # Domain entities
    └── DTOs/                             # API contracts
```

## Configuration Files

### appsettings.Supabase.Local.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=postgres;Username=postgres;Password=postgres;"
  },
  "Supabase": {
    "Url": "http://localhost:54321",
    "Key": "[anon-key]"
  }
}
```

**Environment Variables** (override config):
```bash
# Set before running API
set ASPNETCORE_ENVIRONMENT=Supabase.Local
set ASPNETCORE_URLS=http://localhost:5000
```

## Common Tasks

### View Database Schema

```bash
# Connect to PostgreSQL via psql
docker exec -it integrity-postgres psql -U postgres -d integrity_demo

# List all tables
\dt

# Describe a table
\d users

# Exit
\q
```

### Inspect Redis Cache

```bash
# Connect to Redis
docker exec -it integrity-redis redis-cli

# See all keys
KEYS *

# Get specific key
GET integrity:heatmap:550e8400-e29b-41d4-a716-446655440000:main

# Exit
exit
```

### Reset Database to Clean State

```bash
# Stop containers
docker-compose -f docker-compose.local.yml down -v

# Remove volumes (resets data)
docker volume prune

# Restart fresh
docker-compose -f docker-compose.local.yml up -d
```

### View API Logs

```bash
# Real-time logs from API
dotnet run --environment Supabase.Local

# Or check Docker logs
docker logs -f integrity-postgres
docker logs -f integrity-redis
```

### Enable Detailed Query Logging

```bash
# In appsettings.Supabase.Local.json, set:
"Logging": {
  "LogLevel": {
    "Microsoft.EntityFrameworkCore.Database.Command": "Debug"
  }
}
```

## API Endpoints (Swagger Available)

### Heat Map API
```
POST   /api/v1/heatmap/generate          Generate heat map (SonarQube mock)
GET    /api/v1/heatmap/{projectId}/latest   Get cached heat map
```

**Example Request**:
```bash
curl -X POST http://localhost:5000/api/v1/heatmap/generate \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "550e8400-e29b-41d4-a716-446655440000",
    "repositoryBranchId": "main"
  }'
```

### Test Selection API
```
POST   /api/v1/test-selection/recommend  Recommend test set
```

### Risk Assessment API
```
POST   /api/v1/risk-assessment/evaluate  Evaluate change risk
```

### Dashboard API
```
GET    /api/v1/dashboard/executive       Executive KPIs
GET    /api/v1/dashboard/qa              QA metrics
GET    /api/v1/dashboard/developer/{userId}  Developer dashboard
```

### Admin API
```
POST   /api/v1/admin/projects                    Create project
GET    /api/v1/admin/projects/{projectId}       Get project
POST   /api/v1/admin/projects/{projectId}/connections  Create connection
```

## Database Details

### PostgreSQL Container
```
Name: integrity-postgres
Port: 5432
Username: postgres
Password: postgres
Database: integrity_demo
```

### Redis Container
```
Name: integrity-redis
Port: 6379
No password (local only)
```

### pgAdmin
```
URL: http://localhost:5050
Email: admin@demo.local
Password: admin
```

## Demo Data

The `init-db.sql` script creates demo data:

### Demo Project
```sql
Project ID: 550e8400-e29b-41d4-a716-446655440000
Name: "INTEGRITY Demo"
Repository: https://github.com/demo/integrity
```

### Demo User
```sql
User ID: 550e8400-e29b-41d4-a716-446655440001
Email: admin@demo.local
Role: Admin
```

### Demo Connection
```sql
Connection ID: 550e8400-e29b-41d4-a716-446655440002
Type: ADO (Azure DevOps)
```

## Troubleshooting

### PostgreSQL Connection Refused

```bash
# Check if container is running
docker ps | grep integrity-postgres

# If not running, check logs
docker logs integrity-postgres

# Restart container
docker-compose -f docker-compose.local.yml restart postgres
```

### Port Already in Use

```bash
# Find process using port 5432 (PostgreSQL)
netstat -ano | findstr :5432

# Find process using port 6379 (Redis)
netstat -ano | findstr :6379

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or change port in docker-compose.local.yml:
# ports:
#   - "5433:5432"  # Map to 5433 instead
```

### EF Core Migration Errors

```bash
# Check current migrations
dotnet ef migrations list --environment Supabase.Local

# Remove last migration if needed
dotnet ef migrations remove --environment Supabase.Local

# Recreate migration
dotnet ef migrations add MigrationName --environment Supabase.Local

# Apply
dotnet ef database update --environment Supabase.Local
```

### Redis Connection Issues

```bash
# Test Redis connection
docker exec integrity-redis redis-cli ping

# Should output: PONG

# Check Redis memory
docker exec integrity-redis redis-cli info memory
```

### API Won't Start

```bash
# Check port 5000 is available
netstat -ano | findstr :5000

# Try different port
dotnet run --environment Supabase.Local -- urls=http://localhost:5001

# Check detailed error logs
dotnet run --environment Supabase.Local 2>&1 | tee api.log
```

## Performance Notes

### Local Performance (Single Machine)
- Heat Map generation: ~2-5 seconds (mock data)
- Test Selection: ~1-2 seconds (cached)
- Dashboard queries: <500ms (in-memory cache)

### Scaling Considerations
- Docker limits: Set memory/CPU limits as needed
- PostgreSQL: Can handle ~1000 connections locally
- Redis: Suitable for multi-gigabyte datasets

## Next Steps

1. **Start Frontend**: Create React app with `npm create vite@latest`
2. **Connect Frontend to API**: Configure proxy to http://localhost:5000
3. **Build Test Data**: Use Swagger to create projects/connections
4. **Demo Walkthrough**: Execute against demo data
5. **Deploy to Cloud**: Push to Azure when ready

## Security Notes

⚠️ **Local Demo Only**:
- Credentials are hardcoded (not secure)
- HTTPS disabled locally
- No real authentication
- PostgreSQL default password

For production, use:
- Azure Key Vault for secrets
- Managed identity authentication
- Real OAuth 2.0 / SAML
- PostgreSQL strong passwords

## Support

For issues or questions:
1. Check this README
2. Review Docker logs: `docker logs integrity-postgres`
3. Check API logs: See terminal output
4. Access pgAdmin: http://localhost:5050

---

**Last Updated**: May 1, 2024  
**Environment**: Local Development with Docker  
**Stack**: PostgreSQL + Redis + .NET 7 API
