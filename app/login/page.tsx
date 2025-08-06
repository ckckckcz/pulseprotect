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
import { getHomePathForRole } from "@/lib/role-utils"
import { initializeGoogleLogin, triggerGoogleSignIn, resetGoogleAuthState } from '@/lib/google-auth';
import GoogleUserForm from '@/components/auth/GoogleUserForm';
import { authService } from "@/lib/auth";

// Extract the form component that uses useSearchParams
function LoginForm() {
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [showGoogleUserForm, setShowGoogleUserForm] = useState(false)
  const [googleUserInfo, setGoogleUserInfo] = useState<any>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [oneTapShown, setOneTapShown] = useState(false)
  const router = useRouter()
  const { login, loginWithGoogle, loading: isLoading, user, checkUserRole, refreshUser } = useAuth()

  // Initialize Google login on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Reset any previous state first
      resetGoogleAuthState();
      
      // Only initialize if Google Client ID is configured
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (googleClientId && googleClientId !== '' && googleClientId !== 'undefined') {
        initializeGoogleLogin()
          .then(() => {
            // console.log('Google login initialized successfully');
          })
          .catch(error => {
            console.error('Failed to initialize Google login:', error);
          });
      }
    }
  }, []);

  // Disable One Tap when user manually logs out
  useEffect(() => {
    return () => {
      // Cleanup: disable One Tap when component unmounts
      if (!user) {
        disableOneTap();
      }
    };
  }, [user]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const homePath = getHomePathForRole(user.role as any);
      router.push(homePath);
    }
  }, [user, router]);

  // Handle email from URL params and check for reset=success
  useEffect(() => {
    // Handle email from URL params
    const emailParam = searchParams?.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }

    // Show success message if coming from password reset
    const resetParam = searchParams?.get('reset')
    if (resetParam === 'success') {
      setSuccessMessage("Kata sandi berhasil diubah. Silakan masuk dengan kata sandi baru Anda.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!email || !password) {
      setError("Email dan password wajib diisi")
      return
    }
    
    try {
      // console.log(`Attempting login with email: ${email}`)
      
      // First check if this email exists and what role they have
      const userRole = await checkUserRole(email.trim());
      // console.log(`Checked user role for ${email}: ${userRole || 'unknown'}`);
      
      // Use safe error handling with the login function
      const loginResult = await login(email.trim(), password)
      
      if (loginResult && loginResult.error) {
        console.error('Login returned error:', loginResult.message)
        setError(loginResult.message || "Terjadi kesalahan saat login. Silakan coba lagi.")
        return;
      }
      
      // If login is successful and we have the user data, redirect based on role
      if (loginResult && loginResult.user) {
        const role = loginResult.user.role || 'user';
        const homePath = getHomePathForRole(role);
        // console.log(`Login successful. Redirecting to ${homePath} for role ${role}`);
        router.push(homePath);
      }
      
    } catch (error: any) {
      console.error('Unhandled login error:', error)
      setError(error.message || "Terjadi kesalahan saat login. Silakan coba lagi.")
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setIsGoogleLoading(true);

      // Check if Google is properly configured
      if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID === 'undefined') {
        throw new Error('Google login belum dikonfigurasi. Silakan gunakan login email/password.');
      }

      // Store current path to redirect back after auth
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const searchParams = new URLSearchParams(window.location.search);
        const redirectPath = searchParams.get('redirect') || '/';
        sessionStorage.setItem('returnTo', redirectPath);
      }

      // Disable One Tap and reset state before showing manual login popup
      disableOneTap();
      resetGoogleAuthState();
      
      // Small delay to ensure any pending requests are cleared
      await new Promise(resolve => setTimeout(resolve, 200));

      // console.log('Starting Google sign-in process...');

      // Trigger Google sign-in with comprehensive error handling
      const googleUser = await triggerGoogleSignIn();
      
      if (!googleUser || !googleUser.email) {
        throw new Error('Gagal mendapatkan informasi dari Google');
      }

      // console.log('Google user info received:', googleUser.email);

      // Try to login with existing user first (without additional info)
      try {
        const result = await authService.loginWithGoogle(googleUser);
        
        if (result.success) {
          if (result.isExistingUser) {
            // Existing user - manually update auth context and redirect
            // console.log('Existing Google user login successful, updating auth context');
            
            // Force refresh user in auth context
            if (typeof refreshUser === 'function') {
              await refreshUser();
            }
            
            // Small delay to ensure context is updated
            setTimeout(() => {
              const role = result.user.role || 'user';
              const homePath = getHomePathForRole(role);
              // console.log('Redirecting to:', homePath);
              router.push(homePath);
            }, 100);
            
            return;
          } else {
            // New user - show completion form
            setGoogleUserInfo(googleUser);
            setShowGoogleUserForm(true);
            return;
          }
        }
      } catch (loginError: any) {
        // console.log('Google login attempt result:', loginError.message);
        
        // If error is about missing full name, show the form
        if (loginError.message && loginError.message.includes('Nama lengkap wajib diisi')) {
          // console.log('Showing Google user form for new user');
          setGoogleUserInfo(googleUser);
          setShowGoogleUserForm(true);
          return;
        }
        
        // If it's any other error, rethrow it
        throw loginError;
      }

    } catch (error: any) {
      console.error('Google login error:', error);
      
      // Handle specific error types with better messages
      if (error.message?.includes('sedang diproses')) {
        setError('Google sign-in sedang diproses. Silakan tunggu sebentar dan coba lagi.');
      } else if (error.message?.includes('diblokir') || error.message?.includes('popup')) {
        setError('Popup Google sign-in diblokir. Pastikan popup tidak diblokir di browser Anda dan coba lagi.');
      } else if (error.message?.includes('NetworkError') || error.message?.includes('jaringan')) {
        setError('Terjadi masalah jaringan dengan Google. Periksa koneksi internet Anda dan coba lagi.');
      } else if (error.message?.includes('dibatalkan')) {
        setError('Google sign-in dibatalkan. Silakan coba lagi jika Anda ingin melanjutkan.');
      } else if (error.message?.includes('Timeout')) {
        setError('Login Google timeout. Periksa koneksi internet Anda dan coba lagi.');
      } else if (error.message?.includes('belum dikonfigurasi')) {
        setError('Google authentication saat ini tidak tersedia. Silakan gunakan login email/password.');
      } else {
        setError(error.message || 'Terjadi kesalahan saat login dengan Google. Silakan coba lagi atau gunakan login email/password.');  
      }
    } finally {
      setIsGoogleLoading(false);
      // Reset state to allow future requests
      setTimeout(() => {
        resetGoogleAuthState();
      }, 1000);
    }
  };

  const handleGoogleUserFormSubmit = async (formData: { fullName: string; phone: string }) => {
    try {
      setError("");
      setIsGoogleLoading(true);

      // Get avatar URL from the GoogleUserForm component
      const avatarUrl = document.querySelector<HTMLImageElement>('img[alt*="User"]')?.src ?? undefined;

      const result = await authService.loginWithGoogle(
        googleUserInfo,
        formData.fullName,
        formData.phone,
        avatarUrl
      );

      if (result.success) {
        // console.log('New Google user registration successful, updating auth context');
        
        // Force refresh user in auth context
        if (typeof refreshUser === 'function') {
          await refreshUser();
        }
        
        // Small delay to ensure context is updated
        setTimeout(() => {
          const role = result.user.role || 'user';
          const homePath = getHomePathForRole(role);
          // console.log('Redirecting to:', homePath);
          router.push(homePath);
        }, 100);
      }
    } catch (error: any) {
      console.error('Google user form submission error:', error);
      setError(error.message || 'Terjadi kesalahan saat menyelesaikan pendaftaran');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Show Google user form if needed
  if (showGoogleUserForm && googleUserInfo) {
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
            <span className="text-xl font-bold text-teal-600">pulseprotect</span>
          </Link>
        </div>

        <GoogleUserForm
          googleUserInfo={googleUserInfo}
          onSubmit={handleGoogleUserFormSubmit}
          isLoading={isGoogleLoading}
          error={error}
        />

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setShowGoogleUserForm(false);
              setGoogleUserInfo(null);
              setError("");
            }}
            className="text-sm text-teal-600 hover:text-teal-700 hover:underline transition-colors duration-200"
          >
            Kembali ke login
          </button>
        </div>
      </div>
    );
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
          <span className="text-xl font-bold text-teal-600">pulseprotect</span>
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
          Masuk untuk akses semua fitur pulseprotect
        </p>
      </motion.div>

      {/* One Tap akan muncul secara otomatis di sini jika user eligible */}
      
      {/* Google Login Button - Only show if configured */}
      {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID !== '' && (
        <>
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
              disabled={isLoading || isGoogleLoading}
              className="w-full py-5 bg-white border-gray-200 hover:bg-gray-50 text-gray-900 hover:text-gray-900 font-medium rounded-xl transition-all duration-200"
            >
              {isGoogleLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600 mr-2" />
                  Memproses...
                </div>
              ) : (
                <>
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
                </>
              )}
            </Button>
          </motion.div>

          {/* Divider - Only show if Google button is shown */}
          <div className="flex items-center mb-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">atau</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>
        </>
      )}

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm"
        >
          {successMessage}
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
          <Link href="/auth/forgot-password" className="text-sm text-teal-600 hover:text-teal-700 hover:underline transition-colors duration-200">
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
              "pulseprotect memudahkan saya dalam mengelola kota dan mengakses semua layanan dalam satu platform."
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
function initializeOneTap(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      return reject(new Error("One Tap only available in browser"));
    }
    // Check if Google One Tap is available
    if (
      !(window as any).google ||
      !(window as any).google.accounts ||
      !(window as any).google.accounts.id
    ) {
      return reject(new Error("Google One Tap SDK belum dimuat"));
    }
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === "undefined") {
      return reject(new Error("Google Client ID belum dikonfigurasi"));
    }
    try {
      (window as any).google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          // One Tap callback handled in triggerGoogleSignIn or elsewhere
        },
        auto_select: false,
        cancel_on_tap_outside: false,
        context: "signin",
      });
      (window as any).google.accounts.id.prompt((notification: any) => {
        // notification.isNotDisplayed() etc. can be handled if needed
      });
      resolve();
    } catch (err: any) {
      reject(err);
    }
  });
}
function disableOneTap() {
  if (typeof window === "undefined") return;
  try {
    if (
      (window as any).google &&
      (window as any).google.accounts &&
      (window as any).google.accounts.id &&
      typeof (window as any).google.accounts.id.cancel === "function"
    ) {
      (window as any).google.accounts.id.cancel();
    }
  } catch (err) {
    // Silently ignore errors
  }
}

