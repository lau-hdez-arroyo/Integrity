# Architecture - Diseño y Estructura del Sistema

Esta carpeta contiene documentación sobre la **arquitectura, diseño y estructura técnica** de INTEGRITY.

## 📄 Documentos

### [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
Especificación del modelo de datos PostgreSQL:
- **Tablas principales** - users, projects, test_executions, etc.
- **Relaciones** - Foreign keys, constraints
- **Índices** - Performance optimization
- **Row-Level Security** - Data isolation por project

### [FRONTEND_DESIGN.md](./FRONTEND_DESIGN.md)
Arquitectura del frontend React:
- **Componentes** - Reusable UI components
- **Páginas** - Page structures y layouts
- **Routing** - React Router setup
- **State Management** - Context API usage
- **Styling** - Material-UI theme customization

### [BACKEND_TESTING.md](./BACKEND_TESTING.md)
Strategy y framework de testing:
- **Test pyramid** - Unit, integration, E2E
- **Coverage goals** - Métricas de cobertura
- **Test data** - Fixtures y seeding
- **CI/CD integration** - Automated testing

### [ADVANCED_COMPONENTS.md](./ADVANCED_COMPONENTS.md)
Componentes y patrones avanzados:
- **Complex components** - Código de ejemplo
- **Design patterns** - Best practices
- **Error handling** - Error boundaries
- **Performance** - Optimization techniques

---

## 🎯 Guías de Referencia Rápida

### Para Frontend Developers
1. Lee **FRONTEND_DESIGN.md** para entender la estructura
2. Revisa **ADVANCED_COMPONENTS.md** para patrones

### Para Backend Developers
1. Lee **DATABASE_SCHEMA.md** para entender el modelo
2. Revisa **BACKEND_TESTING.md** para testing strategy

### Para System Architects
1. Lee **DATABASE_SCHEMA.md** para scalability
2. Revisa **ADVANCED_COMPONENTS.md** para patterns

---

## 📊 Stack Tecnológico

### Frontend
- React 18 + Vite
- Material-UI v5
- React Router v6
- Context API para state management

### Backend
- Node.js + Express
- PostgreSQL (Supabase)
- JWT authentication

### Database
- Supabase PostgreSQL
- Row-Level Security habilitado
- Migrations con Flyway/Liquibase

---

## 🔗 Relaciones Entre Documentos

```
DATABASE_SCHEMA.md
    ↓
FRONTEND_DESIGN.md (usa schema para qué datos mostrar)
BACKEND_TESTING.md (usa schema para test fixtures)
    ↓
ADVANCED_COMPONENTS.md (implementa patterns)
```

---

## ✅ Checklist de Cobertura Arquitectónica

- [x] Schema de BD documentado
- [x] Frontend architecture documentada
- [x] Testing strategy definida
- [ ] API gateway architecture
- [ ] Caching strategy
- [ ] Message queue architecture
- [ ] Monitoring architecture
- [ ] Disaster recovery procedures

---

## 📝 Versionado

**Última actualización:** May 4, 2026  
**Próxima revisión:** June 1, 2026
