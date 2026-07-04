import { createClient } from '@supabase/supabase-js';

// Default values provided by the user for immediate fallback
const DEFAULT_SUPABASE_URL = 'https://hkfatixdccnlsjxfacdl.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrZmF0aXhkY2NubHNqeGZhY2RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxNjQwODksImV4cCI6MjA5ODc0MDA4OX0.fCxp8_bWPNqAD8FHL2EYUXhwNIYfxGD4M8ItedEcbKI';

export const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check connection and verify if tables are ready
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error) {
      return { connected: false, error: error.message };
    }
    return { connected: true, error: null };
  } catch (err: any) {
    return { connected: false, error: err.message };
  }
}
