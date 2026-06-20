-- Migration to fix Supabase Security Advisor warnings: Function Search Path Mutable
-- This script dynamically alters all functions in the public schema to set an explicit search_path,
-- protecting them from search_path hijack vulnerabilities and resolving the linter warnings.

DO $$
DECLARE
    r RECORD;
    v_sql TEXT;
BEGIN
    FOR r IN 
        SELECT 
            p.proname AS func_name,
            pg_catalog.pg_get_function_identity_arguments(p.oid) AS func_args,
            n.nspname AS schema_name
        FROM pg_catalog.pg_proc p
        LEFT JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
    LOOP
        -- Build the ALTER FUNCTION statement
        v_sql := format('ALTER FUNCTION %I.%I(%s) SET search_path = public, pg_temp', 
                        r.schema_name, r.func_name, r.func_args);
        BEGIN
            EXECUTE v_sql;
        EXCEPTION WHEN OTHERS THEN
            -- Log a warning if a specific function cannot be altered (e.g., system/internal/special functions)
            RAISE WARNING 'Failed to execute: % | Error: %', v_sql, SQLERRM;
        END;
    END LOOP;
END;
$$;
