import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { corsHeaders, corsResponse } from "@/lib/cors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // console.log("Creating payment intent:", body);

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
    if (!email || !packageId || !period || !amount || !orderId) {
      return corsResponse({ error: "Missing required fields" }, { status: 400 });
    }

    // Determine package name and make sure it's LOWERCASE
    let finalPackageName = "free"; // default
    if (packageName) {
      finalPackageName = packageName.toLowerCase();
    } else if (packageId) {
      const cleanPackageId = packageId.replace("pkg_", "").toLowerCase();
      if (["pro", "plus", "free"].includes(cleanPackageId)) {
        finalPackageName = cleanPackageId;
      }
    }

    // console.log("Final package name (lowercase):", finalPackageName);

    // Insert or update payment intent
    const { data, error } = await supabase
      .from("payment_intent")
      .upsert(
        {
          email: email,
          order_id: orderId,
          package_id: packageId,
          package_name: finalPackageName,
          period: period,
          amount: Number(amount),
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "order_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("Error creating payment intent:", error);
      return corsResponse(
        { error: "Failed to create payment intent", details: error.message },
        { status: 500 }
      );
    }

    // console.log("Payment intent created successfully with lowercase package_name:", data);

    return corsResponse({
      success: true,
      data: data,
    });
  } catch (error: any) {
    console.error("Payment intent creation error:", error);
    return corsResponse(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

