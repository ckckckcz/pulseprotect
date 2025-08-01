import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { corsResponse, corsHeaders } from '@/lib/cors';

export async function POST(request: Request) {
  try {
    const notification = await request.json();
    console.log('Received Midtrans notification:', JSON.stringify(notification, null, 2));
    
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
    
    // Get customer details from the notification
    const customerDetails = notification.customer_details || {};
    const paymentType = notification.payment_type || 'unknown';
    const grossAmount = notification.gross_amount || 0;
    
    // Try to get user email from different sources
    let userEmail = customerDetails.email || 
                    notification.custom_field2 || 
                    '';
    
    // If email not found in notification, check payment_intent table
    if (!userEmail) {
      const { data: intentData } = await supabase
        .from("payment_intent")
        .select("email, package_id, period, amount")
        .eq("order_id", orderId)
        .single();
      
      if (intentData?.email) {
        userEmail = intentData.email;
        console.log(`Found email from payment intent: ${userEmail}`);
      }
    }
    
    // If payment is successful, record it in the payment table
    if (status === 'success') {
      if (userEmail) {
        // Get package info from item_details or payment_intent
        let packageId = '';
        let amount = grossAmount;
        
        if (notification.item_details && notification.item_details.length > 0) {
          packageId = notification.item_details[0].id || '';
        } else {
          // Try to get from payment_intent
          const { data: intentData } = await supabase
            .from("payment_intent")
            .select("package_id, amount")
            .eq("order_id", orderId)
            .single();
          
          if (intentData) {
            packageId = intentData.package_id;
            amount = intentData.amount;
          }
        }
        
        if (packageId) {
          const membershipType = packageId.replace('pkg_', '');
          
          // Create payment record in database
          const { error: paymentError } = await supabase
            .from("payment")
            .insert({
              email: userEmail,
              membership_type: membershipType,
              order_id: orderId,
              transaction_type: "purchase",
              metode_pembayaran: paymentType,
              harga: amount,
              status: "success",
              created_at: new Date().toISOString()
            });
            
          if (paymentError) {
            console.error("Error creating payment record:", paymentError);
          } else {
            console.log("Payment record created successfully");
          }
          
          // Update user membership if email is found
          if (userEmail) {
            const { data: userData, error: userError } = await supabase
              .from("user")
              .select("id")
              .eq("email", userEmail)
              .single();
            
            if (userError) {
              console.error("Error fetching user by email:", userError);
            } else if (userData) {
              console.log(`Updating membership for user ${userData.id} to ${membershipType}`);
              
              const { error: updateError } = await supabase
                .from("user")
                .update({ account_membership: membershipType })
                .eq("id", userData.id);
                
              if (updateError) {
                console.error("Error updating user membership:", updateError);
              } else {
                console.log("User membership updated successfully");
              }
            }
          }
        }
      } else {
        console.error("Cannot record payment: No user email found in notification or payment_intent");
      }
    }
    
    // Update payment_intent status
    try {
      await supabase
        .from("payment_intent")
        .update({
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq("order_id", orderId);
    } catch (error) {
      console.warn("Failed to update payment intent status:", error);
    }
    
    return corsResponse({ 
      success: true, 
      status,
      message: `Payment ${status} for order ${orderId}` 
    });
  } catch (error: any) {
    console.error('Error processing notification:', error);
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

