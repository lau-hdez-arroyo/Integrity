# C4 Architecture Diagrams: Project INTEGRITY

**Autonomous Quality Intelligence Ecosystem (AQIE)**

*System Context, Containers, Components, and Code-Level Architecture*

---

## C4 Model Overview

The C4 model consists of four levels:
1. **System Context** - Shows INTEGRITY and its external systems
2. **Container** - Shows major technology containers (API, Database, etc.)
3. **Component** - Shows internal components within containers
4. **Code** - Shows code-level architecture (classes, interfaces)

---

## Level 1: System Context Diagram

### Overview

```
External Systems & Integrations with Project INTEGRITY
```

### Diagram

```mermaid
graph TB
    Developer["👤 Developer<br/>(Azure DevOps User)"]
    QA["👤 QA Engineer<br/>(Test Manager)"]
    PO["👤 Product Owner<br/>(Business Decision Maker)"]
    
    ADO["Azure DevOps<br/>(PR, CI/CD, ADO TestPlan)"]
    ADORepo["Azure Repos<br/>(Git Repository)"]
    
    INTEGRITY["<b>INTEGRITY System</b><br/>Test Selection Engine<br/>Risk Assessment<br/>Heat Map Generation"]
    
    Tools["External Tools"]
    SonarQube["☁️ SonarQube<br/>(Code Quality)"]
    Datadog["☁️ Datadog<br/>(Application Monitoring)"]
    Slack["☁️ Slack<br/>(Notifications)"]
    
    Azure["Azure Platform"]
    AppService["App Service<br/>(API)"]
    Functions["Azure Functions<br/>(Processing)"]
    SqlDB["Azure SQL<br/>(Production DB)"]
    Supabase["Supabase<br/>(PoC DB)"]
    Monitor["Azure Monitor<br/>(Observability)"]
    
    Developer -->|Pushes Code| ADORepo
    Developer -->|Reads Results| INTEGRITY
    
    QA -->|Plans Tests| ADO
    QA -->|Approves Releases| INTEGRITY
    
    PO -->|Reviews Metrics| INTEGRITY
    
    ADORepo -->|Webhook Triggers| INTEGRITY
    ADO -->|Test Plan Integration| INTEGRITY
    
    INTEGRITY -->|Analyzes| SonarQube
    INTEGRITY -->|Sends Metrics| Datadog
    INTEGRITY -->|Notifies| Slack
    
    INTEGRITY --> AppService
    INTEGRITY --> Functions
    AppService --> SqlDB
    Functions --> Supabase
    
    INTEGRITY --> Monitor
```

### Actors

| Actor | Role | Interactions |
|-------|------|---|
| **Developer** | Code contributor | Pushes commits, reviews results, reads heat map |
| **QA Engineer** | Test executor | Plans tests, reviews recommendations, approves releases |
| **Product Owner** | Business decision maker | Reviews metrics, approves deployments |

### External Systems

| System | Purpose | Protocol |
|--------|---------|----------|
| **Azure DevOps** | SCM, CI/CD, test management | REST API, OAuth 2.0 |
| **SonarQube** | Code quality metrics | REST API |
| **Datadog** | Application performance monitoring | HTTP agent, API |
| **Slack** | Notifications | Webhooks |
| **Azure Platform** | Infrastructure | Azure SDK, managed services |

---

## Level 2: Container Diagram

### Technology Stack

```
Client Layer (Frontend)
    ↓
API Layer (Azure App Service, .NET 7)
    ↓
Processing Layer (Azure Functions, async)
    ↓
Data Layer (Azure SQL + Supabase)
    ↓
Integration Layer (Azure Service Bus)
```

### Diagram

```mermaid
graph TB
    Web["🖥️ Web Dashboard<br/>(React/TypeScript)<br/>Azure App Service Static Web"]
    Mobile["📱 Mobile App<br/>(React Native)<br/>Same Backend APIs"]
    
    APIGateway["⚙️ API Gateway<br/>(Azure API Management)<br/>Authentication, Routing,<br/>Rate Limiting"]
    
    WebAPI["🔗 Web API<br/>(C# / .NET 7)<br/>Azure App Service<br/>───<br/>• Test Selection Controller<br/>• Heat Map Controller<br/>• Risk Assessment Controller<br/>• Dashboard Controller<br/>• Audit Controller"]
    
    SelEngine["⚡ Test Selection Engine<br/>(C# / .NET 7)<br/>Azure Functions (triggered)<br/>───<br/>• Code Analyzer<br/>• Impact Analyzer<br/>• Test Mapper<br/>• Coverage Calculator"]
    
    HeatMapGen["🔥 Heat Map Generator<br/>(C# / .NET 7)<br/>Azure Functions (timer)<br/>Every 4 hours<br/>───<br/>• Coverage Aggregator<br/>• Risk Scorer<br/>• Visualization Engine"]
    
    CostCalc["💰 Cost Calculator<br/>(Python)<br/>Azure Functions (nightly)<br/>───<br/>• Container Tracker<br/>• Cost Modeler"]
    
    ServiceBus["📨 Service Bus<br/>(Azure Service Bus)<br/>Message Queue<br/>───<br/>• Test Results Queue<br/>• Notification Queue"]
    
    SqlDB["🗄️ Production Database<br/>(Azure SQL Database)<br/>───<br/>• Test Execution History<br/>• Heat Maps<br/>• Risk Assessments<br/>• Audit Trail"]
    
    SupabaseDB["🗄️ PoC Database<br/>(Supabase PostgreSQL)<br/>───<br/>• Initial Validation<br/>• Test Data"]
    
    BlobStorage["📦 Blob Storage<br/>(Azure Blob)<br/>───<br/>• Heat Map Images<br/>• Reports<br/>• Archives"]
    
    Cache["⚡ Cache<br/>(Azure Cache for Redis)<br/>───<br/>• Session Data<br/>• Computed Results<br/>• Rate Limit State"]
    
    ADOIntegration["🔗 ADO Integration<br/>(C#)<br/>Azure Functions<br/>───<br/>• Webhook Processor<br/>• Test Plan Sync<br/>• Result Reporter"]
    
    Monitor["📊 Monitoring<br/>(Azure Monitor +<br/>Application Insights)<br/>───<br/>• Logs<br/>• Metrics<br/>• Alerts<br/>• Audit Trail"]
    
    Web --> APIGateway
    Mobile --> APIGateway
    
    APIGateway --> WebAPI
    APIGateway --> Cache
    
    WebAPI --> SelEngine
    WebAPI --> HeatMapGen
    WebAPI --> ServiceBus
    WebAPI --> SqlDB
    WebAPI --> Cache
    WebAPI --> Monitor
    
    SelEngine --> SqlDB
    SelEngine --> ServiceBus
    SelEngine --> Monitor
    
    HeatMapGen --> SqlDB
    HeatMapGen --> BlobStorage
    HeatMapGen --> Monitor
    
    CostCalc --> SqlDB
    CostCalc --> Monitor
    
    ServiceBus --> ADOIntegration
    ADOIntegration --> Monitor
    
    SqlDB --> Monitor
    Cache --> Monitor
    
    style Web fill:#e1f5ff
    style Mobile fill:#e1f5ff
    style APIGateway fill:#fff3e0
    style WebAPI fill:#f3e5f5
    style SelEngine fill:#e8f5e9
    style HeatMapGen fill:#e8f5e9
    style CostCalc fill:#e8f5e9
    style ServiceBus fill:#ffe0b2
    style SqlDB fill:#ffccbc
    style SupabaseDB fill:#ffccbc
    style BlobStorage fill:#cfd8dc
    style Cache fill:#fff9c4
    style ADOIntegration fill:#d1c4e9
    style Monitor fill:#b2dfdb
```

### Container Technologies

| Container | Technology | Purpose | Scaling |
|-----------|-----------|---------|---------|
| **Web Dashboard** | React 18 + TypeScript | User interface | Static, CDN-fronted |
| **API Gateway** | Azure API Management | Request routing, auth, rate limiting | Managed, auto-scaling |
| **Web API** | C# / .NET 7 | Core business logic | Azure App Service (B1→P1v2) |
| **Functions** | C# / .NET 7 | Async processing | Pay-per-execution, 100% auto-scale |
| **Database** | Azure SQL / Supabase | Persistent storage | Database unit scaling |
| **Blob Storage** | Azure Blob | Large files, archives | Auto-scaling |
| **Service Bus** | Azure Service Bus | Async messaging | Standard/Premium tiers |
| **Cache** | Azure Cache for Redis | Session, computed results | C0→C6 scaling |
| **Monitoring** | Azure Monitor + App Insights | Observability | Ingestion-based scaling |

---

## Level 3: Component Diagram (Web API Container)

### Internal Structure

```
Web API (.NET 7 Application)
  ├── Controllers (HTTP Endpoints)
  ├── Services (Business Logic)
  ├── Repositories (Data Access)
  └── External Integrations
```

### Diagram

```mermaid
graph TB
    HTTPRequest["HTTP Request<br/>from API Gateway"]
    
    subgraph Controllers["🎯 Controllers (HTTP)"]
        TC["TestSelectionController<br/>POST /test-selection/*"]
        HC["HeatMapController<br/>POST /heat-maps/*"]
        RC["RiskController<br/>POST /risk-assessment/*"]
        DC["DashboardController<br/>GET /dashboard/*"]
        AC["AuditController<br/>GET /audit-log/*"]
    end
    
    subgraph Services["⚙️ Services (Business Logic)"]
        TSS["TestSelectionService<br/>Recommends optimal tests"]
        HMS["HeatMapService<br/>Generates heat maps"]
        RS["RiskService<br/>Assesses risk scores"]
        DS["DashboardService<br/>Aggregates metrics"]
        AS["AuditService<br/>Maintains audit trail"]
    end
    
    subgraph Integrations["🔗 External Integrations"]
        ADO["ADO Client<br/>Git + TestPlan + Pipelines"]
        SQ["SonarQube Client<br/>Code quality metrics"]
        DD["Datadog Client<br/>Send metrics"]
    end
    
    subgraph Data["📦 Data Access"]
        TestRepo["TestRepository<br/>Query/insert tests"]
        HeatMapRepo["HeatMapRepository<br/>Query/insert heat maps"]
        RiskRepo["RiskRepository<br/>Query/insert assessments"]
        AuditRepo["AuditRepository<br/>Append-only logs"]
    end
    
    Database["Azure SQL<br/>Database"]
    Cache["Azure Cache<br/>Redis"]
    Queue["Service Bus<br/>Queues"]
    
    HTTPRequest --> Controllers
    
    TC --> TSS
    HC --> HMS
    RC --> RS
    DC --> DS
    AC --> AS
    
    TSS --> Integrations
    TSS --> Data
    
    HMS --> Integrations
    HMS --> Data
    
    RS --> Integrations
    RS --> Data
    
    DS --> Data
    DS --> Cache
    
    AS --> Data
    
    Data --> Database
    Data --> Cache
    
    TSS --> Queue
    HMS --> Queue
    
    style HTTPRequest fill:#e3f2fd
    style Controllers fill:#f3e5f5
    style Services fill:#e8f5e9
    style Integrations fill:#fff3e0
    style Data fill:#ffe0b2
    style Database fill:#ffccbc
    style Cache fill:#fff9c4
    style Queue fill:#ffe0b2
```

### Key Components

| Component | Responsibility | Dependencies |
|-----------|---------------|----|
| **TestSelectionController** | HTTP endpoint for test recommendations | TestSelectionService, ADO Client |
| **TestSelectionService** | Core algorithm for test selection | ADO, SonarQube, Data layer |
| **TestRepository** | Query/insert test execution records | Azure SQL, Cache |
| **AuditService** | Maintains immutable audit trail | AuditRepository |
| **DashboardService** | Aggregates KPIs and metrics | All repositories, Cache |

---

## Level 4: Code Diagram (Test Selection Service)

### Class Structure

```
TestSelectionService
  │
  ├─ Dependencies
  │  ├─ IADOClient (Azure DevOps integration)
  │  ├─ ISonarQubeClient (code quality metrics)
  │  ├─ ITestRepository (data access)
  │  └─ ICacheService (performance optimization)
  │
  ├─ Core Methods
  │  ├─ AnalyzeCodeChanges(...)
  │  │  └─ → List<FileChange>
  │  │
  │  ├─ RecommendTests(...)
  │  │  └─ → TestRecommendation
  │  │
  │  └─ CalculateImpactScore(...)
  │     └─ → double (0.0 - 10.0)
  │
  └─ Models
     ├─ CodeChange
     ├─ TestCase
     └─ TestRecommendation
```

### Pseudo-Code

```csharp
public class TestSelectionService
{
    private readonly IADOClient _ado;
    private readonly ISonarQubeClient _sonarQube;
    private readonly ITestRepository _tests;
    private readonly ICacheService _cache;
    
    public async Task<IEnumerable<TestRecommendation>> RecommendTestsAsync(
        string repositoryId, 
        string baseBranch, 
        string headBranch,
        SelectionStrategy strategy)
    {
        // Step 1: Analyze code changes
        var changes = await _ado.GetCodeChangesAsync(repositoryId, baseBranch, headBranch);
        
        // Step 2: Get code quality metrics
        var qualityData = await _sonarQube.GetMetricsAsync(repositoryId, changes.Select(c => c.File));
        
        // Step 3: Load historical test data
        var historicalTests = await _tests.GetHistoricalDataAsync(repositoryId);
        
        // Step 4: Score each test for relevance
        var scoredTests = new List<ScoredTest>();
        foreach (var test in historicalTests)
        {
            var relevanceScore = CalculateRelevanceScore(
                test,
                changes,
                qualityData,
                strategy);
            scoredTests.Add(new ScoredTest(test, relevanceScore));
        }
        
        // Step 5: Select tests based on strategy and constraints
        var selected = SelectTestsBasedOnStrategy(scoredTests, strategy);
        
        // Step 6: Cache results for 1 hour
        await _cache.SetAsync($"recommendations:{repositoryId}", selected, TimeSpan.FromHours(1));
        
        return selected;
    }
    
    private double CalculateRelevanceScore(
        TestCase test,
        IEnumerable<CodeChange> changes,
        QualityMetrics metrics,
        SelectionStrategy strategy)
    {
        double score = 0.0;
        
        // Factor 1: Coverage impact (40%)
        var coverageImpact = test.CoveredLines.Intersect(changes.SelectMany(c => c.ModifiedLines)).Count();
        score += (coverageImpact / (double)test.CoveredLines.Count()) * 4.0;
        
        // Factor 2: Historical defect detection (30%)
        var historicalEffectiveness = test.DefectsDetected / (double)test.ExecutionCount;
        score += historicalEffectiveness * 3.0;
        
        // Factor 3: Code complexity (20%)
        var complexityFactors = changes
            .Where(c => test.CoveredLines.Contains(c.LineNumber))
            .Select(c => metrics[c.File].Complexity);
        score += complexityFactors.Average() * 2.0;
        
        // Factor 4: Test reliability (10%)
        var reliability = (1.0 - test.FlakinessScore);
        score += reliability * 1.0;
        
        return Math.Min(score, 10.0); // Cap at 10.0
    }
}
```

---

## Deployment Architecture

### Azure Infrastructure

```mermaid
graph TB
    Internet["🌐 Internet Users"]
    
    CDN["📡 Azure CDN<br/>Static Web Assets"]
    
    APIM["⚙️ API Management<br/>• Authentication<br/>• Rate Limiting<br/>• Analytics"]
    
    AppService["☁️ App Service (P1v2)<br/>• 2-4 instances (auto-scale)<br/>• .NET 7 runtime<br/>• Always On"]
    
    Functions["⚡ Functions (Consumption Plan)<br/>• Test Selection<br/>• Heat Map Generator<br/>• Cost Calculator<br/>• Result Processor"]
    
    SqlDB["🗄️ Azure SQL Database<br/>• Standard tier<br/>• 100 DTU<br/>• Automatic backups<br/>• Geo-replication"]
    
    SupabaseDB["🗄️ Supabase PostgreSQL<br/>(PoC only)<br/>• Free tier<br/>• PostgreSQL 14<br/>• Auto-scaling"]
    
    BlobStorage["📦 Blob Storage<br/>• Hot tier for active data<br/>• Archive tier for old data"]
    
    Cache["⚡ Redis Cache<br/>• 1GB (C1)<br/>• 99.9% SLA"]
    
    ServiceBus["📨 Service Bus<br/>• Standard tier<br/>• 5 queues/topics"]
    
    Monitor["📊 Monitor + App Insights<br/>• Logs (90 days retention)<br/>• Metrics<br/>• Alerts<br/>• Audit trail (5 years)"]
    
    KeyVault["🔐 Key Vault<br/>• Connection strings<br/>• API keys<br/>• Certificates"]
    
    Internet --> CDN
    Internet --> APIM
    
    CDN -.->|Caches| BlobStorage
    
    APIM --> AppService
    
    AppService -->|Read/Write| SqlDB
    AppService -->|Cache Check| Cache
    AppService -->|Publish Event| ServiceBus
    AppService -->|Read Secrets| KeyVault
    
    Functions -->|Triggered by| ServiceBus
    Functions -->|Read/Write| SqlDB
    Functions -->|Upload| BlobStorage
    Functions -->|Read Secrets| KeyVault
    
    Monitor -.->|Monitors All| AppService
    Monitor -.->|Monitors All| Functions
    Monitor -.->|Monitors All| SqlDB
    Monitor -.->|Monitors All| ServiceBus
    
    style Internet fill:#e3f2fd
    style CDN fill:#c8e6c9
    style APIM fill:#fff3e0
    style AppService fill:#f3e5f5
    style Functions fill:#e8f5e9
    style SqlDB fill:#ffccbc
    style SupabaseDB fill:#ffccbc
    style BlobStorage fill:#cfd8dc
    style Cache fill:#fff9c4
    style ServiceBus fill:#ffe0b2
    style Monitor fill:#b2dfdb
    style KeyVault fill:#f1f8e9
```

### Cost Model by Component

| Component | Monthly Cost | Annual Cost | Utilization |
|-----------|--------------|------------|-------------|
| **App Service (P1v2)** | $8,000 | $96,000 | 60% average |
| **Azure SQL (Standard)** | $6,667 | $80,000 | 45% peak |
| **Functions** | $400 | $4,800 | Pay-per-execution |
| **Cache (Redis C1)** | $3,750 | $45,000 | Session data |
| **Service Bus (Standard)** | $2,500 | $30,000 | 10K msgs/day avg |
| **Storage (Blob + Archive)** | $1,667 | $20,000 | 500GB active, 1TB archive |
| **Monitor/App Insights** | $16,667 | $200,000 | Comprehensive logging |
| **CDN** | $667 | $8,000 | 10GB/month transfer |
| **Key Vault** | $50 | $600 | Standard tier |
| **Support & Misc** | $1,250 | $15,000 | Premium support |
| | | | |
| **TOTAL PRODUCTION** | $55,208 | $665,000/yr | (reserved pricing applied) |

---

## Document Information

**Created:** April 30, 2026  
**Phase:** 05-Architecture  
**Skill:** C4 Diagrams  
**Approver:** Technical Lead (Architecture Review)  
**Status:** ⏳ PENDING APPROVAL  
**Version:** 1.0

**Diagrams Include:**
- Level 1: System Context (6 external systems)
- Level 2: Container (11 major containers)
- Level 3: Component (5 services + data layer)
- Level 4: Code (TestSelectionService class structure)
- Deployment: Azure infrastructure with 12 services, cost breakdown
