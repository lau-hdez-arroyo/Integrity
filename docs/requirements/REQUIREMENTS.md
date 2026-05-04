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

#### 2.3.2 QA Dashboard - Intelligent Test Regression Mapping Engine
**Core Metrics & Visualizations:**
- [x] Total de test executions
- [x] Test pass/fail rate
- [x] Execution status distribution (passed, failed, skipped)
- [x] Test execution trend chart
- [x] Heat map de failures por componente
- [x] Last execution date

**NEW: Intelligent Regression Mapping System** 🚀
This system acts as the intelligence layer that detects which tests must run when code changes occur.

##### 2.3.2.1 Mapeo de Regresión Inteligente (Smart Regression Mapping)
**Purpose:** Cross-reference modified files with test stack traces and report metadata to identify affected functionality.

**Entrada (Input Data):**
- Changed files/modules from Git diff (HEAD~1..HEAD)
- Test stack traces from last execution report
- Test metadata (test name, affected components, severity)
- Historical failure patterns (which tests find bugs in which areas)

**Procesamiento (Processing Logic):**
- Parse Git diff to extract modified file paths
- Map files to functional modules (e.g., `auth.js` → "Authentication")
- Match modified modules against test stack traces
- Cross-reference with historical test-module correlation data
- Generate impact assessment with confidence scores

**Salida Principal (Primary Output):**
```json
{
  "changed_files": ["backend/routes/auth.js", "backend/middleware/auth.js"],
  "mapped_components": [
    {
      "component_name": "Authentication",
      "modified_files": 2,
      "impacted_test_count": 18,
      "confidence": 0.95
    }
  ],
  "regression_mapping": [
    {
      "changed_component": "Authentication",
      "direct_impact_tests": [
        {
          "test_id": "login-001",
          "test_name": "Login with valid credentials",
          "priority": "P0",
          "confidence_index": 0.98,
          "failure_history": { "found_bugs": 8, "avg_detection_rate": 0.92 }
        },
        {
          "test_id": "token-refresh-001",
          "test_name": "JWT token auto-refresh",
          "priority": "P1",
          "confidence_index": 0.87,
          "failure_history": { "found_bugs": 5, "avg_detection_rate": 0.78 }
        }
      ],
      "indirect_risk_areas": [
        {
          "area_name": "Project Access Control",
          "risk_level": "HIGH",
          "rationale": "Auth module affects role-based route access; changes here may impact project_members table queries",
          "affected_tests": 12,
          "recommended_action": "Execute comprehensive RBAC regression suite"
        },
        {
          "area_name": "API Token Validation",
          "risk_level": "MEDIUM",
          "rationale": "All protected endpoints depend on JWT validation in middleware",
          "affected_tests": 7,
          "recommended_action": "Sample 3-5 critical APIs (users, projects, dashboard)"
        }
      ],
      "optimization_metric": {
        "total_suite_count": 394,
        "tests_to_execute": 37,
        "tests_safe_to_skip": 357,
        "optimization_percentage": 90.6,
        "confidence": "High (based on 8 similar historical changes)"
      }
    }
  ]
}
```

##### 2.3.2.2 Identificación de "Efecto Dominó" (Cascading Impact Detection)
**Purpose:** Detect components without direct modifications that historically depend on changed areas.

**Detection Algorithm:**
- Query historical test execution data: when tests in area X fail, which tests in area Y also fail?
- Build correlation matrix of test co-failures
- For each changed component, identify areas with > 60% co-failure correlation
- Weight by historical severity (P0 failures weighted more heavily)

**Output Example:**
```json
{
  "cascade_analysis": {
    "trigger_area": "Authentication",
    "cascade_chain": [
      {
        "area": "Project Selection (PostLoginRedirect)",
        "co_failure_rate": 0.87,
        "historical_evidence": "In 23/23 auth failures, PostLoginRedirect also failed. 18 were P0 severity.",
        "reason": "Depends on user role extracted from auth token"
      },
      {
        "area": "Role-Based Dashboard Access",
        "co_failure_rate": 0.72,
        "historical_evidence": "In 18/25 auth failures affecting JWT, dashboard access control also failed.",
        "reason": "RoleProtectedRoute validates role from AuthContext"
      }
    ]
  }
}
```

##### 2.3.2.3 Priorización por "Índice de Confianza" (Confidence Index)
**Purpose:** Rank suggested tests by their historical bug-finding effectiveness in these code areas.

**Confidence Index Calculation:**
```
Confidence = (0.4 × Historical_Bug_Detection_Rate) +
             (0.3 × P_Level_Weight) +
             (0.2 × Recency_Weight) +
             (0.1 × Execution_Stability)
```

Where:
- `Historical_Bug_Detection_Rate`: % of times this test found a bug in this component
- `P_Level_Weight`: P0=1.0, P1=0.8, P2=0.6, P3=0.4
- `Recency_Weight`: Higher if similar changes were made recently
- `Execution_Stability`: Higher if test passes consistently (not flaky)

**Example Output (Sorted by Confidence):**
```json
{
  "prioritized_tests": [
    {
      "rank": 1,
      "test_name": "Login with valid credentials",
      "confidence_index": 0.98,
      "expected_execution_time": "2.3s",
      "rationale": "Directly touches modified auth.js; 92% historical bug detection in this file"
    },
    {
      "rank": 2,
      "test_name": "JWT token auto-refresh",
      "confidence_index": 0.87,
      "expected_execution_time": "1.8s",
      "rationale": "Tests middleware touched by changes; 78% bug detection"
    },
    {
      "rank": 3,
      "test_name": "Role-based access denied",
      "confidence_index": 0.75,
      "expected_execution_time": "1.5s",
      "rationale": "Indirect: depends on auth token validation; 65% historical co-failure"
    }
  ],
  "execution_recommendation": "Execute tests ranked 1-3 (5.6s total). Skip rest with 90% confidence in quality."
}
```

##### 2.3.2.4 Restricción: Ejecución Quirúrgica (No "Run All Tests")
**Constraint:** The system MUST NEVER suggest running the entire test suite. Success is measured by:
1. **Execution Time Reduction:** Recommend only 5-15% of suite for typical changes
2. **Quality Preservation:** Maintain >= 99% bug detection rate
3. **Risk-Based Selection:** Select tests based on historical data, not arbitrary coverage

**Rules:**
- If suggested tests >= 50% of total suite → escalate to manual review
- If any P0 test is bypassed → show detailed justification and historical evidence
- Always show optimization percentage and confidence level

##### 2.3.2.5 Data Storage & API Endpoints
**New Database Tables:**
```sql
test_regression_mappings (
  id UUID PRIMARY KEY,
  project_id UUID (FK projects),
  component_name VARCHAR,
  test_id UUID (FK tests),
  correlation_strength DECIMAL (0-1),
  last_updated TIMESTAMP,
  UNIQUE (project_id, component_name, test_id)
)

test_historical_performance (
  id UUID PRIMARY KEY,
  project_id UUID (FK projects),
  test_id VARCHAR,
  component_name VARCHAR,
  bugs_found INTEGER,
  total_executions INTEGER,
  failure_rate DECIMAL (0-1),
  avg_execution_time_ms INTEGER,
  p_level VARCHAR (P0, P1, P2, P3),
  created_at TIMESTAMP
)

code_component_mapping (
  id UUID PRIMARY KEY,
  project_id UUID (FK projects),
  file_path VARCHAR,
  component_name VARCHAR,
  module_category VARCHAR,
  created_at TIMESTAMP
)
```

**New API Endpoints:**
```
POST   /api/v1/dashboard/qa/analyze-changes
  Input: { changed_files: [], project_id }
  Output: Complete regression mapping JSON (as above)
  
GET    /api/v1/dashboard/qa/regression-report/{project_id}
  Output: Historical regression analysis + trends
  
GET    /api/v1/dashboard/qa/confidence-scores/{project_id}
  Output: Test confidence index rankings
  
GET    /api/v1/dashboard/qa/cascade-analysis/{project_id}/{component}
  Output: Dominó effect analysis for specific component
```

**Funcionalidades Adicionales en QA Dashboard:**
- [ ] Matriz de Roles y Permisos
- [ ] Test execution details view
- [ ] Filter por date range
- [ ] Export de reportes QA
- [ ] Code change upload / Git webhook integration
- [ ] Real-time regression analysis visualization
- [ ] Historical trend analysis (bug detection effectiveness over time)
- [ ] Confidence score indicators on test recommendations

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

### 2.7 MÓDULO DE INTELLIGENT REGRESSION MAPPING (IRMS) ⏳ (PLANEADO - NUEVA CARACTERÍSTICA)

**Estado:** 🚀 **NUEVO MÓDULO** - Core intelligence engine del QA Dashboard

#### 2.7.1 Descripción General
Este módulo actúa como el **núcleo de inteligencia** de Project INTEGRITY, analizando cambios de código y determinando automáticamente exactamente qué tests ejecutar con máxima confianza y mínimo tiempo.

**Propósito:**
- Mapeo de cambios de código a tests específicos que los cubren
- Detección de dependencias indirectas ("efecto dominó")
- Priorización de tests por su efectividad histórica en detectar bugs
- Reducción quirúrgica del tiempo de ejecución (5-15% de suite vs 100%)
- Preservación de calidad con >= 99% bug detection rate

#### 2.7.2 Componentes Principales

**A. Regression Mapping Engine (Motor de Mapeo)**
- Entrada: Git diff (archivos modificados)
- Procesamiento: Mapeo file → component → test
- Salida: Lista de tests directamente impactados
- Precision: >= 95% accuracy en identificación de tests afectados

**B. Cascading Impact Detector (Detector de Efecto Dominó)**
- Entrada: Tests directamente impactados
- Procesamiento: Análisis de dependencias históricas (co-failure rates)
- Salida: Áreas funcionales con riesgo indirecto
- Threshold: Solo incluir áreas con > 60% co-failure correlation histórica

**C. Confidence Index Calculator (Calculador de Índice de Confianza)**
- Métrica: (0.4 × Bug_Detection_Rate) + (0.3 × P_Level) + (0.2 × Recency) + (0.1 × Stability)
- Rango: 0.0 a 1.0
- Uso: Ordenar tests por probabilidad de encontrar bugs en esta área
- Histórico: Datos de ejecuciones pasadas

**D. Optimization Metric Calculator (Calculador de Métrica de Optimización)**
- Output: % de suite que puede saltarse con seguridad
- Target: 85-95% para cambios típicos
- Constraint: Nunca sugerir ejecutar > 50% de suite sin escalation

#### 2.7.3 Data Input Requirements

**Requerimientos de Datos:**
1. **Git Metadata**
   - Changed file paths (src/routes/auth.js, backend/middleware/*, etc.)
   - Modified lines/functions
   - Commit message (optional, for context)

2. **Test Metadata**
   - Test name, test_id, file path
   - Stack traces from last execution
   - Affected components (which features this test validates)
   - Priority level (P0-P3)

3. **Historical Execution Data**
   - Pass/fail outcomes per test per execution
   - Bugs found by each test per component
   - Execution times
   - Failure rates
   - Recency data (last 30 days, 90 days, historical)

4. **Component Mapping**
   - Code file → Functional component mapping
   - Component dependencies
   - API/Module relationships

#### 2.7.4 API & Output Format

**Input Endpoint:**
```
POST /api/v1/qa/analyze-changes
Content-Type: application/json

{
  "project_id": "uuid",
  "changed_files": [
    "backend/routes/auth.js",
    "backend/middleware/auth.js"
  ],
  "additional_context": {
    "commit_message": "Fix JWT token refresh issue",
    "branch": "bugfix/token-refresh"
  }
}
```

**Output Structure:**
```json
{
  "analysis_timestamp": "2026-05-04T14:30:00Z",
  "project_id": "uuid",
  "regression_analysis": {
    "changed_components": [
      {
        "component_id": "auth-module",
        "component_name": "Authentication",
        "modified_files": [
          "backend/routes/auth.js",
          "backend/middleware/auth.js"
        ],
        "modified_file_count": 2,
        "confidence": 0.95
      }
    ],
    "impact_summary": {
      "direct_impact_tests": 18,
      "potential_indirect_tests": 12,
      "total_recommended_tests": 37,
      "total_suite_count": 394,
      "optimization_percentage": 90.6,
      "estimated_execution_time": "245s",
      "skipped_tests_confidence": 0.97
    },
    "recommended_test_execution": [
      {
        "rank": 1,
        "test_id": "login-001",
        "test_name": "Login with valid credentials",
        "priority": "P0",
        "confidence_index": 0.98,
        "expected_duration_ms": 2300,
        "affected_component": "Authentication",
        "historical_bug_detection_rate": 0.92,
        "last_failure": "2026-04-28T09:15:00Z",
        "failure_frequency": "rare",
        "rationale": "Directly touches modified auth.js; 92% historical bug detection in this file"
      },
      {
        "rank": 2,
        "test_id": "token-refresh-001",
        "test_name": "JWT token auto-refresh",
        "priority": "P1",
        "confidence_index": 0.87,
        "expected_duration_ms": 1800,
        "affected_component": "Authentication",
        "historical_bug_detection_rate": 0.78,
        "last_failure": "2026-04-25T10:30:00Z",
        "failure_frequency": "occasional",
        "rationale": "Tests middleware logic modified in this change set"
      }
    ],
    "cascading_impact_analysis": {
      "trigger_component": "Authentication",
      "cascading_risks": [
        {
          "affected_area": "Project Access Control (PostLoginRedirect)",
          "risk_level": "HIGH",
          "co_failure_rate": 0.87,
          "historical_evidence": "In 23/23 past auth failures, PostLoginRedirect also failed",
          "recommended_tests": [
            {
              "test_name": "Project auto-selection single project",
              "confidence_index": 0.82
            }
          ]
        },
        {
          "affected_area": "Role-Based Dashboard Access",
          "risk_level": "MEDIUM",
          "co_failure_rate": 0.72,
          "historical_evidence": "18/25 auth-related failures also impacted dashboard access",
          "recommended_tests": [
            {
              "test_name": "QA dashboard load with valid role",
              "confidence_index": 0.75
            }
          ]
        }
      ]
    },
    "execution_strategy": {
      "recommendation": "Execute Ranked Tests 1-18 (245s). Safely skip remaining 357 tests.",
      "confidence_level": 0.97,
      "reasoning": "Based on 12 similar historical changes to authentication components. 99.1% bug detection preserved with 90.6% time savings.",
      "fallback": "If any ranked test fails unexpectedly, escalate for manual review of skipped tests.",
      "quality_guarantee": "This recommendation maintains >= 99% bug detection rate based on historical data."
    }
  }
}
```

#### 2.7.5 Database Tables for IRMS

```sql
-- Component mapping: Code files to functional areas
code_component_mapping (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL (FK projects),
  file_path VARCHAR NOT NULL,
  component_name VARCHAR NOT NULL,
  module_category VARCHAR,
  parent_component VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE (project_id, file_path)
)

-- Historical test performance metrics
test_historical_performance (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL (FK projects),
  test_id VARCHAR NOT NULL,
  test_name VARCHAR,
  component_name VARCHAR NOT NULL,
  bugs_found INTEGER DEFAULT 0,
  total_executions INTEGER DEFAULT 0,
  failure_rate DECIMAL (0-1),
  avg_execution_time_ms INTEGER,
  p_level VARCHAR (P0, P1, P2, P3),
  flakiness_score DECIMAL (0-1),
  last_executed_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE (project_id, test_id, component_name)
)

-- Test-to-component correlation (regression mapping)
test_regression_mappings (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL (FK projects),
  test_id VARCHAR NOT NULL,
  component_name VARCHAR NOT NULL,
  correlation_type VARCHAR (direct, indirect),
  correlation_strength DECIMAL (0-1),
  evidence_count INTEGER,
  last_updated TIMESTAMP
)

-- Component dependency graph (for cascading impact analysis)
component_dependencies (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL (FK projects),
  source_component VARCHAR NOT NULL,
  dependent_component VARCHAR NOT NULL,
  co_failure_rate DECIMAL (0-1),
  dependent_count INTEGER,
  last_analyzed TIMESTAMP
)

-- IRMS analysis results cache (for dashboard performance)
irms_analysis_cache (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL (FK projects),
  analysis_timestamp TIMESTAMP,
  changed_files_hash VARCHAR,
  analysis_result JSONB,
  created_at TIMESTAMP,
  ttl_expiration TIMESTAMP
)
```

#### 2.7.6 Integration Points

**Integration with Git/CI-CD:**
- [ ] Webhook from GitHub/GitLab on push
- [ ] Parse diff and trigger analysis automatically
- [ ] Comment on PR with recommended test list
- [ ] Block merge if P0 tests bypass certain components

**Integration with Test Execution:**
- [ ] Receive test results from Playwright/Jest
- [ ] Update historical performance metrics
- [ ] Recalculate confidence indexes
- [ ] Learn from false positives/negatives

**Integration with QA Dashboard:**
- [ ] Display recommended tests
- [ ] Show confidence scores and rationale
- [ ] Allow manual override with audit trail
- [ ] Visualize cascading impact

#### 2.7.7 Learning & Improvement

**Continuous Learning:**
- Analyze test effectiveness over time
- Track how many bugs each test finds per component
- Measure accuracy of confidence index predictions
- Adjust weights based on historical performance
- Detect flaky tests and downweight them

**Metrics to Track:**
- Actual Bug Detection Rate vs Predicted (should converge to 99%+)
- False Positive Rate (skipped tests that should have failed)
- False Negative Rate (recommended tests that don't find bugs)
- Time Savings vs Quality Trade-off

#### 2.7.8 Constraints & Rules

**Hard Constraints:**
1. Never suggest executing entire suite (max 50% without escalation)
2. Always show optimization percentage and confidence level
3. If bypassing P0 tests, require explicit justification + evidence
4. Maintain >= 99% bug detection rate historically

**Escalation Triggers:**
- Recommended tests >= 50% of suite
- Confidence index < 0.75 for critical paths
- Unknown component (no historical data)
- Major architectural changes

### 2.8 MÓDULO DE OBSERVABILITY (PILLAR I) ⏳ (PLANEADO)

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

### 2.9 MÓDULO DE PREDICTIVE IMPACT (PILLAR II) ⏳ (PLANEADO)

#### 2.9.1 Code Differential Analysis
- [ ] Git integration para code diffs
- [ ] LLM-powered dependency mapping
- [ ] Functional impact scoring (0-100)
- [ ] Test selection engine (minimal subset)

#### 2.9.2 Impact Dashboard
- [ ] Code change visualization
- [ ] Affected test recommendations
- [ ] Estimated execution time savings
- [ ] Risk scoring based on change scope

### 2.10 MÓDULO DE CHAOS ENGINEERING (PILLAR III) ⏳ (PLANEADO)

#### 2.10.1 Chaos Experiment Management
- [ ] Definition de chaos scenarios (latency, service outages, etc.)
- [ ] Scheduling de chaos experiments
- [ ] Real-time execution monitoring
- [ ] Recovery tracking y validation

#### 2.10.2 Resilience Scoring
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
