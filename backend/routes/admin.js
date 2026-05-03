import express from 'express';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// POST /api/v1/admin/import - Import data from JSON file
router.post('/import', async (req, res) => {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(500).json({
        status: 'error',
        message: 'Supabase configuration missing',
        statusCode: 500
      });
    }

    const { filename = 'seed-data.json' } = req.body;
    const filePath = path.join(__dirname, '../../', filename);

    // Security: Prevent path traversal
    if (!filePath.includes('Integrity')) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid file path',
        statusCode: 400
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(400).json({
        status: 'error',
        message: `File not found: ${filename}`,
        statusCode: 400
      });
    }

    // Load and parse JSON
    const rawData = fs.readFileSync(filePath, 'utf8');
    const seedData = JSON.parse(rawData);

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    console.log('🧹 Clearing existing data...');
    try {
      await supabase.from('risk_assessments').delete().neq('risk_id', 'xxx');
      await supabase.from('test_executions').delete().neq('execution_id', 'xxx');
      await supabase.from('heat_maps').delete().neq('heat_map_id', 'xxx');
      await supabase.from('project_members').delete().neq('member_id', 'xxx');
      await supabase.from('users').delete().neq('user_id', 'xxx');
      await supabase.from('projects').delete().neq('project_id', 'xxx');
    } catch (err) {
      console.log('⚠️  Could not clear data (may be protected by RLS)');
    }

    // 1. Import Users
    console.log('👥 Importing Users...');
    const usersToInsert = seedData.users.map(user => ({
      email: user.email,
      role: user.role,
      is_active: user.is_active !== false
    }));

    const { data: users, error: usersError } = await supabase
      .from('users')
      .insert(usersToInsert)
      .select();

    if (usersError) {
      throw new Error(`RLS Policy Error: ${usersError.message}. Please ensure SUPABASE_SERVICE_ROLE_KEY is configured in backend/.env.local or disable RLS on tables.`);
    }

    // Create mapping
    const userMap = {};
    users.forEach(u => {
      userMap[u.email] = u.user_id;
    });

    // 2. Import Projects
    console.log('📦 Importing Projects...');
    const projectsToInsert = seedData.projects.map(proj => ({
      name: proj.name,
      repository_url: proj.repository_url || null
    }));

    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .insert(projectsToInsert)
      .select();

    if (projectsError) throw projectsError;

    // Create mapping
    const projectMap = {};
    projects.forEach(p => {
      projectMap[p.name] = p.project_id;
    });

    // 3. Import Project Members
    console.log('👫 Importing Project Members...');
    const memberInserts = seedData.project_members
      .map(member => ({
        project_id: projectMap[member.project_name],
        user_id: userMap[member.user_email],
        role: member.role || 'Developer'
      }))
      .filter(m => m.project_id && m.user_id);

    if (memberInserts.length > 0) {
      const { error: memberError } = await supabase.from('project_members').insert(memberInserts);
      if (memberError) throw memberError;
    }

    // 4. Import Heat Maps
    console.log('🔥 Importing Heat Maps...');
    const heatmapInserts = seedData.heat_maps
      .map(heat => ({
        project_id: projectMap[heat.project_name],
        repository_branch_id: 'main',
        coverage_percentage: heat.coverage_percentage,
        risk_score: Math.round((100 - heat.coverage_percentage) / 10),
        coverage_by_module: {
          modules: [
            {
              name: heat.module_name || 'Unknown',
              coverage: heat.coverage_percentage,
              complexity: 3.0,
              riskScore: Math.round((100 - heat.coverage_percentage) / 10),
              defectRate: (100 - heat.coverage_percentage) / 1000
            }
          ]
        }
      }))
      .filter(h => h.project_id);

    if (heatmapInserts.length > 0) {
      const { error: heatError } = await supabase.from('heat_maps').insert(heatmapInserts);
      if (heatError) throw heatError;
    }

    // 5. Import Test Executions
    console.log('🧪 Importing Test Executions...');
    const now = new Date();
    const testInserts = seedData.test_executions
      .map((test, idx) => ({
        project_id: projectMap[test.project_name],
        test_suite_id: `suite-${idx}`,
        status: test.status === 'completed' ? 'PASSED' : 'PENDING',
        start_time: new Date(now.getTime() - (idx * 3600000)).toISOString(),
        end_time: new Date(now.getTime() - (idx * 3600000) + ((test.execution_time_seconds || 60) * 1000)).toISOString(),
        duration: test.execution_time_seconds || 60
      }))
      .filter(t => t.project_id);

    if (testInserts.length > 0) {
      const { error: testError } = await supabase.from('test_executions').insert(testInserts);
      if (testError) throw testError;
    }

    // 6. Import Risk Assessments
    console.log('⚠️  Importing Risk Assessments...');
    const riskInserts = seedData.risk_assessments
      .map((risk, idx) => ({
        project_id: projectMap[risk.project_name],
        change_id: `change-${idx}`,
        risk_score: risk.risk_score,
        predicted_escape_rate: Math.min(risk.risk_score / 10, 0.99),
        factors: {
          factors: [
            {
              name: 'Coverage Gap',
              weight: 0.4,
              score: risk.risk_score,
              description: risk.identified_risks ? risk.identified_risks[0] : 'Low coverage detected'
            }
          ],
          recommendation: risk.risk_score > 7 ? 'REVIEW' : 'APPROVE'
        }
      }))
      .filter(r => r.project_id);

    if (riskInserts.length > 0) {
      const { error: riskError } = await supabase.from('risk_assessments').insert(riskInserts);
      if (riskError) throw riskError;
    }

    return res.status(200).json({
      status: 'success',
      message: 'Data imported successfully',
      statusCode: 200,
      data: {
        users: users.length,
        projects: projects.length,
        project_members: memberInserts.length,
        heat_maps: heatmapInserts.length,
        test_executions: testInserts.length,
        risk_assessments: riskInserts.length
      }
    });

  } catch (error) {
    console.error('Import error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: error.message,
      statusCode: 500
    });
  }
});

export default router;
