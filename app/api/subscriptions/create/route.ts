import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { corsResponse } from "@/lib/cors";

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    console.log("Creating subscription with data:", body);

    const {
      userId,
      email, // Add email field
      packageId,
      packageName,
      period,
      amount,
      orderId,
      paymentType,
      paymentData,
    } = body;

    // Validate required fields
    if (!email || !packageId || !period || !amount || !orderId) {
      return corsResponse({ error: "Missing required fields" }, { status: 400 });
    }

    const membershipType = packageId.split("_")[1] || packageId;

    // Create payment record using email instead of userId
    console.log("Creating payment record with email:", email);
    const { data: payment, error: paymentError } = await supabase
      .from("payment")
      .insert({
        email: email,
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

    console.log("Payment record created:", payment);

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
          console.log("Updated user membership successfully");
        }
      } catch (err) {
        console.error("Error updating user data:", err);
      }
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
