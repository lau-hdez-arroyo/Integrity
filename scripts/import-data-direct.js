#!/usr/bin/env node

import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const { Client } = pkg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../backend/.env.local') });

let DATABASE_URL = process.env.DATABASE_URL;

// If DATABASE_URL is not properly set, construct it from Supabase connection details
if (!DATABASE_URL || DATABASE_URL.includes('XXXX')) {
  // Try to construct from SUPABASE_URL
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;
  
  if (SUPABASE_URL && SUPABASE_KEY) {
    // Extract project reference from URL: https://PROJECT_REF.supabase.co
    const projectRef = SUPABASE_URL.split('//')[1].split('.')[0];
    DATABASE_URL = `postgresql://postgres:${SUPABASE_KEY}@db.${projectRef}.supabase.co:5432/postgres?sslmode=require`;
  }
}

if (!DATABASE_URL) {
  console.error('\n❌ Error: DATABASE_URL not configured in .env.local');
  console.error('Please set DATABASE_URL or both SUPABASE_URL and SUPABASE_KEY\n');
  process.exit(1);
}

const client = new Client({ 
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

console.log('\n📦 INTEGRITY - Direct DB Data Import\n');
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
  console.error('\nUsage: npm run import-data-direct -- --file=path/to/file.json');
  console.error('\nExample: npm run import-data-direct -- --file=seed-data.json\n');
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

// Import function
async function importData() {
  try {
    // Connect to database
    console.log('\n🔗 Connecting to database...');
    await client.connect();
    console.log('✓ Connected to PostgreSQL');

    // Validate data structure
    const validationErrors = validateData(seedData);
    if (validationErrors.length > 0) {
      console.error('\n❌ Validation errors found:\n');
      validationErrors.forEach(err => console.error(`   • ${err}`));
      console.error();
      process.exit(1);
    }
    console.log('✓ Data validation passed');

    // Clear existing data (optional - for testing)
    console.log('\n🧹 Clearing existing data...');
    try {
      await client.query('DELETE FROM risk_assessments');
      await client.query('DELETE FROM test_executions');
      await client.query('DELETE FROM heat_maps');
      await client.query('DELETE FROM project_members');
      await client.query('DELETE FROM users');
      await client.query('DELETE FROM projects');
      console.log('✓ Existing data cleared');
    } catch (error) {
      console.log('⚠️  Note: Could not clear data (may not exist yet)');
    }

    // 1. Import Users
    console.log('\n👥 Importing Users...');
    for (const user of seedData.users) {
      await client.query(
        `INSERT INTO users (email, role, is_active) VALUES ($1, $2, $3)`,
        [user.email, user.role, user.is_active !== false]
      );
    }
    console.log(`   ✓ Imported ${seedData.users.length} users`);

    // 2. Import Projects
    console.log('\n📦 Importing Projects...');
    for (const project of seedData.projects) {
      await client.query(
        `INSERT INTO projects (name, repository_url) VALUES ($1, $2)`,
        [project.name, project.repository_url || null]
      );
    }
    console.log(`   ✓ Imported ${seedData.projects.length} projects`);

    // Get user and project IDs for mapping
    const usersResult = await client.query('SELECT user_id, email FROM users');
    const projectsResult = await client.query('SELECT project_id, name FROM projects');

    const userMap = {};
    usersResult.rows.forEach(row => {
      userMap[row.email] = row.user_id;
    });

    const projectMap = {};
    projectsResult.rows.forEach(row => {
      projectMap[row.name] = row.project_id;
    });

    // 3. Import Project Members
    console.log('\n👫 Importing Project Members...');
    let memberCount = 0;
    for (const member of seedData.project_members) {
      const projectId = projectMap[member.project_name];
      const userId = userMap[member.user_email];
      
      if (projectId && userId) {
        await client.query(
          `INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)`,
          [projectId, userId, member.role || 'Developer']
        );
        memberCount++;
      }
    }
    console.log(`   ✓ Imported ${memberCount} project members`);

    // 4. Import Heat Maps
    console.log('\n🔥 Importing Heat Maps...');
    let heatmapCount = 0;
    for (const heat of seedData.heat_maps) {
      const projectId = projectMap[heat.project_name];
      
      if (projectId) {
        const riskScore = Math.round((100 - heat.coverage_percentage) / 10);
        const coverageByModule = {
          modules: [
            {
              name: heat.module_name || 'Unknown',
              coverage: heat.coverage_percentage,
              complexity: 3.0,
              riskScore: riskScore,
              defectRate: (100 - heat.coverage_percentage) / 1000
            }
          ]
        };

        await client.query(
          `INSERT INTO heat_maps (project_id, repository_branch_id, coverage_percentage, risk_score, coverage_by_module) 
           VALUES ($1, $2, $3, $4, $5)`,
          [projectId, 'main', heat.coverage_percentage, riskScore, JSON.stringify(coverageByModule)]
        );
        heatmapCount++;
      }
    }
    console.log(`   ✓ Imported ${heatmapCount} heat maps`);

    // 5. Import Test Executions
    console.log('\n🧪 Importing Test Executions...');
    let testCount = 0;
    const now = new Date();
    for (const [idx, test] of seedData.test_executions.entries()) {
      const projectId = projectMap[test.project_name];
      
      if (projectId) {
        const startTime = new Date(now.getTime() - (idx * 3600000));
        const endTime = new Date(startTime.getTime() + ((test.execution_time_seconds || 60) * 1000));

        await client.query(
          `INSERT INTO test_executions (project_id, test_suite_id, status, start_time, end_time, duration) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            projectId,
            `suite-${idx}`,
            test.status === 'completed' ? 'PASSED' : 'PENDING',
            startTime,
            endTime,
            test.execution_time_seconds || 60
          ]
        );
        testCount++;
      }
    }
    console.log(`   ✓ Imported ${testCount} test executions`);

    // 6. Import Risk Assessments
    console.log('\n⚠️  Importing Risk Assessments...');
    let riskCount = 0;
    for (const [idx, risk] of seedData.risk_assessments.entries()) {
      const projectId = projectMap[risk.project_name];
      
      if (projectId) {
        const factors = {
          factors: [
            {
              name: 'Coverage Gap',
              weight: 0.4,
              score: risk.risk_score,
              description: risk.identified_risks ? risk.identified_risks[0] : 'Low coverage detected'
            }
          ],
          recommendation: risk.risk_score > 7 ? 'REVIEW' : 'APPROVE'
        };

        await client.query(
          `INSERT INTO risk_assessments (project_id, change_id, risk_score, predicted_escape_rate, factors) 
           VALUES ($1, $2, $3, $4, $5)`,
          [
            projectId,
            `change-${idx}`,
            risk.risk_score,
            Math.min(risk.risk_score / 10, 0.99),
            JSON.stringify(factors)
          ]
        );
        riskCount++;
      }
    }
    console.log(`   ✓ Imported ${riskCount} risk assessments`);

    // Summary
    console.log('\n✅ IMPORT COMPLETE\n');
    console.log('═'.repeat(70));
    console.log('\n📊 Summary:');
    console.log(`   Users:                ${seedData.users.length}`);
    console.log(`   Projects:             ${seedData.projects.length}`);
    console.log(`   Project Members:      ${memberCount}`);
    console.log(`   Heat Maps:            ${heatmapCount}`);
    console.log(`   Test Executions:      ${testCount}`);
    console.log(`   Risk Assessments:     ${riskCount}`);

    console.log('\n🚀 Data imported successfully!');
    console.log('   Open http://localhost:5175 to see the data in dashboards\n');

  } catch (error) {
    console.error('\n❌ Import Failed:');
    console.error(`   ${error.message}\n`);
    if (error.detail) console.error(`   Details: ${error.detail}\n`);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run import
importData();
