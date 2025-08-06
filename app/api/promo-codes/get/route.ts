import { NextResponse } from 'next/server';
import { corsResponse } from '@/lib/cors';
import { supabase } from '@/lib/supabase';

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

    // Get the latest promo code for the user
    const { data, error } = await supabase
      .from('user_promo_codes')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (error) {
      console.error('Error fetching promo code:', error);
      return corsResponse(
        { error: 'Failed to fetch promo code' },
        { status: 500 }
      );
    }
    
    // If no promo code found, return null
    if (!data || data.length === 0) {
      return corsResponse({ promoCode: null });
    }
    
    return corsResponse({ promoCode: data[0] });
    
  } catch (error: any) {
    console.error('Error getting promo code:', error);
    return corsResponse(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
