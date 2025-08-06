import { NextResponse } from 'next/server';
import { corsHeaders, corsResponse } from '@/lib/cors';
import { createPaymentToken } from '@/lib/midtrans';
import { jwtService } from '@/lib/jwt-service';

export async function POST(request: Request) {
  try {
    // Extract authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return corsResponse(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate JWT token
    const token = authHeader.split(' ')[1];
    let userId, userEmail, userRole;
    
    try {
      const decoded = jwtService.verifyToken(token);
      userId = decoded.userId;
      userEmail = decoded.email;
      userRole = decoded.role;
      
      if (!userId || !userEmail) {
        throw new Error('Invalid token payload');
      }
    } catch (tokenError) {
      console.error('JWT validation error:', tokenError);
      return corsResponse(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user details from database to ensure user exists and is active
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const userResponse = await fetch(
      `${supabaseUrl}/rest/v1/user?select=id,email,nama_lengkap,status&id=eq.${userId}`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json"
        },
      }
    );

    if (!userResponse.ok) {
      console.error('Failed to fetch user:', userResponse.status);
      return corsResponse(
        { error: 'User not found or inactive' },
        { status: 401 }
      );
    }

    const userData = await userResponse.json();
    const user = userData && userData.length > 0 ? userData[0] : null;

    if (!user) {
      console.error('User not found');
      return corsResponse(
        { error: 'User not found or inactive' },
        { status: 401 }
      );
    }

    if (user.status !== 'active' && user.status !== 'success') {
      return corsResponse(
        { error: 'User account is not active' },
        { status: 403 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return corsResponse(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.order_id || !body.amount) {
      return corsResponse(
        { error: 'Missing required fields: order_id and amount are required' },
        { status: 400 }
      );
    }

    // Ensure order_id is unique by checking existing payment intents
    const existingOrderResponse = await fetch(
      `${supabaseUrl}/rest/v1/payment_intent?select=order_id&order_id=eq.${encodeURIComponent(body.order_id)}`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json"
        },
      }
    );

    if (!existingOrderResponse.ok) {
      console.error('Failed to check existing order:', existingOrderResponse.status);
      return corsResponse(
        { error: 'Failed to check existing order' },
        { status: 500 }
      );
    }

    const existingOrderData = await existingOrderResponse.json();
    
    if (existingOrderData && existingOrderData.length > 0) {
      return corsResponse(
        { error: 'Order ID already exists' },
        { status: 409 }
      );
    }

    // Prepare transaction parameters
    const transactionParams = {
      transaction_details: {
        order_id: body.order_id,
        gross_amount: parseInt(body.amount, 10)
      },
      customer_details: {
        first_name: user.nama_lengkap || 'Customer',
        email: user.email,
        phone: body.phone || ''
      },
      item_details: body.items || [{
        id: body.item_id || 'default_item',
        price: parseInt(body.amount, 10),
        quantity: 1,
        name: body.item_name || 'Payment Item',
        category: body.item_category || 'General'
      }]
    };

    // Create payment token
    try {
      const paymentResult = await createPaymentToken(transactionParams);
      
      // Record payment intent in database using direct REST API
      const insertResponse = await fetch(
        `${supabaseUrl}/rest/v1/payment_intent`,
        {
          method: "POST",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
            "Prefer": "return=representation"
          },
          body: JSON.stringify({
            email: user.email,
            order_id: body.order_id,
            package_id: body.item_id || 'default_item',
            package_name: body.package_name || 'default',
            amount: parseInt(body.amount, 10),
            period: body.period || 'once',
            status: 'pending',
            created_at: new Date().toISOString(),
            created_by: userId,
            updated_at: new Date().toISOString()
          }),
        }
      );

      if (!insertResponse.ok) {
        console.error('Failed to record payment intent:', insertResponse.status);
        // Continue anyway since payment token was created successfully
      }

      return corsResponse({
        success: true,
        token: paymentResult.token,
        redirectUrl: paymentResult.redirectUrl,
        orderId: body.order_id
      });
      
    } catch (paymentError: any) {
      console.error('Payment creation error:', paymentError);
      return corsResponse(
        { 
          error: 'Failed to create payment token',
          details: paymentError.message 
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return corsResponse(
      { 
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders
  });
}
