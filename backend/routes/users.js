import { Router } from 'express';
import { getSupabaseClient } from '../db/supabase.js';

const router = Router();

/**
 * GET /api/v1/users/me/projects
 * Get projects for the authenticated user
 */
router.get('/me/projects', async (req, res, next) => {
  try {
    const supabase = getSupabaseClient();
    
    // Get user ID from request (should be set by auth middleware)
    const userId = req.user?.id || req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated',
        statusCode: 401,
      });
    }

    // First, try to get projects from project_members table
    const { data: memberData, error: memberError } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', userId);

    let projectIds = [];
    
    // If project_members is empty, return all projects (fallback for demo)
    if (memberError) {
      console.warn('project_members query error (falling back to all projects):', memberError);
      projectIds = null; // Will return all projects
    } else if (memberData && memberData.length > 0) {
      projectIds = memberData.map((m) => m.project_id);
    } else {
      // User has no explicit project assignments, return all projects as fallback for demo
      projectIds = null;
    }

    // Get projects
    let query = supabase.from('projects').select('*').order('created_at', { ascending: false });
    
    // Filter by projectIds if available
    if (projectIds && projectIds.length > 0) {
      query = query.in('project_id', projectIds);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch user projects');
    }

    res.json({
      status: 'success',
      data: data || [],
      count: (data || []).length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/users/me
 * Get current user info
 */
router.get('/me', async (req, res, next) => {
  try {
    const supabase = getSupabaseClient();
    
    const userId = req.user?.id || req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated',
        statusCode: 401,
      });
    }

    // Get user from Supabase auth
    const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError || !user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        statusCode: 404,
      });
    }

    res.json({
      status: 'success',
      data: {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || 'user',
        created_at: user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
