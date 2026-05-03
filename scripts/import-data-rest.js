#!/usr/bin/env node

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../backend/.env.local') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

console.log('\n📦 INTEGRITY - REST API Data Import\n');
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
  console.error('\nUsage: npm run import-dummy -- --file=path/to/file.json');
  console.error('\nExample: npm run import-dummy -- --file=seed-data.json\n');
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
    });
  }

  return errors;
}

// REST API helper function
async function restCall(method, table, data, filters = '') {
  let url = `${SUPABASE_URL}/rest/v1/${table}`;
  if (filters) url += filters;

  const options = {
    method,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
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

    // Clear existing data
    console.log('\n🧹 Clearing existing data...');
    try {
      await restCall('DELETE', 'risk_assessments', null, '');
      await restCall('DELETE', 'test_executions', null, '');
      await restCall('DELETE', 'heat_maps', null, '');
      await restCall('DELETE', 'project_members', null, '');
      await restCall('DELETE', 'users', null, '');
      await restCall('DELETE', 'projects', null, '');
      console.log('✓ Existing data cleared');
    } catch (error) {
      console.log('⚠️  Note: Could not clear data (may not exist yet or RLS blocking)');
    }

    // 1. Import Users
    console.log('\n👥 Importing Users...');
    const userInserts = seedData.users.map(user => ({
      email: user.email,
      role: user.role,
      is_active: user.is_active !== false
    }));

    const usersResult = await restCall('POST', 'users', userInserts);
    console.log(`   ✓ Imported ${usersResult.length || seedData.users.length} users`);

    // Get user mapping
    const allUsers = await restCall('GET', 'users', null, '?select=user_id,email');
    const userMap = {};
    allUsers.forEach(row => {
      userMap[row.email] = row.user_id;
    });

    // 2. Import Projects
    console.log('\n📦 Importing Projects...');
    const projectInserts = seedData.projects.map(proj => ({
      name: proj.name,
      repository_url: proj.repository_url || null
    }));

    const projectsResult = await restCall('POST', 'projects', projectInserts);
    console.log(`   ✓ Imported ${projectsResult.length || seedData.projects.length} projects`);

    // Get project mapping
    const allProjects = await restCall('GET', 'projects', null, '?select=project_id,name');
    const projectMap = {};
    allProjects.forEach(row => {
      projectMap[row.name] = row.project_id;
    });

    // 3. Import Project Members
    console.log('\n👫 Importing Project Members...');
    const memberInserts = seedData.project_members
      .map(member => ({
        project_id: projectMap[member.project_name],
        user_id: userMap[member.user_email],
        role: member.role || 'Developer'
      }))
      .filter(member => member.project_id && member.user_id);

    if (memberInserts.length > 0) {
      await restCall('POST', 'project_members', memberInserts);
    }
    console.log(`   ✓ Imported ${memberInserts.length} project members`);

    // 4. Import Heat Maps
    console.log('\n🔥 Importing Heat Maps...');
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
      .filter(heat => heat.project_id);

    if (heatmapInserts.length > 0) {
      await restCall('POST', 'heat_maps', heatmapInserts);
    }
    console.log(`   ✓ Imported ${heatmapInserts.length} heat maps`);

    // 5. Import Test Executions
    console.log('\n🧪 Importing Test Executions...');
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
      .filter(test => test.project_id);

    if (testInserts.length > 0) {
      await restCall('POST', 'test_executions', testInserts);
    }
    console.log(`   ✓ Imported ${testInserts.length} test executions`);

    // 6. Import Risk Assessments
    console.log('\n⚠️  Importing Risk Assessments...');
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
      .filter(risk => risk.project_id);

    if (riskInserts.length > 0) {
      await restCall('POST', 'risk_assessments', riskInserts);
    }
    console.log(`   ✓ Imported ${riskInserts.length} risk assessments`);

    // Summary
    console.log('\n✅ IMPORT COMPLETE\n');
    console.log('═'.repeat(70));
    console.log('\n📊 Summary:');
    console.log(`   Users:                ${userInserts.length}`);
    console.log(`   Projects:             ${projectInserts.length}`);
    console.log(`   Project Members:      ${memberInserts.length}`);
    console.log(`   Heat Maps:            ${heatmapInserts.length}`);
    console.log(`   Test Executions:      ${testInserts.length}`);
    console.log(`   Risk Assessments:     ${riskInserts.length}`);

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
