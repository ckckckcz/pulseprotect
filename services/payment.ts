"use client";

import { supabase } from "@/lib/supabase";
import { httpClient } from "@/lib/http-client";
import { jwtService } from "@/lib/jwt-service";

export interface PackageDetails {
  packageId: string;
  packageName: string;
  price: number;
  period: "monthly" | "yearly";
  promoCode?: string;
}

interface CustomerInfo {
  firstName: string;
  email: string;
  phone?: string;
}

/**
 * Creates a payment token for an AI package subscription
 */
export const createAIPackagePayment = async (
  userId: string,
  packageDetails: PackageDetails,
  customerInfo: CustomerInfo
): Promise<{ token: string; redirectUrl?: string; orderId: string }> => {
  try {
    // Create a unique order ID
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const orderId = `order_${userId}_${packageDetails.packageName}_${timestamp}_${randomSuffix}`;

    // Ensure package name is lowercase to match constraint
    packageDetails.packageName = packageDetails.packageName.toLowerCase();

    // Create payment intent record (will be saved via API)
    const paymentIntent = await createPaymentIntent(
      customerInfo.email,
      packageDetails,
      orderId
    );

    // Create payment token
    const response = await fetch("/api/payment/create-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: orderId,
          gross_amount: packageDetails.price,
        },
        customer_details: {
          first_name: customerInfo.firstName,
          email: customerInfo.email,
          phone: customerInfo.phone || "",
        },
        item_details: [
          {
            id: packageDetails.packageId,
            price: packageDetails.price,
            quantity: 1,
            name: `${packageDetails.packageName.toUpperCase()} Package (${packageDetails.period})`,
            category: "AI Package",
          },
        ],
        custom_field1: packageDetails.period,
        custom_field2: customerInfo.email,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create payment token");
    }

    const data = await response.json();
    return {
      token: data.token,
      redirectUrl: data.redirectUrl,
      orderId: orderId,
    };
  } catch (error) {
    console.error("Error creating AI package payment:", error);
    throw error;
  }
};

/**
 * Handles Midtrans payment popup
 */
export const handleMidtransPayment = async (
  token: string,
  callbacks: {
    onSuccess?: (result: any) => void;
    onPending?: (result: any) => void;
    onError?: (result: any) => void;
    onClose?: () => void;
  }
) => {
  // console.log(
  //   "📣 handleMidtransPayment called with token:",
  //   token ? token.substring(0, 10) + "..." : "null"
  // );

  // Enhanced checking for Midtrans availability
  if (typeof window === "undefined") {
    // console.error("❌ Window is undefined, cannot show payment popup");
    throw new Error("Midtrans Snap is not available");
  }

  // Explicit check for window.snap
  if (!window.snap) {
    // console.error("❌ window.snap is not available!");

    // Final attempt to wait for snap to be available (might be in progress)
    let attempts = 0;
    const maxAttempts = 20; // Wait up to 10 seconds (20 * 500ms)

    while (!window.snap && attempts < maxAttempts) {
      // console.log(
      //   `Waiting for Midtrans Snap to be available (attempt ${attempts + 1}/${maxAttempts})...`
      // );
      await new Promise((resolve) => setTimeout(resolve, 500));
      attempts++;
    }

    if (!window.snap) {
      // console.error("❌ Midtrans Snap still not available after waiting");
      throw new Error(
        "Midtrans Snap is not available after waiting. Please refresh the page and try again."
      );
    } else {
      // console.log("✅ Midtrans Snap became available after waiting");
    }
  }

  // console.log("✅ window.snap is available, proceeding with payment");

  return new Promise((resolve, reject) => {
    try {
      window.snap!.pay(token, {
        onSuccess: (result: any) => {
          // console.log("Payment success:", result);
          if (callbacks.onSuccess) callbacks.onSuccess(result);
          resolve(result);
        },
        onPending: (result: any) => {
          // console.log("Payment pending:", result);
          if (callbacks.onPending) callbacks.onPending(result);
          resolve(result);
        },
        onError: (result: any) => {
          // console.error("Payment error:", result);
          if (callbacks.onError) callbacks.onError(result);
          reject(result);
        },
        onClose: () => {
          // console.log("Customer closed the payment popup");
          if (callbacks.onClose) callbacks.onClose();
          reject(new Error("Payment popup closed"));
        },
      });
    } catch (error) {
      // console.error("Error handling Midtrans payment:", error);
      reject(error);
    }
  });
};

function loadMidtransScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // console.log("=== LOADING MIDTRANS SCRIPT ===");

    if (typeof window === "undefined") {
      // console.error("Window is undefined - cannot load script");
      reject(
        new Error(
          "Window not defined - script loading must be done client-side"
        )
      );
      return;
    }

    // Check if script is already loaded
    if (window.snap) {
      // console.log("Midtrans Snap already loaded");
      resolve();
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src*="snap.js"]');
    if (existingScript) {
      // console.log("Midtrans script tag already exists, waiting for load...");

      // Wait a bit and check again
      setTimeout(() => {
        if (window.snap) {
          // console.log("Midtrans Snap loaded from existing script");
          resolve();
        } else {
          // console.log("Existing script didn't load snap, removing and retrying...");
          existingScript.remove();
          loadMidtransScript().then(resolve).catch(reject);
        }
      }, 1000);
      return;
    }

    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    const snapUrl =
      process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL ||
      "https://app.sandbox.midtrans.com/snap/snap.js";

    // console.log("Environment variables:");
    // console.log(
    //   "- NEXT_PUBLIC_MIDTRANS_CLIENT_KEY:",
    //   clientKey ? `${clientKey.substring(0, 20)}...` : "Missing"
    // );
    // console.log("- NEXT_PUBLIC_MIDTRANS_SNAP_URL:", snapUrl);

    if (!clientKey) {
      // console.error("Missing NEXT_PUBLIC_MIDTRANS_CLIENT_KEY");
      reject(new Error("Missing Midtrans client key"));
      return;
    }

    // console.log("Creating script element...");
    const script = document.createElement("script");
    script.src = snapUrl;
    script.setAttribute("data-client-key", clientKey);
    script.type = "text/javascript";

    // Add additional attributes for debugging
    script.id = "midtrans-snap-script";

    let loadTimeout: NodeJS.Timeout;

    script.onload = () => {
      // console.log("Script onload event fired");
      clearTimeout(loadTimeout);

      // Give it a moment to initialize
      setTimeout(() => {
        // console.log("Checking window.snap after script load...");
        // console.log("window.snap exists:", !!window.snap);
        // console.log("window.snap type:", typeof window.snap);

        if (window.snap) {
          // console.log("Midtrans Snap loaded and available");
          resolve();
        } else {
          // console.error("Script loaded but window.snap is still not available");
          // console.log("Checking for alternative snap objects...");
          // console.log("window.Snap:", typeof (window as any).Snap);
          // console.log("window.midtrans:", typeof (window as any).midtrans);

          // Try to find snap in alternative locations
          if ((window as any).Snap) {
            // console.log("Found window.Snap, assigning to window.snap");
            window.snap = (window as any).Snap;
            resolve();
          } else {
            reject(new Error("Midtrans Snap object not found after script load"));
          }
        }
      }, 500);
    };

    script.onerror = (error) => {
      // console.error("Script onerror event fired:", error);
      clearTimeout(loadTimeout);
      // console.error("Failed to load Midtrans script from:", snapUrl);
      reject(new Error(`Failed to load Midtrans script: ${error}`));
    };

    // Set a timeout for script loading
    loadTimeout = setTimeout(() => {
      // console.error("Script loading timeout after 10 seconds");
      reject(new Error("Script loading timeout"));
    }, 10000);

    // console.log("Appending script to document body...");
    // console.log("Document ready state:", document.readyState);
    // console.log("Script src:", script.src);
    // console.log("Script data-client-key:", script.getAttribute("data-client-key"));

    document.body.appendChild(script);
    // console.log("Script appended to body successfully");
  });
}

/**
 * Checks the status of a payment
 */
export const checkPaymentStatus = async (orderId: string) => {
  try {
    const response = await fetch("/api/payment/check-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId }),
    });

    if (!response.ok) {
      throw new Error("Failed to check payment status");
    }

    return await response.json();
  } catch (error) {
    // console.error("Error checking payment status:", error);
    throw error;
  }
};

/**
 * Gets the current user's active subscription
 */
export const getUserSubscription = async (email: string) => {
  try {
    // Get the most recent successful payment intent using direct REST API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const response = await fetch(
      `${supabaseUrl}/rest/v1/payment_intent?select=package_name,created_at,period,amount&email=eq.${encodeURIComponent(
        email
      )}&status=eq.success&order=created_at.desc&limit=1`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get subscription: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return null;
    }

    return data[0];
  } catch (error) {
    console.error("Error in getUserSubscription:", error);
    return null;
  }
};

// Update this function to better handle payment recording
export async function recordPayment(
  userId: number,
  membershipType: string,
  orderId: string,
  paymentData: any,
  email?: string
) {
  try {
    const amount = paymentData.gross_amount || 0;
    const paymentMethod = paymentData.payment_type || "unknown";
    const status = paymentData.transaction_status || "success";
    const cleanMembershipType = membershipType.replace("pkg_", "");

    // Get email from multiple possible sources
    const userEmail =
      email ||
      paymentData.email ||
      paymentData.custom_field2 ||
      paymentData.customer_details?.email ||
      "";

    // Get period from multiple possible sources
    const period =
      paymentData.custom_field1 ||
      (membershipType.includes("yearly") ? "yearly" : "monthly");

    // Try to record payment directly to database first
    try {
      const { error } = await supabase
        .from("payment")
        .insert({
          email: userEmail,
          membership_type: cleanMembershipType,
          order_id: orderId,
          transaction_type: "purchase",
          metode_pembayaran: paymentMethod,
          harga: Number(amount),
          status: "success",
        });

      if (error) {
        // console.error("Direct database insert failed:", error);
        // Continue to API call as fallback
      } else {
        return { success: true, method: "direct" };
      }
    } catch (dbError) {
      // console.error("Error in direct database recording:", dbError);
      // Continue to API call
    }

    // Fallback: Use API endpoint to record payment
    const response = await fetch("/api/subscriptions/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        email: userEmail,
        packageId: membershipType,
        packageName: `AI Model ${
          cleanMembershipType.charAt(0).toUpperCase() + cleanMembershipType.slice(1)
        }`,
        period,
        amount: Number(amount),
        orderId,
        paymentType: paymentMethod,
        paymentData,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // console.error("Failed to record payment via API:", errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return { ...result, method: "api" };
  } catch (error) {
    // console.error("Payment recording error:", error);
    throw error;
  }
}

// Interface for payment intent matching the database schema
export interface PaymentIntent {
  id?: number;
  email: string;
  order_id: string;
  package_id: string;
  package_name: string;
  period: "monthly" | "yearly";
  amount: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

// Function to create a new payment intent
export const createPaymentIntent = async (
  email: string,
  packageDetails: PackageDetails,
  orderId: string
): Promise<PaymentIntent> => {
  try {
    // Validate package_name to match constraint
    let validPackageName = packageDetails.packageName;
    if (!["free", "plus", "pro"].includes(validPackageName)) {
      validPackageName = "free"; // Default to free if invalid
    }

    // Validate period to match constraint
    let validPeriod = packageDetails.period;
    if (!["monthly", "yearly"].includes(validPeriod)) {
      validPeriod = "monthly"; // Default to monthly if invalid
    }

    const paymentIntent: PaymentIntent = {
      email,
      order_id: orderId,
      package_id: packageDetails.packageId,
      package_name: validPackageName,
      period: validPeriod,
      amount: packageDetails.price,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    return paymentIntent;
  } catch (error) {
    // console.error("Error creating payment intent:", error);
    throw error;
  }
}

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: any) => void;
    };
  }
}

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: any) => void;
    };
  }
}

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: any) => void;
    };
  }
}
