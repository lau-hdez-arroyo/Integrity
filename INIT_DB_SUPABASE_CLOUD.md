# Init Database en Supabase Cloud

## ✅ Problema Resuelto

**Error anterior**: `uuid_generate_v4() does not exist`  
**Solución**: Cambiado a `gen_random_uuid()` (compatible con Supabase Cloud)

---

## 🚀 Cómo Ejecutar init-db.sql en Supabase

### Opción 1: SQL Editor (RECOMENDADO - 5 minutos)

```
1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. Click en "SQL Editor" (lado izquierdo)
4. Click en "New Query"
5. Copia TODO el contenido de init-db.sql
6. Pega en el SQL Editor
7. Click en "RUN" (botón verde)
```

✅ **Espera a que termine** (puede tardar 30 segundos)

```
✅ Si no hay errores, base de datos lista
❌ Si hay error, verifica que copiaste todo el contenido
```

---

### Opción 2: SQL File Upload

```
1. Ve a SQL Editor
2. Click en "Upload SQL file"
3. Selecciona init-db.sql
4. Click "Upload"
5. Click "RUN"
```

---

### Opción 3: Terminal (psql)

```bash
# Desde tu computadora con psql instalado:

psql -h omxyeagavmybmyqppudf.supabase.co \
     -U postgres \
     -d postgres \
     -f init-db.sql \
     -W
# Ingresa tu password

# Resultado esperado:
# CREATE DATABASE
# CREATE SCHEMA
# CREATE TABLE (10 veces)
# INSERT 0 1 (3 veces)
# GRANT PRIVILEGES
```

---

## ✅ Verificar que Funcionó

En **Supabase Table Editor** (lado izquierdo):

```
✅ Tablas creadas:
  - projects
  - users
  - connections
  - heat_maps
  - test_executions
  - risk_assessments
  - audit_logs
  - admin_logs
  - project_members
  - integration_mappings

✅ Datos de demo:
  - 1 proyecto: "INTEGRITY Demo"
  - 1 usuario: admin@demo.local (role: Admin)
  - 1 conexión: ADO type
```

---

## 🆕 Cambios en init-db.sql

### Antes (No funciona en Supabase Cloud)
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE DATABASE integrity_demo;
...
user_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
```

### Ahora (Compatible con Supabase Cloud)
```sql
-- Extensions ya están habilitadas en Supabase Cloud
-- No necesita CREATE DATABASE (ya existe)
...
user_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
```

---

## 📊 Diferencias: uuid_generate_v4() vs gen_random_uuid()

| Función | Disponible | Requiere Extension | Nota |
|---------|-----------|---|---|
| `uuid_generate_v4()` | PostgreSQL 9.1+ | ✅ uuid-ossp | Problemas en Supabase Cloud |
| `gen_random_uuid()` | PostgreSQL 13+ | ❌ Nativa | ✅ Funciona en Supabase |

**Ambas generan UUIDs aleatorios v4** - no hay diferencia funcional.

---

## 🚨 Si Aún Hay Error

### Error: "relation already exists"
```
Causa: Ya ejecutaste el script antes
Solución: 
  1. Ve a SQL Editor
  2. Copia este query:

DROP SCHEMA IF EXISTS integrity CASCADE;
DROP DATABASE IF EXISTS integrity_demo;

  3. Ejecuta
  4. Luego ejecuta init-db.sql nuevamente
```

### Error: "permission denied"
```
Causa: No eres admin
Solución: Usa la cuenta que creaste el proyecto (con password guardada)
```

### Error: "Column does not exist"
```
Causa: Script interrumpido a mitad
Solución: 
  1. DROP SCHEMA integrity CASCADE;
  2. Ejecuta init-db.sql completo de nuevo
```

---

## ✅ Checklist: Antes de Ejecutar

- [ ] Copiaste TODO el contenido de init-db.sql (líneas 1-215+)
- [ ] Estás en el SQL Editor de Supabase
- [ ] Pegaste el contenido completo (sin saltos de línea)
- [ ] Revisaste que comienza con "-- INTEGRITY API"
- [ ] Revisamos que NO tiene `CREATE DATABASE` al inicio
- [ ] Haces click en RUN (botón verde)

---

## 📝 Contenido del Script

```sql
-- Crea 10 tablas:
✓ users (email, role, active status)
✓ projects (nombre, repo URL)
✓ connections (integración: ADO/GitHub/etc)
✓ heat_maps (cobertura de código)
✓ test_executions (resultados de tests)
✓ risk_assessments (evaluación de riesgo)
✓ audit_logs (cumplimiento)
✓ admin_logs (cambios administrativos)
✓ project_members (miembros de proyecto)
✓ integration_mappings (mapeos de integraciones)

-- Índices para:
✓ project_id (todas las tablas)
✓ Timestamps para queries de tiempo
✓ Composite indexes para joins

-- Datos de demo:
✓ 1 proyecto: "INTEGRITY Demo"
✓ 1 admin: admin@demo.local
✓ 1 conexión: tipo ADO
```

---

## 🎯 Próximos Pasos

1. ✅ Ejecuta init-db.sql en Supabase SQL Editor
2. ✅ Verifica en Table Editor que están las 10 tablas
3. ✅ Configura API Key en INTEGRITY.API (appsettings)
4. ✅ Ejecuta API: `dotnet run --environment Supabase.Production`
5. ✅ Prueba en Swagger: http://localhost:5000/swagger

---

## 📚 Archivos Relacionados

- **init-db.sql** - Script de base de datos (actualizado)
- **SUPABASE_API_KEY_QUICK_START.md** - Configurar API Key
- **SUPABASE_CLOUD_QUICK.md** - Setup Supabase Cloud

---

**¡Listo!** BD creada en Supabase Cloud ✅
