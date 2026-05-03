# 🎯 PROMPT GENÉRICO - Extraer Datos de Prueba

## Contexto
Tengo otra aplicación que contiene datos de:
- Usuarios del sistema
- Proyectos
- Miembros de equipos
- Módulos/componentes
- Ejecuciones de tests
- Evaluaciones de riesgo

Necesito extraer estos datos en un formato JSON específico para importarlos en INTEGRITY.

---

## 📋 PROMPT A USAR EN TUS OTRAS APPS

Copia el siguiente prompt completo y personalízalo con tu aplicación:

```
===== INSTRUCCIONES =====

Eres un asistente especializado en extracción de datos.

TAREA: Extraer datos de PayFlow y transformarlos al formato de INTEGRITY.

ESTRUCTURA DE DATOS A EXTRAER:

1. USUARIOS (6 campos)
   - ID usuario
   - Email (único, formato válido)
   - Nombre completo
   - Rol (admin, qa, developer, executive, manager)
   - Fecha creación
   - Estado (activo/inactivo)
   
   DEBES CONVERTIR ROLES:
   - "admin" → "admin"
   - "qa manager" o "qa_lead" → "qa"
   - "engineer" o "developer" → "developer"
   - "c-level" o "executive" → "executive"
   - "project manager" o "tech lead" → "manager"

2. PROYECTOS (4 campos)
   - Nombre del proyecto
   - Descripción breve
   - URL del repositorio (GitHub, GitLab, etc.)
   - Usuario administrador (email)
   
   NOTA: Si no existe repositorio, usar: "https://github.com/company/[project-slug]"

3. MIEMBROS DE PROYECTO (3 campos)
   - Nombre del proyecto
   - Email del usuario
   - Rol en proyecto (qa_lead, developer, manager, tester)
   
   DEBES CONVERTIR:
   - "qa manager" → "qa_lead"
   - "engineer" → "developer"
   - "test engineer" → "tester"
   - "project manager" → "manager"

4. MÓDULOS/COMPONENTES (4 campos)
   - Nombre del proyecto
   - Nombre del módulo/componente
   - % de cobertura de tests (0-100)
   - Nivel de riesgo (low, medium, high, critical)
   
   CÁLCULO DE RIESGO:
   - Cobertura 90-100%: low
   - Cobertura 75-89%: medium
   - Cobertura 50-74%: high
   - Cobertura <50%: critical

5. EJECUCIONES DE TESTS (8 campos)
   - Nombre del proyecto
   - Total de tests
   - Tests pasados
   - Tests fallidos
   - Tests saltados
   - % Cobertura total
   - Tiempo ejecución (segundos)
   - Estado (pending, running, completed, failed)

6. EVALUACIÓN DE RIESGOS (5 campos)
   - Nombre del proyecto
   - Score de riesgo (0-10)
   - Nivel de riesgo (low, medium, high, critical)
   - Array de riesgos identificados (min 2-3 items)
   - Array de recomendaciones (min 2-3 items)

VALIDACIONES OBLIGATORIAS:

✓ Emails únicos y válidos (formato: user@domain.com)
✓ Coverage % entre 0-100
✓ Risk score entre 0-10
✓ Status en lista permitida
✓ Mínimo 2 usuarios
✓ Mínimo 1 proyecto
✓ Mínimo 1 miembro por proyecto
✓ Mínimo 2 módulos por proyecto
✓ Al menos 1 ejecución de test
✓ Al menos 1 evaluación de riesgo

FORMATO DE SALIDA REQUERIDO:

Retorna ÚNICAMENTE un JSON válido sin explicaciones:

{
  "users": [
    {
      "email": "user@company.com",
      "name": "Full Name",
      "role": "admin|qa|developer|executive|manager"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief description",
      "repo": "https://github.com/company/project",
      "created_by_email": "admin@company.com"
    }
  ],
  "project_members": [
    {
      "project_name": "Project Name",
      "user_email": "user@company.com",
      "role": "qa_lead|developer|manager|tester"
    }
  ],
  "heat_maps": [
    {
      "project_name": "Project Name",
      "module_name": "Module Name",
      "coverage_percentage": 85,
      "risk_level": "low|medium|high|critical"
    }
  ],
  "test_executions": [
    {
      "project_name": "Project Name",
      "total_tests": 450,
      "passed_tests": 425,
      "failed_tests": 20,
      "skipped_tests": 5,
      "coverage_percentage": 87.5,
      "execution_time_seconds": 145,
      "status": "completed|pending|running|failed"
    }
  ],
  "risk_assessments": [
    {
      "project_name": "Project Name",
      "risk_score": 6.5,
      "risk_level": "medium",
      "identified_risks": [
        "Risk 1",
        "Risk 2",
        "Risk 3"
      ],
      "recommendations": [
        "Rec 1",
        "Rec 2",
        "Rec 3"
      ]
    }
  ]
}

IMPORTANTE:
- Sin comentarios en el JSON
- Sin propiedades adicionales
- Alineación de emails entre tablas
- Nombres de proyectos DEBEN coincidir exactamente
- NO incluir timestamps (id, created_at, updated_at)
```

---

## 💡 Ejemplos de Conversión de Roles

**USUARIOS:**
```
Tu app              →  INTEGRITY
"Admin"            →  "admin"
"QA Manager"       →  "qa"
"QA Lead"          →  "qa"
"Software Engineer" →  "developer"
"Developer"        →  "developer"
"C-Level"          →  "executive"
"Executive"        →  "executive"
"Product Manager"  →  "manager"
"Technical Lead"   →  "manager"
```

**MIEMBROS DE PROYECTO:**
```
Tu app              →  INTEGRITY
"QA Manager"       →  "qa_lead"
"QA Lead"          →  "qa_lead"
"Software Engineer" →  "developer"
"Developer"        →  "developer"
"Test Engineer"    →  "tester"
"QA Engineer"      →  "tester"
"Project Manager"  →  "manager"
"Tech Lead"        →  "manager"
```

---

## 📊 Ejemplos de Datos

### Ejemplo 1: Usuario
```json
{
  "email": "laura.hernandez@company.com",
  "name": "Laura Hernandez",
  "role": "admin"
}
```

### Ejemplo 2: Proyecto
```json
{
  "name": "E-Commerce Platform",
  "description": "Main e-commerce web application",
  "repo": "https://github.com/company/ecommerce",
  "created_by_email": "laura.hernandez@company.com"
}
```

### Ejemplo 3: Miembro de Proyecto
```json
{
  "project_name": "E-Commerce Platform",
  "user_email": "qa.lead@company.com",
  "role": "qa_lead"
}
```

### Ejemplo 4: Heat Map (Módulo)
```json
{
  "project_name": "E-Commerce Platform",
  "module_name": "Payment Processing",
  "coverage_percentage": 88,
  "risk_level": "medium"
}
```

### Ejemplo 5: Test Execution
```json
{
  "project_name": "E-Commerce Platform",
  "total_tests": 450,
  "passed_tests": 425,
  "failed_tests": 15,
  "skipped_tests": 10,
  "coverage_percentage": 87.5,
  "execution_time_seconds": 145,
  "status": "completed"
}
```

### Ejemplo 6: Risk Assessment
```json
{
  "project_name": "E-Commerce Platform",
  "risk_score": 6.5,
  "risk_level": "medium",
  "identified_risks": [
    "Low test coverage in Inventory module (65%)",
    "Flaky payment integration tests",
    "Missing end-to-end tests for checkout flow"
  ],
  "recommendations": [
    "Increase unit test coverage to 90%",
    "Add integration test suite for payment APIs",
    "Implement E2E test suite for critical flows"
  ]
}
```

---

## ✅ Validaciones Finales

Antes de usar el JSON, verifica:

- [ ] JSON es válido (sin errores de sintaxis)
- [ ] Todos los emails son únicos
- [ ] Todos los proyectos existen en todos los arrays
- [ ] Todos los miembros hacen referencia a usuarios y proyectos existentes
- [ ] Coverage % entre 0 y 100
- [ ] Risk scores entre 0 y 10
- [ ] Mínimo 2 usuarios
- [ ] Mínimo 1 proyecto
- [ ] Sin campos extra
- [ ] Sin timestamps

---

## 🚀 Cómo Usar Este Prompt

### Opción 1: ChatGPT / Claude / Gemini
```
1. Copia el PROMPT arriba (la sección entre ===== INSTRUCCIONES ===== y el último ```)
2. Pega en tu chatbot favorito
3. Reemplaza [NOMBRE_DE_TU_APP] con el nombre real
4. Agrega contexto de los datos en tu app
5. Presiona Enter
6. Copia el JSON resultante
7. Sigue instrucciones en 00-QUICK-START.md
```

### Opción 2: Manual
```
1. Lee tu app y extrae datos manualmente
2. Sigue el formato JSON exactamente
3. Valida cada sección
4. Guarda en seed-data.json
5. Sigue instrucciones en 00-QUICK-START.md
```

---

## 📝 Template Personalizado

Si tienes estructura específica, usa este template:

```
CONTEXTO DE MI APP:

Mi app se llama: [APP_NAME]
Tipo: [TIPO: Sistema de Gestión / Platform / CMS / etc]

TABLAS/DATOS DISPONIBLES:

Tabla de usuarios:
- Nombre tabla: [TABLE_NAME]
- Campos: [FIELDS]
- Registros activos: ~[NUMBER]

Tabla de proyectos:
- Nombre tabla: [TABLE_NAME]
- Campos: [FIELDS]

[Repite para cada tabla]

DATOS A EXTRAER:

[Aquí puedes pegar datos reales o CSV]

O simplemente describe:
"Tengo 5 usuarios, 3 proyectos activos, cada proyecto tiene 2-4 miembros..."

ROLES ESPECÍFICOS DE MI APP:

- Mi rol "X" mapea a → INTEGRITY rol "Y"
- Mi rol "A" mapea a → INTEGRITY rol "B"
- etc.

[Agrega cualquier mapping específico]

AHORA USA EL PROMPT ARRIBA ADAPTADO
```

---

## 🎯 Pasos Finales

1. **Personaliza este prompt** con tu app
2. **Pega en ChatGPT/Claude/Gemini**
3. **Obtén JSON**
4. **Copia el JSON resultante**
5. **Sigue: 00-QUICK-START.md**

---

## 💡 Consejos

- **Sé específico** - Agrega contexto de tu app
- **Proporciona ejemplos** - Si es posible, pega datos reales
- **Verifica conversiones** - Asegúrate que roles se mapeen correctamente
- **Valida en jsonlint.com** - Antes de usar

---

**Siguiente: Copia este prompt y úsalo en tu chatbot favorito** 🤖
