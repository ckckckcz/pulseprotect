import { NextRequest, NextResponse } from 'next/server';
import { seedUsers } from '@/lib/database/seed';
import { corsHeaders, applyCorsHeaders } from '@/lib/cors';

export async function GET(req: NextRequest) {
  try {
    // Check for admin secret to prevent unauthorized seeding
    const secretKey = req.headers.get('x-admin-secret');
    const configuredSecret = process.env.ADMIN_SECRET_KEY;
    
    if (!secretKey || secretKey !== configuredSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }
    
    await seedUsers();
    
    return applyCorsHeaders(
      NextResponse.json(
        { success: true, message: 'Database seeded with dummy users' },
        { status: 200 }
      )
    );
  } catch (error: any) {
    console.error('Seeding API error:', error);
    return applyCorsHeaders(
      NextResponse.json(
        { error: error.message || 'Failed to seed database' },
        { status: 500 }
      )
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
