# Dummy Data - Datos de Prueba

Esta carpeta contiene **datos de prueba y demo** para INTEGRITY.

## 📂 Estructura

```
dummy-data/
├── project-Delphi/      # Proyecto de demo "Delphi"
├── project-PayFlow/     # Proyecto de demo "PayFlow"
├── project-Banking/     # Proyecto de demo "Banking"
└── README.md           # Este archivo
```

## 🎯 Proyectos de Demo

### Project Delphi
- **Descripción:** Sistema de gestión de riesgos
- **Test Executions:** ~150 registros
- **Risk Assessments:** ~20 registros
- **Heat Maps:** Datos por componente

### Project PayFlow
- **Descripción:** Plataforma de pagos
- **Test Executions:** ~200 registros
- **Risk Assessments:** ~25 registros

### Project Banking
- **Descripción:** Sistema de banca móvil
- **Test Executions:** ~180 registros
- **Risk Assessments:** ~22 registros

---

## 🚀 Cómo Usar

### Cargar Dummy Data
```bash
cd backend
npm run seed:dummy
```

### Resetear y Cargar
```bash
npm run full:reset   # Borra todo y carga datos frescos
```

### Crear Nuevo Proyecto de Demo
1. Crea carpeta: `project-NOMBREPROYECTO/`
2. Agrega archivos JSON con datos
3. Ejecuta seed script

---

## 📊 Formato de Datos

### test_executions.json
```json
[
  {
    "test_name": "Login Flow",
    "status": "passed",
    "duration_ms": 2345,
    "error_message": null,
    "created_at": "2026-05-04T10:00:00Z"
  }
]
```

### risk_assessments.json
```json
[
  {
    "risk_name": "Database Outage",
    "severity": "critical",
    "likelihood": "low",
    "impact": 9,
    "status": "open"
  }
]
```

### heat_maps.json
```json
[
  {
    "component_name": "Auth Module",
    "failure_count": 3,
    "total_tests": 45,
    "failure_rate": 0.067
  }
]
```

---

## 🔄 Ciclo de Vida

1. **Development** - Usa dummy data para testing
2. **Staging** - Copia de dummy data con variaciones
3. **Production** - Datos reales del cliente

---

## ⚠️ Notas Importantes

- Dummy data NO debe usarse en producción
- Contiene datos sensibles de prueba, NO desplegar públicamente
- Actualiza dummy data cuando cambies el schema

---

## 📝 Documentación Relacionada

- [Data Import](../data-import/) - Importación de datos reales
- [Database Schema](../architecture/DATABASE_SCHEMA.md) - Estructura de datos
