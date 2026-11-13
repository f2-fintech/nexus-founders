import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { getEmailTransporter } from "@/lib/mailer";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as any)?.id;

    if (!currentUserId) {
      return NextResponse.json({ success: false, error: "Please log in first" }, { status: 401 });
    }

    const { recipientId, subject, message } = await req.json();

    if (!recipientId || !subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: "Recipient, subject, and message are required." },
        { status: 400 }
      );
    }

    const [sender, recipient] = await Promise.all([
      User.findById(currentUserId),
      User.findById(recipientId),
    ]);

    if (!sender) {
      return NextResponse.json({ success: false, error: "Sender profile not found" }, { status: 404 });
    }
    if (!recipient || !recipient.email) {
      return NextResponse.json({ success: false, error: "Recipient banker email not found" }, { status: 404 });
    }

    const transporter = getEmailTransporter();
    if (!transporter) {
      return NextResponse.json(
        { success: false, error: "SMTP mail server is not configured in environment variables" },
        { status: 500 }
      );
    }

    const senderBank = sender.bankerProfile?.bankName || "Nexus Bankers Connect Partner";
    const senderTitle = sender.bankerProfile?.designation || "Banking Professional";
    const recipientName = recipient.name || "Fellow Banker";
    const recipientBank = recipient.bankerProfile?.bankName || "Partner Institution";

    const formattedSubject = `🤝 [Bankers Connect] ${subject.trim()}`;
    const fromAddress = process.env.EMAIL_FROM || `"Nexus Bankers Connect" <${process.env.SMTP_USER}>`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject.trim()}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1329; color: #f8fafc; padding: 24px; margin: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 15px 40px rgba(15, 23, 42, 0.15);">
    <!-- Header -->
    <tr>
      <td style="padding: 28px 32px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff;">
        <div style="display: inline-block; padding: 4px 12px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 9999px; color: #10b981; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 10px;">
          Nexus Bankers Connect &bull; Direct Message
        </div>
        <h2 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0 0 6px; letter-spacing: -0.01em;">
          New Communication from ${sender.name}
        </h2>
        <p style="color: #94a3b8; font-size: 13px; margin: 0;">
          ${senderTitle} at <strong>${senderBank}</strong>
        </p>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding: 28px 32px; color: #1e293b; font-size: 14px; line-height: 1.65;">
        <p style="margin-top: 0; color: #475569;">
          Dear <strong>${recipientName}</strong> (${recipientBank}),
        </p>
        <p style="color: #334155;">
          <strong>${sender.name}</strong> has reached out to connect with you via <em>Nexus Bankers Connect</em>:
        </p>

        <!-- Message Box -->
        <div style="background: #f8fafc; border-left: 4px solid #0284c7; border-radius: 4px 8px 8px 4px; padding: 18px 20px; margin: 20px 0; font-size: 14px; color: #0f172a; white-space: pre-wrap;">${message.trim()}</div>

        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 14px 16px; margin-top: 24px;">
          <div style="font-size: 12px; font-weight: 700; color: #1d4ed8; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.04em;">
            💡 Quick Reply Instructions:
          </div>
          <div style="font-size: 13px; color: #1e3a8a; line-height: 1.5;">
            You can directly <strong>reply to this email</strong> to respond to ${sender.name} at <a href="mailto:${sender.email}" style="color: #0284c7; text-decoration: underline;">${sender.email}</a>, or connect in person at <strong>Hall 5 - Booth 5K33-B</strong> (F2 Fintech).
          </div>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 20px 32px; background: #f1f5f9; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px;">
        <p style="margin: 0 0 4px; font-weight: 600; color: #334155;">Nexus Founders &bull; Bankers Connect &bull; Hall 5 - Booth 5K33-B</p>
        <p style="margin: 0;">F2 Fintech &bull; Institutional Synergies, Capital & Venture Banking Network</p>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const info = await transporter.sendMail({
      from: fromAddress,
      to: recipient.email,
      replyTo: sender.email,
      subject: formattedSubject,
      html,
    });

    return NextResponse.json({
      success: true,
      message: `Email successfully delivered to ${recipient.name} (${recipient.email})`,
      messageId: info.messageId,
    });
  } catch (err: any) {
    console.error("Banker email send error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to dispatch email" },
      { status: 500 }
    );
  }
}
