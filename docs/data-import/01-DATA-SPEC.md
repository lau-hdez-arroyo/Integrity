# 📋 INTEGRITY - Data Import Specification

## 🎯 Objetivo
Especificación técnica completa de estructura de datos para importar en INTEGRITY.

---

## 📊 Estructura de Datos Requerida

### **1. USERS (Tabla: `users`)**

**Campos necesarios:**
```javascript
{
  email: string                    // Email único del usuario
  name: string                     // Nombre completo
  role: enum('admin'|'qa'|'developer'|'executive'|'manager')  // Rol en sistema
}
```

**Ejemplo:**
```javascript
[
  {
    email: 'admin@company.com',
    name: 'Laura Hernandez',
    role: 'admin'
  },
  {
    email: 'qa.lead@company.com',
    name: 'John QA',
    role: 'qa'
  }
]
```

**Validaciones:**
- ✓ Email debe ser único
- ✓ Email válido (formato email@domain.com)
- ✓ Role debe ser uno de los 5 valores
- ✓ Name no puede estar vacío

---

### **2. PROJECTS (Tabla: `projects`)**

**Campos necesarios:**
```javascript
{
  name: string                     // Nombre del proyecto
  description: string              // Descripción
  repo: string                     // URL del repositorio Git
  created_by_email: string         // Email del usuario admin
}
```

**Ejemplo:**
```javascript
[
  {
    name: 'E-Commerce Platform',
    description: 'Main production e-commerce application',
    repo: 'https://github.com/company/ecommerce',
    created_by_email: 'admin@company.com'
  },
  {
    name: 'Payment Service',
    description: 'Payment processing microservice',
    repo: 'https://github.com/company/payments',
    created_by_email: 'admin@company.com'
  }
]
```

**Validaciones:**
- ✓ Name único por proyecto
- ✓ Repo debe ser URL válida (http:// o https://)
- ✓ created_by_email debe existir en tabla users
- ✓ Description no puede estar vacío

---

### **3. PROJECT_MEMBERS (Tabla: `project_members`)**

**Campos necesarios:**
```javascript
{
  project_name: string             // Nombre del proyecto
  user_email: string               // Email del usuario
  role: enum('qa_lead'|'developer'|'manager'|'tester')  // Rol en proyecto
}
```

**Ejemplo:**
```javascript
[
  {
    project_name: 'E-Commerce Platform',
    user_email: 'qa@company.com',
    role: 'qa_lead'
  },
  {
    project_name: 'E-Commerce Platform',
    user_email: 'dev@company.com',
    role: 'developer'
  }
]
```

**Validaciones:**
- ✓ No repetir mismo user en mismo proyecto
- ✓ user_email debe existir en tabla users
- ✓ project_name debe existir en tabla projects
- ✓ Role válido (4 opciones)

---

### **4. HEAT_MAPS (Tabla: `heat_maps`)**

**Campos necesarios:**
```javascript
{
  project_name: string             // Nombre del proyecto
  module_name: string              // Nombre del módulo/componente
  coverage_percentage: number      // % de cobertura (0-100)
  risk_level: enum('low'|'medium'|'high'|'critical')  // Nivel de riesgo
}
```

**Ejemplo:**
```javascript
[
  {
    project_name: 'E-Commerce Platform',
    module_name: 'Authentication',
    coverage_percentage: 92,
    risk_level: 'low'
  },
  {
    project_name: 'E-Commerce Platform',
    module_name: 'Payment Processing',
    coverage_percentage: 78,
    risk_level: 'high'
  },
  {
    project_name: 'E-Commerce Platform',
    module_name: 'Inventory',
    coverage_percentage: 65,
    risk_level: 'critical'
  }
]
```

**Validaciones:**
- ✓ coverage_percentage entre 0 y 100
- ✓ risk_level uno de los 4 niveles
- ✓ Múltiples módulos por proyecto OK
- ✓ module_name único por proyecto
- ✓ project_name debe existir en tabla projects

---

### **5. TEST_EXECUTIONS (Tabla: `test_executions`)**

**Campos necesarios:**
```javascript
{
  project_name: string             // Nombre del proyecto
  total_tests: number              // Total de tests
  passed_tests: number             // Tests pasados
  failed_tests: number             // Tests fallidos
  skipped_tests: number            // Tests saltados
  coverage_percentage: number      // % cobertura (0-100)
  execution_time_seconds: number   // Tiempo ejecución en segundos
  status: enum('pending'|'running'|'completed'|'failed')  // Estado
}
```

**Ejemplo:**
```javascript
[
  {
    project_name: 'E-Commerce Platform',
    total_tests: 450,
    passed_tests: 425,
    failed_tests: 15,
    skipped_tests: 10,
    coverage_percentage: 87.5,
    execution_time_seconds: 145,
    status: 'completed'
  }
]
```

**Validaciones:**
- ✓ passed_tests + failed_tests + skipped_tests ≤ total_tests
- ✓ coverage_percentage entre 0 y 100
- ✓ execution_time_seconds > 0
- ✓ Status uno de los 4 valores
- ✓ Múltiples ejecuciones por proyecto OK
- ✓ project_name debe existir en tabla projects

---

### **6. RISK_ASSESSMENTS (Tabla: `risk_assessments`)**

**Campos necesarios:**
```javascript
{
  project_name: string             // Nombre del proyecto
  risk_score: number               // Score de riesgo (0-10)
  risk_level: enum('low'|'medium'|'high'|'critical')  // Nivel general
  identified_risks: string[]       // Array de riesgos identificados
  recommendations: string[]        // Array de recomendaciones
}
```

**Ejemplo:**
```javascript
[
  {
    project_name: 'E-Commerce Platform',
    risk_score: 6.5,
    risk_level: 'medium',
    identified_risks: [
      'Low test coverage in payment module',
      'Flaky inventory tests',
      'Missing integration tests'
    ],
    recommendations: [
      'Increase unit test coverage to 90%',
      'Add integration test suite',
      'Implement CI/CD pipeline'
    ]
  }
]
```

**Validaciones:**
- ✓ risk_score entre 0 y 10
- ✓ identified_risks es array de strings
- ✓ recommendations es array de strings
- ✓ Al menos 1 riesgo y 1 recomendación
- ✓ risk_level coincida con risk_score
- ✓ project_name debe existir en tabla projects

---

## 🔗 Relaciones Entre Tablas

```
users (1) ──────→ (∞) projects
               ├→ created_by_email

projects (1) ────→ (∞) project_members
            ├→ project_name

users (1) ────────→ (∞) project_members
     ├→ user_email

projects (1) ────→ (∞) heat_maps
            ├→ project_name

projects (1) ────→ (∞) test_executions
            ├→ project_name

projects (1) ────→ (∞) risk_assessments
            ├→ project_name
```

---

## 📤 Formato de Salida Esperado

Tu prompt debe generar un JSON con esta estructura:

```json
{
  "users": [
    {"email": "...", "name": "...", "role": "..."},
    ...
  ],
  "projects": [
    {"name": "...", "description": "...", "repo": "...", "created_by_email": "..."},
    ...
  ],
  "project_members": [
    {"project_name": "...", "user_email": "...", "role": "..."},
    ...
  ],
  "heat_maps": [
    {"project_name": "...", "module_name": "...", "coverage_percentage": 85, "risk_level": "..."},
    ...
  ],
  "test_executions": [
    {"project_name": "...", "total_tests": 450, "passed_tests": 425, ...},
    ...
  ],
  "risk_assessments": [
    {"project_name": "...", "risk_score": 6.5, "risk_level": "...", ...},
    ...
  ]
}
```

---

## ✅ Checklist de Validación

Antes de importar, verifica:

- [ ] **Users:** Mínimo 2 usuarios (1 admin, 1 regular)
- [ ] **Projects:** Mínimo 1 proyecto
- [ ] **Project Members:** Cada proyecto tiene al menos 1 miembro
- [ ] **Heat Maps:** Cada proyecto tiene 2-5 módulos
- [ ] **Test Executions:** Cada proyecto tiene al menos 1 ejecución
- [ ] **Risk Assessments:** Cada proyecto tiene 1 evaluación de riesgo
- [ ] **Emails:** Todos únicos y válidos
- [ ] **URLs:** Repositorios con protocolo http/https
- [ ] **Números:** Coverage 0-100, Risk 0-10, Tests suma correcta
- [ ] **Nombres:** Proyectos coinciden exactamente en todas las tablas
- [ ] **Relaciones:** Todos los user_email y project_name existen

---

## 🎓 Ejemplo Completo

```javascript
// Paso 1: Crear 3 usuarios
const users = [
  { email: 'admin@test.com', name: 'Admin User', role: 'admin' },
  { email: 'qa@test.com', name: 'QA Lead', role: 'qa' },
  { email: 'dev@test.com', name: 'Developer', role: 'developer' }
];

// Paso 2: Crear 2 proyectos (creados por admin)
const projects = [
  { 
    name: 'Project A', 
    description: 'Test project', 
    repo: 'https://github.com/test/a',
    created_by_email: 'admin@test.com'
  },
  { 
    name: 'Project B', 
    description: 'Production project', 
    repo: 'https://github.com/test/b',
    created_by_email: 'admin@test.com'
  }
];

// Paso 3: Asignar miembros
const project_members = [
  { project_name: 'Project A', user_email: 'qa@test.com', role: 'qa_lead' },
  { project_name: 'Project A', user_email: 'dev@test.com', role: 'developer' },
  { project_name: 'Project B', user_email: 'qa@test.com', role: 'qa_lead' }
];

// Paso 4: Módulos con cobertura
const heat_maps = [
  { project_name: 'Project A', module_name: 'Auth', coverage_percentage: 95, risk_level: 'low' },
  { project_name: 'Project A', module_name: 'API', coverage_percentage: 78, risk_level: 'high' },
  { project_name: 'Project B', module_name: 'Core', coverage_percentage: 88, risk_level: 'medium' }
];

// Paso 5: Resultados de tests
const test_executions = [
  {
    project_name: 'Project A',
    total_tests: 500,
    passed_tests: 475,
    failed_tests: 20,
    skipped_tests: 5,
    coverage_percentage: 86,
    execution_time_seconds: 120,
    status: 'completed'
  },
  {
    project_name: 'Project B',
    total_tests: 300,
    passed_tests: 285,
    failed_tests: 10,
    skipped_tests: 5,
    coverage_percentage: 92,
    execution_time_seconds: 90,
    status: 'completed'
  }
];

// Paso 6: Riesgos identificados
const risk_assessments = [
  {
    project_name: 'Project A',
    risk_score: 5.2,
    risk_level: 'medium',
    identified_risks: ['Low coverage in API', 'Flaky tests in auth'],
    recommendations: ['Add integration tests', 'Fix flaky tests']
  },
  {
    project_name: 'Project B',
    risk_score: 2.8,
    risk_level: 'low',
    identified_risks: ['Could improve core coverage', 'Need e2e tests'],
    recommendations: ['Add e2e tests', 'Improve core testing']
  }
];
```

---

## 🔧 Próximo Paso

**Usa este PROMPT para tus otras apps:**

→ Ver [02-EXTRACT-PROMPT.md](02-EXTRACT-PROMPT.md)
