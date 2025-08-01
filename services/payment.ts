"use client";

import { supabase } from "@/lib/supabase";
import { httpClient } from "@/lib/http-client";
import { jwtService } from "@/lib/jwt-service";

export interface PackageDetails {
  packageId: string;
  packageName: string;
  price: number;
  period: "monthly" | "yearly";
}

export function generateOrderId(): string {
  const timestamp = new Date().getTime();
  const randomString = Math.random().toString(36).substring(2, 8);
  return `ORDER-${timestamp}-${randomString}`;
}

export async function createAIPackagePayment(
  userId: string,
  packageDetails: PackageDetails,
  customerInfo: {
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
  }
) {
  const orderId = generateOrderId();

  console.log("Creating payment with customer info:", { 
    name: customerInfo.firstName,
    email: customerInfo.email,
    phone: customerInfo.phone || "Not provided"
  });

  // Validate JWT authentication before proceeding
  if (!jwtService.isAuthenticated()) {
    console.error("JWT authentication failed in payment service");
    throw new Error("Authentication required for payment processing");
  }

  // Get user info from JWT token for additional validation
  const userFromToken = jwtService.getUserFromToken();
  console.log("JWT user validation:", {
    tokenValid: !!userFromToken,
    tokenEmail: userFromToken?.email,
    customerEmail: customerInfo.email,
    emailMatch: userFromToken?.email === customerInfo.email
  });

  if (!userFromToken) {
    console.error("No user found in JWT token");
    throw new Error("Invalid authentication token");
  }

  if (userFromToken.email !== customerInfo.email) {
    console.warn('Token email mismatch:', {
      tokenEmail: userFromToken.email,
      customerEmail: customerInfo.email
    });
  }

  const transactionParams = {
    transaction_details: {
      order_id: orderId,
      gross_amount: packageDetails.price,
    },
    customer_details: {
      first_name: customerInfo.firstName,
      last_name: customerInfo.lastName || "",
      email: customerInfo.email,
      phone: customerInfo.phone || "",
    },
    item_details: [
      {
        id: packageDetails.packageId,
        price: packageDetails.price,
        quantity: 1,
        name: packageDetails.packageName,
        category: "AI Model",
      },
    ],
    custom_field1: packageDetails.period,
    custom_field2: customerInfo.email,
    custom_field3: userId || "",
  };

  try {
    console.log("Creating payment with JWT authentication...");

    // Create payment intent with proper package_name
    try {
      const intentResponse = await httpClient.post("/api/subscriptions/create-intent", {
        userId,
        email: customerInfo.email,
        packageId: packageDetails.packageId,
        packageName: packageDetails.packageName, // Make sure this is properly set
        period: packageDetails.period,
        amount: packageDetails.price,
        orderId
      });
      
      console.log("Payment intent record created successfully:", intentResponse);
    } catch (intentError) {
      console.warn("Failed to create payment intent (non-critical):", intentError);
      // Continue with payment process even if intent creation fails
    }

    // Create payment token with JWT auth
    console.log("Requesting payment token from API...");
    
    try {
      const paymentData = await httpClient.post("/api/payment/create-token", transactionParams);
      console.log("Payment token created with JWT auth:", {
        hasToken: !!paymentData.token,
        hasRedirectUrl: !!paymentData.redirectUrl,
        success: paymentData.success
      });

      if (!paymentData.token) {
        throw new Error("No payment token received from API");
      }

      return {
        orderId,
        token: paymentData.token,
        redirectUrl: paymentData.redirectUrl,
      };
    } catch (apiError: any) {
      console.error("Payment API error:", apiError);
      console.error("API error details:", {
        message: apiError.message,
        status: apiError.status,
        stack: apiError.stack
      });
      throw new Error(`Payment API error: ${apiError.message}`);
    }
    
  } catch (error) {
    console.error("Payment creation failed:", error);
    
    // If JWT auth fails, redirect to login
    if (error instanceof Error && (
        error.message.includes('Authentication') || 
        error.message.includes('401') ||
        error.message.includes('Unauthorized')
      )) {
      console.log("Authentication error detected, clearing tokens");
      jwtService.clearTokens();
      
      if (typeof window !== 'undefined') {
        window.location.href = `/login?redirect=${encodeURIComponent('/pricing')}`;
      }
    }
    
    throw error;
  }
}

export async function handleMidtransPayment(
  token: string,
  callbacks: {
    onSuccess?: (result: any) => void;
    onPending?: (result: any) => void;
    onError?: (result: any) => void;
    onClose?: () => void;
  }
) {
  try {
    console.log("=== MIDTRANS PAYMENT HANDLER START ===");
    console.log("Token received:", token);
    console.log("Callbacks provided:", {
      onSuccess: !!callbacks.onSuccess,
      onPending: !!callbacks.onPending,
      onError: !!callbacks.onError,
      onClose: !!callbacks.onClose,
    });

    console.log("Loading Midtrans script...");
    await loadMidtransScript();
    console.log("Midtrans script loaded successfully");

    console.log("Checking window.snap availability...");
    console.log("window object exists:", typeof window !== "undefined");
    console.log("window.snap exists:", !!window.snap);
    console.log("window.snap type:", typeof window.snap);

    if (window.snap) {
      console.log("window.snap.pay exists:", typeof window.snap.pay === 'function');
      console.log("Opening Midtrans Snap with token:", token);
      
      try {
        window.snap.pay(token, {
          onSuccess: (result: any) => {
            console.log("=== PAYMENT SUCCESS ===", result);
            callbacks.onSuccess?.(result);
          },
          onPending: (result: any) => {
            console.log("=== PAYMENT PENDING ===", result);
            callbacks.onPending?.(result);
          },
          onError: (result: any) => {
            console.error("=== PAYMENT ERROR ===", result);
            callbacks.onError?.(result);
          },
          onClose: () => {
            console.log("=== PAYMENT CLOSED ===");
            callbacks.onClose?.();
          },
        });
        console.log("Snap.pay() called successfully");
      } catch (snapPayError) {
        console.error("Error calling snap.pay():", snapPayError);
        throw snapPayError;
      }
    } else {
      console.error("window.snap is not available after script loading");
      console.log("Available window properties:", Object.keys(window).filter(key => key.includes('snap') || key.includes('Snap') || key.includes('midtrans')));
      throw new Error("Midtrans Snap not loaded properly");
    }

    return true;
  } catch (error) {
    console.error("=== MIDTRANS PAYMENT HANDLER ERROR ===");
    console.error("Error details:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack available');
    throw error;
  }
}

function loadMidtransScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log("=== LOADING MIDTRANS SCRIPT ===");
    
    if (typeof window === "undefined") {
      console.error("Window is undefined - cannot load script");
      reject(new Error("Window not defined - script loading must be done client-side"));
      return;
    }

    // Check if script is already loaded
    if (window.snap) {
      console.log("Midtrans Snap already loaded");
      resolve();
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[data-client-key]');
    if (existingScript) {
      console.log("Midtrans script tag already exists, waiting for load...");
      
      // Wait a bit and check again
      setTimeout(() => {
        if (window.snap) {
          console.log("Midtrans Snap loaded from existing script");
          resolve();
        } else {
          console.log("Existing script didn't load snap, removing and retrying...");
          existingScript.remove();
          loadMidtransScript().then(resolve).catch(reject);
        }
      }, 1000);
      return;
    }

    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    const snapUrl = process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || "https://app.sandbox.midtrans.com/snap/snap.js";

    console.log("Environment variables:");
    console.log("- NEXT_PUBLIC_MIDTRANS_CLIENT_KEY:", clientKey ? `${clientKey.substring(0, 20)}...` : "Missing");
    console.log("- NEXT_PUBLIC_MIDTRANS_SNAP_URL:", snapUrl);

    if (!clientKey) {
      console.error("Missing NEXT_PUBLIC_MIDTRANS_CLIENT_KEY");
      reject(new Error("Missing Midtrans client key"));
      return;
    }

    console.log("Creating script element...");
    const script = document.createElement("script");
    script.src = snapUrl;
    script.setAttribute("data-client-key", clientKey);
    script.type = "text/javascript";
    
    // Add additional attributes for debugging
    script.id = "midtrans-snap-script";
    
    let loadTimeout: NodeJS.Timeout;
    
    script.onload = () => {
      console.log("Script onload event fired");
      clearTimeout(loadTimeout);
      
      // Give it a moment to initialize
      setTimeout(() => {
        console.log("Checking window.snap after script load...");
        console.log("window.snap exists:", !!window.snap);
        console.log("window.snap type:", typeof window.snap);
        
        if (window.snap) {
          console.log("Midtrans Snap loaded and available");
          resolve();
        } else {
          console.error("Script loaded but window.snap is still not available");
          console.log("Checking for alternative snap objects...");
          console.log("window.Snap:", typeof (window as any).Snap);
          console.log("window.midtrans:", typeof (window as any).midtrans);
          
          // Try to find snap in alternative locations
          if ((window as any).Snap) {
            console.log("Found window.Snap, assigning to window.snap");
            window.snap = (window as any).Snap;
            resolve();
          } else {
            reject(new Error("Midtrans Snap object not found after script load"));
          }
        }
      }, 500);
    };
    
    script.onerror = (error) => {
      console.error("Script onerror event fired:", error);
      clearTimeout(loadTimeout);
      console.error("Failed to load Midtrans script from:", snapUrl);
      reject(new Error(`Failed to load Midtrans script: ${error}`));
    };

    // Set a timeout for script loading
    loadTimeout = setTimeout(() => {
      console.error("Script loading timeout after 10 seconds");
      reject(new Error("Script loading timeout"));
    }, 10000);

    console.log("Appending script to document body...");
    console.log("Document ready state:", document.readyState);
    console.log("Script src:", script.src);
    console.log("Script data-client-key:", script.getAttribute("data-client-key"));
    
    document.body.appendChild(script);
    console.log("Script appended to body successfully");
  });
}

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
    const userEmail = email || 
                     paymentData.email || 
                     paymentData.custom_field2 || 
                     paymentData.customer_details?.email || 
                     "";

    // Get period from multiple possible sources
    const period = paymentData.custom_field1 || 
                  (membershipType.includes("yearly") ? "yearly" : "monthly");

    console.log("RECORD PAYMENT PARAMS:", {
      userId,
      membershipType,
      orderId,
      amount,
      userEmail,
      period,
    });

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
        console.error("Direct database insert failed:", error);
        // Continue to API call as fallback
      } else {
        console.log("Payment recorded directly to database");
        return { success: true, method: "direct" };
      }
    } catch (dbError) {
      console.error("Error in direct database recording:", dbError);
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
        packageName: `AI Model ${cleanMembershipType.charAt(0).toUpperCase() + cleanMembershipType.slice(1)}`,
        period,
        amount: Number(amount),
        orderId,
        paymentType: paymentMethod,
        paymentData,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to record payment via API:", errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("Payment record API result:", result);
    return { ...result, method: "api" };
  } catch (error) {
    console.error("Payment recording error:", error);
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
