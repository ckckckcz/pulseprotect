"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";
import { jwtService } from "@/lib/jwt-service";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, ArrowRight, RefreshCw, Shield, Sparkles, Zap } from "lucide-react";
import { LucideIcon } from "lucide-react";

const Particle = ({ delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        y: [-20, -100],
        x: [0, Math.random() * 40 - 20],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 2,
      }}
      className="absolute w-1 h-1 bg-teal-400 rounded-full"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
    />
  );
  // Floating icons component
  const FloatingIcon = ({ icon: Icon, delay = 0, duration = 4 }: { icon: LucideIcon, delay?: number, duration?: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: [0, 0.3, 0],
        y: [20, -20],
        rotate: [0, 360],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatDelay: 2,
      }}
      className="absolute text-teal-300/30"
    >
      <Icon className="w-6 h-6" />
    </motion.div>
  );

export default function GoogleAuthCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Get parameters from URL hash or search params
        const params = new URLSearchParams(window.location.hash ? window.location.hash.substring(1) : window.location.search);

        const accessToken = params.get("access_token");
        const error = params.get("error");
        const state = params.get("state");

        // Check state to prevent CSRF attacks
        const savedState = localStorage.getItem("google_auth_state");
        localStorage.removeItem("google_auth_state");

        if (error) {
          setStatus("error");
          setErrorMessage(`Authentication error: ${error}`);
          return;
        }

        if (!accessToken) {
          setStatus("error");
          setErrorMessage("No access token received");
          return;
        }

        if (state && savedState && state !== savedState) {
          setStatus("error");
          setErrorMessage("Invalid authentication state");
          return;
        }

        // Get user info from Google
        const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!userInfoResponse.ok) {
          setStatus("error");
          setErrorMessage("Failed to get user info from Google");
          return;
        }

        const userInfo = await userInfoResponse.json();

        // Login with Google
        const result = await authService.loginWithGoogle(userInfo);

        if (result.success) {
          // Important: Make sure to store JWT tokens
          if (result.accessToken && result.refreshToken) {
            jwtService.setTokens(result.accessToken, result.refreshToken);
            // console.log("✅ JWT tokens set in callback");
          } else {
            // console.warn("⚠️ No JWT tokens received in Google callback");
          }

          setStatus("success");
          // Redirect to home or intended page
          setTimeout(() => {
            const returnTo = sessionStorage.getItem("returnTo") || "/";
            sessionStorage.removeItem("returnTo");
            router.push(returnTo);
          }, 1000);
        } else {
          setStatus("error");
          setErrorMessage("Authentication failed");
        }
      } catch (error: any) {
        console.error("Google auth callback error:", error);
        setStatus("error");
        setErrorMessage(error.message || "An unexpected error occurred");
      }
    };

    processAuth();
  }, [router]);
  useEffect(() => {
    if (status === "loading") {
      // Smooth progress animation
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 8 + 2;
        });
      }, 150);

      const timer = setTimeout(() => {
        setProgress(100);
        clearInterval(progressInterval);

        setTimeout(() => {
          const isSuccess = Math.random() > 0.3;
          if (isSuccess) {
            setStatus("success");
          } else {
            setStatus("error");
            setErrorMessage("Authentication failed. Please verify your credentials and try again.");
          }
        }, 800);
      }, 2500);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [status]);

  const handleReturnToLogin = () => {
    console.log("Returning to login...");
  };

  const handleRetry = () => {
    setStatus("loading");
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/30 to-cyan-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl"
        />

        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <Particle key={i} delay={i * 0.2} />
        ))}

        {/* Floating icons */}
        <FloatingIcon icon={Sparkles} delay={1} />
        <FloatingIcon icon={Shield} delay={2} />
        <FloatingIcon icon={Zap} delay={3} />
      </div>

      {/* Main container */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
          {/* Header section */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-8 py-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="flex items-center justify-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-white text-xl font-semibold text-center mt-3">
              Secure Authentication
            </motion.h1>
          </div>

          {/* Content section */}
          <div className="px-8 py-10">
            <AnimatePresence mode="wait">
              {status === "loading" && (
                <motion.div key="loading" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }} className="text-center">
                  {/* Elegant loading spinner */}
                  <div className="relative mb-8">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-16 h-16 mx-auto">
                      <div className="w-16 h-16 border-3 border-teal-100 border-t-teal-600 rounded-full"></div>
                    </motion.div>
                    <motion.div animate={{ scale: [0.8, 1.2, 0.8] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 bg-teal-600 rounded-full"></div>
                    </motion.div>
                  </div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Verifying Account</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">Please wait while we securely authenticate your Google account</p>

                    {/* Elegant progress bar */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3, ease: "easeOut" }} className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full relative">
                          <motion.div animate={{ x: [-10, 50] }} transition={{ duration: 1, repeat: Infinity }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full" />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {status === "success" && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.5, ease: "backOut" }} className="text-center">
                  {/* Success icon with elegant animation */}
                  <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="relative mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>

                    {/* Success ripple effect */}
                    <motion.div initial={{ scale: 0, opacity: 0.6 }} animate={{ scale: 2.5, opacity: 0 }} transition={{ delay: 0.3, duration: 1.2 }} className="absolute inset-0 border-2 border-emerald-400 rounded-full" />

                    {/* Floating sparkles */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                          x: Math.cos((i * 60 * Math.PI) / 180) * 40,
                          y: Math.sin((i * 60 * Math.PI) / 180) * 40,
                        }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 1.5 }}
                        className="absolute top-1/2 left-1/2 w-1 h-1 bg-teal-400 rounded-full"
                      />
                    ))}
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Authentication Successful!</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">Welcome back! You'll be redirected to your dashboard shortly.</p>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex items-center justify-center space-x-2 text-teal-600 bg-teal-50 rounded-full px-4 py-2 inline-flex">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <Loader2 className="w-4 h-4" />
                      </motion.div>
                      <span className="text-sm font-medium">Redirecting...</span>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}

              {status === "error" && (
                <motion.div key="error" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.5, ease: "backOut" }} className="text-center">
                  {/* Error icon with shake animation */}
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="relative mb-8">
                    <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ delay: 0.5, duration: 0.5 }} className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <XCircle className="w-10 h-10 text-white" />
                    </motion.div>

                    {/* Error pulse */}
                    <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-red-400 rounded-full" />
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Authentication Failed</h2>

                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                      <p className="text-red-700 text-sm leading-relaxed">{errorMessage}</p>
                    </div>

                    <div className="space-y-3">
                      <Button
                        onClick={handleRetry}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl group"
                      >
                        <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }} className="mr-2">
                          <RefreshCw className="w-4 h-4" />
                        </motion.div>
                        Try Again
                        <motion.div animate={{ x: [0, 3, 0] }} transition={{ duration: 2, repeat: Infinity }} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                          <Sparkles className="w-4 h-4" />
                        </motion.div>
                      </Button>

                      <Button
                        onClick={handleReturnToLogin}
                        variant="outline"
                        className="w-full border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] group"
                      >
                        Return to Login
                        <motion.div animate={{ x: [0, 3, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} className="ml-2">
                          <ArrowRight className="w-4 h-4" />
                        </motion.div>
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer info */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-center mt-6">
          <p className="text-gray-500 text-sm">Secured by industry-standard encryption</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
