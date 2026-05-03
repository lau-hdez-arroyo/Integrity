#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../backend/.env.local') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('\n📦 INTEGRITY - Data Import from JSON\n');
console.log('═'.repeat(70));

// Parse command line arguments
const args = process.argv.slice(2);
const fileArg = args.find(arg => arg.startsWith('--file='));
const filePath = fileArg ? fileArg.split('=')[1] : 'seed-data.json';

const fullPath = path.join(__dirname, '../', filePath);

console.log(`\n📂 Loading data from: ${filePath}`);

// Validate file exists
if (!fs.existsSync(fullPath)) {
  console.error(`\n❌ Error: File not found: ${fullPath}`);
  console.error('\nUsage: npm run import-data -- --file=path/to/file.json');
  console.error('\nExample: npm run import-data -- --file=seed-data.json\n');
  process.exit(1);
}

// Load and parse JSON
let seedData;
try {
  const rawData = fs.readFileSync(fullPath, 'utf8');
  seedData = JSON.parse(rawData);
  console.log('✓ JSON loaded successfully');
} catch (error) {
  console.error(`\n❌ Error parsing JSON: ${error.message}\n`);
  process.exit(1);
}

// Validation function
function validateData(data) {
  const errors = [];

  // Check required arrays
  const requiredArrays = ['users', 'projects', 'project_members', 'heat_maps', 'test_executions', 'risk_assessments'];
  for (const arr of requiredArrays) {
    if (!data[arr] || !Array.isArray(data[arr])) {
      errors.push(`Missing or invalid array: ${arr}`);
    }
  }

  // Validate users
  if (data.users) {
    data.users.forEach((user, idx) => {
      if (!user.email || !user.role) {
        errors.push(`User ${idx}: Missing required fields (email, role)`);
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
        errors.push(`User ${idx}: Invalid email format: ${user.email}`);
      }
      const validRoles = ['Admin', 'PM', 'Developer', 'QA', 'Executive'];
      if (!validRoles.includes(user.role)) {
        errors.push(`User ${idx}: Invalid role: ${user.role}. Must be one of: ${validRoles.join(', ')}`);
      }
    });
  }

  // Validate projects
  if (data.projects) {
    data.projects.forEach((proj, idx) => {
      if (!proj.name) {
        errors.push(`Project ${idx}: Missing required field 'name'`);
      }
    });
  }

  // Validate coverage percentages in heat maps
  if (data.heat_maps) {
    data.heat_maps.forEach((heat, idx) => {
      if (typeof heat.coverage_percentage !== 'number' || heat.coverage_percentage < 0 || heat.coverage_percentage > 100) {
        errors.push(`Heat map ${idx}: Invalid coverage percentage: ${heat.coverage_percentage}`);
      }
    });
  }

  // Validate risk scores in risk assessments
  if (data.risk_assessments) {
    data.risk_assessments.forEach((risk, idx) => {
      if (typeof risk.risk_score !== 'number' || risk.risk_score < 0 || risk.risk_score > 10) {
        errors.push(`Risk assessment ${idx}: Invalid risk score: ${risk.risk_score}`);
      }
    });
  }

  return errors;
}

// Import function
async function importData() {
  try {
    // Validate data structure
    const validationErrors = validateData(seedData);
    if (validationErrors.length > 0) {
      console.error('\n❌ Validation errors found:\n');
      validationErrors.forEach(err => console.error(`   • ${err}`));
      console.error();
      process.exit(1);
    }

    console.log('✓ Data validation passed');

    // 1. Import Users
    console.log('\n👥 Importing Users...');
    const usersToInsert = seedData.users.map(user => ({
      email: user.email,
      role: user.role,
      is_active: user.is_active !== false
    }));

    const { data: users, error: usersError } = await supabase
      .from('users')
      .insert(usersToInsert)
      .select();

    if (usersError) throw usersError;
    console.log(`   ✓ Imported ${users.length} users`);

    // Create email to ID mapping
    const userMap = {};
    users.forEach(user => {
      userMap[user.email] = user.user_id;
    });

    // 2. Import Projects
    console.log('\n📦 Importing Projects...');
    const projectsToInsert = seedData.projects.map(proj => ({
      name: proj.name,
      repository_url: proj.repository_url || null
    }));

    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .insert(projectsToInsert)
      .select();

    if (projectsError) throw projectsError;
    console.log(`   ✓ Imported ${projects.length} projects`);

    // Create project name to ID mapping
    const projectMap = {};
    projects.forEach(proj => {
      projectMap[proj.name] = proj.project_id;
    });

    // 3. Import Project Members
    console.log('\n👫 Importing Project Members...');
    const membersToInsert = seedData.project_members
      .map(member => ({
        project_id: projectMap[member.project_name],
        user_id: userMap[member.user_email],
        role: member.role || 'Developer'
      }))
      .filter(member => member.project_id && member.user_id);

    if (membersToInsert.length > 0) {
      const { error: membersError } = await supabase
        .from('project_members')
        .insert(membersToInsert);

      if (membersError) throw membersError;
      console.log(`   ✓ Imported ${membersToInsert.length} project members`);
    }

    // 4. Import Heat Maps
    console.log('\n🔥 Importing Heat Maps...');
    const heatmapsToInsert = seedData.heat_maps
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
      .filter(heat => heat.project_id);

    if (heatmapsToInsert.length > 0) {
      const { error: heatmapsError } = await supabase
        .from('heat_maps')
        .insert(heatmapsToInsert);

      if (heatmapsError) throw heatmapsError;
      console.log(`   ✓ Imported ${heatmapsToInsert.length} heat maps`);
    }

    // 5. Import Test Executions
    console.log('\n🧪 Importing Test Executions...');
    const now = new Date();
    const testsToInsert = seedData.test_executions
      .map((test, idx) => ({
        project_id: projectMap[test.project_name],
        test_suite_id: `suite-${idx}`,
        status: test.status === 'completed' ? 'PASSED' : 'PENDING',
        start_time: new Date(now.getTime() - (idx * 3600000)),
        end_time: new Date(now.getTime() - (idx * 3600000) + (test.execution_time_seconds * 1000 || 60000)),
        duration: test.execution_time_seconds || 60
      }))
      .filter(test => test.project_id);

    if (testsToInsert.length > 0) {
      const { error: testsError } = await supabase
        .from('test_executions')
        .insert(testsToInsert);

      if (testsError) throw testsError;
      console.log(`   ✓ Imported ${testsToInsert.length} test executions`);
    }

    // 6. Import Risk Assessments
    console.log('\n⚠️  Importing Risk Assessments...');
    const risksToInsert = seedData.risk_assessments
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
      .filter(risk => risk.project_id);

    if (risksToInsert.length > 0) {
      const { error: risksError } = await supabase
        .from('risk_assessments')
        .insert(risksToInsert);

      if (risksError) throw risksError;
      console.log(`   ✓ Imported ${risksToInsert.length} risk assessments`);
    }

    // Summary
    console.log('\n✅ IMPORT COMPLETE\n');
    console.log('═'.repeat(70));
    console.log('\n📊 Summary:');
    console.log(`   Users:                ${users.length}`);
    console.log(`   Projects:             ${projects.length}`);
    console.log(`   Project Members:      ${membersToInsert.length}`);
    console.log(`   Heat Maps:            ${heatmapsToInsert.length}`);
    console.log(`   Test Executions:      ${testsToInsert.length}`);
    console.log(`   Risk Assessments:     ${risksToInsert.length}`);

    console.log('\n🚀 Data imported successfully!');
    console.log('   Open http://localhost:5175 to see the data in dashboards\n');

  } catch (error) {
    console.error('\n❌ Import Failed:');
    console.error(`   ${error.message}\n`);
    process.exit(1);
  }
}

// Run import
importData();
