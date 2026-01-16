import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Log para debugging (sin mostrar la key completa)
console.log('Supabase Config:', {
  url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NOT SET',
  hasKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0
});

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = 'Supabase environment variables are missing or undefined. Please check your .env file.';
  console.error(errorMsg, {
    VITE_SUPABASE_URL: supabaseUrl ? 'SET' : 'MISSING',
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'SET' : 'MISSING'
  });
  throw new Error(errorMsg);
}

if (supabaseUrl.trim() === '' || supabaseAnonKey.trim() === '') {
  const errorMsg = 'Missing Supabase environment variables. Please check your .env file.';
  console.error(errorMsg);
  throw new Error(errorMsg);
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Indicates if the environment variables required for Supabase are configured
export const isSupabaseConfigured = Boolean(supabaseUrl.trim() !== '' && supabaseAnonKey.trim() !== '');

export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('pets').select('*').limit(1);
    if (error) {
      console.error('Error connecting to Supabase:', error);
      return 'Connection failed';
    }
    console.log('Connection successful, sample data:', data);
    return 'Connection successful';
  } catch (err) {
    console.error('Unexpected error:', err);
    return 'Unexpected error';
  }
}

export async function testSupabaseURL() {
  try {
    const response = await fetch(supabaseUrl, { method: 'HEAD' });
    if (!response.ok) {
      console.error('Supabase URL is not accessible:', response.statusText);
      return 'Supabase URL is not accessible';
    }
    console.log('Supabase URL is accessible');
    return 'Supabase URL is accessible';
  } catch (error) {
    console.error('Error testing Supabase URL:', error);
    return 'Error testing Supabase URL';
  }
}