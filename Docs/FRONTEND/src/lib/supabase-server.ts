import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAnonKey, supabaseServiceRoleKey, supabaseUrl } from './supabase-config';

export async function createRouteHandlerClient() {
  if (supabaseServiceRoleKey) {
    // Server routes already validate the user with Clerk, so prefer the
    // service role client instead of depending on Clerk JWT verification in Supabase.
    return createAdminClient();
  }

  let accessToken: string | null = null;

  try {
    const authState = await auth();
    accessToken = await authState.getToken();
  } catch {
    accessToken = null;
  }

  return createServerSupabaseClient(accessToken);
}

export function createServerSupabaseClient(accessToken?: string | null) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    accessToken: async () => accessToken ?? null,
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createAdminClient() {
  if (!supabaseServiceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
