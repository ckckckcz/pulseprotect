"use client";

import { supabase } from "@/lib/supabase";

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

  // Make sure email is included in transaction_details as custom field
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
    custom_field1: packageDetails.period, // Store period as custom field
    custom_field2: customerInfo.email,    // Store email as custom field for backup
  };

  try {
    console.log("Creating payment with params:", transactionParams);

    const response = await fetch("/api/payment/create-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transactionParams),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Payment API error:", errorText);
      throw new Error(`Payment API error: ${response.status}`);
    }

    const paymentData = await response.json();
    console.log("Payment token created:", paymentData);

    // Pre-record the payment intent with customer email to ensure we have this data
    try {
      await fetch("/api/subscriptions/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          email: customerInfo.email,
          packageId: packageDetails.packageId,
          packageName: packageDetails.packageName,
          period: packageDetails.period,
          amount: packageDetails.price,
          orderId
        })
      });
    } catch (error) {
      console.warn("Failed to create payment intent, will try again after payment:", error);
    }

    return {
      orderId,
      token: paymentData.token,
      redirectUrl: paymentData.redirectUrl,
    };
  } catch (error) {
    console.error("Payment creation failed:", error);
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
    console.log("Loading Midtrans script...");
    await loadMidtransScript();

    console.log("Opening Midtrans Snap with token:", token);

    if (window.snap) {
      window.snap.pay(token, {
        onSuccess: callbacks.onSuccess,
        onPending: callbacks.onPending,
        onError: callbacks.onError,
        onClose: callbacks.onClose,
      });
    } else {
      throw new Error("Midtrans Snap not loaded");
    }

    return true;
  } catch (error) {
    console.error("Error handling Midtrans payment:", error);
    throw error;
  }
}

function loadMidtransScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.snap) {
      console.log("Midtrans Snap already loaded");
      resolve();
      return;
    }

    if (typeof window !== "undefined") {
      const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
      const snapUrl = process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || "https://app.sandbox.midtrans.com/snap/snap.js";

      console.log("Loading Midtrans script...");
      console.log("Using snap URL:", snapUrl);
      console.log("Client key:", clientKey ? `${clientKey.substring(0, 10)}...` : "Missing");

      const script = document.createElement("script");
      script.src = snapUrl;
      script.setAttribute("data-client-key", clientKey || "");
      script.onload = () => {
        console.log("Midtrans script loaded successfully");
        resolve();
      };
      script.onerror = (error) => {
        console.error("Error loading Midtrans script:", error);
        reject(error);
      };
      document.body.appendChild(script);
    } else {
      reject(new Error("Window not defined - script loading must be done client-side"));
    }
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

    // Log untuk debug
    console.log("RECORD PAYMENT PARAMS:", {
      userId,
      membershipType,
      orderId,
      amount,
      userEmail,
      period,
    });

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
      console.error("Failed to record payment:", errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("Payment record result:", result);
    return result;
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
