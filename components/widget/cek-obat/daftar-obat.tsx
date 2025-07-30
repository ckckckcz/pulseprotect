"use client";

import Image from "next/image";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  X,
  Package,
  Search,
  ShoppingCart,
  Heart,
  ListFilter,
  Sparkles,
  Pill,
  Droplet,
  TestTube,
  Brain,
  Sun,
  Dumbbell,
  Scissors,
  Stethoscope,
  Ear,
  Activity,
  HeartPulse,
  Smile,
  ScanBarcode,
  Grid3X3,
  List,
  Barcode,
  FileText,
  Scale,
  Utensils,
  Package2,
  Archive,
  Clock,
  Ruler,
} from "lucide-react";
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

interface ProductData {
  nama: string;
  status: string;
  barcode: string;
  nomorRegistrasi: string;
  gramasi: string;
  anjuranSajian: string;
  sajianPerKantong: string;
  jumlahKarton: string;
  masaSimpan: string;
  dimensiKarton: string;
}

export default function DaftarObat() {
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sidebarTop, setSidebarTop] = useState(0);
  const [modalData, setModalData] = useState<any>(null);

  // Framer Motion hooks for sticky sidebar animation
  const { scrollY } = useScroll();
  const sidebarShadow = useTransform(scrollY, [0, 50], ["shadow-lg", "shadow-xl ring-1 ring-gray-100"]);
  const sidebarBg = useTransform(scrollY, [0, 50], ["rgba(255, 255, 255, 0.8)", "rgba(255, 255, 255, 0.95)"]);

  const productFields = [
    { label: "Nama Produk", value: modalData?.nama, icon: Package },
    { label: "Barcode", value: modalData?.barcode, icon: Barcode },
    { label: "No. Registrasi", value: modalData?.nomorRegistrasi, icon: FileText },
    { label: "Gramasi", value: modalData?.gramasi, icon: Scale },
    { label: "Anjuran Sajian", value: modalData?.anjuranSajian, icon: Utensils },
    { label: "Sajian per Kantong", value: modalData?.sajianPerKantong, icon: Package2 },
    { label: "Jumlah Karton", value: modalData?.jumlahKarton, icon: Archive },
    { label: "Masa Simpan", value: modalData?.masaSimpan, icon: Clock },
    { label: "Dimensi Karton", value: modalData?.dimensiKarton, icon: Ruler },
  ];

  const getStatusIcon = (status: string) => {
    return status.toLowerCase().includes("terdaftar") || status.toLowerCase().includes("approved") ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusColor = (status: string) => {
    return status.toLowerCase().includes("terdaftar") || status.toLowerCase().includes("approved") ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200";
  };

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

  const handleBarcodeDetected = async (qrText: string) => {
    console.log("📦 Data terdeteksi:", qrText);

    const trimmed = qrText.trim();

    const matchRegistrasi = trimmed.match(/MD\s?\d{15}/i);
    const nomorRegistrasi = matchRegistrasi ? matchRegistrasi[0].replace(/\s+/g, "") : null;

    const matchBarcode = !nomorRegistrasi && trimmed.match(/^\d{8,14}$/);
    const barcode = matchBarcode ? trimmed : null;

    if (!nomorRegistrasi && !barcode) {
      alert("❌ QR/Barcode tidak valid.");
      return;
    }

    const apiUrl = nomorRegistrasi ? `/api/cek-obat-by-registrasi?nomor=${nomorRegistrasi}` : `/api/cek-obat?barcode=${barcode}`;

    try {
      const res = await fetch(apiUrl);
      const data = await res.json();

      if (data.found) {
        setModalData(data); // tampilkan modal
      } else {
        alert(`❌ Produk tidak ditemukan.\nCek manual di: ${data.saranPengecekan}`);
      }
    } catch (err) {
      console.error("❌ Error:", err);
      alert("Terjadi kesalahan saat memeriksa kode.");
    }
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
      <div className="min-h-screen bg-white relative overflow-hidden">
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
                    <Button variant="outline" size="sm" onClick={() => setShowScanner(true)} className="border-gray-200 bg-white text-teal-700 hover:bg-teal-600   px-3 py-2 rounded-xl">
                      <ScanBarcode className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Scan</span>
                    </Button>
                    {/* <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")} className="border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-xl">
                      {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
                    </Button> */}
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
                  <div className="hidden lg:block space-y-2 overflow-y-auto pr-2">
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
      <AnimatePresence>
        {modalData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setModalData(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.3,
              }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-4 text-white relative">
                <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={() => setModalData(null)} className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                  <X className="w-5 h-5" />
                </motion.button>

                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Detail Produk</h3>
                    <p className="text-teal-100 text-sm">Informasi lengkap produk</p>
                  </div>
                </motion.div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-96 overflow-y-auto">
                {/* Status Badge */}
                <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="mb-6">
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-medium mb-4 ${getStatusColor(modalData.status)}`}>
                    {getStatusIcon(modalData.status)}
                    Status: {modalData.status}
                  </div>
                </motion.div>

                {/* Product Fields */}
                <div className="space-y-4">
                  {productFields.map((field, index) => {
                    const IconComponent = field.icon;
                    return (
                      <motion.div
                        key={field.label}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="p-2 bg-teal-100 rounded-lg shrink-0">
                          <IconComponent className="w-4 h-4 text-teal-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 mb-1">{field.label}</p>
                          <p className="text-sm text-gray-600 break-words">{field.value || "-"}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setModalData(null)}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Tutup
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </>
  );
}
