/**
 * Script para borrar usuarios de test en Supabase Auth
 * CUIDADO: Este script borra usuarios reales!
 * Run: node scripts/delete-test-users.js
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Usuarios a borrar
const TEST_EMAILS = [
  'admin@integrity.dev',
  'qa.tester@integrity.dev',
  'executive@integrity.dev',
  'developer@integrity.dev',
  'laura.hernandez@payflow.com',
];

async function deleteTestUsers() {
  console.log('⚠️  DELETING TEST USERS - This will remove auth accounts!\n');

  for (const email of TEST_EMAILS) {
    try {
      console.log(`🗑️  Deleting ${email}...`);

      // Get user by email
      const { data: users, error: searchError } = await supabase.auth.admin.listUsers();

      if (searchError) {
        console.error(`  ❌ Error searching users: ${searchError.message}`);
        continue;
      }

      // Find user by email
      const user = users.users.find((u) => u.email === email);

      if (!user) {
        console.log(`  ⚠️  User not found`);
        continue;
      }

      // Delete user
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

      if (deleteError) {
        console.error(`  ❌ Error: ${deleteError.message}`);
      } else {
        console.log(`  ✅ User deleted (ID: ${user.id})`);
      }
    } catch (err) {
      console.error(`  ❌ Exception: ${err.message}`);
    }
  }

  console.log('\n✅ Test users deletion complete!\n');
  console.log('📝 To recreate users, run: node scripts/create-test-users.js\n');
}

deleteTestUsers().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
