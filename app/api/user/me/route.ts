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
    
    // Debug: log decoded JWT
    console.log('Decoded JWT:', decoded);

    // Try to get user by id, fallback to email if not found
    let user = null;
    let error = null;

    if (decoded.userId) {
      const result = await supabase
        .from('user')
        .select('*')
        .eq('id', decoded.userId)
        .single();
      user = result.data;
      error = result.error;
    }

    // If not found by id, try by email
    if ((!user || error) && decoded.email) {
      const result = await supabase
        .from('user')
        .select('*')
        .eq('email', decoded.email)
        .single();
      user = result.data;
      error = result.error;
    }

    if (error || !user) {
      console.error('User fetch error:', error, 'Decoded:', decoded);
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
      // tanggal_lahir removed/not present in schema
      role: user.role,
      foto_profile: user.foto_profile,
      account_membership: membership, // always present
      status: user.status,
      verifikasi_email: user.verifikasi_email,
      email_confirmed_at: user.email_confirmed_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
      profile: profileData // <-- add as separate key
    };

    // Defensive: ensure all required fields are present
    if (!userData.id || !userData.email || !userData.nama_lengkap) {
      return NextResponse.json({ error: 'Incomplete user data from database' }, { status: 500 });
    }

    return NextResponse.json({
      user: userData,
      membership: membership,
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