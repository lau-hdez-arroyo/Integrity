# 🗺️ MAPA VISUAL - IMPORTACIÓN DE DATOS

## 🎯 Flujo Completo en 5 Pasos

```
┌────────────────────────────────────────────────────────────────┐
│                    STEP 1: EXTRAER DATOS                       │
│                                                                │
│  Tu App (Base datos / API)                                    │
│  └─→ 02-EXTRACT-PROMPT.md                                     │
│      └─→ Usar Claude / ChatGPT / Gemini                       │
│          └─→ Obtener JSON                                      │
│              └─→ Guardar en seed-data.json                     │
└────────────────────────────────────────────────────────────────┘
                            ⬇️
┌────────────────────────────────────────────────────────────────┐
│               STEP 2: VALIDAR JSON                             │
│                                                                │
│  seed-data.json                                                │
│  └─→ Verifica estructura                                       │
│      └─→ Verifica tipos de datos                               │
│          └─→ Verifica relaciones                               │
│              └─→ ✅ JSON Válido                                 │
└────────────────────────────────────────────────────────────────┘
                            ⬇️
┌────────────────────────────────────────────────────────────────┐
│                STEP 3: IMPORTAR A SUPABASE                     │
│                                                                │
│  npm run import-data                                           │
│  └─→ scripts/import-data.js                                    │
│      └─→ Conecta a Supabase                                    │
│          └─→ Importa cada tabla (en orden)                     │
│              └─→ ✅ Datos cargados                              │
└────────────────────────────────────────────────────────────────┘
                            ⬇️
┌────────────────────────────────────────────────────────────────┐
│             STEP 4: VERIFICAR EN DASHBOARDS                    │
│                                                                │
│  http://localhost:5175                                         │
│  └─→ Dashboard muestra datos                                   │
│      └─→ Heat maps con módulos                                 │
│          └─→ Test executions con resultados                    │
│              └─→ ✅ ¡Listo!                                     │
└────────────────────────────────────────────────────────────────┘
```

---

## 📊 Orden de Importación (Importante!)

El script importa en este orden específico para mantener integridad referencial:

```
1. USERS
   ├─ Crea usuarios base
   └─→ Genera UUIDs para usar en siguientes pasos

2. PROJECTS
   ├─ Crea proyectos
   ├─ Vincula con users (created_by_email)
   └─→ Genera project IDs para siguientes pasos

3. PROJECT_MEMBERS
   ├─ Asigna usuarios a proyectos
   ├─ Usa: project_id (del paso 2) + user_email (del paso 1)
   └─→ Establece roles

4. HEAT_MAPS
   ├─ Carga módulos por proyecto
   ├─ Usa: project_id (del paso 2)
   └─→ Define cobertura y riesgo

5. TEST_EXECUTIONS
   ├─ Carga resultados de tests
   ├─ Usa: project_id (del paso 2)
   └─→ Registra métricas

6. RISK_ASSESSMENTS
   ├─ Carga evaluaciones de riesgo
   ├─ Usa: project_id (del paso 2)
   └─→ Vincula risks y recommendations
```

---

## 🔗 Relaciones Entre Tablas

```
                        USERS
                         │
                         │
                    created_by (FK)
                         │
                         ▼
                      PROJECTS
                    ┌────┴────────┬────────────┬────────────┐
                    │             │            │            │
                    ▼             ▼            ▼            ▼
              PROJECT_       HEAT_MAPS   TEST_EXEC.   RISK_ASSESS.
              MEMBERS
                    │
                    │
              project_id/user_id
                    │
                    ▼
              (Vincula usuarios
                 a proyectos)

Validaciones Automáticas:
✓ Cada PROJECT_MEMBER.user_email → debe existir en USERS
✓ Cada PROJECT_MEMBER.project_name → debe existir en PROJECTS
✓ Cada HEAT_MAP.project_name → debe existir en PROJECTS
✓ Cada TEST_EXEC.project_name → debe existir en PROJECTS
✓ Cada RISK_ASSESS.project_name → debe existir en PROJECTS
```

---

## 📂 Estructura de Carpetas

```
C:\Repos\Integrity\Integrity\
│
├── 📂 docs/
│   ├── 📂 data-import/          ← ¡Documentación aquí!
│   │   ├── README.md            ← Índice de documentación
│   │   ├── 00-QUICK-START.md    ← Guía rápida
│   │   ├── 01-DATA-SPEC.md      ← Especificación
│   │   ├── 02-EXTRACT-PROMPT.md ← Prompt
│   │   └── 03-PROCESS-FLOWCHART.md ← Este archivo
│   │
│   ├── ADVANCED_COMPONENTS.md
│   ├── API_REFERENCE.md
│   ├── DATABASE_SCHEMA.md
│   └── ... (otros documentos)
│
├── 📂 scripts/
│   ├── import-data.js           ← Script principal
│   ├── validate-supabase.js
│   ├── seed-database.js
│   ├── inspect-schema.js
│   └── inspect-columns.js
│
├── seed-data.json                ← Aquí va tu JSON (después de extraer)
├── package.json
└── README.md                     ← README principal
```

---

## 🚀 PASO A PASO COMPLETO

### **PASO 1: Leer Documentación** (2 min)

Lee estos archivos en orden:

1. Este archivo (03-PROCESS-FLOWCHART.md)
2. 00-QUICK-START.md
3. 02-EXTRACT-PROMPT.md

---

### **PASO 2: Extraer Datos** (5-10 min)

**Archivo:** `02-EXTRACT-PROMPT.md`

```bash
# 1. Abre 02-EXTRACT-PROMPT.md
# 2. Lee el PROMPT genérico
# 3. Cópialo completo
# 4. Ve a: https://chat.openai.com/
#    O: https://claude.ai/
#    O: https://gemini.google.com/
# 5. Pega el prompt
# 6. Personaliza: Reemplaza [NOMBRE_DE_TU_APP]
# 7. Agrega contexto de tu app
# 8. Presiona Enter
# 9. Copia el JSON resultante
```

---

### **PASO 3: Crear seed-data.json** (2 min)

Guarda el JSON obtenido:

```bash
# Opción A: En VSCode
# 1. New File
# 2. Name: seed-data.json
# 3. Pega el JSON
# 4. Ctrl+S para guardar

# Opción B: En PowerShell
$json = @"
{
  "users": [...],
  "projects": [...]
}
"@
$json | Out-File seed-data.json -Encoding UTF8

# Ubicación correcta:
# C:\Repos\Integrity\Integrity\seed-data.json
```

---

### **PASO 4: Validar JSON** (2 min)

Verifica que sea válido ANTES de importar:

```bash
# Opción A: En VSCode
# 1. Click derecho en seed-data.json
# 2. "Open with" → "JSON Preview"
# 3. Si hay error, lo mostrará

# Opción B: En línea
# 1. Ve a https://jsonlint.com/
# 2. Pega el contenido
# 3. Valida

# Opción C: En PowerShell
Get-Content seed-data.json | ConvertFrom-Json
# Si hay error, te lo dirá
```

---

### **PASO 5: Importar Datos** (2 min)

```bash
# En PowerShell, en directorio del proyecto:
cd C:\Repos\Integrity\Integrity

# Opción A: Importar seed-data.json (nombre por defecto)
npm run import-data

# Opción B: Importar archivo específico
npm run import-data -- --file=my-data.json

# Espera el output:
# ✓ Imported X users
# ✓ Imported Y projects
# ... etc
# ✅ IMPORT COMPLETE
```

---

### **PASO 6: Verificar en Dashboards** (1 min)

```bash
# 1. Asegúrate que dev server está corriendo
npm run dev

# 2. Abre navegador
http://localhost:5175

# 3. Ve a Dashboard
# 4. Deberías ver:
#    - Proyectos cargados
#    - Heat maps con módulos
#    - Test results
#    - Risk assessments
```

---

## 📋 Campos en Cada Tabla

### **USERS**
```
email:          user@company.com (único, válido)
name:           Full Name (no vacío)
role:           admin|qa|developer|executive|manager
```

### **PROJECTS**
```
name:           Project Name (único)
description:    Brief description (no vacío)
repo:           https://github.com/... (URL válida)
created_by_email: admin@company.com (debe existir en users)
```

### **PROJECT_MEMBERS**
```
project_name:   Project Name (debe existir en projects)
user_email:     user@company.com (debe existir en users)
role:           qa_lead|developer|manager|tester
```

### **HEAT_MAPS**
```
project_name:   Project Name (debe existir en projects)
module_name:    Module/Component name (único por proyecto)
coverage_percentage: 0-100 (número entre 0 y 100)
risk_level:     low|medium|high|critical
```

### **TEST_EXECUTIONS**
```
project_name:   Project Name (debe existir en projects)
total_tests:    número > 0
passed_tests:   número >= 0
failed_tests:   número >= 0
skipped_tests:  número >= 0
coverage_percentage: 0-100
execution_time_seconds: número > 0
status:         pending|running|completed|failed

Validación: passed + failed + skipped <= total
```

### **RISK_ASSESSMENTS**
```
project_name:   Project Name (debe existir en projects)
risk_score:     0-10 (número)
risk_level:     low|medium|high|critical
identified_risks: ["Risk 1", "Risk 2", ...] (array, mínimo 1)
recommendations: ["Rec 1", "Rec 2", ...] (array, mínimo 1)

Validación: risk_level debe corresponder con risk_score
- 0-3: low
- 4-6: medium
- 7-8: high
- 9-10: critical
```

---

## ✅ Checklist Completo

- [ ] Leí 00-QUICK-START.md
- [ ] Leí 02-EXTRACT-PROMPT.md
- [ ] Extrae datos de mi app usando el prompt
- [ ] Creé archivo seed-data.json
- [ ] Validé el JSON (sin errores de sintaxis)
- [ ] Verificó mínimo 2 usuarios
- [ ] Verificó mínimo 1 proyecto
- [ ] Verificó que cada proyecto tiene mínimo 1 miembro
- [ ] Verificó que cada proyecto tiene mínimo 2 módulos (heat_maps)
- [ ] Verificó que cada proyecto tiene mínimo 1 ejecución de test
- [ ] Verificó que cada proyecto tiene mínimo 1 evaluación de riesgo
- [ ] Verificó que todos los emails son únicos
- [ ] Verificó que los nombres de proyectos coinciden exactamente en todas las tablas
- [ ] Ejecuté: npm run import-data
- [ ] Esperé a que termine sin errores
- [ ] Abrí http://localhost:5175 y verifiqué datos

---

## 🆘 Si Algo Sale Mal

### Error: "JSON Parse Error"
```
❌ seed-data.json tiene error de sintaxis
✓ Solución: 
  - Valida en https://jsonlint.com/
  - Verifica comillas, comas, llaves
  - Usa formato UTF-8 (sin BOM)
```

### Error: "Email already exists"
```
❌ Hay emails duplicados
✓ Solución: 
  - Búsqueda: Ctrl+F en seed-data.json
  - Verifica que cada email aparezca solo una vez
  - Elimina duplicados
```

### Error: "Project not found"
```
❌ Nombre de proyecto no coincide
✓ Solución: 
  - En projects: "My Project"
  - En heat_maps: "My Project" (EXACTO, mismo case)
  - En test_executions: "My Project" (EXACTO)
  - En project_members: "My Project" (EXACTO)
  - En risk_assessments: "My Project" (EXACTO)
```

### Error: "Invalid coverage percentage"
```
❌ Coverage fuera de rango 0-100
✓ Solución: 
  - Verifica que sea número entre 0 y 100
  - No incluyas % en el JSON (solo número)
  - Ejemplo: 85 (no "85%")
```

### Error: "Invalid risk score"
```
❌ Risk score fuera de rango 0-10
✓ Solución: 
  - Verifica que sea número entre 0 y 10
  - Puede ser decimal: 6.5
  - Rango: 0 (bajo riesgo) - 10 (máximo riesgo)
```

### Error: "Supabase connection failed"
```
❌ No puede conectar a Supabase
✓ Solución:
  - npm run validate (verifica conexión)
  - Revisa credenciales en backend/.env.local
  - Verifica que tienes internet
  - Verifica Supabase status en supabase.com
```

### Error: "Invalid email format"
```
❌ Email no tiene formato correcto
✓ Solución:
  - ✓ user@company.com
  - ✓ john.doe@example.org
  - ✗ john@company (falta dominio)
  - ✗ john company.com (falta @)
```

---

## 📞 Documentos de Referencia

| Archivo | Propósito | Leer Cuando |
|---------|-----------|-----------|
| 00-QUICK-START.md | Flujo de 5 pasos | Necesitas ir rápido |
| 01-DATA-SPEC.md | Especificación completa | Necesitas detalles de estructura |
| 02-EXTRACT-PROMPT.md | Prompt genérico | Necesitas extraer datos |
| Este archivo | Mapa visual | Necesitas ver el flujo completo |

---

## 🎓 Ejemplo Mínimo Válido

**seed-data.json:**
```json
{
  "users": [
    {"email": "admin@test.com", "name": "Admin", "role": "admin"},
    {"email": "qa@test.com", "name": "QA", "role": "qa"}
  ],
  "projects": [
    {
      "name": "TestProj",
      "description": "Test",
      "repo": "https://github.com/test/proj",
      "created_by_email": "admin@test.com"
    }
  ],
  "project_members": [
    {"project_name": "TestProj", "user_email": "qa@test.com", "role": "qa_lead"}
  ],
  "heat_maps": [
    {"project_name": "TestProj", "module_name": "API", "coverage_percentage": 85, "risk_level": "medium"},
    {"project_name": "TestProj", "module_name": "UI", "coverage_percentage": 92, "risk_level": "low"}
  ],
  "test_executions": [
    {
      "project_name": "TestProj",
      "total_tests": 100,
      "passed_tests": 90,
      "failed_tests": 5,
      "skipped_tests": 5,
      "coverage_percentage": 88,
      "execution_time_seconds": 60,
      "status": "completed"
    }
  ],
  "risk_assessments": [
    {
      "project_name": "TestProj",
      "risk_score": 4,
      "risk_level": "medium",
      "identified_risks": ["Low API coverage", "Flaky tests"],
      "recommendations": ["Add tests", "Fix flaky"]
    }
  ]
}
```

**Importar:**
```bash
npm run import-data

# Debería mostrar:
# ✓ Imported 2 users
# ✓ Imported 1 projects
# ✓ Imported 1 project_members
# ✓ Imported 2 heat_maps
# ✓ Imported 1 test_executions
# ✓ Imported 1 risk_assessments
# ✅ IMPORT COMPLETE
```

---

## 🚀 Resumen Rápido

```
1️⃣  Lee 00-QUICK-START.md (2 min)
2️⃣  Lee 02-EXTRACT-PROMPT.md (2 min)
3️⃣  Extrae datos (usa ChatGPT/Claude) (5-10 min)
4️⃣  Crea seed-data.json (2 min)
5️⃣  Valida JSON (2 min)
6️⃣  Ejecuta: npm run import-data (2 min)
7️⃣  Abre http://localhost:5175 (1 min)
8️⃣  ¡Listo! Total: ~20 minutos
```

---

## 💡 Consejos Finales

1. **Comienza pequeño** - Usa el ejemplo mínimo válido primero
2. **Valida JSON siempre** - Es lo que más tiempo te ahorra después
3. **Verifica nombres exactos** - Los nombres de proyectos deben coincidir exactamente
4. **Los IDs se generan solos** - No incluyas id, created_at, updated_at
5. **Una tabla a la vez** - Si hay error, es más fácil identificar cuál es
6. **Usa el orden correcto** - USERS → PROJECTS → PROJECT_MEMBERS → HEAT_MAPS → TEST_EXECUTIONS → RISK_ASSESSMENTS

---

**¿Necesitas ayuda? Revisa los archivos de referencia o contacta con el equipo de desarrollo.** 📞

**Siguiente: Vuelve a 00-QUICK-START.md para empezar** 🚀
