import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { googleUserInfo, fullName, phone, avatarUrl } = await request.json();
    
    console.log('Google login API called with:', {
      email: googleUserInfo?.email,
      hasFullName: !!fullName,
      hasPhone: !!phone,
      hasAvatarUrl: !!avatarUrl,
      isNewUserRegistration: !!fullName
    });

    if (!googleUserInfo || !googleUserInfo.email) {
      return NextResponse.json(
        { error: 'Informasi pengguna Google tidak valid' },
        { status: 400 }
      );
    }

    const email = googleUserInfo.email.toLowerCase().trim();

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('user')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Database error checking user:', checkError);
      return NextResponse.json(
        { error: 'Terjadi kesalahan saat memeriksa pengguna' },
        { status: 500 }
      );
    }

    // If user exists, handle login
    if (existingUser) {
      console.log('Existing user found:', existingUser.email);
      
      // Check if this is actually a registration attempt for existing user
      if (fullName && fullName.trim().length > 0) {
        console.log('Registration attempt for existing user - treating as login');
      }
      
      // Update last login info
      const { error: updateError } = await supabase
        .from('user')
        .update({
          email_confirmed_at: new Date().toISOString()
        })
        .eq('id', existingUser.id);

      if (updateError) {
        console.error('Error updating user login time:', updateError);
      }

      // Return existing user data (without sensitive fields)
      const { 
        kata_sandi, 
        konfirmasi_kata_sandi, 
        verification_token, 
        verification_token_expires, 
        reset_password_token,
        reset_password_expires,
        reset_password_status,
        ...userWithoutPassword 
      } = existingUser;

      return NextResponse.json({
        success: true,
        user: userWithoutPassword,
        isExistingUser: true
      });
    }

    // For genuinely new users, require fullName
    console.log('New user detected, checking if fullName provided');
    
    if (!fullName || fullName.trim().length === 0) {
      console.log('Full name not provided for new user - requesting additional info');
      return NextResponse.json(
        { error: 'Nama lengkap wajib diisi' },
        { status: 400 }
      );
    }

    console.log('Creating new user with Google data for email:', email);

    // Create new user with Google data
    const defaultPassword = 'pulseprotect';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Use avatarUrl from form if provided, otherwise use Google picture or null
    const profilePicture = avatarUrl || googleUserInfo.picture || null;

    const userData = {
      nama_lengkap: fullName.trim(),
      email: email,
      nomor_telepon: phone?.trim() || null,
      kata_sandi: hashedPassword,
      konfirmasi_kata_sandi: hashedPassword,
      role: 'user',
      foto_profile: profilePicture,
      status: 'success',
      verifikasi_email: true, // Google emails are pre-verified
      email_confirmed_at: new Date().toISOString(),
      account_membership: 'free',
      verification_token: null,
      verification_token_expires: null
    };

    const { data: newUser, error: insertError } = await supabase
      .from('user')
      .insert([userData])
      .select()
      .single();

    if (insertError) {
      console.error('Database error creating user:', insertError);
      
      if (insertError.code === '23505') {
        console.log('Duplicate email error - checking if user was created between checks');
        
        // Try to fetch the user again in case it was created between our checks
        const { data: nowExistingUser, error: refetchError } = await supabase
          .from('user')
          .select('*')
          .eq('email', email)
          .maybeSingle();
          
        if (!refetchError && nowExistingUser) {
          console.log('User was created in the meantime, treating as existing user');
          
          const { 
            kata_sandi, 
            konfirmasi_kata_sandi, 
            verification_token, 
            verification_token_expires, 
            reset_password_token,
            reset_password_expires,
            reset_password_status,
            ...userWithoutPassword 
          } = nowExistingUser;

          return NextResponse.json({
            success: true,
            user: userWithoutPassword,
            isExistingUser: true
          });
        }
        
        return NextResponse.json(
          { error: 'Email sudah terdaftar dengan metode lain' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Gagal membuat akun pengguna' },
        { status: 500 }
      );
    }

    console.log('New user created successfully:', newUser.email);

    // Return new user data (without sensitive fields)
    const { 
      kata_sandi, 
      konfirmasi_kata_sandi, 
      verification_token, 
      verification_token_expires, 
      reset_password_token,
      reset_password_expires,
      reset_password_status,
      ...userWithoutPassword 
    } = newUser;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      isExistingUser: false
    });

  } catch (error: any) {
    console.error('Google login API error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat proses login Google' },
      { status: 500 }
    );
  }
}
