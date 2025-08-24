"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Check, Tag, X, Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import Celebration from "@/components/widget/celebration-confetti";
import { createAIPackagePayment, handleMidtransPayment, PackageDetails } from "@/services/payment";
import { useAuth } from "@/context/auth-context"; // Use JWT auth context instead of supabase
import { jwtService } from "@/lib/jwt-service";
import { validateAndSavePromoCode, getLatestPromoCode, deletePromoCode } from "@/lib/pricing-code";
import { useMidtransSnap } from "@/hooks/useMidtransSnap";

type PlanType = "free" | "plus" | "pro";

interface PricingPlan {
  type: PlanType;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
}

interface PromoCode {
  code: string;
  discount: number;
  description: string;
}

// Add Window interface augmentation for Midtrans Snap
declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: any) => void;
    };
  }
}

const pricingPlans: PricingPlan[] = [
  {
    type: "free",
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
  },
  {
    type: "plus",
    name: "Plus",
    monthlyPrice: 70000,
    yearlyPrice: 58000,
  },
  {
    type: "pro",
    name: "Pro",
    monthlyPrice: 140000,
    yearlyPrice: 116000,
  },
];

// Dummy promo codes
const promoCodes: PromoCode[] = [
  {
    code: "mechaminds",
    discount: 10,
    description: "Diskon 10% untuk komunitas MechaMinds",
  },
  {
    code: "smksuhat",
    discount: 40,
    description: "Diskon 40% untuk SMK Suhat",
  },
  {
    code: "indonesiaemas",
    discount: 20,
    description: "Diskon 20% untuk Indonesia Emas",
  },
];

// Define a proper interface for payment details
interface PaymentRequestDetails {
  order_id: string;
  amount: number;
  item_name: string;
  package_name: string;
  period: string;
  phone?: string;
}

// Define interfaces for Midtrans callback responses
interface MidtransResult {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
}

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [activeMembershipType, setActiveMembershipType] = useState<PlanType>("free");

  // Promo code states
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [isPromoDialogOpen, setIsPromoDialogOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [midtransError, setMidtransError] = useState<string | null>(null);
  const [midtransStatus, setMidtransStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const { toast } = useToast();
  const router = useRouter();

  // Use JWT auth context instead of manual auth handling
  const { user: currentUser, loading: isAuthLoading } = useAuth();

  // Add Midtrans Snap hook with better error handling
  const {
    isLoading: isLoadingMidtrans,
    isReady: isMidtransReady,
    error: midtransLoadError,
    retryCount
  } = useMidtransSnap({
    onReady: () => {
      // console.log("✅ Midtrans Snap is ready to use");
      setMidtransStatus('ready');
    },
    onError: (error) => {
      console.error("❌ Midtrans Snap loading error:", error);
      setMidtransStatus('error');
      setMidtransError(error.message);
    },
    maxRetries: 3
  });

  // Effect to display Midtrans status changes
  useEffect(() => {
    if (midtransLoadError && retryCount >= 3) {
      toast({
        title: "Payment System Error",
        description: "Failed to load payment system after multiple attempts. Please refresh the page or try again later.",
        variant: "destructive",
      });
    }
  }, [midtransLoadError, retryCount, toast]);

  // Load Midtrans script explicitly when component mounts
  useEffect(() => {
    // Create a check to see if Midtrans is available globally first
    const checkMidtransGlobal = () => {
      if (typeof window !== 'undefined') {
        if (window.snap) {
          // console.log("✅ Midtrans Snap detected on window object");
          setMidtransStatus('ready');
          return true;
        }

        // Check if script tag exists
        const scriptExists = !!document.querySelector('script[src*="snap.js"]');
        // console.log("Midtrans script tag exists:", scriptExists);

        return false;
      }
      return false;
    };

    // Only proceed if Midtrans is not already available
    if (!checkMidtransGlobal()) {
      // console.log("🔄 Midtrans not found, will initialize via hook");
    }
  }, []);

  // Update membership type when user data changes
  useEffect(() => {
    if (currentUser && currentUser.account_membership) {
      setActiveMembershipType(currentUser.account_membership as PlanType);
    }
  }, [currentUser]);

  // Effect to display Midtrans errors
  useEffect(() => {
    if (midtransLoadError) {
      toast({
        title: "Payment System Error",
        description: "Failed to load payment system. Please try again later.",
        variant: "destructive",
      });
    }
  }, [midtransLoadError, toast]);

  // Test Midtrans loading on component mount
  useEffect(() => {
    const testMidtransLoading = async () => {
      // console.log("=== TESTING MIDTRANS LOADING ===");
      // console.log("Environment check:");
      // console.log("- CLIENT_KEY:", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ? 'Set' : 'Missing');
      // console.log("- SNAP_URL:", process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL);
      // console.log("- User authenticated:", !!currentUser);
      // console.log("- JWT valid:", jwtService.isAuthenticated());

      if (typeof window !== "undefined") {
        // console.log("Browser environment detected");
        // console.log("Initial window.snap:", typeof window.snap);

        try {
          await import("@/services/payment");
          // console.log("Payment service imported successfully");
        } catch (importError) {
          console.error("Error importing payment service:", importError);
        }
      }
    };

    testMidtransLoading();
  }, [currentUser]);

  // Function to handle when user is not authenticated
  const promptLogin = () => {
    // console.log("🚨 promptLogin triggered - Authentication check failed");
    // console.log("Current JWT token:", jwtService.getToken() || "No token found");
    // console.log("Is JWT authenticated:", jwtService.isAuthenticated());
    if (currentUser) {
      // console.log("User context exists but JWT validation failed:", {
      //   userId: currentUser.id,
      //   email: currentUser.email,
      // });
    } else {
      // console.log("No user found in context");
    }

    jwtService.clearTokens(); // Clear any invalid tokens

    toast({
      title: "Login Required",
      description: "Please login to continue with your purchase.",
      variant: "destructive",
    });
    router.push("/login?redirect=/pricing");
  };

  // Function to validate and apply promo code
  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError("Masukkan kode promo terlebih dahulu");
      return;
    }

    if (!currentUser?.email) {
      promptLogin();
      return;
    }

    setIsApplyingPromo(true);
    setPromoError("");

    try {
      // First check if the promo code is valid without making API calls
      const foundPromo = await validateAndSavePromoCode(currentUser.email, promoCode);

      if (foundPromo) {
        setAppliedPromo(foundPromo);
        setPromoCode("");
        setIsPromoDialogOpen(false);
        setShowCelebration(true);

        toast({
          title: "Kode Promo Berhasil Diterapkan! 🎉",
          description: `${foundPromo.description} - Hemat ${foundPromo.discount}%`,
        });

        setTimeout(() => {
          setShowCelebration(false);
        }, 4000);
      } else {
        setPromoError("Kode promo tidak valid atau sudah kadaluarsa");
        toast({
          title: "Kode Promo Tidak Valid",
          description: "Periksa kembali kode promo yang Anda masukkan",
          variant: "destructive",
        });
      }
    } catch (error) {
      // Handle any unexpected errors gracefully
      // console.error("Error applying promo code:", error);

      // Last resort fallback - check directly against available promo codes
      const { checkPromoCode } = await import("@/lib/pricing-code");
      const directPromo = checkPromoCode(promoCode);

      if (directPromo) {
        setAppliedPromo(directPromo);
        setPromoCode("");
        setIsPromoDialogOpen(false);
        setShowCelebration(true);

        toast({
          title: "Kode Promo Berhasil Diterapkan! 🎉",
          description: `${directPromo.description} - Hemat ${directPromo.discount}%`,
          duration: 5000,
        });

        setTimeout(() => {
          setShowCelebration(false);
        }, 4000);
      } else {
        setPromoError("Terjadi kesalahan saat memproses kode promo");
        toast({
          title: "Gagal Memproses Kode Promo",
          description: "Silakan coba lagi nanti",
          variant: "destructive",
        });
      }
    } finally {
      setIsApplyingPromo(false);
    }
  };

  // Updated payment handler to use JWT authentication
  const handlePayment = async (e: React.MouseEvent, packageType: PlanType) => {
    e.preventDefault();
    e.stopPropagation();

    // console.log("🔍 handlePayment initiated for package:", packageType);
    // console.log("Midtrans status:", midtransStatus);

    // Check if Midtrans is ready
    if (midtransStatus !== 'ready' || !isMidtransReady) {
      console.warn("⚠️ Midtrans Snap is not ready yet");

      // If still loading, show loading message
      if (isLoadingMidtrans || midtransStatus === 'loading') {
        toast({
          title: "Payment System Loading",
          description: "Payment system is still loading. Please wait a moment and try again.",
          variant: "default",
        });
        return;
      }

      // If error loading Midtrans, show error message
      if (midtransLoadError || midtransStatus === 'error') {
        toast({
          title: "Payment System Error",
          description: "Failed to load payment system. Please refresh the page or try again later.",
          variant: "destructive",
        });
        return;
      }
    }

    // Check JWT authentication first
    const isJWTValid = jwtService.isAuthenticated();
    // console.log("JWT authentication check:", isJWTValid ? "✅ Valid" : "❌ Invalid");
    // console.log("Current user from context:", currentUser ? "Exists" : "Missing");

    // Only redirect to login if NOT authenticated
    if (!isJWTValid || !currentUser || !currentUser.email) {
      console.log("Authentication check failed:", {
        isJWTValid,
        hasUser: !!currentUser,
        hasEmail: currentUser?.email ? true : false
      });
      promptLogin();
      return;
    }

    setIsLoading(packageType);

    try {
      const userId = currentUser.id?.toString() || "";
      const period: "monthly" | "yearly" = isYearly ? "yearly" : "monthly";

      // console.log("Building package details for payment...");
      const packageDetails: PackageDetails = {
        packageId: `pkg_${packageType}`,
        packageName: packageType,
        price: isYearly ? pricingPlans.find((p) => p.type === packageType)?.yearlyPrice || 0 : pricingPlans.find((p) => p.type === packageType)?.monthlyPrice || 0,
        period,
        ...(appliedPromo?.code && { promoCode: appliedPromo.code }),
      };

      // Apply promo if available
      if (appliedPromo) {
        packageDetails.price = getDiscountedPrice(packageDetails.price);
        // console.log("Applied promo discount:", appliedPromo.code, appliedPromo.discount + "%");
      }

      const customerInfo = {
        firstName: currentUser.nama_lengkap || "User",
        email: currentUser.email,
        phone: currentUser.nomor_telepon || "",
      };

      console.log("Creating payment with:", {
        userId,
        packageType,
        finalPrice: packageDetails.price,
        email: customerInfo.email
      });

      // Create payment token via API
      const paymentResult = await createAIPackagePayment(userId, packageDetails, customerInfo);

      // console.log("Payment creation result:", paymentResult);

      if (!paymentResult.token) {
        console.error("No token received from payment creation");
        throw new Error("Invalid payment token received");
      }

      if (typeof window === "undefined") {
        toast({
          title: "Payment Error",
          description: "Payment must be initiated from browser.",
          variant: "destructive",
        });
        setIsLoading(null);
        return;
      }

      // Check if window.snap exists before proceeding
      // console.log("Checking Midtrans Snap availability before showing popup...");
      // console.log("window.snap exists:", typeof window.snap !== "undefined");

      if (!window.snap) {
        console.error("⚠️ Midtrans Snap is not available on window object!");

        // Try one more time to load Midtrans
        toast({
          title: "Initializing Payment System",
          description: "Please wait while we initialize the payment system...",
        });

        // Attempt to load the script directly
        const midtransUrl = process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || 'https://app.sandbox.midtrans.com/snap/snap.js';
        const midtransClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';

        // Create and append the script
        const script = document.createElement('script');
        script.src = midtransUrl;
        script.setAttribute('data-client-key', midtransClientKey);
        script.id = 'midtrans-fallback-script';
        script.async = true;
        document.body.appendChild(script);

        // Wait for script to load
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Midtrans script loading timed out'));
          }, 10000);

          script.onload = () => {
            clearTimeout(timeout);
            // Wait a bit for snap to initialize
            setTimeout(() => {
              if (window.snap) {
                resolve();
              } else {
                reject(new Error('Midtrans Snap object not available after script load'));
              }
            }, 1000);
          };

          script.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('Failed to load Midtrans script'));
          };
        });

        if (!window.snap) {
          throw new Error('Failed to initialize Midtrans Snap');
        }
      }

      // Show Snap Midtrans popup
      // console.log("Showing Midtrans payment popup with token:", paymentResult.token);

      if (window.snap) {
        await handleMidtransPayment(paymentResult.token, {
          onSuccess: async (result) => {
            // console.log("Payment success callback received:", result);
            try {
              const statusResponse = await fetch("/api/payment/check-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: paymentResult.orderId }),
              });

              if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                // console.log("Payment status check result:", statusData);
                if (statusData.status === "success") {
                  toast({
                    title: "Pembayaran Berhasil",
                    description: "Terima kasih, pembayaran Anda berhasil dan membership telah diperbarui.",
                  });
                  setActiveMembershipType(packageType);
                } else {
                  toast({
                    title: "Pembayaran Dikonfirmasi",
                    description: "Pembayaran sedang diproses, mohon tunggu beberapa saat.",
                  });
                }
              } else {
                toast({
                  title: "Pembayaran Berhasil",
                  description: "Pembayaran berhasil, membership akan diperbarui segera.",
                });
              }
            } catch (statusError) {
              console.error("Error checking payment status:", statusError);
              toast({
                title: "Pembayaran Berhasil",
                description: "Pembayaran berhasil, membership akan diperbarui segera.",
              });
            }
            setIsLoading(null);
            setTimeout(() => window.location.reload(), 3000);
          },
          onPending: (result) => {
            // console.log("Payment pending callback received:", result);
            toast({
              title: "Pembayaran Pending",
              description: "Pembayaran Anda masih diproses.",
            });
            setIsLoading(null);
          },
          onError: (result) => {
            console.error("Payment error callback received:", result);
            toast({
              title: "Pembayaran Gagal",
              description: "Terjadi kesalahan saat pembayaran.",
              variant: "destructive",
            });
            setIsLoading(null);
          },
          onClose: () => {
            // console.log("Payment popup closed by user");
            setIsLoading(null);
          },
        });
      } else {
        throw new Error("Midtrans Snap is not available");
      }
    } catch (error) {
      console.error("Error in handlePayment:", error);
      if (error instanceof Error && error.message.includes("Authentication")) {
        // console.log("Authentication error detected, redirecting to login");
        promptLogin();
      } else {
        toast({
          title: "Error",
          description: `Payment process failed: ${error instanceof Error ? error.message : String(error)}`,
          variant: "destructive",
        });
      }
      setIsLoading(null);
    }
  };

  async function createPayment(paymentDetails: PaymentRequestDetails): Promise<any> {
    try {
      // console.log("📊 Creating payment with details:", paymentDetails);

      // Get access token from JWT service
      const accessToken = jwtService.getToken();
      // console.log("JWT token available:", !!accessToken);

      if (!accessToken) {
        console.error("No access token available!");
        throw new Error("Not authenticated. Please login first.");
      }

      // console.log("Making API request to /api/create-payment");
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(paymentDetails),
      });

      // console.log("API response status:", response.status);
      const data = await response.json();
      // console.log("API response data:", data);

      if (!response.ok) {
        console.error("API returned error:", data.error);
        throw new Error(data.error || "Payment creation failed");
      }

      // Check if window.snap exists before calling it
      // console.log("Checking Midtrans Snap availability...");
      if (typeof window !== 'undefined') {
        // console.log("Window is defined");
        // console.log("window.snap exists:", !!window.snap);

        if (window.snap) {
          // console.log("Showing Midtrans payment popup with token:", data.token);
          window.snap.pay(data.token, {
            onSuccess: function (result: MidtransResult) {
              // console.log('Payment success:', result);
              // Handle success here
            },
            onPending: function (result: MidtransResult) {
              // console.log('Payment pending:', result);
              // Handle pending here
            },
            onError: function (result: MidtransResult) {
              console.error('Payment error:', result);
              // Handle error here
            },
            onClose: function () {
              // console.log('Customer closed the payment window');
              // Handle customer closing the popup
            },
          });
        } else {
          console.error("Midtrans Snap not available on window!");
          // console.log("Checking for Midtrans script...");
          // console.log("Midtrans script loaded:", !!document.querySelector('script[src*="snap.js"]'));
          // console.log("All scripts on page:", Array.from(document.scripts).map(s => s.src));
          throw new Error("Midtrans Snap is not available. Please try again later.");
        }
      } else {
        console.error("Window is undefined - can't show payment popup");
        throw new Error("Payment must be initiated from browser environment");
      }

      return data;
    } catch (error) {
      console.error("Payment error:", error);
      throw error;
    }
  }

  // Function to remove applied promo
  const removePromo = async () => {
    if (currentUser?.email && appliedPromo) {
      await deletePromoCode(currentUser.email, appliedPromo.code);
    }
    setAppliedPromo(null);
    setPromoError("");
    toast({
      title: "Kode Promo Dihapus",
      description: "Kode promo telah dihapus dari pesanan Anda",
    });
  };

  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser && currentUser.account_membership) {
        setActiveMembershipType(currentUser.account_membership as PlanType);

        // Load saved promo code
        if (currentUser.email) {
          const savedPromo = await getLatestPromoCode(currentUser.email);
          if (savedPromo) {
            setAppliedPromo(savedPromo);
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 4000);
          }
        }
      }
    };

    loadUserData();
  }, [currentUser]);

  // Function to calculate discounted price
  const getDiscountedPrice = (originalPrice: number) => {
    if (!appliedPromo || originalPrice === 0) return originalPrice;
    const discountAmount = (originalPrice * appliedPromo.discount) / 100;
    return originalPrice - discountAmount;
  };

  // Function to get discount amount
  const getDiscountAmount = (originalPrice: number) => {
    if (!appliedPromo || originalPrice === 0) return 0;
    return (originalPrice * appliedPromo.discount) / 100;
  };

  const freeFeatures = ["Akses model AI dasar", "5.000 token per hari", "Kecepatan respons standar", "Fitur chat dasar", "3 histori percakapan", "Tanpa dukungan API", "Dukungan email standar"];

  const plusFeatures = ["Akses semua model AI umum", "25.000 token per hari", "Kecepatan respons lebih cepat", "Fitur chat lanjutan", "Penyimpanan histori 30 hari", "Akses API dasar", "Plugin dan ekstensi terbatas", "Dukungan prioritas"];

  const proFeatures = [
    "Akses semua model AI premium",
    "Token tidak terbatas",
    "Kecepatan respons tercepat",
    "Analisis data lanjutan",
    "Penyimpanan histori tak terbatas",
    "Akses API penuh",
    "Semua plugin dan ekstensi",
    "Dukungan prioritas 24/7",
  ];

  return (
    <>
      {/* Celebration Component */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 pointer-events-none">
            <Celebration />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }} className="min-h-screen bg-white lg:py-16 py-8 px-4 mt-16">
        <div className="w-full mx-auto">
          {/* Header Section */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7 }} className="lg:text-center text-start lg:mb-16 mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Paket Model <span className="text-teal-600 cardo italic">AI Pintar</span>
              <br />
              <span className="text-gray-900">untuk Setiap Kebutuhan</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">Pilih model AI yang sesuai dengan kebutuhan Anda. Dari pengguna pribadi hingga perusahaan besar, kami memiliki solusi yang tepat untuk Anda.</p>

            {/* Toggle Switch */}
            <div className="flex lg:items-center lg:justify-center justify-start gap-4 lg:mb-12 mb-2">
              <span className={`text-sm font-medium ${!isYearly ? "text-teal-600" : "text-gray-500"}`}>Bulanan</span>
              <button onClick={() => setIsYearly(!isYearly)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isYearly ? "bg-teal-600" : "bg-gray-300"}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isYearly ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <span className={`text-sm font-medium ${isYearly ? "text-teal-600" : "text-gray-500"}`}>Tahunan</span>
            </div>
          </motion.div>
          {/* Pricing Cards */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.15 },
              },
            }}
            className="grid md:grid-cols-3 gap-8 container mx-auto px-0 md:px-6"
          >
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 relative"
            >
              <div className="mb-2 bg-gray-100 px-4 py-2 rounded-xl">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Free</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">0</span>
                  <span className="text-gray-600">Rp/Bulan</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Tanpa biaya berlangganan</p>
                <p className="text-sm text-gray-600 mt-4">Untuk pengguna individu yang ingin mencoba kemampuan AI.</p>
              </div>
              <div className="mb-8 p-4">
                <h4 className="font-semibold text-gray-900 mb-4">Fitur</h4>
                <p className="text-sm text-gray-600 mb-4">Termasuk:</p>
                <ul className="space-y-3">
                  {freeFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                className="w-full bg-white rounded-xl text-gray-900 border border-gray-300 hover:bg-gray-50"
                onClick={(e) => handlePayment(e, "free")}
                onMouseDown={(e) => e.preventDefault()}
                disabled={isAuthLoading || isLoading !== null || activeMembershipType === "free"}
              >
                {isAuthLoading ? "Loading..." : activeMembershipType === "free" ? "Membership Aktif" : "Mulai Gratis"}
              </Button>
            </motion.div>

            {/* Plus Plan */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 relative"
            >
              <div className="mb-1 bg-teal-600/15 px-4 py-2 rounded-xl">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Plus</h3>
                <div className="space-y-2">
                  {appliedPromo && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 line-through">Rp {(isYearly ? 58000 : 70000).toLocaleString("id-ID")}</span>
                      <Badge className="bg-red-500 hover:bg-red-500 text-white text-xs animate-pulse">-{appliedPromo.discount}%</Badge>
                    </motion.div>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">{getDiscountedPrice(isYearly ? 58000 : 70000).toLocaleString("id-ID")}</span>
                    <span className="text-gray-600">Rp/Bulan</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {isYearly ? `Rp ${getDiscountedPrice(696000).toLocaleString("id-ID")} ditagih per tahun` : "Ditagih bulanan"}
                  {isYearly && !appliedPromo && <span className="ml-1 text-teal-600 font-medium">(Hemat 17%)</span>}
                </p>
                {appliedPromo && (
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-teal-600 font-medium mt-1">
                    Hemat Rp {getDiscountAmount(isYearly ? 696000 : 70000).toLocaleString("id-ID")} dengan kode promo!
                  </motion.p>
                )}
                <p className="text-sm text-gray-600 mt-4">Untuk profesional yang membutuhkan lebih banyak fitur AI.</p>
              </div>
              <div className="mb-8 p-4">
                <h4 className="font-semibold text-gray-900 mb-4">Fitur</h4>
                <p className="text-sm text-gray-600 mb-4">Termasuk semua fitur Free, plus:</p>
                <ul className="space-y-3">
                  {plusFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                className="w-full bg-teal-600 text-white hover:bg-teal-700 rounded-xl"
                onClick={(e) => handlePayment(e, "plus")}
                onMouseDown={(e) => e.preventDefault()}
                disabled={isAuthLoading || isLoading !== null || activeMembershipType === "plus"}
              >
                {isAuthLoading ? "Loading..." : isLoading === "plus" ? "Memproses..." : activeMembershipType === "plus" ? "Membership Aktif" : `Berlangganan ${isYearly ? "Tahunan" : "Bulanan"}`}
              </Button>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 relative"
            >
              <div className="mb-2 bg-gray-100 px-4 py-2 rounded-xl">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Pro</h3>
                <div className="space-y-2">
                  {appliedPromo && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 line-through">Rp {(isYearly ? 116000 : 140000).toLocaleString("id-ID")}</span>
                      <Badge className="bg-red-500 hover:bg-red-500 text-white text-xs animate-pulse">-{appliedPromo.discount}%</Badge>
                    </motion.div>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">{getDiscountedPrice(isYearly ? 116000 : 140000).toLocaleString("id-ID")}</span>
                    <span className="text-gray-600">Rp/Bulan</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {isYearly ? `Rp ${getDiscountedPrice(1392000).toLocaleString("id-ID")} ditagih per tahun` : "Ditagih bulanan"}
                  {isYearly && !appliedPromo && <span className="ml-1 text-teal-600 font-medium">(Hemat 17%)</span>}
                </p>
                {appliedPromo && (
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-teal-600 font-medium mt-1">
                    Hemat Rp {getDiscountAmount(isYearly ? 1392000 : 140000).toLocaleString("id-ID")} dengan kode promo!
                  </motion.p>
                )}
                <p className="text-sm text-gray-600 mt-4">Untuk tim dan perusahaan dengan kebutuhan AI tingkat lanjut.</p>
              </div>
              <div className="mb-8 p-4">
                <h4 className="font-semibold text-gray-900 mb-4">Fitur</h4>
                <p className="text-sm text-gray-600 mb-4">Termasuk semua fitur Plus, plus:</p>
                <ul className="space-y-3">
                  {proFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                className="w-full rounded-xl bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
                onClick={(e) => handlePayment(e, "pro")}
                onMouseDown={(e) => e.preventDefault()}
                disabled={isAuthLoading || isLoading !== null || activeMembershipType === "pro"}
              >
                {isAuthLoading ? "Loading..." : isLoading === "pro" ? "Memproses..." : activeMembershipType === "pro" ? "Membership Aktif" : `Berlangganan ${isYearly ? "Tahunan" : "Bulanan"}`}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="container mx-auto px-4 md:px-6 mb-4"
      >
        <Button
          asChild
          className="bg-teal-600 text-white hover:bg-teal-700 rounded-xl px-6 py-3 text-sm md:text-base font-medium"
        >
          <a href="https://simulator.sandbox.midtrans.com/" target="_blank" rel="noopener noreferrer">
            Midtrans Payment Simulator
          </a>
        </Button>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, delay: 0.2 }} className="container mx-auto px-4 md:px-6">
        {appliedPromo ? (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Promo Digunakan</h3>
                    <p className="text-sm text-gray-500 mt-1">Code: {appliedPromo.code}</p>
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 bg-teal-50 rounded-full">
                    <Check className="h-5 w-5 text-teal-600" />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold text-gray-900">{appliedPromo.discount}%</span>
                    <span className="text-sm font-medium text-gray-600">OFF</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{appliedPromo.description}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-xl font-medium">Active</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="bg-gradient-to-r from-teal-50 to-teal-50 rounded-xl p-6 border border-teal-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-teal-100 rounded-full">
                <Gift className="h-5 w-5 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Hemat Lebih Banyak!</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Gunakan kode promo untuk mendapatkan diskon hingga 40% dari paket berlangganan Anda.</p>

            <Dialog open={isPromoDialogOpen} onOpenChange={setIsPromoDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-gradient-to-r rounded-xl from-teal-600 to-teal-600 hover:from-teal-700 hover:to-teal-700 text-white">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Masukkan Kode Promo
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md border-0 p-0 bg-transparent shadow-2xl">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
                  {/* Background decoration */}
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-teal-500/10" />
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-400/50 to-transparent" />

                  <div className="relative p-6">
                    <DialogHeader className="text-center mb-6">
                      <div className="mx-auto w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                        <Gift className="h-6 w-6 text-white" />
                      </div>
                      <DialogTitle className="text-xl font-semibold text-white">Masukkan Kode Promo</DialogTitle>
                      <p className="text-sm text-gray-300 mt-2">Dapatkan diskon menarik dengan memasukkan kode promo yang valid</p>
                    </DialogHeader>

                    <div className="space-y-6">
                      <AnimatePresence mode="wait">
                        {appliedPromo ? (
                          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                            <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Check className="h-8 w-8 text-white" />
                            </div>
                            <p className="text-teal-400 font-medium">Kode promo berhasil diterapkan!</p>
                            <p className="text-gray-300 text-sm mt-1">Kode: {appliedPromo}</p>
                          </motion.div>
                        ) : (
                          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                            <div className="space-y-3">
                              <div className="flex gap-3">
                                <div className="relative flex-1">
                                  <Input
                                    placeholder="Masukkan kode promo"
                                    value={promoCode}
                                    onChange={(e) => {
                                      setPromoCode(e.target.value.toUpperCase());
                                      setPromoError("");
                                    }}
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-teal-400 focus:ring-teal-400/20 rounded-xl h-12 uppercase font-mono"
                                    onKeyPress={(e) => {
                                      if (e.key === "Enter") {
                                        validatePromoCode();
                                      }
                                    }}
                                  />
                                </div>
                                <Button
                                  onClick={validatePromoCode}
                                  disabled={isApplyingPromo || !promoCode.trim()}
                                  className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white border-0 rounded-xl h-12 px-6 font-medium shadow-lg disabled:opacity-50"
                                >
                                  {isApplyingPromo ? (
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                      Validasi...
                                    </div>
                                  ) : (
                                    "Terapkan"
                                  )}
                                </Button>
                              </div>

                              <AnimatePresence>
                                {promoError && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl"
                                  >
                                    <X className="h-4 w-4 flex-shrink-0" />
                                    {promoError}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            <div className="border-t border-white/10 pt-6">
                              <p className="text-sm font-medium text-gray-300 mb-4">Kode promo yang tersedia:</p>
                              <div className="space-y-3">
                                {promoCodes.map((promo, index) => (
                                  <motion.div
                                    key={promo.code}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="group p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 hover:border-teal-400/30 transition-all duration-200"
                                    onClick={() => setPromoCode(promo.code.toUpperCase())}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                          <Badge variant="outline" className="font-mono text-xs bg-gradient-to-r from-teal-500/20 to-teal-500/20 border-teal-400/30 text-teal-300">
                                            {promo.code.toUpperCase()}
                                          </Badge>
                                          <span className="text-sm font-semibold text-teal-400">-{promo.discount}%</span>
                                        </div>
                                        <p className="text-xs text-gray-400 leading-relaxed">{promo.description}</p>
                                      </div>
                                      <Tag className="h-4 w-4 text-gray-500 group-hover:text-teal-400 transition-colors ml-3" />
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </motion.div>
    </>
  );
}
