# Supabase Cloud Setup - INTEGRITY Project

Guía completa para desplegar la base de datos INTEGRITY en Supabase Cloud (PostgreSQL alojado).

## 🎯 Diferencia: Local vs Cloud

### Local (Actual - Demo)
```
docker-compose.local.yml
├── PostgreSQL 15 (Docker)
├── Redis 7 (Docker)
└── pgAdmin 4 (Docker)
```
✅ Sin costo, totalmente local, perfecto para desarrollo/demo

### Cloud (Este documento)
```
Supabase Cloud (PostgreSQL + Redis + Auth)
├── PostgreSQL database (managed)
├── Redis (add-on)
├── Real-time subscriptions
├── Auth integrado
└── Backups automáticos
```
✅ Accesible desde cualquier lugar, escalable, production-ready

---

## 📋 Requisitos

- Cuenta de Supabase (gratuita): https://app.supabase.com
- .NET 7 SDK
- Git

---

## 🚀 Paso 1: Crear Proyecto en Supabase

### 1.1 Registrarse / Iniciar Sesión
1. Ve a https://app.supabase.com
2. Click en "Sign Up" o inicia sesión con tu cuenta
3. Completa el registro (email + contraseña)

### 1.2 Crear Nuevo Proyecto
1. Click en "New Project"
2. Rellena los datos:
   - **Name**: `integrity-demo` (o el nombre que prefieras)
   - **Database Password**: Genera una contraseña fuerte (guardala 🔐)
   - **Region**: Selecciona la región más cercana (ej: `us-east-1`)
   - **Pricing Plan**: `Free` (ideal para demo)

3. Click en "Create New Project"
4. ⏳ Espera 2-3 minutos mientras Supabase provisiona tu base de datos

### 1.3 Obtener Credenciales
Una vez completado, estarás en el dashboard. Busca en la esquina inferior izquierda:
- Click en tu **nombre de proyecto** (ej: "integrity-demo")
- Ve a **Settings** → **Database**

Copia y guarda estos valores:
```
Host: [Host]                          # ej: db.xxxxxxxxxxxx.supabase.co
Port: [Port]                          # Por defecto: 5432
Database: postgres
Username: postgres
Password: [Database Password]         # La que generaste arriba
```

Alternativa - obtén el Connection String completo:
- Ve a **Settings** → **Database** → **Connection String**
- Copia la versión de **URI** (no Psql)

---

## 🔑 Paso 2: Obtener API Key y URL

### 2.1 URL de Supabase
En el dashboard principal:
- Ve a **Settings** → **API**
- Copia **Project URL** (ej: `https://xxxxx.supabase.co`)

### 2.2 API Key
En el mismo lugar:
- Copia **Service Role Secret** (para backend)
- Copia **Anon Key** (para frontend - no necesario ahora)

**Guarda estos valores de forma segura:**
```
URL: https://xxxxx.supabase.co
Service Role Key: eyXXXXXXXXXXXXXXXXXX...
```

---

## 🗄️ Paso 3: Crear Tablas en Supabase

### Opción A: SQL Editor (Recomendado)

1. En el dashboard de Supabase, ve a **SQL Editor**
2. Click en "New Query"
3. Copia todo el contenido de [init-db.sql](../init-db.sql)
4. Pégalo en el editor
5. Click en "Run"

✅ Las 10 tablas se crearán automáticamente con datos demo

### Opción B: pgAdmin (Local)

Si prefieres usar pgAdmin localmente:

1. Abre pgAdmin: http://localhost:5050
2. Agrega servidor Supabase:
   - **Name**: Supabase Production
   - **Host**: `[Tu Host de Supabase]`
   - **Port**: 5432
   - **Username**: postgres
   - **Password**: `[Tu Database Password]`
3. Ejecuta el script SQL en la base de datos `postgres`

### Opción C: psql (Terminal)

```bash
# Descarga el script
curl https://raw.githubusercontent.com/[tu-repo]/init-db.sql -o init-db.sql

# Conecta a Supabase y ejecuta el script
psql -h db.xxxxxxxxxxxx.supabase.co \
     -U postgres \
     -d postgres \
     -f init-db.sql

# Ingresa el password cuando se pida
```

---

## ⚙️ Paso 4: Configurar la Aplicación

### 4.1 Crear appsettings.Supabase.Production.json

Crea este archivo en `projects/INTEGRITY/src/INTEGRITY.API/`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  },

  "ConnectionStrings": {
    "DefaultConnection": "Host=[Host];Port=5432;Database=postgres;Username=postgres;Password=[Password];SSL Mode=Require;Include Error Detail=false;",
    "Supabase": "postgresql://postgres:[Password]@[Host]:5432/postgres?sslmode=require"
  },

  "Supabase": {
    "Url": "https://[Project].supabase.co",
    "Key": "[Service Role Secret]"
  },

  "Auth": {
    "Authority": "https://[Project].supabase.co/auth/v1",
    "Audience": "authenticated"
  },

  "Cors": {
    "AllowedOrigins": "https://yourdomain.com,http://localhost:3000"
  },

  "Caching": {
    "HeatMapTtlMinutes": 240,
    "TestSelectionTtlMinutes": 30,
    "DashboardMetricsTtlMinutes": 5
  },

  "Features": {
    "EnableHeatMapGeneration": true,
    "EnableTestSelection": true,
    "EnableRiskAssessment": true,
    "EnableRealTimeDashboards": true,
    "EnableMachineLearning": false,
    "EnableWebhooks": true
  },

  "Security": {
    "RequireHttps": true,
    "AllowInvalidCerts": false
  }
}
```

Reemplaza los placeholders:
- `[Host]` → Tu host de Supabase
- `[Password]` → Tu database password
- `[Project]` → Tu nombre de proyecto Supabase
- `[Service Role Secret]` → Tu API key

### 4.2 Usar Secretos de Usuario (Recomendado)

En lugar de guardar credenciales en archivos, usa **User Secrets** (.NET):

```powershell
# Navega a la carpeta API
cd projects/INTEGRITY/src/INTEGRITY.API

# Inicializa user secrets
dotnet user-secrets init

# Guarda la connection string
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=xxx;Port=5432;Database=postgres;Username=postgres;Password=xxx;SSL Mode=Require"

# Guarda credenciales Supabase
dotnet user-secrets set "Supabase:Url" "https://xxx.supabase.co"
dotnet user-secrets set "Supabase:Key" "eyXXXXXX..."
```

✅ Los secretos se guardan en `%APPDATA%\Microsoft\UserSecrets\`

---

## 🧪 Paso 5: Probar Conexión

### 5.1 Verificar Conexión Local

```powershell
cd projects/INTEGRITY/src/INTEGRITY.API

# Con environment Supabase Production
dotnet build --configuration Release

# Ver si hay errores de conexión
dotnet run --environment Supabase.Production
```

### 5.2 Probar Endpoint

```bash
# Si API está corriendo en http://localhost:5000
curl http://localhost:5000/api/v1/health

# Esperado:
# {"status":"Healthy","timestamp":"2024-05-01T12:34:56Z","version":"1.0.0"}
```

### 5.3 Verificar Datos en Supabase

1. Ve a Supabase Dashboard
2. Click en **Table Editor**
3. Selecciona `projects` table
4. Deberías ver 1 fila con "INTEGRITY Demo"

---

## 🌐 Paso 6: Desplegar API (Opcional)

Si quieres que la API también esté en la nube (no solo la BD):

### Opción A: Azure App Service

```bash
# Publica a Azure
dotnet publish -c Release -o ./publish
# (Sigue los pasos de Azure para desplegar)
```

### Opción B: Docker + Cualquier Host

```bash
# Desde raíz del proyecto
docker build -t integrity-api -f projects/INTEGRITY/src/INTEGRITY.API/Dockerfile .

# Push a Docker Hub o tu registry
docker push [tu-registry]/integrity-api:latest
```

### Opción C: GitHub Actions

Crea `.github/workflows/deploy.yml` para CI/CD automático.

---

## 📊 Comparación: Local vs Supabase Cloud

| Característica | Local Docker | Supabase Cloud |
|---|---|---|
| **Setup time** | 5 minutos | 3 minutos |
| **Cost** | $0 (local) | Free tier / $25/mo |
| **Accesible desde** | localhost solo | Cualquier lugar |
| **Escalabilidad** | Limitada (tu PC) | Unlimited |
| **Backups** | Manual | Automáticos |
| **Latencia** | <1ms | 50-200ms (depende región) |
| **SSL/TLS** | No (local) | ✅ Sí |
| **Monitoring** | Manual | Dashboard Supabase |
| **Ideal para** | Desarrollo local | Demo/Producción |

---

## 🔒 Seguridad en Supabase

### ⚠️ IMPORTANTE: No Hardcodear Credenciales

❌ **NUNCA hagas esto:**
```json
{
  "ConnectionString": "Host=xxx;Password=mipassword123"
}
```

✅ **Usa User Secrets o Environment Variables:**
```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "..."
```

### ✅ Mejores Prácticas

1. **Gestión de Credenciales**
   - Usa Azure Key Vault para producción
   - Usa User Secrets para desarrollo local
   - Nunca commits credenciales a Git

2. **Row Level Security (RLS)**
   - Habilita RLS en Supabase para multi-tenancy
   - Cada usuario solo ve datos de su proyecto

3. **Backups**
   - Supabase incluye backups diarios
   - Plan Pro permite backups horarios

4. **SSL/TLS**
   - Supabase requiere SSL por defecto
   - Cadena de conexión incluye `sslmode=require`

---

## 🐛 Troubleshooting

### Error: "Connection timeout"
```
❌ "timeout expired"
```
**Solución:**
- Verifica que el host es correcto
- Comprueba que el password es correcto
- Asegúrate de estar en la red correcta

### Error: "SSL/TLS handshake failed"
```
❌ "SSL connection error"
```
**Solución:**
- Asegúrate de que en la connection string incluye: `SSL Mode=Require`
- Supabase requiere SSL (no es opcional)

### Error: "Authentication failed"
```
❌ "role postgres does not exist"
```
**Solución:**
- Verifica Username: debe ser `postgres`
- Verifica Database password es correcta
- Crea nuevo password en Supabase si es necesario

### Tablas no se crearon
```
❌ "relation public.users does not exist"
```
**Solución:**
- Ve a SQL Editor en Supabase
- Ejecuta nuevamente el init-db.sql
- Verifica que no hay errores en la query

### Connection string no funciona

Verifica el formato exacto:
```
# ✅ CORRECTO
Host=db.xxxxx.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=xxx;SSL Mode=Require

# ❌ INCORRECTO
postgres://postgres:xxx@db.xxxxx.supabase.co:5432/postgres
```

---

## 📝 Resumen: 3 Formas de Ejecutar

### 1️⃣ Local (Desarrollo)
```powershell
.\setup.ps1 -Command full
```
- PostgreSQL + Redis en Docker
- Datos demo
- Rápido (0-100ms latencia)

### 2️⃣ Supabase Cloud (Demo/Producción)
```powershell
# 1. Crear proyecto en Supabase.com
# 2. Ejecutar init-db.sql en SQL Editor
# 3. Configurar appsettings.Supabase.Production.json
# 4. dotnet run --environment Supabase.Production
```
- Base de datos en la nube
- Accesible desde cualquier lugar
- Escalable y seguro

### 3️⃣ Azure + Supabase (Full Cloud)
```powershell
# API en Azure App Service
# BD en Supabase Cloud
# Frontend en Azure Static Web Apps
```
- Completamente en la nube
- Production-ready
- Monitoreo y alertas integradas

---

## 🎬 Próximos Pasos

1. ✅ Crea proyecto en Supabase
2. ✅ Ejecuta init-db.sql
3. ✅ Configura appsettings
4. ✅ Prueba conexión local
5. ✅ Opcionalmente: Despliega API a la nube

---

## 📚 Recursos Útiles

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Connection Strings**: https://www.postgresql.org/docs/current/libpq-connect.html
- **Entity Framework Core + PostgreSQL**: https://www.npgsql.org/doc/types/basic.html
- **Azure Key Vault**: https://docs.microsoft.com/azure/key-vault/

---

**¿Necesitas ayuda?**

Si tienes problemas:
1. Revisa los logs en Supabase Dashboard
2. Verifica las credenciales en Settings → Database
3. Prueba conexión con psql: `psql -h [host] -U postgres`
4. Consulta Supabase Support: https://supabase.com/support

---

**Last Updated**: May 1, 2026  
**Environment**: Supabase Cloud Production  
**Status**: Ready for deployment
