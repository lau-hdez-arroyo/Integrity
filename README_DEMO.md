# INTEGRITY Local Demo - Quick Start

## 🚀 Start Everything in 1 Command (Windows)

```powershell
# Navigate to project root
cd c:\Repos\Integrity\Integrity

# Run setup script
.\setup.ps1 -Command full
```

**That's it!** The script will:
1. ✅ Check Docker and .NET installation
2. ✅ Start PostgreSQL, Redis, pgAdmin containers
3. ✅ Restore .NET dependencies
4. ✅ Apply database migrations
5. ✅ Ready for API startup

## 🎯 Access Your Local Demo

Once `setup.ps1` completes, run:

```powershell
.\setup.ps1 -Command api
```

Then open:

| Component | URL | Credentials |
|-----------|-----|-------------|
| **API Swagger** | http://localhost:5000/swagger | No auth (demo) |
| **API Health** | http://localhost:5000/api/v1/health | No auth |
| **pgAdmin** | http://localhost:5050 | admin@demo.local / admin |
| **PostgreSQL** | localhost:5432 | postgres / postgres |
| **Redis** | localhost:6379 | No password |

## 📊 Database & Cache

### PostgreSQL (in Docker)
- Container: `integrity-postgres`
- Port: 5432
- Database: `integrity_demo`
- Demo data: 1 project, 1 admin user, 1 ADO connection

### Redis (in Docker)
- Container: `integrity-redis`
- Port: 6379
- Cache TTL: 4h (HeatMap), 30m (Tests), 5m (Dashboard)

### pgAdmin Web UI
- Access at: http://localhost:5050
- Add server: postgres / 5432 / postgres
- Browse `integrity_demo` database

## 📝 Common Commands

```powershell
# Full setup from scratch
.\setup.ps1 -Command full

# Start just the API (Docker must be running)
.\setup.ps1 -Command api

# Stop all Docker containers
.\setup.ps1 -Command stop

# Restart infrastructure
.\setup.ps1 -Command restart

# View Docker logs
.\setup.ps1 -Command logs

# Reset database to clean state
.\setup.ps1 -Command reset

# Show all options
.\setup.ps1 -Command help
```

## 🧪 Test API Endpoints

### Heat Map (Swagger)
1. Go to http://localhost:5000/swagger
2. Find "POST /api/v1/heatmap/generate"
3. Execute with project ID: `550e8400-e29b-41d4-a716-446655440000`
4. Returns: Coverage by module (mock data)

### Health Check (cURL)
```bash
curl http://localhost:5000/api/v1/health
```

### Dashboard (Swagger)
1. GET /api/v1/dashboard/executive
2. GET /api/v1/dashboard/qa
3. GET /api/v1/dashboard/developer/{userId}

## 📖 Full Documentation

See [DEMO_SETUP.md](DEMO_SETUP.md) for:
- Detailed setup instructions
- API endpoint reference
- Database schema details
- Troubleshooting guide
- Performance notes

## 🛠️ Troubleshooting

### "Docker not found"
- Install Docker Desktop: https://www.docker.com/products/docker-desktop
- Restart PowerShell after installation

### "Port 5432 already in use"
- Stop other PostgreSQL instances
- Or change port in `docker-compose.local.yml`

### "PostgreSQL won't start"
```powershell
# Check logs
docker logs integrity-postgres

# Try restarting
.\setup.ps1 -Command restart
```

### "API won't start"
- Check if port 5000 is available
- Check logs: `.\setup.ps1 -Command logs`
- Ensure PostgreSQL is healthy before starting API

## 📦 Stack Summary

- **Database**: PostgreSQL 15 (Docker)
- **Cache**: Redis 7 (Docker)
- **API**: .NET 7 ASP.NET Core (local)
- **ORM**: Entity Framework Core 7
- **Admin UI**: pgAdmin 4 (Docker)

All running locally, no cloud dependencies for demo.

## ⚠️ Security Note

This demo configuration:
- ✗ NOT for production
- ✗ Hardcoded credentials
- ✗ No HTTPS (local only)
- ✓ Perfect for local development
- ✓ Perfect for demonstrations

For production: Use Azure Key Vault, managed identities, real OAuth 2.0.

## 📞 Need Help?

1. Check [DEMO_SETUP.md](DEMO_SETUP.md) - Detailed guide
2. Run `.\setup.ps1 -Command help` - Show all options
3. Check Docker logs: `docker logs integrity-postgres`
4. Check API output in terminal when running `.\setup.ps1 -Command api`

---

**Phase 08 Development** | Local Supabase Demo | May 1, 2024
