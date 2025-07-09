import crypto from "crypto";

// Server-side only email service
let nodemailer: any = null;

// Dynamically import nodemailer only on server side
if (typeof window === "undefined") {
  try {
    nodemailer = require("nodemailer");
  } catch (error) {
    console.warn("Nodemailer not available:", error);
  }
}

// Create transporter using environment variables (server-side only)
let transport: any = null;

if (nodemailer) {
  // Use environment variables for SMTP configuration
  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER || "mechaminds.team@gmail.com",
      pass: process.env.SMTP_PASS,
    },
  });
}

export const emailService = {
  async sendVerificationEmail(email: string, fullName: string, verificationToken: string) {
    // Only run on server side
    if (typeof window !== "undefined") {
      throw new Error("Email service can only be used on server side");
    }

    if (!transport) {
      throw new Error("Email transport not available");
    }

    // Use environment variable for app URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mechaminds-17.vercel.app";
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: '"MechaMinds" <no-reply@mechaminds.com>',
      to: email,
      subject: "Aktifkan Akunmu Sekarang! ⚡ – MechaMinds",
      html: `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Yuk, verifikasi email kamu!</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: sans-serif; color: #1f2937;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="padding: 20px 0; border-bottom: 1px solid #e5e7eb;">
                        <!-- Replaced SVG with PNG -->
                        <div style="margin-bottom: 24px;">
                            <img src="https://i.ibb.co/TDJ7RRnR/svgviewer-png-output.png" width="40" height="40" alt="MechaMinds Icon" style="display: block;" />
                        </div>

                        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">Halo👋🏽, ${fullName}</h1>

                        <p style="margin-bottom: 16px; font-weight: 600;">
                            Kita cuma mau pastiin aja nih, beneran kamu yang daftar di MechaMinds? Klik tombol di bawah buat verifikasi email kamu, biar akunmu aman dan bisa langsung nikmatin semua fitur kece dari kita.
                            Yuk, jangan ditunda — tinggal satu klik aja kok! 😉
                        </p>

                        <div style="margin: 32px 0;">
                            <a href="${verificationUrl}" style="display: inline-block; font-weight: 600; background-color: #0d9488; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none;">Verifikasi Email Aku ✋🏻</a>
                        </div>

                        <p style="margin-bottom: 8px;">
                            Cheers,<br />
                            Tim MechaMinds
                        </p>
                    </div>

                    <div style="padding: 20px 0; border-bottom: 1px solid #e5e7eb;">
                        <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">Ada yang bikin bingung?</h2>
                        <p>Kalau ada pertanyaan, langsung aja email kami di <a href="mailto:mechaminds.team@gmail.com" style="color: #0d9488;">mechaminds.team@gmail.com</a>. Kami siap bantu kok!</p>
                    </div>

                    <div style="padding: 20px 0; text-align: center; color: #6b7280;">
                        <!-- Replaced SVG with PNG -->
                        <div style="margin-bottom: 12px;">
                            <img src="https://i.ibb.co/TDJ7RRnR/svgviewer-png-output.png" width="30" height="30" alt="MechaMinds Icon" style="display: block; margin: 0 auto;" />
                        </div>
                        <p>Berkat kamu, komunitas ini makin hidup. Terima kasih ya, udah bareng-bareng sama MechaMinds!</p>
                    </div>
                </div>
            </body>
        </html>

      `,
    };

    try {
      console.log("Attempting to send verification email to:", email);
      const result = await transport.sendMail(mailOptions);
      console.log("Verification email sent:", result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("Failed to send verification email:", error);
      throw new Error("Gagal mengirim email verifikasi");
    }
  },

  generateVerificationToken() {
    return crypto.randomBytes(32).toString("hex");
  },
};
