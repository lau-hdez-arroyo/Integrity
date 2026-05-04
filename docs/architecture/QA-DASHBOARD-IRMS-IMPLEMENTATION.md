# QA Dashboard - Intelligent Regression Mapping System (IRMS)
## Guía de Implementación & Estrategia

**Versión:** 1.0  
**Fecha:** May 4, 2026  
**Estado:** Specification Document - Ready for Implementation Planning

---

## 1. Executive Summary

El **Intelligent Regression Mapping System (IRMS)** es el núcleo de inteligencia del QA Dashboard de INTEGRITY. Su propósito es transformar cómo seleccionamos qué tests ejecutar cuando el código cambia.

**Problema que Resuelve:**
```
Hoy:     Dev hace push → CI ejecuta 394 tests → 50 min → ~50% utilidad
Mañana:  Dev hace push → IRMS analiza → Ejecuta 37 tests → 4.5 min → ~99% efectividad
```

**Métricas Clave:**
- **Time to Feedback:** 4-6 horas → 12-15 minutos (85% reduction)
- **Test Suite Reduction:** 100% → 5-15% (quirúrgico, no por capricho)
- **Quality Preservation:** >= 99% bug detection rate
- **Confidence Levels:** Todas las recomendaciones >75% confidence

---

## 2. Pilares de la Arquitectura IRMS

### 2.1 Mapeo de Regresión Inteligente (Smart Regression Mapping)

**¿Qué hace?**
Cruza archivos modificados con tests históricos para determinar impacto directo.

**Entrada:**
```
Git Diff:
- backend/routes/auth.js (50 lines changed)
- backend/middleware/auth.js (12 lines changed)
```

**Procesamiento:**
```
Step 1: Parsear diff → Archivos modificados: [auth.js, middleware/auth.js]
Step 2: Mapear archivos → Componentes: [Authentication]
Step 3: Buscar tests que cubren "Authentication"
Step 4: Buscar stack traces que mencionan estos archivos
Step 5: Retornar: Tests que DIRECTAMENTE tocan este código
```

**Salida:**
```
Direct Impact Tests:
- login-001 (Login with valid credentials) → Confidence: 0.98
- token-refresh-001 (JWT token auto-refresh) → Confidence: 0.87
- logout-001 (Logout flow) → Confidence: 0.82
```

**Implementation Approach:**

1. **Build Code-to-Component Map (One-time Setup)**
   ```javascript
   // backend/data/component-mapping.json
   {
     "authentication": {
       "files": [
         "backend/routes/auth.js",
         "backend/middleware/auth.js",
         "backend/services/jwt.js"
       ],
       "api_endpoints": [
         "POST /auth/login",
         "POST /auth/refresh",
         "POST /auth/logout"
       ]
     }
   }
   ```

2. **Build Test-to-Component Map (Maintain with Tests)**
   ```javascript
   // backend/data/test-component-mapping.json
   {
     "login-001": {
       "component": "authentication",
       "stack_traces": [
         "auth.js:45",
         "middleware/auth.js:12"
       ]
     }
   }
   ```

3. **Git Diff Analysis (Triggered on Push)**
   ```javascript
   async function analyzeChangedFiles(headRef, baseRef) {
     const diff = await git.getDiff(baseRef, headRef);
     const changedFiles = diff.files.map(f => f.path);
     
     const impactedComponents = [];
     for (const file of changedFiles) {
       const component = findComponentForFile(file);
       if (component) impactedComponents.push(component);
     }
     
     return impactedComponents;
   }
   ```

4. **Test Impact Lookup**
   ```javascript
   async function findImpactedTests(impactedComponents) {
     const impactedTests = [];
     
     for (const component of impactedComponents) {
       const tests = testComponentMap[component];
       for (const test of tests) {
         const confidence = calculateConfidence(test, component);
         impactedTests.push({
           test_id: test.id,
           test_name: test.name,
           confidence_index: confidence,
           component: component
         });
       }
     }
     
     return impactedTests.sort((a, b) => b.confidence_index - a.confidence_index);
   }
   ```

### 2.2 Detector de Efecto Dominó (Cascading Impact Detection)

**¿Qué hace?**
Identifica componentes que históricamente fallan junto cuando cambian otros.

**Concepto:**
```
Si cambio "Authentication", ¿qué más podría romperse sin tocarlo directamente?

Datos Históricos:
- Cambio 1: Modifiqué auth.js → Failed: auth tests + project-selection tests
- Cambio 2: Modifiqué auth.js → Failed: auth tests + dashboard-access tests
- Cambio 3: Modifiqué auth.js → Failed: auth tests + rbac tests

Patrón Detectado:
"Cuando cambia auth.js, hay 87% de probabilidad de que project-selection falle"
```

**Implementation Approach:**

1. **Build Historical Co-Failure Matrix (Analyze Past Executions)**
   ```sql
   -- Analizar último mes de ejecuciones
   SELECT 
     component_a,
     component_b,
     COUNT(*) as co_failure_count,
     COUNT(*)::FLOAT / total_failures * 100 as co_failure_rate
   FROM test_failures
   WHERE created_at > NOW() - INTERVAL '30 days'
   GROUP BY component_a, component_b
   HAVING co_failure_rate > 0.60  -- Only 60%+ correlations
   ORDER BY co_failure_rate DESC
   ```

2. **Store Component Dependency Graph**
   ```javascript
   // backend/data/dependency-graph.json
   {
     "authentication": {
       "cascading_dependencies": [
         {
           "component": "project-selection",
           "co_failure_rate": 0.87,
           "frequency": "23/23 changes"
         },
         {
           "component": "role-based-access",
           "co_failure_rate": 0.72,
           "frequency": "18/25 changes"
         }
       ]
     }
   }
   ```

3. **Cascade Analysis on Code Change**
   ```javascript
   async function analyzeCascadingImpact(changedComponents) {
     const cascadeRisks = [];
     
     for (const component of changedComponents) {
       const dependencies = dependencyGraph[component];
       
       for (const dep of dependencies) {
         if (dep.co_failure_rate >= 0.60) {
           cascadeRisks.push({
             trigger: component,
             affected_area: dep.component,
             risk_level: dep.co_failure_rate > 0.80 ? 'HIGH' : 'MEDIUM',
             evidence: `${dep.frequency} showed co-failures`,
             recommended_tests: findTestsForComponent(dep.component)
           });
         }
       }
     }
     
     return cascadeRisks;
   }
   ```

### 2.3 Calculador de Índice de Confianza (Confidence Index)

**¿Qué hace?**
Ordena tests por su probabilidad de encontrar bugs en las áreas modificadas.

**Fórmula:**
```
Confidence = 
  (0.40 × Bug_Detection_Rate) +      // Este test ha encontrado bugs aquí?
  (0.30 × P_Level_Weight) +          // ¿Cuán crítico es? (P0 > P1 > P2)
  (0.20 × Recency_Weight) +          // ¿Hay cambios recientes similares?
  (0.10 × Execution_Stability)       // ¿Es el test estable o flaky?
```

**Implementation Approach:**

1. **Calculate Bug Detection Rate**
   ```javascript
   async function getBugDetectionRate(testId, component) {
     const executions = await db.query(`
       SELECT COUNT(*) as total,
              SUM(CASE WHEN bugs_found > 0 THEN 1 ELSE 0 END) as bugs_found_count
       FROM test_historical_performance
       WHERE test_id = $1 AND component_name = $2
       AND created_at > NOW() - INTERVAL '90 days'
     `, [testId, component]);
     
     return executions.bugs_found_count / executions.total;  // e.g., 0.92
   }
   ```

2. **Calculate P-Level Weight**
   ```javascript
   function getPLevelWeight(pLevel) {
     const weights = { P0: 1.0, P1: 0.8, P2: 0.6, P3: 0.4 };
     return weights[pLevel];
   }
   ```

3. **Calculate Recency Weight (Similar changes recently?)**
   ```javascript
   async function getRecencyWeight(changedComponent) {
     const recentSimilarChanges = await db.query(`
       SELECT COUNT(*) as count
       FROM irms_analysis_cache
       WHERE changed_files_hash IN (
         SELECT changed_files_hash FROM irms_analysis_cache
         WHERE created_at > NOW() - INTERVAL '7 days'
       )
     `);
     
     // More similar recent changes = higher weight
     return Math.min(recentSimilarChanges.count / 10, 1.0);
   }
   ```

4. **Calculate Execution Stability**
   ```javascript
   async function getExecutionStability(testId) {
     const executions = await db.query(`
       SELECT COUNT(*) as total,
              COUNT(CASE WHEN status = 'passed' THEN 1 END) as pass_count
       FROM test_executions
       WHERE test_id = $1
       AND created_at > NOW() - INTERVAL '30 days'
     `, [testId]);
     
     const passRate = executions.pass_count / executions.total;
     // Ideal: ~85% pass rate (not too high, not flaky)
     // Penalize if <70% (flaky) or >98% (not catching bugs)
     const stability = 1.0 - Math.abs(passRate - 0.85);
     return Math.max(stability, 0);
   }
   ```

5. **Combine into Final Confidence Index**
   ```javascript
   async function calculateConfidenceIndex(testId, component, pLevel) {
     const bugDetection = await getBugDetectionRate(testId, component);
     const pWeight = getPLevelWeight(pLevel);
     const recency = await getRecencyWeight(component);
     const stability = await getExecutionStability(testId);
     
     const confidence = 
       (0.40 * bugDetection) +
       (0.30 * pWeight) +
       (0.20 * recency) +
       (0.10 * stability);
     
     return Math.round(confidence * 100) / 100;  // 2 decimals
   }
   ```

### 2.4 Calculador de Métrica de Optimización (Optimization Calculator)

**¿Qué hace?**
Determina qué porcentaje de la suite podemos saltarnos con seguridad.

**Cálculo:**
```
Tests to Execute: 37
Total Suite: 394

Optimization % = (1 - 37/394) * 100 = 90.6%

Confidence in Skipped Tests: 0.97
↳ Basado en: 12 cambios similares en el pasado
             Con 0 false negatives (bugs que escaparon)
             99.1% histórico bug detection rate preserved
```

**Implementation Approach:**

```javascript
async function calculateOptimizationMetric(recommendedTests, totalSuite) {
  const testCount = recommendedTests.length;
  const optimizationPercentage = ((totalSuite - testCount) / totalSuite) * 100;
  
  // Look for historical similar changes
  const similarChanges = await findSimilarHistoricalChanges(
    recommendedTests.map(t => t.component)
  );
  
  // Calculate confidence based on historical false negatives
  const historicalFalseNegatives = similarChanges.filter(
    c => c.had_escaped_bugs
  ).length;
  
  const confidenceInSkipped = 1.0 - (historicalFalseNegatives / similarChanges.length);
  
  return {
    optimization_percentage: Math.round(optimizationPercentage),
    confidence_in_skipped: Math.round(confidenceInSkipped * 100) / 100,
    tests_to_execute: testCount,
    tests_safe_to_skip: totalSuite - testCount,
    historical_evidence: similarChanges,
    bug_detection_preserved: 0.99 + (historicalFalseNegatives * -0.01)
  };
}
```

---

## 3. Data Flow & Integration Points

### 3.1 Trigger: Code Push to Git

```
Developer push to GitHub/GitLab
         ↓
GitHub webhook → Backend /api/v1/qa/analyze-changes
         ↓
Parse diff & run IRMS analysis
         ↓
Return JSON with recommendations
         ↓
Comment on PR with recommended tests
         ↓
CI/CD pipeline executes recommended tests only
         ↓
Results feed back to IRMS for learning
```

### 3.2 Data Sources Required

**At Analysis Time:**
1. Git diff (what changed)
2. Component mapping (file → component)
3. Test → component mapping (test coverage)
4. Historical test performance (bug detection rates)
5. Component dependency graph (co-failure rates)

**After Test Execution:**
1. Test results (pass/fail)
2. Bugs found (if any)
3. Execution time
4. Stack traces
5. Failed assertions

### 3.3 Learning Loop

```
Analysis #1: Recommend tests X, Y, Z
Tests execute → Results captured
         ↓
Did we find all bugs? → YES: increase confidence
Did we miss bugs? → NO: decrease confidence (false negative)
Did we run unnecessary tests? → YES: optimize (false positive)
         ↓
Update historical data
Recalculate co-failure rates
Adjust recommendation algorithm
         ↓
Analysis #2 (tomorrow): More accurate recommendations
```

---

## 4. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Design database schema for IRMS tables
- [ ] Create file-to-component mapping
- [ ] Build Git diff parser
- [ ] Implement basic regression mapping (direct impact only)

**Deliverable:** Can answer "What tests touch this file?"

### Phase 2: Intelligence (Week 3-4)
- [ ] Build confidence index calculator
- [ ] Implement cascading impact detection
- [ ] Create optimization metric calculator
- [ ] Build API endpoint for analysis

**Deliverable:** POST /api/v1/qa/analyze-changes returns complete JSON

### Phase 3: Integration (Week 5-6)
- [ ] GitHub webhook integration
- [ ] CI/CD pipeline integration
- [ ] PR comment automation
- [ ] Results feedback loop

**Deliverable:** Full automation from push to test results

### Phase 4: Learning (Week 7-8)
- [ ] Implement historical data collection
- [ ] Build learning algorithm
- [ ] Create dashboard visualizations
- [ ] Setup metrics tracking

**Deliverable:** IRMS improves accuracy over time

### Phase 5: Optimization (Week 9-10)
- [ ] Performance tuning
- [ ] Cache optimization
- [ ] Parallel analysis
- [ ] Advanced filtering

**Deliverable:** Sub-second analysis response time

---

## 5. API Specification

### Endpoint: POST /api/v1/qa/analyze-changes

**Request:**
```json
{
  "project_id": "uuid-project-1",
  "changed_files": [
    "backend/routes/auth.js",
    "backend/middleware/auth.js"
  ],
  "base_ref": "main",
  "head_ref": "feature/fix-token-refresh"
}
```

**Response:**
```json
{
  "status": "success",
  "analysis": {
    "timestamp": "2026-05-04T14:30:00Z",
    "impact_summary": {
      "total_suite_count": 394,
      "tests_recommended": 37,
      "optimization_percentage": 90.6,
      "average_confidence": 0.87
    },
    "direct_impact_tests": [
      {
        "rank": 1,
        "test_id": "login-001",
        "test_name": "Login with valid credentials",
        "confidence_index": 0.98,
        "expected_duration_ms": 2300
      }
    ],
    "cascading_risks": [
      {
        "area": "Project Access Control",
        "risk_level": "HIGH",
        "recommended_tests": 5
      }
    ]
  }
}
```

---

## 6. Success Metrics

**Measure These:**
- Time to Feedback: Target < 15 min (vs 4-6 hours)
- Suite Reduction: Target 90%+ (vs running all 394 tests)
- Bug Detection: Target >= 99% (no significant missed bugs)
- Confidence Accuracy: Target > 85% (if we say 0.95, actual should be ~0.95)
- False Negatives: Target < 1% (bugs that escape)

**Dashboard Metrics:**
- Avg tests executed per push: 37 → trend over time
- Avg execution time: 4.5 min → trend over time
- Bugs caught: X per month → trend over time
- Accuracy of confidence index: Predicted vs Actual

---

## 7. Risk & Mitigation

| Risk | Mitigation |
|------|-----------|
| High false negatives (bugs escape) | Escalate for manual review if confidence < 0.75 |
| Recommending too many tests (defeats purpose) | Hard cap at 50% of suite |
| Historical data not representative | Weight by recency, exclude old data > 90 days |
| Test flakiness skews recommendations | Track stability, downweight flaky tests |
| Component mapping incomplete | Periodic audit + developer feedback |

---

## 8. Testing IRMS Itself

### Unit Tests
- Confidence index calculation
- Optimization metric calculation
- Co-failure rate analysis

### Integration Tests
- Git diff parsing → recommendations
- Historical data loading → accuracy
- Cascading impact detection

### E2E Tests
- Push to PR → recommendations on PR
- Recommended tests execute → results captured
- Results feed back → next analysis is better

---

## 9. Rollout Strategy

**Phase 1 (Internal):** Test with INTEGRITY team only
**Phase 2 (Beta):** Enable for one project (Delphi)
**Phase 3 (Full):** Enable for all projects
**Phase 4 (Mandatory):** Require IRMS for CI/CD gate

---

## 10. Appendix: Example Data

### Example: Authentication Change

**Commit:**
```
Modifi: backend/routes/auth.js
Modifi: backend/middleware/auth.js
Message: "Fix JWT token refresh timeout issue"
```

**IRMS Analysis Output:**
```json
{
  "direct_impact": [
    { "test": "login", "confidence": 0.98 },
    { "test": "token-refresh", "confidence": 0.87 },
    { "test": "logout", "confidence": 0.82 }
  ],
  "cascading": [
    {
      "area": "PostLoginRedirect",
      "co_failure_rate": 0.87,
      "tests": ["post-login-single", "post-login-multiple"]
    }
  ],
  "optimization": "90.6%",
  "recommended_execution_time": "4.5 min"
}
```

**Actual Results:**
```
Recommended tests: 37
Executed: 37
Passed: 36
Failed: 1 (detected bug in token refresh)
Time: 4.3 min
Bugs found: 1 (0 false negatives)
Confidence accuracy: 0.87 predicted, 0.88 actual ✓
```

---

**Document Version:** 1.0  
**Last Updated:** May 4, 2026  
**Next Review:** May 25, 2026
