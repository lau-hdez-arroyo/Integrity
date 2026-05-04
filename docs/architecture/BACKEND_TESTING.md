# Backend Testing Guide

Quick guide to test all backend endpoints.

## Prerequisites

1. **Start backend:**
```bash
npm run dev:backend
```

2. **Get JWT Token:**
```bash
# For testing, we'll use a mock token since Supabase Auth is configured
# In production, get from Supabase Auth
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

For local testing, use `curl` with the Authorization header.

## Test Endpoints

### 1. Health Check (No Auth)
```bash
curl -X GET http://localhost:5000/health
```

**Expected:**
```json
{
  "status": "ok",
  "database": "connected",
  "uptime": 12.34
}
```

### 2. List Projects
```bash
curl -X GET http://localhost:5000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected:**
```json
{
  "status": "success",
  "data": [...],
  "count": 2
}
```

### 3. Create Project
```bash
curl -X POST http://localhost:5000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "repository_url": "https://github.com/test/repo"
  }'
```

**Expected:** `201 Created`

### 4. Get Project Details
```bash
PROJECT_ID="550e8400-e29b-41d4-a716-446655440000"

curl -X GET http://localhost:5000/api/v1/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Generate Heat Map
```bash
curl -X POST http://localhost:5000/api/v1/heatmaps/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**Expected:** Heat map with modules and coverage data

### 6. Get Latest Heat Map
```bash
curl -X GET http://localhost:5000/api/v1/heatmaps/550e8400-e29b-41d4-a716-446655440000/latest \
  -H "Authorization: Bearer $TOKEN"
```

### 7. Test Selection Recommendation
```bash
curl -X POST http://localhost:5000/api/v1/test-selection/recommend \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "550e8400-e29b-41d4-a716-446655440000",
    "changedFiles": ["src/services/auth.ts"],
    "riskTolerance": "BALANCED"
  }'
```

**Expected:**
```json
{
  "status": "success",
  "data": {
    "selectedTests": [...],
    "totalEstimatedTime": 230,
    "expectedCoverage": 0.91,
    "recommendation": "RUN"
  }
}
```

### 8. Risk Assessment
```bash
curl -X POST http://localhost:5000/api/v1/risk-assessment/evaluate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "550e8400-e29b-41d4-a716-446655440000",
    "changedFiles": ["src/services/auth.ts"],
    "affectedModules": ["authentication"]
  }'
```

**Expected:**
```json
{
  "status": "success",
  "data": {
    "riskScore": 6.5,
    "riskLevel": "MODERATE",
    "factors": [...],
    "recommendation": "REVIEW",
    "suggestedActions": [...]
  }
}
```

### 9. Executive Dashboard
```bash
curl -X GET http://localhost:5000/api/v1/dashboard/executive/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $TOKEN"
```

### 10. QA Dashboard
```bash
curl -X GET http://localhost:5000/api/v1/dashboard/qa/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $TOKEN"
```

### 11. Developer Dashboard
```bash
curl -X GET http://localhost:5000/api/v1/dashboard/developer/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $TOKEN"
```

## Error Testing

### Missing Auth Header
```bash
curl -X GET http://localhost:5000/api/v1/projects
```

**Expected:** `401 Unauthorized`

### Invalid Project ID
```bash
curl -X GET http://localhost:5000/api/v1/projects/invalid-id \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** `400 Bad Request`

### Nonexistent Project
```bash
curl -X GET http://localhost:5000/api/v1/projects/00000000-0000-0000-0000-000000000000 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** `404 Not Found`

## Using Postman

1. Create new Collection: "INTEGRITY API"
2. Set environment variable: `token = your-jwt-token`
3. Set base URL: `http://localhost:5000`
4. Create requests using headers:
   ```
   Authorization: Bearer {{token}}
   Content-Type: application/json
   ```

## Automated Tests

Run Jest tests:
```bash
npm run test:backend
```

## Response Format

All successful responses follow this format:
```json
{
  "status": "success",
  "data": { ... },
  "message": "Optional message"
}
```

All error responses:
```json
{
  "status": "error",
  "message": "Error description",
  "statusCode": 400
}
```

## Tips

- Use `jq` to format JSON output: `curl ... | jq`
- Export token to env: `export TOKEN="..."`
- Use `-v` flag for verbose output: `curl -v ...`
- Check logs: `npm run dev:backend` shows request logs
