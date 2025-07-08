"use client"

import type React from "react"
import { motion } from "framer-motion"
import { useState } from "react"
import { Eye, EyeOff, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [fullName, setFullName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [ktp, setKtp] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [ktpError, setKtpError] = useState("")
  const router = useRouter()

  const handleKtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // Remove non-digits
    
    if (value.length <= 16) {
      setKtp(value)
      if (value.length > 0 && value.length !== 16) {
        setKtpError("KTP harus terdiri dari 16 digit")
      } else {
        setKtpError("")
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate KTP
    if (ktp.length !== 16) {
      setKtpError("KTP harus terdiri dari 16 digit")
      return
    }
    
    setIsLoading(true)

    // Static login logic
    setTimeout(() => {
      setIsLoading(false)
      if (email === "admin@smartcity.com" && password === "admin123") {
        router.push("/admin/dashboard")
      } else if (email === "user@smartcity.com" && password === "user123") {
        router.push("/user/dashboard")
      } else {
        alert("Invalid credentials. Try:\nAdmin: admin@smartcity.com / admin123\nUser: user@smartcity.com / user123")
      }
    }, 1500)
  }

  const handleGoogleLogin = () => {
    // Google login logic would go here
    console.log("Google login clicked")
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 lg:px-16">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-12">
            <Link href="/" className="inline-flex items-center">
              <div className="w-8 h-8 bg-teal-600 rounded-xl flex items-center justify-center mr-3">
                <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-teal-600 rounded-md"></div>
                </div>
              </div>
              <span className="text-xl font-bold text-teal-600">SmartCity</span>
            </Link>
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back to SmartCity
            </h1>
            <p className="text-gray-600">
              Log in to access your mission control
            </p>
          </motion.div>

          {/* Google Login Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Button
              type="button"
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full py-5 bg-white border-gray-200 hover:bg-gray-50 text-gray-900 hover:text-gray-900 font-medium rounded-xl transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </motion.div>

          {/* Divider */}
          <div className="flex items-center mb-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Name and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-6 bg-white border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon
                </label>
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-6 bg-white border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                  placeholder="Contoh: 08123456789"
                  required
                />
              </motion.div>
            </div>

            {/* Row 2: KTP (full width) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor KTP
              </label>
              <Input
                type="text"
                value={ktp}
                onChange={handleKtpChange}
                className={`w-full px-4 py-6 bg-white border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 ${
                  ktpError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                placeholder="Masukkan 16 digit nomor KTP"
                maxLength={16}
                required
              />
              {ktpError && (
                <p className="text-red-500 text-sm mt-1">{ktpError}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                {ktp.length}/16 digit
              </p>
            </motion.div>

            {/* Row 3: Email and Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-6 bg-white border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                  placeholder="example@example.com"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-6 pr-12 bg-white border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex items-center justify-between"
            >
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded-lg"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-teal-600 hover:text-teal-700 hover:underline transition-colors duration-200">
                Forgot password
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                type="submit"
                disabled={isLoading || ktpError !== ""}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Tunggu Sebentar...
                  </div>
                ) : (
                  "Masuk"
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-center"
          >
            <p className="text-gray-600">
              Belum punya akun?{" "}
              <Link href="/register" className="text-teal-600 hover:text-teal-700 hover:underline font-medium transition-colors duration-200">
                Buat aja gratis kok!
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Testimonial/Image */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-teal-400 via-teal-500 to-teal-700 overflow-hidden">
        {/* Background Image/Illustration */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-400/90 via-teal-500/90 to-teal-700/90"></div>
        
        {/* City Silhouette */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent"></div>
        
        {/* Clouds */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-16 bg-white/20 rounded-xl blur-sm"></div>
          <div className="absolute top-32 right-32 w-24 h-12 bg-white/15 rounded-xl blur-sm"></div>
          <div className="absolute top-40 left-1/2 w-40 h-20 bg-white/10 rounded-xl blur-sm"></div>
        </div>

        {/* Person Silhouette */}
        <div className="absolute bottom-0 right-1/3 w-32 h-48 bg-black/30 rounded-t-full"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <blockquote className="text-2xl font-medium mb-6 leading-relaxed">
              "Everything just feels easier to manage now. We finally have a system that keeps the team aligned without slowing things down."
            </blockquote>
            
            <div className="mb-6">
              <p className="font-semibold">Freya Tanaka</p>
              <p className="text-teal-100">Operations Manager at SmartCity</p>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 bg-white/20 rounded-xl hover:bg-white/30 hover:scale-110 transition-all duration-200">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="p-2 bg-white/20 rounded-xl hover:bg-white/30 hover:scale-110 transition-all duration-200">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
