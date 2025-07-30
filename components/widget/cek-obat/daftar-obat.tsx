"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search, ShoppingCart, Heart, ListFilter, Sparkles, Pill, Droplet, TestTube, Brain, Sun, Dumbbell, Scissors, Stethoscope, Ear, Activity, HeartPulse, Smile, ScanBarcode, Grid3X3, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { dataObatLengkap } from "@/lib/data/obat";
import type React from "react";
import BarcodeScanner from "@/components/widget/cek-obat/barcode-scanner";
import Navbar from "@/components/widget/navbar";
import { useEffect, useState } from "react";
import Footer from "@/components/widget/footer";

export default function DaftarObat() {
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sidebarTop, setSidebarTop] = useState(0);

  // Framer Motion hooks for sticky sidebar animation
  const { scrollY } = useScroll();
  const sidebarShadow = useTransform(scrollY, [0, 50], ["shadow-lg", "shadow-xl ring-1 ring-gray-100"]);
  const sidebarBg = useTransform(scrollY, [0, 50], ["rgba(255, 255, 255, 0.8)", "rgba(255, 255, 255, 0.95)"]);

  // Icon mapping for sidebar
  const iconMap: Record<string, React.ReactNode> = {
    Darah: <Droplet className="w-4 h-4 sm:w-5 sm:h-5" />,
    Hormon: <TestTube className="w-4 h-4 sm:w-5 sm:h-5" />,
    Kepala: <Brain className="w-4 h-4 sm:w-5 sm:h-5" />,
    Kulit: <Sun className="w-4 h-4 sm:w-5 sm:h-5" />,
    "Liver/Hati, Pankreas & Empedu": <HeartPulse className="w-4 h-4 sm:w-5 sm:h-5" />,
    "Otot, Sendi & Tulang": <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5" />,
    Rambut: <Scissors className="w-4 h-4 sm:w-5 sm:h-5" />,
    "Rongga Mulut & Gigi": <Smile className="w-4 h-4 sm:w-5 sm:h-5" />,
    "Obat Saluran Pencernaan": <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5" />,
    "Saluran Kemih, Ginjal & Prostat": <TestTube className="w-4 h-4 sm:w-5 sm:h-5" />,
    "Telinga, Hidung & Tenggorokan": <Ear className="w-4 h-4 sm:w-5 sm:h-5" />,
    Tubuh: <Activity className="w-4 h-4 sm:w-5 sm:h-5" />,
  };

  // Sidebar categories generated from dataObatLengkap
  const sidebarCategories = [
    { name: "Semua", icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />, color: "from-teal-600 to-teal-500" },
    ...dataObatLengkap.map((kategori) => ({
      name: kategori.namaKategori,
      icon: iconMap[kategori.namaKategori] || <Droplet className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: "from-teal-600 to-teal-500",
    })),
  ];

  // Flatten all medicines for 'Semua'
  const allMedicines = dataObatLengkap.flatMap((kategori, idx) =>
    kategori.data.map((obat, i) => ({
      ...obat,
      id: `${idx}-${i}`,
      category: kategori.namaKategori,
    }))
  );

  // Filtered medicines based on selected category and search
  const filteredMedicines = (selectedCategory === "Semua" ? allMedicines : allMedicines.filter((obat) => obat.category === selectedCategory)).filter((obat) => obat.NamaObat.toLowerCase().includes(searchQuery.toLowerCase()));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, rotateX: 15 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.7,
      },
    },
  };

  const handleBarcodeDetected = (barcode: string) => {
    setSearchQuery(barcode);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxTop = 120; // posisi maksimal saat di-scroll
      const minTop = 0; // posisi awal
      const newTop = Math.min(maxTop, Math.max(minTop, scrollY));
      setSidebarTop(newTop);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Navbar is assumed to be fixed/sticky at the top */}
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/20 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-teal-100/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-80 sm:h-80 bg-blue-100/15 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

        {/* Header Section (now includes search bar) */}
        <motion.div className="bg-white/80 backdrop-blur-md border-b border-gray-200 relative z-30" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="text-center mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-teal-100 px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-sm mb-6"
              >
                <Pill className="w-4 h-4 text-teal-600" />
                <span className="text-teal-700 font-medium text-sm">Daftar Obat Lengkap</span>
              </motion.div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Temukan <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-700">Obat</span> yang Anda Butuhkan
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">Jelajahi koleksi obat lengkap dengan informasi detail dan harga terbaik</p>
            </div>

            {/* Search Bar */}
            <motion.div className="max-w-4xl mx-auto" initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }}>
              <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200 shadow-lg p-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                  <div className="flex-1 flex items-center gap-3 px-4 py-2 sm:py-0">
                    <Search className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    <Input
                      type="text"
                      placeholder="Cari obat yang Anda butuhkan..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 border-none bg-transparent text-gray-700 placeholder:text-gray-400 text-sm sm:text-base focus:outline-none focus:ring-0"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowScanner(true)} className="border-teal-200 text-teal-700 hover:bg-teal-50 px-3 py-2 rounded-xl">
                      <ScanBarcode className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Scan</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")} className="border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-xl">
                      {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 relative">
            {/* Sticky Sidebar */}
            <motion.div className="hidden lg:block w-80 sticky top-24 self-start z-20 rounded-3xl border border-gray-200" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
              <Card
                className="border-0 shadow-none bg-transparent"
                style={{
                  maxHeight: "calc(100vh - 8rem)",
                  overflowY: "auto",
                }}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl flex items-center justify-center">
                      <ListFilter className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Kategori Obat</h3>
                  </div>

                  {/* Mobile Category Dropdown */}
                  <div className="lg:hidden mb-4">
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500">
                      {sidebarCategories.map((category) => (
                        <option key={category.name} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Desktop Category List */}
                  <div className="hidden lg:block space-y-2 max-h-[calc(100vh-15rem)] overflow-y-auto pr-2">
                    {sidebarCategories.map((category, index) => (
                      <motion.button
                        key={category.name}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 relative overflow-hidden ${
                          selectedCategory === category.name ? `bg-gradient-to-r ${category.color} text-white shadow-lg` : "text-gray-700 hover:bg-gray-50 border border-gray-100"
                        }`}
                        onClick={() => setSelectedCategory(category.name)}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex-shrink-0">{category.icon}</div>
                        <span className="text-sm font-medium leading-tight line-clamp-2">{category.name}</span>
                        {selectedCategory === category.name && <motion.div className="absolute inset-0 bg-white/10 rounded-xl" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }} />}
                      </motion.button>
                    ))}
                  </div>

                  {/* Category Stats */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-100">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-teal-600 mb-1">{filteredMedicines.length}</div>
                      <div className="text-sm text-gray-600">Obat Tersedia</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Products Grid */}
            <div className="flex-1">
              <motion.div className={`grid gap-4 sm:gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`} variants={containerVariants} initial="hidden" animate="visible">
                {filteredMedicines.map((medicine, index) => (
                  <motion.div key={`${medicine.category}-${medicine.NamaObat}`} variants={cardVariants} transition={{ delay: index * 0.1 }} onHoverStart={() => setHoveredCard(medicine.id)} onHoverEnd={() => setHoveredCard(null)}>
                    <Card className="border rounded-xl border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group bg-white/80 backdrop-blur-sm hover:scale-[1.01] active:scale-[0.99] cursor-pointer">
                      <CardContent className="p-0">
                        {viewMode === "grid" ? (
                          <>
                            {/* Grid View */}
                            <div className="relative aspect-square h-48 sm:h-52 w-full overflow-hidden">
                              <Image src={medicine.GambarObat || "/placeholder.svg?height=200&width=200"} alt={medicine.NamaObat} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                              {/* Wishlist Button */}
                              <motion.div
                                className="absolute top-3 right-3"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                  opacity: hoveredCard === medicine.id ? 1 : 0,
                                  scale: hoveredCard === medicine.id ? 1 : 0,
                                }}
                                transition={{ duration: 0.3 }}
                              >
                                <Button size="sm" variant="ghost" className="bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-2 shadow-lg">
                                  <Heart className="w-4 h-4 text-red-500" />
                                </Button>
                              </motion.div>

                              {/* Discount Badge */}
                              {medicine.Diskon && (
                                <div className="absolute top-3 left-3">
                                  <Badge className="bg-red-500 text-white border-0 font-medium px-2 py-1 text-xs">Diskon</Badge>
                                </div>
                              )}
                            </div>

                            <div className="p-4 sm:p-6">
                              <h4 className="font-bold text-gray-900 text-sm sm:text-base mb-3 line-clamp-2 leading-tight">{medicine.NamaObat}</h4>

                              <div className="flex items-center gap-2 mb-4">
                                <span className="font-bold text-lg sm:text-xl text-teal-600">Rp {medicine.Diskon && medicine.HargaDiskon > 0 ? medicine.HargaDiskon.toLocaleString() : medicine.HargaAsli.toLocaleString()}</span>
                                {medicine.Diskon && medicine.HargaDiskon > 0 && <span className="text-sm text-gray-400 line-through">Rp {medicine.HargaAsli.toLocaleString()}</span>}
                              </div>

                              <Button className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base py-2 sm:py-3 group-hover:scale-[1.02] group-active:scale-[0.98]">
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Tambah ke Keranjang
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* List View */}
                            <div className="flex items-center gap-4 p-4 sm:p-6">
                              <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 overflow-hidden rounded-xl">
                                <Image src={medicine.GambarObat || "/placeholder.svg?height=100&width=100"} alt={medicine.NamaObat} fill className="object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 text-sm sm:text-base mb-2 line-clamp-1">{medicine.NamaObat}</h4>
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="font-bold text-lg text-teal-600">Rp {medicine.Diskon && medicine.HargaDiskon > 0 ? medicine.HargaDiskon.toLocaleString() : medicine.HargaAsli.toLocaleString()}</span>
                                  {medicine.Diskon && medicine.HargaDiskon > 0 && <span className="text-sm text-gray-400 line-through">Rp {medicine.HargaAsli.toLocaleString()}</span>}
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <Button size="sm" variant="ghost" className="bg-gray-50 hover:bg-gray-100 rounded-full p-2">
                                  <Heart className="w-4 h-4 text-red-500" />
                                </Button>
                                <Button size="sm" className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-xl px-4 py-2 group-hover:scale-[1.02] group-active:scale-[0.98]">
                                  <ShoppingCart className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* No Results */}
              {filteredMedicines.length === 0 && (
                <motion.div className="text-center py-16" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Obat Tidak Ditemukan</h3>
                  <p className="text-gray-600 mb-6">Coba ubah kata kunci pencarian atau pilih kategori lain</p>
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("Semua");
                    }}
                    className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-xl px-6 py-3"
                  >
                    Reset Pencarian
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showScanner && <BarcodeScanner onDetected={handleBarcodeDetected} onClose={() => setShowScanner(false)} />}
      <Footer />
    </>
  );
}
