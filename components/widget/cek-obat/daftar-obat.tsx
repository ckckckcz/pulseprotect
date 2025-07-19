"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { useState } from "react"
import {
  Search, ShoppingCart, Heart, Star, ListFilter, Sparkles, Pill, FlaskConical, Salad, Leaf, Baby, Hospital,
  Brush, Eye, Ticket, Droplet, TestTube, Brain, Sun, Dumbbell, Scissors, Stethoscope, Ear, Activity, HeartPulse, Smile,
  ScanBarcode
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import PilObat from  "@/public/images/obat.png"
import { dataObatLengkap } from "@/lib/data/obat"
import React from "react"
import BarcodeScanner from "@/components/widget/cek-obat/barcode-scanner"

export default function DaftarObat() {
  const [selectedCategory, setSelectedCategory] = useState("Semua")
  const [searchQuery, setSearchQuery] = useState("")
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [showScanner, setShowScanner] = useState(false)

  // Icon mapping for sidebar
  const iconMap: Record<string, React.ReactNode> = {
    Darah: <Droplet className="w-5 h-5" />,
    Hormon: <TestTube className="w-5 h-5" />,
    Kepala: <Brain className="w-5 h-5" />,
    Kulit: <Sun className="w-5 h-5" />,
    "Liver/Hati, Pankreas & Empedu": <HeartPulse className="w-5 h-5" />,
    "Otot, Sendi & Tulang": <Dumbbell className="w-5 h-5" />,
    Rambut: <Scissors className="w-5 h-5" />,
    "Rongga Mulut & Gigi": <Smile className="w-5 h-5" />,
    "Obat Saluran Pencernaan": <Stethoscope className="w-5 h-5" />,
    "Saluran Kemih, Ginjal & Prostat": <TestTube className="w-5 h-5" />,
    "Telinga, Hidung & Tenggorokan": <Ear className="w-5 h-5" />,
    Tubuh: <Activity className="w-5 h-5" />,
  }

  // Sidebar categories generated from dataObatLengkap
  const sidebarCategories = [
    { name: "Semua", icon: <Sparkles className="w-5 h-5" />, color: "from-teal-600 to-teal-500" },
    ...dataObatLengkap.map((kategori) => ({
      name: kategori.namaKategori,
      icon: iconMap[kategori.namaKategori] || <Droplet className="w-5 h-5" />,
      color: "from-teal-600 to-teal-500"
    }))
  ]

  // Flatten all medicines for 'Semua'
  const allMedicines = dataObatLengkap.flatMap((kategori, idx) =>
    kategori.data.map((obat, i) => ({
      ...obat,
      id: `${idx}-${i}`,
      category: kategori.namaKategori
    }))
  )

  // Filtered medicines based on selected category and search
  const filteredMedicines = (selectedCategory === "Semua"
    ? allMedicines
    : allMedicines.filter((obat) => obat.category === selectedCategory)
  ).filter((obat) =>
    obat.NamaObat.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
        // Tidak perlu ease di sini
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 40, rotateX: 15 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.7
      },
    },
  }

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [-2, 2, -2],
      transition: {
        duration: 6,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  }

  const handleBarcodeDetected = (barcode: string) => {
    setSearchQuery(barcode); // atau lakukan pencarian otomatis
  };

  return (
    <>
      <div className="min-h-screen bg-white mt-0 relative overflow-hidden">
        {/* Top Categories */}
        <motion.div
          className="bg-white/80 backdrop-blur-md border-b border-gray-200"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <motion.div
              className="flex items-center justify-between overflow-x-auto gap-8 pb-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Removed topCategories as it's no longer needed */}
            </motion.div>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <motion.div
              className="lg:w-80 bg-white max-h-[900px] backdrop-blur-md rounded-3xl p-6 border border-gray-200"
              initial={{ opacity: 0, x: -50, rotateY: -15 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <ListFilter className="w-6 h-6 text-teal-600" />
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Kategori Obat
                </h3>
              </div>
              <div className="space-y-3">
                {sidebarCategories.map((category, index) => (
                  <motion.button
                    key={category.name}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-left transition-all duration-300 relative overflow-hidden ${selectedCategory === category.name
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg transform scale-105`
                      : "text-gray-700 hover:bg-white/60 border border-gray-200"
                      }`}
                    onClick={() => setSelectedCategory(category.name)}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      className="text-lg"
                      transition={{ duration: 0.5 }}
                    >
                      {category.icon}
                    </motion.div>
                    <span className="text-sm font-medium leading-tight">{category.name}</span>
                    {selectedCategory === category.name && (
                      <motion.div
                        className="absolute inset-0 bg-white/10 rounded-2xl"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Search Bar */}
              <motion.div
                className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl px-2 py-4 mb-8 border border-white/20"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <div className="relative">
                  <motion.div
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-500"
                  >
                    <Search className="w-6 h-6 text-teal-600" />
                  </motion.div>
                  <Input
                    type="text"
                    placeholder="Cari obat yang Anda butuhkan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-14 pr-6 py-4 w-full text-black border-none bg-white/50 rounded-2xl text-lg placeholder:text-gray-400 transition-all duration-300 focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none outline-none"
                  />

                  <motion.div
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  >
                    <ScanBarcode
                      className="w-10 h-10 text-teal-600 cursor-pointer hover:bg-gray-100 p-2 rounded-xl"
                      onClick={() => setShowScanner(true)}
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Products Grid - Fixed 3 columns */}
              <motion.div
                className="grid lg:grid-cols-3 grid-cols-1 gap-2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredMedicines.map((medicine, index) => (
                  <motion.div
                    key={`${medicine.category}-${medicine.NamaObat}`}
                    className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group border border-white/20 relative"
                    variants={cardVariants}
                    transition={{ delay: index * 0.1 }}
                    onHoverStart={() => setHoveredCard(medicine.id)}
                    onHoverEnd={() => setHoveredCard(null)}
                    style={{
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {/* Floating Background Gradient */}
                    <motion.div
                      className="absolute inset-0 text-black rounded-3xl"
                      animate={{
                        opacity: hoveredCard === medicine.id ? 1 : 0,
                        scale: hoveredCard === medicine.id ? 1.05 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Product Image */}
                    <div className="relative aspect-square h-52 w-full overflow-hidden rounded-t-3xl">
                      <motion.div
                        className="absolute inset-0 text-black"
                        animate={{
                          opacity: hoveredCard === medicine.id ? 0.8 : 0.3,
                        }}
                      />
                      <Image
                        src={medicine.GambarObat || "/placeholder.svg"}
                        alt={medicine.NamaObat}
                        fill
                        className="object-cover transition-transform duration-700 "
                      />

                      {/* Floating Badges */}
                      {/* No isPopular or isNew in new data, so remove badges */}

                      {/* Availability Indicator */}
                      {/* Remove availability indicator as it's not in new data */}
                      {/* Wishlist Button */}
                      <motion.div
                        className="absolute top-4 left-4"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: hoveredCard === medicine.id ? 1 : 0,
                          scale: hoveredCard === medicine.id ? 1 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          className="bg-white/80 backdrop-blur-sm hover:bg-white rounded-full p-2 shadow-lg"
                        >
                          <Heart className="w-5 h-4 text-red-500" />
                        </Button>
                      </motion.div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4 relative">
                      {/* {medicine.discount && (
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.3, type: "spring" }}
                        >
                          <Badge className="bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-lg">
                            -{medicine.discount}
                          </Badge>
                        </motion.div>
                      )} */}
                      <motion.h4
                        className="font-bold text-gray-800 text-base mb-3 line-clamp-2 leading-tight"
                      >
                        {medicine.NamaObat}
                      </motion.h4>

                      {/* Rating */}
                      {/* <motion.div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(medicine.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{medicine.rating}</span>
                        <span className="text-xs text-gray-400">({medicine.reviews} ulasan)</span>
                      </motion.div> */}

                      {/* Price */}
                      <motion.div className="flex items-center gap-2 mb-4">
                        <span className="font-bold text-xl text-black bg-clip-text">
                          Rp {medicine.Diskon && medicine.HargaDiskon > 0 ? medicine.HargaDiskon.toLocaleString() : medicine.HargaAsli.toLocaleString()}
                        </span>
                        {medicine.Diskon && (
                          <span className="text-sm text-gray-400 line-through">Rp {medicine.HargaAsli.toLocaleString()}</span>
                        )}
                      </motion.div>

                      {/* Pharmacy */}
                      {/* <motion.div
                        className="text-sm text-gray-600 mb-4 bg-gradient-to-r from-gray-50 to-teal-50 px-3 py-2 rounded-xl border border-gray-100"
                      >
                        📍 {medicine.pharmacy}
                      </motion.div> */}

                      {/* Add to Cart Button */}
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button className="w-full bg-teal-600 text-white hover:bg-teal-700 hover:text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                          {/* <ShoppingCart className="w-5 h-5 mr-2" /> */}
                          Tambah ke Keranjang
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Load More Button */}
              <motion.div
                className="text-center mt-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className="px-12 py-4 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Muat Lebih Banyak Obat
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      {showScanner && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  )
}
