"use client";

import type React from "react";
import { useState } from "react";
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

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeMembershipType, setActiveMembershipType] = useState<PlanType>("free");

  // Promo code states
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [isPromoDialogOpen, setIsPromoDialogOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  // Function to validate and apply promo code
  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError("Masukkan kode promo terlebih dahulu");
      return;
    }

    setIsApplyingPromo(true);
    setPromoError("");

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const foundPromo = promoCodes.find((promo) => promo.code.toLowerCase() === promoCode.toLowerCase().trim());

    if (foundPromo) {
      setAppliedPromo(foundPromo);
      setPromoCode("");
      setIsPromoDialogOpen(false);
      setShowCelebration(true);

      toast({
        title: "Kode Promo Berhasil Diterapkan! 🎉",
        description: `${foundPromo.description} - Hemat ${foundPromo.discount}%`,
      });

      // Hide celebration after 4 seconds
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

    setIsApplyingPromo(false);
  };

  // Function to remove applied promo
  const removePromo = () => {
    setAppliedPromo(null);
    setPromoError("");
    toast({
      title: "Kode Promo Dihapus",
      description: "Kode promo telah dihapus dari pesanan Anda",
    });
  };

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

  // Mock payment handler for demo
  const handlePayment = async (e: React.MouseEvent, packageType: PlanType) => {
    e.preventDefault();
    setIsLoading(packageType);

    try {
      const userId = currentUser?.id || "demo-user-id";
      const period: "monthly" | "yearly" = isYearly ? "yearly" : "monthly";

      const packageDetails: PackageDetails = {
        packageId: `pkg_${packageType}`,
        packageName: pricingPlans.find((p) => p.type === packageType)?.name || "",
        price: isYearly ? pricingPlans.find((p) => p.type === packageType)?.yearlyPrice || 0 : pricingPlans.find((p) => p.type === packageType)?.monthlyPrice || 0,
        period,
      };

      // Promo logic
      if (appliedPromo) {
        packageDetails.price = getDiscountedPrice(packageDetails.price);
      }

      // Simulasi info customer (HARUS diganti dengan info user beneran)
      const customerInfo = {
        firstName: currentUser?.firstName || "Demo",
        email: currentUser?.email || "demo@email.com",
        phone: currentUser?.phone || "",
      };

      // Buat payment token via API
      const paymentResult = await createAIPackagePayment(userId, packageDetails, customerInfo);

      // Tampilkan Midtrans Snap
      await handleMidtransPayment(paymentResult.token, {
        onSuccess: (result) => {
          toast({
            title: "Pembayaran Berhasil",
            description: "Terima kasih, pembayaran Anda berhasil.",
          });
          setActiveMembershipType(packageType);
          setIsLoading(null);
          // Simpan payment ke database, misal recordPayment(...)
        },
        onPending: (result) => {
          toast({
            title: "Pembayaran Pending",
            description: "Pembayaran Anda masih diproses.",
          });
          setIsLoading(null);
        },
        onError: (result) => {
          toast({
            title: "Pembayaran Gagal",
            description: "Terjadi kesalahan saat pembayaran.",
            variant: "destructive",
          });
          setIsLoading(null);
        },
        onClose: () => {
          setIsLoading(null);
        },
      });
    } catch (error) {
      toast({
        title: "Error",
        description: String(error),
        variant: "destructive",
      });
      setIsLoading(null);
    }
  };

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

      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }} className="min-h-screen bg-white py-16 px-4 mt-16">
        <div className="w-full mx-auto">
          {/* Header Section */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7 }} className="lg:text-center text-start lg:mb-16 mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Paket Model <span className="text-teal-600">AI Pintar</span>
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
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
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
              <Button className="w-full bg-white rounded-xl text-gray-900 border border-gray-300 hover:bg-gray-50" onClick={(e) => handlePayment(e, "free")} disabled={isLoading !== null || activeMembershipType === "free"}>
                {activeMembershipType === "free" ? "Membership Aktif" : "Mulai Gratis"}
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
              <Button className="w-full bg-teal-600 text-white hover:bg-teal-700 rounded-xl" onClick={(e) => handlePayment(e, "plus")} disabled={isLoading !== null}>
                {isLoading === "plus" ? "Memproses..." : `Berlangganan ${isYearly ? "Tahunan" : "Bulanan"}`}
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
              <Button className="w-full rounded-xl bg-white text-gray-900 border border-gray-300 hover:bg-gray-50" onClick={(e) => handlePayment(e, "pro")} disabled={isLoading !== null}>
                {isLoading === "pro" ? "Memproses..." : `Berlangganan ${isYearly ? "Tahunan" : "Bulanan"}`}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-6xl mx-auto">
        {appliedPromo ? (
          <AnimatePresence>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.4,
              }}
              className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl border border-emerald-200/60 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-30">
                <motion.div
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%"],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                  className="w-full h-full bg-gradient-to-r from-emerald-100/50 via-transparent to-teal-100/50"
                  style={{
                    backgroundSize: "200% 200%",
                  }}
                />
              </div>

              <div className="relative p-6">
                {/* Header with enhanced styling */}
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex items-center gap-3 mb-4">
                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.95 }} className="relative p-2.5 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl shadow-sm">
                    <Check className="h-5 w-5 text-emerald-700" />
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }} className="absolute -top-1 -right-1">
                      <Sparkles className="h-3 w-3 text-emerald-500" />
                    </motion.div>
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 tracking-tight">Promo Active!</h3>
                    <p className="text-sm text-emerald-700 font-medium">Discount applied successfully</p>
                  </div>
                </motion.div>

                {/* Enhanced promo code display */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-white/60 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {/* <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={promoCode}
                      className="cursor-pointer"
                    >
                      <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm px-3 py-1.5 shadow-sm transition-all duration-200">
                        <Gift className="h-3 w-3 mr-1" />
                        {appliedPromo.code.toUpperCase()}
                      </Badge>
                    </motion.div> */}

                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }} className="flex items-center gap-1">
                          <span className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">-{appliedPromo.discount}%</span>
                          <span className="text-sm text-gray-500 font-medium">OFF</span>
                        </motion.div>
                      </div>

                      <p className="text-sm text-gray-600 leading-relaxed mb-2">{appliedPromo.description}</p>

                      {/* {appliedPromo.expiresAt && (
                    <p className="text-xs text-gray-500 font-medium">
                      Expires: {new Date(appliedPromo.expiresAt).toLocaleDateString()}
                    </p>
                  )} */}
                      <p className="text-xs text-gray-500 font-medium">Expires: 01-01-2004</p>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {/* <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyPromoCode}
                      className="text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 p-2 h-auto transition-colors duration-200"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </motion.div> */}
                    </div>
                  </div>

                  {/* Progress indicator for discount */}
                </motion.div>

                {/* Subtle call-to-action */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-4 text-center">
                  <p className="text-xs text-gray-500 font-medium">🎉 You're saving big with this exclusive offer!</p>
                </motion.div>
              </div>

              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-200/40 to-transparent rounded-bl-full" />
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
                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Check className="h-8 w-8 text-white" />
                            </div>
                            <p className="text-green-400 font-medium">Kode promo berhasil diterapkan!</p>
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
