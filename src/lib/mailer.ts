import nodemailer from "nodemailer";

interface WinnerEmailOptions {
  to: string;
  fullName: string;
  rank?: number;
  sessionTitle?: string;
  announcementDate?: string;
  boothLocation?: string;
}

/**
 * Returns a configured nodemailer transporter.
 * If credentials are not configured, returns null.
 */
export function getEmailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

/**
 * Sends congratulations email to a declared Bingo winner.
 */
export async function sendWinnerEmail(opts: WinnerEmailOptions): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const transporter = getEmailTransporter();
  if (!transporter) {
    return {
      success: false,
      error: "SMTP credentials not configured in environment variables (SMTP_HOST, SMTP_USER, SMTP_PASS)",
    };
  }

  const from = process.env.EMAIL_FROM || `"F2 Fintech" <${process.env.SMTP_USER}>`;
  const boothLocation = opts.boothLocation || "F2 Fintech Booth at Singapore Fintech Festival (SFF)";
  const announcementDate = opts.announcementDate || "20 November";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Congratulations - Nexus Bingo Winner!</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f8fafc; padding: 24px; margin: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: linear-gradient(180deg, #131b2e 0%, #0b0f19 100%); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
    <!-- Header Banner -->
    <tr>
      <td style="padding: 36px 32px 24px; text-align: center; background: radial-gradient(circle at center, rgba(245, 158, 11, 0.18) 0%, transparent 70%);">
        <div style="display: inline-block; padding: 8px 16px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 9999px; color: #f59e0b; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px;">
          Singapore Fintech Festival
        </div>
        <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 8px 0; letter-spacing: -0.02em;">
          🏆 Congratulations, ${opts.fullName}!
        </h1>
        <p style="color: #fcd34d; font-size: 16px; margin: 4px 0 0; font-weight: 600;">
          You are an Official Winner of the SFF Nexus Bingo Challenge!
        </p>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding: 12px 32px 28px; line-height: 1.6; color: #cbd5e1; font-size: 15px;">
        <p style="margin-top: 0;">Dear <strong>${opts.fullName}</strong>,</p>
        <p>
          We are thrilled to announce that following our review on <strong>${announcementDate}</strong>, you have been selected as an <strong>Official Winner</strong> of the <em>SFF Nexus Networking Bingo</em> presented by <strong>F2 Fintech</strong>!
        </p>
        <p>
          Your networking drive, meaningful connections made, and speed across the Singapore Fintech Festival floor stood out among hundreds of participants.
        </p>

        <!-- Prize & Booth Box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; margin: 24px 0;">
          <tr>
            <td style="padding: 20px;">
              <div style="color: #f59e0b; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
                🎁 Your Exclusive Gift Hamper
              </div>
              <div style="color: #ffffff; font-size: 15px; font-weight: 600; margin-bottom: 8px;">
                Please collect your official winner hamper at:
              </div>
              <div style="color: #94a3b8; font-size: 14px;">
                📍 <strong>${boothLocation}</strong>
              </div>
            </td>
          </tr>
        </table>

        <p style="font-size: 13px; color: #94a3b8; margin-bottom: 0;">
          Show this email or your registered email address (<code>${opts.to}</code>) at our booth to claim your gift hamper.
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 24px 32px; background: rgba(0, 0, 0, 0.3); border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center; color: #64748b; font-size: 12px;">
        <p style="margin: 0 0 6px; font-weight: 600; color: #94a3b8;">F2 Fintech &bull; SFF Nexus Networking Bingo</p>
        <p style="margin: 0;">Meet. Connect. Collaborate.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    const info = await transporter.sendMail({
      from,
      to: opts.to,
      subject: `🏆 Congratulations ${opts.fullName}! You are an SFF Nexus Bingo Winner!`,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("sendWinnerEmail error:", error);
    return { success: false, error: error?.message || "Failed to send email" };
  }
}
