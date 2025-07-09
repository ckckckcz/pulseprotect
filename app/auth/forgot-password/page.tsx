"use client"

import type React from "react"
import { motion } from "framer-motion"
import { useState, Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setIsLoading(true)

    try {
      // Use API endpoint instead of direct service call
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
      } else {
        setError(data.error || "Terjadi kesalahan saat memproses permintaan.")
      }
    } catch (error: any) {
      console.error("Password reset error:", error)
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
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
          Lupa Kata Sandi
        </h1>
        <p className="text-gray-600">
          Masukkan email Anda untuk mengganti kata sandi.
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
          Permintaan untuk mengganti kata sandi telah dikirim. Silakan cek email Anda.
        </motion.div>
      )}

      {/* Email Input Form */}
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
              "Kirim Permintaan"
            )}
          </Button>
        </motion.div>
      </form>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex bg-white">
      <div className="flex-1 flex items-center justify-center bg-white px-8 lg:px-16">
        <Suspense fallback={<div>Loading...</div>}>
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </div>
  )
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
  )
}
