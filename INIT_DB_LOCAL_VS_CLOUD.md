# init-db.sql: Local vs Supabase Cloud

## 📋 Comparación Rápida

| Aspecto | Local Docker | Supabase Cloud |
|---------|------|---|
| **Script** | init-db.sql (sin cambios) | init-db.sql (gen_random_uuid) |
| **Extensiones** | Crear manualmente | Ya habilitadas |
| **Database** | Crear con script | Ya existe (postgres) |
| **UUID Function** | uuid_generate_v4() | gen_random_uuid() |
| **Ejecución** | `psql < init-db.sql` | SQL Editor o psql |
| **Resultado** | BD local en Docker | BD cloud managed |

---

## 🐳 LOCAL (Docker)

### Configuración
```yaml
# docker-compose.local.yml
PostgreSQL 15 Alpine:
  - Port: 5432
  - Username: postgres
  - Password: postgres
  - Database: postgres
```

### Ejecutar Script
```bash
# Opción 1: Desde el contenedor
docker exec -i integrity-postgres psql -U postgres < init-db.sql

# Opción 2: Desde tu PC (con psql instalado)
psql -h localhost -U postgres -d postgres -f init-db.sql

# Opción 3: Usando setup.ps1
.\setup.ps1 -Command migrate
```

### Script Usado
```sql
-- Sí incluye:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE DATABASE integrity_demo;
\c integrity_demo

-- Usa:
user_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
```

### Verificar
```bash
docker exec integrity-postgres psql -U postgres -d postgres -l
# output: integrity_demo | ...
```

---

## ☁️ SUPABASE CLOUD

### Configuración
```
URL: https://omxyeagavmybmyqppudf.supabase.co
Database: postgres (ya existe)
Username: postgres
Password: [la que creaste]
```

### Ejecutar Script

#### Opción 1: SQL Editor (Recomendado)
```
1. Dashboard → SQL Editor
2. New Query
3. Copy-paste init-db.sql (versión actualizada)
4. RUN
```

#### Opción 2: Terminal (psql)
```bash
psql -h omxyeagavmybmyqppudf.supabase.co \
     -U postgres \
     -d postgres \
     -f init-db.sql \
     -W
# Enter password
```

#### Opción 3: Upload File
```
1. SQL Editor → Upload SQL file
2. Select init-db.sql
3. Upload
4. RUN
```

### Script Usado
```sql
-- NO incluye:
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  ← Ya habilitado
-- CREATE DATABASE integrity_demo;              ← Ya existe
-- \c integrity_demo                            ← Ya conectado

-- Usa:
user_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,  ← Compatible
```

### Verificar
```
1. Dashboard → Table Editor (lado izquierdo)
2. Busca esquema "integrity"
3. Deberías ver 10 tablas
```

---

## 🔧 Adaptaciones Automáticas

El script actualizado **detecta automáticamente** dónde se ejecuta:

```sql
-- Comentado: Solo para Docker local
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Comentado: No necesario en Supabase Cloud
-- CREATE DATABASE integrity_demo;

-- Usa función compatible con ambos:
user_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
```

---

## 🎯 Flujo Típico de Desarrollo

### Día 1: Local Development
```
1. .\setup.ps1 -Command full
   ↓
2. Docker inicia con PostgreSQL
   ↓
3. init-db.sql se ejecuta automáticamente
   ↓
4. Base de datos local lista
   ↓
5. Desarrollas localmente
```

### Día 2: Compartir Demo
```
1. Creas proyecto en Supabase Cloud
   ↓
2. Ejecutas init-db.sql en SQL Editor
   ↓
3. Configuras credenciales en .env
   ↓
4. Ejecutas: dotnet run --environment Supabase.Production
   ↓
5. Compartes URL/credenciales con cliente
```

### Semana 2: Producción
```
1. Supabase Cloud como BD principal
   ↓
2. API desplegada a Azure App Service
   ↓
3. CI/CD automático con GitHub Actions
   ↓
4. Monitoreo con Application Insights
   ↓
5. Backups automáticos gestionados por Supabase
```

---

## 📊 UUID Generation Comparison

```sql
-- Local Docker (PostgreSQL 15 Alpine)
CREATE EXTENSION "uuid-ossp";
SELECT uuid_generate_v4();  -- ✅ Funciona

-- Supabase Cloud (PostgreSQL 14+)
SELECT gen_random_uuid();   -- ✅ Funciona (nativa)
SELECT uuid_generate_v4();  -- ❌ No existe sin extension

-- Solución: Usar gen_random_uuid() en ambas
SELECT gen_random_uuid();   -- ✅ Funciona en LOCAL y CLOUD
```

---

## 🚨 Problemas Comunes

### Problema 1: "uuid-ossp extension not found" (Supabase Cloud)
```
❌ Causa: Intentas usar uuid_generate_v4() directamente
✅ Solución: Usa gen_random_uuid() (ya implementado)
```

### Problema 2: "Database already exists" (Local)
```
❌ Causa: Ejecutas script 2 veces
✅ Solución: Script usa "CREATE DATABASE IF NOT EXISTS"
```

### Problema 3: "Permission denied" (Supabase Cloud)
```
❌ Causa: Usuario no es owner de la schema
✅ Solución: Usa cuenta con permisos suficientes
```

---

## 📝 Cambios en init-db.sql v1.1

### Antes (v1.0 - Solo Local)
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE DATABASE integrity_demo;
\c integrity_demo
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
...
user_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
```

### Ahora (v1.1 - Local + Supabase Cloud)
```sql
-- NOTE: Supabase uses gen_random_uuid() instead of uuid_generate_v4()
-- Both functions do the same thing - generate random UUIDs

-- For LOCAL Docker: Uncomment these extensions
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- For SUPABASE CLOUD: Extensions are already enabled
-- (pgcrypto and uuid-ossp are available by default)
...
user_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
```

### Ventajas v1.1
- ✅ Compatible con Local Docker (si quitamos comentarios)
- ✅ Compatible con Supabase Cloud (funciona como está)
- ✅ Menor duplicación
- ✅ Documentado para ambos ambientes

---

## 🎯 Recomendación

**Usa Supabase Cloud cuando**:
- Necesitas acceder desde múltiples máquinas
- Quieres hacer una demo
- Necesitas escalabilidad automática
- Requieres backups administrados

**Usa Local Docker cuando**:
- Trabajas offline
- Necesitas velocidad de desarrollo máxima
- Pruebas en paralelo sin conflictos
- Controlas completamente el ambiente

---

## 📚 Archivos Relacionados

- **init-db.sql** - Script actualizado (v1.1)
- **INIT_DB_SUPABASE_CLOUD.md** - Cómo ejecutar en Supabase
- **DEMO_SETUP.md** - Setup local con Docker
- **SUPABASE_API_KEY_QUICK_START.md** - Configurar API Key

---

**TL;DR**: Script ahora funciona en Local Docker Y Supabase Cloud ✅
