import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { corsHeaders, applyCorsHeaders } from '@/lib/cors';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return applyCorsHeaders(
        NextResponse.json(
          { error: 'Email is required' },
          { status: 400 }
        )
      );
    }

    // Query the user table for this email
    const { data, error } = await supabase
      .from('user')
      .select('id, email, role, nama_lengkap, verifikasi_email, status')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (error) {
      console.error('Error checking role:', error);
      return applyCorsHeaders(
        NextResponse.json(
          { error: 'Database error while checking role' },
          { status: 500 }
        )
      );
    }

    if (!data) {
      return applyCorsHeaders(
        NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      );
    }

    // Return the role info
    return applyCorsHeaders(
      NextResponse.json({
        id: data.id,
        email: data.email,
        role: data.role || 'user',
        nama_lengkap: data.nama_lengkap,
        isVerified: data.verifikasi_email,
        status: data.status
      })
    );
  } catch (error: any) {
    console.error('Check role API error:', error);
    return applyCorsHeaders(
      NextResponse.json(
        { error: error.message || 'Failed to check user role' },
        { status: 500 }
      )
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
