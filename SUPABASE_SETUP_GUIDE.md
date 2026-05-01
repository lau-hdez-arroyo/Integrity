# INTEGRITY - Guía de Implementación en Supabase

**Resumen ejecutivo**: Monta tu base de datos en Supabase Cloud en 5 minutos

---

## 📊 3 Opciones de Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRITY Deployment Options                 │
└─────────────────────────────────────────────────────────────────┘

┌────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│                │     │                  │     │                 │
│  Local Docker  │     │ Supabase Cloud   │     │  Full Cloud     │
│                │     │  (Recommended)   │     │  (Production)   │
└────────────────┘     └──────────────────┘     └─────────────────┘

Your PC:              Supabase Cloud:          Azure Cloud:
- PostgreSQL         - PostgreSQL             - App Service (API)
- Redis              - Redis (optional)       - Supabase (BD)
- pgAdmin            - Auth integrado         - Key Vault
- .NET API (local)   - Backups automáticos    - Monitoring
                      - SSL/TLS

Acceso:              Acceso:                  Acceso:
- localhost:5000     - https://xxx.supabase.co - https://api.dominio.com
- localhost:5050     - Desde cualquier lugar  - Global + CDN

Setup:               Setup:                   Setup:
5 minutos            5 minutos                15 minutos
(Docker)             (Supabase web UI)        (Terraform/CLI)

Costo:               Costo:                   Costo:
$0 (local)           Free / $25/mes           $50-500/mes

Ideal para:          Ideal para:              Ideal para:
Desarrollo local     Demo/MVP/Producción      Producción empresarial
```

---

## ⚡ Quick Start: Supabase Cloud (Recomendado)

### Paso 1: Crear Proyecto (2 minutos)
```
1. Ve a https://app.supabase.com
2. Click "New Project"
3. Nombre: integrity-demo
4. Password: (genera fuerte) 🔐
5. Region: Más cercana a ti
6. Plan: Free
7. Click "Create"
8. ⏳ Espera 2-3 minutos...
```

### Paso 2: Obtener Credenciales (1 minuto)
```
En Supabase Dashboard → Settings → Database:

HOST:     db.xxxxxxxxxxxxx.supabase.co  [copiar]
PORT:     5432
DB:       postgres
USER:     postgres
PASSWORD: [la que generaste]           [copiar]
```

### Paso 3: Crear Tablas (1 minuto)
```
1. En Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copia contenido de init-db.sql (ver links abajo)
4. Click "Run"
5. ✅ Tablas creadas + datos demo cargados
```

### Paso 4: Configurar API Local (1 minuto)
```powershell
cd projects/INTEGRITY/src/INTEGRITY.API

# Guardar credenciales de forma segura:
dotnet user-secrets set "ConnectionStrings:DefaultConnection" `
  "Host=db.xxxxxxxxxxxxx.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=tupassword;SSL Mode=Require"

# Ejecutar API:
dotnet run --environment Supabase.Production
```

### ✅ ¡Listo!
```
API corriendo en: http://localhost:5000
Swagger UI:       http://localhost:5000/swagger
BD en:            db.xxxxxxxxxxxxx.supabase.co
```

---

## 📋 Archivos & Recursos

| Archivo | Propósito | Tamaño |
|---------|-----------|--------|
| **[SUPABASE_CLOUD.md](SUPABASE_CLOUD.md)** | Guía completa (paso a paso) | 📗 Grande |
| **[SUPABASE_CLOUD_QUICK.md](SUPABASE_CLOUD_QUICK.md)** | Quick reference | 📄 Pequeño |
| **[init-db.sql](../init-db.sql)** | Script SQL para crear tablas | 📊 SQL |
| **[appsettings.Supabase.Production.json](../projects/INTEGRITY/src/INTEGRITY.API/appsettings.Supabase.Production.json)** | Template configuración | ⚙️ Config |
| **[README.md](../README.md)** | Proyecto overview (con Supabase section) | 📚 Principal |

---

## 🔐 Seguridad: Credenciales

### ❌ NUNCA
```
Hardcodear en config:
"Password": "miContraseña123"

Commitar a Git:
git add appsettings.Production.json  # ❌ NO!
```

### ✅ SIEMPRE
```powershell
# Opción 1: User Secrets (desarrollo local)
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "..."

# Opción 2: Environment Variables (servidor)
$env:ASPNETCORE_CONNECTION_STRING = "..."

# Opción 3: Azure Key Vault (producción)
# Usar managed identity para obtener secretos

# Opción 4: GitHub Secrets (CI/CD)
# Para pipelines de deployment
```

---

## 🎯 Casos de Uso

### 👤 Desarrollador Local
```
1. Clone repo
2. Run: .\setup.ps1 -Command full
3. Trabaja localmente contra Docker
4. Commitea a Git
5. ✅ Listo para colaborar
```

### 🎬 Demo/Presentación
```
1. Create proyecto Supabase
2. Run init-db.sql
3. Configura API en tu laptop
4. Comparte URL con credenciales (por email cifrado)
5. ✅ Audiencia accede por internet
```

### 🚀 Producción
```
1. Supabase Cloud (base de datos empresarial)
2. Azure App Service (API en nube)
3. Azure Key Vault (secretos)
4. GitHub Actions (CI/CD automático)
5. ✅ Alta disponibilidad + scaling automático
```

---

## 🔄 Flujo: Local → Supabase Cloud → Producción

```
┌──────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   Desarrollo │ ───> │  Supabase Cloud  │ ───> │    Producción    │
│   (Local)    │      │   (Demo/Testing) │      │  (Azure + Cloud) │
└──────────────┘      └──────────────────┘      └──────────────────┘

Init DB:             Init DB:                   Init DB:
  Local script         Supabase SQL Editor        Terraform/Bicep
  
Configure:           Configure:                 Configure:
  .NET app.json        User Secrets               Azure Key Vault
  
Deploy:              Deploy:                    Deploy:
  localhost:5000       GitHub/Heroku/Cloud       Azure App Service
  
Datos:               Datos:                     Datos:
  Fresh copy           Fresh copy                Production backup
```

---

## 📞 Soporte

| Problema | Solución |
|----------|----------|
| Olvidé contraseña | Supabase Dashboard → Settings → Database → Reset Password |
| Connection timeout | Verifica host/puerto, ping a host |
| SSL error | Asegura `SSL Mode=Require` en connection string |
| Tablas no existen | Ejecuta init-db.sql nuevamente en SQL Editor |
| Credenciales no funcionan | Verifica exactitud, copia nuevamente sin espacios |
| .NET no conecta | Verifica environment variable, revisa logs de aplicación |

---

## 🎓 Referencia Rápida

### Conectar desde CLI
```bash
psql -h db.xxxxx.supabase.co \
     -U postgres \
     -d postgres \
     -c "SELECT table_name FROM information_schema.tables;"
```

### Ejecutar Script SQL
```bash
psql -h db.xxxxx.supabase.co \
     -U postgres \
     -d postgres \
     -f init-db.sql
```

### Reset Completo
```bash
# En Supabase SQL Editor:
DROP SCHEMA IF EXISTS integrity CASCADE;
-- Luego ejecuta init-db.sql nuevamente
```

### Verificar Credenciales
```powershell
# Test connection con .NET
$connString = "Host=db.xxxxx.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=xxx;SSL Mode=Require"
dotnet run --environment Supabase.Production
```

---

## ✅ Checklist: Antes de Producción

- [ ] Proyecto creado en Supabase.com
- [ ] Password generada y guardada (🔐 segura)
- [ ] Host, Username copiados correctamente
- [ ] init-db.sql ejecutado sin errores
- [ ] Tablas visibles en Supabase Table Editor
- [ ] Datos demo cargados (1 project, 1 user, 1 connection)
- [ ] Connection string en User Secrets (NO en config file)
- [ ] API ejecuta sin errores: `dotnet run --environment Supabase.Production`
- [ ] Swagger UI accesible: http://localhost:5000/swagger
- [ ] Health endpoint responde: `curl http://localhost:5000/api/v1/health`
- [ ] Puedo ver datos en SQL Editor de Supabase

---

## 📚 Próximas Fases

Después de setup de BD:

1. **Phase 08 (Actual)**
   - [ ] Authentication middleware ← **PRÓXIMO**
   - [ ] Integration handlers
   - [ ] Unit tests

2. **Producción**
   - [ ] Deploy API a Azure
   - [ ] Setup CI/CD con GitHub Actions
   - [ ] Monitoring + Alertas
   - [ ] Disaster recovery

---

## 🎯 TL;DR

**Para ejecutar INTEGRITY con Supabase Cloud:**

```powershell
# 1. Crea proyecto: https://app.supabase.com
# 2. Copia credenciales
# 3. Ejecuta SQL: init-db.sql
# 4. Guarda credenciales:

cd projects/INTEGRITY/src/INTEGRITY.API
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=...;Password=...;SSL Mode=Require"

# 5. Ejecuta API:
dotnet run --environment Supabase.Production

# 6. ✅ http://localhost:5000/swagger
```

---

**Más información**:
- Guía completa: [SUPABASE_CLOUD.md](SUPABASE_CLOUD.md)
- Quick setup: [SUPABASE_CLOUD_QUICK.md](SUPABASE_CLOUD_QUICK.md)
- API docs: [README.md](../projects/INTEGRITY/src/INTEGRITY.API/README.md)
- Local setup: [DEMO_SETUP.md](../DEMO_SETUP.md)

---

**Last Updated**: May 1, 2026  
**Status**: Ready for Supabase Cloud Deployment
