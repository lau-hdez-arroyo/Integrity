-- Stores per-sync change history for ADO project analysis

CREATE TABLE IF NOT EXISTS ado_sync_changes (
  sync_change_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_run_id UUID REFERENCES ado_sync_runs(sync_run_id) ON DELETE SET NULL,
  project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  previous_snapshot_id UUID REFERENCES ado_project_snapshots(snapshot_id) ON DELETE SET NULL,
  current_snapshot_id UUID REFERENCES ado_project_snapshots(snapshot_id) ON DELETE SET NULL,
  change_summary JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ado_sync_changes_project_created
  ON ado_sync_changes (project_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ado_sync_changes_sync_run
  ON ado_sync_changes (sync_run_id);

ALTER TABLE ado_sync_changes ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE ado_sync_changes FROM anon, authenticated;
GRANT ALL ON TABLE ado_sync_changes TO service_role;

DROP POLICY IF EXISTS "ado_sync_changes_service_role_only" ON ado_sync_changes;
CREATE POLICY "ado_sync_changes_service_role_only"
  ON ado_sync_changes
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
