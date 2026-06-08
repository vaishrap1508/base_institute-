import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/utils/supabase/admin';
import { EmailService } from '@/lib/services/email.service';

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json();

    // 1. Validation Checks
    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // Constraint: small letters only for email
    if (/[A-Z]/.test(email)) {
      return NextResponse.json({ 
        error: 'Registration failed: Email must be written in small letters only (no capitals).' 
      }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Password strength check
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const isLongEnough = password.length >= 8;

    if (!isLongEnough || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      return NextResponse.json({ 
        error: 'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and symbols.' 
      }, { status: 400 });
    }

    // 2. Database Checks
    const supabaseAdmin = createAdminClient();

    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 400 });
    }

    // 3. Create unverified user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password: password,
      email_confirm: false, // Must be unverified first
      user_metadata: {
        full_name: fullName
      }
    });

    if (authError || !authData.user) {
      return NextResponse.json({ 
        error: authError?.message || 'Authentication user creation failed.' 
      }, { status: 500 });
    }

    const userId = authData.user.id;

    // 4. Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .update(process.env.SUPABASE_SERVICE_ROLE_KEY || 'salt')
      .digest('hex');
      
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    // Insert verification record
    const { error: dbError } = await supabaseAdmin
      .from('email_verifications')
      .insert({
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt,
        used: false
      });

    if (dbError) {
      console.error('Error inserting email verification token:', dbError);
      // Clean up created user to allow retrying signup
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: 'Failed to generate verification session.' }, { status: 500 });
    }

    // 5. Queue verification email
    await EmailService.sendVerificationEmail(normalizedEmail, token);

    return NextResponse.json({ 
      success: true, 
      message: 'Account registered successfully! Verification email has been sent.' 
    });

  } catch (err: any) {
    console.error('Registration API Error:', err);
    return NextResponse.json({ error: err.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
