# Diagrama de Arquitectura de Roles y Permisos

## 1. Flujo de Autenticación y Autorización

```mermaid
sequenceDiagram
    participant U as Usuario
    participant Browser as Browser
    participant Auth as Supabase Auth
    participant Backend as Backend API
    participant DB as Database

    U->>Browser: Ingresa credenciales
    Browser->>Auth: POST /auth/v1/token
    Auth->>DB: Valida credenciales
    DB-->>Auth: ✅ Usuario autenticado
    Auth-->>Browser: JWT + user_metadata (role)
    
    Browser->>Backend: GET /users/me
    Backend->>DB: Obtiene user (rol + metadata)
    DB-->>Backend: User data
    Backend-->>Browser: { role: 'admin' }
    
    Browser->>Browser: localStorage.userRole = 'admin'
    Browser->>Browser: localStorage.selectedProject = project
    Browser->>Browser: PostLoginRedirect → Determina destino
    Browser->>Browser: Redirige a /admin o /dashboard/role
```

## 2. Estructura de Roles y Jerarquía

```mermaid
graph TD
    ROOT["🔒 INTEGRITY - Control de Acceso"]
    
    ROOT --> ROLES["📊 ROLES"]
    ROLES --> ADMIN["👨‍💼 ADMIN<br/>Acceso Total"]
    ROLES --> QA["✅ QA<br/>Testing"]
    ROLES --> DEV["👨‍💻 DEVELOPER<br/>Development"]
    ROLES --> EXEC["📈 EXECUTIVE<br/>Strategy"]
    
    ROOT --> PROTECTED["🔐 RUTAS PROTEGIDAS"]
    PROTECTED --> ADMIN_ROUTE["/admin"]
    PROTECTED --> QA_ROUTE["/dashboard/qa"]
    PROTECTED --> DEV_ROUTE["/dashboard/developer"]
    PROTECTED --> EXEC_ROUTE["/dashboard/executive"]
    
    ROOT --> CHECKS["✔️ VALIDACIONES"]
    CHECKS --> ROLE_CHECK["RoleProtectedRoute"]
    CHECKS --> AUTH_CHECK["AuthContext"]
    CHECKS --> LOGIN_CHECK["PostLoginRedirect"]
    
    ADMIN_ROUTE -.->|allowedRoles| ADMIN
    QA_ROUTE -.->|allowedRoles| QA
    DEV_ROUTE -.->|allowedRoles| DEV
    EXEC_ROUTE -.->|allowedRoles| EXEC
```

## 3. Matriz de Acceso - Todas las Rutas

```mermaid
graph LR
    subgraph ROUTES["📍 RUTAS"]
        ADMIN_R["/admin"]
        DASH["/dashboard"]
        QA_D["/dashboard/qa"]
        DEV_D["/dashboard/developer"]
        EXEC_D["/dashboard/executive"]
        PROJ["/projects"]
        SEL["/project-selection"]
    end
    
    subgraph USERS["👥 USUARIOS"]
        A["Admin"]
        Q["QA"]
        D["Developer"]
        E["Executive"]
    end
    
    A -->|✅| ADMIN_R
    A -->|✅| DASH
    A -->|✅| QA_D
    A -->|✅| DEV_D
    A -->|✅| EXEC_D
    A -->|✅| PROJ
    A -->|✅| SEL
    
    Q -->|❌| ADMIN_R
    Q -->|✅| DASH
    Q -->|✅| QA_D
    Q -->|❌| DEV_D
    Q -->|❌| EXEC_D
    Q -->|✅| PROJ
    Q -->|✅| SEL
    
    D -->|❌| ADMIN_R
    D -->|✅| DASH
    D -->|❌| QA_D
    D -->|✅| DEV_D
    D -->|❌| EXEC_D
    D -->|✅| PROJ
    D -->|✅| SEL
    
    E -->|❌| ADMIN_R
    E -->|✅| DASH
    E -->|❌| QA_D
    E -->|❌| DEV_D
    E -->|✅| EXEC_D
    E -->|✅| PROJ
    E -->|✅| SEL
```

## 4. Flujo Post-Login por Rol

```mermaid
graph TD
    START["🔐 Usuario Autenticado<br/>PostLoginRedirect.jsx"]
    
    START --> GET_ROLE["📋 Obtiene rol de<br/>user_metadata"]
    GET_ROLE --> GET_PROJ["🗂️ Obtiene proyectos<br/>GET /users/me/projects"]
    
    GET_PROJ --> COUNT{¿Cuántos<br/>proyectos?}
    
    COUNT -->|0| NO_PROJ["❌ Sin proyectos"]
    NO_PROJ --> NO_PROJ_PAGE["/no-projects"]
    
    COUNT -->|1| AUTO_SELECT["✅ Auto-selecciona<br/>localStorage.selectedProject"]
    AUTO_SELECT --> ROUTE_ADMIN{¿Rol?}
    
    COUNT -->|2+| MULTI["➕ Múltiples<br/>proyectos"]
    MULTI --> SEL_PROJ["/project-selection"]
    SEL_PROJ --> ROUTE_ADMIN
    
    ROUTE_ADMIN -->|Admin| ADMIN_DASH["/admin"]
    ROUTE_ADMIN -->|QA| QA_DASH["/dashboard/qa"]
    ROUTE_ADMIN -->|Developer| DEV_DASH["/dashboard/developer"]
    ROUTE_ADMIN -->|Executive| EXEC_DASH["/dashboard/executive"]
    
    ADMIN_DASH --> LOADED["✅ Dashboard Cargado"]
    QA_DASH --> LOADED
    DEV_DASH --> LOADED
    EXEC_DASH --> LOADED
```

## 5. Componentes de Seguridad y Flujo

```mermaid
graph TD
    subgraph FRONTEND["🎨 FRONTEND"]
        LOGIN["Login.jsx<br/>Email + Contraseña"]
        AUTH_CTX["AuthContext.jsx<br/>Almacena userRole"]
        POST_LOGIN["PostLoginRedirect.jsx<br/>Lógica de redirección"]
        ROLE_PROTECT["RoleProtectedRoute.jsx<br/>Valida rol"]
        STORAGE["localStorage<br/>userRole, selectedProject"]
    end
    
    subgraph BACKEND["🔧 BACKEND"]
        AUTH_MW["authMiddleware<br/>Valida JWT"]
        USERS_ME["GET /users/me<br/>Retorna rol"]
        PROJECTS["GET /users/me/projects<br/>Filtra por user"]
    end
    
    subgraph SUPABASE["☁️ SUPABASE"]
        SUPABASE_AUTH["Auth.users<br/>+ user_metadata"]
        DB["PostgreSQL<br/>project_members"]
    end
    
    LOGIN -->|Credenciales| SUPABASE_AUTH
    SUPABASE_AUTH -->|JWT + metadata| AUTH_CTX
    AUTH_CTX -->|Almacena rol| STORAGE
    STORAGE -->|Usa rol| POST_LOGIN
    POST_LOGIN -->|Obtiene proyectos| BACKEND
    AUTH_MW -->|Valida JWT| BACKEND
    USERS_ME -->|Lee rol| SUPABASE_AUTH
    PROJECTS -->|Filtra por user| DB
    POST_LOGIN -->|Redirige a dashboard| ROLE_PROTECT
    ROLE_PROTECT -->|Valida allowedRoles| STORAGE
```

## 6. RoleProtectedRoute - Flujo de Validación

```mermaid
graph TD
    START["🔐 RoleProtectedRoute<br/>allowedRoles: ['admin', 'qa']"]
    
    START --> CHECK1{"¿usuario<br/>autenticado?"}
    CHECK1 -->|No| REDIRECT_LOGIN["↪️ Navigate('/login')"]
    CHECK1 -->|Sí| CHECK2{"¿role en<br/>localStorage?"}
    
    CHECK2 -->|No| CHECK3["role = null"]
    CHECK2 -->|Sí| CHECK3
    
    CHECK3 --> CHECK4{"¿role en<br/>allowedRoles?"}
    
    CHECK4 -->|✅ Sí| RENDER["✅ Renderiza<br/>Componente"]
    CHECK4 -->|❌ No| DENY["❌ Access Denied<br/>You don't have<br/>permission"]
    
    RENDER --> SUCCESS["✅ Dashboard<br/>Funcional"]
    DENY --> SHOW_ROLE["Muestra rol actual"]
    SHOW_ROLE --> BACK_BTN["Botón: Go Back"]
    BACK_BTN --> PREV_PAGE["↩️ Vuelve a<br/>página anterior"]
```

## 7. Ciclo de Vida de Sesión

```mermaid
graph LR
    A["👤 Usuario"]
    B["🔐 Login"]
    C["📊 Obtiene rol"]
    D["🎯 PostLoginRedirect"]
    E["📈 Dashboard"]
    F["🔄 Cambio Proyecto"]
    G["🚪 Logout"]
    
    A -->|Ingresa credenciales| B
    B -->|Extrae role de metadata| C
    C -->|Determina destino| D
    D -->|Carga dashboard según rol| E
    E -->|Dropdown/Logo/Click| F
    F -->|Actualiza selectedProject| E
    E -->|Click Logout| G
    G -->|Limpia localStorage| A
    
    style A fill:#e1f5e1
    style B fill:#fff3e0
    style C fill:#e3f2fd
    style D fill:#f3e5f5
    style E fill:#e0f2f1
    style F fill:#fce4ec
    style G fill:#ffebee
```

## 8. Matriz de Permisos por Dashboard

```mermaid
graph TB
    subgraph ADMIN_BOX["👨‍💼 ADMIN DASHBOARD (/admin)"]
        A1["✅ Crear proyectos"]
        A2["✅ Editar proyectos"]
        A3["✅ Eliminar proyectos"]
        A4["✅ Gestionar usuarios"]
        A5["✅ Asignar roles"]
    end
    
    subgraph QA_BOX["✅ QA DASHBOARD (/dashboard/qa)"]
        Q1["✅ Ver test executions"]
        Q2["✅ Ver test cases"]
        Q3["✅ Ver coverage"]
        Q4["✅ Ver failed tests"]
        Q5["❌ Gestionar usuarios"]
    end
    
    subgraph DEV_BOX["👨‍💻 DEVELOPER DASHBOARD (/dashboard/developer)"]
        D1["✅ Ver builds"]
        D2["✅ Ver deployments"]
        D3["✅ Ver errors/logs"]
        D4["✅ Ver coverage"]
        D5["❌ Gestionar usuarios"]
    end
    
    subgraph EXEC_BOX["📈 EXECUTIVE DASHBOARD (/dashboard/executive)"]
        E1["✅ Ver KPIs"]
        E2["✅ Ver tendencias"]
        E3["✅ Ver releases"]
        E4["✅ Ver roadmap"]
        E5["❌ Gestionar usuarios"]
    end
```

## 9. Cambio de Proyecto - 4 Métodos

```mermaid
graph TD
    START["🎯 Cambio de Proyecto"]
    
    START --> M1["1️⃣ Logo Click<br/>Clickear 'INTEGRITY'"]
    START --> M2["2️⃣ Dropdown Header<br/>Dropdown en header"]
    START --> M3["3️⃣ Projects Stat<br/>Click en Projects"]
    START --> M4["4️⃣ URL Directa<br/>/project-selection"]
    
    M1 --> ACTION1["Abre menú<br/>con proyectos"]
    M2 --> ACTION2["Abre lista<br/>de proyectos"]
    M3 --> ACTION3["Navega a<br>/projects"]
    M4 --> ACTION4["Va a selección"]
    
    ACTION1 --> SELECT["👆 Selecciona<br/>proyecto"]
    ACTION2 --> SELECT
    ACTION3 --> SELECT
    ACTION4 --> SELECT
    
    SELECT --> UPDATE["🔄 Actualiza<br/>localStorage.selectedProject"]
    UPDATE --> RELOAD["↪️ Redirige o recarga<br/>dashboard"]
    RELOAD --> SHOW["✅ Muestra datos del<br/>nuevo proyecto"]
    
    style M1 fill:#e3f2fd
    style M2 fill:#f3e5f5
    style M3 fill:#fce4ec
    style M4 fill:#e0f2f1
```

## 10. Aislamiento de Datos por Proyecto

```mermaid
graph TD
    PROJECT_1["🎯 Proyecto 1<br/>PayFlow Platform"]
    PROJECT_2["🎯 Proyecto 2<br/>Mobile Banking"]
    
    PROJECT_1 --> DATA1["📊 Datos Proyecto 1"]
    DATA1 --> TEST1["test_executions"]
    DATA1 --> RISK1["risk_assessments"]
    DATA1 --> HEAT1["heat_maps"]
    
    PROJECT_2 --> DATA2["📊 Datos Proyecto 2"]
    DATA2 --> TEST2["test_executions"]
    DATA2 --> RISK2["risk_assessments"]
    DATA2 --> HEAT2["heat_maps"]
    
    TEST1 --> FILTER1["WHERE project_id = 1"]
    RISK1 --> FILTER1
    HEAT1 --> FILTER1
    
    TEST2 --> FILTER2["WHERE project_id = 2"]
    RISK2 --> FILTER2
    HEAT2 --> FILTER2
    
    FILTER1 --> ISOLATED1["🔒 Datos Aislados<br/>Usuario 1 solo ve proyecto 1"]
    FILTER2 --> ISOLATED2["🔒 Datos Aislados<br/>Usuario 2 solo ve proyecto 2"]
    
    style FILTER1 fill:#ffebee
    style FILTER2 fill:#ffebee
    style ISOLATED1 fill:#e8f5e9
    style ISOLATED2 fill:#e8f5e9
```
