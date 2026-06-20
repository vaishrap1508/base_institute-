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
        error: 'Reset failed: Email must be written in small letters only.' 
      }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const supabaseAdmin = createAdminClient();

    // 1. Look up profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    // 2. Generic success response (Never reveal if email exists)
    const successResponse = NextResponse.json({ 
      success: true, 
      message: 'A password reset link has been dispatched to your email address if it is registered in our platform.' 
    });

    if (!profile) {
      // Return success even if email does not exist to prevent enumeration attacks
      return successResponse;
    }

    // 3. Generate reset token (15 minute validity)
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .update(process.env.SUPABASE_SERVICE_ROLE_KEY || 'salt')
      .digest('hex');

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    // Save token to DB
    const { error: dbError } = await supabaseAdmin
      .from('password_resets')
      .insert({
        user_id: profile.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
        used: false
      });

    if (dbError) {
      console.error('Error saving password reset token:', dbError);
      // Fail silently or return success since we want to protect the route integrity
      return successResponse;
    }

    // 4. Queue reset email
    await EmailService.sendPasswordResetEmail(normalizedEmail, token);

    return successResponse;

  } catch (err: any) {
    console.error('Forgot Password API Error:', err);
    // Generic response even on error to safeguard route endpoints
    return NextResponse.json({ error: 'An unexpected incident occurred while processing recovery pathway.' }, { status: 500 });
  }
}
