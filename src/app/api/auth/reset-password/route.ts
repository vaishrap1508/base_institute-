import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required.' }, { status: 400 });
    }

    // Password strength check
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
    const isLongEnough = newPassword.length >= 8;

    if (!isLongEnough || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      return NextResponse.json({ 
        error: 'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and symbols.' 
      }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // Hash the token to compare with DB
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .update(process.env.SUPABASE_SERVICE_ROLE_KEY || 'salt')
      .digest('hex');

    // 1. Look up token
    const { data: resetRecord, error: fetchError } = await supabaseAdmin
      .from('password_resets')
      .select('*')
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (fetchError || !resetRecord) {
      return NextResponse.json({ error: 'Invalid or expired password reset token.' }, { status: 400 });
    }

    // 2. Validate token state
    if (resetRecord.used) {
      return NextResponse.json({ error: 'This password reset link has already been used.' }, { status: 400 });
    }

    const expiresAt = new Date(resetRecord.expires_at).getTime();
    if (expiresAt < Date.now()) {
      return NextResponse.json({ error: 'The password reset link has expired (15-minute limit).' }, { status: 400 });
    }

    // 3. Update password in Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      resetRecord.user_id,
      { password: newPassword }
    );

    if (authError) {
      console.error('Supabase Auth Password Update Error:', authError);
      return NextResponse.json({ error: authError.message || 'Failed to update password.' }, { status: 500 });
    }

    // 4. Invalidate token immediately
    await supabaseAdmin
      .from('password_resets')
      .update({ used: true })
      .eq('id', resetRecord.id);

    return NextResponse.json({ 
      success: true, 
      message: 'Your password has been successfully updated. Please log in with your new credentials.' 
    });

  } catch (err: any) {
    console.error('Reset Password API Error:', err);
    return NextResponse.json({ error: err.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
