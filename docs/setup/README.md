# Setup - Instalación y Configuración

Esta carpeta contiene documentación para **configurar y desplegar** INTEGRITY.

## 📄 Documentos

### [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
Configuración de la base de datos:
- **Creación del proyecto Supabase**
- **Configuración de Auth**
- **Creación de tablas** y schema
- **Row-Level Security (RLS)**
- **Variables de entorno**
- **Backups y recovery**

### [FRONTEND_QUICKSTART.md](./FRONTEND_QUICKSTART.md)
Inicio rápido del desarrollo frontend:
- **Instalación de dependencias**
- **Variables de entorno**
- **Dev server** (Vite)
- **Debugging**
- **Build para producción**

### [DEPLOYMENT.md](./DEPLOYMENT.md)
Guía de deployments:
- **Pre-deployment checklist**
- **Staging environment**
- **Production deployment**
- **CI/CD pipeline**
- **Monitoring y alertas**
- **Rollback procedures**

---

## 🚀 Inicio Rápido (5 minutos)

### 1. Clonar el repositorio
```bash
git clone https://github.com/your-org/integrity.git
cd integrity
```

### 2. Configurar backend
```bash
cd backend
cp .env.example .env.local
npm install
npm run dev
```

### 3. Configurar frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Configurar Supabase
- Ve a https://supabase.com
- Crea un proyecto
- Copia las credenciales a `.env.local`
- Ejecuta migrations

### 5. Login
- Backend: http://localhost:5000
- Frontend: http://localhost:5173
- Credenciales de demo: admin@integrity.dev / Admin@2026

---

## 🔧 Checklists por Rol

### Para Developers
- [ ] Lee [FRONTEND_QUICKSTART.md](./FRONTEND_QUICKSTART.md)
- [ ] Lee [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- [ ] Setup local environment
- [ ] Ejecuta los tests

### Para DevOps
- [ ] Lee [DEPLOYMENT.md](./DEPLOYMENT.md)
- [ ] Configura CI/CD pipeline
- [ ] Setup staging environment
- [ ] Configura monitoring

### Para Product Managers
- [ ] Entiende el deployment process
- [ ] Revisa timelines de release
- [ ] Planifica rollout strategy

---

## 🌍 Ambientes

| Ambiente | URL | Actualización | Datos |
|----------|-----|---------------|-------|
| Local | localhost:5173 | Contínua (Dev) | Dummy data |
| Staging | staging.integrity.com | Semanal | Demo data |
| Production | integrity.com | Mensual | Real data |

---

## 📋 Pre-Requisitos

### Hardware
- RAM: 8GB mínimo
- Disk: 10GB libre
- CPU: 2+ cores

### Software
- Node.js 18+
- npm 8+
- Git 2.25+
- Docker (opcional, para containerización)

### Conocimiento
- JavaScript/React basics
- PostgreSQL basics
- REST APIs

---

## 🔐 Seguridad en Setup

- [ ] Nunca commitees `.env.local`
- [ ] Usa secrets en CI/CD
- [ ] Rotar credenciales mensualmente
- [ ] Usa HTTPS en todos los ambientes
- [ ] Habilita 2FA en Supabase

---

## 🆘 Troubleshooting

### Frontend no conecta con backend
1. Verifica que backend esté corriendo: `curl http://localhost:5000/health`
2. Revisa CORS config en `backend/server.js`
3. Revisa variables de entorno en frontend

### Supabase auth falla
1. Verifica credenciales en `.env.local`
2. Verifica que Auth esté habilitado en Supabase dashboard
3. Revisa user roles en Supabase

### Database migrations fallan
1. Verifica conexión a Supabase
2. Revisa SQL syntax en migrations
3. Verifica permisos de usuario en DB

---

## 📊 Stack Instalable

```
Node 18+
├── Frontend (React 18 + Vite)
├── Backend (Express 4.x)
└── Database (PostgreSQL via Supabase)
```

---

## 📝 Documentación Relacionada

- [Requirements](../requirements/) - Qué construir
- [Architecture](../architecture/) - Cómo está construido
- [API Reference](../api/) - Endpoints disponibles

---

## 📞 Support

- Problemas de setup: Abre issue en GitHub
- Questions: Pregunta en Slack #integrity-dev
- Emergencies: Contacta a DevOps team

---

**Última actualización:** May 4, 2026  
**Próxima revisión:** June 1, 2026
