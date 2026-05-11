-- ADO sync persistence tables
-- Run once in Supabase SQL editor or PostgreSQL client.

CREATE TABLE IF NOT EXISTS ado_sync_runs (
  sync_run_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  connection_id UUID REFERENCES connections(connection_id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('RUNNING', 'SUCCESS', 'FAILED')),
  triggered_by_email VARCHAR(255),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  summary JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ado_sync_runs_project_started
  ON ado_sync_runs (project_id, started_at DESC);

ALTER TABLE ado_sync_runs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE ado_sync_runs FROM anon, authenticated;
GRANT ALL ON TABLE ado_sync_runs TO service_role;

DROP POLICY IF EXISTS "ado_sync_runs_service_role_only" ON ado_sync_runs;
CREATE POLICY "ado_sync_runs_service_role_only"
  ON ado_sync_runs
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS ado_project_snapshots (
  snapshot_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  source VARCHAR(20) NOT NULL DEFAULT 'ADO',
  summary JSONB NOT NULL,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ado_snapshots_project_synced
  ON ado_project_snapshots (project_id, synced_at DESC);

ALTER TABLE ado_project_snapshots ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE ado_project_snapshots FROM anon, authenticated;
GRANT ALL ON TABLE ado_project_snapshots TO service_role;

DROP POLICY IF EXISTS "ado_project_snapshots_service_role_only" ON ado_project_snapshots;
CREATE POLICY "ado_project_snapshots_service_role_only"
  ON ado_project_snapshots
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
