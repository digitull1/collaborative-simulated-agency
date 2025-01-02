import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tyyucvvapqwzjkqcgjwb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5eXVjdnZhcHF3emprcWNnandiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk4MjI0MDAsImV4cCI6MjAyNTM5ODQwMH0.qDPHvkHE_-7oIK9C6o5LHi5WRy-qQQwXf3vHVGYzOtE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: localStorage
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey
    }
  }
});

// Add error handling for failed requests
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    localStorage.clear();
  } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    console.log('Auth state updated:', event);
  }
});

// Add error logging
supabase.auth.onError((error) => {
  console.error('Supabase auth error:', error);
});