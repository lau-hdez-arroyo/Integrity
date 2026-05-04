/**
 * Script to create test users in Supabase Auth
 * Run with: node backend/scripts/create-test-users.js
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TEST_USERS = [
  {
    email: 'admin@integrity.dev',
    password: 'Admin@2026',
    role: 'admin',
    name: 'Admin User',
  },
  {
    email: 'qa.tester@integrity.dev',
    password: 'Integrity@2026',
    role: 'qa',
    name: 'QA Tester',
  },
  {
    email: 'executive@integrity.dev',
    password: 'Executive@2026',
    role: 'executive',
    name: 'Executive User',
  },
  {
    email: 'developer@integrity.dev',
    password: 'Developer@2026',
    role: 'developer',
    name: 'Developer User',
  },
  {
    email: 'laura.hernandez@payflow.com',
    password: 'Payflow@2026',
    role: 'qa',
    name: 'Laura Hernandez',
  },
];

async function createTestUsers() {
  console.log('🔐 Creating test users...\n');

  for (const user of TEST_USERS) {
    try {
      // Create user with metadata
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        user_metadata: {
          role: user.role,
          name: user.name,
        },
        email_confirm: true, // Auto-confirm email
      });

      if (error) {
        // If user already exists, try to update
        if (error.message.includes('already exists')) {
          console.log(`⚠️  User ${user.email} already exists, skipping...`);
        } else {
          console.error(`❌ Error creating ${user.email}:`, error.message);
        }
      } else {
        console.log(`✅ Created user: ${user.email} (${user.role})`);
      }
    } catch (err) {
      console.error(`❌ Failed to create ${user.email}:`, err.message);
    }
  }

  console.log('\n✅ User creation complete!');
  console.log('\nTest Credentials:');
  console.log('================');
  TEST_USERS.forEach((u) => {
    console.log(`Email: ${u.email}`);
    console.log(`Password: ${u.password}`);
    console.log(`Role: ${u.role}\n`);
  });
}

createTestUsers().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
