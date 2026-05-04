# Database Schema

Complete PostgreSQL schema for INTEGRITY platform.

## Overview

INTEGRITY uses PostgreSQL with 10 core tables designed for multi-tenant architecture:

```
users ─┬─ project_members ─┐
       │                   ├─ projects
       └─────────────────┐ │
                         ├─ connections
                         ├─ integration_mappings
                         ├─ heat_maps
                         ├─ test_executions
                         ├─ risk_assessments
                         ├─ audit_logs
                         └─ admin_logs
```

---

## Core Tables

### users

Stores application users by project.

```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'PM', 'Developer', 'QA', 'Executive')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE UNIQUE INDEX idx_users_project_email ON users (project_id, email);
```

| Column | Type | Notes |
|--------|------|-------|
| `user_id` | UUID | Primary key, auto-generated |
| `project_id` | UUID | Foreign key to projects |
| `email` | VARCHAR(255) | User email address |
| `role` | VARCHAR(50) | Admin, PM, Developer, QA, Executive |
| `is_active` | BOOLEAN | User account status |
| `created_at` | TIMESTAMP | Account creation time |
| `updated_at` | TIMESTAMP | Last update time |

---

### projects

Project definitions and repository information.

```sql
CREATE TABLE projects (
    project_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    repository_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

| Column | Type | Notes |
|--------|------|-------|
| `project_id` | UUID | Primary key |
| `name` | VARCHAR(255) | Project name |
| `repository_url` | VARCHAR(500) | Git repository URL |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update time |

---

### connections

External system integrations (Azure DevOps, GitHub, Jenkins, etc).

```sql
CREATE TABLE connections (
    connection_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    integration_type VARCHAR(50) NOT NULL,
    encrypted_credentials TEXT NOT NULL,
    test_connection_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_connections_project_id ON connections (project_id);
```

| Column | Type | Notes |
|--------|------|-------|
| `connection_id` | UUID | Primary key |
| `project_id` | UUID | Foreign key to projects |
| `integration_type` | VARCHAR(50) | ADO, GitHub, Jenkins, etc. |
| `encrypted_credentials` | TEXT | Encrypted API credentials |
| `test_connection_at` | TIMESTAMP | Last successful test |
| `created_at` | TIMESTAMP | Creation time |

---

### project_members

Project team membership and roles.

```sql
CREATE TABLE project_members (
    member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_project_members_project_id ON project_members (project_id);
```

| Column | Type | Notes |
|--------|------|-------|
| `member_id` | UUID | Primary key |
| `project_id` | UUID | Foreign key |
| `user_id` | UUID | Foreign key |
| `role` | VARCHAR(50) | Team role |
| `joined_at` | TIMESTAMP | Join date |

---

### integration_mappings

Maps repository entities to external system entities.

```sql
CREATE TABLE integration_mappings (
    mapping_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    connection_id UUID NOT NULL REFERENCES connections(connection_id) ON DELETE CASCADE,
    repository_key VARCHAR(255) NOT NULL,
    source_key VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_integration_mappings_project_id ON integration_mappings (project_id);
```

| Column | Type | Notes |
|--------|------|-------|
| `mapping_id` | UUID | Primary key |
| `project_id` | UUID | Foreign key |
| `connection_id` | UUID | Foreign key |
| `repository_key` | VARCHAR(255) | Repo identifier |
| `source_key` | VARCHAR(255) | External system ID |
| `created_at` | TIMESTAMP | Creation time |

---

## Analysis Tables

### heat_maps

Code coverage heat map data by module.

```sql
CREATE TABLE heat_maps (
    heat_map_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    repository_branch_id VARCHAR(255),
    coverage_percentage NUMERIC(5, 2),
    risk_score NUMERIC(5, 2),
    coverage_by_module JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_heat_maps_project_id ON heat_maps (project_id);
CREATE INDEX idx_heat_maps_project_generated ON heat_maps (project_id, generated_at DESC);
```

| Column | Type | Notes |
|--------|------|-------|
| `heat_map_id` | UUID | Primary key |
| `project_id` | UUID | Foreign key |
| `repository_branch_id` | VARCHAR(255) | Branch reference |
| `coverage_percentage` | NUMERIC(5,2) | Overall coverage % |
| `risk_score` | NUMERIC(5,2) | Overall risk 0-100 |
| `coverage_by_module` | JSONB | Per-module data |
| `generated_at` | TIMESTAMP | Generation time |

**coverage_by_module** JSONB format:
```json
{
  "modules": [
    {
      "name": "api/v1",
      "coverage": 85.5,
      "complexity": 3.2,
      "riskScore": 45,
      "defectRate": 0.02
    }
  ]
}
```

---

### test_executions

Test run history and results.

```sql
CREATE TABLE test_executions (
    execution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    test_suite_id VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'RUNNING', 'PASSED', 'FAILED')),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_test_executions_project_id ON test_executions (project_id);
CREATE INDEX idx_test_executions_project_time ON test_executions (project_id, start_time DESC);
```

| Column | Type | Notes |
|--------|------|-------|
| `execution_id` | UUID | Primary key |
| `project_id` | UUID | Foreign key |
| `test_suite_id` | VARCHAR(255) | Test identifier |
| `status` | VARCHAR(20) | PENDING, RUNNING, PASSED, FAILED |
| `start_time` | TIMESTAMP | Execution start |
| `end_time` | TIMESTAMP | Execution end |
| `duration` | NUMERIC(10,2) | Duration in ms |
| `created_at` | TIMESTAMP | Record creation |

---

### risk_assessments

Risk evaluation records for code changes.

```sql
CREATE TABLE risk_assessments (
    risk_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    change_id VARCHAR(255) NOT NULL,
    risk_score NUMERIC(3, 1),
    predicted_escape_rate NUMERIC(3, 2),
    factors JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_risk_assessments_project_id ON risk_assessments (project_id);
CREATE INDEX idx_risk_assessments_project_created ON risk_assessments (project_id, created_at DESC);
```

| Column | Type | Notes |
|--------|------|-------|
| `risk_id` | UUID | Primary key |
| `project_id` | UUID | Foreign key |
| `change_id` | VARCHAR(255) | PR/MR identifier |
| `risk_score` | NUMERIC(3,1) | Score 0-10 |
| `predicted_escape_rate` | NUMERIC(3,2) | ML prediction % |
| `factors` | JSONB | Risk factors breakdown |
| `created_at` | TIMESTAMP | Assessment time |

**factors** JSONB format:
```json
{
  "factors": [
    {
      "name": "Complexity Delta",
      "weight": 0.3,
      "score": 7.2,
      "description": "Changes in high complexity code"
    }
  ],
  "recommendation": "REVIEW"
}
```

---

## Compliance Tables

### audit_logs

Immutable audit trail for compliance and debugging.

```sql
CREATE TABLE audit_logs (
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_audit_logs_project_id ON audit_logs (project_id);
CREATE INDEX idx_audit_logs_project_timestamp ON audit_logs (project_id, timestamp DESC);
```

| Column | Type | Notes |
|--------|------|-------|
| `audit_id` | UUID | Primary key |
| `project_id` | UUID | Foreign key |
| `user_id` | UUID | User who made change |
| `action` | VARCHAR(100) | CREATE, UPDATE, DELETE |
| `entity` | VARCHAR(100) | Entity type |
| `entity_id` | VARCHAR(255) | Entity ID |
| `old_values` | JSONB | Previous values |
| `new_values` | JSONB | New values |
| `timestamp` | TIMESTAMP | Action time |
| `ip_address` | VARCHAR(45) | Source IP |

---

### admin_logs

Configuration changes by administrators.

```sql
CREATE TABLE admin_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    config_change_type VARCHAR(50) NOT NULL,
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_admin_logs_project_id ON admin_logs (project_id);
```

| Column | Type | Notes |
|--------|------|-------|
| `log_id` | UUID | Primary key |
| `project_id` | UUID | Foreign key |
| `admin_id` | UUID | Administrator |
| `config_change_type` | VARCHAR(50) | Type of change |
| `details` | JSONB | Change details |
| `timestamp` | TIMESTAMP | Change time |

---

## Queries

### Get latest heat map for project

```sql
SELECT * FROM heat_maps
WHERE project_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY generated_at DESC
LIMIT 1;
```

### Get test execution history

```sql
SELECT 
  test_suite_id,
  status,
  COUNT(*) as total,
  AVG(duration) as avg_duration
FROM test_executions
WHERE project_id = '550e8400-e29b-41d4-a716-446655440000'
  AND start_time >= now() - interval '7 days'
GROUP BY test_suite_id, status
ORDER BY total DESC;
```

### Get project members

```sql
SELECT 
  u.email,
  u.role,
  pm.role as project_role,
  pm.joined_at
FROM project_members pm
JOIN users u ON pm.user_id = u.user_id
WHERE pm.project_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY pm.joined_at;
```

### Audit trail for entity

```sql
SELECT 
  action,
  old_values,
  new_values,
  timestamp,
  u.email as user_email
FROM audit_logs al
JOIN users u ON al.user_id = u.user_id
WHERE al.project_id = '550e8400-e29b-41d4-a716-446655440000'
  AND al.entity_id = 'target-id'
ORDER BY al.timestamp DESC;
```

### Average risk score trend

```sql
SELECT 
  DATE(created_at) as date,
  AVG(risk_score) as avg_risk,
  COUNT(*) as assessments
FROM risk_assessments
WHERE project_id = '550e8400-e29b-41d4-a716-446655440000'
  AND created_at >= now() - interval '30 days'
GROUP BY DATE(created_at)
ORDER BY date;
```

---

## Backup Strategy

### Supabase Automatic Backups
- Daily automated backups
- 7-day retention (free tier)
- Point-in-time recovery available

### Manual Backup

```bash
# Export entire database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup-20260501.sql
```

---

## Performance Considerations

### Indexes Created
- `idx_users_project_email` - User lookup by project+email
- `idx_connections_project_id` - Find connections by project
- `idx_heat_maps_project_generated` - Latest heat map query
- `idx_test_executions_project_time` - Recent test results
- `idx_audit_logs_project_timestamp` - Audit trail queries

### Query Optimization
- Use `project_id` in WHERE clause (partition key)
- Filter by timestamp for time-series data
- Limit JSONB queries with WHERE conditions

### Storage Estimation
- 1,000 projects: ~100 MB
- 100,000 test executions: ~50 MB
- 10,000 heat maps: ~50 MB
- Audit logs (1 year): ~100 MB
- **Total: ~300 MB** (includes growth buffer)

---

## Data Retention Policy

| Table | Retention | Notes |
|-------|-----------|-------|
| `users` | Indefinite | Soft delete with `is_active` |
| `projects` | Indefinite | Archive instead of delete |
| `test_executions` | 1 year | Aggregate old data |
| `heat_maps` | 90 days | Keep recent only |
| `risk_assessments` | 1 year | Historical trends |
| `audit_logs` | 3 years | Compliance requirement |
| `admin_logs` | 3 years | Compliance requirement |

---

## Schema Migration

To update schema in production:

1. Test changes locally first
2. Create migration file in version control
3. Test migration with production data copy
4. Schedule maintenance window
5. Run migration in Supabase SQL Editor
6. Verify all queries still work
7. Update documentation

---

## Related Files

- [init-db.sql](../init-db.sql) - Schema initialization script
- [API_REFERENCE.md](./API_REFERENCE.md) - How to query data via API
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Database setup guide
