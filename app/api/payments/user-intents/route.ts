import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { corsResponse } from '@/lib/cors';
import { jwtService } from '@/lib/jwt-service';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    
    // Get authorization header for JWT validation
    const authHeader = request.headers.get('authorization');
    let authenticatedUserEmail = '';
    
    // Validate JWT if present
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        // Use the verifyToken method which exists in the updated jwtService
        const decoded = jwtService.verifyToken(token);
        if (decoded && decoded.email) {
          authenticatedUserEmail = decoded.email;
          console.log('User authenticated via JWT:', authenticatedUserEmail);
        }
      } catch (tokenError) {
        console.warn('Invalid JWT token:', tokenError);
      }
    }

    // If no email parameter but we have an authenticated user, use their email
    if (!email && authenticatedUserEmail) {
      console.log('Using email from JWT token:', authenticatedUserEmail);
    } else if (!email && !authenticatedUserEmail) {
      return corsResponse({ error: 'Email parameter is required' }, { status: 400 });
    }
    
    const userEmail = email || authenticatedUserEmail;

    // Get all payment intents for the user from payment_intent table
    const { data, error } = await supabase
      .from('payment_intent')
      .select('*')
      .eq('email', userEmail)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payment intents:', error);
      return corsResponse({ error: 'Failed to fetch payment data' }, { status: 500 });
    }

    console.log(`Found ${data?.length || 0} payment intents for email: ${userEmail}`);

    return corsResponse({
      success: true,
      data: data || []
    });
  } catch (error: any) {
    console.error('User payment intents error:', error);
    return corsResponse(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
