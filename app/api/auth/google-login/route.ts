import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const JWT_EXPIRY = '2h';
const REFRESH_EXPIRY = '7d';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { googleUserInfo, fullName, phone, avatarUrl } = body;
    
    if (!googleUserInfo?.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const { data: existingUser, error: findError } = await supabase
      .from('user')
      .select('*')
      .eq('email', googleUserInfo.email.toLowerCase())
      .maybeSingle();
      
    if (findError) {
      console.error('Error finding user:', findError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    
    let user;
    let isExistingUser = false;
    
    if (existingUser) {
      // User exists - update last login
      isExistingUser = true;
      user = existingUser;
      
      // Update last login timestamp if needed
      // (Optional: add this field to your user table)
    } else {
      // Create new user
      if (!fullName && !googleUserInfo.name) {
        return NextResponse.json(
          { error: 'Nama lengkap wajib diisi' },
          { status: 400 }
        );
      }
      
      // Generate random password for Google users
      const randomPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      const { data: newUser, error: createError } = await supabase
        .from('user')
        .insert({
          email: googleUserInfo.email.toLowerCase(),
          nama_lengkap: fullName || googleUserInfo.name,
          nomor_telepon: phone || null,
          kata_sandi: hashedPassword,
          verifikasi_email: true, // Google accounts are verified
          email_confirmed_at: new Date().toISOString(),
          status: 'success',
          role: 'user',
          account_membership: 'free',
          foto_profile: avatarUrl || googleUserInfo.picture || null,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
      
      user = newUser;
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role || 'user',
        account_membership: user.account_membership || 'free'
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

    // Filter out sensitive data before returning
    const { 
      kata_sandi, 
      konfirmasi_kata_sandi,
      verification_token,
      verification_token_expires,
      reset_password_token,
      reset_password_expires,
      ...safeUser 
    } = user;

    console.log(`Google login successful for user ${user.id} (${user.email})`);
    
    return NextResponse.json({
      success: true,
      user: safeUser,
      accessToken,
      refreshToken,
      isExistingUser
    });
    
  } catch (error: any) {
    console.error('Google login error:', error);
    return NextResponse.json(
      { error: error.message || 'Authentication failed' }, 
      { status: 500 }
    );
  }
}