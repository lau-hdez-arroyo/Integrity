# Supabase API Key Setup - Quick Start (5 minutos)

## 🎯 Tus Credenciales Supabase

```
URL:             https://omxyeagavmybmyqppudf.supabase.co
Publishable Key: sb_publishable_UEbY4BlonnynGiN7j4c_rg_S3C1nv7c
```

---

## ⚡ Setup Rápido

### Paso 1: Obtener Service Role Key
```
1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. Settings → API → Service Role Key
4. Copia el valor (empieza con "sb_srvc_")
```

### Paso 2: Guardar Credenciales (Seguro)
```powershell
cd projects/INTEGRITY/src/INTEGRITY.API

# Guardar Service Role Key en User Secrets:
dotnet user-secrets set "Supabase:ServiceRoleKey" "sb_srvc_xxxxxxxxxxxxx"

# Verificar que se guardó:
dotnet user-secrets list
```

### Paso 3: Configuración Automática

✅ **YA HECHO** en appsettings.json:
- Startup.cs registra ISupabaseClient automáticamente
- API Key headers se agregan automáticamente
- Conexión a REST API configurada

```csharp
// En Startup.cs se hace:
services.AddHttpClient<ISupabaseClient, SupabaseClient>((httpClient) =>
{
    httpClient.BaseAddress = new Uri($"{supabaseUrl}/rest/v1/");
    httpClient.DefaultRequestHeaders.Add("apikey", supabaseKey);
});
```

### Paso 4: Ejecutar API
```powershell
cd projects/INTEGRITY/src/INTEGRITY.API

# Ejecutar con credenciales de User Secrets:
dotnet run --environment Supabase.Production
```

### Paso 5: Verificar
```
✅ API inicia sin errores
✅ Swagger UI: http://localhost:5000/swagger
✅ Health check: curl http://localhost:5000/api/v1/health
```

---

## 📝 Usar en Services

### Inyectar ISupabaseClient

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
        // Llamar a Supabase REST API
        var query = $"?select=*&project_id=eq.{request.ProjectId}";
        var result = await _supabaseClient.GetAsync<List<HeatMapDto>>("heat_maps", query);
        
        return result.FirstOrDefault();
    }
}
```

---

## 🔐 Seguridad

| Credencial | Ubicación | Seguridad |
|-----------|-----------|----------|
| **Publishable Key** | appsettings.json | ✅ Público (con RLS) |
| **Service Role Key** | User Secrets | ✅ Privado |
| **JWT Token** | Supabase Auth | ✅ Temporal |

### NUNCA
```
❌ Hardcodear passwords en config
❌ Commitear User Secrets a Git
❌ Compartir Service Role Key por email sin cifrar
```

### SIEMPRE
```
✅ Usar User Secrets localmente
✅ Usar Azure Key Vault en producción
✅ Usar ambiente variable en Docker
✅ Rotar credenciales cada 90 días
```

---

## 🧪 Test con cURL

```bash
# Test REST API directamente
curl -H "apikey: sb_publishable_UEbY4BlonnynGiN7j4c_rg_S3C1nv7c" \
     "https://omxyeagavmybmyqppudf.supabase.co/rest/v1/projects?select=*"

# Resultado esperado:
# [{"project_id":"550e8400...","name":"INTEGRITY Demo",...}]
```

---

## ❓ Troubleshooting

| Error | Causa | Solución |
|-------|-------|----------|
| "401 Unauthorized" | API Key inválida o expirada | Verifica User Secrets |
| "Connection timeout" | API Key no llegó | Verifica headers en Startup.cs |
| "Table does not exist" | Schema no creado | Ejecuta init-db.sql en Supabase |
| "CORS error" | Origin no configurado | Agrega localhost:5000 en Supabase CORS |

---

## 📚 Documentación Completa

- **SUPABASE_API_KEY_AUTH.md** - Guía detallada (400 líneas)
- **SUPABASE_CLOUD_QUICK.md** - Setup Cloud (5 minutos)
- **.env.example** - Valores de referencia

---

## ✅ Checklist

- [ ] Obtuviste Service Role Key de Supabase dashboard
- [ ] Guardaste en User Secrets: `dotnet user-secrets set "Supabase:ServiceRoleKey" "..."`
- [ ] Ejecutaste API: `dotnet run --environment Supabase.Production`
- [ ] Verificaste Swagger: http://localhost:5000/swagger
- [ ] Probaste endpoint REST
- [ ] No hay errores de conexión

---

**¡Listo!** API conectada a Supabase via API Key ✅

Próximo paso: Implementar autenticación JWT (Authentication Middleware)
