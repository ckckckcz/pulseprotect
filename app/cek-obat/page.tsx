"use client"

import Image from "next/image"
import { motion, useAnimation } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/widget/navbar"
import Footer from "@/components/widget/footer"
import DaftarObat from "@/components/widget/cek-obat/daftar-obat"
import DoctorHeader from "@/public/images/doctor-obat.webp"
import {
  MapPin,
  Stethoscope,
  Star,
  Clock,
  Heart,
  Shield,
  Search,
  Filter,
  ArrowRight,
  Phone,
  Calendar,
  Loader2,
} from "lucide-react"
import { useEffect, useState } from "react"

export default function CekObat() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter();
  const [scannedProduct, setScannedProduct] = useState<any | null>(null);

  const handleScan = async (barcode: string) => {
    // Request ke API cek-produk sesuai format anda
    const res = await fetch(`/api/cek-produk?barcode=${barcode}`);
    if (res.ok) {
      const data = await res.json();
      setScannedProduct(data);
    } else {
      const error = await res.json();
      setScannedProduct({ error: error.message, barcode });
    }
  };

  const handleDiscuss = () => {
    if (scannedProduct) {
      const id = Date.now().toString();
      localStorage.setItem(`scannedProduct:${id}`, JSON.stringify(scannedProduct));
      router.push(`/cura-ai?id=${id}`);
    }
  };

  // Fetch doctors data
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/doctors")

        if (!response.ok) {
          throw new Error("Failed to fetch doctors")
        }

        const data = await response.json()
        setDoctors(data)
      } catch (err) {
        console.error("Error fetching doctors:", err)
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  // Use placeholder data when loading or if there's an error
  const placeholderDoctors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      position: "Dokter Spesialis Jantung",
      hospital: "RS Jantung Harapan Kita",
      location: "Jakarta Barat",
      image: "/images/doctor/Dr. Sarah Johnson.png",
      rating: 4.9,
      experience: "15+ tahun",
      patients: "2000+",
      availability: "Tersedia",
      price: "Rp 250.000",
      height: 400,
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      position: "Dokter Spesialis Anak",
      hospital: "RS Anak Bunda",
      location: "Jakarta Selatan",
      image: "/images/doctor/Dr. Michael Chen.png",
      rating: 4.8,
      experience: "12+ tahun",
      patients: "1800+",
      availability: "Tersedia",
      price: "Rp 200.000",
      height: 500,
    },
    {
      id: 3,
      name: "Dr. Rudi",
      position: "Dokter Spesialis Mata",
      hospital: "RS Mata Cicendo",
      location: "Bandung",
      image: "/images/doctor/Dr. Rudi.png",
      rating: 4.7,
      experience: "10+ tahun",
      patients: "1500+",
      availability: "Sibuk",
      price: "Rp 180.000",
      height: 350,
    },
    {
      id: 4,
      name: "Dr. Robert Kim",
      position: "Dokter Spesialis Bedah",
      hospital: "RS Premier Jatinegara",
      location: "Jakarta Timur",
      image: "/images/doctor/Dr. Robert Kim.png",
      rating: 4.9,
      experience: "18+ tahun",
      patients: "2500+",
      availability: "Tersedia",
      price: "Rp 300.000",
      height: 450,
    },
    {
      id: 5,
      name: "Dr. Bambang",
      position: "Dokter Spesialis Kulit",
      hospital: "RS Kulit Klinik Utama",
      location: "Surabaya",
      image: "/images/doctor/Dr. Bambang.png",
      rating: 4.6,
      experience: "8+ tahun",
      patients: "1200+",
      availability: "Tersedia",
      price: "Rp 150.000",
      height: 300,
    },
  ]

  // Use available doctors or fallback to placeholders
  const displayDoctors = doctors.length > 0 ? doctors : placeholderDoctors

  interface Doctor {
    id: number;
    name: string;
    position: string;
    hospital: string;
    location: string;
    image: string;
    rating: number;
    experience: string;
    patients: string;
    availability: string;
    price: string;
    height: number;
  }

  // Improved function to generate infinite carousel items
  const generateInfiniteDoctors = (doctorsArray: Doctor[]): Doctor[] => {
    if (!doctorsArray.length) return [];

    // Create a longer array by duplicating the doctors several times
    return [
      ...doctorsArray,
      ...doctorsArray.map((doc, idx) => ({ ...doc, id: doc.id + 1000 })),
      ...doctorsArray.map((doc, idx) => ({ ...doc, id: doc.id + 2000 })),
      ...doctorsArray.map((doc, idx) => ({ ...doc, id: doc.id + 3000 })),
      ...doctorsArray.map((doc, idx) => ({ ...doc, id: doc.id + 4000 })),
    ];
  };

  const infiniteDoctors = generateInfiniteDoctors(displayDoctors);
  const controls = useAnimation();

  // Add a key to track remounts
  const [animationKey, setAnimationKey] = useState(Date.now());

  // Reset animation when doctors data changes or component remounts
  useEffect(() => {
    // Reset the animation key to force remounting of animation components
    setAnimationKey(Date.now());
  }, [doctors]);

  // Separate useEffect for animation to ensure it runs independently
  useEffect(() => {
    if (infiniteDoctors.length === 0) return;

    let isMounted = true; // Track if component is mounted

    // Simpler animation approach that's more reliable
    const animate = async () => {
      try {
        // Calculate total width based on number of doctors and card width
        const cardWidth = 320; // Approximate width of each card including gap

        // Get the total width of all cards
        const totalWidth = infiniteDoctors.length * cardWidth;

        // Reset to start position
        controls.set({ x: 0 });

        // Only continue if component is still mounted
        if (!isMounted) return;

        // Animate continuously to the left
        await controls.start({
          x: -totalWidth / 2, // Move half the width (we have duplicates)
          transition: {
            duration: 40, // Slower animation for smoother effect
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop"
          }
        });
      } catch (error) {
        console.error("Animation error:", error);
      }
    };

    // Small timeout to ensure DOM is fully ready
    const animationTimer = setTimeout(() => {
      if (isMounted) animate();
    }, 100);

    // Cleanup function to stop animation and clear timers
    return () => {
      isMounted = false;
      clearTimeout(animationTimer);
      controls.stop();
    };
  }, [controls, infiniteDoctors.length, animationKey]); // Add animationKey as dependency

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Dokter Terpercaya",
      description: "Semua dokter telah terverifikasi dan berpengalaman",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Konsultasi 24/7",
      description: "Layanan konsultasi tersedia kapan saja",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Perawatan Terbaik",
      description: "Mendapatkan perawatan medis berkualitas tinggi",
    },
  ]

  const stats = [
    { number: "10K+", label: "Pasien Terlayani" },
    { number: "500+", label: "Dokter Ahli" },
    { number: "50+", label: "Rumah Sakit" },
    { number: "4.8", label: "Rating Rata-rata" },
  ]

  return (
    <>
      <Navbar />
      <section className=" bg-white lg:mt-24 mt-16 overflow-hidden relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-teal-100/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 bg-blue-100/15 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

        {/* Hero Section */}
        <motion.div
          className="max-w-7xl mx-auto pt-6 sm:pt-8 lg:pt-12 px-4 sm:px-6 lg:px-12 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6 sm:mb-8"
          >
            {/* Badge commented out as in original */}
          </motion.div>

          {/* Main Hero Content */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-12 sm:mb-16">
            {/* Left Content */}
            <motion.div
              className="lg:col-span-7 space-y-6 sm:space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Obat yang{" "}
                  <span className="text-transparent cardo italic bg-clip-text bg-gradient-to-r from-teal-600 to-teal-700">
                    tepat
                  </span>
                  <br />
                  Hidup yang{" "}
                  <span className="text-transparent cardo italic bg-clip-text bg-gradient-to-r from-teal-600 to-teal-700">
                    sehat
                  </span>
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-2xl">
                  Temukan dokter terpercaya dan dapatkan konsultasi medis terbaik untuk kesehatan Anda dan keluarga
                  dengan teknologi telemedicine terdepan.
                </p>
              </div>

              {/* Search Bar */}
              {/* <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-2 shadow-lg max-w-2xl"
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                  <div className="flex-1 flex items-center gap-3 px-4 py-2 sm:py-0">
                    <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Cari dokter, spesialis, atau rumah sakit..."
                      className="flex-1 bg-transparent border-0 outline-none text-gray-700 placeholder-gray-400 text-sm sm:text-base"
                    />
                  </div>
                  <Button className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold shadow-lg text-sm sm:text-base">
                    Cari Dokter
                  </Button>
                </div>
              </motion.div> */}
            </motion.div>

            {/* Right Content - Medicine Animation */}
            <motion.div
              className="lg:col-span-5 flex justify-center mt-8 lg:mt-0"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative">
                <motion.div
                  className="relative w-72 h-72 lg:w-80 lg:h-80 rounded-3xl overflow-hidden shadow-2xl ring-4 sm:ring-8 ring-white/50"
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Image
                    src={DoctorHeader}
                    alt="Medicine and wellness"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-teal-600/20 to-transparent"></div>
                </motion.div>

                {/* Floating elements */}
                <motion.div
                  className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center"
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                >
                  <Heart className="w-8 h-8 sm:w-8 sm:h-8 text-red-500 fill-current" />
                </motion.div>
                <motion.div
                  className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center"
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, delay: 1.5 }}
                >
                  <Shield className="w-8 h-8 sm:w-8 sm:h-8 text-teal-600 fill-current" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Doctor Carousel */}
        {scannedProduct && (
          <div className="my-6 max-w-xl mx-auto bg-white border rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-2">Hasil Scan Produk</h3>
            {scannedProduct.error ? (
              <div className="mb-2 text-red-600">{scannedProduct.error}</div>
            ) : (
              <div className="mb-4 text-sm">
                <div><b>Nama:</b> {scannedProduct.nama}</div>
                <div><b>Barcode:</b> {scannedProduct.barcode}</div>
                <div><b>Status:</b> {scannedProduct.status}</div>
                <div><b>Nomor Registrasi:</b> {scannedProduct.nomorRegistrasi}</div>
                <div><b>Gramasi:</b> {scannedProduct.gramasi}</div>
                <div><b>Anjuran Sajian:</b> {scannedProduct.anjuranSajian}</div>
                <div><b>Sajian/Kantong:</b> {scannedProduct.sajianPerKantong}</div>
                <div><b>Jumlah Karton:</b> {scannedProduct.jumlahKarton}</div>
                <div><b>Masa Simpan:</b> {scannedProduct.masaSimpan}</div>
                <div><b>Dimensi Karton:</b> {scannedProduct.dimensiKarton}</div>
              </div>
            )}
            {!scannedProduct.error && (
              <Button
                onClick={handleDiscuss}
                className="bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold px-6 py-2 rounded-lg shadow"
              >
                Diskusi dengan Cura AI
              </Button>
            )}
          </div>
        )}
      </section>
      <DaftarObat />
      <Footer />
    </>
  )
}
