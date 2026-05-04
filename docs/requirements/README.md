# Requirements - Especificaciones del Proyecto

Esta carpeta contiene la documentación de **requerimientos funcionales y no-funcionales** de INTEGRITY.

## 📄 Documentos

### [REQUIREMENTS.md](./REQUIREMENTS.md)
Documento completo de requerimientos que incluye:
- **Visión General** - Propósito y pilares tecnológicos
- **Requerimientos Funcionales** - Módulos, features, endpoints
- **Requerimientos No-Funcionales** - Performance, security, scalability
- **Arquitectura** - Stack tecnológico, flujos de autenticación
- **API Endpoints** - Referencia completa
- **Roadmap** - 7+ fases de implementación
- **Criterios de Aceptación** - Tests de validación

**Status:** ✅ Baseline completo con IRMS (May 4, 2026)

**Últimas Actualizaciones:**
- Sección 2.3.2: QA Dashboard expandido con IRMS specs
- Sección 2.7: Nuevo módulo Intelligent Regression Mapping System (IRMS)
- Secciones reordenadas: 2.8 (Observability), 2.9 (Predictive), 2.10 (Chaos)

### [QA-DASHBOARD-IRMS-CHANGES.md](./QA-DASHBOARD-IRMS-CHANGES.md) **✨ NEW**
Resumen de cambios al QA Dashboard e introducción del módulo IRMS:
- Qué cambió en los requerimientos
- Componentes principales del IRMS
- JSON output structure
- Nuevas tablas de base de datos
- Nuevos endpoints de API
- Restricciones & reglas
- Beneficios & timeline de implementación

**Status:** ✅ Nuevo documento de referencia rápida (May 4, 2026)

---

## 🎯 Cómo Usar Estos Documentos

### Si eres Developer
- Lee sección **2. Requerimientos Funcionales** en REQUIREMENTS.md
- Revisa **2.3.2** (QA Dashboard) y **2.7** (IRMS) para nuevas specs
- Consulta **[../architecture/QA-DASHBOARD-IRMS-IMPLEMENTATION.md](../architecture/QA-DASHBOARD-IRMS-IMPLEMENTATION.md)** para detalles de implementación

### Si eres QA
- Lee **QA-DASHBOARD-IRMS-CHANGES.md** para entender el nuevo sistema
- Revisa **2.3.2** para nuevas funcionalidades del QA Dashboard
- Consulta **Criterios de Aceptación** en REQUIREMENTS.md (Sección 8)

### Si eres Product Manager
- Lee **QA-DASHBOARD-IRMS-CHANGES.md** para resumen ejecutivo
- Revisa **Beneficios** section (95% reduction in feedback time)
- Consulta **Roadmap** en REQUIREMENTS.md (10 semanas para Phase 1-5)

### Si eres DevOps
- Revisa **2.7** (IRMS) en REQUIREMENTS.md para nuevos endpoints API
- Lee **[../architecture/QA-DASHBOARD-IRMS-IMPLEMENTATION.md](../architecture/QA-DASHBOARD-IRMS-IMPLEMENTATION.md)** para stack requirements
- Revisa nuevas tablas de BD para migration planning (5 nuevas tablas)

---

## 📊 Estado de Implementación

| Módulo | Estado | Completitud | Última Actualización |
|--------|--------|-------------|----------------------|
| Autenticación | ✅ Implementado | 100% | April 30 |
| Proyectos | ✅ Implementado | 100% | April 30 |
| Dashboards | ✅ Implementado | 80% | May 1 |
| **QA Dashboard - IRMS** | 🚀 **Especificado** | **100% spec** | **May 4** |
| Test Execution | 🔄 Parcial | 40% | April 28 |
| Risk Assessment | 🔄 Parcial | 30% | April 28 |
| Heat Maps | ✅ Básico | 60% | May 1 |
| Observability | ⏳ Planeado | 0% | - |
| Predictive Impact | ⏳ Planeado | 0% | - |
| Chaos Engineering | ⏳ Planeado | 0% | - |

---

## 🎯 Próximos Pasos

### Inmediato (Esta semana)
- [ ] **Review IRMS Specification**
  - Leer sección 2.7 en REQUIREMENTS.md
  - Validar algoritmos y formulas
  - Revisar API contracts
- [ ] **Planificar Implementation Phase 1**
  - Database schema creation
  - Component mapping setup

### Corto Plazo (Semanas 1-4)
- [ ] **Phase 1: Foundation**
  - Database tables creadas
  - Component mappings populated
  - Git diff parser implementado
- [ ] **Phase 2: Intelligence**
  - Regression mapping engine
  - Confidence calculator
  - API endpoint /analyze-changes

### Mediano Plazo (Semanas 5-10)
- [ ] **Phase 3: Integration**
  - GitHub webhook
  - CI/CD pipeline
  - PR comments
- [ ] **Phase 4: Learning**
  - Historical data collection
  - Confidence improvements
- [ ] **Phase 5: Optimization**
  - Performance tuning
  - Caching strategy

---

## 📈 IRMS - Beneficios Clave

| Métrica | Antes | Después | Mejora |
|--------|-------|---------|---------|
| **Tiempo de Feedback** | 4-6 horas | 12-15 min | ⬇️ 95% |
| **Tests a Ejecutar** | 100% (394) | ~5-15% (37) | ⬇️ 91% |
| **Calidad Preservada** | Manual | >= 99% bugs | ✅ Garantizada |
| **Decisiones** | Arbitrarias | Data-driven | ✅ Precisas |
| **Confianza Promedio** | Baja | > 0.85 | ⬆️ Alta |

---

## 🏗️ Estructura de Carpeta

```
requirements/
├── REQUIREMENTS.md                    (Full spec with IRMS)
├── QA-DASHBOARD-IRMS-CHANGES.md      (Summary of changes)
├── README.md                         (This file)
└── ...
```

---

## 📚 Documentación Relacionada

- **[../../IRMS-SUMMARY.md](../../IRMS-SUMMARY.md)** - Resumen ejecutivo visual de cambios (en raíz)
- **[../architecture/QA-DASHBOARD-IRMS-IMPLEMENTATION.md](../architecture/QA-DASHBOARD-IRMS-IMPLEMENTATION.md)** - Guía técnica de implementación (10 secciones)
- **[../dummy-data/project-Delphi](../dummy-data/project-Delphi)** - Datos reales Delphi (394 tests, ejemplo)

---

## 🔄 Versionado de Requerimientos

| Versión | Fecha | Cambios Principales |
|---------|-------|---------------------|
| 1.0 | May 4 | Baseline con Auth system completo |
| **1.1** | **May 4** | **✨ NEW: IRMS module (2.7) + Expanded QA Dashboard (2.3.2)** |
| (Próxima) | TBD | Observability Module (Pillar I) |

---

## 🤝 Cómo Contribuir

Si actualizas estos documentos:
1. Actualiza la versión en tabla de versionado
2. Documenta cambios en sección correspondiente
3. Commit a git con mensaje descriptivo
4. Notifica al equipo

---

**Última Actualización:** May 4, 2026 (v1.1 - IRMS Added)  
**Próxima Revisión:** May 25, 2026
