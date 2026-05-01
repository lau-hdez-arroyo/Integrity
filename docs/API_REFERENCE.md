# INTEGRITY API Reference

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication

All endpoints (except `/health`) require JWT token in header:
```
Authorization: Bearer <jwt-token>
```

Tokens are obtained from Supabase Auth and included in all requests.

---

## Endpoints

### Health Check

#### GET /health
No authentication required. Used for deployment health checks.

**Request:**
```bash
curl http://localhost:5000/health
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-05-01T10:30:00Z",
  "uptime": 1234.5
}
```

---

## Projects

### List All Projects

#### GET /projects
List all projects accessible to authenticated user.

**Request:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/v1/projects
```

**Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "INTEGRITY Demo",
    "description": "Test project for INTEGRITY platform",
    "ownerId": "user-123",
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-05-01T10:00:00Z"
  }
]
```

### Get Project by ID

#### GET /projects/:id
Get detailed information about a specific project.

**Path Parameters:**
- `id` (UUID) - Project ID

**Request:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/v1/projects/550e8400-e29b-41d4-a716-446655440000
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "INTEGRITY Demo",
  "description": "Test project for INTEGRITY platform",
  "repository": "https://github.com/demo/integrity",
  "ownerId": "user-123",
  "members": ["user-123", "user-456"],
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-05-01T10:00:00Z"
}
```

### Create Project

#### POST /projects
Create a new project (requires Admin role).

**Request Body:**
```json
{
  "name": "My New Project",
  "description": "Project description",
  "repository": "https://github.com/org/repo"
}
```

**Request:**
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My New Project",
    "description": "Description",
    "repository": "https://github.com/org/repo"
  }' \
  http://localhost:5000/api/v1/projects
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "My New Project",
  "description": "Description",
  "repository": "https://github.com/org/repo",
  "ownerId": "user-123",
  "createdAt": "2026-05-01T10:30:00Z"
}
```

### Update Project

#### PUT /projects/:id
Update project details (requires Admin role).

**Path Parameters:**
- `id` (UUID) - Project ID

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Updated Name",
  "description": "Updated description",
  "updatedAt": "2026-05-01T10:35:00Z"
}
```

### Delete Project

#### DELETE /projects/:id
Delete a project (requires Admin role).

**Path Parameters:**
- `id` (UUID) - Project ID

**Response (204 No Content):**
```
(empty body)
```

---

## Heat Maps

### Generate Heat Map

#### POST /heatmaps/generate
Generate a new heat map for a project.

**Request Body:**
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "filePattern": "src/**/*.ts",
  "excludePattern": "**/*.test.ts"
}
```

**Request:**
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "550e8400-e29b-41d4-a716-446655440000"
  }' \
  http://localhost:5000/api/v1/heatmaps/generate
```

**Response (200 OK):**
```json
{
  "id": "hm-123",
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "modules": [
      {
        "name": "api/v1",
        "coverage": 85.5,
        "complexity": 3.2,
        "riskScore": 45,
        "defectRate": 0.02
      },
      {
        "name": "services/auth",
        "coverage": 92.1,
        "complexity": 2.1,
        "riskScore": 25,
        "defectRate": 0.01
      }
    ]
  },
  "generatedAt": "2026-05-01T10:30:00Z"
}
```

### Get Latest Heat Map

#### GET /heatmaps/:projectId/latest
Get the most recent heat map for a project.

**Path Parameters:**
- `projectId` (UUID) - Project ID

**Request:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/v1/heatmaps/550e8400-e29b-41d4-a716-446655440000/latest
```

**Response (200 OK):**
```json
{
  "id": "hm-123",
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "data": { ... },
  "generatedAt": "2026-05-01T10:30:00Z"
}
```

---

## Test Selection

### Get Test Recommendations

#### POST /test-selection/recommend
Get intelligent test recommendations based on code changes.

**Request Body:**
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "changedFiles": [
    "src/services/auth.ts",
    "src/utils/helpers.ts"
  ],
  "riskTolerance": "BALANCED"
}
```

**Query Parameters:**
- `riskTolerance` (enum) - AGGRESSIVE, BALANCED, CONSERVATIVE (default: BALANCED)

**Request:**
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "550e8400-e29b-41d4-a716-446655440000",
    "changedFiles": ["src/services/auth.ts"],
    "riskTolerance": "BALANCED"
  }' \
  http://localhost:5000/api/v1/test-selection/recommend
```

**Response (200 OK):**
```json
{
  "selectedTests": [
    {
      "id": "test-1",
      "name": "AuthService.login",
      "file": "src/services/auth.test.ts",
      "estimatedDuration": 150,
      "priority": 1,
      "coverageRatio": 0.95
    },
    {
      "id": "test-2",
      "name": "AuthService.logout",
      "file": "src/services/auth.test.ts",
      "estimatedDuration": 80,
      "priority": 2,
      "coverageRatio": 0.88
    }
  ],
  "totalEstimatedTime": 230,
  "expectedCoverage": 0.91,
  "recommendation": "RUN"
}
```

---

## Risk Assessment

### Evaluate Risk

#### POST /risk-assessment/evaluate
Evaluate the risk of code changes.

**Request Body:**
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "changedFiles": [
    "src/services/auth.ts",
    "src/db/migrations/001_users.sql"
  ],
  "affectedModules": ["authentication", "database"]
}
```

**Request:**
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "550e8400-e29b-41d4-a716-446655440000",
    "changedFiles": ["src/services/auth.ts"],
    "affectedModules": ["authentication"]
  }' \
  http://localhost:5000/api/v1/risk-assessment/evaluate
```

**Response (200 OK):**
```json
{
  "riskScore": 6.5,
  "riskLevel": "MODERATE",
  "factors": [
    {
      "name": "Complexity Delta",
      "weight": 0.3,
      "score": 7.2,
      "description": "Changes in high complexity code"
    },
    {
      "name": "Coverage Gap",
      "weight": 0.25,
      "score": 5.1,
      "description": "Modified files have 85% coverage"
    },
    {
      "name": "Defect History",
      "weight": 0.25,
      "score": 6.8,
      "description": "Module had 3 defects in last 6 months"
    },
    {
      "name": "Escape Probability",
      "weight": 0.2,
      "score": 7.5,
      "description": "ML prediction: 4.2% escape rate"
    }
  ],
  "recommendation": "REVIEW",
  "suggestedActions": [
    "Require additional test coverage",
    "Perform manual code review",
    "Run full regression suite"
  ]
}
```

---

## Dashboard

### Executive Dashboard

#### GET /dashboard/executive/:projectId
Get executive-level KPIs for a project.

**Path Parameters:**
- `projectId` (UUID) - Project ID

**Request:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/v1/dashboard/executive/550e8400-e29b-41d4-a716-446655440000
```

**Response (200 OK):**
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "qualityScore": 8.7,
  "defectEscapeRate": 0.02,
  "testExecutionTime": 2400,
  "timeReduction": 45,
  "velocity": {
    "current": 42,
    "trend": "up",
    "changePercent": 15
  },
  "releases": {
    "total": 24,
    "withZeroDefects": 18,
    "successRate": 0.75
  }
}
```

### QA Dashboard

#### GET /dashboard/qa/:projectId
Get QA-focused metrics for a project.

**Path Parameters:**
- `projectId` (UUID) - Project ID

**Request:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/v1/dashboard/qa/550e8400-e29b-41d4-a716-446655440000
```

**Response (200 OK):**
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "coverage": {
    "overall": 87.3,
    "byModule": [
      { "module": "api/v1", "coverage": 92.1 },
      { "module": "services/auth", "coverage": 85.0 }
    ]
  },
  "flakyTests": [
    { "name": "IntegrationTest.flaky", "failureRate": 0.15 }
  ],
  "testExecutions": {
    "total": 1250,
    "passed": 1225,
    "failed": 15,
    "skipped": 10,
    "averageDuration": 2100
  }
}
```

### Developer Dashboard

#### GET /dashboard/developer/:projectId
Get developer-focused metrics for a project.

**Path Parameters:**
- `projectId` (UUID) - Project ID

**Request:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/v1/dashboard/developer/550e8400-e29b-41d4-a716-446655440000
```

**Response (200 OK):**
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "personalMetrics": {
    "pullRequests": 12,
    "averageCodeQuality": 8.2,
    "averageTestCoverage": 88.5,
    "defectsEscaped": 1
  },
  "recentPullRequests": [
    {
      "id": "pr-123",
      "title": "Add authentication middleware",
      "qualityScore": 8.9,
      "testCoverageGap": 2.1,
      "riskScore": 4.2,
      "status": "merged"
    }
  ]
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "status": "error",
  "message": "Descriptive error message",
  "statusCode": 400
}
```

### Common Error Codes

| Status | Code | Message |
|--------|------|---------|
| 400 | BAD_REQUEST | Invalid request parameters |
| 401 | UNAUTHORIZED | Missing or invalid authentication token |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 500 | INTERNAL_ERROR | Server error |

### Example Error Response

```json
{
  "status": "error",
  "message": "Project not found with ID: invalid-id",
  "statusCode": 404
}
```

---

## Rate Limiting

Currently no rate limits. Future implementation will include:
- 1000 requests/hour per user
- 10000 requests/hour per API key
- Response header: `X-RateLimit-Remaining`

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 20, max: 100) - Results per page

**Response Headers:**
- `X-Total-Count` - Total number of results
- `X-Page` - Current page
- `X-Limit` - Results per page

---

## Changelog

### v1.0.0 (2026-05-01)
- Initial API release
- 6 core endpoints
- Supabase authentication
- Heat map generation
- Intelligent test selection
- Risk assessment
- Dashboard aggregation

---

## API Testing

### Using cURL

```bash
# Health check
curl http://localhost:5000/health

# Get projects
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/v1/projects

# Generate heat map
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"projectId": "550e8400-e29b-41d4-a716-446655440000"}' \
  http://localhost:5000/api/v1/heatmaps/generate
```

### Using Postman

1. Import Base URL: `http://localhost:5000/api/v1`
2. Add Authorization Header: `Authorization: Bearer {token}`
3. Use endpoints above

### Using Frontend Client

```javascript
import { projectsAPI, heatmapAPI } from './src/services/api';

// Get all projects
const projects = await projectsAPI.getAll();

// Generate heat map
const heatmap = await heatmapAPI.get(projectId);
```
