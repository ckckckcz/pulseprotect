import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';
import { corsHeaders, applyCorsHeaders } from '@/lib/cors';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return applyCorsHeaders(
        NextResponse.json(
          { error: 'Email dan password wajib diisi' },
          { status: 400 }
        )
      );
    }

    // Find user by email
    const { data: user, error } = await supabase
      .from('user')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (error || !user) {
      return applyCorsHeaders(
        NextResponse.json(
          { error: 'Email atau password salah' },
          { status: 401 }
        )
      );
    }

    // Check if email is verified
    if (user.verifikasi_email === false) {
      return applyCorsHeaders(
        NextResponse.json(
          { error: 'Email belum diverifikasi. Silakan cek email Anda untuk link verifikasi.' },
          { status: 401 }
        )
      );
    }

    // Verify password
    let isValidPassword = false;
    try {
      if (!user.kata_sandi) {
        throw new Error('User has no password hash stored');
      }
      isValidPassword = await bcrypt.compare(password, user.kata_sandi);
    } catch (bcryptError) {
      console.error('Password comparison error:', bcryptError);
      return applyCorsHeaders(
        NextResponse.json(
          { error: 'Error validasi kredensial' },
          { status: 500 }
        )
      );
    }

    if (!isValidPassword) {
      return applyCorsHeaders(
        NextResponse.json(
          { error: 'Email atau password salah' },
          { status: 401 }
        )
      );
    }

    // Get additional profile data based on role
    if (user.role === 'dokter' || user.role === 'admin') {
      try {
        const table = user.role === 'dokter' ? 'dokter' : 'admin';
        const { data: profileData } = await supabase
          .from(table)
          .select('*')
          .eq('email', email)
          .single();
          
        if (profileData) {
          user.profile = profileData;
        }
      } catch (profileError) {
        console.error(`Error fetching ${user.role} profile:`, profileError);
        // Continue - we can still return the user without profile data
      }
    }

    // Return user data without sensitive fields
    const { 
      kata_sandi, 
      konfirmasi_kata_sandi, 
      verification_token, 
      verification_token_expires, 
      reset_password_token,
      reset_password_expires,
      reset_password_status,
      ...userWithoutPassword 
    } = user;

    // Success - return the user
    return applyCorsHeaders(
      NextResponse.json({
        success: true,
        user: userWithoutPassword
      })
    );
  } catch (error: any) {
    console.error('Login API error:', error);
    return applyCorsHeaders(
      NextResponse.json(
        { error: error.message || 'Terjadi kesalahan saat login' },
        { status: 500 }
      )
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
