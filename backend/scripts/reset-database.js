/**
 * Script para resetear la base de datos de INTEGRITY
 * Borra todos los datos de las tablas principales
 * Run: node scripts/reset-database.js
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetDatabase() {
  console.log('⚠️  RESETTING DATABASE - This will DELETE all data!\n');
  console.log('Proceeding with caution...\n');

  try {
    // List of tables to truncate (in order of dependencies)
    const tablesToReset = [
      'audit_logs',
      'admin_logs',
      'heat_maps',
      'risk_assessments',
      'test_executions',
      'integration_mappings',
      'connections',
      'project_members',
      'projects',
    ];

    for (const table of tablesToReset) {
      console.log(`🧹 Resetting ${table}...`);
      const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) {
        console.error(`  ❌ Error: ${error.message}`);
      } else {
        console.log(`  ✅ ${table} cleared`);
      }
    }

    console.log('\n✅ Database reset complete!');
    console.log('All tables have been truncated.\n');
    console.log('📝 Next steps:');
    console.log('   1. Run: node scripts/seed-dummy-data.js (to populate fresh demo data)');
    console.log('   2. Run: node scripts/create-test-users.js (to create test users)');
    console.log('   3. Start the app: npm run dev\n');
  } catch (err) {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  }
}

resetDatabase().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
