import midtransClient from 'midtrans-client';

export const midtransConfig = {
  isProduction: process.env.MIDTRANS_PRODUCTION === 'true', // false untuk sandbox
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '',
  merchantId: process.env.MIDTRANS_MERCHANT_ID || '',
  apiUrl: process.env.MIDTRANS_API_URL || 'https://api.sandbox.midtrans.com',
  appUrl: process.env.MIDTRANS_APP_URL || 'https://app.sandbox.midtrans.com',
};

// Validate configuration dengan logging yang lebih detail
if (typeof window === 'undefined') {
  // Only log on server-side to avoid cluttering client logs
  // console.log('=== Midtrans Configuration Check ===');
  // console.log('Server Key:', midtransConfig.serverKey ? `${midtransConfig.serverKey.substring(0, 15)}...` : 'MISSING');
  // console.log('Client Key:', midtransConfig.clientKey ? `${midtransConfig.clientKey.substring(0, 15)}...` : 'MISSING');
  // console.log('Merchant ID:', midtransConfig.merchantId || 'MISSING');
  // console.log('Is Production:', midtransConfig.isProduction);
  // console.log('API URL:', midtransConfig.apiUrl);
  // console.log('APP URL:', midtransConfig.appUrl);

  // Validate Sandbox keys
  if (!midtransConfig.isProduction) {
    // console.log('🏗️ SANDBOX MODE DETECTED');
    if (midtransConfig.serverKey && !midtransConfig.serverKey.startsWith('SB-Mid-server-')) {
      // console.warn('⚠️ Server key does not look like a sandbox key');
    }
    if (midtransConfig.clientKey && !midtransConfig.clientKey.startsWith('SB-Mid-client-')) {
      // console.warn('⚠️ Client key does not look like a sandbox key');
    }
  } else {
    // console.log('🚀 PRODUCTION MODE DETECTED');
  }

  if (!midtransConfig.serverKey) {
    // console.error('❌ MIDTRANS_SERVER_KEY is not set');
  } else {
    // console.log('✅ MIDTRANS_SERVER_KEY is set');
  }

  if (!midtransConfig.clientKey) {
    // console.error('❌ NEXT_PUBLIC_MIDTRANS_CLIENT_KEY is not set');
  } else {
    // console.log('✅ NEXT_PUBLIC_MIDTRANS_CLIENT_KEY is set');
  }

  // Validate key format for sandbox
  if (!midtransConfig.isProduction) {
    if (midtransConfig.serverKey && midtransConfig.serverKey.startsWith('SB-Mid-server-')) {
      // console.log('✅ Sandbox server key format is correct');
    } else if (midtransConfig.serverKey) {
      // console.error('❌ Server key should start with "SB-Mid-server-" for sandbox');
    }
    
    if (midtransConfig.clientKey && midtransConfig.clientKey.startsWith('SB-Mid-client-')) {
      // console.log('✅ Sandbox client key format is correct');
    } else if (midtransConfig.clientKey) {
      // console.error('❌ Client key should start with "SB-Mid-client-" for sandbox');
    }
  }
}

// Create Snap instance for server-side dengan error handling yang lebih baik
let snap: any;
let coreApi: any;

// Only initialize on the server side
if (typeof window === 'undefined') {
  try {
    // Server-side Snap instance (hanya butuh serverKey)
    snap = new midtransClient.Snap({
      isProduction: midtransConfig.isProduction,
      serverKey: midtransConfig.serverKey,
      clientKey: midtransConfig.clientKey, // Include clientKey for completeness
    });
    // console.log('✅ Midtrans Snap instance created successfully');
  } catch (error: any) {
    // console.error('❌ Failed to create Midtrans Snap instance:', error);
    // console.error('Error details:', {
    //   message: error.message,
    //   stack: error.stack,
    // });
  }

  try {
    // Core API instance untuk status checking
    coreApi = new midtransClient.CoreApi({
      isProduction: midtransConfig.isProduction,
      serverKey: midtransConfig.serverKey,
      clientKey: midtransConfig.clientKey, // Include clientKey for completeness
    });
    // console.log('✅ Midtrans CoreApi instance created successfully');
  } catch (error: any) {
    // console.error('❌ Failed to create Midtrans CoreApi instance:', error);
    // console.error('Error details:', {
    //   message: error.message,
    //   stack: error.stack,
    // });
  }
}

export { snap, coreApi };

export interface TransactionParams {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  customer_details?: {
    first_name: string;
    last_name?: string;
    email: string;
    phone?: string;
  };
  item_details?: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
    category?: string;
  }>;
}

export async function createPaymentToken(params: TransactionParams) {
  if (!snap) {
    throw new Error('Midtrans Snap instance not initialized');
  }

  try {
    // console.log('Creating Midtrans token with params:', JSON.stringify(params, null, 2));
    const transaction = await snap.createTransaction(params);
    // console.log('Midtrans token created successfully');

    return {
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
    };
  } catch (error: any) {
    // console.error('Error creating Midtrans token:', error);
    // console.error('Midtrans error details:', {
    //   message: error.message,
    //   httpStatusCode: error.httpStatusCode,
    //   ApiResponse: error.ApiResponse,
    //   stack: error.stack,
    // });
    throw new Error(`Failed to create payment token: ${error.message}`);
  }
}

export async function checkTransactionStatus(orderId: string) {
  if (!coreApi) {
    throw new Error('Midtrans CoreApi instance not initialized');
  }

  try {
    // console.log('Checking transaction status for order:', orderId);
    const response = await coreApi.transaction.status(orderId);
    // console.log('Transaction status retrieved successfully');
    return response;
  } catch (error: any) {
    // console.error('Error checking transaction status:', error);
    // console.error('Midtrans status error details:', error.ApiResponse || error.message);
    throw new Error(`Failed to check transaction status: ${error.message}`);
  }
}
