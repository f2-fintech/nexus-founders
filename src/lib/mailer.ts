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
  const rawHost = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!rawHost || !user || !pass) {
    return null;
  }

  // For smtpout.secureserver.net, direct IPv4 ensures compatibility with Windows c-ares DNS resolver
  const host = rawHost === "smtpout.secureserver.net" ? "92.204.80.21" : rawHost;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: {
      servername: rawHost,
      rejectUnauthorized: false,
    },
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
  const boothLocation = opts.boothLocation || "Hall 5 - Booth 5K33-B (F2 Fintech, Singapore EXPO)";
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
        <p style="margin: 0 0 6px; font-weight: 600; color: #94a3b8;">F2 Fintech &bull; Hall 5 - Booth 5K33-B &bull; SFF Nexus Networking Bingo</p>
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

export interface MatchIntroEmailParty {
  fullName: string;
  email: string;
  companyName: string;
  designation: string;
  phone?: string;
  city?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  aboutCompany?: string;
  offeringsDescription?: string;
  usps?: string[];
  lookingForDetails?: string;
}

export interface MatchIntroEmailOptions {
  seeker: MatchIntroEmailParty;
  provider: MatchIntroEmailParty;
  matchedCategory: string;
  matchPercentage: number;
  matchReason?: string;
  customNotes?: string;
}

/**
 * Sends a high-touch, executive introduction email to both matched parties.
 * Configured so both participants are on the thread and can Reply-All immediately.
 */
export async function sendMatchIntroductionEmail(
  opts: MatchIntroEmailOptions
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const transporter = getEmailTransporter();
  if (!transporter) {
    return {
      success: false,
      error: "SMTP credentials not configured in environment variables",
    };
  }

  const from = process.env.EMAIL_FROM || `"F2 Fintech Partnerships" <${process.env.SMTP_USER}>`;
  const { seeker, provider, matchedCategory, matchPercentage, matchReason, customNotes } = opts;

  const subject = `🤝 SFF Match-Point Introduction: ${seeker.companyName} & ${provider.companyName} [${matchPercentage}% Synergy Match]`;

  const recipients = [seeker.email.trim(), provider.email.trim()].filter(Boolean);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SFF Match-Point Business Introduction</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #1e293b; padding: 24px 12px; margin: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 650px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px; overflow: hidden; box-shadow: 0 12px 36px rgba(15, 23, 42, 0.08);">
    
    <!-- Top Header Banner -->
    <tr>
      <td style="padding: 32px 32px 24px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <div style="display: inline-block; padding: 6px 14px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 9999px; color: #34d399; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px;">
                Singapore FinTech Festival 2026 &bull; Hall 5 - Booth 5K33-B &bull; Executive Match-Point
              </div>
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 6px; letter-spacing: -0.02em;">
                Executive Business Introduction
              </h1>
              <p style="color: #94a3b8; font-size: 14px; margin: 0; line-height: 1.5;">
                Connecting <strong>${seeker.companyName}</strong> and <strong>${provider.companyName}</strong>
              </p>
            </td>
            <td align="right" valign="top">
              <div style="background: rgba(16, 185, 129, 0.2); border: 1.5px solid #10b981; border-radius: 12px; padding: 8px 14px; text-align: center;">
                <div style="font-size: 20px; font-weight: 800; color: #10b981;">
                  ${matchPercentage}%
                </div>
                <div style="font-size: 10px; font-weight: 700; color: #a7f3d0; text-transform: uppercase; letter-spacing: 0.05em;">
                  Synergy Match
                </div>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Intro Greeting -->
    <tr>
      <td style="padding: 24px 32px 16px; font-size: 14px; line-height: 1.6; color: #334155;">
        <p style="margin-top: 0;">Dear <strong>${seeker.fullName}</strong> and <strong>${provider.fullName}</strong>,</p>
        <p>
          Following your participation and profile registration with <strong>SFF Match-Point</strong> (curated by F2 Fintech), our matchmaking system has identified a strong strategic alignment between your business capabilities and current objectives.
        </p>

        <!-- Category & Alignment Pill -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px 18px; margin: 16px 0;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; margin-bottom: 4px;">
            Targeted Synergy Category
          </div>
          <div style="font-size: 15px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px;">
            <span style="color: #059669;">&bull;</span> ${matchedCategory}
          </div>
          ${matchReason ? `<div style="font-size: 13px; color: #475569; margin-top: 4px; font-style: italic;">Reason: ${matchReason}</div>` : ""}
          ${customNotes ? `<div style="font-size: 13px; color: #0284c7; margin-top: 6px; font-weight: 600;">Matchmaker Note: &ldquo;${customNotes}&rdquo;</div>` : ""}
        </div>
      </td>
    </tr>

    <!-- Company Profiles Side-by-Side or Stacked -->
    <tr>
      <td style="padding: 0 32px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
          <!-- Company A -->
          <tr>
            <td style="padding: 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 12px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="background: #e0f2fe; color: #0369a1; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; text-transform: uppercase;">
                      Organization A
                    </span>
                    <h3 style="margin: 6px 0 2px; font-size: 16px; font-weight: 700; color: #0f172a;">
                      ${seeker.companyName}
                    </h3>
                    <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;">
                      <strong>${seeker.fullName}</strong> &bull; ${seeker.designation} ${seeker.city ? `(${seeker.city})` : ""}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #334155; line-height: 1.5; padding: 6px 0;">
                    <div style="font-weight: 600; color: #475569; font-size: 12px; margin-bottom: 2px;">About & Capabilities:</div>
                    ${seeker.aboutCompany || "Not specified"}
                  </td>
                </tr>
                ${seeker.lookingForDetails ? `
                <tr>
                  <td style="font-size: 13px; color: #1e293b; background: #f8fafc; padding: 8px 12px; border-radius: 8px; margin-top: 6px;">
                    <strong style="color: #6366f1;">Current Objective / Need:</strong> &ldquo;${seeker.lookingForDetails}&rdquo;
                  </td>
                </tr>
                ` : ""}
                <tr>
                  <td style="padding-top: 10px; font-size: 12px; color: #64748b;">
                    <strong>Direct Contacts:</strong>
                    <a href="mailto:${seeker.email}" style="color: #0284c7; text-decoration: none; margin-right: 12px;">${seeker.email}</a>
                    ${seeker.phone ? `<span style="margin-right: 12px;">&bull; Tel: ${seeker.phone}</span>` : ""}
                    ${seeker.linkedinUrl ? `<a href="${seeker.linkedinUrl}" style="color: #0284c7; text-decoration: none;">&bull; LinkedIn</a>` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td height="12"></td></tr>

          <!-- Company B -->
          <tr>
            <td style="padding: 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="background: #ecfdf5; color: #047857; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; text-transform: uppercase;">
                      Organization B
                    </span>
                    <h3 style="margin: 6px 0 2px; font-size: 16px; font-weight: 700; color: #0f172a;">
                      ${provider.companyName}
                    </h3>
                    <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;">
                      <strong>${provider.fullName}</strong> &bull; ${provider.designation} ${provider.city ? `(${provider.city})` : ""}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #334155; line-height: 1.5; padding: 6px 0;">
                    <div style="font-weight: 600; color: #475569; font-size: 12px; margin-bottom: 2px;">About & Offerings:</div>
                    ${provider.aboutCompany || provider.offeringsDescription || "Not specified"}
                  </td>
                </tr>
                ${provider.usps && provider.usps.length > 0 ? `
                <tr>
                  <td style="font-size: 12px; color: #475569; padding-top: 4px;">
                    <strong>Key Highlights:</strong> ${provider.usps.slice(0, 4).join(" &bull; ")}
                  </td>
                </tr>
                ` : ""}
                <tr>
                  <td style="padding-top: 10px; font-size: 12px; color: #64748b;">
                    <strong>Direct Contacts:</strong>
                    <a href="mailto:${provider.email}" style="color: #0284c7; text-decoration: none; margin-right: 12px;">${provider.email}</a>
                    ${provider.phone ? `<span style="margin-right: 12px;">&bull; Tel: ${provider.phone}</span>` : ""}
                    ${provider.linkedinUrl ? `<a href="${provider.linkedinUrl}" style="color: #0284c7; text-decoration: none;">&bull; LinkedIn</a>` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Recommended Next Steps -->
    <tr>
      <td style="padding: 0 32px 24px;">
        <div style="background: #f1f5f9; border-left: 4px solid #0284c7; border-radius: 0 8px 8px 0; padding: 14px 18px;">
          <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">
            Recommended Next Step:
          </div>
          <div style="font-size: 13px; color: #475569; line-height: 1.5;">
            Simply <strong>hit &ldquo;Reply All&rdquo;</strong> to this email thread to introduce yourself and coordinate an informal meetup at the Singapore FinTech Festival (F2 Fintech: <strong>Hall 5 - Booth 5K33-B</strong>) or schedule a virtual discovery call.
          </div>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 24px 32px; background: #0f172a; color: #94a3b8; font-size: 12px; text-align: center; line-height: 1.6;">
        <div style="font-weight: 700; color: #ffffff; margin-bottom: 4px;">
          F2 Fintech &bull; Hall 5 - Booth 5K33-B &bull; SFF Match-Point Team
        </div>
        <div>Facilitating High-Value Partnerships across the Global FinTech Ecosystem</div>
        <div style="margin-top: 8px; color: #64748b; font-size: 11px;">
          This official introduction was generated via Singapore FinTech Festival Match-Point &bull; All details shared with verified attendee consent.
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    const info = await transporter.sendMail({
      from,
      to: recipients,
      replyTo: recipients,
      subject,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("sendMatchIntroductionEmail error:", error);
    return { success: false, error: error?.message || "Failed to dispatch introduction email" };
  }
}

