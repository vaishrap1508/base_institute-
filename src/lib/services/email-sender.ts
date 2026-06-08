import { env } from '@/env';

// Helper to generate the standard premium wrapper for all HTML email templates
export function getEmailWrapper(contentHtml: string, previewText: string) {
  const primaryColor = '#2563EB';
  const textColor = '#0F172A';
  const secondaryTextColor = '#475569';
  const bgColor = '#F8FAFC';
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>The Lucid Intellectual</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: ${bgColor};
          color: ${textColor};
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .card {
          background-color: #ffffff;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(15, 23, 42, 0.05), 0 10px 15px rgba(15, 23, 42, 0.03);
          border: 1px solid #E2E8F0;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          display: inline-block;
          padding: 10px 18px;
          background-color: ${primaryColor};
          color: #ffffff !important;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-radius: 8px;
          font-size: 14px;
          text-decoration: none;
        }
        .logo-sub {
          display: block;
          font-size: 9px;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          font-weight: 700;
          margin-top: 6px;
        }
        .divider {
          height: 1px;
          background-color: #E2E8F0;
          margin: 30px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 11px;
          color: #94A3B8;
          line-height: 1.6;
        }
        .btn {
          display: inline-block;
          background-color: ${primaryColor};
          color: #ffffff !important;
          padding: 14px 28px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 13px;
          text-decoration: none;
          text-align: center;
          margin: 20px 0;
        }
        h1 {
          font-size: 20px;
          font-weight: 700;
          margin-top: 0;
          margin-bottom: 15px;
          color: ${textColor};
          letter-spacing: -0.02em;
        }
        p {
          font-size: 14px;
          line-height: 1.6;
          color: ${secondaryTextColor};
          margin-top: 0;
          margin-bottom: 15px;
        }
        .security-note {
          background-color: #F1F5F9;
          border-radius: 8px;
          padding: 15px;
          font-size: 12px;
          color: #64748B;
          margin-top: 25px;
        }
      </style>
    </head>
    <body>
      <!--[if !mso]><!-->
      <span style="display:none !important; visibility:hidden; mso-hide:all; font-size:1px; color:#ffffff; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
        ${previewText}
      </span>
      <!--<![endif]-->
      
      <div class="container">
        <div class="header">
          <a href="${env.APP_URL}" class="logo" target="_blank">THE LUCID INTELLECTUAL</a>
          <span class="logo-sub">Aptitude Arena</span>
        </div>
        
        <div class="card">
          ${contentHtml}
        </div>
        
        <div class="footer">
          &copy; ${new Date().getFullYear()} The Lucid Intellectual. All rights reserved.<br>
          This is an automated system communication. Please do not reply to this email.<br>
          Secured Sandbox Staging Protocol v2.4
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Base method to dispatch email via Resend API
 */
export async function sendEmailRaw(to: string, subject: string, html: string, previewText: string): Promise<{ success: boolean; error?: string; id?: string }> {
  const apiKey = process.env.RESEND_API_KEY || env.RESEND_API_KEY;
  const fromAddress = process.env.EMAIL_FROM || env.EMAIL_FROM || 'onboarding@resend.dev';
  
  const fullHtml = getEmailWrapper(html, previewText);
  
  if (!apiKey) {
    console.log('--- [MOCK EMAIL DELIVERED] ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`From: ${fromAddress}`);
    console.log(`Content length: ${fullHtml.length} bytes`);
    
    // Extract and display all URLs/Links for easy developer testing
    const hrefRegex = /href="([^"]+)"/g;
    const links: string[] = [];
    let match;
    while ((match = hrefRegex.exec(html)) !== null) {
      links.push(match[1]);
    }
    
    if (links.length > 0) {
      console.log('Extracted Action Links:');
      links.forEach((link) => console.log(`  -> ${link}`));
    }
    
    console.log('------------------------------');
    return { success: true, id: `mock-id-${Date.now()}` };
  }
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `The Lucid Intellectual <${fromAddress}>`,
        to: [to],
        subject: subject,
        html: fullHtml,
      }),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      return { 
        success: false, 
        error: responseData.message || `Resend error code ${response.status}` 
      };
    }
    
    return { success: true, id: responseData.id };
  } catch (err: any) {
    return { 
      success: false, 
      error: err.message || 'Unknown network error' 
    };
  }
}
