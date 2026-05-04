# INTEGRITY - Matriz de Roles y Permisos

## Resumen de Roles

| Rol | Descripción | Dashboards Permitidos | Funcionalidades Clave |
|-----|-------------|----------------------|----------------------|
| **Admin** | Administrador del sistema | Admin Panel, Executive, QA, Developer, Dashboard Principal | Gestión de proyectos, usuarios, configuración del sistema |
| **QA** | Aseguramiento de Calidad | QA Dashboard, Dashboard Principal | Ejecución de tests, reportes QA, selección de tests |
| **Developer** | Desarrollador | Developer Dashboard, Dashboard Principal | Métricas de desarrollo, builds, deployments |
| **Executive** | Ejecutivo/Dirección | Executive Dashboard, Dashboard Principal | KPIs, tendencias, reportes estratégicos |

---

## Matriz Detallada de Permisos

### 1. **ADMIN** (Administrador del Sistema)

#### Acceso a Rutas
| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/login` | ✅ | Página de login |
| `/post-login` | ✅ | Redirect post-login |
| `/project-selection` | ✅ | Selección de proyecto (si múltiples) |
| `/dashboard` | ✅ | Dashboard principal |
| `/admin` | ✅ | Panel de administración |
| `/dashboard/qa` | ✅ | Dashboard QA |
| `/dashboard/developer` | ✅ | Dashboard Developer |
| `/dashboard/executive` | ✅ | Dashboard Executive |
| `/projects` | ✅ | Listado de proyectos |

#### Funcionalidades en Admin Panel
```
Projects Tab:
  ✅ Ver todos los proyectos
  ✅ Crear nuevo proyecto
  ✅ Editar proyecto
  ✅ Eliminar proyecto
  ✅ Ver detalles del proyecto

Members Tab:
  ✅ Ver miembros del proyecto
  ✅ Asignar usuario a proyecto
  ✅ Remover usuario del proyecto
  ✅ Cambiar rol del usuario en proyecto
```

#### Post-Login Behavior
```
Si tiene 1 proyecto:
  → Auto-selecciona proyecto
  → Redirige a /admin

Si tiene múltiples proyectos:
  → Redirige a /project-selection
  → Debe seleccionar proyecto
  → Redirige a /admin
```

#### Cambio de Proyecto
```
✅ Via dropdown en header
✅ Via click en logo INTEGRITY
✅ Via Projects stat en dashboard
```

---

### 2. **QA** (Quality Assurance)

#### Acceso a Rutas
| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/login` | ✅ | Página de login |
| `/post-login` | ✅ | Redirect post-login |
| `/project-selection` | ✅ | Selección de proyecto (si múltiples) |
| `/dashboard` | ✅ | Dashboard principal |
| `/admin` | ❌ | Bloqueado - Access Denied |
| `/dashboard/qa` | ✅ | Dashboard QA |
| `/dashboard/developer` | ❌ | Bloqueado - Access Denied |
| `/dashboard/executive` | ❌ | Bloqueado - Access Denied |
| `/projects` | ✅ | Listado de proyectos |

#### Funcionalidades Disponibles
```
QA Dashboard:
  ✅ Ver test executions
  ✅ Ver test cases
  ✅ Ver test plans
  ✅ Ver quality metrics
  ✅ Ver failed tests
  ✅ Ver test coverage

Cambio de Proyecto:
  ✅ Ver proyectos disponibles
  ✅ Cambiar entre proyectos asignados
  ✅ Ver datos específicos por proyecto
```

#### Post-Login Behavior
```
Si tiene 1 proyecto:
  → Auto-selecciona proyecto
  → Redirige a /dashboard/qa

Si tiene múltiples proyectos:
  → Redirige a /project-selection
  → Debe seleccionar proyecto
  → Redirige a /dashboard/qa
```

#### Restricciones de Acceso
```
❌ No puede acceder a /admin
❌ No puede ver Developer Dashboard
❌ No puede ver Executive Dashboard
❌ No puede gestionar usuarios
❌ No puede modificar proyectos
```

---

### 3. **DEVELOPER** (Desarrollador)

#### Acceso a Rutas
| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/login` | ✅ | Página de login |
| `/post-login` | ✅ | Redirect post-login |
| `/project-selection` | ✅ | Selección de proyecto (si múltiples) |
| `/dashboard` | ✅ | Dashboard principal |
| `/admin` | ❌ | Bloqueado - Access Denied |
| `/dashboard/qa` | ❌ | Bloqueado - Access Denied |
| `/dashboard/developer` | ✅ | Dashboard Developer |
| `/dashboard/executive` | ❌ | Bloqueado - Access Denied |
| `/projects` | ✅ | Listado de proyectos |

#### Funcionalidades Disponibles
```
Developer Dashboard:
  ✅ Ver build status
  ✅ Ver deployments
  ✅ Ver errors/logs
  ✅ Ver code coverage
  ✅ Ver pipeline status
  ✅ Ver development metrics

Cambio de Proyecto:
  ✅ Ver proyectos disponibles
  ✅ Cambiar entre proyectos asignados
  ✅ Ver datos específicos por proyecto
```

#### Post-Login Behavior
```
Si tiene 1 proyecto:
  → Auto-selecciona proyecto
  → Redirige a /dashboard/developer

Si tiene múltiples proyectos:
  → Redirige a /project-selection
  → Debe seleccionar proyecto
  → Redirige a /dashboard/developer
```

#### Restricciones de Acceso
```
❌ No puede acceder a /admin
❌ No puede ver QA Dashboard
❌ No puede ver Executive Dashboard
❌ No puede gestionar usuarios
❌ No puede modificar proyectos
```

---

### 4. **EXECUTIVE** (Ejecutivo/Dirección)

#### Acceso a Rutas
| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/login` | ✅ | Página de login |
| `/post-login` | ✅ | Redirect post-login |
| `/project-selection` | ✅ | Selección de proyecto (si múltiples) |
| `/dashboard` | ✅ | Dashboard principal |
| `/admin` | ❌ | Bloqueado - Access Denied |
| `/dashboard/qa` | ❌ | Bloqueado - Access Denied |
| `/dashboard/developer` | ❌ | Bloqueado - Access Denied |
| `/dashboard/executive` | ✅ | Dashboard Executive |
| `/projects` | ✅ | Listado de proyectos |

#### Funcionalidades Disponibles
```
Executive Dashboard:
  ✅ Ver KPIs principales
  ✅ Ver tendencias de calidad
  ✅ Ver releases
  ✅ Ver roadmap
  ✅ Ver reportes estratégicos
  ✅ Ver métricas de riesgo

Cambio de Proyecto:
  ✅ Ver proyectos disponibles
  ✅ Cambiar entre proyectos asignados
  ✅ Ver datos específicos por proyecto
```

#### Post-Login Behavior
```
Si tiene 1 proyecto:
  → Auto-selecciona proyecto
  → Redirige a /dashboard/executive

Si tiene múltiples proyectos:
  → Redirige a /project-selection
  → Debe seleccionar proyecto
  → Redirige a /dashboard/executive
```

#### Restricciones de Acceso
```
❌ No puede acceder a /admin
❌ No puede ver QA Dashboard
❌ No puede ver Developer Dashboard
❌ No puede gestionar usuarios
❌ No puede modificar proyectos
```

---

## Matriz de Control de Acceso (ACL)

### Por Ruta Protegida

```
/admin
  ✅ Admin (allowedRoles: ['admin'])
  ❌ QA (Access Denied)
  ❌ Developer (Access Denied)
  ❌ Executive (Access Denied)

/dashboard/qa
  ✅ Admin (allowedRoles: ['admin', 'qa'])
  ✅ QA (allowedRoles: ['admin', 'qa'])
  ❌ Developer (Access Denied)
  ❌ Executive (Access Denied)

/dashboard/developer
  ✅ Admin (allowedRoles: ['admin', 'developer'])
  ❌ QA (Access Denied)
  ✅ Developer (allowedRoles: ['admin', 'developer'])
  ❌ Executive (Access Denied)

/dashboard/executive
  ✅ Admin (allowedRoles: ['admin', 'executive'])
  ❌ QA (Access Denied)
  ❌ Developer (Access Denied)
  ✅ Executive (allowedRoles: ['admin', 'executive'])

/dashboard (Dashboard Principal)
  ✅ Admin (Sin restricción - ProtectedRoute)
  ✅ QA (Sin restricción - ProtectedRoute)
  ✅ Developer (Sin restricción - ProtectedRoute)
  ✅ Executive (Sin restricción - ProtectedRoute)

/project-selection
  ✅ Admin (Sin restricción - ProtectedRoute)
  ✅ QA (Sin restricción - ProtectedRoute)
  ✅ Developer (Sin restricción - ProtectedRoute)
  ✅ Executive (Sin restricción - ProtectedRoute)

/no-projects
  ✅ Cualquier usuario autenticado sin proyectos
  ❌ Redirige a login si no autenticado
```

---

## Flujo de Autenticación por Rol

### **Admin Flow**
```
1. Login (admin@integrity.dev)
   ↓
2. PostLoginRedirect (Valida proyectos)
   ↓
3. ¿Múltiples proyectos?
   SÍ → /project-selection → Selecciona proyecto → /admin
   NO → /admin (auto-select)
   ↓
4. Admin Panel Cargado
   - Puede gestionar proyectos
   - Puede gestionar usuarios
   - Puede acceder a todos los dashboards
```

### **QA Flow**
```
1. Login (qa.tester@integrity.dev)
   ↓
2. PostLoginRedirect (Valida proyectos)
   ↓
3. ¿Múltiples proyectos?
   SÍ → /project-selection → Selecciona proyecto → /dashboard/qa
   NO → /dashboard/qa (auto-select)
   ↓
4. QA Dashboard Cargado
   - Solo ve datos de testing
   - Puede cambiar proyecto vía dropdown
   - Acceso a Admin bloqueado
```

### **Developer Flow**
```
1. Login (developer@integrity.dev)
   ↓
2. PostLoginRedirect (Valida proyectos)
   ↓
3. ¿Múltiples proyectos?
   SÍ → /project-selection → Selecciona proyecto → /dashboard/developer
   NO → /dashboard/developer (auto-select)
   ↓
4. Developer Dashboard Cargado
   - Solo ve datos de desarrollo
   - Puede cambiar proyecto vía dropdown
   - Acceso a Admin bloqueado
```

### **Executive Flow**
```
1. Login (executive@integrity.dev)
   ↓
2. PostLoginRedirect (Valida proyectos)
   ↓
3. ¿Múltiples proyectos?
   SÍ → /project-selection → Selecciona proyecto → /dashboard/executive
   NO → /dashboard/executive (auto-select)
   ↓
4. Executive Dashboard Cargado
   - Solo ve KPIs y reportes
   - Puede cambiar proyecto vía dropdown
   - Acceso a Admin bloqueado
```

---

## Componentes de Seguridad Implementados

### 1. **RoleProtectedRoute** (`frontend/src/components/RoleProtectedRoute.jsx`)
```jsx
// Protege rutas verificando localStorage.userRole
<RoleProtectedRoute allowedRoles={['admin', 'qa']}>
  <QADashboard />
</RoleProtectedRoute>

// Si rol no está permitido:
// → Muestra "Access Denied - You do not have permission"
// → Bloquea acceso a la ruta
```

### 2. **AuthContext** (`frontend/src/context/AuthContext.jsx`)
```jsx
// Almacena userRole después del login
// Extrae de user_metadata.role en Supabase Auth
// Persiste en localStorage
```

### 3. **PostLoginRedirect** (`frontend/src/pages/PostLoginRedirect.jsx`)
```jsx
// Lógica post-login:
// 1. Obtiene rol del usuario
// 2. Obtiene proyectos asignados
// 3. Decide destino basado en:
//    - Cantidad de proyectos (1 vs múltiples)
//    - Rol del usuario (admin → /admin, qa → /qa, etc.)
```

### 4. **Backend Validation** (`backend/routes/users.js`)
```js
// GET /api/v1/users/me
// → Retorna user.id, email, rol desde user_metadata

// GET /api/v1/users/me/projects
// → Filtra proyectos por usuario (project_members table)
// → Fallback: retorna todos si sin asignación explícita (demo)
```

---

## Datos Protegidos por Proyecto

Cada proyecto tiene datos aislados:

```
/projects/{projectId}/
  ├── test_executions (filtrados por project_id)
  ├── risk_assessments (filtrados por project_id)
  ├── heat_maps (filtrados por project_id)
  ├── test_cases (filtrados por project_id)
  └── project_members (asignaciones de usuario)
```

### Filtrado de Datos por Rol

```
Admin:
  ✅ Ve todos los datos de todos los proyectos
  
QA:
  ✅ Ve test_executions, test_cases, test_plans
  ❌ No ve datos de developer
  ❌ No ve datos de executive
  
Developer:
  ✅ Ve build_status, deployments, errors
  ❌ No ve datos de QA
  ❌ No ve datos de executive
  
Executive:
  ✅ Ve KPIs, tendencias, releases
  ❌ No ve detalles técnicos de QA/Developer
  ❌ No ve logs o errores específicos
```

---

## Usuarios de Test Creados

| Email | Contraseña | Rol | Proyectos |
|-------|------------|-----|-----------|
| `admin@integrity.dev` | `Admin@2026` | admin | Todos (4) |
| `qa.tester@integrity.dev` | `Integrity@2026` | qa | Todos (4) |
| `developer@integrity.dev` | `Developer@2026` | developer | Todos (4) |
| `executive@integrity.dev` | `Executive@2026` | executive | Todos (4) |
| `laura.hernandez@payflow.com` | `Payflow@2026` | qa | PayFlow Platform |

---

## Manejo de Errores de Acceso

### Acceso Denegado (Access Denied)
```
Cuándo ocurre:
  - Usuario intenta acceder a ruta protegida sin rol autorizado
  - Ej: QA intentando acceder a /admin

Respuesta:
  - Página muestra: "Access Denied"
  - Mensaje: "You don't have permission to access this page. Your role: QA"
  - Botón: "Go Back"
  - Usuario permanece en aplicación (no redirige a login)
```

### Sin Proyectos Asignados
```
Cuándo ocurre:
  - Usuario sin project_members registros
  - PostLoginRedirect detecta 0 proyectos

Respuesta:
  - Redirige a /no-projects
  - Página muestra: "No Projects Available"
  - Opción: Logout
  - Mensaje: "Contact administrator to assign a project"
```

### Sesión Expirada
```
Cuándo ocurre:
  - Token JWT inválido o expirado
  - Usuario intenta acceder sin autenticarse

Respuesta:
  - Redirige a /login
  - Mensaje de error (si aplica)
  - Limpia localStorage (token, role, project)
```

---

## Roadmap Futuro de Permisos

### Permisos Granulares (Próxima Fase)
```
[ ] Permisos a nivel de recurso
    - Ej: Admin puede leer, escribir, eliminar
    - Ej: QA solo puede leer y comentar
    
[ ] Permisos dinámicos por proyecto
    - Roles diferentes por proyecto
    - Ej: Admin en PayFlow, QA en Mobile Banking
    
[ ] Permisos por acción
    - Ej: Crear proyecto, editar usuario, ver reportes
    
[ ] Permisos temporales
    - Ej: Acceso de 30 días a proyecto específico
    
[ ] Auditoria de acceso
    - Registra quién accede a qué, cuándo
    - Alert si acceso denegado repetido
```

---

## Resumen de Implementación

✅ **Completado:**
- Roles básicos (Admin, QA, Developer, Executive)
- RoleProtectedRoute con control de acceso
- PostLoginRedirect con lógica de redirección
- AuthContext con almacenamiento de rol
- Backend validation de roles
- Aislamiento de datos por proyecto
- Usuarios de test con roles asignados
- Flujo de autenticación completo

🔄 **En Progreso:**
- Mejora del manejo de project_members
- Optimización de filtros de datos

⏳ **Futuro:**
- Dashboard de auditoría
- Permisos granulares dinámicos
- Roles personalizados por proyecto
- Integración con SSO/OAuth
