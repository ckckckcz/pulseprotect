"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center">
          <div className="w-8 h-8 bg-teal-600 rounded-xl flex items-center justify-center mr-3">
            <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-teal-600 rounded-md"></div>
            </div>
          </div>
          <span
            className={`text-xl font-bold ${
              scrolled ? "text-teal-600" : "text-teal-600"
            }`}
          >
            SmartCity
          </span>
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/"
            className={`font-medium ${
              scrolled
                ? "text-gray-800 hover:text-teal-600"
                : "text-gray-800 hover:text-teal-600"
            } transition-colors`}
          >
            Beranda
          </Link>
          <Link
            href="/about"
            className={`font-medium ${
              scrolled
                ? "text-gray-800 hover:text-teal-600"
                : "text-gray-800 hover:text-teal-600"
            } transition-colors`}
          >
            Tentang Kami
          </Link>
          <Link
            href="/services"
            className={`font-medium ${
              scrolled
                ? "text-gray-800 hover:text-teal-600"
                : "text-gray-800 hover:text-teal-600"
            } transition-colors`}
          >
            Layanan
          </Link>
          <Link
            href="/contact"
            className={`font-medium ${
              scrolled
                ? "text-gray-800 hover:text-teal-600"
                : "text-gray-800 hover:text-teal-600"
            } transition-colors`}
          >
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
                    <AvatarImage
                      src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.nama_lengkap}`}
                      alt={user.nama_lengkap}
                    />
                    <AvatarFallback className="bg-teal-100 text-teal-800">
                      {getInitials(user.nama_lengkap)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 bg-white text-black rounded-xl border-2 border-gray-200" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.nama_lengkap}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
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
                {user.role === "admin" && (
                  <DropdownMenuItem className="hover:bg-gray-100" asChild>
                    <Link href="/admin/dashboard">Dashboard Admin</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="border border-gray-200" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 cursor-pointer"
                >
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
                    scrolled
                      ? "bg-white text-teal-600 border-teal-600 hover:bg-teal-50"
                      : "bg-white text-teal-600 border-teal-600 hover:bg-teal-50"
                  }`}
                >
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  className={`font-medium rounded-xl px-6 ${
                    scrolled
                      ? "bg-teal-600 hover:bg-teal-700 text-white"
                      : "bg-teal-600 hover:bg-teal-700 text-white"
                  }`}
                >
                  Daftar
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 focus:outline-none ${
              scrolled ? "text-gray-800" : "text-gray-800"
            }`}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                <Link
                  href="/"
                  className="font-medium text-gray-800 hover:text-teal-600 transition-colors p-2"
                >
                  Beranda
                </Link>
                <Link
                  href="/about"
                  className="font-medium text-gray-800 hover:text-teal-600 transition-colors p-2"
                >
                  Tentang Kami
                </Link>
                <Link
                  href="/services"
                  className="font-medium text-gray-800 hover:text-teal-600 transition-colors p-2"
                >
                  Layanan
                </Link>
                <Link
                  href="/contact"
                  className="font-medium text-gray-800 hover:text-teal-600 transition-colors p-2"
                >
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
                          <AvatarImage
                            src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.nama_lengkap}`}
                            alt={user.nama_lengkap}
                          />
                          <AvatarFallback className="bg-teal-100 text-teal-800">
                            {getInitials(user.nama_lengkap)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.nama_lengkap}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <Link href="/profile">
                        <Button variant="outline" className="w-full justify-start">
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
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={handleLogout}
                      >
                        Keluar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Link href="/login" className="w-full">
                        <Button
                          variant="outline"
                          className="w-full bg-white text-teal-600 border-teal-600"
                        >
                          Masuk
                        </Button>
                      </Link>
                      <Link href="/register" className="w-full">
                        <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                          Daftar
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
