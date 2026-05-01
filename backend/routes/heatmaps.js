import { Router } from 'express';
import { getSupabaseClient } from '../db/supabase.js';

const router = Router();

// GET heat map for project
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('heat_maps')
      .select('*')
      .eq('project_id', projectId)
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    res.json(data || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
