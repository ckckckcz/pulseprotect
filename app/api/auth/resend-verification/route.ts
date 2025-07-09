import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { emailService } from '@/lib/emailService'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email wajib diisi' },
        { status: 400 }
      )
    }

    // Find user by email
    const { data: user, error: findError } = await supabase
      .from('user')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (findError || !user) {
      return NextResponse.json(
        { error: 'Email tidak ditemukan' },
        { status: 404 }
      )
    }

    if (user.verifikasi_email) {
      return NextResponse.json(
        { error: 'Email sudah diverifikasi' },
        { status: 400 }
      )
    }

    // Generate new verification token
    const verificationToken = emailService.generateVerificationToken()
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Update user with new token
    const { error: updateError } = await supabase
      .from('user')
      .update({
        verification_token: verificationToken,
        verification_token_expires: tokenExpiry.toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Gagal memperbarui token verifikasi' },
        { status: 500 }
      )
    }

    // Send new verification email
    await emailService.sendVerificationEmail(
      user.email,
      user.nama_lengkap,
      verificationToken
    )

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat mengirim ulang email verifikasi' },
      { status: 500 }
    )
  }
}
