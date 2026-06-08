import { env } from '@/env';
import { QueueService } from './queue.service';

export class EmailService {
  /**
   * 1. Verification Email Template
   */
  static async sendVerificationEmail(email: string, token: string) {
    const verifyUrl = `${env.APP_URL}/api/auth/verify?token=${token}`;
    const html = `
      <h1>Verify Your Email Address</h1>
      <p>Welcome to The Lucid Intellectual platform! We are thrilled to help you master your aptitude and placement preparation.</p>
      <p>Before you begin, please click the button below to confirm your email address and activate your account:</p>
      
      <div style="text-align: center;">
        <a href="${verifyUrl}" class="btn" target="_blank">Verify Email Address</a>
      </div>
      
      <p style="font-size: 12px; word-break: break-all; color: #94A3B8; margin-top: 10px;">
        Or copy and paste this link in your browser: <br>
        <a href="${verifyUrl}" style="color: #2563EB;" target="_blank">${verifyUrl}</a>
      </p>
      
      <div class="divider"></div>
      
      <p style="font-size: 12px; color: #64748B;">
        <strong>Note:</strong> This verification link will expire in <strong>24 hours</strong>.
      </p>
      
      <div class="security-note">
        If you did not create an account on our platform, you can safely ignore this email. Your email address will remain unverified and inactive.
      </div>
    `;
    return QueueService.queueEmail(email, 'Verify Your Email - The Lucid Intellectual', html);
  }

  /**
   * 2. Password Reset Email Template
   */
  static async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${env.APP_URL}/auth/reset-password?token=${token}`;
    const html = `
      <h1>Password Reset Request</h1>
      <p>We received a request to reset the password associated with your account on The Lucid Intellectual.</p>
      <p>Click the button below to secure your account and configure a new password:</p>
      
      <div style="text-align: center;">
        <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
      </div>
      
      <p style="font-size: 12px; word-break: break-all; color: #94A3B8; margin-top: 10px;">
        Or copy and paste this link in your browser: <br>
        <a href="${resetUrl}" style="color: #2563EB;" target="_blank">${resetUrl}</a>
      </p>
      
      <div class="divider"></div>
      
      <p style="font-size: 12px; color: #64748B;">
        <strong>Note:</strong> This link is valid for <strong>15 minutes</strong> only and can only be used once.
      </p>
      
      <div class="security-note">
        <strong>Security Warning:</strong> If you did not request this, please change your password immediately or contact administration.
      </div>
    `;
    return QueueService.queueEmail(email, 'Reset Your Password - The Lucid Intellectual', html);
  }

  /**
   * 3. Welcome Email Template
   */
  static async sendWelcomeEmail(email: string, name: string) {
    const dashboardUrl = `${env.APP_URL}/student/dashboard`;
    const html = `
      <h1>Welcome to the Studio, ${name}!</h1>
      <p>Your account is fully verified. You are now ready to access the premier curated workspace for aptitude and placement mastery.</p>
      <p>Here are 3 quick steps to kickstart your learning journey:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; color: #475569;">
        <tr>
          <td style="padding: 10px; width: 30px; font-weight: bold; color: #2563EB; font-size: 16px; vertical-align: top;">1.</td>
          <td style="padding: 10px; vertical-align: top;">
            <strong>Complete Onboarding Profile:</strong> Customizes your dashboard preferences and tracks target campus placement dates.
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; width: 30px; font-weight: bold; color: #2563EB; font-size: 16px; vertical-align: top;">2.</td>
          <td style="padding: 10px; vertical-align: top;">
            <strong>Explore Aptitude Domains:</strong> Delve into Quantitative, Logical Reasoning, and Verbal Ability curricula backed by expert video explanations.
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; width: 30px; font-weight: bold; color: #2563EB; font-size: 16px; vertical-align: top;">3.</td>
          <td style="padding: 10px; vertical-align: top;">
            <strong>Maintain Your Streak:</strong> Solve questions daily to earn XP, unlock badges, and rise in the institutional leaderboard.
          </td>
        </tr>
      </table>
      
      <div style="text-align: center;">
        <a href="${dashboardUrl}" class="btn" target="_blank">Enter Student Dashboard</a>
      </div>
      
      <div class="divider"></div>
      
      <p>Need support or have questions? Click the help button in your sidebar to contact our technical team.</p>
    `;
    return QueueService.queueEmail(email, 'Welcome to The Lucid Intellectual!', html);
  }

  /**
   * 4. Admin Notification Template
   */
  static async sendAdminNotification(recipientEmail: string, event: string, details: Record<string, any>) {
    const logsUrl = `${env.APP_URL}/admin/dashboard`;
    
    // Construct HTML key-value parameters
    let detailsHtml = '<table style="width: 100%; border-collapse: collapse; font-size: 12px; margin: 15px 0;">';
    for (const [key, val] of Object.entries(details)) {
      detailsHtml += `
        <tr style="border-bottom: 1px solid #F1F5F9;">
          <td style="padding: 8px 0; font-weight: bold; color: #64748B; width: 35%; text-transform: uppercase;">${key.replace(/_/g, ' ')}</td>
          <td style="padding: 8px 0; color: #0F172A; font-family: monospace;">${typeof val === 'object' ? JSON.stringify(val) : val}</td>
        </tr>
      `;
    }
    detailsHtml += '</table>';

    const html = `
      <h1 style="color: #EF4444;">System Event Alert</h1>
      <p>An administrative level event has triggered a notification check on the server registry.</p>
      
      <div style="background-color: #FFFBEB; border: 1px solid #FEF3C7; border-radius: 10px; padding: 20px; margin: 20px 0;">
        <div style="font-weight: 800; font-size: 14px; color: #B45309; text-transform: uppercase; margin-bottom: 10px;">
          Event: ${event}
        </div>
        ${detailsHtml}
      </div>
      
      <div style="text-align: center;">
        <a href="${logsUrl}" class="btn" style="background-color: #0F172A;" target="_blank">Access Command Console</a>
      </div>
      
      <div class="divider"></div>
      
      <p style="font-size: 11px; color: #94A3B8;">
        Time of incident: ${new Date().toISOString()} (UTC)<br>
        Source: Next.js API Middleware Serverless Instance
      </p>
    `;
    return QueueService.queueEmail(recipientEmail, `[ALERT] ${event} - System Notification`, html);
  }

  /**
   * 5. OTP Template
   */
  static async sendOtpEmail(email: string, code: string) {
    const html = `
      <h1>Your Verification OTP Code</h1>
      <p>Please enter the following One-Time Password (OTP) to finalize your login authorization validation:</p>
      
      <div style="text-align: center; margin: 25px 0;">
        <div style="display: inline-block; font-size: 32px; font-weight: 850; letter-spacing: 0.25em; padding: 15px 30px; background-color: #F8FAFC; border: 2px dashed #E2E8F0; border-radius: 12px; color: #2563EB; font-family: monospace;">
          ${code}
        </div>
      </div>
      
      <div class="divider"></div>
      
      <p style="font-size: 12px; color: #64748B;">
        <strong>Warning:</strong> This code is valid for <strong>5 minutes</strong> and should never be shared with anyone, including staff.
      </p>
    `;
    return QueueService.queueEmail(email, `${code} is your authentication OTP`, html);
  }

  /**
   * 6. Certificate Template
   */
  static async sendCertificateEmail(email: string, name: string, course: string, certificateUrl: string) {
    const html = `
      <h1>Congratulations on Your Certification!</h1>
      <p>Dear ${name},</p>
      <p>Outstanding effort! You have successfully cleared all assessment parameters for <strong>${course}</strong> and earned your official placement-ready certification.</p>
      
      <div style="background-color: #ECFDF5; border: 1px solid #D1FAE5; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0;">
        <div style="font-size: 40px; margin-bottom: 10px;">🎓</div>
        <h2 style="margin: 0; font-size: 18px; color: #065F46; font-weight: 800;">${course}</h2>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #059669;">Verified Curriculum Placement Ready</p>
      </div>

      <div style="text-align: center;">
        <a href="${certificateUrl}" class="btn" style="background-color: #10B981;" target="_blank">View Certificate</a>
      </div>
      
      <div class="divider"></div>
      
      <p style="font-size: 14px; line-height: 1.6; color: #475569;">This achievement is visible on your public progress profile page and has been synced with institutional recruiters.</p>
    `;
    return QueueService.queueEmail(email, `Certification Completed: ${course}`, html);
  }

  /**
   * 7. Badge Achievement Template
   */
  static async sendBadgeAchievementEmail(email: string, name: string, badgeName: string, badgeDescription: string) {
    const leaderboardUrl = `${env.APP_URL}/student/dashboard`;
    const html = `
      <h1>Achievement Unlocked!</h1>
      <p>Hey ${name},</p>
      <p>You've just earned a new milestone badge for demonstrating exceptional learning logic and speed!</p>
      
      <div style="border: 1px solid #EDE9FE; background-color: #FAF5FF; border-radius: 16px; padding: 30px; text-align: center; margin: 25px 0;">
        <div style="font-size: 50px; margin-bottom: 15px;">🏆</div>
        <h2 style="margin: 0 0 8px 0; color: #6D28D9; font-size: 20px; font-weight: 800; text-transform: uppercase;">
          ${badgeName}
        </h2>
        <p style="margin: 0; font-size: 13px; color: #7C3AED; font-weight: 500; max-width: 280px; margin: 0 auto;">
          "${badgeDescription}"
        </p>
      </div>

      <div style="text-align: center;">
        <a href="${leaderboardUrl}" class="btn" style="background-color: #7C3AED;" target="_blank">Review Leaderboard XP</a>
      </div>
      
      <div class="divider"></div>
      
      <p>Keep up the great momentum! Every badge increases your profile ranking and makes you stand out to placement filters.</p>
    `;
    return QueueService.queueEmail(email, `New Badge Earned: ${badgeName}`, html);
  }

  /**
   * 8. Announcement / Bulk Template
   */
  static async sendAnnouncementEmail(email: string, subject: string, contentHtml: string) {
    const html = `
      <h1>Important Announcement</h1>
      <div style="font-size: 14px; line-height: 1.6; color: #475569;">
        ${contentHtml}
      </div>
    `;
    return QueueService.queueEmail(email, subject, html);
  }
}
