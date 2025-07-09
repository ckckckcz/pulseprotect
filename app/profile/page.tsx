"use client"

import { useState, useEffect } from "react"
import { Search, Mail, Shield, CheckCircle, User, Key, CreditCard, FileText, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import Navbar from "@/components/widget/navbar"

// Define a type for the user with status
type UserWithStatus = {
  id?: string | number
  nama_lengkap?: string
  email?: string
  nomor_telepon?: string
  role?: string
  created_at?: string
  foto_profile?: string
  status?: string
  verifikasi_email?: boolean
  email_confirmed_at?: string | null
}

export default function UserProfile() {
  const [activeSetting, setActiveSetting] = useState("general")
  const { user, loading } = useAuth() as { user: UserWithStatus | null, loading: boolean }
  const router = useRouter()
  const [displayName, setDisplayName] = useState("")
  const [username, setUsername] = useState("")
  
  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push("/login")
    }
    
    // Initialize form values from user data
    if (user) {
      setDisplayName(user.nama_lengkap || "")
      setUsername(user.email?.split('@')[0] || "")
    }
  }, [user, loading, router])
  
  // Get user initials for the avatar fallback
  const getInitials = (name: string = "") => {
    return name
      .split(" ")
      .map((part) => part[0] || "")
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!user) {
    return null // Let the useEffect redirect handle this
  }

  const sidebarItems = [
    { id: "general", label: "General", icon: User },
    { id: "authentication", label: "Authentication", icon: Key },
    { id: "vercel", label: "Sign in with Vercel", icon: Code },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "invoices", label: "Invoices", icon: FileText },
    { id: "tokens", label: "Tokens", icon: Code },
  ]

  return (
    <>
      <Navbar/>
      <div className="w-full min-h-screen bg-white text-black pt-32">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Pengaturan Akun</h1>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="md:w-72">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search..." 
                  className="pl-10 bg-white border-gray-800 text-black rounded-md" 
                />
              </div>
              
              <nav className="space-y-1">
                {sidebarItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSetting(item.id)}
                    className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${
                      activeSetting === item.id 
                        ? "bg-teal-600 hover:bg-teal-700 rounded-xl text-white"
                        : "text-gray-400 rounded-xl hover:bg-gray-100 hover:text-black"
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
            
            {/* Main content */}
            <div className="flex-1">
              {activeSetting === "general" && (
                <div className="space-y-6">
                  {/* Avatar Section */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-2xl font-semibold">Avatar</h2>
                      <p className="text-gray-400 text-sm mb-6">Klik pada avatar untuk mengunggah yang baru dari file Anda.</p>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="relative group cursor-pointer">
                            <Avatar className="h-16 w-16 rounded-full bg-gradient-to-br from-pink-500 to-orange-500">
                              <AvatarImage
                                src={user.foto_profile || `https://api.dicebear.com/6.x/initials/svg?seed=${user.nama_lengkap || "User"}`}
                                alt={user.nama_lengkap || "User"}
                              />
                              <AvatarFallback className="bg-gray-800 text-black">
                                {getInitials(user.nama_lengkap)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 bg-white bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-xs text-black">Upload</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 border-t border-gray-200 p-4">
                      <p className="text-teal-600 font-semibold text-sm">Avatar bersifat opsional tapi sangat direkomendasikan.</p>
                    </div>
                  </div>

                  {/* Display Name Section */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-2xl font-semibold">Nama Tampilan</h2>
                      <p className="text-gray-400 text-sm mb-6">Silakan masukkan nama lengkap Anda, atau nama tampilan yang Anda nyaman gunakan.</p>
                      
                      <Input 
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        className="bg-white border-gray-200 rounded text-black"
                        placeholder="Nama lengkap"
                      />
                    </div>
                    
                    <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-between items-center">
                      <p className="text-teal-600 font-semibold text-sm">Maksimal 32 karakter.</p>
                      <Button className="bg-white border border-gray-200 rounded-xl text-black hover:bg-teal-600 hover:text-white">Simpan</Button>
                    </div>
                  </div>
                  
                  {/* Email Section */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-2xl font-semibold">Alamat Email</h2>
                      <p className="text-gray-400 text-sm mb-6">Email Anda yang terdaftar pada platform.</p>
                    
                      <Input 
                        value={user.email}
                        onChange={e => setDisplayName(e.target.value)}
                        className="bg-white border-gray-200 rounded text-black"
                        placeholder="Nama lengkap"
                      />
                    </div>
                    <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-between items-center">
                      <p className="text-teal-600 font-semibold text-sm">Maksimal 32 karakter.</p>
                      <Button className="bg-white border border-gray-200 rounded-xl text-black hover:bg-teal-600 hover:text-white">Simpan</Button>
                    </div>
                  </div>
                </div>
              )}
              
              {activeSetting === "authentication" && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <h2 className="text-2xl font-semibold">Autentikasi</h2>
                  <p className="text-gray-400 text-sm">Pengaturan keamanan dan autentikasi akun Anda.</p>
                  
                  <div className="mt-6 p-4 rounded-xl bg-gray-100 border border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-gray-200 rounded-full">
                        <Shield className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">Keamanan Akun</h3>
                        <p className="text-gray-400 text-sm">
                          Kami merekomendasikan untuk secara rutin memperbarui kata sandi dan mengaktifkan 
                          autentikasi dua faktor untuk keamanan yang lebih baik.
                        </p>
                        <Button className="mt-4 bg-teal-600 rounded-xl hover:bg-teal-700 text-white">
                          Perbarui Pengaturan Keamanan
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
                    
