import nodemailer from 'nodemailer'
import crypto from 'crypto'

// Create transporter for Mailtrap
const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "0cc02f00af54c6",
    pass: "8bd13fef97da74"
  }
})

export const emailService = {
  async sendVerificationEmail(email: string, fullName: string, verificationToken: string) {
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
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #0d9488, #14b8a6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <div style="display: inline-flex; align-items: center; margin-bottom: 20px;">
                <div style="width: 32px; height: 32px; background-color: #0d9488; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                  <div style="width: 24px; height: 24px; background-color: white; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                    <div style="width: 16px; height: 16px; background-color: #0d9488; border-radius: 2px;"></div>
                  </div>
                </div>
                <span style="font-size: 24px; font-weight: bold; color: white;">SmartCity</span>
              </div>
              <h1 style="color: white; margin: 0; font-size: 28px;">Verifikasi Email Anda</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">Halo ${fullName}!</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Terima kasih telah mendaftar di SmartCity. Untuk melengkapi pendaftaran Anda, 
                silakan verifikasi alamat email dengan mengklik tombol di bawah ini:
              </p>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="${verificationUrl}" 
                   style="display: inline-block; background-color: #0d9488; color: white; padding: 16px 32px; 
                          text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;
                          transition: background-color 0.2s;">
                  Verifikasi Email
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                Jika tombol di atas tidak berfungsi, Anda dapat menyalin dan menempelkan link berikut ke browser Anda:
              </p>
              
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; word-break: break-all; font-family: monospace; font-size: 12px; color: #374151;">
                ${verificationUrl}
              </div>
              
              <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  <strong>Catatan:</strong> Link verifikasi ini akan kedaluwarsa dalam 24 jam. 
                  Jika Anda tidak mendaftar di SmartCity, Anda dapat mengabaikan email ini.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                Email ini dikirim secara otomatis, mohon jangan membalas.
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © 2024 SmartCity. Semua hak dilindungi.
              </p>
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
  },

  async sendPasswordResetEmail(email: string, fullName: string, resetToken: string) {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://mechaminds-17.vercel.app'}/auth/reset-password?token=${resetToken}`
    
    const mailOptions = {
      from: '"SmartCity" <noreply@smartcity.com>',
      to: email,
      subject: 'Reset Password - SmartCity',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #0d9488, #14b8a6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Reset Password</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin-top: 0;">Halo ${fullName}!</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Kami menerima permintaan untuk mereset password akun SmartCity Anda. 
                Klik tombol di bawah ini untuk membuat password baru:
              </p>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="${resetUrl}" 
                   style="display: inline-block; background-color: #0d9488; color: white; padding: 16px 32px; 
                          text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px;">
                Link ini akan kedaluwarsa dalam 1 jam. Jika Anda tidak meminta reset password, 
                abaikan email ini.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    }

    try {
      const result = await transport.sendMail(mailOptions)
      return { success: true, messageId: result.messageId }
    } catch (error) {
      console.error('Failed to send password reset email:', error)
      throw new Error('Gagal mengirim email reset password')
    }
  }
}
