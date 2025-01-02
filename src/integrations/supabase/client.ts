import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tyyucvvapqwzjkqcgjwb.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: localStorage,
    storageKey: 'supabase.auth.token',
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey,
    }
  },
  db: {
    schema: 'public'
  }
});