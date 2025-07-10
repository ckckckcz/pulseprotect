import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';
import { corsHeaders, corsResponse } from '@/lib/cors';

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
      console.error('MIDTRANS_SERVER_KEY is missing');
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

    // Prepare transaction parameters with validation
    const transactionParams = {
      transaction_details: {
        order_id: String(body.transaction_details.order_id),
        gross_amount: Number(body.transaction_details.gross_amount),
      },
      customer_details: body.customer_details ? {
        first_name: String(body.customer_details.first_name || 'Customer'),
        last_name: String(body.customer_details.last_name || ''),
        email: String(body.customer_details.email || 'customer@example.com'),
        phone: String(body.customer_details.phone || '08123456789'),
      } : {
        first_name: 'Customer',
        last_name: '',
        email: 'customer@example.com',
        phone: '08123456789',
      },
      item_details: itemDetails,
      // Include additional Midtrans parameters
      credit_card: {
        secure: true
      },
      callbacks: {
        finish: process.env.NEXT_PUBLIC_APP_URL + '/payment/success',
        error: process.env.NEXT_PUBLIC_APP_URL + '/payment/error',
        pending: process.env.NEXT_PUBLIC_APP_URL + '/payment/pending'
      }
    };

    console.log('Final transaction params:', JSON.stringify(transactionParams, null, 2));

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

