/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Standard Supabase client initialization
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://otceyeuhyxrwjbyfwbwl.supabase.co').replace(/\/$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_tmmqhQn_-UBzKMLsd6XNeA_N6D_e1lL';

const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('otceyeuhyxrwjbyfwbwl');

export const isSupabaseConfigured = !isPlaceholder;

// Use a real client only if a valid URL is provided
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Fix for LockManager timeout in Iframe environments (AI Studio)
    // Providing a custom no-op lock prevents the Navigator LockManager 10s hang
    lock: (name: any, _timeout: any, callback: any) => {
      if (typeof _timeout === 'function') return _timeout();
      if (typeof callback === 'function') return callback();
      return Promise.resolve();
    }
  }
});
