import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabase } from '@/lib/supabase';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const JWT_EXPIRY = '2h'; // 2 hours
const REFRESH_EXPIRY = '7d'; // 7 days

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'Refresh token required' },
        { status: 400 }
      );
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (error) {
      console.error('Invalid refresh token:', error);
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }

    if (!decoded || typeof decoded !== 'object' || !decoded.userId || !decoded.email) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }

    // Check if user still exists and is active
    const { data: user, error } = await supabase
      .from('user')
      .select('id, email, role, status, account_membership')
      .eq('id', decoded.userId)
      .eq('email', decoded.email)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    if (user.status !== 'active' && user.status !== 'success') {
      return NextResponse.json({ error: 'User account is not active' }, { status: 403 });
    }

    // Generate new tokens
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role || 'user',
        account_membership: user.account_membership || 'free',
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    const newRefreshToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        tokenType: 'refresh',
      },
      JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_EXPIRY }
    );

    // console.log(`Refreshed tokens for user ${user.id} (${user.email})`);

    return NextResponse.json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ error: 'Failed to refresh token' }, { status: 500 });
  }
}
