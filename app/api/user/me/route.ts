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
    
    // Get user data with all fields explicitly selected
    const { data: user, error } = await supabase
      .from('user')
      .select(`
        id, 
        email, 
        nama_lengkap, 
        nomor_telepon, 
        tanggal_lahir, 
        role, 
        foto_profile, 
        account_membership, 
        status, 
        verifikasi_email, 
        email_confirmed_at, 
        created_at, 
        updated_at
      `)
      .eq('id', decoded.userId)
      .single();
      
    if (error || !user) {
      console.error('User fetch error:', error);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log('User data retrieved:', {
      id: user.id,
      email: user.email,
      foto_profile: user.foto_profile ? 'exists' : 'not set',
      account_membership: user.account_membership || 'free'
    });
    
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
    
    // Ensure membership type is included (default to 'free' if not set)
    const membership = user.account_membership || 'free';
    
    // Create response object with all necessary fields
    const userData = {
      id: user.id,
      email: user.email,
      nama_lengkap: user.nama_lengkap,
      nomor_telepon: user.nomor_telepon,
      tanggal_lahir: user.tanggal_lahir,
      role: user.role,
      foto_profile: user.foto_profile,
      account_membership: membership,
      status: user.status,
      verifikasi_email: user.verifikasi_email,
      email_confirmed_at: user.email_confirmed_at,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
    
    // Add profile data if available
    if (profileData) {
      userData.foto_profile = profileData;
    }
    
    return NextResponse.json({ 
      user: userData,
      membership: membership, // Include membership explicitly at top level too
      currentTime: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch user data', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}