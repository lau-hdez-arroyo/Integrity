import { Router } from 'express';
import { getSupabaseClient } from '../db/supabase.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('projects')
      .select('count()', { count: 'exact' });

    if (error) throw error;

    res.json({
      status: 'Healthy',
      database: 'Connected',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  } catch (error) {
    res.status(503).json({
      status: 'Unhealthy',
      error: error.message,
    });
  }
});

export default router;
