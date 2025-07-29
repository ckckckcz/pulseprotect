"use client"

import Image from "next/image"
import { motion, useAnimation } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/widget/navbar"
import Footer from "@/components/widget/footer"
import DaftarObat from "@/components/widget/cek-obat/daftar-obat"
import {
  MapPin,
  Stethoscope,
  Star,
  Clock,
  Heart,
  Shield,
  Search,
  Filter,
  ArrowRight,
  Phone,
  Calendar,
} from "lucide-react"
import { useEffect } from "react"

export default function CekObat() {
  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      position: "Dokter Spesialis Jantung",
      hospital: "RS Jantung Harapan Kita",
      location: "Jakarta Barat",
      image: "/images/doctor/Dr. Sarah Johnson.png",
      rating: 4.9,
      experience: "15+ tahun",
      patients: "2000+",
      availability: "Tersedia",
      price: "Rp 250.000",
      height: 400,
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      position: "Dokter Spesialis Anak",
      hospital: "RS Anak Bunda",
      location: "Jakarta Selatan",
      image: "/images/doctor/Dr. Michael Chen.png",
      rating: 4.8,
      experience: "12+ tahun",
      patients: "1800+",
      availability: "Tersedia",
      price: "Rp 200.000",
      height: 500,
    },
    {
      id: 3,
      name: "Dr. Rudi",
      position: "Dokter Spesialis Mata",
      hospital: "RS Mata Cicendo",
      location: "Bandung",
      image: "/images/doctor/Dr. Rudi.png",
      rating: 4.7,
      experience: "10+ tahun",
      patients: "1500+",
      availability: "Sibuk",
      price: "Rp 180.000",
      height: 350,
    },
    {
      id: 4,
      name: "Dr. Robert Kim",
      position: "Dokter Spesialis Bedah",
      hospital: "RS Premier Jatinegara",
      location: "Jakarta Timur",
      image: "/images/doctor/Dr. Robert Kim.png",
      rating: 4.9,
      experience: "18+ tahun",
      patients: "2500+",
      availability: "Tersedia",
      price: "Rp 300.000",
      height: 450,
    },
    {
      id: 5,
      name: "Dr. Bambang",
      position: "Dokter Spesialis Kulit",
      hospital: "RS Kulit Klinik Utama",
      location: "Surabaya",
      image: "/images/doctor/Dr. Bambang.png",
      rating: 4.6,
      experience: "8+ tahun",
      patients: "1200+",
      availability: "Tersedia",
      price: "Rp 150.000",
      height: 300,
    },
  ]

  const infiniteDoctors = [...doctors, ...doctors, ...doctors, ...doctors]
  const controls = useAnimation()

  useEffect(() => {
    const totalWidth = infiniteDoctors.length * 350
    const duration = infiniteDoctors.length * 3

    const animate = async () => {
      await controls.start({
        x: -totalWidth / 2,
        transition: {
          x: {
            duration: duration,
            ease: "linear",
            repeat: Number.POSITIVE_INFINITY,
          },
        },
      })
    }
    animate()
    return () => controls.stop()
  }, [controls, infiniteDoctors.length])

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Dokter Terpercaya",
      description: "Semua dokter telah terverifikasi dan berpengalaman",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Konsultasi 24/7",
      description: "Layanan konsultasi tersedia kapan saja",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Perawatan Terbaik",
      description: "Mendapatkan perawatan medis berkualitas tinggi",
    },
  ]

  const stats = [
    { number: "10K+", label: "Pasien Terlayani" },
    { number: "500+", label: "Dokter Ahli" },
    { number: "50+", label: "Rumah Sakit" },
    { number: "4.8", label: "Rating Rata-rata" },
  ]

  return (
    <>
      <Navbar />
      <section className="min-h-screen bg-white lg:mt-24 mt-16 overflow-hidden relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-teal-100/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 bg-blue-100/15 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

        {/* Hero Section */}
        <motion.div
          className="max-w-7xl mx-auto pt-6 sm:pt-8 lg:pt-12 px-4 sm:px-6 lg:px-12 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6 sm:mb-8"
          >
            {/* Badge commented out as in original */}
          </motion.div>

          {/* Main Hero Content */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-12 sm:mb-16">
            {/* Left Content */}
            <motion.div
              className="lg:col-span-7 space-y-6 sm:space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Obat yang{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-700 italic">
                    tepat
                  </span>
                  <br />
                  Hidup yang{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-700 italic">
                    sehat
                  </span>
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-2xl">
                  Temukan dokter terpercaya dan dapatkan konsultasi medis terbaik untuk kesehatan Anda dan keluarga
                  dengan teknologi telemedicine terdepan.
                </p>
              </div>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-2 shadow-lg max-w-2xl"
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                  <div className="flex-1 flex items-center gap-3 px-4 py-2 sm:py-0">
                    <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Cari dokter, spesialis, atau rumah sakit..."
                      className="flex-1 bg-transparent border-0 outline-none text-gray-700 placeholder-gray-400 text-sm sm:text-base"
                    />
                  </div>
                  <Button className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold shadow-lg text-sm sm:text-base">
                    Cari Dokter
                  </Button>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4"
              >
                <Button
                  variant="outline"
                  className="border-teal-200 text-teal-700 hover:bg-teal-500 bg-transparent rounded-xl text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3"
                >
                  <Filter className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">Filter Spesialis</span>
                </Button>
                <Button
                  variant="outline"
                  className="border-blue-200 text-blue-700 hover:bg-blue-500 bg-transparent rounded-xl text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3"
                >
                  <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">Jadwal Hari Ini</span>
                </Button>
                <Button
                  variant="outline"
                  className="border-green-200 text-green-700 hover:bg-green-500 bg-transparent rounded-xl text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3"
                >
                  <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">Konsultasi Darurat</span>
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Content - Medicine Animation */}
            <motion.div
              className="lg:col-span-5 flex justify-center mt-8 lg:mt-0"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative">
                <motion.div
                  className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-3xl overflow-hidden shadow-2xl ring-4 sm:ring-8 ring-white/50"
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Image
                    src="/placeholder.svg?height=320&width=320"
                    alt="Medicine and wellness"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-teal-600/20 to-transparent"></div>
                </motion.div>

                {/* Floating elements */}
                <motion.div
                  className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center"
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                >
                  <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                </motion.div>
                <motion.div
                  className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center"
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, delay: 1.5 }}
                >
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Doctor Carousel */}
        <motion.div
          className="relative w-full overflow-hidden mb-1"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <div className="text-center mb-8 sm:mb-12 px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Dokter <span className="text-teal-600">Terpercaya</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              Konsultasi dengan dokter spesialis berpengalaman dan terpercaya di seluruh Indonesia
            </p>
          </div>

          <motion.div
            className="flex gap-2 sm:gap-3"
            animate={controls}
            style={{ width: `${infiniteDoctors.length * 350}px` }}
          >
            {infiniteDoctors.map((doctor, index) => (
              <motion.div
                key={`doctor-${index}`}
                className="relative overflow-hidden group flex-shrink-0 w-72 sm:w-80 rounded-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="shadow-xl rounded-xl border border-gray-200 hover:shadow-2xl transition-all duration-500 bg-white overflow-hidden h-full">
                  <CardContent className="p-0">
                    {/* Doctor Image */}
                    <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
                      <Image
                        src={doctor.image || "/placeholder.svg?height=300&width=300"}
                        alt={doctor.name}
                        width={350}
                        height={256}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-teal-600/40 via-teal-600/10 to-transparent" />

                      {/* Availability Badge */}
                      <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                        <Badge
                          className={`${
                            doctor.availability === "Tersedia" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                          } border-0 font-medium px-2 sm:px-3 py-1 text-xs sm:text-sm`}
                        >
                          {doctor.availability}
                        </Badge>
                      </div>

                      {/* Rating */}
                      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-white/90 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 flex items-center gap-1">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-current" />
                        <span className="text-xs sm:text-sm font-semibold text-gray-900">{doctor.rating}</span>
                      </div>
                    </div>

                    {/* Doctor Info */}
                    <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 line-clamp-1">{doctor.name}</h3>
                        <div className="flex items-center gap-2 text-teal-600 mb-2">
                          <Stethoscope className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-semibold line-clamp-1">{doctor.position}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm font-medium text-gray-700 line-clamp-1">{doctor.hospital}</p>
                        <div className="flex items-center gap-1 text-gray-500">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="text-xs sm:text-sm line-clamp-1">{doctor.location}</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 pt-3 sm:pt-4 border-t border-gray-100">
                        <div className="text-center">
                          <div className="text-xs sm:text-sm font-bold text-gray-900">{doctor.experience}</div>
                          <div className="text-xs text-gray-500">Pengalaman</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs sm:text-sm font-bold text-gray-900">{doctor.patients}</div>
                          <div className="text-xs text-gray-500">Pasien</div>
                        </div>
                      </div>

                      {/* Price and Action */}
                      <div className="flex items-center justify-between pt-3 sm:pt-4">
                        <div>
                          <div className="text-base sm:text-lg font-bold text-teal-600">{doctor.price}</div>
                          <div className="text-xs text-gray-500">per konsultasi</div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 rounded-[8px] text-white shadow-lg text-xs sm:text-sm px-3 sm:px-4 py-2"
                        >
                          Konsultasi
                          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <DaftarObat />
      <Footer />
    </>
  )
}
