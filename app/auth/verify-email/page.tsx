"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { CheckCircle, XCircle, Loader2, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSearchParams, useRouter } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { authService } from "@/lib/auth"
import Celebration from "@/components/widget/celebration-confetti"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams?.get("token") || ""
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Token verifikasi tidak ditemukan")
      return
    }

    const verifyEmail = async () => {
      try {
        const result = await authService.verifyEmail(token)
        setStatus("success")
        setMessage("Email berhasil diverifikasi!")
      } catch (error: any) {
        setStatus("error")
        setMessage(error.message || "Gagal memverifikasi email")
      }
    }

    verifyEmail()
  }, [token])

  const handleLogin = async () => {
    setIsLoggingIn(true)
    try {
      router.push(`/login`)
    } catch (error) {
      console.error("Auto-login error:", error)
      router.push("/login")
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md mx-auto">
      {status === "success" && <Celebration />}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="mb-8"
      >
        {status === "loading" ? (
          <Loader2 className="w-12 h-12 text-gray-600 animate-spin mx-auto" />
        ) : status === "success" ? (
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
        ) : (
          <XCircle className="w-12 h-12 text-red-600 mx-auto" />
        )}
      </motion.div>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        {status === "loading"
          ? "Memverifikasi Email..."
          : status === "success"
            ? "Email Berhasil Diverifikasi!"
            : "Verifikasi Gagal"}
      </h1>

      <p className="text-gray-600 mb-8 leading-relaxed">
        {status === "loading" ? "Mohon tunggu, sedang memverifikasi email Anda." : message}
      </p>

      {/* Removed user-specific greeting since verifyEmail does not return user data */}

      {status !== "loading" && (
        <div className="space-y-4">
          {status === "success" ? (
            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 font-medium flex items-center justify-center"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Masuk ke Akun
                </>
              )}
            </Button>
          ) : (
            <>
              <Link href="/register">
                <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 font-medium">
                  Daftar Ulang
                </Button>
              </Link>

              <Link href="/login">
                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 font-medium bg-transparent"
                >
                  Kembali ke Login
                </Button>
              </Link>
            </>
          )}
        </div>
      )}
    </motion.div>
  )
}

function LoadingFallback() {
  return (
    <div className="text-center max-w-md mx-auto">
      <div className="mb-8">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-gray-600 mx-auto"></div>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Memuat...</h1>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <Suspense fallback={<LoadingFallback />}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  )
}
