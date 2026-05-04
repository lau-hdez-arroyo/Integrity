# INTEGRITY - Documento de Requerimientos
**Versión:** 1.0  
**Fecha:** Mayo 4, 2026  
**Autor:** Lau Hernández  
**Estado:** Baseline (POST-LOGIN AUTH SYSTEM)

---

## 1. VISIÓN GENERAL

**INTEGRITY** es un **Ecosistema Autónomo de Inteligencia en Calidad (Autonomous Quality Intelligence Ecosystem)** diseñado para transformar el testing de software de un proceso reactivo y manual-centric a uno proactivo, inteligente y altamente automatizado.

### 1.1 Propósito
- Cerrar la brecha entre la calidad medida en laboratorio y el comportamiento real del usuario en producción
- Reducir el tiempo de feedback de 4-6 horas a 12-15 minutos
- Disminuir la tasa de bugs escapados de ~5.5% a < 0.7%
- Reclamar el 35% de capacidad ingenieril actualmente gastada en mantenimiento de scripts de testing

### 1.2 Pilares Tecnológicos
1. **Pillar I: Observability-Driven Intelligence** - Análisis de telemetría en tiempo real
2. **Pillar II: Predictive Impact Analytics** - Motor LLM de impacto de cambios de código
3. **Pillar III: Autonomous Resilience** - Chaos Engineering e inyección de fallos controlados

---

## 2. REQUERIMIENTOS FUNCIONALES

### 2.1 MÓDULO DE AUTENTICACIÓN & AUTORIZACIÓN ✅ (IMPLEMENTADO)

#### 2.1.1 Sistema de Autenticación
- [x] Login con email/contraseña via Supabase Auth
- [x] Signup de nuevos usuarios con validación
- [x] JWT tokens con auto-refresh
- [x] Logout con limpieza de sesión
- [x] Recuperación de contraseña (TODO: UI)

#### 2.1.2 Sistema de Roles y Permisos
**Roles Definidos:**
- [x] **Admin** - Control total del sistema
- [x] **QA** - Testing y aseguramiento de calidad
- [x] **Developer** - Métricas y control de development
- [x] **Executive** - Reportes estratégicos y KPIs

#### 2.1.3 Control de Acceso Basado en Roles (RBAC)
- [x] Matriz de permisos por rol
- [x] Protección de rutas con RoleProtectedRoute
- [x] Almacenamiento de rol en user_metadata de Supabase
- [x] Fallback UI "Access Denied" para usuarios no autorizados
- [x] Validación en backend con JWT claims

#### 2.1.4 Post-Login Redirect Flow
- [x] Detección automática de proyectos asignados al usuario
- [x] Si 0 proyectos → /no-projects (mostrar mensaje)
- [x] Si 1 proyecto → auto-seleccionar y redirigir a dashboard por rol
- [x] Si N proyectos → /project-selection para que usuario elija

### 2.2 MÓDULO DE PROYECTOS ✅ (IMPLEMENTADO - PARCIAL)

#### 2.2.1 Gestión de Proyectos
- [x] Crear proyecto (Admin Panel)
- [x] Ver lista de proyectos
- [x] Editar detalles del proyecto
- [x] Eliminar proyecto (soft-delete)
- [x] Asignación de proyecto a usuarios (project_members)

#### 2.2.2 Multi-Project Context
- [x] Context React para selectedProject
- [x] Persistencia en localStorage
- [x] ProjectDropdown para switcheo rápido
- [x] Sincronización de proyecto en todas las pages
- [x] Dropdown solo visible si múltiples proyectos
- [x] 4 métodos de cambio de proyecto:
  1. Dropdown en header
  2. Click en logo INTEGRITY
  3. Click en stat card de Projects
  4. URL directa con project_id

#### 2.2.3 Aislamiento de Datos por Proyecto
- [x] Cada usuario solo ve sus proyectos asignados
- [x] Test executions filtradas por project_id
- [x] Risk assessments por proyecto
- [x] Heat maps por proyecto
- [x] Backend queries filtran por project_id

### 2.3 MÓDULO DE DASHBOARDS ✅ (IMPLEMENTADO)

#### 2.3.1 Dashboard Principal (Todos los roles)
- [x] Información general del proyecto seleccionado
- [x] Stats cards: Tests, Projects, Pass Rate, Health Score
- [x] Quick navigation buttons por rol
- [x] Project info header

#### 2.3.2 QA Dashboard
**Métricas Mostradas:**
- [x] Total de test executions
- [x] Test pass/fail rate
- [x] Execution status distribution (passed, failed, skipped)
- [x] Test execution trend chart
- [x] Heat map de failures por componente
- [x] Last execution date

**Funcionalidades:**
- [ ] Matriz de Roles y Permisos (NUEVO - usuario solicitó)
- [ ] Test execution details view
- [ ] Filter por date range
- [ ] Export de reportes QA

#### 2.3.3 Developer Dashboard
**Métricas Mostradas:**
- [x] Build statistics
- [x] Deployment history
- [x] Code quality metrics
- [x] Performance trends
- [x] Error rate por componente

**Funcionalidades:**
- [ ] Integration con CI/CD pipeline
- [ ] Logs visualization
- [ ] Performance profiling

#### 2.3.4 Executive Dashboard
**Métricas Mostradas:**
- [x] Software Integrity Score (aggregated)
- [x] Overall project health
- [x] Risk assessment summary
- [x] Key performance indicators (KPIs)
- [x] Trend analysis

**Funcionalidades:**
- [ ] Strategic recommendations
- [ ] Predictive analytics
- [ ] ROI calculations

#### 2.3.5 Admin Panel
- [x] Gestión de proyectos
- [x] Gestión de miembros del proyecto
- [x] Asignación de roles
- [x] Vista de usuarios y permisos

### 2.4 MÓDULO DE TEST EXECUTION ⏳ (PARCIALMENTE IMPLEMENTADO)

#### 2.4.1 Test Selection & Execution
- [x] API para obtener tests disponibles
- [x] Endpoint para marcar test como ejecutado
- [x] Storage de test_executions en BD
- [ ] UI para seleccionar y ejecutar tests
- [ ] Real-time test execution tracking
- [ ] Test result capture (pass/fail/error)

#### 2.4.2 Test Execution Data Model
```sql
test_executions (
  id UUID,
  project_id UUID (FK projects),
  test_name TEXT,
  status ENUM (passed, failed, skipped, error),
  duration_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### 2.5 MÓDULO DE RISK ASSESSMENT ⏳ (PARCIALMENTE IMPLEMENTADO)

#### 2.5.1 Risk Assessment & Scoring
- [x] Storage de risk assessments en BD
- [ ] UI para crear/editar risk assessments
- [ ] Automatic risk scoring based on metrics
- [ ] Risk heatmap visualization
- [ ] Risk register con timeline

#### 2.5.2 Risk Assessment Data Model
```sql
risk_assessments (
  id UUID,
  project_id UUID (FK projects),
  risk_name TEXT,
  severity ENUM (low, medium, high, critical),
  likelihood ENUM (low, medium, high, critical),
  impact INTEGER (1-10),
  mitigation_plan TEXT,
  status ENUM (open, mitigating, resolved),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### 2.6 MÓDULO DE HEAT MAPS ✅ (IMPLEMENTADO - BÁSICO)

#### 2.6.1 Failure Heatmaps
- [x] Visualización de heat map por componente
- [x] Color coding: Red (high failures) → Green (no failures)
- [x] Data aggregation por módulo/componente
- [ ] Drill-down para ver detalles específicos
- [ ] Time-series heatmaps

#### 2.6.2 Heat Map Data Model
```sql
heat_maps (
  id UUID,
  project_id UUID (FK projects),
  component_name TEXT,
  failure_count INTEGER,
  total_tests INTEGER,
  failure_rate DECIMAL,
  last_updated TIMESTAMP
)
```

### 2.7 MÓDULO DE OBSERVABILITY (PILLAR I) ⏳ (PLANEADO)

#### 2.7.1 Production Telemetry Ingestion
- [ ] Connectors para múltiples fuentes de logs (CloudWatch, DataDog, Splunk, etc.)
- [ ] Real-time log streaming
- [ ] Trace correlation con test executions
- [ ] Metric aggregation pipeline

#### 2.7.2 Intelligence Engine
- [ ] AI analysis de logs para identificar patterns
- [ ] Gap detection entre lab tests y prod behavior
- [ ] Automatic test recommendation generation
- [ ] Coverage analysis dashboard

### 2.8 MÓDULO DE PREDICTIVE IMPACT (PILLAR II) ⏳ (PLANEADO)

#### 2.8.1 Code Differential Analysis
- [ ] Git integration para code diffs
- [ ] LLM-powered dependency mapping
- [ ] Functional impact scoring (0-100)
- [ ] Test selection engine (minimal subset)

#### 2.8.2 Impact Dashboard
- [ ] Code change visualization
- [ ] Affected test recommendations
- [ ] Estimated execution time savings
- [ ] Risk scoring based on change scope

### 2.9 MÓDULO DE CHAOS ENGINEERING (PILLAR III) ⏳ (PLANEADO)

#### 2.9.1 Chaos Experiment Management
- [ ] Definition de chaos scenarios (latency, service outages, etc.)
- [ ] Scheduling de chaos experiments
- [ ] Real-time execution monitoring
- [ ] Recovery tracking y validation

#### 2.9.2 Resilience Scoring
- [ ] Auto-healing capability measurement
- [ ] MTTR (Mean Time to Recovery) tracking
- [ ] Resilience reports por componente
- [ ] SLA compliance validation

---

## 3. REQUERIMIENTOS NO-FUNCIONALES

### 3.1 Performance
- **API Response Time:** < 500ms para queries
- **Dashboard Load Time:** < 2s para dashboard inicial
- **Real-time Updates:** < 1s latency para streaming data
- **Concurrent Users:** Min 100 simultaneous connections

### 3.2 Scalability
- **Horizontal Scaling:** Soporte para múltiples instancias
- **Database:** PostgreSQL con auto-scaling
- **Frontend:** Client-side caching + CDN
- **Cache Strategy:** Redis para sesiones y datos frecuentes

### 3.3 Reliability
- **Uptime:** 99.5% availability
- **Data Backup:** Daily backups con 30-day retention
- **Disaster Recovery:** RTO < 1 hora, RPO < 15 minutos
- **Error Handling:** Graceful degradation con fallbacks

### 3.4 Security
- [x] HTTPS/TLS encryption en tránsito
- [x] JWT token-based authentication
- [x] CORS properly configured
- [ ] Rate limiting en endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection (Content-Security-Policy headers)
- [ ] CSRF tokens para state-changing operations
- [ ] Data encryption at rest en Supabase
- [ ] Row-Level Security (RLS) en PostgreSQL
- [ ] Audit logging de acciones sensibles

### 3.5 Usability
- **UI/UX:** Material-UI v5 consistent design system
- **Responsive:** Mobile-friendly (576px+)
- **Accessibility:** WCAG 2.1 Level AA
- **Documentation:** In-app tooltips + help center

### 3.6 Technology Stack
**Frontend:**
- React 18 + Vite (HMR enabled)
- Material-UI v5 con Emotion CSS-in-JS
- React Router v6 para navigation
- Axios para HTTP requests
- Supabase JS Client
- Context API para state management

**Backend:**
- Node.js + Express 4.x
- Supabase PostgreSQL
- JWT middleware para auth
- Nodemon para desarrollo
- npm workspaces para monorepo

**Infrastructure:**
- Supabase (managed PostgreSQL + Auth)
- Vercel o similar para frontend
- Render o similar para backend
- GitHub para version control

---

## 4. REQUERIMIENTOS DE DATOS

### 4.1 Tablas de Base de Datos

#### 4.1.1 Users
```sql
-- Stored in Supabase Auth, linked via JWT
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  role VARCHAR (stored in user_metadata),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### 4.1.2 Projects
```sql
projects (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  status ENUM (active, archived, deleted),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  created_by UUID (FK users)
)
```

#### 4.1.3 Project Members
```sql
project_members (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL (FK projects),
  user_id UUID NOT NULL (FK users),
  role VARCHAR (admin, qa, developer, executive),
  assigned_at TIMESTAMP,
  UNIQUE (project_id, user_id)
)
```

#### 4.1.4 Test Executions
```sql
test_executions (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL (FK projects),
  test_name VARCHAR NOT NULL,
  status ENUM (passed, failed, skipped, error),
  duration_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### 4.1.5 Risk Assessments
```sql
risk_assessments (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL (FK projects),
  risk_name VARCHAR NOT NULL,
  severity ENUM (low, medium, high, critical),
  likelihood ENUM (low, medium, high, critical),
  impact INTEGER,
  mitigation_plan TEXT,
  status ENUM (open, mitigating, resolved),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### 4.1.6 Heat Maps
```sql
heat_maps (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL (FK projects),
  component_name VARCHAR NOT NULL,
  failure_count INTEGER,
  total_tests INTEGER,
  failure_rate DECIMAL,
  last_updated TIMESTAMP
)
```

#### 4.1.7 Audit Logs
```sql
audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID (FK users),
  action VARCHAR,
  resource_type VARCHAR,
  resource_id VARCHAR,
  changes JSONB,
  ip_address INET,
  created_at TIMESTAMP
)
```

#### 4.1.8 Admin Logs
```sql
admin_logs (
  id UUID PRIMARY KEY,
  admin_id UUID (FK users),
  action VARCHAR,
  details JSONB,
  severity ENUM (info, warning, error),
  created_at TIMESTAMP
)
```

### 4.2 Integrations & Connections
```sql
connections (
  id UUID PRIMARY KEY,
  project_id UUID (FK projects),
  integration_type VARCHAR (datadog, cloudwatch, splunk, etc.),
  auth_config JSONB (encrypted),
  is_active BOOLEAN,
  last_sync TIMESTAMP,
  created_at TIMESTAMP
)

integration_mappings (
  id UUID PRIMARY KEY,
  connection_id UUID (FK connections),
  source_metric VARCHAR,
  target_field VARCHAR,
  transform_rule TEXT,
  created_at TIMESTAMP
)
```

---

## 5. ARQUITECTURA & DISEÑO

### 5.1 Frontend Architecture
```
src/
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx (main)
│   ├── QADashboard.jsx
│   ├── DeveloperDashboard.jsx
│   ├── ExecutiveDashboard.jsx
│   ├── AdminPanel.jsx
│   ├── ProjectSelection.jsx
│   ├── PostLoginRedirect.jsx
│   └── NoProjects.jsx
├── components/
│   ├── Navigation.jsx (sidebar + header)
│   ├── RoleProtectedRoute.jsx
│   ├── ProjectDropdown.jsx
│   ├── MetricCard.jsx
│   ├── ChartCard.jsx
│   ├── HeatMapChart.jsx
│   ├── SimpleBarChart.jsx
│   ├── StatusBadge.jsx
│   └── ErrorBoundary.jsx
├── context/
│   ├── AuthContext.jsx (user, role, login/logout)
│   └── ProjectContext.jsx (selectedProject, switchProject)
├── hooks/
│   ├── useSelectedProject.js
│   └── useUserProjects.js
├── services/
│   └── api.js (axios instance con interceptor de JWT)
└── styles/
    └── theme.js (MUI customization)
```

### 5.2 Backend Architecture
```
backend/
├── routes/
│   ├── health.js (GET /health)
│   ├── users.js (GET /users/me, GET /users/me/projects)
│   ├── projects.js (CRUD projects)
│   ├── admin.js (admin operations)
│   ├── dashboard.js (GET /dashboard/qa, /developer, /executive)
│   ├── heatmaps.js (GET heatmaps por proyecto)
│   ├── testSelection.js (test execution endpoints)
│   ├── riskAssessment.js (risk management endpoints)
│   └── (otros)
├── middleware/
│   ├── auth.js (JWT validation)
│   ├── errorHandler.js (error handling)
│   └── requestLogger.js (logging)
├── db/
│   ├── supabase.js (Supabase client init)
│   └── migrations/ (Liquibase/Flyway scripts)
├── scripts/
│   ├── create-test-users.js
│   ├── seed-dummy-data.js
│   ├── delete-test-users.js
│   ├── reset-database.js
│   └── full-reset-cli.js
└── server.js (Express app setup)
```

### 5.3 Authentication Flow
```
1. User enters credentials → POST /auth/login
2. Supabase returns JWT token
3. Token stored in localStorage
4. Axios interceptor adds token to all requests
5. Backend validates JWT via auth middleware
6. User role extracted from user_metadata
7. RoleProtectedRoute validates access
8. If unauthorized → Access Denied UI
```

### 5.4 Project Switching Flow
```
1. User selects project from dropdown
2. selectProject() updates ProjectContext
3. ProjectContext saves to localStorage
4. All components using useSelectedProject() re-fetch data
5. Dashboard re-renders with new project's data
6. URL can also update (optional)
```

---

## 6. API ENDPOINTS

### 6.1 Health Check
```
GET /api/v1/health
Response: { status: "ok", version: "1.0" }
```

### 6.2 Users
```
GET /api/v1/users/me
Response: { id, email, role }

GET /api/v1/users/me/projects
Response: [{ id, name, project_id, role }]
```

### 6.3 Projects
```
GET /api/v1/projects
Response: [{ id, name, status, created_at }]

POST /api/v1/projects
Body: { name, description }
Response: { id, name, ... }

PUT /api/v1/projects/{id}
Body: { name, description, status }

DELETE /api/v1/projects/{id}

GET /api/v1/projects/{id}/members
Response: [{ user_id, email, role }]

POST /api/v1/projects/{id}/members
Body: { user_id, role }

DELETE /api/v1/projects/{id}/members/{user_id}
```

### 6.4 Dashboard
```
GET /api/v1/dashboard/qa/{project_id}
Response: { 
  test_executions_count,
  pass_rate,
  execution_status,
  trend_data,
  heat_map
}

GET /api/v1/dashboard/developer/{project_id}
Response: {
  build_stats,
  deployments,
  code_quality,
  performance_metrics
}

GET /api/v1/dashboard/executive/{project_id}
Response: {
  integrity_score,
  health_status,
  risk_summary,
  kpis,
  trends
}
```

### 6.5 Test Execution
```
GET /api/v1/test-selection/{project_id}
Response: [{ test_id, test_name, last_result }]

POST /api/v1/test-selection/{project_id}/execute
Body: { test_ids: [] }
Response: { execution_id, status }

GET /api/v1/test-selection/{project_id}/results/{execution_id}
Response: { execution_id, results: [], overall_status }
```

### 6.6 Risk Assessment
```
GET /api/v1/risk-assessment/{project_id}
Response: [{ id, risk_name, severity, status }]

POST /api/v1/risk-assessment/{project_id}
Body: { risk_name, severity, likelihood, impact }

PUT /api/v1/risk-assessment/{project_id}/{id}
Body: { ...update }

GET /api/v1/risk-assessment/{project_id}/register
Response: [{ ...risks with timeline }]
```

### 6.7 Heat Maps
```
GET /api/v1/heatmaps/{project_id}
Response: [{ component, failure_count, total, rate, color }]
```

---

## 7. ROADMAP DE IMPLEMENTACIÓN

### Fase 1: ✅ COMPLETADA - Authentication & Core Infrastructure
- [x] Setup Supabase project
- [x] JWT authentication flow
- [x] Role-based access control
- [x] Database schema
- [x] Backend API scaffolding
- [x] Frontend authentication pages
- [x] PostLoginRedirect logic

### Fase 2: ✅ COMPLETADA - Dashboards & Projects
- [x] Dashboard layouts (QA, Developer, Executive)
- [x] Project creation & management
- [x] Multi-project context
- [x] Project member assignment
- [x] Admin Panel

### Fase 3: 🔄 EN PROGRESO - Data Visualization & Features
- [ ] Test Execution UI & real-time tracking
- [ ] Risk Assessment UI
- [ ] Advanced heat maps con drill-down
- [ ] Reporting & export functionality
- [ ] Date range filtering
- [ ] Roles matrix display en QA Dashboard

### Fase 4: ⏳ PLANEADA - Observability (Pillar I)
- [ ] Production telemetry connectors
- [ ] Log ingestion pipeline
- [ ] AI analysis engine
- [ ] Coverage gap detection
- [ ] Test recommendation engine

### Fase 5: ⏳ PLANEADA - Predictive Impact (Pillar II)
- [ ] Git integration
- [ ] Code diff analysis
- [ ] LLM-powered dependency mapping
- [ ] Test selection engine
- [ ] Impact dashboard

### Fase 6: ⏳ PLANEADA - Chaos Engineering (Pillar III)
- [ ] Chaos scenario definitions
- [ ] Experiment orchestration
- [ ] Recovery tracking
- [ ] Resilience scoring
- [ ] SLA compliance reports

### Fase 7: ⏳ PLANEADA - Production Deployment
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Load testing
- [ ] Documentation
- [ ] Training & rollout

---

## 8. CRITERIOS DE ACEPTACIÓN

### 8.1 Autenticación & Autorización
- [ ] Login successful con credenciales válidas
- [ ] Login fails con credenciales inválidas
- [ ] Cada rol solo ve su dashboard respectivo
- [ ] RoleProtectedRoute bloquea acceso no autorizado
- [ ] Logout limpia session y localStorage

### 8.2 Multi-Project
- [ ] Usuario con 1 proyecto auto-selecciona al login
- [ ] Usuario con N proyectos ve proyecto selection page
- [ ] Proyecto selection actualiza ProjectContext
- [ ] Dropdown solo visible con múltiples proyectos
- [ ] Project switch no afecta tab activo (excepto data)

### 8.3 Dashboards
- [ ] QA Dashboard muestra test metrics correctas
- [ ] Developer Dashboard muestra build/deployment metrics
- [ ] Executive Dashboard muestra KPIs agregados
- [ ] Admin Panel permite CRUD de proyectos y miembros
- [ ] Datos filtrados correctamente por project_id

### 8.4 Performance
- [ ] Dashboard carga en < 2s
- [ ] Project switch actualiza data en < 1s
- [ ] API responses < 500ms
- [ ] No memory leaks con context updates

### 8.5 Error Handling
- [ ] Network errors mostrados al usuario
- [ ] 404 endpoints return clear error messages
- [ ] Auth errors redirigen a login
- [ ] Database errors logged sin exponer detalles internos

---

## 9. DOCUMENTACIÓN RELACIONADA

- [ROLES_PERMISSIONS_MATRIX.md](./backend/docs/ROLES_PERMISSIONS_MATRIX.md) - Matriz detallada de permisos
- [TESTING_GUIDE.md](./backend/docs/TESTING_GUIDE.md) - Guía de testing manual
- [BACKUP_AND_RESET.md](./backend/docs/BACKUP_AND_RESET.md) - Procedimientos de reset
- [ARCHITECTURE_ROLES_DIAGRAM.md](./backend/docs/ARCHITECTURE_ROLES_DIAGRAM.md) - Diagramas de arquitectura
- [project-definition.md](./project-definition.md) - Visión ejecutiva del proyecto

---

## 10. PRÓXIMOS PASOS

### Inmediato (Esta semana)
1. **Implementar Roles Matrix en QA Dashboard** - Mostrar matriz de roles y permisos
2. **Test Execution UI** - Interfaz para ejecutar y monitorear tests
3. **Advanced Filtering** - Date ranges, status filters en dashboards

### Corto Plazo (2-3 semanas)
1. **Observability Module** - Connectors para production logs
2. **Performance Optimization** - Caching, CDN, lazy loading
3. **Security Hardening** - Rate limiting, input validation, audit logs

### Mediano Plazo (1-2 meses)
1. **Predictive Impact Engine** - Análisis de diffs con LLM
2. **Advanced Reporting** - PDF exports, email scheduling
3. **Mobile Support** - Responsive UI refinement

### Largo Plazo (2-3 meses)
1. **Chaos Engineering** - Experiment orchestration
2. **Integrations** - CI/CD, APM, incident management
3. **Production Deployment** - Full stack deployment

---

**Documento válido hasta:** Junio 30, 2026  
**Próxima revisión:** Junio 1, 2026
