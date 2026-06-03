import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && user) {
      // 1. Fallback Profile Creation (to ensure public.profiles has a row)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      let userRole = 'STUDENT';
      if (!profile) {
        const isSarah = user.email === 'sarah.c@aptitude-ai.com';
        const isMarcus = user.email === 'marcus.w@aptitude-ai.com';
        const dbRole = (isSarah || isMarcus) ? 'ADMIN' : 'STUDENT';
        userRole = dbRole;

        await supabase.from('profiles').insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          role: dbRole
        });
      } else {
        userRole = profile.role;
      }

      // 2. Check Onboarding Status
      const { data: onboarding } = await supabase
        .from('onboarding_profile')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .maybeSingle();

      // Check if we have onboarding completed
      if (onboarding?.onboarding_completed) {
        if (userRole === 'ADMIN' || user.email === 'sarah.c@aptitude-ai.com' || user.email === 'marcus.w@aptitude-ai.com') {
          return NextResponse.redirect(`${origin}/admin/dashboard`);
        }
        return NextResponse.redirect(`${origin}/student/dashboard`);
      } else {
        return NextResponse.redirect(`${origin}/onboarding`);
      }
    }
  }

  // Redirect to login if anything fails
  return NextResponse.redirect(`${origin}/login?error=OAuth callback failed`);
}
