import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';
import { corsHeaders, corsResponse } from '@/lib/cors';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    console.log('=== API: Starting payment token creation ===');
    
    // Check environment variables
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const isProduction = process.env.MIDTRANS_PRODUCTION === 'true';
    
    console.log('Environment check:', {
      hasServerKey: !!serverKey,
      isProduction,
      serverKeyPrefix: serverKey ? serverKey.substring(0, 15) : 'missing',
      mode: isProduction ? 'PRODUCTION' : 'SANDBOX',
    });
    
    // Validate sandbox configuration
    if (!isProduction && serverKey && !serverKey.startsWith('SB-Mid-server-')) {
      console.error('Sandbox mode but server key does not start with SB-Mid-server-');
      return corsResponse(
        { error: 'Invalid sandbox server key format' },
        { status: 500 }
      );
    }
    
    if (!serverKey) {
      return corsResponse(
        { error: 'Midtrans server key not configured' },
        { status: 500 }
      );
    }
    
    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log('API: Received body:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return corsResponse(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!body.transaction_details) {
      console.error('API: Missing transaction_details');
      return corsResponse(
        { error: 'Missing transaction_details' },
        { status: 400 }
      );
    }

    if (!body.transaction_details.order_id || !body.transaction_details.gross_amount) {
      console.error('API: Missing order_id or gross_amount');
      return corsResponse(
        { error: 'Missing order_id or gross_amount' },
        { status: 400 }
      );
    }

    // Create Midtrans Snap instance with the correct import
    let snap;
    try {
      console.log(`Creating fresh Midtrans Snap instance in ${isProduction ? 'PRODUCTION' : 'SANDBOX'} mode`);
      
      // Use direct import instead of destructured import
      snap = new midtransClient.Snap({
        isProduction: isProduction,
        serverKey: serverKey,
        clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''
      });
      
      console.log('Midtrans Snap instance created successfully');
    } catch (initError: any) {
      console.error('Failed to initialize Midtrans Snap:', initError);
      console.error('Init error details:', {
        message: initError.message,
        stack: initError.stack,
      });
      return corsResponse(
        { error: 'Failed to initialize payment gateway', details: initError.message },
        { status: 500 }
      );
    }

    // Ensure item_details is properly formatted
    const itemDetails = body.item_details && Array.isArray(body.item_details) && body.item_details.length > 0
      ? body.item_details.map((item: any) => ({
          id: String(item.id || 'default_item'),
          price: Number(item.price || 0),
          quantity: Number(item.quantity || 1),
          name: String(item.name || 'Unnamed Item'),
          category: String(item.category || 'General'),
        }))
      : [{
          id: 'default_item',
          price: Number(body.transaction_details.gross_amount),
          quantity: 1,
          name: body.item_name || 'Payment Item',
          category: body.item_category || 'General',
        }];

    // Ensure we have proper customer details for "On Behalf Of" field
    const customerDetails = body.customer_details ? {
      first_name: String(body.customer_details.first_name || ''),
      last_name: String(body.customer_details.last_name || ''),
      email: String(body.customer_details.email || ''),
      phone: String(body.customer_details.phone || ''),
    } : {
      first_name: 'Customer',
      last_name: '',
      email: 'customer@example.com',
      phone: '',
    };

    // Make sure we're using proper customer name, not "Demo" 
    if (!customerDetails.first_name || customerDetails.first_name === 'Demo') {
      if (customerDetails.email && customerDetails.email !== 'customer@example.com') {
        // Try to get user's full name from database if available
        try {
          const { data: userData } = await supabase
            .from('user')
            .select('nama_lengkap')
            .eq('email', customerDetails.email)
            .single();
          
          if (userData && userData.nama_lengkap) {
            customerDetails.first_name = userData.nama_lengkap;
          } else {
            // Fallback to using part of email
            customerDetails.first_name = customerDetails.email.split('@')[0];
          }
        } catch (dbError) {
          console.warn('Failed to fetch user name from database:', dbError);
          customerDetails.first_name = customerDetails.email.split('@')[0];
        }
      } else {
        customerDetails.first_name = 'User';
      }
    }

    console.log("Using customer name:", customerDetails.first_name);

    // Prepare transaction parameters with validation
    const transactionParams = {
      transaction_details: {
        order_id: String(body.transaction_details.order_id),
        gross_amount: Number(body.transaction_details.gross_amount),
      },
      customer_details: customerDetails,
      item_details: itemDetails,
      // Include custom fields from request if available
      custom_field1: body.custom_field1 || '',
      custom_field2: body.custom_field2 || customerDetails.email || '',
      custom_field3: body.custom_field3 || '',
      // Include additional Midtrans parameters
      credit_card: {
        secure: true
      },
      callbacks: {
        finish: process.env.NEXT_PUBLIC_APP_URL + '/payment/success?orderId=' + body.transaction_details.order_id,
        error: process.env.NEXT_PUBLIC_APP_URL + '/payment/error?orderId=' + body.transaction_details.order_id,
        pending: process.env.NEXT_PUBLIC_APP_URL + '/payment/pending?orderId=' + body.transaction_details.order_id
      }
    };

    console.log('Final transaction params:', JSON.stringify(transactionParams, null, 2));

    // Record payment intent in database (critical untuk membership update)
    try {
      if (customerDetails.email && customerDetails.email !== 'customer@example.com') {
        console.log('=== Recording payment intent in database ===');
        
        // Determine package name from item details - make sure it's LOWERCASE
        let packageName = 'free'; // default
        if (body.item_details && body.item_details.length > 0) {
          const itemName = body.item_details[0].name || '';
          const itemId = body.item_details[0].id || '';
          
          // Extract package type from item name or id and convert to lowercase
          if (itemName.toLowerCase().includes('pro')) {
            packageName = 'pro';
          } else if (itemName.toLowerCase().includes('plus')) {
            packageName = 'plus';
          } else if (itemName.toLowerCase().includes('free')) {
            packageName = 'free';
          } else if (itemId.includes('pkg_')) {
            // Extract from package ID if name doesn't contain the type
            const packageType = itemId.replace('pkg_', '').toLowerCase();
            if (['pro', 'plus', 'free'].includes(packageType)) {
              packageName = packageType;
            }
          }
        }
        
        const intentData = {
          email: customerDetails.email,
          order_id: transactionParams.transaction_details.order_id,
          package_id: body.item_details?.[0]?.id || 'unknown',
          package_name: packageName, // This will be lowercase: "pro", "plus", or "free"
          amount: transactionParams.transaction_details.gross_amount,
          period: body.custom_field1 || 'monthly',
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('Payment intent data with lowercase package_name:', intentData);
        
        const { data: intentResult, error: intentError } = await supabase
          .from('payment_intent')
          .upsert(intentData, {
            onConflict: 'order_id'
          })
          .select()
          .single();
        
        if (intentError) {
          console.error('Failed to record payment intent:', intentError);
        } else {
          console.log('Payment intent recorded successfully:', intentResult);
        }
      }
    } catch (dbError) {
      console.warn('Failed to record payment intent in database:', dbError);
    }

    // Create transaction with detailed error handling
    let transaction;
    try {
      console.log('Calling Midtrans API...');
      transaction = await snap.createTransaction(transactionParams);
      console.log('Midtrans transaction created successfully');
      console.log('Token received:', transaction.token ? 'Yes' : 'No');
      console.log('Redirect URL received:', transaction.redirect_url ? 'Yes' : 'No');
    } catch (midtransError: any) {
      console.error('Midtrans API Error:', midtransError);
      console.error('Midtrans Error Details:', {
        message: midtransError.message,
        httpStatusCode: midtransError.httpStatusCode,
        ApiResponse: midtransError.ApiResponse ? JSON.stringify(midtransError.ApiResponse) : 'No API Response',
      });
      
      // Try to extract more detailed error info
      let errorDetails = midtransError.message;
      if (midtransError.ApiResponse) {
        try {
          if (typeof midtransError.ApiResponse === 'string') {
            errorDetails = midtransError.ApiResponse;
          } else {
            errorDetails = JSON.stringify(midtransError.ApiResponse);
          }
        } catch (e) {
          errorDetails = 'Could not extract API response details';
        }
      }
      
      return corsResponse(
        { 
          error: 'Midtrans API error',
          details: errorDetails,
          statusCode: midtransError.httpStatusCode,
        },
        { status: 500 }
      );
    }

    if (!transaction || !transaction.token) {
      console.error('No token received from Midtrans');
      console.error('Transaction object:', transaction);
      return corsResponse(
        { error: 'No payment token received from Midtrans' },
        { status: 500 }
      );
    }

    const response = {
      success: true,
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
      orderId: transactionParams.transaction_details.order_id,
    };

    console.log('API: Returning successful response:', response);
    return corsResponse(response);

  } catch (error: any) {
    console.error('=== API: Unexpected error ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);

    return corsResponse(
      { 
        error: 'Internal server error',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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

