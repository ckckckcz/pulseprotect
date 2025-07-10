import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { emailService } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { email } = data;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // 1. Store email in the database
    const { error: dbError } = await supabase
      .from('early_access')
      .insert({ email });

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: 'Failed to register email' },
        { status: 500 }
      );
    }

    // 2. Send confirmation email
    try {
      await emailService.sendEarlyAccessConfirmationEmail(email);
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // Continue anyway since the email is stored in the database
    }

    return NextResponse.json(
      { success: true, message: 'Successfully registered for early access' },
      { status: 201 }
    );
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
