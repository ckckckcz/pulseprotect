"use client"

import type React from "react"
import { motion } from "framer-motion"
import { useState, useEffect, Suspense } from "react"
import { Eye, EyeOff, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authService } from "@/lib/auth"

// Reset Password component

// Reset password fallback for the Suspense boundary
function ResetPasswordFormFallback() {
  return (
    <div className="w-full max-w-md animate-pulse">
      <div className="mb-12">
        <div className="h-8 w-32 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="mb-8">
        <div className="h-8 w-64 bg-gray-200 rounded-lg mb-2"></div>
        <div className="h-4 w-48 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="space-y-6">
        <div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
          <div className="h-12 bg-gray-200 rounded-xl"></div>
        </div>
        <div>
          <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-12 bg-gray-200 rounded-xl"></div>
        </div>
        <div className="h-12 bg-gray-200 rounded-xl"></div>
      </div>
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

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Reset Password Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 lg:px-16">
        <Suspense fallback={<LoginFormFallback />}>
          <ResetPasswordForm />
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

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidatingToken, setIsValidatingToken] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setError("Token reset password tidak ditemukan.")
        setIsValidatingToken(false)
        return
      }
      
      try {
        const email = await authService.validateResetToken(token)
        setTokenValid(true)
      } catch (error: any) {
        console.error("Token validation error:", error)
        setError(error.message || "Token tidak valid atau telah kedaluwarsa.")
      } finally {
        setIsValidatingToken(false)
      }
    }
    
    validateToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("Kata sandi tidak cocok. Silakan coba lagi.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Kata sandi harus minimal 8 karakter.");
      return;
    }

    setIsLoading(true);
    try {
      if (!token) {
        throw new Error("Token reset password tidak ditemukan.");
      }

      console.log("Submitting password reset request");
      
      // Call the API to reset the password
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengubah kata sandi.");
      }

      console.log("Password reset successful");
      setSuccess(true);
      
      // Clear input fields after success
      setNewPassword("");
      setConfirmPassword("");

      // Redirect to login page after short delay
      setTimeout(() => {
        window.location.href = "/login?reset=success";
      }, 2000);
      
    } catch (error: any) {
      console.error("Reset password error:", error);
      setError(
        error.message || "Terjadi kesalahan saat mengganti kata sandi. Silakan coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Show loading state while validating token
  if (isValidatingToken) {
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
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          <p className="text-gray-600">Memvalidasi token reset password...</p>
        </div>
      </div>
    )
  }
  
  // If token is invalid, show error
  if (!tokenValid) {
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
        
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
          <h2 className="text-xl font-bold text-red-700 mb-2">Token Tidak Valid</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-600">
            Silakan kembali ke halaman lupa kata sandi untuk meminta token baru.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => router.push('/auth/forgot-password')}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6 rounded-xl font-medium transition-all duration-200"
            >
              Kembali ke Lupa Kata Sandi
            </Button>
          </div>
        </div>
      </div>
    )
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
          Reset Kata Sandi
        </h1>
        <p className="text-gray-600">
          Masukkan kata sandi baru Anda untuk mengganti kata sandi.
        </p>
      </motion.div>

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

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm"
        >
          Kata sandi Anda berhasil direset.
        </motion.div>
      )}

      {/* Reset Password Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kata Sandi Baru
          </label>
          <div className="relative">
            <Input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-6 pr-12 bg-white border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
              placeholder="Masukkan kata sandi baru"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500 transition-colors duration-200"
              disabled={isLoading}
            >
              {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Konfirmasi Kata Sandi Baru
          </label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-6 pr-12 bg-white border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
              placeholder="Konfirmasi kata sandi baru"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500 transition-colors duration-200"
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white py-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Mengirim...
              </div>
            ) : (
              "Reset Kata Sandi"
            )}
          </Button>
        </motion.div>
      </form>
    </div>
  )
}
