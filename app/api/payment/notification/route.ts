import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { corsResponse, corsHeaders } from '@/lib/cors';

export async function POST(request: Request) {
  try {
    const notification = await request.json();
    console.log('Received Midtrans notification:', notification);
    
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
    
    // Try to get user email from payment_intent first
    let userEmail;
    const { data: intentData } = await supabase
      .from("payment_intent")
      .select("email, package_id, period, amount")
      .eq("order_id", orderId)
      .single();
    
    if (intentData) {
      userEmail = intentData.email;
      console.log(`Found email from payment intent: ${userEmail}`);
      
      // If payment is successful, record it
      if (status === 'success') {
        // Create payment record using the stored email
        const { error: paymentError } = await supabase
          .from("payment")
          .insert({
            email: userEmail,
            membership_type: intentData.package_id.replace('pkg_', ''),
            order_id: orderId,
            transaction_type: "purchase",
            metode_pembayaran: notification.payment_type || "unknown",
            harga: intentData.amount,
            status: "success",
          });
          
        if (paymentError) {
          console.error("Error creating payment record:", paymentError);
        } else {
          console.log("Payment record created successfully");
        }
        
        // Update payment intent status
        await supabase
          .from("payment_intent")
          .update({ status: "completed" })
          .eq("order_id", orderId);
      }
    }
    
    // Update subscription status if it exists
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: status,
        updated_at: new Date().toISOString(),
        payment_data: notification
      })
      .eq('order_id', orderId);
    
    if (error) {
      console.error('Error updating subscription:', error);
    }
    
    // If payment successful, update user subscription
    if (status === 'success') {
      await activateUserSubscription(orderId, userEmail);
    }
    
    return corsResponse({ success: true, status });
  } catch (error) {
    console.error('Error processing notification:', error);
    return corsResponse(
      { error: 'Failed to process notification' },
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

async function activateUserSubscription(orderId: string, email?: string) {
  try {
    console.log('Activating subscription for order:', orderId);
    
    // First try to get data from subscriptions table
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('user_id, package_id, period, created_at')
      .eq('order_id', orderId)
      .single();
    
    // If no subscription record, try to get from payment_intent
    if (!subscription) {
      console.log('No subscription found, checking payment_intent');
      const { data: intentData } = await supabase
        .from("payment_intent")
        .select("email, package_id, period")
        .eq("order_id", orderId)
        .single();
      
      if (intentData) {
        console.log('Found payment intent data:', intentData);
        
        // Try to find user by email
        if (intentData.email || email) {
          const userEmail = intentData.email || email;
          const { data: userData } = await supabase
            .from("user")
            .select("id")
            .eq("email", userEmail)
            .single();
          
          if (userData) {
            // Update user's membership
            const { error: userUpdateError } = await supabase
              .from("user")
              .update({
                account_membership: intentData.package_id.replace('pkg_', ''),
              })
              .eq("id", userData.id);
            
            if (userUpdateError) {
              console.error('Error updating user membership:', userUpdateError);
            } else {
              console.log('Updated user membership successfully for user:', userData.id);
            }
          }
        }
      }
      return;
    }
    
    const startDate = new Date(subscription.created_at);
    const expiryDate = new Date(startDate);
    
    if (subscription.period === 'monthly') {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (subscription.period === 'yearly') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }
    
    // Update user's account_membership
    const { error: userUpdateError } = await supabase
      .from("user")
      .update({
        account_membership: subscription.package_id,
      })
      .eq("id", subscription.user_id);
    
    if (userUpdateError) {
      console.error('Error updating user membership:', userUpdateError);
    }
    
    // Create or update user subscription record
    const { error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: subscription.user_id,
        package_id: subscription.package_id,
        is_active: true,
        start_date: startDate.toISOString(),
        expiry_date: expiryDate.toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (subscriptionError) {
      console.error('Error creating user subscription:', subscriptionError);
    } else {
      console.log('User subscription activated successfully for user:', subscription.user_id);
    }
    
  } catch (error) {
    console.error('Error activating subscription:', error);
  }
}

