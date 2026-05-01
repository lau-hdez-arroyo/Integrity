import { Router } from 'express';
import { getSupabaseClient } from '../db/supabase.js';

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
      .select('status, duration')
      .eq('project_id', projectId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    // Get risk assessments
    const { data: riskAssessments } = await supabase
      .from('risk_assessments')
      .select('risk_score')
      .eq('project_id', projectId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    // Calculate metrics
    const totalTests = testExecutions?.length || 0;
    const passedTests = testExecutions?.filter(t => t.status === 'PASSED').length || 0;
    const qualityScore = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
    const avgDuration = totalTests > 0 ? (testExecutions.reduce((sum, t) => sum + (t.duration || 0), 0) / totalTests).toFixed(0) : 0;
    const avgRiskScore = riskAssessments?.length > 0 
      ? (riskAssessments.reduce((sum, r) => sum + r.risk_score, 0) / riskAssessments.length).toFixed(1) 
      : 0;

    res.json({
      status: 'success',
      data: {
        projectId,
        qualityScore: parseFloat(qualityScore),
        defectEscapeRate: (parseFloat(avgRiskScore) / 100).toFixed(3),
        testExecutionTime: parseInt(avgDuration),
        timeReduction: 45, // Percentage reduction vs full suite
        velocity: {
          current: 42,
          trend: 'up',
          changePercent: 15,
        },
        releases: {
          total: 24,
          withZeroDefects: 18,
          successRate: 0.75,
        },
        testMetrics: {
          total: totalTests,
          passed: passedTests,
          failed: totalTests - passedTests,
        },
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

export default router;
