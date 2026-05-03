import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const { Pool } = pg;

let supabaseClient;
let pgPool;

export async function initSupabase() {
  try {
    // Initialize Supabase client
    // Use SERVICE_ROLE_KEY if available, otherwise use regular KEY (anon key)
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
    
    if (!process.env.SUPABASE_URL || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_KEY (or SUPABASE_SERVICE_ROLE_KEY) are required');
    }

    supabaseClient = createClient(
      process.env.SUPABASE_URL,
      supabaseKey
    );

    // Test connection
    const { data, error } = await supabaseClient
      .from('projects')
      .select('*')
      .limit(1);

    if (error) throw error;
    console.log('✅ Supabase connection successful');

    // Initialize PostgreSQL pool (optional direct connection)
    if (process.env.DATABASE_URL) {
      pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      console.log('✅ PostgreSQL connection pool created');
    }
  } catch (error) {
    console.error('❌ Supabase initialization failed:', error.message);
    throw error;
  }
}

export function getSupabaseClient() {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized');
  }
  return supabaseClient;
}

export function getPgPool() {
  if (!pgPool) {
    throw new Error('PostgreSQL pool not initialized');
  }
  return pgPool;
}

export async function query(text, params = []) {
  if (!pgPool) {
    throw new Error('PostgreSQL pool not initialized');
  }
  return pgPool.query(text, params);
}

export async function closeConnections() {
  if (pgPool) {
    await pgPool.end();
    console.log('✅ PostgreSQL connections closed');
  }
}
