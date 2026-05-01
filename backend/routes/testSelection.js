import { Router } from 'express';
import { getSupabaseClient } from '../db/supabase.js';

const router = Router();

/**
 * POST /api/v1/test-selection/recommend
 * Get intelligent test recommendations based on code changes
 */
router.post('/recommend', async (req, res, next) => {
  try {
    const { projectId, changedFiles = [], riskTolerance = 'BALANCED' } = req.body;

    if (!projectId) {
      return res.status(400).json({
        status: 'error',
        message: 'projectId is required',
        statusCode: 400,
      });
    }

    if (!Array.isArray(changedFiles)) {
      return res.status(400).json({
        status: 'error',
        message: 'changedFiles must be an array',
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

    // Simulate test selection algorithm based on risk tolerance
    const riskMultiplier = {
      AGGRESSIVE: 0.7, // Select 70% of tests
      BALANCED: 0.85,  // Select 85% of tests
      CONSERVATIVE: 1.0, // Select 100% of tests
    }[riskTolerance] || 0.85;

    // Generate simulated test recommendations
    const selectedTests = [
      {
        id: 'test-1',
        name: 'AuthService.login',
        file: 'src/services/auth.test.ts',
        estimatedDuration: 150,
        priority: 1,
        coverageRatio: 0.95,
      },
      {
        id: 'test-2',
        name: 'AuthService.logout',
        file: 'src/services/auth.test.ts',
        estimatedDuration: 80,
        priority: 2,
        coverageRatio: 0.88,
      },
      {
        id: 'test-3',
        name: 'AuthService.verify',
        file: 'src/services/auth.test.ts',
        estimatedDuration: 120,
        priority: 1,
        coverageRatio: 0.92,
      },
    ].filter((_, i) => i < Math.ceil(3 * riskMultiplier));

    const totalEstimatedTime = selectedTests.reduce((sum, t) => sum + t.estimatedDuration, 0);
    const expectedCoverage = (
      selectedTests.reduce((sum, t) => sum + t.coverageRatio, 0) / selectedTests.length
    ).toFixed(2);

    res.json({
      status: 'success',
      data: {
        selectedTests,
        totalEstimatedTime,
        expectedCoverage: parseFloat(expectedCoverage),
        riskTolerance,
        recommendation: selectedTests.length > 0 ? 'RUN' : 'SKIP',
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
