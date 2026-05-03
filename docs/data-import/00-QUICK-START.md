# 🚀 QUICK START - Importar Datos en 5 Pasos

## ⏱️ Tiempo: 15-20 minutos

---

## 📋 Los 5 Pasos

### **PASO 1: Leer el Prompt** (2 min)

```
Archivo: 02-EXTRACT-PROMPT.md
```

Lee el archivo completo. Contiene el prompt genérico que usarás para extraer datos.

---

### **PASO 2: Extraer Datos de tu App** (5-10 min)

```
1. Copia el PROMPT completo de 02-EXTRACT-PROMPT.md
2. Ve a ChatGPT / Claude / Gemini
3. Pega el PROMPT
4. Personaliza: Reemplaza [NOMBRE_DE_TU_APP]
5. Agrega contexto de tu app
6. Presiona Enter
7. Copia el JSON resultante
```

**Ejemplo:**

Tu prompt personalizado podría ser:

```
[PROMPT GENÉRICO ARRIBA]

MI APP: Sistema de Gestión de Tests
...
```

Después de ejecutar, obtendrás algo como:

```json
{
  "users": [...],
  "projects": [...],
  ...
}
```

---

### **PASO 3: Crear `seed-data.json`** (2 min)

Guarda el JSON en la raíz del proyecto:

**Opción A: En VSCode**
```
1. New File
2. Name: seed-data.json
3. Pega el JSON
4. Ctrl+S
```

**Opción B: En PowerShell**
```powershell
# En C:\Repos\Integrity\Integrity\

# Opción simple (si tienes el JSON en variable $json)
$json | Out-File seed-data.json -Encoding UTF8

# O directamente
@'
{
  "users": [...],
  "projects": [...]
}
'@ | Out-File seed-data.json -Encoding UTF8
```

**Ubicación correcta:**
```
C:\Repos\Integrity\Integrity\seed-data.json
```

---

### **PASO 4: Validar JSON** (2 min)

Antes de importar, valida que el JSON sea correcto:

**Opción A: En VSCode**
```
1. Click derecho en seed-data.json
2. "Open with" → "JSON Preview"
3. Si hay error, lo mostrará
```

**Opción B: En línea**
```
1. Ve a https://jsonlint.com/
2. Copia el contenido de seed-data.json
3. Valida
```

**Opción C: En PowerShell**
```powershell
Get-Content seed-data.json | ConvertFrom-Json
# Si hay error, te lo dirá
```

---

### **PASO 5: Importar Datos** (2 min)

```bash
cd C:\Repos\Integrity\Integrity

# Importar desde seed-data.json
npm run import-data

# Espera el output:
# ✓ Imported 3 users
# ✓ Imported 2 projects
# ✓ Imported 5 project members
# ✓ Imported 8 heat maps
# ✓ Imported 2 test executions
# ✓ Imported 2 risk assessments
# ✅ IMPORT COMPLETE
```

---

## ✅ Verificar que Funcionó

Abre el navegador:

```
http://localhost:5175
```

Deberías ver:
- ✅ Proyectos cargados en el Dashboard
- ✅ Heat maps con módulos
- ✅ Test executions con resultados
- ✅ Risk assessments

---

## 🎯 Ejemplo Mínimo Válido

Si tienes dudas, copia este JSON mínimo válido:

```json
{
  "users": [
    {
      "email": "admin@test.com",
      "name": "Admin User",
      "role": "admin"
    },
    {
      "email": "qa@test.com",
      "name": "QA Lead",
      "role": "qa"
    }
  ],
  "projects": [
    {
      "name": "Test Project",
      "description": "A test project",
      "repo": "https://github.com/test/project",
      "created_by_email": "admin@test.com"
    }
  ],
  "project_members": [
    {
      "project_name": "Test Project",
      "user_email": "qa@test.com",
      "role": "qa_lead"
    }
  ],
  "heat_maps": [
    {
      "project_name": "Test Project",
      "module_name": "API",
      "coverage_percentage": 85,
      "risk_level": "medium"
    },
    {
      "project_name": "Test Project",
      "module_name": "Auth",
      "coverage_percentage": 95,
      "risk_level": "low"
    }
  ],
  "test_executions": [
    {
      "project_name": "Test Project",
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
      "project_name": "Test Project",
      "risk_score": 4.5,
      "risk_level": "medium",
      "identified_risks": [
        "Low API coverage",
        "Flaky tests"
      ],
      "recommendations": [
        "Add more tests",
        "Fix flaky tests"
      ]
    }
  ]
}
```

---

## 📋 Checklist de Validación

Antes de importar, verifica:

- [ ] JSON es válido (sin errores de sintaxis)
- [ ] Mínimo 2 usuarios
- [ ] Mínimo 1 proyecto
- [ ] Todos los proyectos tienen mínimo 1 miembro
- [ ] Todos los proyectos tienen mínimo 2 módulos (heat_maps)
- [ ] Todos los proyectos tienen mínimo 1 ejecución de test
- [ ] Todos los proyectos tienen mínimo 1 evaluación de riesgo
- [ ] Todos los emails son únicos
- [ ] Nombres de proyectos coinciden exactamente en todas las tablas
- [ ] Coverage % entre 0-100
- [ ] Risk scores entre 0-10
- [ ] Status en valores permitidos (completed, pending, running, failed)

---

## 🆘 Errores Comunes

### "JSON Parse Error"
```
❌ El JSON tiene error de sintaxis
✓ Solución: Valida en https://jsonlint.com/
```

### "Email already exists"
```
❌ Hay emails duplicados
✓ Solución: Cada email debe aparecer solo una vez
```

### "Project not found"
```
❌ Nombre de proyecto no coincide entre tablas
✓ Solución: 
  - En projects: "My Project"
  - En heat_maps: "My Project" (exacto)
  - En test_executions: "My Project" (exacto)
```

### "Coverage percentage must be between 0 and 100"
```
❌ Coverage fuera de rango
✓ Solución: Verifica que sea número entre 0 y 100
```

### "Risk score must be between 0 and 10"
```
❌ Risk score inválido
✓ Solución: Debe ser número entre 0 y 10
```

---

## 📞 ¿Necesitas Más Detalles?

| Si necesitas... | Lee... |
|---|---|
| Estructura exacta de datos | [01-DATA-SPEC.md](01-DATA-SPEC.md) |
| Prompt detallado | [02-EXTRACT-PROMPT.md](02-EXTRACT-PROMPT.md) |
| Flujo visual completo | [03-PROCESS-FLOWCHART.md](03-PROCESS-FLOWCHART.md) |

---

## 🎯 Resumen

```
1️⃣  Lee: 02-EXTRACT-PROMPT.md
2️⃣  Extrae: Datos de tu app (ChatGPT/Claude)
3️⃣  Crea: seed-data.json
4️⃣  Valida: JSON válido
5️⃣  Importa: npm run import-data
6️⃣  Verifica: http://localhost:5175
```

**¡Listo en 15 minutos!** ✨

---

## 💡 Consejos

1. **Comienza pequeño** - Usa el ejemplo mínimo válido primero
2. **Valida JSON siempre** - Es lo que más tiempo te ahorra
3. **Verifica nombres exactos** - Los nombres de proyectos deben coincidir
4. **Los IDs se generan solos** - No incluyas id, created_at, etc.

---

**¿Listo? → Abre [02-EXTRACT-PROMPT.md](02-EXTRACT-PROMPT.md)** 🚀
