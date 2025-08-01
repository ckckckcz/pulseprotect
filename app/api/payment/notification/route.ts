import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { corsResponse, corsHeaders } from '@/lib/cors';

export async function POST(request: Request) {
  try {
    const notification = await request.json();
    console.log('=== MIDTRANS NOTIFICATION RECEIVED ===');
    console.log('Full notification:', JSON.stringify(notification, null, 2));
    
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;
    
    let status = 'pending';
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
    
    console.log(`Processing order ${orderId} with status: ${status}`);
    
    // Update payment_intent status - database trigger akan otomatis update user membership
    console.log('=== UPDATING PAYMENT INTENT STATUS ===');
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
      console.error("❌ Error updating payment intent:", intentUpdateError);
      return corsResponse({ 
        success: false, 
        error: "Failed to update payment intent" 
      }, { status: 500 });
    }
    
    console.log("✅ Payment intent updated successfully:", paymentIntentData);
    
    // HANYA JIKA SUCCESSFUL, database trigger sudah otomatis update user membership
    // DAN tambahkan ke payment table
    if (status === 'success' && paymentIntentData) {
      console.log('=== RECORDING PAYMENT IN PAYMENT TABLE (SUCCESS ONLY) ===');
      
      const membershipType = paymentIntentData.package_name?.toLowerCase() || 'free';
      const paymentType = notification.payment_type || 'unknown';
      const grossAmount = notification.gross_amount || paymentIntentData.amount || 0;
      
      // Check apakah payment record sudah ada untuk order ini
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
          console.error("❌ Error creating payment record:", paymentError);
        } else {
          console.log("✅ Payment record created successfully:", paymentData);
        }
      } else {
        console.log("✅ Payment record already exists for order:", orderId);
      }
      
      // Verify user membership was updated by trigger
      const { data: updatedUser } = await supabase
        .from("user")
        .select("email, account_membership")
        .eq("email", paymentIntentData.email)
        .single();
        
      console.log("✅ User membership after trigger:", updatedUser);
    } else if (status !== 'success') {
      console.log(`⏳ Payment status is ${status}, not recording in payment table yet`);
    }
    
    return corsResponse({ 
      success: true, 
      status,
      message: `Payment ${status} for order ${orderId}` 
    });
    
  } catch (error: any) {
    console.error('=== NOTIFICATION PROCESSING ERROR ===');
    console.error('Error details:', error);
    return corsResponse(
      { 
        error: 'Failed to process notification',
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

