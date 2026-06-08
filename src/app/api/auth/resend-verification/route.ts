import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/utils/supabase/admin';
import { EmailService } from '@/lib/services/email.service';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    // Email strict validation (small letters only)
    if (/[A-Z]/.test(email)) {
      return NextResponse.json({ 
        error: 'Request failed: Email must be written in small letters only.' 
      }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const supabaseAdmin = createAdminClient();

    // 1. Look up profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, email_verified')
      .eq('email', normalizedEmail)
      .maybeSingle();

    // 2. Generic success response (Never reveal if email exists or is already verified)
    const successResponse = NextResponse.json({ 
      success: true, 
      message: 'If the account exists and is unverified, a verification link has been sent.' 
    });

    if (!profile) {
      return successResponse;
    }

    if (profile.email_verified) {
      return successResponse;
    }

    // 3. Rate limiting check (2 minutes)
    const { data: lastVerification } = await supabaseAdmin
      .from('email_verifications')
      .select('created_at')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastVerification) {
      const lastCreatedTime = new Date(lastVerification.created_at).getTime();
      const timeElapsed = Date.now() - lastCreatedTime;
      const rateLimitWindow = 2 * 60 * 1000; // 2 minutes

      if (timeElapsed < rateLimitWindow) {
        const secondsLeft = Math.ceil((rateLimitWindow - timeElapsed) / 1000);
        return NextResponse.json({ 
          error: `Please wait ${secondsLeft} seconds before requesting another verification link.` 
        }, { status: 429 });
      }
    }

    // 4. Generate new token (24 hour validity)
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .update(process.env.SUPABASE_SERVICE_ROLE_KEY || 'salt')
      .digest('hex');

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    // Insert new token
    const { error: dbError } = await supabaseAdmin
      .from('email_verifications')
      .insert({
        user_id: profile.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
        used: false
      });

    if (dbError) {
      console.error('Error inserting resend verification token:', dbError);
      return successResponse;
    }

    // 5. Queue verification email
    await EmailService.sendVerificationEmail(normalizedEmail, token);

    return successResponse;

  } catch (err: any) {
    console.error('Resend Verification API Error:', err);
    return NextResponse.json({ error: 'An unexpected incident occurred while processing verification resend.' }, { status: 500 });
  }
}
