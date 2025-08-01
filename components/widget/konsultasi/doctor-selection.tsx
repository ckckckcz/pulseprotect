"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Star, MessageSquare, Video, Phone, Stethoscope, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

interface Doctor {
  id: number
  name: string
  specialty: string
  experience: string
  rating: number
  reviews: number
  price: {
    chat: number
    video: number
    phone: number
  }
  availability: string
  nextAvailable: string
  image: string
  languages: string[]
  education: string | string[]
}

interface DoctorSelectionProps {
  onSelectDoctor: (doctor: any) => void
}

export function DoctorSelection({ onSelectDoctor }: DoctorSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("all")
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Local fallback data
  const localDoctors = [
    {
      id: 1,
      name: "Dr. Ahmad Wijaya",
      specialty: "Dokter Umum",
      experience: "8 tahun",
      rating: 4.9,
      reviews: 156,
      price: {
        chat: 50000,
        video: 75000,
        phone: 60000,
      },
      availability: "Online",
      nextAvailable: "Tersedia sekarang",
      image: "/placeholder.svg?height=80&width=80",
      languages: ["Indonesia", "English"],
      education: "Universitas Indonesia",
    },
    {
      id: 2,
      name: "Dr. Sari Dewi",
      specialty: "Dokter Anak",
      experience: "12 tahun",
      rating: 4.8,
      reviews: 203,
      price: {
        chat: 60000,
        video: 85000,
        phone: 70000,
      },
      availability: "Online",
      nextAvailable: "Tersedia dalam 15 menit",
      image: "/placeholder.svg?height=80&width=80",
      languages: ["Indonesia"],
      education: "Universitas Gadjah Mada",
    },
    {
      id: 3,
      name: "Dr. Budi Hartono",
      specialty: "Dokter Jantung",
      experience: "15 tahun",
      rating: 4.9,
      reviews: 89,
      price: {
        chat: 80000,
        video: 120000,
        phone: 100000,
      },
      availability: "Busy",
      nextAvailable: "Tersedia besok 09:00",
      image: "/placeholder.svg?height=80&width=80",
      languages: ["Indonesia", "English"],
      education: "Universitas Airlangga",
    },
    {
      id: 4,
      name: "Dr. Maya Sari",
      specialty: "Dokter Kulit",
      experience: "10 tahun",
      rating: 4.7,
      reviews: 124,
      price: {
        chat: 65000,
        video: 90000,
        phone: 75000,
      },
      availability: "Online",
      nextAvailable: "Tersedia sekarang",
      image: "/placeholder.svg?height=80&width=80",
      languages: ["Indonesia"],
      education: "Universitas Padjadjaran",
    },
  ]

  // Function to transform database doctor data to component format
  const transformDoctorData = (dbDoctors: any[]): Doctor[] => {
    return dbDoctors.map(doctor => {
      // Get user data from the joined user table
      const userData = doctor.user || {}
      
      // Parse JSON fields if they're strings
      let languages = doctor.bahasa || ["Indonesia"]
      if (typeof languages === 'string') {
        try {
          languages = JSON.parse(languages)
        } catch (e) {
          languages = ["Indonesia"]
        }
      }
      
      let education = doctor.pendidikan || "Tidak Tersedia"
      let educationString = ""
      
      if (typeof education === 'string') {
        try {
          const parsedEducation = JSON.parse(education)
          if (parsedEducation.institusi) {
            educationString = `${parsedEducation.institusi} - ${parsedEducation.gelar || ''} ${parsedEducation.tahun || ''}`
          } else {
            educationString = education
          }
        } catch (e) {
          educationString = education
        }
      } else if (education.institusi) {
        educationString = `${education.institusi} - ${education.gelar || ''} ${education.tahun || ''}`
      }
      
      return {
        id: doctor.id,
        name: userData.nama_lengkap || doctor.email.split('@')[0],
        specialty: doctor.spesialis || "Dokter Umum",
        experience: doctor.pengalaman || "Tidak Tersedia",
        rating: doctor.rating || 0,
        reviews: doctor.jumlah_ulasan || 0,
        price: {
          chat: doctor.harga_konsultasi || 50000,
          video: (doctor.harga_konsultasi ? doctor.harga_konsultasi * 1.5 : 75000),
          phone: (doctor.harga_konsultasi ? doctor.harga_konsultasi * 1.2 : 60000),
        },
        availability: "Online", // Default to online for now
        nextAvailable: "Tersedia sekarang",
        image: userData.foto_profile || "/placeholder.svg?height=80&width=80",
        languages: languages,
        education: educationString,
      }
    })
  }

  // Fetch doctors data from Supabase
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true)
      try {
        // Join the dokter table with the user table to get user details
        const { data, error } = await supabase
          .from('dokter')
          .select(`
            *,
            user:email (
              nama_lengkap,
              foto_profile
            )
          `)
        
        if (error) {
          throw error
        }
        
        if (data && data.length > 0) {
          // Transform database data to component format
          const transformedData = transformDoctorData(data)
          setDoctors(transformedData)
          console.log('Fetched doctors:', transformedData)
        } else {
          // If no doctors in database, use local fallback data
          setDoctors(localDoctors)
          console.log('No doctors found in database, using fallback data')
        }
      } catch (error: any) {
        console.error('Error fetching doctors:', error)
        setError('Failed to fetch doctors data')
        // Use fallback data on error
        setDoctors(localDoctors)
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  const specialties = [
    { id: "all", name: "Semua Spesialis" },
    { id: "umum", name: "Dokter Umum" },
    { id: "anak", name: "Dokter Anak" },
    { id: "jantung", name: "Dokter Jantung" },
    { id: "kulit", name: "Dokter Kulit" },
  ]

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialty = selectedSpecialty === "all" || doctor.specialty.toLowerCase().includes(selectedSpecialty)
    return matchesSearch && matchesSpecialty
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "Online":
        return "bg-green-100 text-green-800"
      case "Busy":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-white p-4 mt-32">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Konsultasi</h1>
          </div>
          <p className="text-gray-600 text-lg">Pilih dokter untuk konsultasi online</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Cari dokter atau spesialis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg bg-white border border-gray-200 rounded-xl"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {specialties.map((specialty) => (
                <Button
                  key={specialty.id}
                  variant={selectedSpecialty === specialty.id ? "default" : "secondary"}
                  onClick={() => setSelectedSpecialty(specialty.id)}
                  className="whitespace-nowrap rounded"
                >
                  {specialty.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-4" />
            <p className="text-gray-600 text-lg">Memuat data dokter...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12 bg-red-50 rounded-xl mb-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-red-700 mb-2">Gagal memuat data</h3>
            <p className="text-red-600">{error}</p>
            <p className="text-gray-600 mt-2">Menampilkan data lokal sebagai alternatif</p>
          </div>
        )}

        {/* Doctors Grid */}
        {!loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 bg-white rounded-xl border border-gray-200 text-black shadow-md">
                <CardContent className="p-6">
                  {/* Doctor Info */}
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={doctor.image || "/placeholder.svg"} />
                      <AvatarFallback>
                        {doctor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">{doctor.name}</h3>
                      <p className="text-teal-600 font-medium">{doctor.specialty}</p>
                      <p className="text-sm text-gray-500">{doctor.experience} pengalaman</p>
                    </div>
                    <Badge className={`${getAvailabilityColor(doctor.availability)} border-0`}>
                      {doctor.availability}
                    </Badge>
                  </div>

                  {/* Rating and Reviews */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{doctor.rating}</span>
                    </div>
                    <span className="text-gray-500">({doctor.reviews} ulasan)</span>
                  </div>

                  {/* Education and Languages */}
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Pendidikan:</span> {doctor.education}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Bahasa:</span> {Array.isArray(doctor.languages) 
                        ? doctor.languages.join(", ") 
                        : doctor.languages}
                    </p>
                  </div>

                  {/* Availability */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700">Ketersediaan:</p>
                    <p className="text-sm text-gray-600">{doctor.nextAvailable}</p>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-teal-600" />
                        <span className="text-sm font-medium">Chat</span>
                      </div>
                      <span className="font-bold text-teal-600">{formatPrice(doctor.price.chat)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Video Call</span>
                      </div>
                      <span className="font-bold text-green-600">{formatPrice(doctor.price.video)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium">Telepon</span>
                      </div>
                      <span className="font-bold text-orange-600">{formatPrice(doctor.price.phone)}</span>
                    </div>
                  </div>

                  {/* Select Button */}
                  <Button
                    onClick={() => onSelectDoctor(doctor)}
                    className="w-full h-12 text-lg font-semibold rounded-xl bg-gray-200 hover:bg-teal-600 hover:text-white"
                    disabled={doctor.availability === "Busy"}
                  >
                    {doctor.availability === "Busy" ? "Tidak Tersedia" : "Pilih Dokter"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Dokter tidak ditemukan</h3>
            <p className="text-gray-600">Coba ubah kata kunci pencarian atau filter spesialis</p>
          </div>
        )}
      </div>
    </div>
  )
}
