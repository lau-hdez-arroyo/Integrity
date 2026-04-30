# Sources & Methodology: Threat Model

**Project INTEGRITY - Phase 05 Architecture - Skill: Threat Model**

---

## Threat Modeling Methodology

### Framework Used: STRIDE
- **Spoofing:** Identity spoofing / authentication bypass
- **Tampering:** Unauthorized data modification
- **Repudiation:** Denying actions taken
- **Information Disclosure:** Unauthorized data access
- **Denial of Service:** Service availability disruption
- **Elevation of Privilege:** Unauthorized privilege escalation

### Information Sources

1. **Architecture Decision Records (ADR)**
   - Technology choices (C#, .NET, Azure)
   - Database strategy (Supabase + Azure SQL)
   - Authentication (Entra ID)
   - Managed services architecture

2. **C4 Architecture Diagrams**
   - Attack surface mapping (external vs internal)
   - Data flows between components
   - Trust boundaries (users, systems, data)
   - Deployment environment (Azure)

3. **Phase 04 Specifications**
   - Security requirements (OAuth 2.0, TLS 1.3, AES-256)
   - Compliance requirements (SOX 404, GDPR)
   - Access control requirements (RBAC)
   - Audit trail requirements

4. **Microsoft Security Best Practices**
   - Azure Security Benchmark v1.4
   - Identity & Access Management (IAM)
   - Data protection guidelines
   - Incident response procedures

5. **Industry Standards & Frameworks**
   - OWASP Top 10 Web Application Security Risks
   - CWE/CAPEC (Common Weakness/Attack Pattern Enumeration)
   - NIST Cybersecurity Framework
   - SOC 2 Trust Service Criteria

---

## Asset Classification

### Critical Assets (CRITICAL)
**User Credentials & Authentication Tokens**
- Impact: Unauthorized system access
- Control: Entra ID + MFA + session timeout

**Audit Trail**
- Impact: Compliance violation (SOX 404)
- Control: Append-only + hash chain

**Database Encryption Keys**
- Impact: Complete data breach
- Control: Azure Key Vault + managed identities

### High-Value Assets (HIGH)
**Source Code**
- Impact: Algorithm exposure
- Control: Git access control + code review

**Test Execution Data**
- Impact: Quality metrics falsification
- Control: RBAC + audit trail

**Defect/Risk Data**
- Impact: Business decision impact
- Control: Encryption + access control

**Database Content**
- Impact: Data breach
- Control: Encryption + firewall

---

## Threat Analysis by STRIDE Category

### Spoofing (S) - 2 Threats
**S1: Unauthorized User Access**
- Attacker compromises credentials
- Gains access to sensitive data
- Mitigation: OAuth 2.0 + MFA (residual: LOW)

**S2: API Credential Theft**
- Bearer token exposed in logs
- Attacker calls APIs as legitimate user
- Mitigation: Never log credentials + short-lived tokens (residual: MEDIUM)

### Tampering (T) - 3 Threats
**T1: Malicious Modification of Test Recommendations**
- Attacker modifies algorithm
- Defects escape to production
- Mitigation: Code review + CI/CD gates + audit trail (residual: LOW)

**T2: Database Tampering**
- Attacker gains direct DB access
- Modifies audit logs / metrics
- Mitigation: Encryption + firewall + access control (residual: VERY LOW)

**T3: Heat Map / Report Manipulation**
- Stored heat maps modified to hide risk areas
- Team focuses testing on wrong code
- Mitigation: Immutable blob storage + hash validation (residual: MEDIUM)

### Repudiation (R) - 1 Threat
**R1: User Denies Approving a Deployment**
- User claims didn't approve deployment that caused issues
- Cannot assign accountability
- Mitigation: Immutable audit trail + electronic signatures (residual: VERY LOW)

### Information Disclosure (I) - 3 Threats
**I1: Sensitive Data Exposure in API Responses**
- API returns PII or credentials
- GDPR violation potential
- Mitigation: Data masking + output encoding + TLS (residual: LOW)

**I2: Source Code Repository Compromise**
- Attacker reads Azure Repos
- Algorithm details exposed
- Mitigation: Git access control + credential scanning (residual: MEDIUM)

**I3: Logs Contain Sensitive Information**
- Debug logs capture test data / credentials
- Sensitive data exposed to developers
- Mitigation: Log redaction + retention policy (residual: LOW)

### Denial of Service (D) - 3 Threats
**D1: API Overload Attack**
- DDoS attack on INTEGRITY API
- Service unavailable
- Mitigation: Rate limiting + DDoS protection + autoscaling (residual: MEDIUM)

**D2: Database Connection Pool Exhaustion**
- Connections held, pool exhausted
- API can't query database
- Mitigation: Connection limits + timeouts + monitoring (residual: MEDIUM)

**D3: Storage Exhaustion**
- Attacker fills blob storage
- No room for heat maps/reports/backups
- Mitigation: Storage quotas + retention policies (residual: LOW)

### Elevation of Privilege (E) - 2 Threats
**E1: Bypass Authorization Checks**
- Attacker crafts requests to bypass RBAC
- Unauthorized access to resources
- Mitigation: Centralized auth + attribute-based controls (residual: LOW)

**E2: Service Account Privilege Escalation**
- Managed identity compromised
- Attacker executes arbitrary code
- Mitigation: Least privilege + managed identities + audit (residual: LOW)

---

## Compliance Mapping

### SOX 404 (Sarbanes-Oxley)
**Requirement:** Internal controls over financial reporting (ICFR)

| Control | Implementation | Evidence |
|---------|---------------|----|
| Change Management | ADO branch policies + code review | ADO audit log |
| Segregation of Duties | Dev ≠ Reviewer ≠ Approver | ADO roles |
| Audit Trail | Immutable, 5-year retention | Azure SQL append-only |
| Access Control | RBAC + MFA | Entra ID logs |

### GDPR (General Data Protection Regulation)

| Article | Requirement | Implementation | Status |
|---------|-----------|---|--|
| Art. 5(1)(a) | Lawfulness, fairness, transparency | Consent via OAuth 2.0 | ✅ MET |
| Art. 5(1)(e) | Data retention period (90 days) | Auto-purge rule | ✅ MET |
| Art. 4(12) | Consent management | Scope-based consent | ✅ MET |
| Art. 32 | Security measures | Encryption + RBAC | ✅ MET |
| Art. 33 | Breach notification | Incident response plan | 📋 PLANNED |
| Art. 34 | Data subject notification | Legal team required | 🔴 OUT OF SCOPE |

---

## Control Effectiveness Matrix

### By Implementation Status

| Status | Controls | Examples |
|--------|----------|----------|
| ✅ IMPLEMENTED | 40+ | OAuth, encryption, RBAC, audit trail |
| 📋 PLANNED (Phase 06) | 8+ | Pen testing, SIEM, anomaly detection |
| 🔴 OUT OF SCOPE | 3+ | Hardware HSM, zero-trust, behavioral analytics |

### By Risk Reduction

| Control Type | Threat Reduced | Residual Risk |
|--------------|-----|--|
| Authentication + MFA | Spoofing | LOW |
| Code Review + Testing | Tampering | LOW |
| Immutable Audit Trail | Repudiation | VERY LOW |
| Encryption + Data Masking | Information Disclosure | LOW |
| Rate Limiting + Autoscaling | Denial of Service | MEDIUM |
| RBAC + Managed Identities | Elevation of Privilege | LOW |

---

## Attack Scenarios

### Scenario 1: External Attacker via API
```
1. Attacker scans public API endpoints
   → Rate limiting + WAF blocks
   
2. Attempts SQL injection in query params
   → Parameterized queries + input validation
   
3. Attempts to steal bearer token from logs
   → Token never logged, rotation enabled
   
4. Attempts to overwhelm API (DDoS)
   → DDoS protection + autoscaling handles
   
Result: Attack fails, audit trail records all attempts
```

### Scenario 2: Malicious Developer
```
1. Developer commits code to bypass test selection
   → Code review (2 reviewers) catches before merge
   
2. Attempts to push directly to production
   → Branch protection policy blocks (requires PR)
   
3. Attempts to modify database directly
   → Connection string only in Key Vault (no local access)
   
4. Attempts to delete audit logs
   → Append-only table prevents deletion
   
Result: Attack blocked, suspicious activity logged
```

### Scenario 3: Insider with DB Access
```
1. Insider modifies test recommendations in database
   → Hash chain detects tampering in audit
   
2. Attempts to modify own user's audit log entry
   → Append-only prevents updates
   
3. Attempts to use service account credentials
   → Managed identity (no credentials to steal)
   
Result: Changes logged, auditor detects manipulation
```

---

## Incident Response Plan

### Severity 1: Critical
- Data breach confirmed
- Service completely down
- Compliance violation

**Response Time:** <1 hour  
**Escalation:** VP Engineering + CISO + Legal  
**Actions:** Isolate affected systems, notify customers, activate backup systems

### Severity 2: High
- Service degradation >30%
- Unauthorized access detected
- Security alert triggered

**Response Time:** <4 hours  
**Escalation:** Engineering Manager + Security  
**Actions:** Investigate root cause, implement hotfix, review logs

### Severity 3: Medium
- Single component failure
- Configuration error
- Performance issue

**Response Time:** <24 hours  
**Escalation:** On-call engineer  
**Actions:** Fix, test, deploy, document

---

## Security Roadmap

### Phase 06 (Post-Release)
- [ ] Penetration testing (third-party)
- [ ] Security audit (Big 4)
- [ ] SIEM integration (Log Analytics)
- [ ] Threat model review + update

### Phase 07+
- [ ] Hardware Security Module (HSM)
- [ ] Zero-trust network architecture
- [ ] Behavioral analytics for anomaly detection
- [ ] Cryptographic attestation

---

## Version Control

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Apr 30, 2026 | Initial creation (12 STRIDE threats) |

---

## Review Status

| Reviewer | Status | Date |
|----------|--------|------|
| Technical Lead | Pending | Apr 30, 2026 |
| Security Officer | Pending | Apr 30, 2026 |

