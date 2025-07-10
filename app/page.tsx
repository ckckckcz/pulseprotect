"use client"

import { motion } from "framer-motion"
import {
  Shield,
  Camera,
  TrendingUp,
  Users,
  Bell,
  MousePointer2,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import Image from "next/image"
import Background from "../public/images/background-2.png"
import Navbar from "@/components/widget/navbar"
import Footer from "@/components/widget/footer"
import About from "@/components/widget/hero/about-us"
import Services from "@/components/widget/hero/services"
import HowItWorks from "@/components/widget/hero/how-it-works"
import Banner from "@/components/widget/animate-banner"
import Faq from "@/components/widget/hero/faq"
import Confetti from 'react-confetti'
import { supabase } from "@/lib/supabase"

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] },
}

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const features = [
  {
    icon: Shield,
    title: "Pharmaceutical Authentication",
    description: "Real-time verification of medicine authenticity using blockchain and AI-powered analysis.",
    highlight: false,
  },
  {
    icon: Camera,
    title: "Smart Packaging Scanner",
    description: "Advanced image recognition to detect counterfeit packaging and tampered medications.",
    highlight: false,
  },
  {
    icon: TrendingUp,
    title: "Medicine Supply Chain Tracking",
    description: "Complete visibility from manufacturer to patient with real-time monitoring.",
    highlight: false,
  },
  {
    icon: Bell,
    title: "Fake Medicine Alerts",
    description: "Instant notifications about counterfeit drugs detected in the supply chain.",
    highlight: false,
  },
  {
    icon: Users,
    title: "Healthcare Provider Network",
    description: "Collaborative platform connecting hospitals, pharmacies, and regulatory bodies.",
    highlight: false,
  },
]

const threats = [
  { id: "01", title: "Counterfeit Pain Relievers", severity: "High", color: "bg-red-500" },
  { id: "02", title: "Fake Antibiotics Network", severity: "High", color: "bg-red-500" },
  { id: "03", title: "Tampered Insulin Supply", severity: "High", color: "bg-red-500" },
  { id: "04", title: "Fraudulent Online Pharmacy", severity: "Medium", color: "bg-yellow-500" },
  { id: "05", title: "Diluted Cancer Medications", severity: "High", color: "bg-red-500" },
  { id: "06", title: "Fake Vaccine Distribution", severity: "High", color: "bg-red-500" },
  { id: "07", title: "Unregulated Supplements", severity: "Medium", color: "bg-yellow-500" },
  { id: "08", title: "Expired Medicine Resale", severity: "Medium", color: "bg-yellow-500" },
  { id: "09", title: "Counterfeit Medical Devices", severity: "High", color: "bg-red-500" },
  { id: "10", title: "Illegal Drug Imports", severity: "High", color: "bg-red-500" },
]

const awards = [
  {
    title: "Leader in Pharmaceutical Security",
    subtitle: "AI-Powered Medicine Authentication Platform",
    year: "2024",
    logo: "/placeholder.svg?height=80&width=120",
  },
  {
    title: "Bakekok Platform Detects 99.7% of Counterfeit Drugs",
    subtitle: "Independent Healthcare Security Assessment",
    year: "2024",
    logo: "/placeholder.svg?height=80&width=120",
  },
  {
    title: "Digital Health Innovation Award",
    subtitle: "Best Anti-Counterfeiting Solution",
    year: "2024",
    logo: "/placeholder.svg?height=80&width=120",
  },
  {
    title: "WHO Recognition for Medicine Safety Technology",
    subtitle: "Global Health Security Initiative",
    year: "2024",
    logo: "/placeholder.svg?height=80&width=120",
  },
  {
    title: "#1 Pharmaceutical Supply Chain Security Platform",
    subtitle: "Healthcare Technology Excellence Award",
    year: "2023",
    logo: "/placeholder.svg?height=80&width=120",
  },
]

const partners = [
  { name: "WHO", logo: "/placeholder.svg?height=40&width=120" },
  { name: "FDA", logo: "/placeholder.svg?height=40&width=120" },
  { name: "Pfizer", logo: "/placeholder.svg?height=40&width=120" },
  { name: "Johnson & Johnson", logo: "/placeholder.svg?height=40&width=120" },
  { name: "Novartis", logo: "/placeholder.svg?height=40&width=120" },
  { name: "Roche", logo: "/placeholder.svg?height=40&width=120" },
  { name: "Merck", logo: "/placeholder.svg?height=40&width=120" },
]

// Audio visualizer bars animation
const AudioVisualizer = () => {
  const [bars, setBars] = useState<number[]>([])

  useEffect(() => {
    const generateBars = () => {
      const newBars = Array.from({ length: 60 }, () => Math.random() * 100 + 10)
      setBars(newBars)
    }

    generateBars()
    const interval = setInterval(generateBars, 150)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-end justify-center space-x-1 h-32 absolute bottom-0 left-0 right-0 opacity-60">
      {bars.map((height, index) => (
        <motion.div
          key={index}
          className="bg-teal-500 rounded-t-sm"
          style={{ width: "8px" }}
          animate={{ height: `${height}%` }}
          transition={{ duration: 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  )
}

// Floating User Avatars Component
const FloatingAvatars = () => {
  const avatars = [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      name: "Sarah Johnson",
      position: { top: "20%", left: "10%" },
      size: "large",
      delay: 0,
      iconRotation: "rotate-180",
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      name: "Michael Chen",
      position: { top: "15%", right: "20%" },
      size: "large",
      delay: 0.3,
      iconRotation: "rotate-[-80deg]",
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      name: "Emily Davis",
      position: { bottom: "35%", left: "8%" },
      size: "large",
      delay: 0.6,
      iconRotation: "rotate-[100deg]",
    },
    {
      id: 4,
      src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      name: "David Wilson",
      position: { bottom: "25%", right: "15%" },
      size: "large",
      delay: 0.9,
      iconRotation: "rotate-[-20deg]",
    },
    {
      id: 5,
      src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      name: "Lisa Anderson",
      position: { top: "35%", left: "85%" },
      size: "large",
      delay: 1.2,
      iconRotation: "rotate-[-50deg]",
    },
  ]

  const getSizeClasses = (size: string) => {
    switch (size) {
      case "small":
        return "w-16 h-16"
      case "medium":
        return "w-20 h-20"
      case "large":
        return "w-24 h-24"
      default:
        return "w-20 h-20"
    }
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {avatars.map((avatar) => (
        <motion.div
          key={avatar.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: avatar.delay + 1, duration: 0.6 }}
          className="absolute"
          style={{
            top: avatar.position.top,
            left: avatar.position.left,
            right: avatar.position.right,
            bottom: avatar.position.bottom,
          }}
        >
          <motion.div
            className={`${getSizeClasses(avatar.size)} relative`}
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              delay: avatar.delay,
              ease: "easeInOut",
            }}
          >
            <div className="relative w-full h-full">
              <div className="absolute inset-0 rounded-full bg-white shadow-xl backdrop-blur-sm">
                <div className="absolute inset-1 rounded-full overflow-hidden bg-white">
                  <img
                    src={avatar.src || "/placeholder.svg"}
                    alt={avatar.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* teal mouse pointer indicator - positioned outside avatar */}
            <motion.div className="absolute bottom-0 right-0 translate-x-7 translate-y-7 w-8 h-8 rounded-full  flex items-center justify-center cursor-pointer transition-colors pointer-events-auto">
              <MousePointer2 className={`w-10 h-10 text-teal-500 ${avatar.iconRotation}`} fill="currentColor" />
            </motion.div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}

// Countdown Timer Component
const CountdownTimer = ({ targetDate }: { targetDate: Date }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        // If the countdown is finished
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex flex-col items-center mt-4">
      <p className="text-sm text-gray-600 mb-2">AI akan diluncurkan pada:</p>
      <div className="flex space-x-3">
        <div className="flex flex-col items-center">
          <div className="bg-white text-teal-600 w-12 h-12 flex items-center justify-center rounded-lg shadow-md font-bold text-xl">
            {timeLeft.days}
          </div>
          <span className="text-xs mt-1 text-gray-500">Hari</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-white text-teal-600 w-12 h-12 flex items-center justify-center rounded-lg shadow-md font-bold text-xl">
            {timeLeft.hours}
          </div>
          <span className="text-xs mt-1 text-gray-500">Jam</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-white text-teal-600 w-12 h-12 flex items-center justify-center rounded-lg shadow-md font-bold text-xl">
            {timeLeft.minutes}
          </div>
          <span className="text-xs mt-1 text-gray-500">Menit</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-white text-teal-600 w-12 h-12 flex items-center justify-center rounded-lg shadow-md font-bold text-xl">
            {timeLeft.seconds}
          </div>
          <span className="text-xs mt-1 text-gray-500">Detik</span>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [email, setEmail] = useState("")
  const [showConfetti, setShowConfetti] = useState(false)
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  })
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  
  // Target date for release: August 24, 2025
  const releaseDate = new Date(2025, 7, 24); // Month is 0-indexed, so 7 = August

  // Get window dimensions for confetti
  useEffect(() => {
    const updateWindowDimensions = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    updateWindowDimensions()
    window.addEventListener('resize', updateWindowDimensions)
    return () => window.removeEventListener('resize', updateWindowDimensions)
  }, [])

  // Confetti animation
  const triggerConfetti = () => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 5000) // Show for 5 seconds
  }

  const handleEarlyAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return;
    
    setRegistrationStatus('loading');
    
    try {
      // Call the API to handle database storage and email sending
      const response = await fetch('/api/early-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to register');
      }
      
      // Show success feedback
      setRegistrationStatus('success');
      triggerConfetti();
      setEmail("");
      
      // Close modal after success
      setTimeout(() => {
        setShowAIModal(false);
        setRegistrationStatus('idle');
      }, 3000);
      
    } catch (error) {
      console.error("Error registering for early access:", error);
      setRegistrationStatus('error');
      
      // Reset after error
      setTimeout(() => {
        setRegistrationStatus('idle');
      }, 3000);
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <Navbar />
      <section className="relative lg:min-h-screen flex items-center justify-center pt-16 px-4 sm:px-6 md:px-8 overflow-hidden">
        {/* Background with overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src={Background || "/placeholder.svg"}
            alt="Background pattern"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-white/40"></div>
        </div>

        <div className="hidden lg:block">
          <FloatingAvatars />
        </div>

        <div className="relative z-10 text-left lg:text-center max-w-6xl mx-auto mt-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <div className="bg-white/90 backdrop-blur-sm border border-teal-200/50 rounded-full lg:px-6 lg:py-3 px-3 py-2 shadow-xl inline-block">
              <div className="flex items-center space-x-3">
                <Zap className="lg:w-5 w-4 lg:h-5 h-4 text-teal-600" fill="currentColor" />
                <span className="lg:text-sm text-xs font-semibold text-teal-600">VERIFIKASI KESEHATAN TERPERCAYA</span>
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl lg:text-6xl font-bold lg:mb-8 mb-2 leading-tight"
          >
            Lindungi Masyarakat dari{" "}
            <span className="text-teal-600 relative">
              JAWIR
              <div className="absolute -bottom-0 left-0 right-0 h-1 bg-teal-100 rounded-full -z-10"></div>
            </span>
            <br />
            dengan Deteksi Pintar
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-md sm:text-xl md:text-xl text-gray-700 mb-6 lg:mb-10 max-w-4xl mx-auto leading-relaxed"
          >
            Platform bertenaga AI yang mengamankan rantai pasokan farmasi, mendeteksi obat palsu secara real-time untuk
            memastikan keamanan kesehatan masyarakat dan kepatuhan regulasi.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col lg:items-center"
          >
            <div className="flex flex-row gap-4 lg:justify-center lg:items-center items-start">
              <Button
                size="lg"
                onClick={() => setShowAIModal(true)}
                className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-6 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl border-0 group"
              >
                Coba AI 🤖
              </Button>
            </div>
            
            {/* Add countdown timer below button */}
            <CountdownTimer targetDate={releaseDate} />
          </motion.div>
        </div>
      </section>

      {/* DISINI ELEMENTNYA */}
      <Banner/>
      {/* Healthcare Section */}
      <About />
      
      {/* Services Section */}
      <Services />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Faq Section */
      <Faq />}

      {/* AI Development Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative"
          >
            <button
              onClick={() => setShowAIModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚧</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Dalam Pengembangan</h3>
              <p className="text-gray-600">Pengembangan AI masih dalam development, daftarkan email anda disini untuk mendapatkan akses awal!</p>
            </div>

            {registrationStatus === 'success' ? (
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✓</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Terima Kasih!</h3>
                <p className="text-gray-600">Email Anda telah terdaftar. Kami akan menghubungi Anda segera setelah AI kami diluncurkan pada 20 Agustus 2025.</p>
              </div>
            ) : registrationStatus === 'error' ? (
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✕</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Gagal Mendaftar</h3>
                <p className="text-gray-600">Terjadi kesalahan. Silakan coba lagi nanti.</p>
              </div>
            ) : (
              <form onSubmit={handleEarlyAccess} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan email anda..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                    disabled={registrationStatus === 'loading'}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-semibold transition-all duration-300"
                  disabled={registrationStatus === 'loading'}
                >
                  {registrationStatus === 'loading' ? 'Mendaftarkan...' : 'Daftar Early Access 🚀'}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* Confetti Animation */}
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={500}
          colors={['#0D9488', '#14B8A6', '#2DD4BF', '#5EEAD4', '#99F6E4', '#CCFBF1']}
          gravity={0.3}
          wind={0.05}
        />
      )}

      {/* Disini */}
      <Footer />
    </div>
  )
}
