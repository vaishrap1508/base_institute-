import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST() {
  try {
    const supabaseAdmin = createAdminClient();
    const testId = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Insert a test entry into email_logs using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin.from('email_logs').insert([
      {
        recipient: `realtime-ping-${testId}@example.com`,
        subject: `Realtime Health Test Ping #${testId}`,
        status: 'sent',
        provider: 'resend',
        sent_at: new Date().toISOString()
      }
    ]).select();

    if (error) {
      console.error('Ping DB Insert Error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Ping sent to database', data });
  } catch (err: any) {
    console.error('Ping DB Server Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
