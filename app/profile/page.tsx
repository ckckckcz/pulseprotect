"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { authService } from "@/lib/auth"
import Link from "next/link"

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    nomor_telepon: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push("/login")
    }
    
    // Initialize form data with user data
    if (user) {
      setFormData({
        nama_lengkap: user.nama_lengkap || "",
        nomor_telepon: user.nomor_telepon || ""
      })
    }
  }, [user, loading, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError("")
    setSuccess("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      if (!user) return

      // Update user data
      await authService.updateUser(user.id, {
        nama_lengkap: formData.nama_lengkap.trim(),
        nomor_telepon: formData.nomor_telepon.trim() || undefined
      })

      // Refresh user data in context
      await refreshUser()
      
      setSuccess("Profil berhasil diperbarui")
      setIsEditing(false)
    } catch (error: any) {
      console.error("Error updating profile:", error)
      setError(error.message || "Terjadi kesalahan saat memperbarui profil")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get user initials for the avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  if (!user) {
    return null // Let the useEffect redirect handle this
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-teal-600 px-8 py-12 text-white relative">
            <div className="absolute top-4 right-4">
              <Link href="/">
                <Button variant="ghost" className="text-white hover:bg-teal-500">
                  Kembali ke Beranda
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Avatar className="h-24 w-24 border-4 border-white">
                <AvatarImage 
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.nama_lengkap}`} 
                  alt={user.nama_lengkap} 
                />
                <AvatarFallback className="bg-teal-100 text-teal-800 text-2xl">
                  {getInitials(user.nama_lengkap)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{user.nama_lengkap}</h1>
                <p className="text-teal-100">{user.email}</p>
                {user.role && (
                  <span className="inline-block mt-2 bg-teal-500 px-3 py-1 rounded-full text-xs">
                    {user.role}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Messages */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
                  {success}
                </div>
              )}

              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold text-gray-800">Profil Pengguna</h2>
                  {!isEditing && (
                    <Button 
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="text-teal-600 border-teal-600 hover:bg-teal-50"
                    >
                      Edit Profil
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Lengkap
                      </label>
                      <Input
                        type="text"
                        value={formData.nama_lengkap}
                        onChange={(e) => handleInputChange("nama_lengkap", e.target.value)}
                        className="w-full px-4 py-2 rounded-xl"
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={user.email}
                        className="w-full px-4 py-2 rounded-xl bg-gray-100"
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nomor Telepon
                      </label>
                      <Input
                        type="tel"
                        value={formData.nomor_telepon || ""}
                        onChange={(e) => handleInputChange("nomor_telepon", e.target.value)}
                        className="w-full px-4 py-2 rounded-xl"
                        placeholder="08123456789 (opsional)"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex space-x-4 pt-4">
                      <Button
                        type="submit"
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          setFormData({
                            nama_lengkap: user.nama_lengkap || "",
                            nomor_telepon: user.nomor_telepon || ""
                          })
                          setError("")
                          setSuccess("")
                        }}
                        disabled={isSubmitting}
                      >
                        Batal
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Nama Lengkap</h3>
                      <p className="mt-1 text-lg">{user.nama_lengkap}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p className="mt-1 text-lg">{user.email}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Nomor Telepon</h3>
                      <p className="mt-1 text-lg">{user.nomor_telepon || "-"}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Peran</h3>
                      <p className="mt-1 text-lg">{user.role || "User"}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Bergabung Sejak</h3>
                      <p className="mt-1 text-lg">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }) : "-"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
