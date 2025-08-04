import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import bcrypt from 'bcryptjs'
import { emailService } from '@/lib/emailService'

export async function POST(request: Request) {
  try {
    let body
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      )
    }

    const { email, password, fullName, phone } = body

    // Validate input data
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, dan nama lengkap wajib diisi' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('user')
      .select('email')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 409 }
      )
    }

    // Hash password
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    
    // Generate verification token
    const verificationToken = emailService.generateVerificationToken()
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // console.log('Starting registration process for:', email)

    // Insert new user data into 'user' table - match exact schema
    const { data: newUser, error: insertError } = await supabase
      .from('user')
      .insert({
        nama_lengkap: fullName.trim(),
        email: email.toLowerCase().trim(),
        nomor_telepon: phone?.trim() || null,
        kata_sandi: passwordHash,
        konfirmasi_kata_sandi: null, // Can be used for password reset flows
        role: 'user',
        foto_profile: null,
        status: 'pending',
        verifikasi_email: false,
        email_confirmed_at: null,
        verification_token: verificationToken,
          verification_token_expires: tokenExpiry.toISOString(),
        account_membership: 'free' // Set default membership explicitly
      })
      .select('id, nama_lengkap, email, nomor_telepon, role, verifikasi_email, status')
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: `Gagal menyimpan data user: ${insertError.message}` },
        { status: 500 }
      )
    }

    // Send verification email
    try {
      await emailService.sendVerificationEmail(
        email.toLowerCase().trim(),
        fullName.trim(),
        verificationToken
      )
      // console.log('Verification email sent successfully')
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Delete the user record if email fails
      await supabase.from('user').delete().eq('id', newUser.id)
      return NextResponse.json(
        { error: 'Gagal mengirim email verifikasi. Silakan coba lagi.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: newUser,
      needsVerification: true,
      message: 'Akun berhasil dibuat! Silakan cek email Anda untuk verifikasi.'
    })
  } catch (error: any) {
    console.error('Registration error:', error)

    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat mendaftar' },
      { status: error.status || 500 }
    )
  }
}
