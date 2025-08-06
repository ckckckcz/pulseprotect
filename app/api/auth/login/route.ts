import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const JWT_EXPIRY = '2h'; // 2 hours
const REFRESH_EXPIRY = '7d'; // 7 days

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const { data: user, error } = await supabase
      .from('user')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error) {
      console.error('Error fetching user:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.kata_sandi);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (user.verifikasi_email === false) {
      return NextResponse.json(
        {
          error: 'Email not verified. Please check your email for verification link.',
        },
        { status: 403 }
      );
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role || 'user',
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    const refreshToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        tokenType: 'refresh',
      },
      JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_EXPIRY }
    );

    // Get profile data if doctor or admin
    let profileData = null;
    if (user.role === 'dokter' || user.role === 'admin') {
      const table = user.role === 'dokter' ? 'dokter' : 'admin';
      const { data: profile } = await supabase
        .from(table)
        .select('*')
        .eq('email', email)
        .single();

      if (profile) {
        profileData = profile;
      }
    }

    // Filter out sensitive fields
    const {
      kata_sandi,
      konfirmasi_kata_sandi,
      verification_token,
      verification_token_expires,
      reset_password_token,
      reset_password_expires,
      ...safeUser
    } = user;

    // Add profile data if available
    if (profileData) {
      safeUser.profile = profileData;
    }

    console.log(`User ${user.id} (${user.email}) logged in successfully`);

    return NextResponse.json({
      user: safeUser,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
