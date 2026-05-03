#!/usr/bin/env node

import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from backend
dotenv.config({ path: path.join(__dirname, '../backend/.env.local') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('\n❌ DATABASE_URL not configured in .env.local\n');
  process.exit(1);
}

const { Pool } = pg;
const pool = new Pool({ connectionString: DATABASE_URL });

console.log('\n📋 Database Schema Details\n');
console.log('═'.repeat(60));

async function inspectColumns() {
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
      const query = `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position;
      `;

      const result = await pool.query(query, [table]);
      
      console.log(`\n📊 ${table}`);
      console.log('   ' + '─'.repeat(50));

      if (result.rows.length === 0) {
        console.log('   ⚠️  No columns found');
      } else {
        result.rows.forEach(col => {
          const nullable = col.is_nullable === 'YES' ? '(nullable)' : '';
          const defaultVal = col.column_default ? `= ${col.column_default}` : '';
          console.log(`   • ${col.column_name}: ${col.data_type} ${nullable} ${defaultVal}`);
        });
      }
    }

    console.log('\n✅ INSPECTION COMPLETE\n');
    console.log('═'.repeat(60) + '\n');

    await pool.end();

  } catch (error) {
    console.error('\n❌ Error:');
    console.error(`   ${error.message}\n`);
    await pool.end();
    process.exit(1);
  }
}

// Run inspection
inspectColumns();
