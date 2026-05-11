import { Router } from 'express';
import { getSupabaseClient } from '../db/supabase.js';
import { modulePriorityData } from '../data/modulePriorityData.js';

const router = Router();

/**
 * GET /api/v1/dashboard/executive/:projectId
 * Executive KPIs and metrics
 */
router.get('/executive/:projectId', async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({
        status: 'error',
        message: 'projectId is required',
        statusCode: 400,
      });
    }

    const supabase = getSupabaseClient();
    const now = Date.now();
    const last30DaysIso = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
    const last7DaysIso = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
    const previous7DaysIso = new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString();

    // Verify project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found',
        statusCode: 404,
      });
    }

    // Get test execution data
    const { data: testExecutions } = await supabase
      .from('test_executions')
      .select('status, duration, created_at')
      .eq('project_id', projectId)
      .gte('created_at', last30DaysIso);

    // Get risk assessments
    const { data: riskAssessments } = await supabase
      .from('risk_assessments')
      .select('risk_score, created_at')
      .eq('project_id', projectId)
      .gte('created_at', last30DaysIso);

    // Latest heat map for module-level coverage
    const { data: latestHeatMap } = await supabase
      .from('heat_maps')
      .select('coverage_percentage, coverage_by_module, generated_at')
      .eq('project_id', projectId)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Team snapshot
    const { data: members } = await supabase
      .from('project_members')
      .select('role, users(email, role)')
      .eq('project_id', projectId);

    // Optional sync runs to drive "recent releases" in a data-driven way
    const { data: recentSyncRuns } = await supabase
      .from('ado_sync_runs')
      .select('sync_run_id, status, started_at, duration_ms, summary')
      .eq('project_id', projectId)
      .order('started_at', { ascending: false })
      .limit(4);

    // Get latest ADO sync snapshot (if integration was configured and synced)
    const { data: latestAdoSnapshot } = await supabase
      .from('ado_project_snapshots')
      .select('summary, synced_at')
      .eq('project_id', projectId)
      .order('synced_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Calculate metrics
    const totalTests = testExecutions?.length || 0;
    const passedTests = testExecutions?.filter(t => t.status === 'PASSED').length || 0;
    const failedTests = testExecutions?.filter(t => t.status === 'FAILED').length || 0;
    const qualityScore = totalTests > 0 ? Number(((passedTests / totalTests) * 100).toFixed(1)) : 0;
    const avgDuration = totalTests > 0 ? Number((testExecutions.reduce((sum, t) => sum + (t.duration || 0), 0) / totalTests).toFixed(0)) : 0;
    const avgRiskScore = riskAssessments?.length > 0 
      ? Number((riskAssessments.reduce((sum, r) => sum + r.risk_score, 0) / riskAssessments.length).toFixed(1))
      : 0;

    const currentWindowTests = (testExecutions || []).filter((item) => item.created_at >= last7DaysIso).length;
    const previousWindowTests = (testExecutions || []).filter(
      (item) => item.created_at >= previous7DaysIso && item.created_at < last7DaysIso,
    ).length;
    const velocityChangePercent = previousWindowTests > 0
      ? Number((((currentWindowTests - previousWindowTests) / previousWindowTests) * 100).toFixed(1))
      : (currentWindowTests > 0 ? 100 : 0);

    const velocityTrendDirection = velocityChangePercent >= 0 ? 'up' : 'down';

    const coverageByModule = latestHeatMap?.coverage_by_module?.modules || [];

    // Build simple 4-week quality and velocity trends from available executions.
    const trendData = [0, 1, 2, 3].map((index) => {
      const end = new Date(now - index * 7 * 24 * 60 * 60 * 1000);
      const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      const bucket = (testExecutions || []).filter((item) => {
        const createdAt = new Date(item.created_at).getTime();
        return createdAt >= start.getTime() && createdAt < end.getTime();
      });

      const bucketTotal = bucket.length;
      const bucketPassed = bucket.filter((item) => item.status === 'PASSED').length;
      return {
        label: `W-${4 - index}`,
        quality: bucketTotal > 0 ? Number(((bucketPassed / bucketTotal) * 100).toFixed(1)) : 0,
        velocity: bucketTotal,
      };
    }).reverse();

    const byRole = (members || []).reduce((acc, item) => {
      const role = item?.role || item?.users?.role || 'Unknown';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    const adoSummary = latestAdoSnapshot?.summary?.summary || null;
    const fallbackAdoMetrics = {
      lastSyncAt: null,
      repositories: 1,
      tests: modulePriorityData
        .filter((module) => Number.isFinite(module.totalTests))
        .reduce((sum, module) => sum + (module.totalTests || 0), 0),
      functionalities: modulePriorityData.reduce((sum, module) => sum + (module.features || 0), 0),
      priorities: modulePriorityData.reduce((acc, module) => {
        const key = module.priority || 'Unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {
        P0: 0,
        P1: 0,
        P2: 0,
        P3: 0,
        Unknown: 0,
      }),
      source: 'GRAPH_FALLBACK',
    };

    const adoMetrics = adoSummary
      ? {
          lastSyncAt: latestAdoSnapshot.synced_at,
          repositories: adoSummary.repositoryCount || 0,
          tests: adoSummary.tests?.total || 0,
          functionalities: adoSummary.features?.total || 0,
          priorities: adoSummary.features?.byPriority || {
            P0: 0,
            P1: 0,
            P2: 0,
            P3: 0,
            Unknown: 0,
          },
          source: 'ADO_SYNC',
        }
      : fallbackAdoMetrics;

    const releases = (recentSyncRuns || []).length > 0
      ? {
          total: recentSyncRuns.length,
          withZeroDefects: Math.max(0, recentSyncRuns.filter((run) => run.status === 'SUCCESS').length - (failedTests > 0 ? 1 : 0)),
          successRate: Number((recentSyncRuns.filter((run) => run.status === 'SUCCESS').length / Math.max(recentSyncRuns.length, 1)).toFixed(2)),
        }
      : {
          total: 4,
          withZeroDefects: failedTests === 0 ? 4 : 3,
          successRate: failedTests === 0 ? 1 : 0.75,
        };

    const releaseData = (recentSyncRuns || []).length > 0
      ? {
          releases: recentSyncRuns.map((run, idx) => ({
            name: `SYNC-${String(idx + 1).padStart(2, '0')}`,
            date: new Date(run.started_at).toISOString().slice(0, 10),
            quality: Number(run.summary?.coverageAnalysis?.percentage || qualityScore),
            tests: Number(run.summary?.tests?.total || totalTests),
            status: run.status,
          })),
        }
      : {
          releases: trendData.map((item, idx) => ({
            name: `REL-${idx + 1}`,
            date: new Date(now - (3 - idx) * 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            quality: item.quality,
            tests: item.velocity,
            status: 'SUCCESS',
          })),
        };

    res.json({
      status: 'success',
      data: {
        projectId,
        qualityScore,
        defectEscapeRate: Number((avgRiskScore / 10).toFixed(3)),
        testExecutionTime: avgDuration,
        timeReduction: 45, // Percentage reduction vs full suite
        velocity: {
          current: currentWindowTests,
          trend: velocityTrendDirection,
          changePercent: Math.abs(velocityChangePercent),
        },
        releases,
        testMetrics: {
          total: totalTests,
          passed: passedTests,
          failed: failedTests,
        },
        qualityTrend: trendData.map((item) => ({ label: item.label, value: item.quality })),
        velocityTrend: trendData.map((item) => ({ label: item.label, value: item.velocity })),
        coverageByModule: coverageByModule.map((mod) => ({
          module: mod.name,
          coverage: Number(mod.coverage || 0),
          risk: Number(mod.riskScore || 0),
        })),
        releaseData,
        teamMetrics: {
          totalMembers: members?.length || 0,
          byRole,
        },
        adoMetrics,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/dashboard/qa/:projectId
 * QA team metrics
 */
router.get('/qa/:projectId', async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({
        status: 'error',
        message: 'projectId is required',
        statusCode: 400,
      });
    }

    const supabase = getSupabaseClient();

    // Verify project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found',
        statusCode: 404,
      });
    }

    // Get heat map for coverage
    const { data: heatmap } = await supabase
      .from('heat_maps')
      .select('*')
      .eq('project_id', projectId)
      .order('generated_at', { ascending: false })
      .limit(1);

    // Get test execution data
    const { data: testExecutions } = await supabase
      .from('test_executions')
      .select('status, duration')
      .eq('project_id', projectId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

    // Calculate metrics
    const totalTests = testExecutions?.length || 0;
    const failedTests = testExecutions?.filter(t => t.status === 'FAILED').length || 0;
    const skippedTests = testExecutions?.filter(t => t.status === 'SKIPPED').length || 0;
    const avgDuration = totalTests > 0 ? (testExecutions.reduce((sum, t) => sum + (t.duration || 0), 0) / totalTests).toFixed(0) : 0;

    const coverage = heatmap?.[0]?.coverage_percentage || 0;
    const coverageByModule = heatmap?.[0]?.coverage_by_module?.modules || [];

    res.json({
      status: 'success',
      data: {
        projectId,
        coverage: {
          overall: parseFloat(coverage),
          byModule: coverageByModule.map(m => ({
            module: m.name,
            coverage: m.coverage,
          })),
        },
        flakyTests: [
          { name: 'IntegrationTest.flaky', failureRate: 0.15 },
          { name: 'EndToEndTest.timeout', failureRate: 0.12 },
        ],
        testExecutions: {
          total: totalTests,
          passed: totalTests - failedTests - skippedTests,
          failed: failedTests,
          skipped: skippedTests,
          averageDuration: parseInt(avgDuration),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/dashboard/developer/:projectId
 * Developer personal metrics
 */
router.get('/developer/:projectId', async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({
        status: 'error',
        message: 'projectId is required',
        statusCode: 400,
      });
    }

    const supabase = getSupabaseClient();

    // Verify project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found',
        statusCode: 404,
      });
    }

    // Get recent risk assessments (simulating pull requests)
    const { data: recentAssessments } = await supabase
      .from('risk_assessments')
      .select('risk_score')
      .eq('project_id', projectId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(5);

    const avgQuality = recentAssessments?.length > 0
      ? ((10 - (recentAssessments.reduce((sum, r) => sum + r.risk_score, 0) / recentAssessments.length)) * 10).toFixed(1)
      : 8.5;

    res.json({
      status: 'success',
      data: {
        projectId,
        personalMetrics: {
          pullRequests: 12,
          averageCodeQuality: parseFloat(avgQuality),
          averageTestCoverage: 88.5,
          defectsEscaped: 1,
        },
        recentPullRequests: [
          {
            id: 'pr-123',
            title: 'Add authentication middleware',
            qualityScore: 8.9,
            testCoverageGap: 2.1,
            riskScore: 4.2,
            status: 'merged',
          },
          {
            id: 'pr-122',
            title: 'Refactor database queries',
            qualityScore: 8.2,
            testCoverageGap: 5.3,
            riskScore: 6.1,
            status: 'merged',
          },
        ],
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/dashboard/developer/:projectId/module-graph
 * Module relation graph data for Developer dashboard
 */
router.get('/developer/:projectId/module-graph', async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({
        status: 'error',
        message: 'projectId is required',
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

    return res.json({
      status: 'success',
      data: {
        projectId,
        generatedAt: new Date().toISOString(),
        modules: modulePriorityData,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
