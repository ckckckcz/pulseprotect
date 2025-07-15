"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import Navbar from "@/components/widget/navbar"
import Footer from "@/components/widget/footer"
import { MapPin, Stethoscope } from "lucide-react"

export default function CekObat() {
  // Data dokter dengan informasi lengkap
  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      position: "Dokter Spesialis Jantung",
      hospital: "RS Jantung Harapan Kita",
      location: "Jakarta Barat",
      image: "/placeholder.svg?height=600&width=600",
      height: 400,
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      position: "Dokter Spesialis Anak",
      hospital: "RS Anak Bunda",
      location: "Jakarta Selatan",
      image: "/placeholder.svg?height=600&width=600",
      height: 500,
    },
    {
      id: 3,
      name: "Dr. Amanda Wilson",
      position: "Dokter Spesialis Mata",
      hospital: "RS Mata Cicendo",
      location: "Bandung",
      image: "/placeholder.svg?height=600&width=600",
      height: 350,
    },
    {
      id: 4,
      name: "Dr. Robert Kim",
      position: "Dokter Spesialis Bedah",
      hospital: "RS Premier Jatinegara",
      location: "Jakarta Timur",
      image: "/placeholder.svg?height=600&width=600",
      height: 450,
    },
    {
      id: 5,
      name: "Dr. Lisa Martinez",
      position: "Dokter Spesialis Kulit",
      hospital: "RS Kulit Klinik Utama",
      location: "Surabaya",
      image: "/placeholder.svg?height=600&width=600",
      height: 300,
    },
  ]

  // Duplikasi untuk infinite loop
  const infiniteDoctors = [...doctors, ...doctors, ...doctors]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.42, 0, 0.58, 1], // instead of "easeOut"
      },
    },
  }

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  }

  return (
    <>
      <Navbar />
      <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 mt-20 overflow-hidden">
        <motion.div
          className="max-w-6xl mx-auto pt-12 px-4 sm:px-6 lg:px-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hero Content */}
          <div className="text-center mb-16 lg:mb-24">
            <motion.div className="space-y-4 mb-8">
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent leading-tight"
            
              >
                <motion.span
                  className="block"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Obat yang tepat.
                </motion.span>
                <motion.div
                  className="flex items-center justify-center gap-4 my-6"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <span>Hidup yang</span>
                  <motion.div
                    className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden shadow-xl ring-4 ring-white"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Image
                      src="/placeholder.svg?height=96&width=96"
                      alt="Medicine and wellness"
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                  <span>sehat.</span>
                </motion.div>
              </motion.h1>
            </motion.div>

            <motion.p
              className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            
            >
              Temukan dokter terpercaya dan dapatkan konsultasi medis terbaik untuk kesehatan Anda dan keluarga
            </motion.p>
          </div>
        </motion.div>

        {/* Infinite Loop Image Carousel */}
        <motion.div
          className="relative w-full overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          {/* Gradient overlays for seamless edges */}
          <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-blue-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-green-50 to-transparent z-10 pointer-events-none" />

          <motion.div
            className="flex gap-6"
            animate={{
              x: [0, -100 * doctors.length + "%"],
            }}
            transition={{
              x: {
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                duration: 30,
                ease: "linear",
              },
            }}
          >
            {infiniteDoctors.map((doctor, index) => (
              <motion.div
                key={`doctor-${index}`}
                className="relative rounded-2xl overflow-hidden shadow-2xl group cursor-pointer flex-shrink-0"
                style={{ width: 400, height: doctor.height }}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Image
                  src={doctor.image || "/placeholder.svg"}
                  alt={doctor.name}
                  width={400}
                  height={doctor.height}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Doctor info card */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 p-6 text-white"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="space-y-2">
                    <motion.h3
                      className="text-xl font-bold"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      {doctor.name}
                    </motion.h3>

                    <motion.div
                      className="flex items-center gap-2 text-blue-200"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span className="text-sm font-medium">{doctor.position}</span>
                    </motion.div>

                    <motion.div
                      className="space-y-1"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <p className="text-sm font-medium text-green-200">{doctor.hospital}</p>
                      <div className="flex items-center gap-1 text-gray-300">
                        <MapPin className="w-3 h-3" />
                        <span className="text-xs">{doctor.location}</span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Hover effect button */}
                  <motion.div
                    className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ y: 10 }}
                    whileInView={{ y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <button className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors duration-200">
                      Lihat Profil
                    </button>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Bottom section with call to action */}
        <motion.div
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Siap untuk konsultasi?
          </motion.h2>
          <motion.p
            className="text-lg text-gray-600 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Hubungi dokter pilihan Anda dan dapatkan perawatan terbaik
          </motion.p>
          <motion.button
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Mulai Konsultasi
          </motion.button>
        </motion.div>
      </section>
      <Footer />
    </>
  )
}
