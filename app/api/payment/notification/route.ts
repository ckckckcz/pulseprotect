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
    
    // Update subscription status
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: status,
        updated_at: new Date().toISOString(),
        payment_data: notification
      })
      .eq('order_id', orderId);
    
    if (error) {
      console.error('Error updating transaction:', error);
      return corsResponse(
        { error: 'Failed to update transaction' },
        { status: 500 }
      );
    }
    
    // If payment successful, update user subscription
    if (status === 'success') {
      await activateUserSubscription(orderId);
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

async function activateUserSubscription(orderId: string) {
  try {
    console.log('Activating subscription for order:', orderId);
    
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('user_id, package_id, period, created_at')
      .eq('order_id', orderId)
      .single();
    
    if (!subscription) {
      console.error('No subscription found for order:', orderId);
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
      .from('"user"')
      .update({
        account_membership: subscription.package_id,
      })
      .eq('id', subscription.user_id);
    
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

