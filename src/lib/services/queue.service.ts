import { createAdminClient } from '@/utils/supabase/admin';
import { sendEmailRaw } from './email-sender';

export class QueueService {
  /**
   * Queues an email by inserting a pending log into email_logs
   * and triggers background queue processing.
   */
  static async queueEmail(recipient: string, subject: string, bodyHtml: string) {
    try {
      const supabaseAdmin = createAdminClient();
      
      const { data, error } = await supabaseAdmin
        .from('email_logs')
        .insert({
          recipient,
          subject,
          body_html: bodyHtml,
          status: 'pending',
          attempts: 0
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Fire background processing without awaiting it
      this.processQueue().catch((err) => {
        console.error('Background queue processing error:', err);
      });
      
      return { success: true, logId: data.id };
    } catch (err: any) {
      console.error('Error queuing email:', err);
      // Fallback: If DB insert fails (e.g. offline sandbox or missing DB tables), attempt to send directly
      console.warn('Falling back to direct email sending.');
      return sendEmailRaw(recipient, subject, bodyHtml, subject);
    }
  }

  /**
   * Processes all pending emails (with retry limit of 3)
   */
  static async processQueue() {
    let supabaseAdmin;
    try {
      supabaseAdmin = createAdminClient();
    } catch (err) {
      // If service role is not defined (local offline sandbox), we log to console
      console.warn('Supabase Admin Client not available. Skipping queue processor.');
      return { success: false, reason: 'Admin client unavailable' };
    }

    try {
      // 1. Fetch pending emails with fewer than 3 attempts
      const { data: pendingLogs, error: fetchError } = await supabaseAdmin
        .from('email_logs')
        .select('*')
        .eq('status', 'pending')
        .lt('attempts', 3)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      if (!pendingLogs || pendingLogs.length === 0) {
        return { success: true, processedCount: 0 };
      }

      console.log(`Processing ${pendingLogs.length} pending email logs...`);

      // 2. Process each email sequentially or in parallel
      const jobs = pendingLogs.map(async (log) => {
        const nextAttempt = log.attempts + 1;
        
        // Update to show we are attempting it
        await supabaseAdmin
          .from('email_logs')
          .update({
            attempts: nextAttempt,
            last_attempt_at: new Date().toISOString()
          })
          .eq('id', log.id);

        // Send email via Resend
        const result = await sendEmailRaw(
          log.recipient,
          log.subject,
          log.body_html,
          log.subject
        );

        if (result.success) {
          // Success
          await supabaseAdmin
            .from('email_logs')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
              error_message: null
            })
            .eq('id', log.id);
        } else {
          // Failure
          const isFinalFailure = nextAttempt >= 3;
          await supabaseAdmin
            .from('email_logs')
            .update({
              status: isFinalFailure ? 'failed' : 'pending',
              error_message: result.error || 'Unknown sending failure'
            })
            .eq('id', log.id);
        }
      });

      await Promise.all(jobs);
      return { success: true, processedCount: pendingLogs.length };
    } catch (err: any) {
      console.error('Error in processQueue:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Retries a specific failed email log
   */
  static async retryFailedEmail(logId: string) {
    try {
      const supabaseAdmin = createAdminClient();
      
      const { error } = await supabaseAdmin
        .from('email_logs')
        .update({
          status: 'pending',
          attempts: 0,
          error_message: null,
          last_attempt_at: null
        })
        .eq('id', logId);
        
      if (error) throw error;
      
      // Fire background processing
      this.processQueue().catch((err) => {
        console.error('Background retry processing error:', err);
      });
      
      return { success: true };
    } catch (err: any) {
      console.error('Error retrying email:', err);
      return { success: false, error: err.message };
    }
  }
}
