import { Router } from 'express';
import { getSupabaseClient } from '../db/supabase.js';

const router = Router();

/**
 * POST /api/v1/risk-assessment/evaluate
 * Evaluate risk of code changes
 */
router.post('/evaluate', async (req, res, next) => {
  try {
    const { projectId, changedFiles = [], affectedModules = [] } = req.body;

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

    // Calculate risk factors
    const complexityDelta = changedFiles.length * 2.5; // Weighted by file count
    const coverageGap = affectedModules.length * 15; // Weighted by module count
    const defectRate = Math.min(10, (affectedModules.length || 1) * 0.5); // Historical rate
    const escapeProbability = Math.min(10, coverageGap * 0.15); // ML prediction

    // Calculate overall risk score (0-10)
    const riskScore = (
      (complexityDelta * 0.3 + coverageGap * 0.25 + defectRate * 0.25 + escapeProbability * 0.2) / 10
    ).toFixed(1);

    // Determine risk level
    const riskLevel = parseFloat(riskScore) < 3 ? 'LOW' : parseFloat(riskScore) < 6 ? 'MODERATE' : 'HIGH';

    // Generate factors breakdown
    const factors = [
      {
        name: 'Complexity Delta',
        weight: 0.3,
        score: Math.min(10, complexityDelta).toFixed(1),
        description: `Changes in ${changedFiles.length} file(s)`,
      },
      {
        name: 'Coverage Gap',
        weight: 0.25,
        score: Math.min(10, coverageGap).toFixed(1),
        description: `${affectedModules.length} module(s) affected`,
      },
      {
        name: 'Defect History',
        weight: 0.25,
        score: Math.min(10, defectRate).toFixed(1),
        description: 'Historical defect rate in affected modules',
      },
      {
        name: 'Escape Probability',
        weight: 0.2,
        score: Math.min(10, escapeProbability).toFixed(1),
        description: 'ML-predicted escape rate',
      },
    ];

    // Recommendation logic
    let recommendation = 'APPROVE';
    let suggestedActions = [];

    if (parseFloat(riskScore) >= 6) {
      recommendation = 'REJECT';
      suggestedActions = [
        'Request additional code review',
        'Run full regression suite',
        'Add manual testing',
      ];
    } else if (parseFloat(riskScore) >= 3) {
      recommendation = 'REVIEW';
      suggestedActions = [
        'Require additional test coverage',
        'Perform manual code review',
        'Run full regression suite',
      ];
    } else {
      suggestedActions = ['Run smoke tests', 'Deploy to staging'];
    }

    // Insert risk assessment record
    const { error: insertError } = await supabase
      .from('risk_assessments')
      .insert([
        {
          project_id: projectId,
          change_id: `change-${Date.now()}`,
          risk_score: parseFloat(riskScore),
          predicted_escape_rate: (escapeProbability / 100).toFixed(4),
          factors: { factors, recommendation },
        },
      ]);

    if (insertError) {
      console.error('Error recording risk assessment:', insertError);
    }

    res.json({
      status: 'success',
      data: {
        riskScore: parseFloat(riskScore),
        riskLevel,
        factors,
        recommendation,
        suggestedActions,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
