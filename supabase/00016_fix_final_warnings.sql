-- Migration to fix the final Supabase Security Advisor warnings (Updated):
-- 1. Redefining public.is_admin() as SECURITY INVOKER with SET search_path to resolve mutable search path.
-- 2. Explicitly revoking execution privileges from PUBLIC, anon, and authenticated roles for trigger functions.

-- 1. Redefine public.is_admin() as SECURITY INVOKER with fixed search_path
-- By adding SET search_path = public, pg_temp, we resolve the "Function Search Path Mutable" warning.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN SECURITY INVOKER 
SET search_path = public, pg_temp AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'ADMIN'::user_role
  );
END;
$$ LANGUAGE plpgsql;

-- 2. Explicitly Revoke Trigger execute privileges from untrusted roles
REVOKE EXECUTE ON FUNCTION public.generate_questions_unified_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.questions_after_insert_or_update() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.questions_before_insert_or_update() FROM PUBLIC, anon, authenticated;

-- Revoke execute from PUBLIC and anon for helper functions
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;

-- 3. Grant execute back to authenticated and service_role for functions that the client needs to call
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
