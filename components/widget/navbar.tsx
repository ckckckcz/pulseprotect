"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, User, DoorOpen, Zap, Crown, Stethoscope } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase"; // pastikan import supabase
import { disableOneTap, resetGoogleAuthState } from '@/lib/google-auth';
import { authService } from "@/lib/auth";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const auth = useAuth();
  const user = auth?.user;
  const loading = auth?.loading;
  const logout = auth?.logout;
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // Add a key to force re-render when user state changes and debug logging
  const authStateKey = user ? `user-${user.id}-${user.email}` : "no-user";
  
  // Debug logging
  // useEffect(() => {
  //   console.log('Navbar: Auth state changed:', {
  //     hasUser: !!user,
  //     userEmail: user?.email,
  //     loading,
  //     authStateKey
  //   });
  // }, [user, loading, authStateKey]);

  // Hide navbar on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Always show navbar when scrolling
      setVisible(true);
      
      // Update scrolled state for appearance
      if (currentScrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
      
      // Store last scroll position
      lastScrollY.current = currentScrollY;
      
      // Clear any existing timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      
      // Set timeout to hide navbar after 2 seconds of no scrolling
      // Don't hide if at top of page or if menu is open
      scrollTimeout.current = setTimeout(() => {
        if (currentScrollY > 50 && !isMenuOpen) {
          setVisible(false);
        }
      }, 2000);
    };

    window.addEventListener("scroll", handleScroll);
    
    // Initial show
    setVisible(true);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      if (logout) {
        // Disable One Tap and reset Google auth state before logging out
        disableOneTap();
        resetGoogleAuthState();
        // Clear all auth artifacts (cookies + localStorage)
        authService.logout();
        await logout();
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Get user initials for the avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // State untuk membership_type dari payment
  const [latestMembershipType, setLatestMembershipType] = useState<string | undefined>(undefined);

  // Fetch membership_type dari payment jika user login
  useEffect(() => {
    const fetchLatestMembership = async () => {
      if (!user?.email) {
        setLatestMembershipType(undefined);
        return;
      }
      const { data, error } = await supabase
        .from("payment")
        .select("membership_type, created_at, status")
        .eq("email", user.email)
        .eq("status", "success")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && data.membership_type) {
        setLatestMembershipType(data.membership_type);
      } else {
        setLatestMembershipType(undefined);
      }
    };
    fetchLatestMembership();
  }, [user?.email]);

  // Gunakan membership_type dari payment jika ada, fallback ke user.account_membership
  const membershipType = (latestMembershipType || user?.account_membership || "free").toLowerCase();

  const getAvatarClass = () => {
    switch (membershipType) {
      case "plus":
        return "ring-2 ring-teal-500 ring-offset-2 ring-offset-white shadow-[0_0_10px_rgba(20,184,166,0.5)]";
      case "pro":
        return "ring-2 ring-amber-400 ring-offset-2 ring-offset-white shadow-[0_0_15px_rgba(245,158,11,0.6)] border-2 border-amber-300";
      default:
        return "";
    }
  };

  const getMembershipBadge = () => {
    if (membershipType === "free") return null;
    const isPro = membershipType === "pro";
    return (
      <span 
        className={`absolute -top-1 -right-1 rounded-full flex items-center justify-center ${
          isPro 
            ? "w-6 h-6 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 p-0.5" 
            : "w-5 h-5 bg-teal-500"
        }`}
      >
        <span className={`${isPro ? "bg-amber-100 rounded-full w-full h-full flex items-center justify-center" : ""}`}>
          <Crown className={`${isPro ? "h-3 w-3 text-amber-600" : "h-3 w-3 text-white"}`} />
        </span>
      </span>
    );
  };

  // Tambahkan avatarUrl state
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  useEffect(() => {
    if (user?.foto_profile) {
      setAvatarUrl(user.foto_profile);
    } else if (user?.nama_lengkap) {
      setAvatarUrl(`https://api.dicebear.com/6.x/initials/svg?seed=${user.nama_lengkap}`);
    } else {
      setAvatarUrl("");
    }
  }, [user?.foto_profile, user?.nama_lengkap]);

  return (
    <motion.header 
      key={authStateKey} 
      className="fixed top-0 left-0 right-0 z-50 px-4 pt-4"
      initial={{ y: 0 }}
      animate={{ y: visible ? 0 : -200 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <motion.div 
        animate={{
          borderRadius: isMenuOpen ? "24px 24px 0 0" : "9999px",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`container px-5 ${
          scrolled 
            ? "bg-white/95 backdrop-blur-xs shadow-lg lg:py-6 py-4" 
            : "bg-white/80 backdrop-blur-xs lg:py-6 py-4"
        }`}
      >
        <div className="px-1 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center">
            <Zap className="w-8 h-8 text-teal-600 rounded-xl flex items-center justify-center mr-3" fill="currentColor" />
            <span className="text-xl font-bold text-teal-600">Pulse Protect</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="font-medium text-gray-800 hover:text-teal-600 transition-colors">
              Beranda
            </Link>
            <Link href="/about" className="font-medium text-gray-800 hover:text-teal-600 transition-colors">
              Tentang Kami
            </Link>
            <Link href="/cek-obat" className="font-medium text-gray-800 hover:text-teal-600 transition-colors">
              Cek Obat
            </Link>
            <Link href="/silva" className="font-medium text-gray-800 hover:text-teal-600 transition-colors">
              Silva
            </Link>
            {/* <Link href="/contact" className="font-medium text-gray-800 hover:text-teal-600 transition-colors">
              Kontak
            </Link> */}
          </nav>

          {/* Auth Buttons or User Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              // Loading spinner
              <div className="w-10 h-10 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
              </div>
            ) : user ? (
              // User is logged in - show profile
              <DropdownMenu key={authStateKey}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <div className="relative">
                      <Avatar className={`h-10 w-10 cursor-pointer hover:ring-2 hover:ring-teal-500 border-teal-500 border-2 transition-all ${getAvatarClass()}`}>
                        <AvatarImage src={avatarUrl} alt={user.nama_lengkap || "User"} />
                        <AvatarFallback className="bg-teal-100 text-teal-800">{getInitials(user.nama_lengkap)}</AvatarFallback>
                      </Avatar>
                      {getMembershipBadge()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-white text-black rounded-xl border-2 border-gray-200" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.nama_lengkap}</p>
                      <p className="text-xs leading-none mb-2 text-muted-foreground">{user.email}</p>
                      {/* Paket aktif */}
                      <p className="text-xs mt-2 flex items-center space-x-">
                        <span
                          className={
                            membershipType === "pro"
                              ? "inline-block w-2 h-2 rounded-full bg-amber-500 mr-1"
                              : membershipType === "plus"
                              ? "inline-block w-2 h-2 rounded-full bg-teal-500 mr-1"
                              : "inline-block w-2 h-2 rounded-full bg-gray-400 mr-1"
                          }
                        ></span>
                        <span
                          className={
                            membershipType === "pro"
                              ? "text-amber-600 font-semibold"
                              : membershipType === "plus"
                              ? "text-teal-600 font-semibold"
                              : "text-gray-500"
                          }
                        >
                          {membershipType === "pro"
                            ? "Pro Plan"
                            : membershipType === "plus"
                            ? "Plus Plan"
                            : "Free Plan"}
                        </span>
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="border border-gray-200" />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="border border-gray-200" />
                  <DropdownMenuItem asChild>
                    <Link href="/konsultasi">
                      <Stethoscope className="mr-2 h-4 w-4" />
                      <span>Konsultasi</span>
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "dokter" && (
                    <DropdownMenuItem className="hover:bg-gray-100" asChild>
                      <Link href="/dokter">Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="border border-gray-200" />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <DoorOpen className="mr-2 h-4 w-4" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // User is not logged in - show login/register buttons
              <div key="auth-buttons" className="flex items-center space-x-4">
                <Link href="/login">
                  <Button
                    variant="outline"
                    className={`font-medium rounded-xl px-6 ${
                      scrolled ? "bg-gray-100 text-gray-900 border-2 hover:bg-gray-200 hover:text-gray-900 border-gray-200" : "bg-gray-100 text-gray-900 border-2 hover:bg-gray-200 hover:text-gray-900 border-gray-200"
                    }`}
                  >
                    Masuk
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className={`font-medium rounded-xl px-6 ${scrolled ? "bg-teal-600 hover:bg-teal-700 text-white" : "bg-teal-600 hover:bg-teal-700 text-white"}`}>Daftar</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="p-2 focus:outline-none text-gray-800"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto", borderRadius: "0 0 24px 24px" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ 
              opacity: { duration: 0.2 }, 
              height: { duration: 0.3, ease: "easeInOut" },
              borderRadius: { duration: 0.3, ease: "easeInOut" }
            }}
            className="md:hidden container px-5 bg-white/95 backdrop-blur-xs shadow-lg mt-0 overflow-hidden"
          >
            <div className="py-6 px-0">
              <nav className="flex flex-col space-y-2">
                <Link href="/" className="font-medium text-gray-800 hover:text-teal-600 transition-colors p-3 rounded-xl hover:bg-gray-100">
                  Beranda
                </Link>
                <Link href="/about" className="font-medium text-gray-800 hover:text-teal-600 transition-colors p-3 rounded-xl hover:bg-gray-100">
                  Tentang Kami
                </Link>
                <Link href="/cek-obat" className="font-medium text-gray-800 hover:text-teal-600 transition-colors p-3 rounded-xl hover:bg-gray-100">
                  Cek Obat
                </Link>
                <Link href="/silva" className="font-medium text-gray-800 hover:text-teal-600 transition-colors p-3 rounded-xl hover:bg-gray-100">
                  Silva
                </Link>
                {/* <Link href="/contact" className="font-medium text-gray-800 hover:text-teal-600 transition-colors p-3 rounded-xl hover:bg-gray-100">
                  Kontak
                </Link> */}

                {/* Mobile auth buttons or profile */}
                <div className="pt-4 border-t border-gray-200">
                  {loading ? (
                    <div className="w-full flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
                    </div>
                  ) : user ? (
                    <div key={authStateKey} className="flex flex-col space-y-4">
                      <div className="flex items-center space-x-3 p-2">
                        <div className="relative">
                          <Avatar className={`h-10 w-10 border-2 border-teal-500 ${getAvatarClass()}`}>
                            <AvatarImage src={avatarUrl} alt={user.nama_lengkap} />
                            <AvatarFallback className="bg-teal-100 text-teal-800">{getInitials(user.nama_lengkap)}</AvatarFallback>
                          </Avatar>
                          {getMembershipBadge()}
                        </div>
                        <div>
                          <p className="font-medium text-black">{user.nama_lengkap}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          {user.account_membership && user.account_membership !== "free" && (
                            <p className="text-xs font-medium mt-1 flex items-center">
                              <span className={`w-2 h-2 rounded-full mr-1 ${user.account_membership === "pro" ? "bg-amber-500" : "bg-teal-500"}`}></span>
                              <span className={`${user.account_membership === "pro" ? "text-amber-600" : "text-teal-600"}`}>
                                {user.account_membership === "pro" ? "Pro Plan" : "Plus Plan"}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Link href="/profile">
                          <Button variant="outline" className="w-full justify-start bg-gray-50 border-2 border-gray-200 rounded-xl text-md font-medium hover:bg-gray-100 hover:text-gray-900 text-gray-900">
                            <User className="mr-2 h-4 w-4" />
                            Profil
                          </Button>
                        </Link>
                        {user.role === "admin" && (
                          <Link href="/admin/dashboard">
                            <Button variant="outline" className="w-full justify-start">
                              Dashboard Admin
                            </Button>
                          </Link>
                        )}
                        <Button onClick={handleLogout} variant="destructive" className="w-full justify-start bg-red-50 border-2 border-red-200 rounded-xl text-md font-medium hover:bg-red-100 hover:text-red-900 text-red-900">
                          <DoorOpen className="mr-2 h-4 w-4" />
                          Keluar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div key="mobile-auth-buttons" className="flex flex-col space-y-2">
                      <Link href="/login" className="w-full">
                        <Button variant="outline" className="w-full bg-gray-50 border-2 border-gray-200 hover:bg-gray-200 hover:text-gray-900 rounded-xl ">
                          Masuk
                        </Button>
                      </Link>
                      <Link href="/register" className="w-full">
                        <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl">Daftar</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

