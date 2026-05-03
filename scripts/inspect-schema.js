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

console.log('\n📋 INTEGRITY - Database Schema Inspector\n');
console.log('═'.repeat(60));

async function inspectSchema() {
  try {
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
      console.log(`\n📊 Table: ${table}`);
      console.log('   ' + '─'.repeat(50));

      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
        continue;
      }

      // Get columns from the first row (if exists)
      if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        columns.forEach(col => {
          const value = data[0][col];
          const type = typeof value;
          console.log(`   ✓ ${col}: ${type} (${JSON.stringify(value).substring(0, 30)}...)`);
        });
      } else {
        // Try to get info from empty table
        const { data: emptyData, error: emptyError } = await supabase
          .from(table)
          .select('*')
          .limit(0);

        if (emptyError) {
          console.log(`   ⚠️  Cannot inspect empty table`);
        } else {
          console.log(`   ✓ Table is empty but accessible`);
        }
      }
    }

    console.log('\n✅ INSPECTION COMPLETE\n');
    console.log('═'.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Inspection Failed:');
    console.error(`   Error: ${error.message}\n`);
    process.exit(1);
  }
}

// Run inspection
inspectSchema();
