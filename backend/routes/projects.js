import { Router } from 'express';
import { getSupabaseClient } from '../db/supabase.js';

const router = Router();

/**
 * GET /api/v1/projects
 * List all projects accessible to user
 */
router.get('/', async (req, res, next) => {
  try {
    const supabase = getSupabaseClient();

    // Get all projects (in production, filter by user access)
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch projects');
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
 * GET /api/v1/projects/:projectId
 * Get detailed project information
 */
router.get('/:projectId', async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!projectId || projectId.length !== 36) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid project ID format',
        statusCode: 400,
      });
    }

    const supabase = getSupabaseClient();

    // Get project with members
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

    // Get project members
    const { data: members, error: membersError } = await supabase
      .from('project_members')
      .select('*, users(email, role)')
      .eq('project_id', projectId);

    if (membersError) {
      console.error('Error fetching members:', membersError);
    }

    res.json({
      status: 'success',
      data: {
        ...project,
        members: members || [],
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/projects
 * Create a new project (Admin only)
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, description, repository_url } = req.body;

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Project name is required',
        statusCode: 400,
      });
    }

    if (name.length > 255) {
      return res.status(400).json({
        status: 'error',
        message: 'Project name must be 255 characters or less',
        statusCode: 400,
      });
    }

    const supabase = getSupabaseClient();

    // Create project
    const { data: project, error: createError } = await supabase
      .from('projects')
      .insert([
        {
          name: name.trim(),
          repository_url: repository_url || null,
        },
      ])
      .select();

    if (createError) {
      console.error('Error creating project:', createError);
      throw new Error('Failed to create project');
    }

    res.status(201).json({
      status: 'success',
      message: 'Project created successfully',
      data: project[0],
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/projects/:projectId
 * Update project (Admin only)
 */
router.put('/:projectId', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { name, description, repository_url } = req.body;

    if (!projectId || projectId.length !== 36) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid project ID format',
        statusCode: 400,
      });
    }

    const supabase = getSupabaseClient();

    // Verify project exists
    const { data: existing, error: checkError } = await supabase
      .from('projects')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (checkError || !existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found',
        statusCode: 404,
      });
    }

    // Update project
    const { data: updated, error: updateError } = await supabase
      .from('projects')
      .update({
        name: name || existing.name,
        repository_url: repository_url !== undefined ? repository_url : existing.repository_url,
      })
      .eq('project_id', projectId)
      .select();

    if (updateError) {
      console.error('Error updating project:', updateError);
      throw new Error('Failed to update project');
    }

    res.json({
      status: 'success',
      message: 'Project updated successfully',
      data: updated[0],
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/projects/:projectId
 * Delete a project (Admin only)
 */
router.delete('/:projectId', async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!projectId || projectId.length !== 36) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid project ID format',
        statusCode: 400,
      });
    }

    const supabase = getSupabaseClient();

    // Verify project exists
    const { data: existing, error: checkError } = await supabase
      .from('projects')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (checkError || !existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found',
        statusCode: 404,
      });
    }

    // Delete project (CASCADE will delete related records)
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('project_id', projectId);

    if (deleteError) {
      console.error('Error deleting project:', deleteError);
      throw new Error('Failed to delete project');
    }

    res.json({
      status: 'success',
      message: 'Project deleted successfully',
      data: { project_id: projectId },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/projects/:projectId/members
 * Get project members
 */
router.get('/:projectId/members', async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!projectId || projectId.length !== 36) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid project ID format',
        statusCode: 400,
      });
    }

    const supabase = getSupabaseClient();

    // Verify project exists
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

    // Get project members
    const { data: members, error: membersError } = await supabase
      .from('project_members')
      .select('id, project_id, user_id, role, created_at, email')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (membersError) {
      console.error('Error fetching members:', membersError);
      throw new Error('Failed to fetch project members');
    }

    res.json({
      status: 'success',
      data: (members || []).map(m => ({
        project_member_id: m.id,
        email: m.email,
        role: m.role,
        created_at: m.created_at,
      })),
      count: (members || []).length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/projects/:projectId/members
 * Add a member to project
 */
router.post('/:projectId/members', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { email, role = 'viewer' } = req.body;

    if (!projectId || projectId.length !== 36) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid project ID format',
        statusCode: 400,
      });
    }

    if (!email || email.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required',
        statusCode: 400,
      });
    }

    if (!['viewer', 'editor', 'admin'].includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role. Must be viewer, editor, or admin',
        statusCode: 400,
      });
    }

    const supabase = getSupabaseClient();

    // Verify project exists
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

    // Check if member already exists
    const { data: existing, error: existError } = await supabase
      .from('project_members')
      .select('id')
      .eq('project_id', projectId)
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return res.status(409).json({
        status: 'error',
        message: 'Member already exists in this project',
        statusCode: 409,
      });
    }

    // Add member to project
    const { data: member, error: createError } = await supabase
      .from('project_members')
      .insert([
        {
          project_id: projectId,
          email: email.toLowerCase(),
          role,
        },
      ])
      .select();

    if (createError) {
      console.error('Error adding member:', createError);
      throw new Error('Failed to add member to project');
    }

    res.status(201).json({
      status: 'success',
      message: 'Member added successfully',
      data: {
        project_member_id: member[0].id,
        email: member[0].email,
        role: member[0].role,
        created_at: member[0].created_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/projects/:projectId/members/:memberId
 * Remove a member from project
 */
router.delete('/:projectId/members/:memberId', async (req, res, next) => {
  try {
    const { projectId, memberId } = req.params;

    if (!projectId || projectId.length !== 36) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid project ID format',
        statusCode: 400,
      });
    }

    if (!memberId) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid member ID',
        statusCode: 400,
      });
    }

    const supabase = getSupabaseClient();

    // Verify project exists
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

    // Verify member exists and belongs to project
    const { data: member, error: memberError } = await supabase
      .from('project_members')
      .select('id')
      .eq('id', parseInt(memberId))
      .eq('project_id', projectId)
      .single();

    if (memberError || !member) {
      return res.status(404).json({
        status: 'error',
        message: 'Member not found in this project',
        statusCode: 404,
      });
    }

    // Delete member from project
    const { error: deleteError } = await supabase
      .from('project_members')
      .delete()
      .eq('id', parseInt(memberId));

    if (deleteError) {
      console.error('Error removing member:', deleteError);
      throw new Error('Failed to remove member from project');
    }

    res.json({
      status: 'success',
      message: 'Member removed successfully',
      data: { project_member_id: memberId },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
