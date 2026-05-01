import { Router } from 'express';
import { getSupabaseClient } from '../db/supabase.js';

const router = Router();

// GET all projects
router.get('/', async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET project by ID
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create project
router.post('/', async (req, res) => {
  try {
    const { name, repository_url } = req.body;
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('projects')
      .insert([{ name, repository_url }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
