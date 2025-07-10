"use client"

import { useState, useEffect } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-service"

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const freeFeatures = [
    "Akses model AI dasar",
    "5.000 token per hari",
    "Kecepatan respons standar",
    "Fitur chat dasar",
    "3 histori percakapan",
    "Tanpa dukungan API",
    "Dukungan email standar",
  ]

  const plusFeatures = [
    "Akses semua model AI umum",
    "25.000 token per hari",
    "Kecepatan respons lebih cepat",
    "Fitur chat lanjutan",
    "Penyimpanan histori 30 hari",
    "Akses API dasar",
    "Plugin dan ekstensi terbatas",
    "Dukungan prioritas",
  ]

  const proFeatures = [
    "Akses semua model AI premium",
    "Token tidak terbatas",
    "Kecepatan respons tercepat",
    "Analisis data lanjutan",
    "Penyimpanan histori tak terbatas",
    "Akses API penuh",
    "Semua plugin dan ekstensi",
    "Dukungan prioritas 24/7",
  ]

  // Function to load Midtrans script
  const loadMidtransScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if snap is already loaded
      if ((window as any).snap) {
        console.log('Midtrans Snap already loaded');
        resolve();
        return;
      }

      const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-XFRfqvTOMmYZa4mu';
      const snapUrl = process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || 'https://app.sandbox.midtrans.com/snap/snap.js';
      
      console.log('Loading Midtrans script with URL:', snapUrl);
      console.log('Client key:', clientKey.substring(0, 10) + '...');

      const script = document.createElement('script');
      script.src = snapUrl;
      script.setAttribute('data-client-key', clientKey);
      
      script.onload = () => {
        console.log('Midtrans script loaded successfully');
        resolve();
      };
      
      script.onerror = (error) => {
        console.error('Failed to load Midtrans script:', error);
        reject(error);
      };
      
      document.head.appendChild(script);
    });
  };

  // Function to create payment
  const createPayment = async (packageDetails: any, customerInfo: any) => {
    const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    
    const params = {
      transaction_details: {
        order_id: orderId,
        gross_amount: packageDetails.price,
      },
      customer_details: {
        first_name: customerInfo.firstName,
        last_name: customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone || '08123456789',
      },
      item_details: [
        {
          id: packageDetails.packageId,
          price: packageDetails.price,
          quantity: 1,
          name: packageDetails.packageName,
          category: 'AI Model Subscription',
          merchant_name: 'Smart City AI'
        },
      ],
      // Add additional details for better transaction data
      custom_field1: packageDetails.period,
      custom_field2: 'AI Subscription',
      custom_expiry: {
        order_time: new Date().toISOString(),
        expiry_duration: 60,
        unit: 'minute'
      }
    };

    console.log('Creating payment with params:', params);

    try {
      const response = await fetch('/api/payment/create-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Payment token result:', result);
      
      return result;
    } catch (error) {
      console.error('Payment creation error:', error);
      throw error;
    }
  };

  // Updated handlePayment to handle all plan types including Free
  const handlePayment = async (packageType: 'free' | 'plus' | 'pro') => {
    try {
      // For free plan, just show a success message or redirect
      if (packageType === 'free') {
        toast({
          title: "Paket Gratis Diaktifkan!",
          description: "Selamat menikmati paket AI dasar kami.",
        });
        
        // Optional: redirect to dashboard or account page
        // router.push('/dashboard');
        return;
      }
      
      setIsLoading(packageType);
      console.log('Starting payment process for:', packageType);
      
      const currentUser = getCurrentUser();
      console.log('Current user:', currentUser);
      
      if (!currentUser) {
        toast({
          title: "Login Diperlukan",
          description: "Silakan login terlebih dahulu untuk melanjutkan pembayaran",
          variant: "destructive"
        });
        router.push('/login');
        return;
      }
      
      // Define package details based on type and billing period
      const packageDetails = {
        plus: {
          packageId: 'pkg_plus',
          packageName: isYearly ? 'AI Model Plus (Tahunan)' : 'AI Model Plus (Bulanan)',
          price: isYearly ? 696000 : 70000,
          period: isYearly ? 'yearly' : 'monthly',
        },
        pro: {
          packageId: 'pkg_pro',
          packageName: isYearly ? 'AI Model Pro (Tahunan)' : 'AI Model Pro (Bulanan)',
          price: isYearly ? 1392000 : 140000,
          period: isYearly ? 'yearly' : 'monthly',
        }
      };
      
      const selectedPackage = packageDetails[packageType];
      
      const customerInfo = {
        firstName: currentUser.nama_lengkap.split(' ')[0] || 'User',
        lastName: currentUser.nama_lengkap.split(' ').slice(1).join(' ') || '',
        email: currentUser.email,
        phone: '08123456789', // Default phone number
      };

      console.log('Package details:', selectedPackage);
      console.log('Customer info:', customerInfo);
      
      toast({
        title: "Memproses Pembayaran",
        description: "Mohon tunggu, sedang mempersiapkan pembayaran...",
      });
      
      // Load Midtrans script first
      console.log('Loading Midtrans script...');
      await loadMidtransScript();
      
      // Create payment token
      console.log('Creating payment token...');
      const paymentData = await createPayment(selectedPackage, customerInfo);
      
      if (!paymentData.token) {
        throw new Error('No payment token received');
      }
      
      console.log('Opening Snap with token:', paymentData.token);
      
      // Open Snap payment
      const snap = (window as any).snap;
      if (!snap) {
        throw new Error('Midtrans Snap not available');
      }
      
      snap.pay(paymentData.token, {
        onSuccess: function(result: any) {
          console.log('Payment success:', result);
          toast({
            title: "Pembayaran Berhasil! 🎉",
            description: `Terima kasih! Paket ${selectedPackage.packageName} Anda sudah aktif.`,
          });
          
          // Optional: Save subscription in local database
          saveSubscription(currentUser.id, selectedPackage, result);
          
          // Optional: Redirect to success page or dashboard
          // router.push('/dashboard');
        },
        onPending: function(result: any) {
          console.log('Payment pending:', result);
          toast({
            title: "Pembayaran Sedang Diproses",
            description: "Pembayaran Anda sedang diverifikasi.",
          });
        },
        onError: function(result: any) {
          console.log('Payment error:', result);
          toast({
            title: "Pembayaran Gagal",
            description: "Terjadi kesalahan dalam proses pembayaran.",
            variant: "destructive"
          });
        },
        onClose: function() {
          console.log('Payment popup closed');
          toast({
            title: "Pembayaran Dibatalkan",
            description: "Anda telah menutup halaman pembayaran.",
          });
        }
      });
      
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Terjadi Kesalahan",
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(null);
    }
  };
  
  // Function to save subscription to database
  const saveSubscription = async (userId: number, packageDetails: any, paymentResult: any) => {
    try {
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          packageId: packageDetails.packageId,
          packageName: packageDetails.packageName,
          period: packageDetails.period,
          amount: packageDetails.price,
          orderId: paymentResult.order_id,
          paymentType: paymentResult.payment_type,
          paymentData: paymentResult
        })
      });
      
      if (!response.ok) {
        console.error('Failed to save subscription:', await response.text());
      }
    } catch (error) {
      console.error('Error saving subscription:', error);
    }
  };

  // Test button for debugging
  const testMidtrans = async () => {
    try {
      console.log('=== TESTING MIDTRANS INTEGRATION ===');
      
      // Test 1: Check environment variables
      console.log('Environment check:', {
        hasClientKey: !!process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
        clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY?.substring(0, 10) + '...',
        snapUrl: process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL,
      });
      
      // Test 2: Load script
      console.log('Loading Midtrans script...');
      await loadMidtransScript();
      console.log('Script loaded, window.snap available:', !!(window as any).snap);
      
      if (!(window as any).snap) {
        throw new Error('Midtrans Snap not loaded correctly');
      }
      
      // Test 3: Test API call with detailed error handling
      const testParams = {
        transaction_details: {
          order_id: `TEST-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          gross_amount: 10000,
        },
        customer_details: {
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          phone: '08123456789',
        },
        item_details: [
          {
            id: 'test_item',
            price: 10000,
            quantity: 1,
            name: 'Test Item',
            category: 'AI Package Test',
            merchant_name: 'Smart City AI'
          },
        ],
        // Add additional fields that might be required by Midtrans
        item_name: 'Test AI Package',
        item_category: 'Subscription',
        billing_address: {
          first_name: 'Test',
          last_name: 'User',
          address: 'Jl. Test',
          city: 'Jakarta',
          postal_code: '12345',
          phone: '08123456789',
          country_code: 'IDN'
        }
      };
      
      console.log('Testing API call...');
      console.log('Request params:', testParams);
      
      const response = await fetch('/api/payment/create-token', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(testParams),
        cache: 'no-store',
      });
      
      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Payment token result:', result);
      
      if (!result.token) {
        throw new Error('No token received from API');
      }
      
      // Test 4: Open Snap popup
      console.log('Opening Snap with token:', result.token);
      (window as any).snap.pay(result.token, {
        onSuccess: (r: any) => console.log('Test payment success:', r),
        onPending: (r: any) => console.log('Test payment pending:', r),
        onError: (r: any) => console.error('Test payment error:', r),
        onClose: () => console.log('Test payment closed')
      });
      
    } catch (error) {
      console.error('=== TEST FAILED ===');
      console.error('Test error:', error);
      alert(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Debug button - only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-center mb-4">
            <button 
              onClick={testMidtrans}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Test Midtrans (Debug)
            </button>
          </div>
        )}
        
        {/* Header Section */}
        <div className="text-center lg:mb-16 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Paket Model <span className="text-teal-600">AI Pintar</span>
            <br />
            <span className="text-gray-900">untuk Setiap Kebutuhan</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Pilih model AI yang sesuai dengan kebutuhan Anda. Dari pengguna pribadi hingga perusahaan besar,
            kami memiliki solusi yang tepat untuk Anda.
          </p>

          {/* Toggle Switch */}
          <div className="flex items-center justify-center gap-4 lg:mb-12 mb-2">
            <span className={`text-sm font-medium ${!isYearly ? "text-teal-600" : "text-gray-500"}`}>Bulanan</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isYearly ? "bg-teal-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isYearly ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isYearly ? "text-teal-600" : "text-gray-500"}`}>Tahunan</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 relative">
            <div className="mb-2 bg-gray-100 px-4 py-2 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Free</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">0</span>
                <span className="text-gray-600">Rp/Bulan</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Tanpa biaya berlangganan</p>
              <p className="text-sm text-gray-600 mt-4">
                Untuk pengguna individu yang ingin mencoba kemampuan AI.
              </p>
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
              onClick={() => handlePayment('free')}
              disabled={isLoading !== null}
            >
              Mulai Gratis
            </Button>
          </div>

          {/* Plus Plan */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 relative transform scale-105">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-teal-600 hover:bg-teal-600 text-white px-4 py-1">
              Populer
            </Badge>

            <div className="mb-1 mt-4 bg-teal-600/15 px-4 py-2 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Plus</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">{isYearly ? "58.000" : "70.000"}</span>
                <span className="text-gray-600">Rp/Bulan</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {isYearly 
                  ? "Rp 696.000 ditagih per tahun" 
                  : "Ditagih bulanan"}
                {isYearly && <span className="ml-1 text-teal-600 font-medium">(Hemat 17%)</span>}
              </p>
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
              onClick={() => handlePayment('plus')} 
              disabled={isLoading !== null}
            >
              {isLoading === 'plus' ? 'Memproses...' : `Berlangganan ${isYearly ? 'Tahunan' : 'Bulanan'}`}
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 relative">
            <div className="mb-2 bg-gray-100 px-4 py-2 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Pro</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">{isYearly ? "116.000" : "140.000"}</span>
                <span className="text-gray-600">Rp/Bulan</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {isYearly 
                  ? "Rp 1.392.000 ditagih per tahun" 
                  : "Ditagih bulanan"}
                {isYearly && <span className="ml-1 text-teal-600 font-medium">(Hemat 17%)</span>}
              </p>
              <p className="text-sm text-gray-600 mt-4">
                Untuk tim dan perusahaan dengan kebutuhan AI tingkat lanjut.
              </p>
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
              onClick={() => handlePayment('pro')} 
              disabled={isLoading !== null}
            >
              {isLoading === 'pro' ? 'Memproses...' : `Berlangganan ${isYearly ? 'Tahunan' : 'Bulanan'}`}
            </Button>
          </div>
        </div>
        
        {/* Additional pricing information */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-medium mb-2">Punya pertanyaan tentang paket kami?</h3>
          <p className="text-gray-600 mb-4">Hubungi tim kami untuk informasi lebih lanjut.</p>
          <Button variant="outline" className="mx-auto">
            Hubungi Kami
          </Button>
        </div>
      </div>
    </div>
  )
}