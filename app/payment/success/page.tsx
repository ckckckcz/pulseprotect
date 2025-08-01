"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/widget/navbar';
import Footer from '@/components/widget/footer';
import { Button } from '@/components/ui/button';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const orderId = searchParams?.get('orderId');
  
  useEffect(() => {
    async function fetchPaymentDetails() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      
      try {
        // First, check if the payment exists in our database
        const { data: paymentData, error: paymentError } = await supabase
          .from('payment')
          .select('*')
          .eq('order_id', orderId)
          .single();
          
        if (paymentData) {
          setPaymentDetails(paymentData);
          setLoading(false);
          return;
        }
        
        // If no payment record found, check payment_intent for details
        const { data: intentData, error: intentError } = await supabase
          .from('payment_intent')
          .select('*')
          .eq('order_id', orderId)
          .single();
          
        if (intentData) {
          setPaymentDetails({
            ...intentData,
            status: 'processing', // Mark as processing since we don't have a confirmed payment yet
          });
        }
      } catch (error) {
        console.error("Error fetching payment details:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPaymentDetails();
  }, [orderId]);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-16 bg-gray-50">
        <div className="max-w-md w-full mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-teal-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Pembayaran Berhasil!</h1>
            <p className="text-gray-600 text-center">
              Terima kasih atas pembayaran Anda. Akun Anda telah diperbarui.
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
            </div>
          ) : paymentDetails ? (
            <div className="border border-gray-200 rounded-lg p-4 mb-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Order ID</span>
                  <span className="font-medium text-gray-900">{paymentDetails.order_id || orderId}</span>
                </div>
                
                {paymentDetails.package_id && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Paket</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {paymentDetails.package_id.replace('pkg_', '')}
                    </span>
                  </div>
                )}
                
                {paymentDetails.period && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Periode</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {paymentDetails.period === 'monthly' ? 'Bulanan' : 'Tahunan'}
                    </span>
                  </div>
                )}
                
                {paymentDetails.amount && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Jumlah</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(paymentDetails.amount || paymentDetails.harga || 0)}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium ${paymentDetails.status === 'success' ? 'text-teal-600' : 'text-amber-600'}`}>
                    {paymentDetails.status === 'success' ? 'Berhasil' : 'Diproses'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 mb-6">
              <p className="text-gray-600">Detail pembayaran tidak ditemukan.</p>
            </div>
          )}
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              Ke Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              onClick={() => router.push('/pricing')}
              variant="outline"
              className="w-full"
            >
              Lihat Paket Lainnya
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
