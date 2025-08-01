import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { corsResponse } from '@/lib/cors';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();
    
    if (!orderId) {
      return corsResponse({ error: 'Order ID required' }, { status: 400 });
    }

    console.log('Checking payment status for order:', orderId);

    // Check Midtrans API untuk status terbaru
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const isProduction = process.env.MIDTRANS_PRODUCTION === 'true';
    const apiUrl = isProduction 
      ? 'https://api.midtrans.com' 
      : 'https://api.sandbox.midtrans.com';

    const midtransResponse = await fetch(`${apiUrl}/v2/${orderId}/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(serverKey + ':').toString('base64')}`
      }
    });

    if (!midtransResponse.ok) {
      console.error('Failed to get status from Midtrans:', midtransResponse.status);
      return corsResponse({ error: 'Failed to check payment status' }, { status: 500 });
    }

    const midtransData = await midtransResponse.json();
    console.log('Midtrans status response:', midtransData);

    let status = 'pending';
    const transactionStatus = midtransData.transaction_status;
    const fraudStatus = midtransData.fraud_status;
    
    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        status = 'challenge';
      } else if (fraudStatus === 'accept') {
        status = 'success';
      }
    } else if (transactionStatus === 'settlement') {
      status = 'success';
    } else if (transactionStatus === 'cancel' || 
               transactionStatus === 'deny' || 
               transactionStatus === 'expire') {
      status = 'failed';
    }

    console.log('Determined status:', status);

    // Update payment_intent status
    const { data: paymentIntentData, error: intentUpdateError } = await supabase
      .from("payment_intent")
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq("order_id", orderId)
      .select("email, package_name, package_id, amount, period")
      .single();
    
    if (intentUpdateError) {
      console.error("Error updating payment intent:", intentUpdateError);
      return corsResponse({ error: 'Failed to update payment intent' }, { status: 500 });
    }

    console.log("Payment intent updated:", paymentIntentData);

    // Jika status success, database trigger akan otomatis update user membership
    // Tambahkan ke payment table
    if (status === 'success' && paymentIntentData) {
      const membershipType = paymentIntentData.package_name?.toLowerCase() || 'free';
      const paymentType = midtransData.payment_type || 'unknown';
      const grossAmount = midtransData.gross_amount || paymentIntentData.amount || 0;
      
      // Check jika payment record sudah ada
      const { data: existingPayment } = await supabase
        .from("payment")
        .select("id")
        .eq("order_id", orderId)
        .single();

      if (!existingPayment) {
        const { data: paymentData, error: paymentError } = await supabase
          .from("payment")
          .insert({
            email: paymentIntentData.email,
            membership_type: membershipType,
            order_id: orderId,
            transaction_type: "purchase",
            metode_pembayaran: paymentType,
            harga: Number(grossAmount),
            status: "success",
            created_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (paymentError) {
          console.error("Error creating payment record:", paymentError);
        } else {
          console.log("Payment record created:", paymentData);
        }
      } else {
        console.log("Payment record already exists for order:", orderId);
      }

      // Verify user membership was updated by trigger
      const { data: updatedUser } = await supabase
        .from("user")
        .select("email, account_membership")
        .eq("email", paymentIntentData.email)
        .single();
        
      console.log("User membership after trigger:", updatedUser);
    }

    return corsResponse({ 
      success: true, 
      status,
      paymentData: midtransData,
      updated: !!paymentIntentData
    });

  } catch (error: any) {
    console.error('Check status error:', error);
    return corsResponse({ error: 'Internal server error' }, { status: 500 });
  }
}
