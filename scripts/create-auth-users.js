import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../backend/.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Error: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configurados');
  console.error('   Verifica que backend/.env.local tenga ambas variables');
  process.exit(1);
}

// Crear cliente Supabase con SERVICE_ROLE_KEY (admin privileges)
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Datos de usuarios a crear
const users = [
  {
    email: 'laura.hernandez@payflow.com',
    password: 'Payflow@2026',
    user_metadata: {
      full_name: 'Laura Hernández',
      role: 'Admin',
    },
  },
  {
    email: 'carlos.martinez@payflow.com',
    password: 'Payflow@2026',
    user_metadata: {
      full_name: 'Carlos Martínez',
      role: 'QA',
    },
  },
  {
    email: 'sofia.rodriguez@payflow.com',
    password: 'Payflow@2026',
    user_metadata: {
      full_name: 'Sofía Rodríguez',
      role: 'Developer',
    },
  },
  {
    email: 'juan.torres@payflow.com',
    password: 'Payflow@2026',
    user_metadata: {
      full_name: 'Juan Torres',
      role: 'PM',
    },
  },
  {
    email: 'diego.sanchez@payflow.com',
    password: 'Payflow@2026',
    user_metadata: {
      full_name: 'Diego Sánchez',
      role: 'Developer',
    },
  },
];

async function createUsers() {
  console.log('🔐 Iniciando creación de usuarios en Supabase Auth...\n');

  const results = {
    created: [],
    failed: [],
    duplicated: [],
  };

  for (const user of users) {
    try {
      console.log(`📝 Creando: ${user.email}`);

      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: user.user_metadata,
      });

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ⚠️  Ya existe (skipped)\n`);
          results.duplicated.push(user.email);
        } else {
          console.log(`   ❌ Error: ${error.message}\n`);
          results.failed.push({ email: user.email, error: error.message });
        }
      } else {
        console.log(`   ✅ Usuario creado (ID: ${data.user.id})\n`);
        results.created.push(user.email);
      }
    } catch (err) {
      console.log(`   ❌ Excepción: ${err.message}\n`);
      results.failed.push({ email: user.email, error: err.message });
    }
  }

  // Resumen final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE CREACIÓN DE USUARIOS');
  console.log('='.repeat(60));
  console.log(`✅ Creados:      ${results.created.length}`);
  console.log(`⚠️  Duplicados:   ${results.duplicated.length}`);
  console.log(`❌ Fallidos:     ${results.failed.length}`);
  console.log('='.repeat(60) + '\n');

  if (results.created.length > 0) {
    console.log('✅ Usuarios creados:');
    results.created.forEach((email) => console.log(`   - ${email}`));
    console.log();
  }

  if (results.duplicated.length > 0) {
    console.log('⚠️  Usuarios ya existentes:');
    results.duplicated.forEach((email) => console.log(`   - ${email}`));
    console.log();
  }

  if (results.failed.length > 0) {
    console.log('❌ Usuarios con error:');
    results.failed.forEach(({ email, error }) => console.log(`   - ${email}: ${error}`));
    console.log();
  }

  console.log('🔐 Contraseña para todos: Payflow@2026');
  console.log('\n✨ Script completado\n');

  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Ejecutar
createUsers().catch((err) => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
