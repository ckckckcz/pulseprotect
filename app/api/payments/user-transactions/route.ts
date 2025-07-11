import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { corsResponse } from '@/lib/cors';

export async function GET(request: Request) {
  try {
    // Get email from query parameters
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    
    if (!email) {
      return corsResponse(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Fetch payment records for the user
    const { data: payments, error } = await supabase
      .from('payment')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching payment records:', error);
      return corsResponse(
        { error: 'Failed to fetch payment records' },
        { status: 500 }
      );
    }
    
    return corsResponse({
      success: true,
      data: payments || []
    });
    
  } catch (error: any) {
    console.error('Error fetching user transactions:', error);
    return corsResponse(
      { error: 'Failed to fetch user transactions', details: error.message },
      { status: 500 }
    );
  }
}
