import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { corsResponse } from "@/lib/cors";

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    // console.log("Creating subscription with data:", body);

    const {
      userId,
      email,
      packageId,
      packageName,
      period,
      amount,
      orderId,
      paymentType,
      paymentData,
    } = body;

    // Check if we have an email, if not try to find it from payment_intent
    let userEmail = email;
    
    if (!userEmail && orderId) {
      // console.log("Email not provided, looking up from payment_intent for order:", orderId);
      const { data: intentData } = await supabase
        .from("payment_intent")
        .select("email")
        .eq("order_id", orderId)
        .single();
      
      if (intentData && intentData.email) {
        userEmail = intentData.email;
        // console.log("Found email from payment_intent:", userEmail);
      }
    }

    // Validate required fields
    if (!userEmail || !packageId || !period || !amount || !orderId) {
      return corsResponse({ 
        error: "Missing required fields", 
        details: { userEmail, packageId, period, amount, orderId } 
      }, { status: 400 });
    }

    const membershipType = packageId.split("_")[1] || packageId;

    // Create payment record using email 
    // console.log("Creating payment record with email:", userEmail);
    const { data: payment, error: paymentError } = await supabase
      .from("payment")
      .insert({
        email: userEmail,
        membership_type: membershipType,
        order_id: orderId,
        transaction_type: "purchase",
        metode_pembayaran: paymentType || "credit_card",
        harga: amount,
        status: "success",
      })
      .select();

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
      return corsResponse({ error: "Failed to create payment record", details: paymentError.message }, { status: 500 });
    }

    // console.log("Payment record created:", payment);

    // Calculate expiry date
    const startDate = new Date();
    const expiryDate = new Date(startDate);

    if (period === "monthly") {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (period === "yearly") {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    // Optional: Update user's account_membership field if userId is provided
    if (userId) {
      try {
        const { error: userUpdateError } = await supabase
          .from("user")
          .update({
            account_membership: membershipType,
          })
          .eq("id", userId);

        if (userUpdateError) {
          console.error("Error updating user membership:", userUpdateError);
          // Continue execution as payment is already recorded
        } else {
          // console.log("Updated user membership successfully");
        }
      } catch (err) {
        console.error("Error updating user data:", err);
      }
    }

    // Update payment intent status if it exists
    try {
      await supabase
        .from("payment_intent")
        .update({ status: "completed" })
        .eq("order_id", orderId);
    } catch (error) {
      console.warn("Failed to update payment intent:", error);
    }

    return corsResponse({
      success: true,
      message: "Payment record created successfully",
      data: {
        paymentId: payment[0]?.id_payment,
        packageType: membershipType,
        startDate: startDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error creating payment record:", error);
    return corsResponse(
      {
        error: "Failed to create payment record",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}
