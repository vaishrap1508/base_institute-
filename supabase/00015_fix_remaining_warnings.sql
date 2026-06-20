-- Migration to fix remaining Supabase Security Advisor warnings (Robust Version):
-- 1. RLS Policy Always True (landing_page_settings, landing_stats_cache, onboarding_settings, badges, user_badges)
-- 2. Public can execute SECURITY DEFINER functions (is_admin, handle_new_user, questions_before_insert_or_update, questions_after_insert_or_update, generate_questions_unified_id, etc.)
-- 3. Signed-in users can execute trigger functions

-- ==============================================================================
-- PART 1: Fix RLS Policies (Wrapped in IF EXISTS checks to prevent "relation does not exist" errors)
-- ==============================================================================

DO $$
BEGIN
    -- 1. public.badges
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'badges') THEN
        ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public select for badges" ON public.badges;
        DROP POLICY IF EXISTS "Allow write access for badges" ON public.badges;
        CREATE POLICY "Allow public select for badges" ON public.badges 
            FOR SELECT USING (true);
        CREATE POLICY "Allow admin write access for badges" ON public.badges 
            FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
    END IF;

    -- 2. public.user_badges
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_badges') THEN
        ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public select for user_badges" ON public.user_badges;
        DROP POLICY IF EXISTS "Allow write access for user_badges" ON public.user_badges;
        CREATE POLICY "Allow public select for user_badges" ON public.user_badges 
            FOR SELECT USING (true);
        CREATE POLICY "Allow user write access for user_badges" ON public.user_badges 
            FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;

    -- 3. public.landing_page_settings
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'landing_page_settings') THEN
        ALTER TABLE public.landing_page_settings ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public read access on landing_page_settings" ON public.landing_page_settings;
        DROP POLICY IF EXISTS "Allow write/update access on landing_page_settings" ON public.landing_page_settings;
        CREATE POLICY "Allow public read access on landing_page_settings" ON public.landing_page_settings 
            FOR SELECT USING (true);
        CREATE POLICY "Allow admin write access on landing_page_settings" ON public.landing_page_settings 
            FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
    END IF;

    -- 4. public.landing_stats_cache
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'landing_stats_cache') THEN
        ALTER TABLE public.landing_stats_cache ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public read access on landing_stats_cache" ON public.landing_stats_cache;
        DROP POLICY IF EXISTS "Allow write/update access on landing_stats_cache" ON public.landing_stats_cache;
        CREATE POLICY "Allow public read access on landing_stats_cache" ON public.landing_stats_cache 
            FOR SELECT USING (true);
        CREATE POLICY "Allow admin write access on landing_stats_cache" ON public.landing_stats_cache 
            FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
    END IF;

    -- 5. public.onboarding_settings
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'onboarding_settings') THEN
        ALTER TABLE public.onboarding_settings ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public read access on onboarding_settings" ON public.onboarding_settings;
        DROP POLICY IF EXISTS "Allow write/update access on onboarding_settings" ON public.onboarding_settings;
        CREATE POLICY "Allow public read access on onboarding_settings" ON public.onboarding_settings 
            FOR SELECT USING (true);
        CREATE POLICY "Allow admin write access on onboarding_settings" ON public.onboarding_settings 
            FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
    END IF;
END $$;


-- ==============================================================================
-- PART 2: Revoke/Grant Function Execution Privileges to secure SECURITY DEFINER functions
-- ==============================================================================

DO $$
DECLARE
    r RECORD;
    v_sql_revoke_public TEXT;
    v_sql_revoke_auth TEXT;
    v_sql_grant TEXT;
    v_return_type TEXT;
BEGIN
    FOR r IN 
        SELECT 
            p.oid,
            p.proname AS func_name,
            pg_catalog.pg_get_function_identity_arguments(p.oid) AS func_args,
            n.nspname AS schema_name,
            pg_catalog.format_type(p.prorettype, NULL) AS ret_type
        FROM pg_catalog.pg_proc p
        LEFT JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public' AND p.prosecdef = true
    LOOP
        -- A. Revoke execute from PUBLIC (resolves Public Can Execute warnings)
        v_sql_revoke_public := format('REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM PUBLIC', 
                                       r.schema_name, r.func_name, r.func_args);
        EXECUTE v_sql_revoke_public;
        
        -- B. Set granular access based on whether the function is a database trigger
        IF r.ret_type = 'trigger' THEN
            -- Trigger functions should never be called directly by authenticated users
            v_sql_revoke_auth := format('REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM authenticated', 
                                        r.schema_name, r.func_name, r.func_args);
            EXECUTE v_sql_revoke_auth;
            
            -- Grant only to service_role (so system trigger operations succeed, but no client calls are allowed)
            v_sql_grant := format('GRANT EXECUTE ON FUNCTION %I.%I(%s) TO service_role', 
                                  r.schema_name, r.func_name, r.func_args);
            EXECUTE v_sql_grant;
        ELSE
            -- Helper functions like is_admin() should be callable by authenticated clients and service_role
            v_sql_grant := format('GRANT EXECUTE ON FUNCTION %I.%I(%s) TO authenticated, service_role', 
                                  r.schema_name, r.func_name, r.func_args);
            EXECUTE v_sql_grant;
        END IF;
    END LOOP;
END;
$$;
