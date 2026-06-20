import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { QueueService } from '@/lib/services/queue.service';
import { EmailService } from '@/lib/services/email.service';

export async function GET(request: Request) {
  try {
    const supabaseAdmin = createAdminClient();
    
    // 1. Create a test email target
    const testRecipient = 'testing-queue@university.edu';
    console.log('Inserting verification queue item for testing...');
    
    // Queue a verification email
    const result = await EmailService.sendVerificationEmail(testRecipient, 'test-token-xyz-123');
    
    // 2. Fetch the newly queued log to verify it's in the DB
    const { data: queuedLog, error: fetchError } = await supabaseAdmin
      .from('email_logs')
      .select('*')
      .eq('recipient', testRecipient)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError || !queuedLog) {
      return NextResponse.json({ 
        success: false, 
        error: fetchError?.message || 'Queued log not found in database. Check migrations.'
      }, { status: 500 });
    }

    // 3. Process the queue to trigger sending
    console.log('Running processQueue()...');
    const processResult = await QueueService.processQueue();

    // 4. Fetch the log again to verify the status has updated
    const { data: updatedLog } = await supabaseAdmin
      .from('email_logs')
      .select('*')
      .eq('id', queuedLog.id)
      .single();

    return NextResponse.json({
      success: true,
      message: 'Email infrastructure test executed.',
      details: {
        initialQueuedId: queuedLog.id,
        initialStatus: queuedLog.status,
        attemptsCount: updatedLog?.attempts,
        finalStatus: updatedLog?.status,
        errorMessage: updatedLog?.error_message,
        processQueueOutcome: processResult
      }
    });

  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: err.message || 'An unexpected test error occurred.' 
    }, { status: 500 });
  }
}
