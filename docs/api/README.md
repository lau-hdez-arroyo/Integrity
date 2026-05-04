# API - Referencia de Endpoints

Esta carpeta contiene la **documentación de API endpoints** de INTEGRITY.

## 📄 Documentos

### [API_REFERENCE.md](./API_REFERENCE.md)
Referencia completa de todos los endpoints:
- **Health Check** - Verificación del servidor
- **Users** - User profile y projects
- **Projects** - CRUD de proyectos
- **Dashboard** - Metrics por rol (QA, Developer, Executive)
- **Test Selection** - Test execution management
- **Risk Assessment** - Risk management
- **Heat Maps** - Failure analysis
- **Admin** - Administrative operations

---

## 🚀 Guía Rápida de Endpoints

### Autenticación
```
POST   /auth/login          - Login con email/password
POST   /auth/signup         - Crear nuevo usuario
POST   /auth/logout         - Logout
POST   /auth/refresh        - Refresh JWT token
```

### Usuarios
```
GET    /api/v1/users/me              - Get perfil del usuario
GET    /api/v1/users/me/projects     - Get proyectos asignados
```

### Proyectos
```
GET    /api/v1/projects              - Listar proyectos
POST   /api/v1/projects              - Crear proyecto
PUT    /api/v1/projects/{id}         - Actualizar proyecto
DELETE /api/v1/projects/{id}         - Eliminar proyecto
GET    /api/v1/projects/{id}/members - Listar miembros
POST   /api/v1/projects/{id}/members - Asignar miembro
```

### Dashboards
```
GET    /api/v1/dashboard/qa/{project_id}         - QA metrics
GET    /api/v1/dashboard/developer/{project_id}  - Developer metrics
GET    /api/v1/dashboard/executive/{project_id}  - Executive metrics
```

### Test Execution
```
GET    /api/v1/test-selection/{project_id}                    - Listar tests
POST   /api/v1/test-selection/{project_id}/execute            - Ejecutar tests
GET    /api/v1/test-selection/{project_id}/results/{exec_id}  - Ver resultados
```

### Risk Assessment
```
GET    /api/v1/risk-assessment/{project_id}              - Listar riesgos
POST   /api/v1/risk-assessment/{project_id}              - Crear riesgo
PUT    /api/v1/risk-assessment/{project_id}/{id}         - Actualizar riesgo
GET    /api/v1/risk-assessment/{project_id}/register     - Registro de riesgos
```

### Heat Maps
```
GET    /api/v1/heatmaps/{project_id}  - Heat map por proyecto
```

---

## 📊 Estructura de Respuestas

### Éxito (200-201)
```json
{
  "status": "success",
  "data": { /* payload */ },
  "message": "Operation completed"
}
```

### Error (4xx-5xx)
```json
{
  "status": "error",
  "message": "Error description",
  "statusCode": 400,
  "details": { /* additional info */ }
}
```

---

## 🔐 Autenticación

Todos los endpoints (excepto `/health` y `/auth/login`) requieren:

```
Authorization: Bearer <JWT_TOKEN>
```

El JWT token es obtenido en el login y debe ser incluido en el header de todas las solicitudes.

---

## 📈 Rate Limiting

- **Límite Default:** 100 requests/minuto por usuario
- **Endpoints críticos:** 10 requests/minuto
- **Header Response:** `X-RateLimit-Remaining`

---

## ⚠️ Códigos de Error Comunes

| Código | Significado | Solución |
|--------|------------|----------|
| 400 | Bad Request | Revisa los parámetros |
| 401 | Unauthorized | Incluye JWT token válido |
| 403 | Forbidden | No tienes permisos para esta acción |
| 404 | Not Found | El recurso no existe |
| 500 | Server Error | Problema en el servidor, contacta soporte |

---

## 🔗 Integración con Frontend

El frontend usa Axios con interceptor que:
1. Adjunta JWT token automáticamente
2. Maneja refresh de token
3. Redirige a login si token expira

```javascript
import { api } from '@/services/api';

// GET request
const response = await api.get('/users/me');

// POST request
const response = await api.post('/projects', { name: 'Nuevo Proyecto' });
```

---

## 🧪 Testing de Endpoints

Usa **Postman**, **Insomnia** o **cURL**:

```bash
# Health check
curl http://localhost:5000/health

# Get user profile (requiere JWT)
curl -H "Authorization: Bearer $JWT_TOKEN" \
     http://localhost:5000/api/v1/users/me
```

---

## 📝 Versionado de API

**Versión Actual:** v1  
**Base URL:** http://localhost:5000/api/v1

### Planes Futuros
- v2: Graphql support
- v3: Webhooks integration

---

## 📞 Soporte

- Documentación: Consulta [../requirements/REQUIREMENTS.md](../requirements/REQUIREMENTS.md)
- Issues: Abre issue en GitHub
- Questions: Pregunta en el equipo
