import { Router } from 'express';

const router = Router();

// GET executive dashboard
router.get('/executive/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    res.json({
      projectId,
      qualityScore: 82,
      escapeRate: 0.08,
      costSavings: 45000,
      velocity: 120,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET QA dashboard
router.get('/qa/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    res.json({
      projectId,
      coverage: 85,
      flakyTests: 3,
      coverageGaps: 42,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
