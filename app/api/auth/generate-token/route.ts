import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// JWT Secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '2h'; // 2 hours
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, email, role } = body;

    if (!userId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create JWT payload
    const payload = {
      userId,
      email,
      role: role || 'user',
    };

    // Generate access token
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    
    // Generate refresh token
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

    return NextResponse.json({ 
      accessToken, 
      refreshToken,
      success: true
    });
  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}
