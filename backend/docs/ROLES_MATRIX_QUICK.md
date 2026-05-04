# Matriz de Permisos - Vista Rápida

## Acceso a Dashboards

```
┌─────────────────┬───────┬────┬───────────┬──────────┐
│ Dashboard       │ Admin │ QA │ Developer │Executive │
├─────────────────┼───────┼────┼───────────┼──────────┤
│ /admin          │  ✅   │ ❌ │    ❌     │   ❌     │
│ /dashboard      │  ✅   │ ✅ │    ✅     │   ✅     │
│ /dashboard/qa   │  ✅   │ ✅ │    ❌     │   ❌     │
│ /dashboard/dev  │  ✅   │ ❌ │    ✅     │   ❌     │
│ /dashboard/exec │  ✅   │ ❌ │    ❌     │   ✅     │
│ /projects       │  ✅   │ ✅ │    ✅     │   ✅     │
│ /project-sel    │  ✅   │ ✅ │    ✅     │   ✅     │
└─────────────────┴───────┴────┴───────────┴──────────┘
```

## Funcionalidades por Rol

### Admin
```
┌─────────────────────────────────────────────────┐
│                   ADMIN PANEL                   │
├─────────────────────────────────────────────────┤
│ ✅ Crear proyectos                              │
│ ✅ Editar proyectos                             │
│ ✅ Eliminar proyectos                           │
│ ✅ Gestionar usuarios                           │
│ ✅ Asignar roles                                │
│ ✅ Ver todos los datos                          │
│ ✅ Acceder a todos los dashboards               │
│ ✅ Cambiar proyectos (dropdown + logo click)    │
└─────────────────────────────────────────────────┘
```

### QA
```
┌─────────────────────────────────────────────────┐
│                  QA DASHBOARD                   │
├─────────────────────────────────────────────────┤
│ ✅ Ver test executions                          │
│ ✅ Ver test cases                               │
│ ✅ Ver test plans                               │
│ ✅ Ver test coverage                            │
│ ✅ Ver failed tests                             │
│ ✅ Cambiar proyectos (dropdown + logo click)    │
│ ❌ Gestionar usuarios (bloqueado)               │
│ ❌ Ver admin panel (bloqueado)                  │
└─────────────────────────────────────────────────┘
```

### Developer
```
┌─────────────────────────────────────────────────┐
│              DEVELOPER DASHBOARD                │
├─────────────────────────────────────────────────┤
│ ✅ Ver build status                             │
│ ✅ Ver deployments                              │
│ ✅ Ver errors/logs                              │
│ ✅ Ver code coverage                            │
│ ✅ Ver pipeline status                          │
│ ✅ Cambiar proyectos (dropdown + logo click)    │
│ ❌ Gestionar usuarios (bloqueado)               │
│ ❌ Ver admin panel (bloqueado)                  │
└─────────────────────────────────────────────────┘
```

### Executive
```
┌─────────────────────────────────────────────────┐
│             EXECUTIVE DASHBOARD                 │
├─────────────────────────────────────────────────┤
│ ✅ Ver KPIs principales                         │
│ ✅ Ver tendencias de calidad                    │
│ ✅ Ver releases                                 │
│ ✅ Ver roadmap                                  │
│ ✅ Ver reportes estratégicos                    │
│ ✅ Cambiar proyectos (dropdown + logo click)    │
│ ❌ Gestionar usuarios (bloqueado)               │
│ ❌ Ver admin panel (bloqueado)                  │
└─────────────────────────────────────────────────┘
```

## Flujo de Login y Redirección

```
LOGIN
  │
  ├─→ admin@integrity.dev
  │   └─→ 1 proyecto? → /admin (auto-select)
  │   └─→ N proyectos? → /project-selection → /admin
  │
  ├─→ qa.tester@integrity.dev
  │   └─→ 1 proyecto? → /dashboard/qa (auto-select)
  │   └─→ N proyectos? → /project-selection → /dashboard/qa
  │
  ├─→ developer@integrity.dev
  │   └─→ 1 proyecto? → /dashboard/developer (auto-select)
  │   └─→ N proyectos? → /project-selection → /dashboard/developer
  │
  ├─→ executive@integrity.dev
  │   └─→ 1 proyecto? → /dashboard/executive (auto-select)
  │   └─→ N proyectos? → /project-selection → /dashboard/executive
  │
  └─→ user (0 proyectos)
      └─→ /no-projects (pedir al admin que asigne proyecto)
```

## Cambio de Proyecto - Disponible para Todos

```
Métodos de cambio:
┌────────────────────────────────────────┐
│ 1. Click en logo "INTEGRITY"           │
│    └─→ Abre menú con proyectos         │
│    └─→ Selecciona proyecto             │
│    └─→ Permanece en mismo dashboard    │
│                                        │
│ 2. Dropdown "Project Name" en header   │
│    └─→ Abre lista de proyectos         │
│    └─→ Selecciona proyecto             │
│    └─→ Permanece en mismo dashboard    │
│                                        │
│ 3. Click en "Projects" stat            │
│    └─→ Va a /projects                  │
│    └─→ Muestra todos los proyectos     │
│    └─→ Selecciona proyecto             │
│    └─→ Redirige al dashboard           │
│                                        │
│ 4. URL directa                         │
│    └─→ Navega a /project-selection     │
│    └─→ Selecciona proyecto             │
│    └─→ Redirige al dashboard           │
└────────────────────────────────────────┘
```

## Restricciones de Acceso (Access Denied)

```
Intento de Acceso No Autorizado:

QA intenta → /admin
  └─→ RoleProtectedRoute bloquea
  └─→ Muestra "Access Denied"
  └─→ Rol mostrado: QA

Developer intenta → /dashboard/qa
  └─→ RoleProtectedRoute bloquea
  └─→ Muestra "Access Denied"
  └─→ Rol mostrado: Developer

Executive intenta → /admin
  └─→ RoleProtectedRoute bloquea
  └─→ Muestra "Access Denied"
  └─→ Rol mostrado: Executive

Nota: Admin puede acceder a TODO
```

## Flujo de Verificación de Roles

```
Frontend:
┌────────────────────────────────────────┐
│ 1. localStorage.userRole               │
│    └─→ Obtenido después del login      │
│    └─→ Extraído de user_metadata       │
│                                        │
│ 2. RoleProtectedRoute.jsx              │
│    └─→ Compara userRole con allowedRoles
│    └─→ Si NO está permitido:           │
│        └─→ Muestra Access Denied       │
│        └─→ No carga componente         │
│                                        │
│ 3. AuthContext.jsx                     │
│    └─→ Almacena y provee userRole      │
│    └─→ Disponible en toda la app       │
└────────────────────────────────────────┘

Backend:
┌────────────────────────────────────────┐
│ 1. authMiddleware                      │
│    └─→ Valida JWT token                │
│    └─→ Extrae user.id del token        │
│                                        │
│ 2. GET /api/v1/users/me                │
│    └─→ Retorna user con rol            │
│    └─→ Rol desde user_metadata         │
│                                        │
│ 3. GET /api/v1/users/me/projects       │
│    └─→ Filtra por project_members      │
│    └─→ Retorna solo proyectos del user │
└────────────────────────────────────────┘
```

## Tabla de Usuarios de Test

```
┌───────────────────────────────┬──────────────┬───────────────┐
│ Email                         │ Contraseña   │ Rol           │
├───────────────────────────────┼──────────────┼───────────────┤
│ admin@integrity.dev           │ Admin@2026   │ Admin         │
│ qa.tester@integrity.dev       │ Integrity@26 │ QA            │
│ developer@integrity.dev       │ Developer@26 │ Developer     │
│ executive@integrity.dev       │ Executive@26 │ Executive     │
│ laura.hernandez@payflow.com   │ Payflow@26   │ QA            │
└───────────────────────────────┴──────────────┴───────────────┘
```

## Protecciones Implementadas

```
✅ RoleProtectedRoute
   - Valida rol antes de renderizar
   - Muestra Access Denied si no autorizado

✅ AuthContext
   - Almacena userRole en memory y localStorage
   - Disponible globalmente

✅ PostLoginRedirect
   - Determina destino según rol y proyectos
   - Auto-selecciona proyecto si hay 1

✅ Backend Validation
   - Valida rol en JWT
   - Filtra datos por proyecto_members

✅ CORS Dinámico
   - Acepta cualquier puerto localhost
   - Desarrollo flexible

✅ Error Handling
   - Access Denied con información de rol
   - No-projects page para usuarios sin asignación
   - Logout automático en tokens expirados
```

## Estadísticas de Implementación

```
Roles Implementados:     4 (Admin, QA, Developer, Executive)
Rutas Protegidas:        7 (/admin, /dashboard/*)
Componentes de Seguridad: 4 (RoleProtectedRoute, AuthContext, 
                             PostLoginRedirect, authMiddleware)
Usuarios de Test:        5 (1 admin, 4 con diferentes roles)
Métodos de Cambio:       4 (Logo, Dropdown, Projects stat, URL)
Proyectos de Demo:       4 (PayFlow, Banking, Gateway, INTEGRITY)
```

## Próximas Fases

```
FASE 2: Permisos Granulares
  □ Permisos por acción específica
  □ Roles personalizados por proyecto
  □ Validación en backend de cada endpoint

FASE 3: Auditoría y Monitoreo
  □ Logging de acceso
  □ Historial de cambios
  □ Alertas de acceso denegado

FASE 4: Integraciones
  □ SSO / OAuth
  □ LDAP / Active Directory
  □ Autenticación multifactor (MFA)
```
