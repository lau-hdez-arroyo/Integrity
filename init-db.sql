-- INTEGRITY API - PostgreSQL Initialize Script
-- Creates database schema with Supabase compatibility
-- Run this on first PostgreSQL container startup

-- NOTE: Supabase uses gen_random_uuid() instead of uuid_generate_v4()
-- Both functions do the same thing - generate random UUIDs

-- For LOCAL Docker: Uncomment these extensions
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- For SUPABASE CLOUD: Extensions are already enabled
-- (pgcrypto and uuid-ossp are available by default)

-- NOTE: Creating tables in public schema (default for Supabase)
-- This ensures tables are visible in Supabase Table Editor

-- Drop existing tables if they exist (for clean startup)
DROP TABLE IF EXISTS admin_logs CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS risk_assessments CASCADE;
DROP TABLE IF EXISTS test_executions CASCADE;
DROP TABLE IF EXISTS heat_maps CASCADE;
DROP TABLE IF EXISTS integration_mappings CASCADE;
DROP TABLE IF EXISTS connections CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    user_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'PM', 'Developer', 'QA', 'Executive')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE UNIQUE INDEX idx_users_project_email ON users (project_id, email);
CREATE INDEX idx_users_project_id ON users (project_id);

-- Projects table
CREATE TABLE projects (
    project_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    repository_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Connections table
CREATE TABLE connections (
    connection_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    integration_type VARCHAR(50) NOT NULL,
    encrypted_credentials TEXT NOT NULL,
    test_connection_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_connections_project_id ON connections (project_id);
CREATE INDEX idx_connections_project_type ON connections (project_id, integration_type);

-- Project Members table
CREATE TABLE project_members (
    member_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_project_members_project_id ON project_members (project_id);
CREATE INDEX idx_project_members_user_id ON project_members (user_id);

-- Integration Mappings table
CREATE TABLE integration_mappings (
    mapping_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    connection_id UUID NOT NULL REFERENCES connections(connection_id) ON DELETE CASCADE,
    repository_key VARCHAR(255) NOT NULL,
    source_key VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_integration_mappings_project_id ON integration_mappings (project_id);
CREATE INDEX idx_integration_mappings_connection_id ON integration_mappings (connection_id);

-- Heat Maps table
CREATE TABLE heat_maps (
    heat_map_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    repository_branch_id VARCHAR(255),
    coverage_percentage NUMERIC(5, 2),
    risk_score NUMERIC(5, 2),
    coverage_by_module JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_heat_maps_project_id ON heat_maps (project_id);
CREATE INDEX idx_heat_maps_project_generated ON heat_maps (project_id, generated_at DESC);

-- Test Executions table
CREATE TABLE test_executions (
    execution_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Risk Assessments table
CREATE TABLE risk_assessments (
    risk_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    change_id VARCHAR(255) NOT NULL,
    risk_score NUMERIC(3, 1),
    predicted_escape_rate NUMERIC(3, 2),
    factors JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_risk_assessments_project_id ON risk_assessments (project_id);
CREATE INDEX idx_risk_assessments_project_created ON risk_assessments (project_id, created_at DESC);

-- Audit Logs table (immutable for compliance)
CREATE TABLE audit_logs (
    audit_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
CREATE INDEX idx_audit_logs_user_id ON audit_logs (user_id);

-- Admin Logs table
CREATE TABLE admin_logs (
    log_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    config_change_type VARCHAR(50) NOT NULL,
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_admin_logs_project_id ON admin_logs (project_id);
CREATE INDEX idx_admin_logs_project_timestamp ON admin_logs (project_id, timestamp DESC);

-- Insert demo project
INSERT INTO projects (project_id, name, repository_url, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'INTEGRITY Demo',
    'https://github.com/demo/integrity',
    now(),
    now()
);

-- Insert demo user (Admin role)
INSERT INTO users (user_id, project_id, email, role, is_active, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'admin@demo.local',
    'Admin',
    true,
    now(),
    now()
);

-- Insert demo connection (ADO)
INSERT INTO connections (connection_id, project_id, integration_type, encrypted_credentials, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'ADO',
    'demo-encrypted-credentials',
    now(),
    now()
);

-- Tables are now created in public schema (visible in Supabase Table Editor)
-- All permissions are inherited from public schema
