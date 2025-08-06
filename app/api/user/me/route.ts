import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.error('Invalid token:', error);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    
    if (!decoded || typeof decoded !== 'object' || !decoded.userId || !decoded.email) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }
    
    // Get user data
    const { data: user, error } = await supabase
      .from('user')
      .select('*')
      .eq('id', decoded.userId)
      .single();
      
    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get profile data if doctor or admin
    let profileData = null;
    if (user.role === 'dokter' || user.role === 'admin') {
      const table = user.role === 'dokter' ? 'dokter' : 'admin';
      const { data: profile } = await supabase
        .from(table)
        .select('*')
        .eq('email', user.email)
        .single();
        
      if (profile) {
        profileData = profile;
      }
    }
    
    // Filter out sensitive data
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
    
    return NextResponse.json({ user: safeUser });
    
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}
