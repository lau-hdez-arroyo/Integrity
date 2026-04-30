# Sources & Methodology: C4 Architecture Diagrams

**Project INTEGRITY - Phase 05 Architecture - Skill: C4 Diagrams**

---

## C4 Model Methodology

### C4 Framework Reference
- Creator: Simon Brown (https://c4model.com/)
- Four levels: Context → Containers → Components → Code
- Purpose: Communicate software architecture at different abstraction levels

### Information Sources

1. **Architecture Decision Records (ADR)**
   - 10 key architectural decisions
   - Technology choices: C#, .NET, Azure
   - Database strategy: Supabase (PoC) + Azure SQL (prod)
   - Deployment: App Service + Functions

2. **Phase 04 Functional Specification**
   - 7 functional modules (FM-1 through FM-7)
   - Integration requirements with ADO, SonarQube
   - Real-time vs batch processing needs

3. **Phase 04 Non-Functional Specification**
   - Scalability: 500+ concurrent users
   - Performance: <2 min for test selection
   - Availability: 99.9% SLA
   - Cost: $665K/year production

4. **Microsoft Azure Architecture**
   - Azure App Service for web workloads
   - Azure Functions for event-driven processing
   - Azure SQL for relational data
   - Azure Service Bus for asynchronous messaging
   - Azure Monitor for observability

5. **Industry Best Practices**
   - Event-driven architecture patterns
   - CQRS (Command Query Responsibility Segregation)
   - Microservices communication patterns
   - Cloud-native design principles

---

## Diagram Layers Explained

### Level 1: System Context
- **Purpose:** Show INTEGRITY and its relationship to external systems
- **Actors:** Developer, QA Engineer, Product Owner
- **External Systems:** Azure DevOps, SonarQube, Datadog, Slack, Azure Platform

### Level 2: Container
- **Purpose:** Show technology deployment units
- **Containers:** Web Dashboard, API Gateway, Web API, Functions, Database, Cache, Message Bus, Monitoring
- **Technology Stack:** React (frontend), .NET 7 (backend), PostgreSQL/T-SQL (database)

### Level 3: Component
- **Purpose:** Show internal components within Web API container
- **Components:** Controllers, Services, Repositories, External Clients
- **Responsibility:** Each component has single, well-defined responsibility

### Level 4: Code
- **Purpose:** Show class-level architecture
- **Example:** TestSelectionService class structure
- **Language:** C# / .NET 7

---

## Technology Mapping

### Frontend
```
Web Dashboard
  ├─ Framework: React 18 + TypeScript
  ├─ Package Manager: npm
  ├─ Build Tool: Vite
  ├─ State Management: Redux Toolkit
  ├─ Testing: Jest + React Testing Library
  └─ Deployment: Azure App Service Static Web Apps
```

### Backend API
```
Web API (.NET 7)
  ├─ Runtime: .NET 7
  ├─ Web Framework: ASP.NET Core 7
  ├─ Dependency Injection: Built-in
  ├─ Logging: Serilog + Application Insights
  ├─ Testing: xUnit + Moq
  └─ Deployment: Azure App Service (Windows)
```

### Async Processing
```
Azure Functions (C# / .NET 7)
  ├─ Triggers: Service Bus, Timer, Blob
  ├─ Runtime: .NET 7 in-process
  ├─ Scaling: Consumption plan (pay-per-execution)
  ├─ Storage: Azure Blob for artifacts
  └─ Logging: Application Insights
```

### Data Layer
```
Production Database
  ├─ Azure SQL Database (managed)
  ├─ Edition: Standard
  ├─ DTU: 100
  ├─ Tables: TestCases, HeatMaps, RiskAssessments, AuditLogs
  └─ Backups: Hourly, geo-replicated

PoC Database
  ├─ Supabase PostgreSQL (managed)
  ├─ Tier: Free (for validation)
  └─ Migration: pg_dump → Azure SQL
```

### Messaging
```
Azure Service Bus (Standard tier)
  ├─ Queues: TestResults, Notifications
  ├─ Topics: DeploymentApprovals
  ├─ Message TTL: 14 days
  └─ Dead Letter: Enabled
```

### Observability
```
Azure Monitor + Application Insights
  ├─ Logs: 90-day hot retention, 5-year archive
  ├─ Metrics: Real-time, 93-day retention
  ├─ Alerts: Custom thresholds + auto-escalation
  ├─ Audit Trail: Append-only, immutable
  └─ Cost: Ingestion-based pricing
```

---

## Cost Breakdown by Container

| Container | Service | Monthly | Annual | Utilization |
|-----------|---------|---------|--------|-------------|
| Web Dashboard | Static Web Apps | $100 | $1,200 | Included |
| API Gateway | API Management | $150 | $1,800 | Standard |
| Web API | App Service (P1v2) | $8,000 | $96,000 | 60% avg |
| Functions | Consumption Plan | $400 | $4,800 | Pay-per-exec |
| Database | Azure SQL Standard | $6,667 | $80,000 | 45% peak |
| Cache | Redis C1 | $3,750 | $45,000 | Session data |
| Messaging | Service Bus | $2,500 | $30,000 | 10K msgs/day |
| Storage | Blob + Archive | $1,667 | $20,000 | 500GB active |
| Monitoring | Monitor + App Insights | $16,667 | $200,000 | Comprehensive |
| **Total** | | **$55,208/mo** | **$665,000/yr** | |

---

## Scalability Roadmap

### Phase 1: Launch (Month 1)
- Single App Service instance (P1v2)
- Azure SQL 100 DTU
- Manual scaling as needed

### Phase 2: Growth (Months 2-6)
- Auto-scaling enabled: 2-4 instances based on CPU/memory
- Azure SQL auto-scale to 200 DTU
- Cache upgraded to C2 if needed

### Phase 3: Maturity (Months 7-12)
- Auto-scaling: 3-8 instances peak
- Azure SQL 300-400 DTU for peak
- Read replicas for cross-region redundancy

---

## Deployment Architecture Details

### Blue-Green Deployment
```
Current (Blue)
  ├─ App Service instance running v1.0
  ├─ Database schema v1.0
  └─ Fully operational, receiving traffic

Staging (Green)
  ├─ New version v1.1 deployed
  ├─ Database migrations applied
  ├─ Health checks pass
  └─ Ready to receive traffic

Cutover
  ├─ Traffic routed from Blue to Green (0-downtime)
  ├─ Monitoring for errors
  └─ Automatic rollback if issues detected
```

### Disaster Recovery
```
Primary Region (East US)
  ├─ Active database + app
  ├─ Recovery Point Objective (RPO): 1 hour
  └─ Recovery Time Objective (RTO): <4 hours

Secondary Region (West US)
  ├─ Standby database (geo-replicated)
  ├─ Failover: Automatic if primary unavailable >5 min
  └─ Manual failback after recovery
```

---

## Version Control

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Apr 30, 2026 | Initial creation (4 levels: context, containers, components, code) |

---

## Review Status

| Reviewer | Status | Date |
|----------|--------|------|
| Technical Lead | Pending | Apr 30, 2026 |

