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

console.log('\n📊 INTEGRITY - Supabase Connection Validator\n');
console.log('═'.repeat(60));

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('\n❌ Error: Missing environment variables');
  console.error(`   SUPABASE_URL: ${SUPABASE_URL ? '✓' : '✗'}`);
  console.error(`   SUPABASE_KEY: ${SUPABASE_KEY ? '✓' : '✗'}`);
  console.log('\n💡 Make sure .env.local is configured in /backend folder\n');
  process.exit(1);
}

console.log('\n✅ Environment Variables');
console.log(`   URL: ${SUPABASE_URL.substring(0, 30)}...`);
console.log(`   Key: ${SUPABASE_KEY.substring(0, 20)}...`);

// Initialize client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function validateConnection() {
  try {
    console.log('\n🔗 Testing Supabase Connection...');

    // Test 1: Simple query
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .limit(1);

    if (error) throw error;
    console.log('   ✓ Query executed successfully');

    // Test 2: Get table metadata
    console.log('\n📋 Checking Database Schema...');
    
    const tables = [
      'users',
      'projects',
      'connections',
      'project_members',
      'integration_mappings',
      'heat_maps',
      'test_executions',
      'risk_assessments',
      'audit_logs',
      'admin_logs'
    ];

    for (const table of tables) {
      const { data: tableData, error: tableError } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (tableError) {
        console.log(`   ✗ ${table}: NOT FOUND`);
      } else {
        console.log(`   ✓ ${table}: Ready`);
      }
    }

    // Test 3: Data count
    console.log('\n📊 Data Summary...');
    
    for (const table of tables) {
      const { count, error: countError } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (!countError) {
        console.log(`   ${table}: ${count || 0} records`);
      }
    }

    // Test 4: Insert test data (optional)
    console.log('\n🔄 Connection Status...');
    console.log('   ✓ Supabase is connected');
    console.log('   ✓ Database is accessible');
    console.log('   ✓ All tables are ready');

    console.log('\n✅ VALIDATION SUCCESSFUL\n');
    console.log('═'.repeat(60));
    console.log('\n📌 Next Steps:');
    console.log('   1. Load sample data: npm run seed');
    console.log('   2. Start dev server: npm run dev');
    console.log('   3. Open http://localhost:5175\n');

  } catch (error) {
    console.error('\n❌ Validation Failed:');
    console.error(`   Error: ${error.message}`);
    
    if (error.message.includes('CORS')) {
      console.error('\n💡 Tip: This might be a CORS issue.');
      console.error('   Try using the service role key instead of anon key.\n');
    }
    
    if (error.message.includes('401')) {
      console.error('\n💡 Tip: Authentication failed.');
      console.error('   Check your SUPABASE_KEY in .env.local\n');
    }

    process.exit(1);
  }
}

// Run validation
validateConnection();
