# Sources & Methodology: Architecture Design Document

**Project INTEGRITY - Phase 05 Architecture - Skill: Design Document**

---

## Design Documentation Approach

### Information Sources

1. **Architecture Decision Records (ADR)**
   - 10 decisions with rationale
   - Technology choices justified
   - Cost/benefit analysis

2. **C4 Architecture Diagrams**
   - Component structure and interactions
   - Container dependencies
   - Technology stack visualization

3. **Phase 04 Specifications**
   - 49 functional requirements (FM-1 through FM-7)
   - 10 non-functional categories with SLAs
   - Business rules (17 rules across 8 categories)

4. **Industry Design Patterns**
   - Event-driven architecture
   - CQRS pattern (for scalability)
   - Async/sync hybrid approach
   - Microservices communication

5. **Azure-Specific Patterns**
   - Azure Functions for batch/scheduled jobs
   - App Service for always-on workloads
   - Service Bus for reliable messaging
   - Application Insights for observability

---

## Detailed Design Sections

### 1. Heat Map Generation System

**Design Decision:**
- Event-triggered Azure Function (timer-triggered, 4-hour cycle)
- Not in main web API (would block requests for 5 minutes)
- Stores result in Blob Storage (immutable) + SQL (queryable)

**Risk Scoring Algorithm:**
- Multi-factor scoring: Coverage + Defects + Complexity + Change Frequency
- Each factor weighted (25%, 35%, 25%, 15%)
- Output: 0.0 - 10.0 risk score per file
- Color-coded: Green/Yellow/Orange/Red

**Implementation Language:** C# / .NET 7  
**Performance Target:** <5 min for 1000+ files  
**Data Sources:** SonarQube (coverage) + ADO (test history) + SQL (defects)

---

### 2. Test Selection Engine

**Design Decision:**
- 3 strategies: Fast (10-15 min), Balanced (30-40 min), Comprehensive (60-90 min)
- Runs in main web API (synchronous, <2 min response time)
- Uses cached test metadata + SonarQube metrics
- Returns ranked list of tests + confidence score

**Selection Algorithm:**
- Multi-factor relevance scoring per test
- Factors: Direct coverage impact (40%), Historical effectiveness (30%), Code complexity (20%), Test reliability (10%)
- Cumulative coverage calculation
- Confidence score = (tests_with_high_relevance / tests_covering_changes)

**Implementation Language:** C# / .NET 7  
**Performance Target:** <2 min for PR analysis  
**Data Sources:** ADO (changes) + SonarQube (complexity) + SQL (historical)

---

### 3. Risk Assessment System

**Design Decision:**
- ML.NET model for defect prediction
- Runs synchronously in web API
- Uses historical data + current metrics
- Outputs risk score + defect likelihood

**Risk Scoring Factors:**
- Code Quality Risk (30%, from SonarQube)
- Test Coverage Risk (25%, from metrics)
- Author Experience Risk (15%, new team member flag)
- Historical Defect Risk (20%, defects in area last 90d)
- Change Velocity Risk (10%, files changed ratio)

**ML Model Details:**
- Trained on 90-day historical data
- Features: Complexity, Author experience, Change size, Coverage, Defect rate
- Retraining: Weekly
- Output: Probability of defect escaping to production (0.0 - 1.0)

**Implementation Language:** C# / .NET 7 + ML.NET  
**Performance Target:** <30 sec per assessment  
**Data Sources:** SonarQube + SQL history

---

### 4. Dashboard & Reporting

**Design Decision:**
- Pre-aggregated tables updated nightly (not real-time queries)
- Dashboard queries read from materialized views
- Redis caching for frequently accessed data (30-min TTL)
- Different dashboards for Executive/QA/Developer

**Executive Dashboard:**
- KPIs: Velocity improvement, QA burden reduction, defect escape reduction, cost savings
- Trends: Coverage, defect density, test duration
- Refresh: Every 30 minutes
- Data: Aggregated from past 30 days

**QA Dashboard:**
- Test suite status (pass/fail rates)
- Flaky test identification
- Coverage by component
- Defect escape analysis
- Refresh: Real-time

**Developer Dashboard:**
- My recent test results
- Coverage by file I edited
- Risk assessment for my PRs
- Recommended tests
- Refresh: Real-time

**Implementation:**
- Frontend: React 18 + TypeScript
- Backend: ASP.NET Core DashboardController
- Data: Azure SQL (pre-aggregated) + Redis (cache)

---

### 5. Audit & Compliance

**Design Decision:**
- Append-only table (no UPDATE/DELETE)
- Hash chain prevents tampering (each event includes hash of previous)
- 5-year retention in Azure SQL + Archive Blob Storage
- Immutable: No manual editing possible

**Audit Event Structure:**
- EventId (UUID)
- Timestamp (UTC, immutable)
- EventType (test_recommendation, deployment_approval, etc.)
- Actor (user_id with role)
- Action (human-readable)
- Details (JSON payload)
- ImmutableHash (SHA256 of previous + current)
- Status (RECORDED, VERIFIED)

**Compliance Features:**
- SOX 404: Change approval chain recorded
- GDPR: 90-day data retention with auto-purge
- Immutability: Hash chain validates no tampering

**Implementation Language:** C# / .NET 7  
**Database:** Azure SQL append-only pattern  
**Performance:** <1 sec to log event (async append)

---

### 6. Integration with External Systems

#### Azure DevOps Integration
```
Webhook Payloads:
  - Commit: Parse files, trigger heat map generation
  - PR created: Analyze changes, post recommendations
  - Pipeline completed: Fetch results, update database
  
Sync Frequency: Real-time (webhooks) + 4-hour batch
```

#### SonarQube Integration
```
Data Retrieved:
  - Code coverage (file-level)
  - Code complexity (cyclomatic)
  - Quality gate scores
  - Technical debt metrics
  
Sync Frequency: Every 4 hours
```

#### Datadog Integration
```
Metrics Sent:
  - Test selection effectiveness
  - API response times
  - Heat map generation performance
  - Cost tracking
  
Sync Frequency: Real-time (via Application Insights)
```

---

## Caching Strategy

### Cache Layers

**Layer 1: Redis (Hot Cache)**
- Session data (user preferences, dashboard selections)
- Computed metrics (dashboard KPIs)
- Query results (test recommendations)
- TTL: 1 hour for dashboards, 24 hours for static data

**Layer 2: Database Materialized Views (Warm Cache)**
- Pre-aggregated metrics (KPIs, trends)
- Historical aggregates (30/60/90 day summaries)
- Updated nightly

**Layer 3: Blob Storage (Cold Storage)**
- Heat map images (PNG, SVG)
- Report archives (PDFs)
- Retention: 1 year then delete

### Cache Invalidation

**Immediate (cache hit risk: high)**
- User profile changes → invalidate session cache
- Test execution completes → invalidate metrics cache

**Batch (cache hit risk: low)**
- Heat map generation completes → invalidate cache after 4 hours
- Dashboard refresh → run nightly aggregation

---

## Error Handling & Resilience

### Circuit Breaker Pattern
```
SonarQube API temporarily down
  → Circuit breaker opens
  → App returns cached data (or degraded response)
  → Retry after 5 minutes
  → Circuit closes when service recovers
```

### Timeouts
- SonarQube API calls: 10 sec timeout
- ADO API calls: 10 sec timeout
- Database queries: 30 sec timeout
- External webhook processing: 5 sec timeout

### Fallback Strategies
- SonarQube unavailable → use cached metrics
- ADO unavailable → use local cache of test mappings
- Database unavailable → circuit breaker + retry

---

## Testing Strategy

### Unit Tests
- Target: >80% code coverage
- Framework: xUnit + Moq
- Examples: Risk scoring algorithm, test selection logic, caching

### Integration Tests
- ADO webhook integration
- SonarQube API calls
- Database persistence
- Service Bus messaging

### Performance Tests
- Load test: 500 concurrent users
- Stress test: 1000 req/sec
- Endurance: 24-hour load with memory leak detection

### Security Tests
- Authentication/authorization
- RBAC enforcement
- Injection attacks (SQL, XSS)
- Data leakage (logging, error messages)

---

## Version Control

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Apr 30, 2026 | Initial creation (6 subsystems documented) |

---

## Review Status

| Reviewer | Status | Date |
|----------|--------|------|
| Technical Lead | Pending | Apr 30, 2026 |

