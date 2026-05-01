# Supabase Cloud - Quick Setup (5 minutos)

## ⚡ Paso a Paso Rápido

### 1. Crear Proyecto Supabase
- Ve a https://app.supabase.com
- Click "New Project"
- Nombre: `integrity-demo`
- Contraseña: (guárdala 🔐)
- Región: Más cercana a ti
- Plan: `Free`
- ⏳ Espera 2-3 minutos

### 2. Obtener Credenciales
En Supabase Dashboard → **Settings** → **Database**:
```
Host: [copiar]
Port: 5432 (default)
Username: postgres
Password: [la que creaste]
```

### 3. Crear Tablas
En Supabase Dashboard → **SQL Editor** → **New Query**:
- Copia contenido de [init-db.sql](../init-db.sql)
- Pega y ejecuta

✅ Listo: 10 tablas + datos demo creados

### 4. Configurar API Localmente

#### Opción A: User Secrets (Recomendado)
```powershell
cd projects/INTEGRITY/src/INTEGRITY.API

dotnet user-secrets set "ConnectionStrings:DefaultConnection" `
  "Host=db.xxxxx.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=tucontraseña;SSL Mode=Require"
```

#### Opción B: Archivo de Config
Copia [appsettings.Supabase.Production.json](../appsettings.Supabase.Production.json)
y reemplaza los placeholders con tus credenciales.

### 5. Ejecutar API
```powershell
cd projects/INTEGRITY/src/INTEGRITY.API

# Con secrets:
dotnet run --environment Supabase.Production

# O con archivo:
$env:ASPNETCORE_ENVIRONMENT="Supabase.Production"
dotnet run
```

### 6. Probar
```bash
# Health check
curl http://localhost:5000/api/v1/health

# Swagger
http://localhost:5000/swagger
```

✅ **¡Listo!** API conectada a Supabase Cloud

---

## 🔄 Cambiar Entre Ambientes

```powershell
# Local (Docker)
.\setup.ps1 -Command api

# Supabase Cloud
$env:ASPNETCORE_ENVIRONMENT="Supabase.Production"
dotnet run -p projects/INTEGRITY/src/INTEGRITY.API

# Supabase Local (si aún tienes Docker)
$env:ASPNETCORE_ENVIRONMENT="Supabase.Local"
dotnet run -p projects/INTEGRITY/src/INTEGRITY.API
```

---

## 🚨 Checklist Común

- [ ] ¿Proyecto creado en Supabase.com?
- [ ] ¿Copiaste Host, Username, Password?
- [ ] ¿Ejecutaste init-db.sql en SQL Editor?
- [ ] ¿Guardaste credenciales en User Secrets o config?
- [ ] ¿Incluye `SSL Mode=Require` en connection string?
- [ ] ¿API inicia sin errores?
- [ ] ¿Puedes acceder a Swagger en localhost:5000/swagger?

---

## 🐛 Errores Comunes

| Error | Solución |
|-------|----------|
| "Connection timeout" | Verifica host/password, ping a host |
| "SSL connection error" | Asegura `SSL Mode=Require` en connection string |
| "role postgres does not exist" | Usa `postgres` como username, no `sa` |
| "Password authentication failed" | Copia el password exacto de Supabase |
| "Tables don't exist" | Ejecuta init-db.sql en SQL Editor nuevamente |

---

## 📊 Datos Demo
Se cargan automáticamente con init-db.sql:
- Project ID: `550e8400-e29b-41d4-a716-446655440000`
- User: `admin@demo.local`
- Connection: ADO type

---

## 📚 Más Información
- Guía completa: [SUPABASE_CLOUD.md](./SUPABASE_CLOUD.md)
- Setup local: [DEMO_SETUP.md](./DEMO_SETUP.md)
- API docs: [projects/INTEGRITY/src/INTEGRITY.API/README.md](./projects/INTEGRITY/src/INTEGRITY.API/README.md)

---

**¿Lista la BD?** Ahora puedes:
- Ejecutar API localmente contra Supabase Cloud
- Pasar datos de DB a un amigo (comparte credenciales seguras)
- Desplegar API a la nube cuando esté lista
