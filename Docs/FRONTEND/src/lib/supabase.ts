import { createClient } from '@supabase/supabase-js';
import { supabaseAnonKey, supabaseServiceRoleKey, supabaseUrl } from './supabase-config';

export function createClerkSupabaseBrowserClient(getAccessToken: () => Promise<string | null>) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    accessToken: getAccessToken,
  });
}

export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

export const hasSupabaseServiceRole = Boolean(supabaseAdmin);
