"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, User, DoorOpen, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const { user, loading, logout } = useAuth();
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // Add a key to force re-render when user state changes
  const authStateKey = user ? `user-${user.id}` : "no-user";

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
      await logout();
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
            <span className="text-xl font-bold text-teal-600">SmartCity</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="font-medium text-gray-800 hover:text-teal-600 transition-colors">
              Beranda
            </Link>
            <Link href="/about" className="font-medium text-gray-800 hover:text-teal-600 transition-colors">
              Tentang Kami
            </Link>
            <Link href="/services" className="font-medium text-gray-800 hover:text-teal-600 transition-colors">
              Layanan
            </Link>
            <Link href="/contact" className="font-medium text-gray-800 hover:text-teal-600 transition-colors">
              Kontak
            </Link>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-teal-500 transition-all">
                      <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.nama_lengkap}`} alt={user.nama_lengkap} />
                      <AvatarFallback className="bg-teal-100 text-teal-800">{getInitials(user.nama_lengkap)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-white text-black rounded-xl border-2 border-gray-200" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.nama_lengkap}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="border border-gray-200" />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem className="hover:bg-gray-100" asChild>
                      <Link href="/admin/dashboard">Dashboard Admin</Link>
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
              <>
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
              </>
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
                <Link href="/services" className="font-medium text-gray-800 hover:text-teal-600 transition-colors p-3 rounded-xl hover:bg-gray-100">
                  Layanan
                </Link>
                <Link href="/contact" className="font-medium text-gray-800 hover:text-teal-600 transition-colors p-3 rounded-xl hover:bg-gray-100">
                  Kontak
                </Link>

                {/* Mobile auth buttons or profile */}
                <div className="pt-4 border-t border-gray-200">
                  {loading ? (
                    <div className="w-full flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
                    </div>
                  ) : user ? (
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center space-x-3 p-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.nama_lengkap}`} alt={user.nama_lengkap} />
                          <AvatarFallback className="bg-teal-100 text-teal-800">{getInitials(user.nama_lengkap)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.nama_lengkap}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
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
                    <div className="flex flex-col space-y-2">
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
