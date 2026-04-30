# Sources & Methodology: Architecture Decision Records

**Project INTEGRITY - Phase 05 Architecture - Skill: ADR**

---

## Document Creation Methodology

### Information Sources

1. **Phase 04 Requirements Document (traceability.md)**
   - Problem-to-use-case mappings
   - Use-case-to-functional-requirement mappings
   - Business rules (17 rules across 8 categories)
   - Non-functional requirements (10 categories with SLAs)

2. **Microsoft Partner Alignment (Strategic Input)**
   - Azure service portfolio review
   - Partner benefits calculation (20% licensing discount)
   - Enterprise SLA guarantees
   - Managed service capabilities

3. **Cost Optimization Study (Financial Input)**
   - PoC budget: $500 (Supabase free tier)
   - Year 1 production target: $665K (67% reduction from $2M baseline)
   - Reserved instance pricing (30% discount)
   - Auto-scaling cost impact analysis

4. **Team Capacity Analysis**
   - 5 engineers available
   - No dedicated DevOps team
   - DevOps overhead reduction target: 90%
   - Decision: managed services vs self-hosted

5. **Compliance Requirements (SOX 404, GDPR)**
   - Change management audit trail requirements
   - Data retention policies
   - Encryption standards
   - Segregation of duties

6. **Industry Best Practices**
   - C4 model for architecture documentation
   - STRIDE methodology for threat modeling
   - Azure Well-Architected Framework
   - FinOps principles

---

## Decisions Documented

### ADR-001: Single Cloud Platform (Azure)
- Alternative analysis: Multi-cloud vs AWS vs on-prem
- Cost comparison: $665K vs $850K vs $750K vs $950K
- Partner benefits: 20% discount on Azure
- Decision driver: Cost + time-to-market

### ADR-002: Managed Services (No Self-Hosted)
- Alternative analysis: Kubernetes vs managed vs hybrid
- FTE impact: -3 FTE for managed services
- Cost impact: +$425K/yr operational savings
- Decision driver: Team size constraint

### ADR-003: Hybrid Database (Supabase PoC → Azure SQL Prod)
- PoC phase: Supabase PostgreSQL (free tier, <1 hour setup)
- Production phase: Azure SQL (SOC 2, enterprise SLA)
- Migration path: Standard pg_dump + restore
- Cost: $0 PoC → $80K/yr production
- Decision driver: Rapid validation + compliance

### ADR-004: App Service (No Kubernetes)
- Alternative: AKS (Kubernetes) vs Container Instances vs App Service
- Cost: AKS $300K → App Service $90K (70% savings)
- Operations: AKS 40h/month → App Service 4h/month (90% reduction)
- Decision driver: Team capacity + cost

### ADR-005: Hybrid API + Functions
- Sync endpoints: App Service (always-on)
- Async workloads: Azure Functions (pay-per-execution)
- Cost model: $125K/yr for both tiers combined
- Decision driver: Optimal price-to-performance

### ADR-006: Entra ID Authentication
- Alternative: Custom OAuth + Auth0 + Okta
- Cost: Custom dev cost vs $5-20K/yr vs $0 (Entra ID)
- Setup: 80h vs 2h vs 1h
- Decision driver: Speed + zero cost

### ADR-007: Reserved Instances + Auto-Scaling
- Baseline: $400K/yr (reserved, 30% discount)
- Peak: $265K/yr (on-demand)
- Total: $665K/yr
- Decision driver: Predictable + flexible

### ADR-008: Azure Monitor + App Insights
- Alternative: ELK Stack + SaaS (Datadog/New Relic)
- Cost: DIY $200K + ops vs SaaS $300K vs Azure $200K
- Native integration: Azure-only advantage
- Decision driver: Cost + compliance audit trail

### ADR-009: Git-Integrated Approval Workflow
- ADO Pull Requests + Branch Policies
- Audit trail integrated with deployment
- SOX 404 compliance: Change approval chain
- Decision driver: Compliance requirement

### ADR-010: Single Region with Disaster Recovery
- Primary: Azure East US (lowest cost)
- Backup: Azure West US (RTO <4 hours)
- Auto-replication: Built-in
- Decision driver: Cost + compliance

---

## Validation Sources

### Cost Model Validation
- Azure Pricing Calculator (https://azure.microsoft.com/en-us/pricing/calculator/)
- March 2026 pricing baseline
- Reserved Instance 1-year discount: 30% verified
- Spot pricing for batch: 60-80% discount available

### Performance Benchmarks
- Test selection <2 min: SonarQube API typical (50-200ms per file)
- Heat map <5 min: Aggregation of 1000+ files × 10ms = 10sec + rendering 4min
- Dashboard <5 sec: Cached aggregates from pre-computed tables

### Compliance References
- SOX 404: 17 CFR 241 (change management)
- GDPR: Regulation (EU) 2016/679 (Articles 5, 32-34)
- Azure Compliance: SOC 2 Type II, ISO 27001

---

## Review History

| Date | Reviewer | Status | Comments |
|------|----------|--------|----------|
| Apr 30 | Technical Lead | Pending | Ready for review |

---

## Version Control

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Apr 30, 2026 | Initial creation |

