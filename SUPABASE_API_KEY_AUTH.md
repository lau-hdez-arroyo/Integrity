# Supabase Authentication by API Key

## 📚 Overview

Hay dos formas de conectar INTEGRITY API a Supabase:

### ❌ **Opción 1: Direct Database Connection (Antiguo)**
```
Connection String → PostgreSQL (puerto 5432)
Host=xxx.supabase.co;Port=5432;Database=postgres;Password=xxx
```
- Requiere credenciales de BD directas
- Acoplado a PostgreSQL
- No usa autenticación de Supabase

---

### ✅ **Opción 2: API Key Authentication (Recomendado - NUEVO)**
```
API Key → Supabase REST API / PostgREST
URL: https://xxx.supabase.co
Key: sb_publishable_xxxxx
```
- Usa REST API de Supabase
- Autenticación integrada
- Mejor para microservicios
- Compatible con Row Level Security (RLS)

---

## 🔑 Tus Credenciales Supabase

```
SUPABASE_URL = https://omxyeagavmybmyqppudf.supabase.co
SUPABASE_PUBLISHABLE_KEY = sb_publishable_UEbY4BlonnynGiN7j4c_rg_S3C1nv7c
```

---

## 🚀 Setup: Usar API Key en INTEGRITY API

### Paso 1: Actualizar appsettings.json

Ya actualizado con:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "https://omxyeagavmybmyqppudf.supabase.co"
  },
  "Supabase": {
    "Url": "https://omxyeagavmybmyqppudf.supabase.co",
    "PublishableKey": "sb_publishable_UEbY4BlonnynGiN7j4c_rg_S3C1nv7c",
    "ServiceRoleKey": "[OBTENER DEL DASHBOARD]",
    "RestApiUrl": "https://omxyeagavmybmyqppudf.supabase.co/rest/v1"
  }
}
```

### Paso 2: Obtener Service Role Key

```
1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. Settings → API → Service Role Key
4. Copia el valor (empieza con "sb_srvc_")
5. Reemplaza [OBTENER DEL DASHBOARD] en appsettings
   O guardalo en User Secrets:
```

```powershell
cd projects/INTEGRITY/src/INTEGRITY.API
dotnet user-secrets set "Supabase:ServiceRoleKey" "sb_srvc_xxxxx"
```

### Paso 3: Crear Cliente Supabase en C#

En `Startup.cs`, agregar:

```csharp
services.AddHttpClient<ISupabaseClient, SupabaseClient>((httpClient) =>
{
    var supabaseUrl = configuration["Supabase:Url"];
    var supabaseKey = configuration["Supabase:PublishableKey"];
    
    httpClient.BaseAddress = new Uri($"{supabaseUrl}/rest/v1/");
    httpClient.DefaultRequestHeaders.Add("apikey", supabaseKey);
    httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {supabaseKey}");
});
```

### Paso 4: Usar en Services

```csharp
public class HeatMapService : IHeatMapService
{
    private readonly ISupabaseClient _supabaseClient;

    public HeatMapService(ISupabaseClient supabaseClient)
    {
        _supabaseClient = supabaseClient;
    }

    public async Task<HeatMapDto> GenerateHeatMapAsync(HeatMapGenerateRequest request)
    {
        // Llamar a REST API de Supabase
        var heatmaps = await _supabaseClient
            .From("heat_maps")
            .Select("*")
            .Where("project_id", "eq", request.ProjectId)
            .Get();
        
        // Procesar respuesta
        return MapToDto(heatmaps);
    }
}
```

---

## 🔐 Seguridad: Tipos de Keys

| Key | Uso | Público | Restricciones |
|-----|-----|---------|---|
| **Publishable Key** | Frontend + API público | ✅ Sí | RLS (Row Level Security) |
| **Service Role Key** | Backend + admin | ❌ No | Acceso total a BD |
| **JWT Token** | Autenticación de usuario | Depende | RLS + expirables |

### Tu Setup:
```
Frontend:       PUBLISHABLE_KEY (sb_publishable_xxx)
Backend API:    SERVICE_ROLE_KEY (sb_srvc_xxx) [PRIVADO]
User Auth:      JWT Token + RLS
```

---

## 🧪 Probar Conexión

```bash
# Test REST API
curl -H "apikey: sb_publishable_UEbY4BlonnynGiN7j4c_rg_S3C1nv7c" \
     -H "Authorization: Bearer sb_publishable_UEbY4BlonnynGiN7j4c_rg_S3C1nv7c" \
     "https://omxyeagavmybmyqppudf.supabase.co/rest/v1/heat_maps?select=*"
```

```csharp
// Test desde .NET
var response = await client.GetAsync(
    "https://omxyeagavmybmyqppudf.supabase.co/rest/v1/heat_maps?select=*"
);
var data = await response.Content.ReadAsStringAsync();
Console.WriteLine(data);
```

---

## 📊 Comparación: PostgreSQL Direct vs API Key

| Aspecto | PostgreSQL Direct | API Key |
|---------|-------------------|---------|
| **Connection** | TCP Socket | HTTPS REST |
| **Auth** | Username/Password | API Key + JWT |
| **Security** | BD directa expuesta | RLS + rate limiting |
| **Escalabilidad** | Limitada | Supabase managed |
| **Client Library** | Npgsql | HttpClient |
| **Row Level Security** | ❌ No | ✅ Sí |
| **Ideal para** | Monolitos | Microservicios |

---

## ⚙️ Configuración por Ambiente

### Development (Local Docker)
```json
{
  "Supabase": {
    "Url": "http://localhost:54321",
    "PublishableKey": "[LOCAL_JWT]",
    "RestApiUrl": "http://localhost:54321/rest/v1"
  }
}
```

### Production (Supabase Cloud)
```json
{
  "Supabase": {
    "Url": "https://omxyeagavmybmyqppudf.supabase.co",
    "PublishableKey": "sb_publishable_UEbY4BlonnynGiN7j4c_rg_S3C1nv7c",
    "ServiceRoleKey": "[SECRET - User Secrets or Key Vault]",
    "RestApiUrl": "https://omxyeagavmybmyqppudf.supabase.co/rest/v1"
  }
}
```

---

## 🔄 Migrar desde Connection String a API Key

### Antes (PostgreSQL Direct)
```csharp
services.AddDbContext<IntegrityDbContext>(options =>
    options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"))
);
```

### Después (API Key)
```csharp
// Opción A: Seguir usando EF Core + connection string
services.AddDbContext<IntegrityDbContext>(options =>
    options.UseNpgsql(
        $"Host={supabaseUrl};Port=5432;Database=postgres;Username=postgres;Password={dbPassword};SSL Mode=Require"
    )
);

// Opción B: Usar REST API (sin EF Core)
services.AddHttpClient<ISupabaseClient, SupabaseClient>(httpClient =>
{
    httpClient.BaseAddress = new Uri($"{supabaseUrl}/rest/v1/");
    httpClient.DefaultRequestHeaders.Add("apikey", apiKey);
});
```

---

## 🚨 Checklist Implementación

- [ ] Actualizar appsettings.json (✅ HECHO)
- [ ] Obtener Service Role Key del dashboard Supabase
- [ ] Guardar Service Role Key en User Secrets: `dotnet user-secrets set "Supabase:ServiceRoleKey" "sb_srvc_xxx"`
- [ ] Implementar SupabaseClient en Startup.cs
- [ ] Actualizar Services para usar HttpClient (opcional)
- [ ] Probar conexión: `dotnet run --environment Supabase.Production`
- [ ] Verificar en Swagger: http://localhost:5000/swagger
- [ ] Testear endpoints REST
- [ ] Setup Row Level Security (RLS) en Supabase dashboard (opcional pero recomendado)

---

## 📚 Recursos

- [Supabase Client Libraries](https://supabase.com/docs/reference/csharp)
- [Supabase API Docs](https://supabase.com/docs/guides/api)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [REST API Docs](https://supabase.com/docs/guides/api)

---

## 💡 Tips

1. **Protege Service Role Key** - Úsalo en backend solamente
2. **Habilita RLS** - Para seguridad basada en roles
3. **Rate Limiting** - Supabase incluye rate limiting automático
4. **Auditoría** - Supabase registra todos los cambios de BD
5. **Backups** - Automáticos y gestionados por Supabase

---

**Last Updated**: May 1, 2026  
**Status**: Ready for API Key authentication
