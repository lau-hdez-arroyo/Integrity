# Sources & Methodology: API Specification

**Project INTEGRITY - Phase 05 Architecture - Skill: API Specification**

---

## API Design Methodology

### Information Sources

1. **Phase 04 Functional Specification**
   - 7 functional areas (FM-1 through FM-7)
   - 49 detailed functional requirements
   - Integration points with Azure DevOps, SonarQube
   - Data flow diagrams

2. **Phase 04 Non-Functional Specification**
   - Performance SLAs (test selection <2 min, risk assessment <30 sec)
   - Scalability (500+ concurrent users)
   - Security (OAuth 2.0, TLS 1.3, AES-256)
   - Rate limiting (1000 req/min)

3. **REST API Standards**
   - RFC 7231 (HTTP/1.1 Semantics and Content)
   - RFC 7232 (HTTP/1.1 Conditional Requests)
   - RFC 7235 (HTTP/1.1 Authentication)
   - JSON API specification (https://jsonapi.org/)

4. **Microsoft REST API Guidelines**
   - https://microsoft.github.io/api-guidelines/
   - Versioning strategy (v1, v2 in URL)
   - Error handling standards
   - Async operation patterns (202 Accepted)

5. **Azure DevOps Integration**
   - ADO REST API v7.1 documentation
   - Webhook payloads for commit/PR events
   - TestPlan management API
   - Pipeline orchestration API

6. **SonarQube Integration**
   - SonarQube REST API v9.1
   - Coverage metrics endpoints
   - Quality gate scores
   - Code complexity metrics

---

## API Endpoint Design

### Heat Map API (3 endpoints)
- POST /heat-maps/generate: Start async heat map generation
- GET /heat-maps/{heat_map_id}: Retrieve generated heat map
- GET /heat-maps/{heat_map_id}/export: Export in PNG/SVG/JSON

**Design Driver:** Long-running operation → 202 Accepted async pattern

### Test Selection API (3 endpoints)
- POST /test-selection/analyze: Analyze code changes
- POST /test-selection/recommend: Get test recommendations
- POST /test-selection/results: Record test execution results

**Design Driver:** Multi-step workflow → individual endpoints per step

### Risk Assessment API (2 endpoints)
- POST /risk-assessment/analyze: Analyze risk for commit
- GET /risk-assessment/zones: List high-risk areas

**Design Driver:** Prediction service → immediate response pattern

### Dashboard API (3 endpoints)
- GET /dashboard/executive: Executive KPIs
- GET /dashboard/qa: QA team metrics
- GET /dashboard/developer: Developer-specific data

**Design Driver:** Real-time visibility → cached responses

### Audit API (2 endpoints)
- GET /audit-log: Query immutable audit trail
- POST /audit-log/verify: Verify event integrity

**Design Driver:** Compliance requirement → audit trail focused

### Health API (2 endpoints)
- GET /health: Detailed health check
- GET /status: Service status page

**Design Driver:** Operational requirement → always available

---

## Data Model Design

### Core Entities

**TestCase**
```
{
  test_id: string (unique)
  test_file: string (file path)
  test_class: string
  test_method: string
  covered_lines: int[]
  average_duration_seconds: int
  flakiness_score: float (0.0-1.0)
  is_integration_test: boolean
  is_performance_test: boolean
  created_at: datetime
  last_executed_at: datetime
}
```

**CodeChange**
```
{
  file: string (file path)
  lines_added: int
  lines_deleted: int
  lines_modified: int[]
  change_type: enum (added, modified, deleted)
  complexity: float
  owner: string (developer username)
}
```

**HeatMap**
```
{
  heat_map_id: string
  repository_id: string
  branch: string
  generated_at: datetime
  coverage_by_area: CoverageArea[]
  metrics: {
    total_coverage: float
    average_risk: float
    defect_density: float
    flakiness_score: float
  }
}
```

**AuditEvent**
```
{
  event_id: uuid
  timestamp: datetime (UTC, immutable)
  event_type: enum (test_recommendation, deployment_approval, etc.)
  actor: string (user_id)
  action: string (human-readable)
  details: json
  request_id: string
  immutable_hash: string (SHA256)
  status: enum (RECORDED, VERIFIED)
}
```

---

## Error Handling Design

### Standard Response Format
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Human-readable message",
    "details": {
      "field": "repository_id",
      "reason": "required"
    },
    "request_id": "req-abc123",
    "timestamp": "2026-04-30T10:25:00Z"
  }
}
```

### HTTP Status Codes
- 200 OK: Successful request
- 202 Accepted: Async operation started
- 400 Bad Request: Invalid parameters
- 401 Unauthorized: Missing/invalid auth
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Resource not found
- 409 Conflict: Resource conflict (e.g., duplicate ID)
- 429 Too Many Requests: Rate limit exceeded
- 500 Internal Server Error: Server error
- 503 Service Unavailable: Temporary issue

---

## Security Design

### Authentication Flow
```
1. Client sends OAuth 2.0 authorization request to Entra ID
2. Entra ID redirects to user login
3. User authenticates with MFA
4. Entra ID returns authorization code
5. Client exchanges code for access token
6. Client sends API request with Bearer token
7. API validates token with Entra ID
8. Request processed with user's permissions
```

### Rate Limiting Logic
```
Per Token:
  - Limit: 1000 requests/minute
  - Window: 60 seconds (rolling)
  - Response headers:
    - X-RateLimit-Limit: 1000
    - X-RateLimit-Remaining: 999
    - X-RateLimit-Reset: 1609459261

Exceeded Limit:
  - Return 429 Too Many Requests
  - Retry-After: 60 seconds
```

---

## Integration Patterns

### Webhook Integration (Inbound)
```
Azure DevOps sends webhook on commit:
  POST https://integrity-api.azurewebsites.net/webhooks/ado
  Headers: X-Webhook-Signature: SHA256(payload + secret)
  Body: {event_type, repository, commit, files_changed}
  
API validates signature, queues for processing
```

### Async Processing Pattern
```
POST /test-selection/analyze
  → Returns 202 Accepted with location header
  → POST {location}/results when complete
  
Client polls:
  GET /test-selection/analyze/{analysis_id}
  → Returns 202 if still processing
  → Returns 200 with results when complete
```

---

## Testing Coverage

### API Test Cases
- Authentication: Valid/invalid/expired tokens
- Authorization: User without permission
- Validation: Missing/invalid parameters
- Idempotency: Duplicate requests with same ID
- Concurrency: Parallel requests
- Rate limiting: Exceed 1000 req/min
- Error handling: All error codes
- Integration: With ADO, SonarQube

### Performance Benchmarks
- Heat map generation: <5 min
- Test selection: <2 min
- Risk assessment: <30 sec
- Dashboard: <5 sec
- Health check: <1 sec

---

## Version Control

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Apr 30, 2026 | Initial creation |

---

## Review Status

| Reviewer | Status | Date |
|----------|--------|------|
| Technical Lead | Pending | Apr 30, 2026 |

