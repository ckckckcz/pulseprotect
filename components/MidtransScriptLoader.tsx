"use client";

import { useEffect } from "react";
import Script from "next/script";

export default function MidtransScriptLoader() {
  useEffect(() => {
    // This will run after the script loads through the onLoad event
    const handleScriptLoad = () => {
      console.log("✅ Midtrans script loaded successfully in client component");
      if (typeof window !== 'undefined') {
        (window as any).__MIDTRANS_LOADED = true;
      }
    };

    // Handle script error
    const handleScriptError = () => {
      console.error("❌ Error loading Midtrans script in client component");
      if (typeof window !== 'undefined') {
        (window as any).__MIDTRANS_LOADED = false;
      }
    };

    // Listen for custom events that will be triggered when the script loads or errors
    window.addEventListener("midtrans-script-loaded", handleScriptLoad);
    window.addEventListener("midtrans-script-error", handleScriptError);

    // Cleanup listeners
    return () => {
      window.removeEventListener("midtrans-script-loaded", handleScriptLoad);
      window.removeEventListener("midtrans-script-error", handleScriptError);
    };
  }, []);

  return (
    <Script
      id="midtrans-script"
      src={process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || "https://app.sandbox.midtrans.com/snap/snap.js"}
      data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
      strategy="afterInteractive"
      onLoad={() => {
        window.dispatchEvent(new Event("midtrans-script-loaded"));
      }}
      onError={() => {
        window.dispatchEvent(new Event("midtrans-script-error"));
      }}
    />
  );
}
