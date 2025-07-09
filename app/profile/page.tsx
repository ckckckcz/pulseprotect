"use client"

import { useState, useEffect } from "react"
import { MapPin, Mail, Phone, Calendar, Shield, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Navbar from "@/components/widget/navbar"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

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
  const [activeTab, setActiveTab] = useState("Profile")
  // Only call useAuth() once, inside the component
  const { user, loading } = useAuth() as { user: UserWithStatus | null, loading: boolean }
  const router = useRouter()
  
  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push("/login")
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
  
  // Format date
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Tidak tersedia"
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  if (!user) {
    return null // Let the useEffect redirect handle this
  }

  return (
    <>
      <Navbar/>
      <div className="w-full mx-auto bg-white mt-16">
        <Card className=" border-none bg-white">
          {/* Profile Banner */}
          <div className="relative">
            <div
              className="h-48 sm:h-56 bg-gradient-to-r from-teal-400 to-teal-600"
              style={{
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />

            {/* Profile Photo - Overlapping the banner */}
            <div className="absolute -bottom-12 left-6 sm:left-8">
              <div className="relative">
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg">
                  <AvatarImage
                    src={user.foto_profile || `https://api.dicebear.com/6.x/initials/svg?seed=${user.nama_lengkap || "User"}`}
                    alt={user.nama_lengkap || "User"}
                  />
                  <AvatarFallback className="bg-teal-600 text-white text-2xl">
                    {getInitials(user.nama_lengkap)}
                  </AvatarFallback>
                </Avatar>
                {user.status === "active" && (
                  <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="pt-16 pb-6 px-6 sm:px-8 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{user.nama_lengkap || "Pengguna"}</h1>                
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"></h1>                
                <div className="flex items-center text-gray-600 mb-4">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{user.email || "Email tidak tersedia"}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center gap-2">
                  Edit Profil
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mt-8 border-b border-gray-200">
              <nav className="flex space-x-8">
                {[
                  {
                    id: "Profile",
                    label: "Profil"
                  },
                  {
                    id: "Chat",
                    label: "Chat AI"
                  }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 px-1 border-b-2 font-semibold text-md transition-colors ${
                      activeTab === tab.id
                        ? "border-teal-600 text-teal-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              {activeTab === "Profile" && (
                <div className="space-y-6">
                  {/* Personal Information */}
                  <Card className="p-6 shadow-sm border-2 rounded-xl border-gray-100 bg-white">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pribadi</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-400">Nama Lengkap</p>
                          <p className="font-medium text-lg text-gray-900">{user.nama_lengkap || "Tidak tersedia"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Alamat Email</p>
                          <div className="flex items-center">
                            <p className="font-medium text-lg mr-2 text-gray-900">{user.email || "Tidak tersedia"}</p>
                            {user.verifikasi_email && (
                              <CheckCircle size={16} className="text-green-500" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-400">Nomor Telepon</p>
                          <p className="font-medium text-lg text-gray-900">{user.nomor_telepon || "Tidak tersedia"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Status Akun</p>
                          <p className={`font-medium ${
                            user.status === "active" ? "text-green-600" : "text-gray-600"
                          }`}>
                            {user.status === "active" ? "Aktif" : "Tidak Aktif"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Account Information */}
                  <Card className="p-6 shadow-sm border-2 rounded-xl border-gray-100 bg-white">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Akun</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-400">Tanggal Bergabung</p>
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            <p className="font-medium text-lg text-gray-900">{formatDate(user.created_at)}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Peran Akun</p>
                          <div className="flex items-center gap-2">
                            <Shield size={16} className="text-gray-400" />
                            <p className="font-medium text-lg text-gray-900">
                              {user.role === "admin" ? "Administrator" : 
                               user.role === "user" ? "Pengguna" : 
                               user.role || "Pengguna Standar"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-400">Verifikasi Email</p>
                          <p className={`font-medium ${
                            user.verifikasi_email ? "text-green-600" : "text-amber-600"
                          }`}>
                            {user.verifikasi_email ? "Terverifikasi" : "Belum Terverifikasi"}
                          </p>
                        </div>
                        {user.email_confirmed_at && (
                          <div>
                            <p className="text-sm text-gray-400">Email Dikonfirmasi Pada</p>
                            <p className="font-medium text-lg text-gray-900">{formatDate(user.email_confirmed_at)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Account Security Notice */}
                  <Card className="p-6 shadow-sm border-2 rounded-xl border-gray-100 bg-white">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <Shield className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Keamanan Akun</h3>
                        <p className="text-gray-600 text-sm">
                          Kami merekomendasikan untuk secara rutin memperbarui kata sandi dan mengaktifkan 
                          autentikasi dua faktor untuk keamanan yang lebih baik. Anda dapat mengelola 
                          pengaturan keamanan dari preferensi akun Anda.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === "Chat" && (
                <Card className="p-6 shadow-sm border border-gray-100 bg-white">
                  <div className="text-center py-12">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-6 h-6 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Pesan Anda</h3>
                    <p className="text-gray-600 mb-6">Anda belum memiliki pesan</p>
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white">Mulai Percakapan</Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}
