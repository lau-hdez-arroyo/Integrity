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
  process.exit(1);
}

// Crear cliente con SERVICE_ROLE_KEY (admin)
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Datos de prueba
const seedData = {
  users: [
    {
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      project_id: '650e8400-e29b-41d4-a716-446655440000',
      email: 'laura.hernandez@payflow.com',
      role: 'Admin',
      is_active: true,
    },
    {
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      project_id: '650e8400-e29b-41d4-a716-446655440000',
      email: 'carlos.martinez@payflow.com',
      role: 'QA',
      is_active: true,
    },
    {
      user_id: '550e8400-e29b-41d4-a716-446655440002',
      project_id: '650e8400-e29b-41d4-a716-446655440001',
      email: 'sofia.rodriguez@payflow.com',
      role: 'Developer',
      is_active: true,
    },
    {
      user_id: '550e8400-e29b-41d4-a716-446655440003',
      project_id: '650e8400-e29b-41d4-a716-446655440001',
      email: 'juan.torres@payflow.com',
      role: 'PM',
      is_active: true,
    },
    {
      user_id: '550e8400-e29b-41d4-a716-446655440004',
      project_id: '650e8400-e29b-41d4-a716-446655440002',
      email: 'diego.sanchez@payflow.com',
      role: 'Developer',
      is_active: true,
    },
  ],
  projects: [
    {
      project_id: '650e8400-e29b-41d4-a716-446655440000',
      name: 'PayFlow Platform',
      repository_url: 'https://github.com/demo/payflow-platform',
    },
    {
      project_id: '650e8400-e29b-41d4-a716-446655440001',
      name: 'Mobile Banking App',
      repository_url: 'https://github.com/demo/mobile-banking-app',
    },
    {
      project_id: '650e8400-e29b-41d4-a716-446655440002',
      name: 'Payment Gateway',
      repository_url: 'https://github.com/demo/payment-gateway',
    },
  ],
  test_executions: [
    // PayFlow Platform
    { project_id: '650e8400-e29b-41d4-a716-446655440000', test_suite_id: 'auth_login_valid_credentials', status: 'PASSED', duration: 234 },
    { project_id: '650e8400-e29b-41d4-a716-446655440000', test_suite_id: 'auth_logout_session_clear', status: 'PASSED', duration: 156 },
    { project_id: '650e8400-e29b-41d4-a716-446655440000', test_suite_id: 'payment_process_cc', status: 'PASSED', duration: 512 },
    { project_id: '650e8400-e29b-41d4-a716-446655440000', test_suite_id: 'payment_refund', status: 'PASSED', duration: 423 },
    { project_id: '650e8400-e29b-41d4-a716-446655440000', test_suite_id: 'api_v1_projects', status: 'PASSED', duration: 89 },
    { project_id: '650e8400-e29b-41d4-a716-446655440000', test_suite_id: 'api_v1_users', status: 'FAILED', duration: 145 },
    // Mobile Banking App
    { project_id: '650e8400-e29b-41d4-a716-446655440001', test_suite_id: 'ui_button_render', status: 'PASSED', duration: 67 },
    { project_id: '650e8400-e29b-41d4-a716-446655440001', test_suite_id: 'ui_form_validation', status: 'PASSED', duration: 123 },
    { project_id: '650e8400-e29b-41d4-a716-446655440001', test_suite_id: 'sync_offline_data', status: 'PASSED', duration: 234 },
    { project_id: '650e8400-e29b-41d4-a716-446655440001', test_suite_id: 'offline_mode_enabled', status: 'PASSED', duration: 89 },
    // Payment Gateway
    { project_id: '650e8400-e29b-41d4-a716-446655440002', test_suite_id: 'gateway_auth', status: 'PASSED', duration: 178 },
    { project_id: '650e8400-e29b-41d4-a716-446655440002', test_suite_id: 'webhook_callback', status: 'PASSED', duration: 267 },
    { project_id: '650e8400-e29b-41d4-a716-446655440002', test_suite_id: 'retry_mechanism', status: 'PASSED', duration: 345 },
  ],
  risk_assessments: [
    { project_id: '650e8400-e29b-41d4-a716-446655440000', change_id: 'CHANGE-001', risk_score: 1.2, predicted_escape_rate: 0.05 },
    { project_id: '650e8400-e29b-41d4-a716-446655440000', change_id: 'CHANGE-002', risk_score: 0.8, predicted_escape_rate: 0.03 },
    { project_id: '650e8400-e29b-41d4-a716-446655440000', change_id: 'CHANGE-003', risk_score: 1.5, predicted_escape_rate: 0.06 },
    { project_id: '650e8400-e29b-41d4-a716-446655440001', change_id: 'CHANGE-004', risk_score: 2.2, predicted_escape_rate: 0.08 },
    { project_id: '650e8400-e29b-41d4-a716-446655440001', change_id: 'CHANGE-005', risk_score: 1.8, predicted_escape_rate: 0.07 },
    { project_id: '650e8400-e29b-41d4-a716-446655440002', change_id: 'CHANGE-006', risk_score: 0.9, predicted_escape_rate: 0.04 },
    { project_id: '650e8400-e29b-41d4-a716-446655440002', change_id: 'CHANGE-007', risk_score: 1.1, predicted_escape_rate: 0.04 },
  ],
};

async function importData() {
  console.log('🔐 Iniciando importación con SERVICE_ROLE_KEY...\n');

  try {
    // 1. Insert users
    console.log('📝 Insertando usuarios...');
    const { error: usersError } = await supabase.from('users').insert(seedData.users);
    if (usersError) {
      console.error('   ❌ Error:', usersError.message);
    } else {
      console.log('   ✅ 5 usuarios insertados\n');
    }

    // 3. Insert projects
    console.log('📝 Insertando proyectos...');
    const { error: projectsError } = await supabase.from('projects').insert(seedData.projects);
    if (projectsError) {
      console.error('   ❌ Error:', projectsError.message);
    } else {
      console.log('   ✅ 3 proyectos insertados\n');
    }

    // 4. Insert test executions
    console.log('📝 Insertando ejecuciones de tests...');
    const { error: testExecError } = await supabase.from('test_executions').insert(seedData.test_executions);
    if (testExecError) {
      console.error('   ❌ Error:', testExecError.message);
    } else {
      console.log('   ✅ 13 ejecuciones de tests insertadas\n');
    }

    // 5. Insert risk assessments
    console.log('📝 Insertando evaluaciones de riesgo...');
    const { error: riskError } = await supabase.from('risk_assessments').insert(seedData.risk_assessments);
    if (riskError) {
      console.error('   ❌ Error:', riskError.message);
    } else {
      console.log('   ✅ 7 evaluaciones de riesgo insertadas\n');
    }

    console.log('✨ ¡Importación completada!');
    console.log('\n📊 Datos importados:');
    console.log('   ✓ 5 usuarios');
    console.log('   ✓ 3 proyectos');
    console.log('   ✓ 13 ejecuciones de tests');
    console.log('   ✓ 7 evaluaciones de riesgo');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error fatal:', err);
    process.exit(1);
  }
}

importData();
