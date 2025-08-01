import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { corsResponse } from "@/lib/cors";

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    console.log("Creating payment intent with data:", body);

    const {
      userId,
      email,
      packageId,
      packageName,
      period,
      amount,
      orderId,
    } = body;

    // Validate required fields
    if (!email || !orderId || !packageId) {
      return corsResponse({ error: "Missing required fields" }, { status: 400 });
    }

    // Store payment intent in payment_intent table (create this table if it doesn't exist)
    const { data, error } = await supabase
      .from("payment_intent")
      .insert({
        email: email,
        order_id: orderId,
        package_id: packageId,
        package_name: packageName,
        period: period,
        amount: amount,
        created_at: new Date().toISOString(),
        status: "pending"
      })
      .select();

    if (error) {
      console.error("Error creating payment intent:", error);
      
      // If the table doesn't exist, let's create a fallback mechanism
      // Store in a temporary table or use local storage
      
      return corsResponse({ 
        warning: "Failed to create payment intent record, but will continue with payment",
        details: error.message
      });
    }

    return corsResponse({
      success: true,
      message: "Payment intent created successfully",
      data
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return corsResponse(
      {
        warning: "Failed to create payment intent, will try again after payment",
        details: error.message,
      }
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
