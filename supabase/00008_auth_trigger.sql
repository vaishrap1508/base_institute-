-- ==========================================
-- 00008_auth_trigger.sql
-- Auto-create user profiles when signed up (via Google OAuth or Email)
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.email,
    CASE 
      WHEN new.email = 'sarah.c@aptitude-ai.com' THEN 'ADMIN'::user_role
      ELSE 'STUDENT'::user_role
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Catch any errors (RLS, constraint violations, etc.) to prevent blocking auth.users signup
  -- The application callback or onboarding flow can handle fallback profile creation if needed
  RAISE WARNING 'Error in handle_new_user trigger: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Bind the function as a trigger after auth.users insertions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

