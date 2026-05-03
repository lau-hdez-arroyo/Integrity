# 📥 Data Import Documentation

Esta carpeta contiene toda la documentación necesaria para extraer datos de tus otras aplicaciones e importarlos en INTEGRITY.

## 📚 Archivos Incluidos

### **1. 🎯 [00-QUICK-START.md](00-QUICK-START.md)** ⭐ **COMIENZA AQUÍ**
Guía rápida de 5 pasos para importar datos. Léelo primero si es tu primera vez.

**Incluye:**
- Flujo completo en 5 pasos
- Ejemplo mínimo válido
- Checklist de validación
- Comandos npm básicos

---

### **2. 📋 [01-DATA-SPEC.md](01-DATA-SPEC.md)**
Especificación técnica completa de la estructura de datos requerida.

**Incluye:**
- Definición de 6 tablas (users, projects, project_members, heat_maps, test_executions, risk_assessments)
- Campos obligatorios y opcionales
- Validaciones para cada tabla
- Relaciones entre tablas
- Ejemplo completo

**Úsalo cuando:** Necesites detalles exactos de estructura, tipos de datos, validaciones

---

### **3. 📄 [02-EXTRACT-PROMPT.md](02-EXTRACT-PROMPT.md)**
Prompt genérico listo para usar en ChatGPT, Claude, Gemini para extraer datos de tus apps.

**Incluye:**
- Prompt completo con instrucciones
- Conversiones de roles automáticas
- Validaciones incluidas
- Ejemplos de datos
- Ejemplos de conversiones
- Template personalizable

**Úsalo así:**
1. Copia el PROMPT
2. Ve a ChatGPT/Claude/Gemini
3. Personaliza con tu app
4. Obtén JSON
5. Pasa al paso 4 de QUICK-START

---

### **4. 🗺️ [03-PROCESS-FLOWCHART.md](03-PROCESS-FLOWCHART.md)**
Mapa visual del proceso completo de importación.

**Incluye:**
- Diagrama visual de 4 pasos
- Orden de importación
- Relaciones entre tablas
- Estructura de carpetas
- Checklist completo
- Solución de problemas
- Ejemplo mínimo válido

**Úsalo cuando:** Necesites ver el flujo completo o entender las relaciones

---

## 🚀 Flujo Rápido (5 Pasos)

```
1️⃣  Lee: 00-QUICK-START.md
2️⃣  Abre: 02-EXTRACT-PROMPT.md
3️⃣  Copia el PROMPT y úsalo en ChatGPT/Claude
4️⃣  Crea: seed-data.json con el JSON obtenido
5️⃣  Ejecuta: npm run import-data
```

---

## 📋 Documentos por Propósito

| Necesitas... | Lee... |
|-------------|--------|
| Empezar rápido | 00-QUICK-START.md |
| Entender estructura | 01-DATA-SPEC.md |
| Extraer datos | 02-EXTRACT-PROMPT.md |
| Ver el flujo completo | 03-PROCESS-FLOWCHART.md |

---

## 🔧 Scripts Disponibles

```bash
# Validar conexión con Supabase
npm run validate

# Importar datos desde seed-data.json
npm run import-data

# Importar desde archivo específico
npm run import-data -- --file=my-data.json

# Cargar datos de ejemplo (si existen)
npm run seed
```

---

## 📂 Estructura de Carpetas

```
C:\Repos\Integrity\Integrity\
│
├── docs/
│   ├── data-import/              ← ¡Estás aquí!
│   │   ├── README.md             ← Este archivo
│   │   ├── 00-QUICK-START.md
│   │   ├── 01-DATA-SPEC.md
│   │   ├── 02-EXTRACT-PROMPT.md
│   │   └── 03-PROCESS-FLOWCHART.md
│   │
│   ├── ADVANCED_COMPONENTS.md
│   ├── API_REFERENCE.md
│   ├── DATABASE_SCHEMA.md
│   ├── ... (otros docs)
│
├── scripts/
│   ├── import-data.js            ← Script principal
│   ├── validate-supabase.js
│   ├── seed-database.js
│   ├── inspect-schema.js
│   └── inspect-columns.js
│
├── seed-data.json                ← Aquí va tu JSON (después de extraer)
└── package.json
```

---

## ✅ Checklist Rápido

### Antes de Empezar
- [ ] Node.js instalado (v18+)
- [ ] npm instalado
- [ ] Backend .env.local configurado
- [ ] Supabase conexión validada (`npm run validate`)

### Extracción de Datos
- [ ] Leí 00-QUICK-START.md
- [ ] Leí 02-EXTRACT-PROMPT.md
- [ ] Personalicé el PROMPT con mi app
- [ ] Obtuve JSON de ChatGPT/Claude
- [ ] Validé JSON en jsonlint.com

### Importación
- [ ] Creé seed-data.json
- [ ] Ejecuté npm run import-data
- [ ] No hay errores en la importación
- [ ] Abrí http://localhost:5175
- [ ] Veo datos en los dashboards

---

## 🆘 Solución Rápida de Problemas

### Error: "File not found"
```bash
# Verifica que seed-data.json esté en el directorio correcto
cd C:\Repos\Integrity\Integrity
ls seed-data.json
```

### Error: "Invalid JSON"
```bash
# Valida JSON en https://jsonlint.com/
# O en VSCode: Click derecho → Open with JSON Preview
```

### Error: "Email already exists"
```
Todos los emails deben ser únicos
Revisa seed-data.json y elimina duplicados
```

### Error: "Supabase connection failed"
```bash
# Valida la conexión
npm run validate

# Verifica credenciales en backend/.env.local
cat backend/.env.local | grep SUPABASE_
```

---

## 📞 Referencias Relacionadas

| Documento | Ubicación |
|-----------|-----------|
| Database Schema | [../DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md) |
| API Reference | [../API_REFERENCE.md](../API_REFERENCE.md) |
| Supabase Setup | [../SUPABASE_SETUP.md](../SUPABASE_SETUP.md) |

---

## 💡 Consejos

1. **Comienza con QUICK-START.md** - Es el más rápido y directo
2. **Usa el PROMPT genérico** - Ya está optimizado para obtener datos correctamente
3. **Valida JSON antes de importar** - Ahorra tiempo de depuración
4. **Verifica conexión Supabase** - Ejecuta `npm run validate` si hay dudas
5. **Comienza con datos mínimos** - Agrega más datos después

---

## 🎯 Objetivo Final

Una vez completados los 5 pasos:

✅ Datos extraídos de tu app  
✅ seed-data.json creado  
✅ JSON validado  
✅ Importación completada  
✅ Dashboards mostrando datos  

---

## 📝 Notas Finales

- Los IDs se generan automáticamente (no incluyas en JSON)
- Los emails deben ser únicos
- Los nombres de proyectos deben coincidir en todas las tablas
- La importación respeta relaciones (validación automática)

---

**¿Listo para empezar? → Abre [00-QUICK-START.md](00-QUICK-START.md)** 🚀
