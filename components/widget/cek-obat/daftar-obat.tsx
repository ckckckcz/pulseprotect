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

export default function DaftarObat() {
  const [selectedCategory, setSelectedCategory] = useState("Semua")
  const [searchQuery, setSearchQuery] = useState("")
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  // Category data with icons
  const topCategories = [
    { name: "Obat", icon: <Pill className="w-6 h-6" />, active: true, gradient: "from-teal-600 to-teal-500" },
    { name: "Suplemen", icon: <FlaskConical className="w-6 h-6" />, gradient: "from-teal-600 to-teal-500" },
    { name: "Nutrisi", icon: <Salad className="w-6 h-6" />, gradient: "from-teal-600 to-teal-500" },
    { name: "Herbal", icon: <Leaf className="w-6 h-6" />, gradient: "from-teal-600 to-teal-500" },
    { name: "Produk Bayi", icon: <Baby className="w-6 h-6" />, gradient: "from-teal-600 to-teal-500" },
    { name: "Alat Kesehatan", icon: <Hospital className="w-6 h-6" />, gradient: "from-teal-600 to-teal-500" },
    { name: "Kecantikan", icon: <Brush className="w-6 h-6" />, gradient: "from-teal-600 to-teal-500" },
    { name: "Mata", icon: <Eye className="w-6 h-6" />, gradient: "from-teal-600 to-teal-500" },
    { name: "Voucher", icon: <Ticket className="w-6 h-6" />, gradient: "from-teal-600 to-teal-500" },
  ]

  // Sidebar categories with more organic styling
  const sidebarCategories = [
    { name: "Semua", icon: <Sparkles className="w-5 h-5" />, color: "from-teal-600 to-teal-500" },
    { name: "Darah", icon: <Droplet className="w-5 h-5" />, color: "from-teal-600 to-teal-500" },
    { name: "Hormon", icon: <TestTube className="w-5 h-5" />, color: "from-teal-600 to-teal-500" },
    { name: "Kepala", icon: <Brain className="w-5 h-5" />, color: "from-teal-600 to-teal-500" },
    { name: "Kulit", icon: <Sun className="w-5 h-5" />, color: "from-teal-600 to-teal-500" },
    { name: "Liver/Hati, Pankreas & Empedu", icon: <HeartPulse className="w-5 h-5" />, color: "from-teal-600 to-teal-500" },
    { name: "Otot, Sendi & Tulang", icon: <Dumbbell className="w-5 h-5" />, color: "from-teal-600 to-teal-500" },
    { name: "Rambut", icon: <Scissors className="w-5 h-5" />, color: "from-teal-600 to-teal-500" },
    { name: "Rongga Mulut & Gigi", icon: <Smile className="w-5 h-5" />, color: "from-teal-600 to-teal-500" },
    { name: "Obat Saluran Pencernaan", icon: <Stethoscope className="w-5 h-5" />, color: "from-teal-600 to-teal-500" },
    { name: "Saluran Kemih, Ginjal & Prostat", icon: <TestTube className="w-5 h-5" />, color: "from-teal-600 to-teal-500" },
    { name: "Telinga, Hidung & Tenggorokan", icon: <Ear className="w-5 h-5" />, color: "from-teal-600 to-teal-500" },
    { name: "Tubuh", icon: <Activity className="w-5 h-5" />, color: "from-teal-600 to-teal-500" },
  ]

  // Medicine products data
  const medicines = [
    {
      id: 1,
      name: "VERMOX 500 MG BOX 24 TABLET",
      image: "/placeholder.svg?height=300&width=300",
      price: "Rp 45.000",
      originalPrice: "Rp 50.000",
      discount: "10%",
      rating: 4.5,
      reviews: 128,
      availability: "available",
      pharmacy: "Apotek Kimia Farma",
      category: "Obat Saluran Pencernaan",
      isPopular: false,
    },
    {
      id: 2,
      name: "VERMOX 500 MG STRIP 1 TABLET",
      image: "/placeholder.svg?height=300&width=300",
      price: "Rp 8.500",
      rating: 4.3,
      reviews: 89,
      availability: "available",
      pharmacy: "Apotek Guardian",
      category: "Obat Saluran Pencernaan",
    },
    {
      id: 3,
      name: "POLDAN MIG STRIP ISI 4 KAPLET",
      image: "/placeholder.svg?height=300&width=300",
      price: "Rp 12.000",
      rating: 4.7,
      reviews: 256,
      availability: "limited",
      pharmacy: "Apotek K24",
      category: "Kepala",
      isNew: false,
    },
    {
      id: 4,
      name: "POLDAN MIG BOX ISI 100 KAPLET",
      image: "/placeholder.svg?height=300&width=300",
      price: "Rp 285.000",
      originalPrice: "Rp 300.000",
      discount: "5%",
      rating: 4.6,
      reviews: 167,
      availability: "available",
      pharmacy: "Apotek Century",
      category: "Kepala",
    },
    {
      id: 5,
      name: "POLYSILANE SYRUP 180 ML BOTOL",
      image: "/placeholder.svg?height=300&width=300",
      price: "Rp 28.500",
      rating: 4.4,
      reviews: 203,
      availability: "available",
      pharmacy: "Apotek Kimia Farma",
      category: "Obat Saluran Pencernaan",
      isPopular: false,
    },
    {
      id: 6,
      name: "POLYSILANE SYRUP ISI 100 ML BOTOL",
      image: "/placeholder.svg?height=300&width=300",
      price: "Rp 18.000",
      rating: 4.2,
      reviews: 145,
      availability: "available",
      pharmacy: "Apotek Guardian",
      category: "Obat Saluran Pencernaan",
    },
    {
      id: 7,
      name: "POLYSILANE STRIP ISI 8 TABLET",
      image: "/placeholder.svg?height=300&width=300",
      price: "Rp 15.500",
      rating: 4.1,
      reviews: 98,
      availability: "limited",
      pharmacy: "Apotek K24",
      category: "Obat Saluran Pencernaan",
    },
    {
      id: 8,
      name: "POLYSILANE BOX ISI 40 TABLET",
      image: "/placeholder.svg?height=300&width=300",
      price: "Rp 72.000",
      originalPrice: "Rp 80.000",
      discount: "10%",
      rating: 4.5,
      reviews: 189,
      availability: "available",
      pharmacy: "Apotek Century",
      category: "Obat Saluran Pencernaan",
      isNew: false,
    },
    {
      id: 9,
      name: "VOLTADEX GEL BERAT 20 GRAM",
      image: "/placeholder.svg?height=300&width=300",
      price: "Rp 35.000",
      rating: 4.6,
      reviews: 234,
      availability: "available",
      pharmacy: "Apotek Kimia Farma",
      category: "Otot, Sendi & Tulang",
    },
  ]

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
              {topCategories.map((category, index) => (
                <motion.div
                  key={category.name}
                  className={`flex flex-col items-center min-w-fit cursor-pointer group relative`}
                  variants={itemVariants}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className={`text-2xl mb-3 p-4 rounded-2xl transition-all duration-300 ${category.active
                      ? `bg-gradient-to-r ${category.gradient} text-white`
                      : "bg-white/60 backdrop-blur-sm group-hover:bg-white/80 text-teal-600 border border-gray-200"
                      }`}
                    transition={{ duration: 0.5 }}
                  >
                    {category.icon}
                  </motion.div>
                  <span
                    className={`text-sm font-semibold transition-colors ${category.active ? "text-teal-600" : "text-gray-600 group-hover:text-teal-500"
                      }`}
                  >
                    {category.name}
                  </span>
                </motion.div>
              ))}
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
                    <ScanBarcode className="w-10 h-10 text-teal-600 cursor-pointer hover:bg-gray-100 p-2 rounded-xl" />
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
                {medicines.map((medicine, index) => (
                  <motion.div
                    key={medicine.id}
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
                        src={medicine.image || "/placeholder.svg"}
                        alt={medicine.name}
                        fill
                        className="object-cover transition-transform duration-700 "
                      />

                      {/* Floating Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {medicine.isPopular && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.5, type: "spring" }}
                          >
                            <Badge className="bg-teal-600 text-white shadow-lg">
                              ⭐ Popular
                            </Badge>
                          </motion.div>
                        )}
                        {medicine.isNew && (
                          <motion.div
                            initial={{ scale: 0, rotate: 180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.7, type: "spring" }}
                          >
                            <Badge className="bg-white border border-gray-200 text-teal-600 shadow-lg">
                              ✨ New
                            </Badge>
                          </motion.div>
                        )}
                      </div>

                      {/* Availability Indicator */}
                      <motion.div
                        className="absolute top-4 right-4"
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div
                          className={`w-6 h-6 rounded-full shadow-lg ${medicine.availability === "available"
                            ? "bg-green-700 border border-black"
                            : medicine.availability === "limited"
                              ? "bg-blue-800 border border-black"
                              : "bg-red-700 border border-black"
                            }`}
                        />
                      </motion.div>
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
                        {medicine.name}
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
                          {medicine.price}
                        </span>
                        {medicine.originalPrice && (
                          <span className="text-sm text-gray-400 line-through">{medicine.originalPrice}</span>
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
    </>
  )
}
