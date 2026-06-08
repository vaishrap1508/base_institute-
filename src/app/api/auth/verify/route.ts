import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/utils/supabase/admin';
import { EmailService } from '@/lib/services/email.service';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(`${origin}/login?error=Verification token is missing`);
  }

  try {
    const supabaseAdmin = createAdminClient();
    
    // Hash the token to compare with DB
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .update(process.env.SUPABASE_SERVICE_ROLE_KEY || 'salt')
      .digest('hex');

    // 1. Look up verification session
    const { data: verification, error: fetchError } = await supabaseAdmin
      .from('email_verifications')
      .select('*')
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (fetchError || !verification) {
      return NextResponse.redirect(`${origin}/login?error=Invalid or non-existent verification token`);
    }

    // 2. Validate expiration and status
    if (verification.used) {
      return NextResponse.redirect(`${origin}/login?error=Verification token has already been used`);
    }

    const expiresAt = new Date(verification.expires_at).getTime();
    if (expiresAt < Date.now()) {
      return NextResponse.redirect(`${origin}/login?error=Verification link has expired. Please sign in and request a new link.`);
    }

    // 3. Update database states
    // A. Mark token as used
    await supabaseAdmin
      .from('email_verifications')
      .update({ used: true })
      .eq('id', verification.id);

    // B. Mark profile as email_verified = true
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ email_verified: true })
      .eq('id', verification.user_id)
      .select('full_name, email')
      .maybeSingle();

    if (profileError || !profile) {
      console.error('Error updating profile verification status:', profileError);
      return NextResponse.redirect(`${origin}/login?error=Failed to update user profile verification`);
    }

    // C. Confirm email inside Supabase Auth
    const { error: authConfirmError } = await supabaseAdmin.auth.admin.updateUserById(
      verification.user_id,
      { email_confirm: true }
    );

    if (authConfirmError) {
      console.error('Error confirming user in auth.users:', authConfirmError);
      // Non-blocking fallback: profiles is updated, so we proceed, but we log the incident
    }

    // 4. Send Welcome Email
    await EmailService.sendWelcomeEmail(profile.email, profile.full_name || 'Student');

    // 5. Redirect to login with success notice
    return NextResponse.redirect(`${origin}/login?verified=true`);

  } catch (err: any) {
    console.error('Verification Callback Route Error:', err);
    return NextResponse.redirect(`${origin}/login?error=An unexpected error occurred during email verification`);
  }
}
