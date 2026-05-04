/**
 * Seed script para generar datos dummy diferenciados por proyecto
 * Esto populará: test_executions, risk_assessments, heat_maps
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory of current file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.local');

dotenv.config({ path: envPath });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PROJECTS = {
  payflow: '650e8400-e29b-41d4-a716-446655440000',
  banking: 'a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6',
  gateway: 'f1e2d3c4-b5a6-4978-8765-4321fedcba98',
  integrity: 'c4d5e6f7-a8b9-4c0d-1e2f-3a4b5c6d7e8f',
};

const PROJECT_DATA = {
  payflow: {
    name: 'PayFlow Platform',
    description: 'Payment processing platform',
    stats: { avgQuality: 95, tests: 450, failedTests: 8, coverage: 92 },
    modules: ['Auth', 'Payment', 'Reporting', 'Admin'],
  },
  banking: {
    name: 'Mobile Banking App',
    description: 'Mobile banking application',
    stats: { avgQuality: 88, tests: 380, failedTests: 15, coverage: 85 },
    modules: ['Transactions', 'Accounts', 'Security', 'UI'],
  },
  gateway: {
    name: 'Payment Gateway',
    description: 'Payment gateway API',
    stats: { avgQuality: 92, tests: 420, failedTests: 10, coverage: 90 },
    modules: ['API', 'Webhooks', 'Encryption', 'Logging'],
  },
  integrity: {
    name: 'INTEGRITY Demo',
    description: 'Demo platform',
    stats: { avgQuality: 90, tests: 350, failedTests: 12, coverage: 88 },
    modules: ['Dashboard', 'Reports', 'Settings', 'Help'],
  },
};

async function seedData() {
  console.log('🌱 Starting data seeding...');

  for (const [key, projectId] of Object.entries(PROJECTS)) {
    const projectData = PROJECT_DATA[key];
    console.log(`\n📊 Seeding ${projectData.name}...`);

    try {
      // Delete existing data for this project
      await supabase.from('test_executions').delete().eq('project_id', projectId);
      await supabase.from('risk_assessments').delete().eq('project_id', projectId);
      await supabase.from('heat_maps').delete().eq('project_id', projectId);

      // Generate test executions
      const testStatuses = ['PASSED', 'FAILED', 'SKIPPED'];
      const testExecutions = [];

      for (let i = 0; i < projectData.stats.tests; i++) {
        const status =
          i < projectData.stats.tests - projectData.stats.failedTests
            ? 'PASSED'
            : testStatuses[Math.floor(Math.random() * testStatuses.length)];

        testExecutions.push({
          project_id: projectId,
          test_name: `${projectData.modules[i % projectData.modules.length]}/test_${i + 1}`,
          status,
          duration: Math.floor(Math.random() * 5000) + 500,
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      const { data: testData, error: testError } = await supabase
        .from('test_executions')
        .insert(testExecutions);

      if (testError) throw testError;
      console.log(`  ✓ ${testExecutions.length} test executions created`);

      // Generate risk assessments
      const riskAssessments = [];
      for (let i = 0; i < Math.ceil(projectData.stats.tests / 10); i++) {
        riskAssessments.push({
          project_id: projectId,
          module: projectData.modules[i % projectData.modules.length],
          risk_score: Math.floor(Math.random() * 100),
          risk_level: Math.random() > 0.7 ? 'HIGH' : Math.random() > 0.4 ? 'MEDIUM' : 'LOW',
          recommendation: `Review and test ${projectData.modules[i % projectData.modules.length]} module`,
          created_at: new Date().toISOString(),
        });
      }

      const { error: riskError } = await supabase
        .from('risk_assessments')
        .insert(riskAssessments);

      if (riskError) throw riskError;
      console.log(`  ✓ ${riskAssessments.length} risk assessments created`);

      // Generate heat map
      const heatMapData = {
        project_id: projectId,
        coverage_percentage: projectData.stats.coverage,
        coverage_by_module: {
          modules: projectData.modules.map((mod) => ({
            name: mod,
            coverage: projectData.stats.coverage + Math.floor(Math.random() * 10) - 5,
          })),
        },
        generated_at: new Date().toISOString(),
      };

      const { error: heatError } = await supabase.from('heat_maps').insert(heatMapData);

      if (heatError) throw heatError;
      console.log(`  ✓ Heat map created (${projectData.stats.coverage}% coverage)`);
    } catch (err) {
      console.error(`  ✗ Error seeding ${projectData.name}:`, err.message);
    }
  }

  console.log('\n✅ Seeding complete!');
}

seedData().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
