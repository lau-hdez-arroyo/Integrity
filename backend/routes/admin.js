import express from 'express';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { getSupabaseClient } from '../db/supabase.js';
import { fetchAdoProjectSummary, validateAdoConnection } from '../services/adoClient.js';
import { getAdoAgentCredentials, getAdoAgentConfigStatus } from '../config/adoAgentConfig.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getEncryptionKey() {
  const keyRaw = process.env.ADO_CREDENTIALS_KEY || process.env.ENCRYPTION_KEY;
  if (!keyRaw) {
    throw new Error('Missing ADO_CREDENTIALS_KEY environment variable');
  }

  return crypto.createHash('sha256').update(keyRaw).digest();
}

function encryptCredentials(payload) {
  const iv = crypto.randomBytes(12);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'base64');
  encrypted += cipher.final('base64');

  return JSON.stringify({
    iv: iv.toString('base64'),
    authTag: cipher.getAuthTag().toString('base64'),
    data: encrypted,
  });
}

function decryptCredentials(encryptedText) {
  const key = getEncryptionKey();
  const payload = JSON.parse(encryptedText);
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(payload.iv, 'base64'),
  );

  decipher.setAuthTag(Buffer.from(payload.authTag, 'base64'));
  let decrypted = decipher.update(payload.data, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}

function validateProjectId(projectId) {
  return Boolean(projectId && projectId.length === 36);
}

function buildSyncChangeSummary(previousSummary, currentSummary) {
  const previous = previousSummary || {};
  const current = currentSummary || {};

  const metricChanges = {
    repositories: {
      previous: previous.repositoryCount || 0,
      current: current.repositoryCount || 0,
      delta: (current.repositoryCount || 0) - (previous.repositoryCount || 0),
    },
    tests: {
      previous: previous.tests?.total || 0,
      current: current.tests?.total || 0,
      delta: (current.tests?.total || 0) - (previous.tests?.total || 0),
    },
    functionalities: {
      previous: previous.features?.total || 0,
      current: current.features?.total || 0,
      delta: (current.features?.total || 0) - (previous.features?.total || 0),
    },
    coveragePercentage: {
      previous: previous.coverageAnalysis?.percentage,
      current: current.coverageAnalysis?.percentage,
      delta:
        typeof current.coverageAnalysis?.percentage === 'number' && typeof previous.coverageAnalysis?.percentage === 'number'
          ? Number((current.coverageAnalysis.percentage - previous.coverageAnalysis.percentage).toFixed(2))
          : null,
    },
  };

  const statusChanges = {
    projectDeveloped: {
      previous: Boolean(previous.repositoryAnalysis?.projectDeveloped),
      current: Boolean(current.repositoryAnalysis?.projectDeveloped),
    },
    automatedTestsDetected: {
      previous: Boolean(previous.repositoryAnalysis?.automatedTestsDetected),
      current: Boolean(current.repositoryAnalysis?.automatedTestsDetected),
    },
    unitTestsDetected: {
      previous: Boolean(previous.repositoryAnalysis?.unitTestsDetected),
      current: Boolean(current.repositoryAnalysis?.unitTestsDetected),
    },
    pipelinesConfigured: {
      previous: Boolean(previous.pipelineAnalysis?.configured),
      current: Boolean(current.pipelineAnalysis?.configured),
    },
  };

  return {
    generatedAt: new Date().toISOString(),
    metricChanges,
    statusChanges,
  };
}

async function getAdminUserId(supabase, req) {
  const email = String(req.user?.email || '').toLowerCase();
  if (!email) {
    return null;
  }

  const { data: user } = await supabase
    .from('users')
    .select('user_id')
    .eq('email', email)
    .eq('is_active', true)
    .maybeSingle();

  return user?.user_id || null;
}

/**
 * GET /api/v1/admin/ado/agent/status
 * Returns whether secure server credentials are configured
 */
router.get('/ado/agent/status', async (_req, res) => {
  const status = getAdoAgentConfigStatus();
  return res.json({
    status: 'success',
    data: {
      configured: status.configured,
      missing: status.missing,
    },
  });
});

/**
 * GET /api/v1/admin/ado/config/:projectId
 * Returns saved ADO configuration metadata (without token)
 */
router.get('/ado/config/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!validateProjectId(projectId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid project ID format',
        statusCode: 400,
      });
    }

    const supabase = getSupabaseClient();
    const { data: connection, error } = await supabase
      .from('connections')
      .select('connection_id, encrypted_credentials, updated_at, test_connection_at')
      .eq('project_id', projectId)
      .eq('integration_type', 'ADO')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error('Failed to read ADO configuration');
    }

    if (!connection) {
      return res.json({
        status: 'success',
        data: {
          configured: false,
        },
      });
    }

    const credentials = decryptCredentials(connection.encrypted_credentials);

    return res.json({
      status: 'success',
      data: {
        configured: true,
        connectionId: connection.connection_id,
        organizationUrl: credentials.organizationUrl,
        adoProject: credentials.adoProject,
        repositoryId: credentials.repositoryId || null,
        hasToken: Boolean(credentials.personalAccessToken),
        updatedAt: connection.updated_at,
        testConnectionAt: connection.test_connection_at,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
      statusCode: 500,
    });
  }
});

/**
 * POST /api/v1/admin/ado/connect
 * Saves ADO project connection credentials for one project
 */
router.post('/ado/connect', async (req, res) => {
  try {
    const {
      projectId,
      organizationUrl,
      adoProject,
      repositoryId,
      personalAccessToken,
      useAgentCredentials,
    } = req.body;

    if (!validateProjectId(projectId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid project ID format',
        statusCode: 400,
      });
    }

    let effectiveCredentials = {
      organizationUrl,
      adoProject,
      personalAccessToken,
    };

    if (useAgentCredentials) {
      const agentCredentials = getAdoAgentCredentials();
      if (!agentCredentials) {
        const status = getAdoAgentConfigStatus();
        return res.status(400).json({
          status: 'error',
          message: `Server ADO agent credentials not configured. Missing: ${status.missing.join(', ')}`,
          statusCode: 400,
        });
      }
      effectiveCredentials = agentCredentials;
    }

    if (!effectiveCredentials.organizationUrl || !effectiveCredentials.adoProject || !effectiveCredentials.personalAccessToken) {
      return res.status(400).json({
        status: 'error',
        message: 'organizationUrl, adoProject and personalAccessToken are required',
        statusCode: 400,
      });
    }

    const supabase = getSupabaseClient();

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('project_id')
      .eq('project_id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found',
        statusCode: 404,
      });
    }

    const adoProjectData = await validateAdoConnection({
      organizationUrl: effectiveCredentials.organizationUrl,
      adoProject: effectiveCredentials.adoProject,
      personalAccessToken: effectiveCredentials.personalAccessToken,
    });

    const encryptedCredentials = encryptCredentials({
      organizationUrl: effectiveCredentials.organizationUrl,
      adoProject: effectiveCredentials.adoProject,
      repositoryId: repositoryId || null,
      personalAccessToken: effectiveCredentials.personalAccessToken,
      source: useAgentCredentials ? 'SERVER_AGENT' : 'USER_INPUT',
    });

    const { data: existing } = await supabase
      .from('connections')
      .select('connection_id')
      .eq('project_id', projectId)
      .eq('integration_type', 'ADO')
      .limit(1)
      .maybeSingle();

    if (existing?.connection_id) {
      const { error: updateError } = await supabase
        .from('connections')
        .update({
          encrypted_credentials: encryptedCredentials,
          test_connection_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('connection_id', existing.connection_id);

      if (updateError) {
        throw new Error('Failed to update ADO connection');
      }
    } else {
      const { error: insertError } = await supabase.from('connections').insert({
        project_id: projectId,
        integration_type: 'ADO',
        encrypted_credentials: encryptedCredentials,
        test_connection_at: new Date().toISOString(),
      });

      if (insertError) {
        throw new Error('Failed to store ADO connection');
      }
    }

    return res.status(200).json({
      status: 'success',
      message: 'ADO connection configured successfully',
      data: {
        projectId,
        adoProject: adoProjectData.name,
        state: adoProjectData.state,
        visibility: adoProjectData.visibility,
        credentialsSource: useAgentCredentials ? 'SERVER_AGENT' : 'USER_INPUT',
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
      statusCode: 500,
    });
  }
});

/**
 * POST /api/v1/admin/ado/sync
 * Runs one manual ADO sync and persists summary snapshot
 */
router.post('/ado/sync', async (req, res) => {
  const startedAt = Date.now();
  let syncRunId = null;

  try {
    const { projectId } = req.body;

    if (!validateProjectId(projectId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid project ID format',
        statusCode: 400,
      });
    }

    const supabase = getSupabaseClient();
    const actorUserId = await getAdminUserId(supabase, req);

    const { data: connection, error: connectionError } = await supabase
      .from('connections')
      .select('connection_id, encrypted_credentials')
      .eq('project_id', projectId)
      .eq('integration_type', 'ADO')
      .limit(1)
      .maybeSingle();

    if (connectionError || !connection) {
      return res.status(404).json({
        status: 'error',
        message: 'ADO connection not configured for this project',
        statusCode: 404,
      });
    }

    const credentials = decryptCredentials(connection.encrypted_credentials);

    const { data: previousSnapshot } = await supabase
      .from('ado_project_snapshots')
      .select('snapshot_id, summary, synced_at')
      .eq('project_id', projectId)
      .order('synced_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: runRow } = await supabase
      .from('ado_sync_runs')
      .insert({
        project_id: projectId,
        connection_id: connection.connection_id,
        status: 'RUNNING',
        triggered_by_email: req.user?.email || null,
      })
      .select('sync_run_id')
      .single();

    syncRunId = runRow?.sync_run_id || null;

    const summary = await fetchAdoProjectSummary(credentials);

    const durationMs = Date.now() - startedAt;
    const snapshotPayload = {
      source: 'ADO',
      summary,
      sync_run_id: syncRunId,
      synced_at: new Date().toISOString(),
    };

    const { data: insertedSnapshot, error: snapshotError } = await supabase
      .from('ado_project_snapshots')
      .insert({
        project_id: projectId,
        source: 'ADO',
        summary: snapshotPayload,
      })
      .select('snapshot_id')
      .single();

    if (snapshotError) {
      throw new Error('Failed to persist ADO snapshot. Run migration for ado_project_snapshots first.');
    }

    const previousSummary = previousSnapshot?.summary?.summary || null;
    const changeSummary = buildSyncChangeSummary(previousSummary, summary);

    await supabase
      .from('ado_sync_changes')
      .insert({
        sync_run_id: syncRunId,
        project_id: projectId,
        previous_snapshot_id: previousSnapshot?.snapshot_id || null,
        current_snapshot_id: insertedSnapshot?.snapshot_id || null,
        change_summary: changeSummary,
      });

    if (syncRunId) {
      await supabase
        .from('ado_sync_runs')
        .update({
          status: 'SUCCESS',
          finished_at: new Date().toISOString(),
          duration_ms: durationMs,
          summary: summary,
        })
        .eq('sync_run_id', syncRunId);
    }

    if (actorUserId) {
      await supabase.from('admin_logs').insert({
        project_id: projectId,
        admin_id: actorUserId,
        config_change_type: 'ADO_SYNC',
        details: {
          source: 'ADO',
          durationMs,
          summary: {
            repositoryCount: summary.repositoryCount,
            totalTests: summary.tests.total,
            totalFeatures: summary.features.total,
            pipelineConfigured: summary.pipelineAnalysis?.configured || false,
            unitTestsDetected: summary.repositoryAnalysis?.unitTestsDetected || false,
            coverage: summary.coverageAnalysis?.percentage,
          },
        },
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'ADO sync completed successfully',
      data: {
        syncRunId,
        durationMs,
        metrics: {
          repositories: summary.repositoryCount,
          tests: summary.tests.total,
          functionalities: summary.features.total,
          priorities: summary.features.byPriority,
        },
        summary,
        changes: changeSummary,
      },
    });
  } catch (error) {
    if (syncRunId) {
      try {
        const supabase = getSupabaseClient();
        await supabase
          .from('ado_sync_runs')
          .update({
            status: 'FAILED',
            finished_at: new Date().toISOString(),
            duration_ms: Date.now() - startedAt,
            error_message: error.message,
          })
          .eq('sync_run_id', syncRunId);
      } catch (_ignore) {
        // ignore secondary write failure
      }
    }

    return res.status(500).json({
      status: 'error',
      message: error.message,
      statusCode: 500,
    });
  }
});

/**
 * GET /api/v1/admin/ado/sync/:projectId/latest
 * Returns latest ADO snapshot for one project
 */
router.get('/ado/sync/:projectId/latest', async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!validateProjectId(projectId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid project ID format',
        statusCode: 400,
      });
    }

    const supabase = getSupabaseClient();
    const { data: snapshot, error } = await supabase
      .from('ado_project_snapshots')
      .select('snapshot_id, source, summary, synced_at, created_at')
      .eq('project_id', projectId)
      .order('synced_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error('Failed to fetch latest ADO snapshot');
    }

    return res.status(200).json({
      status: 'success',
      data: snapshot || null,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
      statusCode: 500,
    });
  }
});

/**
 * GET /api/v1/admin/ado/sync/:projectId/history
 * Returns sync runs history for one project
 */
router.get('/ado/sync/:projectId/history', async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!validateProjectId(projectId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid project ID format',
        statusCode: 400,
      });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('ado_sync_runs')
      .select('sync_run_id, status, started_at, finished_at, duration_ms, summary, error_message')
      .eq('project_id', projectId)
      .order('started_at', { ascending: false })
      .limit(50);

    if (error) {
      throw new Error('Failed to fetch ADO sync history');
    }

    return res.status(200).json({
      status: 'success',
      data: data || [],
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
      statusCode: 500,
    });
  }
});

/**
 * GET /api/v1/admin/ado/sync/:projectId/changes
 * Returns per-sync change history for one project
 */
router.get('/ado/sync/:projectId/changes', async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!validateProjectId(projectId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid project ID format',
        statusCode: 400,
      });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('ado_sync_changes')
      .select('sync_change_id, sync_run_id, previous_snapshot_id, current_snapshot_id, change_summary, created_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      throw new Error('Failed to fetch ADO sync changes history');
    }

    return res.status(200).json({
      status: 'success',
      data: data || [],
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
      statusCode: 500,
    });
  }
});

// POST /api/v1/admin/import - Import data from JSON file
router.post('/import', async (req, res) => {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(500).json({
        status: 'error',
        message: 'Supabase configuration missing',
        statusCode: 500
      });
    }

    const { filename = 'seed-data.json' } = req.body;
    const filePath = path.join(__dirname, '../../', filename);

    // Security: Prevent path traversal
    if (!filePath.includes('Integrity')) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid file path',
        statusCode: 400
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(400).json({
        status: 'error',
        message: `File not found: ${filename}`,
        statusCode: 400
      });
    }

    // Load and parse JSON
    const rawData = fs.readFileSync(filePath, 'utf8');
    const seedData = JSON.parse(rawData);

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    console.log('🧹 Clearing existing data...');
    try {
      await supabase.from('risk_assessments').delete().neq('risk_id', 'xxx');
      await supabase.from('test_executions').delete().neq('execution_id', 'xxx');
      await supabase.from('heat_maps').delete().neq('heat_map_id', 'xxx');
      await supabase.from('project_members').delete().neq('member_id', 'xxx');
      await supabase.from('users').delete().neq('user_id', 'xxx');
      await supabase.from('projects').delete().neq('project_id', 'xxx');
    } catch (err) {
      console.log('⚠️  Could not clear data (may be protected by RLS)');
    }

    // 1. Import Users
    console.log('👥 Importing Users...');
    const usersToInsert = seedData.users.map(user => ({
      email: user.email,
      role: user.role,
      is_active: user.is_active !== false
    }));

    const { data: users, error: usersError } = await supabase
      .from('users')
      .insert(usersToInsert)
      .select();

    if (usersError) {
      throw new Error(`RLS Policy Error: ${usersError.message}. Please ensure SUPABASE_SERVICE_ROLE_KEY is configured in backend/.env.local or disable RLS on tables.`);
    }

    // Create mapping
    const userMap = {};
    users.forEach(u => {
      userMap[u.email] = u.user_id;
    });

    // 2. Import Projects
    console.log('📦 Importing Projects...');
    const projectsToInsert = seedData.projects.map(proj => ({
      name: proj.name,
      repository_url: proj.repository_url || null
    }));

    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .insert(projectsToInsert)
      .select();

    if (projectsError) throw projectsError;

    // Create mapping
    const projectMap = {};
    projects.forEach(p => {
      projectMap[p.name] = p.project_id;
    });

    // 3. Import Project Members
    console.log('👫 Importing Project Members...');
    const memberInserts = seedData.project_members
      .map(member => ({
        project_id: projectMap[member.project_name],
        user_id: userMap[member.user_email],
        role: member.role || 'Developer'
      }))
      .filter(m => m.project_id && m.user_id);

    if (memberInserts.length > 0) {
      const { error: memberError } = await supabase.from('project_members').insert(memberInserts);
      if (memberError) throw memberError;
    }

    // 4. Import Heat Maps
    console.log('🔥 Importing Heat Maps...');
    const heatmapInserts = seedData.heat_maps
      .map(heat => ({
        project_id: projectMap[heat.project_name],
        repository_branch_id: 'main',
        coverage_percentage: heat.coverage_percentage,
        risk_score: Math.round((100 - heat.coverage_percentage) / 10),
        coverage_by_module: {
          modules: [
            {
              name: heat.module_name || 'Unknown',
              coverage: heat.coverage_percentage,
              complexity: 3.0,
              riskScore: Math.round((100 - heat.coverage_percentage) / 10),
              defectRate: (100 - heat.coverage_percentage) / 1000
            }
          ]
        }
      }))
      .filter(h => h.project_id);

    if (heatmapInserts.length > 0) {
      const { error: heatError } = await supabase.from('heat_maps').insert(heatmapInserts);
      if (heatError) throw heatError;
    }

    // 5. Import Test Executions
    console.log('🧪 Importing Test Executions...');
    const now = new Date();
    const testInserts = seedData.test_executions
      .map((test, idx) => ({
        project_id: projectMap[test.project_name],
        test_suite_id: `suite-${idx}`,
        status: test.status === 'completed' ? 'PASSED' : 'PENDING',
        start_time: new Date(now.getTime() - (idx * 3600000)).toISOString(),
        end_time: new Date(now.getTime() - (idx * 3600000) + ((test.execution_time_seconds || 60) * 1000)).toISOString(),
        duration: test.execution_time_seconds || 60
      }))
      .filter(t => t.project_id);

    if (testInserts.length > 0) {
      const { error: testError } = await supabase.from('test_executions').insert(testInserts);
      if (testError) throw testError;
    }

    // 6. Import Risk Assessments
    console.log('⚠️  Importing Risk Assessments...');
    const riskInserts = seedData.risk_assessments
      .map((risk, idx) => ({
        project_id: projectMap[risk.project_name],
        change_id: `change-${idx}`,
        risk_score: risk.risk_score,
        predicted_escape_rate: Math.min(risk.risk_score / 10, 0.99),
        factors: {
          factors: [
            {
              name: 'Coverage Gap',
              weight: 0.4,
              score: risk.risk_score,
              description: risk.identified_risks ? risk.identified_risks[0] : 'Low coverage detected'
            }
          ],
          recommendation: risk.risk_score > 7 ? 'REVIEW' : 'APPROVE'
        }
      }))
      .filter(r => r.project_id);

    if (riskInserts.length > 0) {
      const { error: riskError } = await supabase.from('risk_assessments').insert(riskInserts);
      if (riskError) throw riskError;
    }

    return res.status(200).json({
      status: 'success',
      message: 'Data imported successfully',
      statusCode: 200,
      data: {
        users: users.length,
        projects: projects.length,
        project_members: memberInserts.length,
        heat_maps: heatmapInserts.length,
        test_executions: testInserts.length,
        risk_assessments: riskInserts.length
      }
    });

  } catch (error) {
    console.error('Import error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: error.message,
      statusCode: 500
    });
  }
});

export default router;
