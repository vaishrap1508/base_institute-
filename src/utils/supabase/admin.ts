import { createClient } from '@supabase/supabase-js';
import { env } from '@/env';

/**
 * Creates a Supabase Admin Client using the service_role key.
 * This client bypasses Row Level Security (RLS).
 * MUST ONLY be called in Server-side code (API Routes, Server Actions, Server Components).
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not configured. This operation requires database administrative privileges.'
    );
  }

  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}
