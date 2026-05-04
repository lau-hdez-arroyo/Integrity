# Matriz de Roles y Permisos - Resumen Ejecutivo

## Tabla 1: Acceso a Dashboards (Referencia Rápida)

```
╔════════════════════╦═══════╦═════╦═══════════╦══════════╗
║ Dashboard/Ruta     ║ Admin ║ QA  ║Developer  ║Executive ║
╠════════════════════╬═══════╬═════╬═══════════╬══════════╣
║ /login             ║   ✅  ║ ✅  ║    ✅     ║    ✅    ║
║ /no-projects       ║   ✅  ║ ✅  ║    ✅     ║    ✅    ║
║ /post-login        ║   ✅  ║ ✅  ║    ✅     ║    ✅    ║
╠════════════════════╬═══════╬═════╬═══════════╬══════════╣
║ /dashboard         ║   ✅  ║ ✅  ║    ✅     ║    ✅    ║
║ /project-selection ║   ✅  ║ ✅  ║    ✅     ║    ✅    ║
║ /projects          ║   ✅  ║ ✅  ║    ✅     ║    ✅    ║
╠════════════════════╬═══════╬═════╬═══════════╬══════════╣
║ /admin             ║   ✅  ║ ❌  ║    ❌     ║    ❌    ║
║ /dashboard/qa      ║   ✅  ║ ✅  ║    ❌     ║    ❌    ║
║ /dashboard/dev     ║   ✅  ║ ❌  ║    ✅     ║    ❌    ║
║ /dashboard/exec    ║   ✅  ║ ❌  ║    ❌     ║    ✅    ║
╚════════════════════╩═══════╩═════╩═══════════╩══════════╝
```

## Tabla 2: Funcionalidades por Rol

```
╔═════════════════════════════════════════════════════════════════╦═══════╦═════╦═══════════╦══════════╗
║ Funcionalidad                                                   ║ Admin ║ QA  ║Developer  ║Executive ║
╠═════════════════════════════════════════════════════════════════╬═══════╬═════╬═══════════╬══════════╣
║ ADMINISTRACIÓN                                                  ║       ║     ║           ║          ║
║ ├─ Crear proyecto                                              ║   ✅  ║ ❌  ║    ❌     ║    ❌    ║
║ ├─ Editar proyecto                                             ║   ✅  ║ ❌  ║    ❌     ║    ❌    ║
║ ├─ Eliminar proyecto                                           ║   ✅  ║ ❌  ║    ❌     ║    ❌    ║
║ ├─ Gestionar usuarios                                          ║   ✅  ║ ❌  ║    ❌     ║    ❌    ║
║ ├─ Asignar roles                                               ║   ✅  ║ ❌  ║    ❌     ║    ❌    ║
║ ├─ Ver todos los datos                                         ║   ✅  ║ ❌  ║    ❌     ║    ❌    ║
╠═════════════════════════════════════════════════════════════════╬═══════╬═════╬═══════════╬══════════╣
║ TESTING (QA Dashboard)                                          ║       ║     ║           ║          ║
║ ├─ Ver test executions                                         ║   ✅  ║ ✅  ║    ❌     ║    ❌    ║
║ ├─ Ver test cases                                              ║   ✅  ║ ✅  ║    ❌     ║    ❌    ║
║ ├─ Ver test plans                                              ║   ✅  ║ ✅  ║    ❌     ║    ❌    ║
║ ├─ Ver test coverage                                           ║   ✅  ║ ✅  ║    ❌     ║    ❌    ║
║ ├─ Ver failed tests                                            ║   ✅  ║ ✅  ║    ❌     ║    ❌    ║
║ ├─ Reportes QA                                                 ║   ✅  ║ ✅  ║    ❌     ║    ❌    ║
╠═════════════════════════════════════════════════════════════════╬═══════╬═════╬═══════════╬══════════╣
║ DESARROLLO (Developer Dashboard)                                ║       ║     ║           ║          ║
║ ├─ Ver build status                                            ║   ✅  ║ ❌  ║    ✅     ║    ❌    ║
║ ├─ Ver deployments                                             ║   ✅  ║ ❌  ║    ✅     ║    ❌    ║
║ ├─ Ver errors/logs                                             ║   ✅  ║ ❌  ║    ✅     ║    ❌    ║
║ ├─ Ver code coverage                                           ║   ✅  ║ ❌  ║    ✅     ║    ❌    ║
║ ├─ Ver pipeline status                                         ║   ✅  ║ ❌  ║    ✅     ║    ❌    ║
╠═════════════════════════════════════════════════════════════════╬═══════╬═════╬═══════════╬══════════╣
║ ESTRATEGIA (Executive Dashboard)                                ║       ║     ║           ║          ║
║ ├─ Ver KPIs                                                    ║   ✅  ║ ❌  ║    ❌     ║    ✅    ║
║ ├─ Ver tendencias de calidad                                   ║   ✅  ║ ❌  ║    ❌     ║    ✅    ║
║ ├─ Ver releases                                                ║   ✅  ║ ❌  ║    ❌     ║    ✅    ║
║ ├─ Ver roadmap                                                 ║   ✅  ║ ❌  ║    ❌     ║    ✅    ║
║ ├─ Ver reportes estratégicos                                   ║   ✅  ║ ❌  ║    ❌     ║    ✅    ║
╠═════════════════════════════════════════════════════════════════╬═══════╬═════╬═══════════╬══════════╣
║ GENERAL                                                         ║       ║     ║           ║          ║
║ ├─ Cambiar proyecto (Dropdown)                                 ║   ✅  ║ ✅  ║    ✅     ║    ✅    ║
║ ├─ Cambiar proyecto (Logo click)                               ║   ✅  ║ ✅  ║    ✅     ║    ✅    ║
║ ├─ Cambiar proyecto (Projects stat)                            ║   ✅  ║ ✅  ║    ✅     ║    ✅    ║
║ ├─ Ver Dashboard Principal                                     ║   ✅  ║ ✅  ║    ✅     ║    ✅    ║
║ ├─ Ver lista de proyectos                                      ║   ✅  ║ ✅  ║    ✅     ║    ✅    ║
║ ├─ Logout                                                      ║   ✅  ║ ✅  ║    ✅     ║    ✅    ║
╚═════════════════════════════════════════════════════════════════╩═══════╩═════╩═══════════╩══════════╝

Leyenda:
  ✅ = Permitido / Acceso autorizado
  ❌ = Bloqueado / Acceso denegado
```

## Tabla 3: Flujo de Login por Rol

```
╔═════════════════════╦════════════════════════════════════════════════════════════╗
║ Rol                 ║ Flujo de Login                                             ║
╠═════════════════════╬════════════════════════════════════════════════════════════╣
║ Admin               ║ 1. Login → PostLoginRedirect                               ║
║ (admin@integrity)   ║ 2. Obtiene rol: 'admin'                                    ║
║                     ║ 3. Obtiene proyectos (4 proyectos)                         ║
║                     ║ 4. Si 1 proyecto: Auto-selecciona → /admin               ║
║                     ║ 5. Si N proyectos: /project-selection → /admin           ║
║                     ║                                                            ║
║                     ║ Storage: userRole='admin', selectedProject={...}         ║
╠═════════════════════╬════════════════════════════════════════════════════════════╣
║ QA                  ║ 1. Login → PostLoginRedirect                               ║
║ (qa.tester@...)     ║ 2. Obtiene rol: 'qa'                                       ║
║                     ║ 3. Obtiene proyectos (4 proyectos)                         ║
║                     ║ 4. Si 1 proyecto: Auto-selecciona → /dashboard/qa        ║
║                     ║ 5. Si N proyectos: /project-selection → /dashboard/qa    ║
║                     ║                                                            ║
║                     ║ Storage: userRole='qa', selectedProject={...}            ║
╠═════════════════════╬════════════════════════════════════════════════════════════╣
║ Developer           ║ 1. Login → PostLoginRedirect                               ║
║ (developer@...)     ║ 2. Obtiene rol: 'developer'                                ║
║                     ║ 3. Obtiene proyectos (4 proyectos)                         ║
║                     ║ 4. Si 1 proyecto: Auto-selecciona → /dashboard/dev      ║
║                     ║ 5. Si N proyectos: /project-selection → /dashboard/dev  ║
║                     ║                                                            ║
║                     ║ Storage: userRole='developer', selectedProject={...}     ║
╠═════════════════════╬════════════════════════════════════════════════════════════╣
║ Executive           ║ 1. Login → PostLoginRedirect                               ║
║ (executive@...)     ║ 2. Obtiene rol: 'executive'                                ║
║                     ║ 3. Obtiene proyectos (4 proyectos)                         ║
║                     ║ 4. Si 1 proyecto: Auto-selecciona → /dashboard/exec     ║
║                     ║ 5. Si N proyectos: /project-selection → /dashboard/exec ║
║                     ║                                                            ║
║                     ║ Storage: userRole='executive', selectedProject={...}     ║
╠═════════════════════╬════════════════════════════════════════════════════════════╣
║ Sin Proyectos       ║ 1. Login → PostLoginRedirect                               ║
║                     ║ 2. Obtiene rol (cualquiera)                                ║
║                     ║ 3. Obtiene proyectos (0 proyectos)                         ║
║                     ║ 4. Detecta 0 proyectos → /no-projects                     ║
║                     ║ 5. Muestra: "No Projects Available - Contact Admin"       ║
║                     ║ 6. Opción: Logout                                          ║
║                     ║                                                            ║
║                     ║ Storage: userRole='xxx', selectedProject=null             ║
╚═════════════════════╩════════════════════════════════════════════════════════════╝
```

## Tabla 4: Componentes de Seguridad

```
╔═══════════════════════════════════╦═════════════════════════════════════════════╗
║ Componente                        ║ Responsabilidad                             ║
╠═══════════════════════════════════╬═════════════════════════════════════════════╣
║ RoleProtectedRoute.jsx            ║ • Valida userRole contra allowedRoles      ║
║ (frontend/src/components/)        ║ • Muestra "Access Denied" si no autorizado ║
║                                   ║ • Lee de localStorage.userRole              ║
║                                   ║ • Renderiza componente si autorizado        ║
╠═══════════════════════════════════╬═════════════════════════════════════════════╣
║ AuthContext.jsx                   ║ • Almacena user y userRole en memory       ║
║ (frontend/src/context/)           ║ • Persiste userRole en localStorage         ║
║ ├─ userRole                       ║ • Actualiza al hacer login                  ║
║ ├─ user                           ║ • Limpia al logout                          ║
║ ├─ login()                        ║ • Extrae rol de user_metadata               ║
║ ├─ logout()                       ║                                             ║
║ └─ signup()                       ║                                             ║
╠═══════════════════════════════════╬═════════════════════════════════════════════╣
║ PostLoginRedirect.jsx             ║ • Lógica post-login (handlePostLogin)      ║
║ (frontend/src/pages/)             ║ • Obtiene rol de user_metadata              ║
║ ├─ fetchUserData()                ║ • Obtiene proyectos: GET /users/me/projects║
║ ├─ redirectByRole()               ║ • Determina destino según cantidad         ║
║ └─ handlePostLogin()              ║ • Auto-selecciona si proyecto único         ║
║                                   ║ • Redirige según rol                        ║
╠═══════════════════════════════════╬═════════════════════════════════════════════╣
║ authMiddleware.js                 ║ • Valida JWT en requests al backend        ║
║ (backend/middleware/)             ║ • Extrae user.id del token                  ║
║                                   ║ • Agrega req.user para acceso en rutas      ║
║                                   ║ • Retorna 401 si token inválido             ║
╠═══════════════════════════════════╬═════════════════════════════════════════════╣
║ backend/routes/users.js           ║ • GET /users/me                             ║
║                                   ║ • GET /users/me/projects                    ║
║ ├─ GET /users/me                  ║ • Retorna { id, email, role }               ║
║ └─ GET /users/me/projects         ║ • Filtra por project_members (fallback)    ║
║                                   ║ • Validado con authMiddleware               ║
╠═══════════════════════════════════╬═════════════════════════════════════════════╣
║ Supabase Auth                     ║ • Almacena user_metadata con role           ║
║ (user_metadata.role)              ║ • JWT incluye user_metadata                 ║
║                                   ║ • Roles: admin, qa, developer, executive    ║
║                                   ║ • Verifica credenciales al login            ║
╚═══════════════════════════════════╩═════════════════════════════════════════════╝
```

## Tabla 5: Usuarios de Test

```
╔═────────────────────────────┬──────────────┬───────────────┬────────────╗
║ Email                       │ Contraseña   │ Rol           │ Proyectos  ║
╠════════════════════════════╦════════════════════════════════════════════╣
║ admin@integrity.dev         ║ Admin@2026   ║ admin         ║ Todos (4)  ║
║                             ║              ║ (Todos)       ║            ║
╠═────────────────────────────╬──────────────╬───────────────╬────────────╣
║ qa.tester@integrity.dev     ║ Integrity@26 ║ qa            ║ Todos (4)  ║
║                             ║              ║ (Testing)     ║            ║
╠═────────────────────────────╬──────────────╬───────────────╬────────────╣
║ developer@integrity.dev     ║ Developer@26 ║ developer     ║ Todos (4)  ║
║                             ║              ║ (Development) ║            ║
╠═────────────────────────────╬──────────────╬───────────────╬────────────╣
║ executive@integrity.dev     ║ Executive@26 ║ executive     ║ Todos (4)  ║
║                             ║              ║ (Strategy)    ║            ║
╠═────────────────────────────╬──────────────╬───────────────╬────────────╣
║ laura.hernandez@payflow.com ║ Payflow@2026 ║ qa            ║ 1 (PayFlow)║
║                             ║              ║ (Testing)     ║            ║
╚═────────────────────────────╩──────────────╩───────────────╩────────────╝
```

## Tabla 6: Mensajes de Error por Escenario

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║ Escenario                                │ Mensaje / Respuesta                 ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║ QA intenta acceder a /admin              │ "Access Denied"                     ║
║                                          │ "You don't have permission to       ║
║                                          │  access this page."                 ║
║                                          │ "Your role: QA"                     ║
║                                          │ [Botón: Go Back]                    ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║ Developer intenta acceder a /dashboard/qa│ "Access Denied"                     ║
║                                          │ "You don't have permission to       ║
║                                          │  access this page."                 ║
║                                          │ "Your role: Developer"              ║
║                                          │ [Botón: Go Back]                    ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║ Usuario sin autenticación                │ Redirige a /login                   ║
║ intenta acceder a ruta protegida         ║ Limpia localStorage                 ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║ Usuario sin proyectos asignados          │ Redirige a /no-projects             ║
║                                          │ "No Projects Available"             ║
║                                          │ "Contact admin to assign project"   ║
║                                          │ [Botón: Logout]                     ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║ Token JWT expirado                       │ Redirige a /login                   ║
║ en request al backend                    ║ Error 401: Unauthorized             ║
║                                          │ Limpia localStorage                 ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

## Tabla 7: Métodos de Cambio de Proyecto

```
╔═══════════════════════╦════════════════════════════════════════════════════════╗
║ Método                ║ Cómo Funciona                                          ║
╠═══════════════════════╬════════════════════════════════════════════════════════╣
║ 1. Logo Click         ║ • Click en "INTEGRITY" en top-left                     ║
║ (Menu de proyectos)   ║ • Abre menú con lista de proyectos                     ║
║                       ║ • Selecciona proyecto → localStorage.selectedProject   ║
║                       ║ • Permanece en dashboard actual (no redirige)          ║
║                       ║ • Datos se actualizan con nuevo proyecto               ║
╠═══════════════════════╬════════════════════════════════════════════════════════╣
║ 2. Dropdown Header    ║ • Dropdown "Project Name" en header                    ║
║ (Project Selector)    ║ • Muestra lista de proyectos                           ║
║ ├─ Cuando múltiples   ║ • "Active" badge en proyecto actual                    ║
║ └─ Auto-oculto si 1   ║ • Selecciona proyecto → localStorage.selectedProject   ║
║                       ║ • Permanece en dashboard actual                        ║
║                       ║ • Datos se actualizan con nuevo proyecto               ║
╠═══════════════════════╬════════════════════════════════════════════════════════╣
║ 3. Projects Stat      ║ • Click en card de "Projects" (muestra conteo)        ║
║ (Projects Card)       ║ • Navega a /projects                                   ║
║                       ║ • Muestra todos los proyectos como cards               ║
║                       ║ • Click "Select Project" en card                       ║
║                       ║ • localStorage.selectedProject = proyecto              ║
║                       ║ • Redirige a /dashboard (o rol-específico)            ║
╠═══════════════════════╬════════════════════════════════════════════════════════╣
║ 4. URL Directa        ║ • Usuario navega a /project-selection manualmente      ║
║ (Project Selection)   ║ • Página de selección de proyectos                     ║
║                       ║ • Muestra grid de proyectos disponibles                ║
║                       ║ • Click "Select Project"                               ║
║                       ║ • localStorage.selectedProject = proyecto              ║
║                       ║ • Redirige a /dashboard (o rol-específico)            ║
╚═══════════════════════╩════════════════════════════════════════════════════════╝
```

## Tabla 8: LocalStorage - Data Persistida

```
╔════════════════════════════════════╦═════════════════════════════════════════╗
║ Key                                ║ Valor / Formato                         ║
╠════════════════════════════════════╬═════════════════════════════════════════╣
║ userRole                           ║ 'admin' | 'qa' | 'developer' | ...      ║
║                                    ║ (String)                                ║
║                                    ║ Extraído de: user_metadata.role         ║
║                                    ║ Escenario: Luego de cada login          ║
╠════════════════════════════════════╬═════════════════════════════════════════╣
║ selectedProject                    ║ {                                       ║
║                                    ║   project_id: "uuid-...",               ║
║                                    ║   name: "PayFlow Platform",             ║
║                                    ║   description: "...",                   ║
║                                    ║   repository_url: "...",                ║
║                                    ║   ...                                   ║
║                                    ║ }                                       ║
║                                    ║ (JSON String)                           ║
║                                    ║ Escenario: En /project-selection        ║
╠════════════════════════════════════╬═════════════════════════════════════════╣
║ sb-supabase-auth-token             ║ JWT Token (Supabase automatiza)         ║
║                                    ║ (String - muy largo)                    ║
║                                    ║ Escenario: Login exitoso                ║
║                                    ║ Usado por: axios interceptor (api.js)   ║
╚════════════════════════════════════╩═════════════════════════════════════════╝

Limpieza:
  • Al Logout: Se limpian todos los keys
  • Al acceso denegado: NO se limpian (usuario sigue autenticado)
  • Al token expirado: Se limpian al redirigir a /login
```

## Tabla 9: Endpoints Backend Relevantes

```
╔═════════════════════════════════╦═════════════════════════════════════════════╗
║ Endpoint                        ║ Descripción                                 ║
╠═════════════════════════════════╬═════════════════════════════════════════════╣
║ GET /api/v1/users/me            ║ Obtiene datos del usuario autenticado       ║
║ [Autenticado]                   ║ Retorna: { id, email, role }                ║
║                                 ║ Rol extraído de: user_metadata.role         ║
╠═════════════════════════════════╬═════════════════════════════════════════════╣
║ GET /api/v1/users/me/projects   ║ Obtiene proyectos del usuario               ║
║ [Autenticado]                   ║ Filtra por: project_members.user_id         ║
║                                 ║ Fallback: Todos los proyectos (demo)       ║
║                                 ║ Retorna: Array de proyectos                 ║
╠═════════════════════════════════╬═════════════════════════════════════════════╣
║ GET /api/v1/projects            ║ Obtiene todos los proyectos                 ║
║ [Autenticado]                   ║ Usado por: /projects page                   ║
║                                 ║ No filtrado por usuario (admin puede ver)   ║
╠═════════════════════════════════╬═════════════════════════════════════════════╣
║ GET /api/v1/dashboard/:role/:id ║ Obtiene metrics del dashboard               ║
║ [Autenticado]                   ║ Role: executive, qa, developer              ║
║                                 ║ ID: project_id                              ║
║                                 ║ Datos filtrados por proyecto                ║
╠═════════════════════════════════╬═════════════════════════════════════════════╣
║ POST /api/v1/projects           ║ Crea nuevo proyecto                         ║
║ [Admin]                         ║ Require: { name, description, ... }         ║
║                                 ║ Validación: Solo admin puede crear          ║
╠═════════════════════════════════╬═════════════════════════════════════════════╣
║ POST /api/v1/admin/users        ║ Asigna usuario a proyecto                   ║
║ [Admin]                         ║ Require: { user_id, project_id }            ║
║                                 ║ Crea/actualiza project_members              ║
╚═════════════════════════════════╩═════════════════════════════════════════════╝
```

## Tabla 10: Validaciones de Seguridad

```
╔═════════════════════════════════════════════════════════════════════════════╗
║ VALIDACIÓN                                  │ DÓNDE SE EJECUTA              ║
╠═════════════════════════════════════════════════════════════════════════════╣
║ JWT Token válido                            │ Backend (authMiddleware)      ║
║ • Firma válida                              │ • Todos los endpoints         ║
║ • No expirado                               │ • Antes de procesar request   ║
║ • Extraer user.id                           │                               ║
╠═════════════════════════════════════════════════════════════════════════════╣
║ Rol en allowedRoles                         │ Frontend (RoleProtectedRoute) ║
║ • localStorage.userRole                     │ • Antes de renderizar         ║
║ • Comparar con array de roles permitidos    │ • Componente protected        ║
║ • Si no está: Access Denied                 │                               ║
╠═════════════════════════════════════════════════════════════════════════════╣
║ Autenticación requerida                     │ Frontend (ProtectedRoute)     ║
║ • Token en localStorage                     │ • Antes de renderizar Layout  ║
║ • Supabase session activa                   │ • Redirige a /login si no hay ║
╠═════════════════════════════════════════════════════════════════════════════╣
║ Proyecto asignado al usuario                │ Backend (project_members)     ║
║ • Si 0 proyectos: /no-projects              │ • GET /users/me/projects     ║
║ • Si 1 proyecto: Auto-select                │ • PostLoginRedirect.jsx      ║
║ • Si N proyectos: /project-selection        │                               ║
╠═════════════════════════════════════════════════════════════════════════════╣
║ Datos filtrados por proyecto_id             │ Backend (queries)             ║
║ • WHERE project_id = selectedProject        │ • Dashboard endpoints        ║
║ • test_executions, risk_assessments, etc    │ • Aislamiento de datos       ║
╚═════════════════════════════════════════════════════════════════════════════╝
```
