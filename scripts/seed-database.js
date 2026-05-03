#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from backend
dotenv.config({ path: path.join(__dirname, '../backend/.env.local') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('\n🌱 INTEGRITY - Database Seed Script\n');
console.log('═'.repeat(60));

async function seedDatabase() {
  try {
    // 1. Insert Sample Users
    console.log('\n👥 Loading Users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .insert([
        {
          email: 'admin@integrity.dev',
          name: 'Admin User',
          role: 'admin',
        },
        {
          email: 'qa@integrity.dev',
          name: 'QA Lead',
          role: 'qa',
        },
        {
          email: 'dev@integrity.dev',
          name: 'Developer',
          role: 'developer',
        },
        {
          email: 'exec@integrity.dev',
          name: 'Executive',
          role: 'executive',
        },
      ])
      .select();

    if (usersError) throw usersError;
    console.log(`   ✓ Inserted ${users.length} users`);

    // Get user IDs for linking
    const adminId = users[0]?.id;
    const qaId = users[1]?.id;
    const devId = users[2]?.id;
    const execId = users[3]?.id;

    // 2. Insert Sample Projects
    console.log('\n📦 Loading Projects...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .insert([
        {
          name: 'E-Commerce Platform',
          description: 'Main e-commerce application',
          repo: 'https://github.com/integrity/ecommerce',
          created_by: adminId,
        },
        {
          name: 'Payment Gateway',
          description: 'Payment processing service',
          repo: 'https://github.com/integrity/payments',
          created_by: adminId,
        },
        {
          name: 'Analytics Dashboard',
          description: 'Data analytics and reporting',
          repo: 'https://github.com/integrity/analytics',
          created_by: adminId,
        },
      ])
      .select();

    if (projectsError) throw projectsError;
    console.log(`   ✓ Inserted ${projects.length} projects`);

    const projectIds = projects.map(p => p.id);

    // 3. Insert Project Members
    console.log('\n👫 Loading Project Members...');
    const { data: members, error: membersError } = await supabase
      .from('project_members')
      .insert([
        {
          project_id: projectIds[0],
          user_id: qaId,
          role: 'qa_lead',
        },
        {
          project_id: projectIds[0],
          user_id: devId,
          role: 'developer',
        },
        {
          project_id: projectIds[1],
          user_id: qaId,
          role: 'qa_lead',
        },
        {
          project_id: projectIds[2],
          user_id: execId,
          role: 'manager',
        },
      ])
      .select();

    if (membersError) throw membersError;
    console.log(`   ✓ Inserted ${members.length} project members`);

    // 4. Insert Heat Maps
    console.log('\n🔥 Loading Heat Maps...');
    const { data: heatmaps, error: heatmapsError } = await supabase
      .from('heat_maps')
      .insert([
        {
          project_id: projectIds[0],
          module_name: 'Authentication',
          coverage_percentage: 92,
          risk_level: 'low',
        },
        {
          project_id: projectIds[0],
          module_name: 'Payment Processing',
          coverage_percentage: 88,
          risk_level: 'medium',
        },
        {
          project_id: projectIds[0],
          module_name: 'Inventory Management',
          coverage_percentage: 76,
          risk_level: 'high',
        },
        {
          project_id: projectIds[1],
          module_name: 'Transaction Engine',
          coverage_percentage: 95,
          risk_level: 'low',
        },
      ])
      .select();

    if (heatmapsError) throw heatmapsError;
    console.log(`   ✓ Inserted ${heatmaps.length} heat maps`);

    // 5. Insert Test Executions
    console.log('\n🧪 Loading Test Executions...');
    const { data: tests, error: testsError } = await supabase
      .from('test_executions')
      .insert([
        {
          project_id: projectIds[0],
          total_tests: 450,
          passed_tests: 425,
          failed_tests: 15,
          skipped_tests: 10,
          coverage_percentage: 87.5,
          execution_time_seconds: 145,
          status: 'completed',
        },
        {
          project_id: projectIds[1],
          total_tests: 320,
          passed_tests: 318,
          failed_tests: 2,
          skipped_tests: 0,
          coverage_percentage: 94.2,
          execution_time_seconds: 98,
          status: 'completed',
        },
      ])
      .select();

    if (testsError) throw testsError;
    console.log(`   ✓ Inserted ${tests.length} test executions`);

    // 6. Insert Risk Assessments
    console.log('\n⚠️  Loading Risk Assessments...');
    const { data: risks, error: risksError } = await supabase
      .from('risk_assessments')
      .insert([
        {
          project_id: projectIds[0],
          risk_score: 6.5,
          risk_level: 'medium',
          identified_risks: ['Low test coverage in Inventory', 'Flaky payment tests'],
          recommendations: ['Increase test automation', 'Focus on integration tests'],
        },
        {
          project_id: projectIds[1],
          risk_score: 2.3,
          risk_level: 'low',
          identified_risks: ['None'],
          recommendations: ['Maintain current testing strategy'],
        },
      ])
      .select();

    if (risksError) throw risksError;
    console.log(`   ✓ Inserted ${risks.length} risk assessments`);

    // Summary
    console.log('\n✅ SEEDING COMPLETE\n');
    console.log('═'.repeat(60));
    console.log('\n📊 Data Loaded:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Projects: ${projects.length}`);
    console.log(`   Project Members: ${members.length}`);
    console.log(`   Heat Maps: ${heatmaps.length}`);
    console.log(`   Test Executions: ${tests.length}`);
    console.log(`   Risk Assessments: ${risks.length}`);

    console.log('\n🚀 Ready to Test!');
    console.log('   1. Start dev server: npm run dev');
    console.log('   2. Open http://localhost:5175');
    console.log('   3. Use sample data to navigate dashboards\n');

  } catch (error) {
    console.error('\n❌ Seeding Failed:');
    console.error(`   Error: ${error.message}`);
    
    if (error.message.includes('duplicate')) {
      console.error('\n💡 Tip: Data already exists.');
      console.error('   To reset: Delete records in Supabase dashboard.\n');
    }
    
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
