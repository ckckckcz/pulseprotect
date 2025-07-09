import crypto from 'crypto'

// Server-side only email service
let nodemailer: any = null

// Dynamically import nodemailer only on server side
if (typeof window === 'undefined') {
  try {
    nodemailer = require('nodemailer')
  } catch (error) {
    console.warn('Nodemailer not available:', error)
  }
}

// Create transporter for Mailtrap (server-side only)
let transport: any = null

if (nodemailer) {
  transport = nodemailer.createTransporter({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "0cc02f00af54c6",
      pass: "8bd13fef97da74"
    }
  })
}

export const emailService = {
  async sendVerificationEmail(email: string, fullName: string, verificationToken: string) {
    // Only run on server side
    if (typeof window !== 'undefined') {
      throw new Error('Email service can only be used on server side')
    }

    if (!transport) {
      throw new Error('Email transport not available')
    }

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://mechaminds-17.vercel.app'}/auth/verify-email?token=${verificationToken}`
    
    const mailOptions = {
      from: '"SmartCity" <noreply@smartcity.com>',
      to: email,
      subject: 'Verifikasi Email - SmartCity',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verifikasi Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #0d9488, #14b8a6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Verifikasi Email Anda</h1>
            </div>
            
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">Halo ${fullName}!</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Terima kasih telah mendaftar di SmartCity. Untuk melengkapi pendaftaran Anda, 
                silakan verifikasi alamat email dengan mengklik tombol di bawah ini:
              </p>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="${verificationUrl}" 
                   style="display: inline-block; background-color: #0d9488; color: white; padding: 16px 32px; 
                          text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Verifikasi Email
                </a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    }

    try {
      const result = await transport.sendMail(mailOptions)
      console.log('Verification email sent:', result.messageId)
      return { success: true, messageId: result.messageId }
    } catch (error) {
      console.error('Failed to send verification email:', error)
      throw new Error('Gagal mengirim email verifikasi')
    }
  },

  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex')
  }
}