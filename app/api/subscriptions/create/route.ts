import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { corsResponse } from '@/lib/cors';

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    console.log('Creating subscription with data:', body);
    
    const { 
      userId,
      packageId,
      packageName,
      period,
      amount,
      orderId,
      paymentType,
      paymentData
    } = body;
    
    // Validate required fields
    if (!userId || !packageId || !period || !amount || !orderId) {
      return corsResponse(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate expiry date
    const startDate = new Date();
    const expiryDate = new Date(startDate);
    
    if (period === 'monthly') {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (period === 'yearly') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }
    
    // First insert the subscription payment record
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        package_id: packageId,
        package_name: packageName,
        period: period,
        amount: amount,
        order_id: orderId,
        payment_type: paymentType,
        status: 'success',
        payment_data: paymentData,
        created_at: startDate.toISOString(),
        updated_at: startDate.toISOString()
      })
      .select()
      .single();
      
    if (subscriptionError) {
      console.error('Error creating subscription record:', subscriptionError);
      return corsResponse(
        { error: 'Failed to create subscription record' },
        { status: 500 }
      );
    }
    
    // Update user's active subscription
    const { error: userSubscriptionError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        package_id: packageId,
        is_active: true,
        start_date: startDate.toISOString(),
        expiry_date: expiryDate.toISOString(),
        updated_at: startDate.toISOString()
      });
      
    if (userSubscriptionError) {
      console.error('Error updating user subscription:', userSubscriptionError);
      return corsResponse(
        { error: 'Failed to update user subscription' },
        { status: 500 }
      );
    }
    
    // Update user's account_membership field
    const { error: userUpdateError } = await supabase
      .from('"user"')
      .update({
        account_membership: packageId,
      })
      .eq('id', userId);
    
    if (userUpdateError) {
      console.error('Error updating user membership:', userUpdateError);
      return corsResponse(
        { error: 'Failed to update user membership' },
        { status: 500 }
      );
    }

    return corsResponse({
      success: true,
      message: 'Subscription created successfully',
      data: {
        subscriptionId: subscription.id,
        packageId,
        startDate: startDate.toISOString(),
        expiryDate: expiryDate.toISOString()
      }
    });
    
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return corsResponse(
      { 
        error: 'Failed to create subscription',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
