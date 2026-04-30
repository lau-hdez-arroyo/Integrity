# API Specification: Project INTEGRITY

**Autonomous Quality Intelligence Ecosystem (AQIE)**

*REST API Design for Test Selection, Risk Assessment, and Quality Intelligence*

---

## API Overview

### Base URL

```
Production: https://api.integrity.azurewebsites.net/v1
PoC: https://integrity-poc.azurewebsites.net/v1
```

### Authentication

All endpoints require OAuth 2.0 Bearer token (Microsoft Entra ID):

```
Authorization: Bearer {access_token}
```

### Rate Limiting

```
X-RateLimit-Limit: 1000 requests/minute
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1609459261
```

---

## 1. Heat Map API

### Purpose
Generate visual representation of test coverage and risk across codebase.

### 1.1 Generate Heat Map

**Endpoint:** `POST /heat-maps/generate`

**Request**

```json
{
  "repository_id": "integrity-core",
  "branch": "main",
  "commit_sha": "abc123def456",
  "analysis_depth": "complete",
  "include_metrics": [
    "code_coverage",
    "defect_density",
    "test_execution_time",
    "flakiness_score"
  ]
}
```

**Response (202 Accepted)**

```json
{
  "heat_map_id": "hm-20260430-001",
  "status": "processing",
  "location": "/heat-maps/hm-20260430-001",
  "estimated_completion": "2026-04-30T12:30:00Z",
  "request_id": "req-abc123"
}
```

**Implementation Notes:**
- Long-running operation (async, 4-minute average)
- Webhook callback on completion (optional)
- Stores result in Azure Blob Storage
- Heat map generation offloaded to Azure Function (timer-triggered)

---

### 1.2 Retrieve Heat Map

**Endpoint:** `GET /heat-maps/{heat_map_id}`

**Response (200 OK)**

```json
{
  "heat_map_id": "hm-20260430-001",
  "repository_id": "integrity-core",
  "branch": "main",
  "generated_at": "2026-04-30T12:25:00Z",
  "coverage_by_area": [
    {
      "area": "test-selection",
      "coverage_percentage": 87.5,
      "color": "green",
      "risk_score": 2.1,
      "files_count": 12,
      "uncovered_lines": 145
    },
    {
      "area": "api-gateway",
      "coverage_percentage": 62.3,
      "color": "yellow",
      "risk_score": 6.8,
      "files_count": 8,
      "uncovered_lines": 234
    },
    {
      "area": "data-processing",
      "coverage_percentage": 45.2,
      "color": "red",
      "risk_score": 8.9,
      "files_count": 15,
      "uncovered_lines": 892
    }
  ],
  "metrics": {
    "total_coverage": 65.0,
    "average_risk": 5.9,
    "defect_density": 4.2,
    "flakiness_score": 12.5
  }
}
```

---

### 1.3 Export Heat Map

**Endpoint:** `GET /heat-maps/{heat_map_id}/export`

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `format` | string | Yes | `png`, `svg`, `json` |
| `include_grid` | boolean | No | Include grid overlay (default: true) |
| `resolution` | string | No | `low` (500px), `medium` (1000px), `high` (2000px) |

**Response (200 OK)**

```
Content-Type: image/png
Content-Length: 245120
Content-Disposition: attachment; filename="heat-map-20260430.png"

[binary PNG data]
```

---

## 2. Test Selection Engine API

### Purpose
Recommend optimal test suite based on code changes and risk.

### 2.1 Analyze Code Changes

**Endpoint:** `POST /test-selection/analyze`

**Request**

```json
{
  "repository_id": "integrity-core",
  "base_branch": "main",
  "head_branch": "feature/new-selection-logic",
  "commits": [
    "abc123",
    "def456"
  ],
  "include_dependencies": true,
  "include_affected_workflows": true
}
```

**Response (200 OK)**

```json
{
  "analysis_id": "ts-20260430-001",
  "commit_count": 2,
  "files_changed": 7,
  "lines_added": 342,
  "lines_deleted": 89,
  "change_complexity": 6.7,
  "impact_zones": [
    {
      "zone_id": "core-selection",
      "affected_files": ["selection/engine.cs", "selection/rules.cs"],
      "change_type": "logic_modification",
      "risk_score": 8.2
    },
    {
      "zone_id": "api-response",
      "affected_files": ["api/test-controller.cs"],
      "change_type": "interface_change",
      "risk_score": 5.1
    }
  ]
}
```

---

### 2.2 Recommend Tests

**Endpoint:** `POST /test-selection/recommend`

**Request**

```json
{
  "analysis_id": "ts-20260430-001",
  "selection_strategy": "balanced",
  "target_coverage": 85,
  "max_test_time_minutes": 30,
  "include_performance_tests": true,
  "include_integration_tests": true,
  "exclude_tags": ["slow", "manual", "deprecated"]
}
```

**Selection Strategies:**
- `fast`: Minimal tests (10-15 min, 60% coverage)
- `balanced`: Optimal mix (30-40 min, 85% coverage)
- `comprehensive`: Full suite (60-90 min, 98% coverage)

**Response (200 OK)**

```json
{
  "recommendation_id": "rec-20260430-001",
  "analysis_id": "ts-20260430-001",
  "selected_tests": [
    {
      "test_id": "test-selection-edge-cases",
      "test_file": "tests/SelectionEngineTests.cs",
      "test_class": "SelectionEngineTests",
      "test_method": "Should_Select_Edge_Cases",
      "estimated_duration_seconds": 12,
      "priority": 1,
      "reason": "Directly tests modified logic",
      "coverage_impact": 0.23
    },
    {
      "test_id": "test-api-regression",
      "test_file": "tests/ApiControllerTests.cs",
      "test_class": "ApiControllerTests",
      "test_method": "Should_Handle_New_Response_Format",
      "estimated_duration_seconds": 8,
      "priority": 2,
      "reason": "Interface change impact"
    }
  ],
  "summary": {
    "total_tests_available": 487,
    "tests_recommended": 23,
    "tests_excluded": 464,
    "reduction_percentage": 95.3,
    "total_duration_seconds": 487,
    "estimated_coverage": 88.5,
    "confidence_score": 0.92
  },
  "risk_analysis": {
    "uncovered_risk_areas": [
      {
        "area": "data-processing-edge-case",
        "risk_score": 2.1,
        "recommendation": "Add test for empty dataset scenario"
      }
    ]
  }
}
```

---

### 2.3 Record Test Execution

**Endpoint:** `POST /test-selection/results`

**Request**

```json
{
  "recommendation_id": "rec-20260430-001",
  "pipeline_id": "azure-devops-pipeline-123",
  "execution_results": [
    {
      "test_id": "test-selection-edge-cases",
      "status": "passed",
      "duration_seconds": 13,
      "assertions_count": 12,
      "coverage_delta": 0.02
    },
    {
      "test_id": "test-api-regression",
      "status": "failed",
      "duration_seconds": 2,
      "error_message": "Expected 200, got 500",
      "stack_trace": "..."
    }
  ],
  "overall_status": "failed",
  "total_duration_seconds": 15,
  "coverage_achieved": 87.2
}
```

**Response (200 OK)**

```json
{
  "execution_id": "exec-20260430-001",
  "status": "recorded",
  "insights": [
    {
      "type": "failure_analysis",
      "test_id": "test-api-regression",
      "suggested_root_cause": "Schema mismatch in response object",
      "confidence": 0.87,
      "suggested_fix": "Update response DTO in test-controller.cs line 142"
    }
  ]
}
```

---

## 3. Risk Assessment API

### Purpose
Predict defect likelihood and provide mitigation recommendations.

### 3.1 Assess Risk

**Endpoint:** `POST /risk-assessment/analyze`

**Request**

```json
{
  "repository_id": "integrity-core",
  "target_commit": "abc123",
  "assessment_type": "pre-merge",
  "include_historical_data": true,
  "include_ml_prediction": true
}
```

**Response (200 OK)**

```json
{
  "assessment_id": "ra-20260430-001",
  "repository_id": "integrity-core",
  "target_commit": "abc123",
  "risk_score": 7.2,
  "risk_category": "HIGH",
  "confidence": 0.85,
  "factors": [
    {
      "factor": "Code Complexity",
      "score": 8.1,
      "weight": 0.3,
      "trend": "increasing"
    },
    {
      "factor": "Test Coverage",
      "score": 6.2,
      "weight": 0.25,
      "trend": "stable"
    },
    {
      "factor": "Author Experience",
      "score": 7.8,
      "weight": 0.15,
      "trend": "improving"
    },
    {
      "factor": "Historical Defects in Area",
      "score": 5.9,
      "weight": 0.2,
      "trend": "decreasing"
    }
  ],
  "predicted_defects": {
    "likelihood_percentage": 42,
    "severity_if_occurs": "MEDIUM",
    "estimated_ttf_hours": 8
  },
  "recommendations": [
    "Add integration tests for new data validation logic",
    "Increase code review time for complexity > 8"
  ]
}
```

---

### 3.2 List Risk Zones

**Endpoint:** `GET /risk-assessment/zones?repository_id=integrity-core&branch=main`

**Response (200 OK)**

```json
{
  "repository_id": "integrity-core",
  "branch": "main",
  "zones": [
    {
      "zone_id": "zone-001",
      "name": "Data Processing Pipeline",
      "risk_score": 8.5,
      "risk_trend": "increasing",
      "recent_defects": 3,
      "files": ["data/processor.cs", "data/validator.cs"],
      "owner": "data-team@integrity.azurewebsites.net"
    }
  ]
}
```

---

## 4. Dashboard API

### Purpose
Provide real-time visibility into test selection effectiveness.

### 4.1 Executive Dashboard Data

**Endpoint:** `GET /dashboard/executive`

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `time_range` | string | `7d` | `1d`, `7d`, `30d`, `90d` |
| `repository_id` | string | - | Filter by repository |

**Response (200 OK)**

```json
{
  "period": "7d",
  "kpis": {
    "velocity_improvement": 0.95,
    "qa_burden_reduction": 0.85,
    "defect_escape_reduction": 0.87,
    "cost_savings": 425000,
    "time_saved_hours": 580
  },
  "test_effectiveness": {
    "tests_recommended_total": 8920,
    "tests_excluded": 51240,
    "exclusion_rate": 0.852,
    "missed_defects": 1,
    "precision_score": 0.987
  },
  "trends": {
    "coverage_trend": "stable",
    "defect_density_trend": "improving",
    "test_duration_trend": "decreasing"
  }
}
```

---

### 4.2 QA Dashboard Data

**Endpoint:** `GET /dashboard/qa`

**Response (200 OK)**

```json
{
  "test_suites": [
    {
      "suite_id": "smoke-tests",
      "total_tests": 45,
      "pass_rate": 0.98,
      "average_duration_seconds": 234,
      "trend": "improving",
      "last_run": "2026-04-30T10:25:00Z"
    }
  ],
  "flaky_tests": [
    {
      "test_id": "test-async-operations",
      "flakiness_score": 0.35,
      "failure_rate": 0.15,
      "trend": "worsening"
    }
  ]
}
```

---

### 4.3 Developer Dashboard Data

**Endpoint:** `GET /dashboard/developer`

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repository_id` | string | Yes | Repository ID |
| `branch` | string | No | Branch name (default: main) |

**Response (200 OK)**

```json
{
  "repository_id": "integrity-core",
  "branch": "main",
  "my_recent_tests": [
    {
      "test_id": "test-selection-edge-cases",
      "status": "passing",
      "last_run": "2026-04-30T10:15:00Z",
      "duration_seconds": 12,
      "coverage_impact": 0.023
    }
  ],
  "coverage_by_file": [
    {
      "file_path": "selection/engine.cs",
      "coverage_percentage": 87.5,
      "trend": "stable",
      "uncovered_lines": 23
    }
  ]
}
```

---

## 5. Audit & Compliance API

### Purpose
Provide immutable audit trail for SOX 404 compliance.

### 5.1 Get Audit Log

**Endpoint:** `GET /audit-log?start_date=2026-04-01&end_date=2026-04-30&event_type=deployment`

**Response (200 OK)**

```json
{
  "events": [
    {
      "event_id": "evt-20260430-001",
      "timestamp": "2026-04-30T10:15:00Z",
      "event_type": "test_selection_recommendation",
      "actor": "developer@integrity.azurewebsites.net",
      "action": "Generated test recommendation for PR #123",
      "details": {
        "pull_request_id": "123",
        "tests_recommended": 23,
        "coverage_impact": 0.88
      },
      "request_id": "req-abc123",
      "immutable": true,
      "signed_hash": "sha256:abcd1234..."
    }
  ],
  "total_events": 1240
}
```

---

### 5.2 Verify Compliance

**Endpoint:** `POST /audit-log/verify`

**Request**

```json
{
  "event_id": "evt-20260430-001",
  "verification_method": "hash_validation"
}
```

**Response (200 OK)**

```json
{
  "event_id": "evt-20260430-001",
  "verified": true,
  "hash_valid": true,
  "chain_integrity": true,
  "verified_at": "2026-04-30T10:20:00Z"
}
```

---

## 6. Health & Status API

### Purpose
Monitor API health and service availability.

### 6.1 Health Check

**Endpoint:** `GET /health`

**Response (200 OK)**

```json
{
  "status": "healthy",
  "timestamp": "2026-04-30T10:25:00Z",
  "services": {
    "api_gateway": {
      "status": "healthy",
      "response_time_ms": 2
    },
    "test_selection_engine": {
      "status": "healthy",
      "response_time_ms": 45
    },
    "database": {
      "status": "healthy",
      "response_time_ms": 12
    },
    "azure_sql": {
      "status": "healthy",
      "connection_pool_usage": 0.35
    },
    "service_bus": {
      "status": "healthy",
      "queue_depth": 123
    }
  }
}
```

---

### 6.2 Service Status

**Endpoint:** `GET /status`

**Response (200 OK)**

```json
{
  "service": "integrity-api",
  "version": "1.0.0",
  "uptime_percentage": 99.94,
  "incidents_last_30d": 0,
  "sla": "99.9%"
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Missing required field: repository_id",
    "details": {
      "field": "repository_id",
      "reason": "required"
    },
    "request_id": "req-abc123",
    "timestamp": "2026-04-30T10:25:00Z"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| `INVALID_REQUEST` | 400 | Missing or invalid parameters |
| `UNAUTHORIZED` | 401 | Invalid/missing authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

---

## Integration Examples

### Example 1: Complete Test Selection Workflow

```bash
# Step 1: Analyze code changes
curl -X POST https://api.integrity.azurewebsites.net/v1/test-selection/analyze \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "repository_id": "integrity-core",
    "base_branch": "main",
    "head_branch": "feature/new-logic"
  }'
# Response: analysis_id = ts-20260430-001

# Step 2: Recommend tests
curl -X POST https://api.integrity.azurewebsites.net/v1/test-selection/recommend \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "analysis_id": "ts-20260430-001",
    "selection_strategy": "balanced"
  }'
# Response: recommendation_id = rec-20260430-001, 23 tests selected

# Step 3: Execute tests (via CI/CD pipeline)
# Tests run in Azure DevOps Pipelines

# Step 4: Record results
curl -X POST https://api.integrity.azurewebsites.net/v1/test-selection/results \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "recommendation_id": "rec-20260430-001",
    "execution_results": [...]
  }'
```

---

## Document Information

**Created:** April 30, 2026  
**Phase:** 05-Architecture  
**Skill:** API Specification  
**Approver:** Technical Lead (Architecture Review)  
**Status:** ⏳ PENDING APPROVAL  
**Version:** 1.0

**API Standards:**
- REST conventions (RFC 7231, 7232, 7235)
- JSON payloads
- OAuth 2.0 Bearer tokens
- Rate limiting: 1000 req/min per token
- Versioning: v1, v2, etc. in URL path
- Async operations: 202 Accepted for long-running tasks
- Pagination: cursor-based for large datasets
