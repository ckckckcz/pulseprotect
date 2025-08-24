"use client"

import type React from "react"
import { motion } from "framer-motion"
import { useState } from "react"
import { Eye, EyeOff, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authService } from "@/lib/auth"
import Logo from "@/public/logo.png";
import Image from "next/image";

// Password strength calculation
const calculatePasswordStrength = (password: string) => {
  let score = 0
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }

  // Add points for each criteria
  if (checks.length) score += 2
  if (checks.lowercase) score += 1
  if (checks.uppercase) score += 1
  if (checks.numbers) score += 1
  if (checks.special) score += 1

  // Determine strength level
  if (score <= 2) return { level: 'weak' as const, score, checks }
  if (score <= 4) return { level: 'medium' as const, score, checks }
  return { level: 'strong' as const, score, checks }
}

type PasswordStrength = ReturnType<typeof calculatePasswordStrength>

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    level: 'weak',
    score: 0,
    checks: {
      length: false,
      lowercase: false,
      uppercase: false,
      numbers: false,
      special: false
    }
  })
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showVerificationMessage, setShowVerificationMessage] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Calculate password strength when password changes
    if (field === 'password') {
      const strength = calculatePasswordStrength(value)
      setPasswordStrength(strength)
    }

    setError("") // Clear error when user types
    setSuccess("") // Clear success when user types
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Validation
    if (!formData.fullName.trim()) {
      setError("Nama lengkap wajib diisi")
      setIsLoading(false)
      return
    }

    if (!formData.email.trim()) {
      setError("Email wajib diisi")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError("Password minimal 8 karakter")
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok")
      setIsLoading(false)
      return
    }

    try {
      const result = await authService.register({
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim() || undefined
      })

      // Registration successful - show verification message
      setUserEmail(formData.email.trim())
      setShowVerificationMessage(true)
      setSuccess("Akun berhasil dibuat! Silakan cek email Anda untuk verifikasi.")

    } catch (error: any) {
      console.error('Registration error:', error)

      // Handle specific errors
      if (error.message.includes('Email sudah terdaftar') || error.message.includes('User already registered')) {
        setError("Email sudah terdaftar. Silakan gunakan email lain atau login.")
      } else if (error.message.includes('duplicate key value')) {
        setError("Email sudah terdaftar. Silakan gunakan email lain.")
      } else if (error.message.includes('invalid input syntax')) {
        setError("Format data tidak valid. Periksa kembali inputan Anda.")
      } else if (error.message.includes('violates row-level security policy')) {
        setError("Terjadi kesalahan izin. Silakan coba lagi.")
      } else {
        setError(error.message || "Terjadi kesalahan saat mendaftar. Silakan coba lagi.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    try {
      setIsLoading(true)
      await authService.resendVerification(userEmail)
      setSuccess("Email verifikasi telah dikirim ulang. Silakan cek email Anda.")
    } catch (error: any) {
      setError(error.message || "Gagal mengirim ulang email verifikasi")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleRegister = async () => {
    setError("Google sign-in belum tersedia pada saat ini.")
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Register Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 lg:px-16">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-5">
            <Link href="/" className="inline-flex items-center">
              <Image src={Logo} alt="Pulse Protect" width={32} height={32} className="w-8 h-8 text-teal-600 rounded-xl flex items-center justify-center mr-3" />
              <span className="text-xl font-bold text-teal-600">Pulse Protect</span>
            </Link>
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bergabung dengan {" "}
              <span className="text-teal-600 relative">
                Pulse Protect
              </span>
            </h1>
          </motion.div>

          {/* Google Register Button */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Button
              type="button"
              onClick={handleGoogleRegister}
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
              Daftar dengan Google
            </Button>
          </motion.div> */}

          {/* Divider */}
          {/* <div className="flex items-center mb-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">atau</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div> */}

          {/* Verification Message */}
          {showVerificationMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
            >
              <h3 className="text-blue-800 font-medium mb-2">Verifikasi Email Diperlukan</h3>
              <p className="text-blue-700 text-sm mb-3">
                Kami telah mengirim link verifikasi ke <strong>{userEmail}</strong>.
                Silakan cek email Anda dan klik link tersebut untuk mengaktifkan akun.
              </p>
              <button
                onClick={handleResendVerification}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
              >
                Kirim ulang email verifikasi
              </button>
            </motion.div>
          )}

          {/* Success Message */}
          {success && !showVerificationMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-teal-50 border border-teal-200 text-teal-700 rounded-xl text-sm"
            >
              {success}
            </motion.div>
          )}

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

          {/* Hide form if verification message is shown */}
          {!showVerificationMessage && (
            <>
              {/* Register Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="lg:grid lg:grid-cols-2 grid grid-cols-1 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      className="w-full px-4 py-6 bg-white border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                      placeholder="Masukkan nama lengkap"
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
                      Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="w-full px-4 py-6 bg-white border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                      placeholder="example@example.com"
                      required
                      disabled={isLoading}
                    />
                  </motion.div>

                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Telepon
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-4 py-6 bg-white border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                    placeholder="08123456789 (opsional)"
                    disabled={isLoading}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="w-full px-4 py-6 pr-12 bg-white border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                      placeholder="Minimal 8 karakter"
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

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">
                          Kekuatan Password
                        </span>
                        <span className={`text-xs font-medium capitalize ${passwordStrength.level === 'weak' ? 'text-red-500' :
                          passwordStrength.level === 'medium' ? 'text-yellow-500' : 'text-teal-500'
                          }`}>
                          {passwordStrength.level === 'weak' ? 'Lemah' :
                            passwordStrength.level === 'medium' ? 'Sedang' : 'Kuat'}
                        </span>
                      </div>

                      <div className="flex space-x-1 mb-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-2 flex-1 rounded-full transition-all duration-300 ${level <= passwordStrength.score
                              ? passwordStrength.level === 'weak' ? 'bg-red-400' :
                                passwordStrength.level === 'medium' ? 'bg-yellow-400' : 'bg-teal-400'
                              : 'bg-gray-200'
                              }`}
                          />
                        ))}
                      </div>

                      <div className="text-xs text-gray-500 space-y-1">
                        <div className={`flex items-center ${passwordStrength.checks.length ? 'text-teal-600' : 'text-gray-400'}`}>
                          <span className="mr-2">{passwordStrength.checks.length ? '✓' : '○'}</span>
                          Minimal 8 karakter
                        </div>
                        <div className={`flex items-center ${passwordStrength.checks.lowercase ? 'text-teal-600' : 'text-gray-400'}`}>
                          <span className="mr-2">{passwordStrength.checks.lowercase ? '✓' : '○'}</span>
                          Huruf kecil (a-z)
                        </div>
                        <div className={`flex items-center ${passwordStrength.checks.uppercase ? 'text-teal-600' : 'text-gray-400'}`}>
                          <span className="mr-2">{passwordStrength.checks.uppercase ? '✓' : '○'}</span>
                          Huruf besar (A-Z)
                        </div>
                        <div className={`flex items-center ${passwordStrength.checks.numbers ? 'text-teal-600' : 'text-gray-400'}`}>
                          <span className="mr-2">{passwordStrength.checks.numbers ? '✓' : '○'}</span>
                          Angka (0-9)
                        </div>
                        <div className={`flex items-center ${passwordStrength.checks.special ? 'text-teal-600' : 'text-gray-400'}`}>
                          <span className="mr-2">{passwordStrength.checks.special ? '✓' : '○'}</span>
                          Karakter khusus (!@#$%^&*)
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konfirmasi Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="w-full px-4 py-6 pr-12 bg-white border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                      placeholder="Ulangi password"
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
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    type="submit"
                    disabled={isLoading || success !== ""}
                    className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white py-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Mendaftar...
                      </div>
                    ) : success ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 mr-2 text-teal-400">✓</div>
                        Berhasil!
                      </div>
                    ) : (
                      "Buat Akun"
                    )}
                  </Button>
                </motion.div>
              </form>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-6 text-center"
              >
                <p className="text-gray-600">
                  Sudah punya akun?{" "}
                  <Link href="/login" className="text-teal-600 hover:text-teal-700 hover:underline font-medium transition-colors duration-200">
                    Masuk di sini
                  </Link>
                </p>
              </motion.div>
            </>
          )}

          {/* Show login link when verification message is displayed */}
          {showVerificationMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-center"
            >
              <p className="text-gray-600">
                Sudah verifikasi email?{" "}
                <Link href="/login" className="text-teal-600 hover:text-teal-700 hover:underline font-medium transition-colors duration-200">
                  Masuk di sini
                </Link>
              </p>
            </motion.div>
          )}
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
              "Bergabung dengan pulseprotect adalah keputusan terbaik! Sekarang mengelola kota jadi lebih mudah dan efisien."
            </blockquote>

            <div className="mb-6">
              <p className="font-semibold">Ahmad Rahman</p>
              <p className="text-teal-100">City Manager at pulseprotect</p>
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
