# QA Dashboard - Intelligent Regression Mapping (IRMS)
## Actualización de Requerimientos

**Versión:** 1.1  
**Fecha:** May 4, 2026  
**Cambios:** Major enhancement al QA Dashboard

---

## Resumen de Cambios

Se ha actualizado el documento de requerimientos de INTEGRITY para incluir un nuevo módulo central: **Intelligent Regression Mapping System (IRMS)**.

### Lo que Cambió

#### 1. QA Dashboard Expandido (Sección 2.3.2)
**Antes:**
- Sección simple con métricas básicas
- Funcionalidades pendientes por definir

**Después:**
- 5 subsecciones detalladas
- Algoritmos especificados
- Estructura JSON definida
- API endpoints documentados
- Tablas de base de datos diseñadas

#### 2. Nuevo Módulo: IRMS (Sección 2.7)
**Nuevo módulo con:**
- 8 subsecciones de especificación completa
- Input/output data flow
- Database schema (4 nuevas tablas)
- Integration points
- Learning & improvement strategy
- Hard constraints & escalation rules

### Cambios Numéricos de Secciones
- 2.7 Observability → **2.8** Observability
- 2.8 Predictive Impact → **2.9** Predictive Impact
- 2.9 Chaos Engineering → **2.10** Chaos Engineering

---

## Componentes del IRMS

### 1. Mapeo de Regresión Inteligente
Cruza archivos modificados con tests históricos.

**Input:** Git diff  
**Output:** Tests que directamente tocan el código modificado  
**Confidence:** 95%+ accuracy

### 2. Detector de Efecto Dominó
Identifica componentes que fallan indirectamente.

**Método:** Análisis de co-failure rates históricos  
**Threshold:** > 60% correlación  
**Output:** Componentes en riesgo + recommended tests

### 3. Índice de Confianza
Ordena tests por efectividad histórica.

**Fórmula:** 
```
(0.40 × Bug_Detection) + (0.30 × P_Level) + (0.20 × Recency) + (0.10 × Stability)
```

**Rango:** 0.0 a 1.0  
**Uso:** Priorizar qué tests ejecutar primero

### 4. Métrica de Optimización
Calcula % de suite que puede saltarse.

**Target:** 85-95% (no correr toda la suite)  
**Confidence:** Basado en histórico de cambios similares  
**Constraint:** Nunca sugerir >= 50% sin escalation

---

## JSON Output Structure

Nuevo endpoint: `POST /api/v1/qa/analyze-changes`

```json
{
  "analysis_timestamp": "2026-05-04T14:30:00Z",
  "regression_analysis": {
    "changed_components": [...],
    "impact_summary": {
      "direct_impact_tests": 18,
      "optimization_percentage": 90.6
    },
    "recommended_test_execution": [...],
    "cascading_impact_analysis": {...},
    "execution_strategy": {...}
  }
}
```

---

## Nuevas Tablas de Base de Datos

1. **code_component_mapping** - File → Component mapping
2. **test_historical_performance** - Historical test metrics
3. **test_regression_mappings** - Test → Component correlation
4. **component_dependencies** - Component co-failure graph
5. **irms_analysis_cache** - Results caching

---

## Nuevo API Endpoint

```
POST   /api/v1/qa/analyze-changes
GET    /api/v1/qa/regression-report/{project_id}
GET    /api/v1/qa/confidence-scores/{project_id}
GET    /api/v1/qa/cascade-analysis/{project_id}/{component}
```

---

## Restricciones & Reglas

### Hard Constraints
1. **Nunca toda la suite** - Máximo 50% sin escalation
2. **Quality First** - Mantener >= 99% bug detection
3. **Confidence Always** - Mostrar siempre % de confianza
4. **P0 Justification** - Si se salta P0 test, explicar por qué

### Escalation Triggers
- Recommended tests >= 50% de suite
- Confidence index < 0.75 para paths críticos
- Componente sin datos históricos
- Cambios arquitectónicos mayores

---

## Beneficios

| Aspecto | Antes | Después | Ganancia |
|--------|-------|---------|----------|
| Tiempo Feedback | 4-6 horas | 12-15 min | **95% reduction** |
| Tests a Ejecutar | 100% (394) | ~5-15% (37) | **85-90% savings** |
| Calidad Preservada | N/A | >= 99% bugs caught | **Guaranteed** |
| Decisiones | Manual/arbitrary | Data-driven | **99% precision** |

---

## Implementación

### Timeline Propuesto
- **Semana 1-2:** Foundation (schema + mappings)
- **Semana 3-4:** Intelligence (algorithms)
- **Semana 5-6:** Integration (CI/CD + webhook)
- **Semana 7-8:** Learning (historical data)
- **Semana 9-10:** Optimization (performance)

**Total:** 10 semanas (2.5 meses)

---

## Documentación Complementaria

1. **REQUIREMENTS.md** - Especificación técnica completa (secciones 2.3.2 & 2.7)
2. **QA-DASHBOARD-IRMS-IMPLEMENTATION.md** - Guía de implementación paso a paso
3. [Project-Delphi Document](../dummy-data/project-Delphi) - Datos reales de ejemplo

---

## Criterios de Aceptación

✅ Cuando IRMS está completo:
- [ ] Analiza cambios de código en < 1 segundo
- [ ] Recomienda solo tests pertinentes
- [ ] 90%+ de la suite puede saltarse
- [ ] Confidence index > 0.85 en promedio
- [ ] 0 false negatives (sin bugs que escapen)
- [ ] Integración con GitHub/GitLab working
- [ ] PR comments con recomendaciones
- [ ] CI/CD pipeline ejecuta solo recommended tests
- [ ] Resultados se capturan para learning
- [ ] Accuracy mejora con el tiempo

---

## Preguntas Frecuentes

**P: ¿Qué pasa si IRMS se equivoca y faltan bugs?**  
R: Es raro (< 1% histórico) pero si ocurre:
1. Se captura como "false negative"
2. Se analiza raíz causa
3. Se ajustan weights
4. Próximas recomendaciones son más conservadoras

**P: ¿Puedo ejecutar todos los tests si quiero?**  
R: Sí, siempre. IRMS es una recomendación, no mandatorio. Pero si corres 100%, pierdes los beneficios de velocidad.

**P: ¿Qué componentes necesito implementar first?**  
R: En orden:
1. Code-to-component mapping (manual, uno-time)
2. Test-to-component mapping (manual, uno-time)
3. Regression mapping engine (algoritmo)
4. Confidence calculator (algoritmo)
5. API endpoint
6. Integración CI/CD
7. Historical data learning

**P: ¿Cómo sé que las recomendaciones son confiables?**  
R: Cada recomendación incluye:
- Confidence score (0-1)
- Histórico de cambios similares (#)
- Tasa de false negatives en cambios similares
- Bugs found / total executions (precisión)

---

## Contacto & Preguntas

**Cambios Propuestos Por:** Lau Hernández  
**Fecha:** May 4, 2026  
**Referencia:** INTEGRITY Project IRMS Specification

Para preguntas o sugerencias, contactar al equipo de calidad.
