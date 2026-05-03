# 🔧 Scripts de Utilidad - INTEGRITY

Esta carpeta contiene scripts útiles para desarrollo y testing de INTEGRITY.

---

## 📥 Import Data (`import-data.js`)

Script principal para importar datos a Supabase desde un archivo JSON.

### Uso

```bash
# Importar desde seed-data.json (por defecto)
npm run import-data

# Importar desde archivo específico
npm run import-data -- --file=custom-data.json
```

### Validaciones Automáticas

- ✅ Estructura JSON correcta
- ✅ Emails únicos
- ✅ Relaciones referencial válidas
- ✅ Valores en rangos permitidos
- ✅ Nombres de proyectos consistentes

---

## 🎲 Generate Dummy Data (`generate-dummy-data.js`)

Script para generar datos de prueba aleatorios y realistas.

### Uso

```bash
# Generar datos y guardar en seed-data.json
node scripts/generate-dummy-data.js

# Generar con nombre de archivo personalizado
node scripts/generate-dummy-data.js --file=test-data.json

# Generar con más proyectos
node scripts/generate-dummy-data.js --projects=5

# Combinado
node scripts/generate-dummy-data.js --file=large-dataset.json --projects=10
```

### Datos Generados

- **5 usuarios** - Con roles variados (admin, qa, developer, executive, manager)
- **Proyectos** - Nombres y descripciones realistas
- **Miembros** - Asignación aleatoria a proyectos (2-4 por proyecto)
- **Heat Maps** - Módulos con cobertura y riesgo
- **Test Executions** - 2-3 ejecuciones por proyecto con resultados variados
- **Risk Assessments** - Evaluaciones automáticas basadas en cobertura

### Configuración

Personaliza los datos editando las arrays al inicio del script:

```javascript
const firstNames = ['Laura', 'Carlos', 'Sofia', ...];
const projectNames = ['PayFlow Platform', 'Mobile Banking App', ...];
const moduleNames = ['Authentication Service', ...];
```

---

## ✅ Validate Supabase (`validate-supabase.js`)

Script para validar la conexión a Supabase y verificar la estructura de base de datos.

### Uso

```bash
npm run validate
```

### Verificaciones

- ✅ Conexión a Supabase
- ✅ Todas las tablas existen
- ✅ Estructura de columnas correcta
- ✅ Pool de conexión PostgreSQL funcionando

---

## 🔍 Inspect Scripts

### Inspect Schema (`inspect-schema.js`)

Ver lista de todas las tablas y sus registros.

```bash
node scripts/inspect-schema.js
```

### Inspect Columns (`inspect-columns.js`)

Ver estructura detallada de columnas en cada tabla.

```bash
node scripts/inspect-columns.js
```

---

## 🌱 Seed Database (`seed-database.js`)

Script para cargar datos de ejemplo predefinidos (uso avanzado).

```bash
npm run seed
```

---

## 📊 Ejemplo Completo - Flujo Recomendado

### 1. Generar Datos de Prueba

```bash
# Opción A: Datos mínimos (ya existe)
cat seed-data.json | head

# Opción B: Generar nuevos datos aleatorios
node scripts/generate-dummy-data.js --projects=3

# Opción C: Dataset grande para testing
node scripts/generate-dummy-data.js --file=large-dataset.json --projects=10
```

### 2. Validar Estructura

```bash
# Verificar que el JSON es válido
npm run validate

# Ver detalles de la base de datos
node scripts/inspect-schema.js
```

### 3. Importar Datos

```bash
# Importar los datos generados
npm run import-data

# O con archivo personalizado
npm run import-data -- --file=large-dataset.json
```

### 4. Verificar en la App

```bash
# Abrir navegador
http://localhost:5175

# Deberías ver:
# ✓ Proyectos en Dashboard
# ✓ Heat maps con módulos
# ✓ Test results
# ✓ Risk assessments
```

---

## 🎯 Casos de Uso

### Testing Local

```bash
# Generar datos test con 5 proyectos
node scripts/generate-dummy-data.js --file=test.json --projects=5

# Importar
npm run import-data -- --file=test.json

# Probar app
npm run dev
```

### Performance Testing

```bash
# Dataset grande
node scripts/generate-dummy-data.js --file=perf.json --projects=20

# Importar y monitorear
npm run import-data -- --file=perf.json
```

### Demo con Datos Realistas

```bash
# Los datos ya están generados
npm run import-data

# Abrir presentación
http://localhost:5175
```

---

## 📁 Archivos Disponibles

| Script | Propósito | Comando |
|--------|-----------|---------|
| `import-data.js` | Importar JSON a Supabase | `npm run import-data` |
| `generate-dummy-data.js` | Generar datos aleatorios | `node scripts/generate-dummy-data.js` |
| `validate-supabase.js` | Validar conexión | `npm run validate` |
| `seed-database.js` | Seed básico | `npm run seed` |
| `inspect-schema.js` | Ver estructura | `node scripts/inspect-schema.js` |
| `inspect-columns.js` | Ver columnas | `node scripts/inspect-columns.js` |

---

## 🚀 Quick Start

```bash
# 1. Generar datos
node scripts/generate-dummy-data.js

# 2. Validar
npm run validate

# 3. Importar
npm run import-data

# 4. Abrir app
npm run dev
# Luego http://localhost:5175
```

---

## 📝 Notas

- **Datos Aleatorios**: Cada ejecución de generate-dummy-data.js produce datos diferentes
- **Relaciones**: Los scripts garantizan integridad referencial automáticamente
- **Validaciones**: import-data.js valida antes de insertar
- **Rollback**: Los datos anteriores se preservan; los nuevos se agregan

---

## 🆘 Solución de Problemas

### Error: "Connection refused"
```bash
# Validar Supabase está activo
npm run validate
```

### Error: "Invalid JSON"
```bash
# Generar nuevamente
node scripts/generate-dummy-data.js

# O validar JSON
npm run import-data
```

### Datos No Aparecen
```bash
# Verificar integridad
node scripts/inspect-schema.js

# Ver últimos registros
node scripts/inspect-columns.js
```

---

**Próximo paso**: [Ir a docs/data-import/00-QUICK-START.md](../docs/data-import/00-QUICK-START.md)
