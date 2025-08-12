"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth"
import { jwtService } from "@/lib/jwt-service"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function GoogleAuthCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")
  const [progress, setProgress] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Get parameters from URL hash or search params
        const params = new URLSearchParams(
          window.location.hash ? window.location.hash.substring(1) : window.location.search,
        )

        const accessToken = params.get("access_token")
        const error = params.get("error")
        const state = params.get("state")

        // Check state to prevent CSRF attacks
        const savedState = localStorage.getItem("google_auth_state")
        localStorage.removeItem("google_auth_state")

        if (error) {
          setStatus("error")
          setErrorMessage(`Authentication error: ${error}`)
          return
        }

        if (!accessToken) {
          setStatus("error")
          setErrorMessage("No access token received")
          return
        }

        if (state && savedState && state !== savedState) {
          setStatus("error")
          setErrorMessage("Invalid authentication state")
          return
        }

        // Get user info from Google
        const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (!userInfoResponse.ok) {
          setStatus("error")
          setErrorMessage("Failed to get user info from Google")
          return
        }

        const userInfo = await userInfoResponse.json()

        // Login with Google
        const result = await authService.loginWithGoogle(userInfo)

        if (result.success) {
          if (result.accessToken && result.refreshToken) {
            jwtService.setTokens(result.accessToken, result.refreshToken)
          }

          setStatus("success")
          setTimeout(() => {
            const returnTo = sessionStorage.getItem("returnTo") || "/"
            sessionStorage.removeItem("returnTo")
            router.push(returnTo)
          }, 1500)
        } else {
          setStatus("error")
          setErrorMessage("Authentication failed")
        }
      } catch (error: any) {
        console.error("Google auth callback error:", error)
        setStatus("error")
        setErrorMessage(error.message || "An unexpected error occurred")
      }
    }

    processAuth()
  }, [router])

  useEffect(() => {
    if (status === "loading") {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return prev
          return prev + Math.random() * 8 + 2
        })
      }, 150)

      return () => clearInterval(progressInterval)
    }
  }, [status])

  const handleRetry = () => {
    setStatus("loading")
    setProgress(0)
  }

  const handleReturnToLogin = () => {
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <AnimatePresence mode="wait">
          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Simple loading spinner */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full mx-auto mb-8"
              />

              <h1 className="text-2xl font-semibold text-gray-900 mb-4">Authenticating...</h1>

              <p className="text-gray-600 mb-8">Verifying your Google account</p>

              {/* Simple progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-1 mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="h-1 bg-gray-900 rounded-full"
                />
              </div>

              <p className="text-sm text-gray-500">{Math.round(progress)}% complete</p>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-8"
              >
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
              </motion.div>

              <h1 className="text-2xl font-semibold text-gray-900 mb-4">Success!</h1>

              <p className="text-gray-600 mb-8">Authentication completed successfully</p>

              <div className="flex items-center justify-center space-x-2 text-gray-500">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Loader2 className="w-4 h-4" />
                </motion.div>
                <span className="text-sm">Redirecting...</span>
              </div>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-8"
              >
                <XCircle className="w-12 h-12 text-red-600 mx-auto" />
              </motion.div>

              <h1 className="text-2xl font-semibold text-gray-900 mb-4">Authentication Failed</h1>

              <p className="text-red-600 text-sm mb-8 bg-red-50 p-4 rounded-lg">{errorMessage}</p>

              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                >
                  Try Again
                </button>

                <button
                  onClick={handleReturnToLogin}
                  className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Return to Login
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-gray-400 mt-12"
        >
          Secured authentication
        </motion.p>
      </div>
    </div>
  )
}
