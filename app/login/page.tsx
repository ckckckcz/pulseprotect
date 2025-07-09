"use client"

import type React from "react"
import { motion } from "framer-motion"
import { useState, useEffect, Suspense } from "react"
import { Eye, EyeOff, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"

// Extract the form component that uses useSearchParams
function LoginForm() {
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { login, loginWithGoogle, loading: isLoading } = useAuth()

  // Handle email from URL params (from verification)
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      // Use the login function from useAuth
      await login(email.trim(), password)
      
      // Router push is handled inside login function
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || "Terjadi kesalahan saat login. Silakan coba lagi.")
    }
  }

  const handleGoogleLogin = async () => {
    try {
      // Use loginWithGoogle from useAuth
      await loginWithGoogle()
    } catch (error: any) {
      console.error('Google login error:', error)
      setError(error.message || "Terjadi kesalahan saat login dengan Google")
    }
  }

  return (
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
          Selamat Datang Kembali
        </h1>
        <p className="text-gray-600">
          Masuk untuk akses semua fitur SmartCity
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
          disabled={isLoading}
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
          Masuk dengan Google
        </Button>
      </motion.div>

      {/* Divider */}
      <div className="flex items-center mb-6">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-4 text-sm text-gray-500">atau</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
            disabled={isLoading}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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
              placeholder="Masukkan password"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500 transition-colors duration-200"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between"
        >
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="mr-2 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded-lg"
              disabled={isLoading}
            />
            <span className="text-sm text-gray-600">Ingat saya</span>
          </label>
          <Link href="/forgot-password" className="text-sm text-teal-600 hover:text-teal-700 hover:underline transition-colors duration-200">
            Lupa password?
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white py-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Masuk...
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
            Daftar di sini
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

// Loading fallback for the Suspense boundary
function LoginFormFallback() {
  return (
    <div className="w-full max-w-md animate-pulse">
      <div className="mb-12">
        <div className="h-8 w-32 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="mb-8">
        <div className="h-8 w-64 bg-gray-200 rounded-lg mb-2"></div>
        <div className="h-4 w-48 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="mb-6">
        <div className="h-12 bg-gray-200 rounded-xl"></div>
      </div>
      <div className="flex items-center mb-6">
        <div className="flex-1 h-px bg-gray-200"></div>
        <div className="px-4 h-4 w-8 bg-gray-200 rounded"></div>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>
      <div className="space-y-6">
        <div>
          <div className="h-4 w-12 bg-gray-200 rounded mb-2"></div>
          <div className="h-12 bg-gray-200 rounded-xl"></div>
        </div>
        <div>
          <div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
          <div className="h-12 bg-gray-200 rounded-xl"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
        <div className="h-12 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 lg:px-16">
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
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
              "SmartCity memudahkan saya dalam mengelola kota dan mengakses semua layanan dalam satu platform."
            </blockquote>
            
            <div className="mb-6">
              <p className="font-semibold">Ahmad Rahman</p>
              <p className="text-teal-100">City Manager at SmartCity</p>
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
