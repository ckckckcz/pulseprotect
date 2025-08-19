"use client"
import { motion, useScroll, useTransform } from "framer-motion"
import {
  CheckCircle,
  XCircle,
  X,
  Package,
  Search,
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
  Barcode,
  FileText,
  Scale,
  Utensils,
  Package2,
  Archive,
  Clock,
  Ruler,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { dataObatLengkap } from "@/lib/data/obat"
import type React from "react"
import BarcodeScanner from "@/components/widget/cek-obat/barcode-scanner"
import Navbar from "@/components/widget/navbar"
import { useEffect, useState } from "react"
import Footer from "@/components/widget/footer"
import { useRouter } from "next/navigation"

interface ProductData {
  nama: string
  status: string
  barcode: string
  nomorRegistrasi: string
  gramasi: string
  anjuranSajian: string
  sajianPerKantong: string
  jumlahKarton: string
  masaSimpan: string
  dimensiKarton: string
}

export default function DaftarObat() {
  const [selectedCategory, setSelectedCategory] = useState("Semua")
  const [searchQuery, setSearchQuery] = useState("")
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [showScanner, setShowScanner] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sidebarTop, setSidebarTop] = useState(0)
  const [modalData, setModalData] = useState<any>(null)
  const router = useRouter();
  const [scannedProduct, setScannedProduct] = useState<any | null>(null);

  // Framer Motion hooks for sticky sidebar animation
  const { scrollY } = useScroll()
  const sidebarShadow = useTransform(scrollY, [0, 50], ["shadow-lg", "shadow-xl ring-1 ring-gray-100"])
  const sidebarBg = useTransform(scrollY, [0, 50], ["rgba(255, 255, 255, 0.8)", "rgba(255, 255, 255, 0.95)"])

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
  ]

  const getStatusIcon = (status: string) => {
    return status.toLowerCase().includes("terdaftar") || status.toLowerCase().includes("approved") ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    )
  }

  const getStatusColor = (status: string) => {
    return status.toLowerCase().includes("terdaftar") || status.toLowerCase().includes("approved")
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-red-50 text-red-700 border-red-200"
  }

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
  }

  // Sidebar categories generated from dataObatLengkap
  const sidebarCategories = [
    { name: "Semua", icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />, color: "from-teal-600 to-teal-500" },
    ...dataObatLengkap.map((kategori) => ({
      name: kategori.namaKategori,
      icon: iconMap[kategori.namaKategori] || <Droplet className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: "from-teal-600 to-teal-500",
    })),
  ]

  // Flatten all medicines for 'Semua'
  const allMedicines = dataObatLengkap.flatMap((kategori, idx) =>
    kategori.data.map((obat, i) => ({
      ...obat,
      id: `${idx}-${i}`,
      category: kategori.namaKategori,
    })),
  )

  // Filtered medicines based on selected category and search
  const filteredMedicines = (
    selectedCategory === "Semua" ? allMedicines : allMedicines.filter((obat) => obat.category === selectedCategory)
  ).filter((obat) => obat.NamaObat.toLowerCase().includes(searchQuery.toLowerCase()))

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
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
        duration: 0.6,
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
        duration: 0.7,
      },
    },
  }

  const handleBarcodeDetected = async (qrText: string) => {
    const trimmed = qrText.trim()

    const matchRegistrasi = trimmed.match(/MD\s?\d{15}/i)
    const nomorRegistrasi = matchRegistrasi ? matchRegistrasi[0].replace(/\s+/g, "") : null

    const matchBarcode = !nomorRegistrasi && trimmed.match(/^\d{8,14}$/)
    const barcode = matchBarcode ? trimmed : null

    if (!nomorRegistrasi && !barcode) {
      alert("❌ QR/Barcode tidak valid.")
      return
    }

    const apiUrl = nomorRegistrasi
      ? `/api/cek-obat-by-registrasi?nomor=${nomorRegistrasi}`
      : `/api/cek-obat?barcode=${barcode}`

    try {
      const res = await fetch(apiUrl)
      const data = await res.json()

      if (data.found) {
        setModalData(data);
        setShowScanner(false);
        try {
          localStorage.setItem("scannedProduct:latest", JSON.stringify(data));
        } catch { }
      } else {
        alert(`❌ Produk tidak ditemukan.\nCek manual di: ${data.saranPengecekan}`);
      }
    } catch (err) {
      console.error("❌ Error:", err)
      alert("Terjadi kesalahan saat memeriksa kode.")
    }
  }

  const handleDiscussWithSilva = () => {
    if (modalData) {
      const id = Date.now().toString();
      localStorage.setItem(`scannedProduct:${id}`, JSON.stringify(modalData));
      try {
        // simpan canonical key (selalu dibaca ChatInterface)
        localStorage.setItem("scannedProduct:active", JSON.stringify(modalData));
        // opsional: tetap simpan per-id jika kamu butuh deep-link
        localStorage.setItem(`scannedProduct:${id}`, JSON.stringify(modalData));
      } catch { }
      router.push(`/silva?id=${id}`);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const maxTop = 120 // posisi maksimal saat di-scroll
      const minTop = 0 // posisi awal
      const newTop = Math.min(maxTop, Math.max(minTop, scrollY))
      setSidebarTop(newTop)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      {/* Navbar is assumed to be fixed/sticky at the top */}
      <Navbar />
      <div className=" bg-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-teal-100/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-80 sm:h-80 bg-blue-100/15 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

        {/* Header Section (now includes search bar) */}
        <motion.div
          className="bg-white/80 backdrop-blur-md relative z-30"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mt-20">
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
                Temukan{" "}
                <span className="cardo italic text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-700">
                  Obat
                </span>{" "}
                yang Anda Butuhkan
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
                Jelajahi koleksi obat lengkap dengan informasi detail dan harga terbaik
              </p>
            </div>
            {/* Product Detail Section - appears below search when modalData exists */}
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="mt-6 max-w-4xl mx-auto"
            >
              {modalData ? (
                // Product Detail Section - appears when modalData exists
                <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-4 text-white relative">
                    {/* <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setModalData(null)}
                      className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </motion.button> */}

                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="p-2 bg-white/20 rounded-xl">
                        <Package className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Detail Produk</h3>
                        <p className="text-teal-100 text-sm">Informasi lengkap produk hasil scan</p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Status Badge */}
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mb-6"
                    >
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-medium ${getStatusColor(modalData.status)}`}
                      >
                        {getStatusIcon(modalData.status)}
                        Status: {modalData.status}
                      </div>
                    </motion.div>

                    {/* Product Fields Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {productFields.map((field, index) => {
                        const IconComponent = field.icon
                        return (
                          <motion.div
                            key={field.label}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <div className="p-2 bg-teal-100 rounded-lg shrink-0">
                              <IconComponent className="w-4 h-4 text-teal-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 mb-1">{field.label}</p>
                              <p className="text-sm text-gray-600 break-words">{field.value || "-"}</p>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => setModalData(null)}
                        className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Tutup Detail
                      </Button>
                      <Button
                        onClick={handleDiscussWithSilva}
                        className="flex-1 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 rounded-xl font-medium shadow-lg"
                      >
                        Diskusi dengan Silva
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                // No Data State - appears when no scan has been performed
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200 shadow-md overflow-hidden"
                >
                  <div className="p-8 text-center">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mb-6"
                    >
                      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-10 h-10 text-teal-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Data</h3>
                      <p className="text-gray-600 text-sm max-w-md mx-auto">
                        Gunakan fitur scan barcode atau QR code untuk melihat detail produk obat
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Button
                        onClick={() => setShowScanner(true)}
                        className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-8 py-3 rounded-xl font-medium shadow-md hover:shadow-xl transition-all duration-200"
                      >
                        <ScanBarcode className="w-5 h-5 mr-2" />
                        Mulai Scan
                      </Button>
                    </motion.div>

                    {/* Decorative elements */}
                    <div className="mt-8 flex justify-center space-x-2">
                      <div className="w-2 h-2 bg-teal-200 rounded-full animate-pulse"></div>
                      <div
                        className="w-2 h-2 bg-teal-300 rounded-full animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {showScanner && <BarcodeScanner onDetected={handleBarcodeDetected} onClose={() => setShowScanner(false)} />}
      {/* <Footer /> */}
    </>
  )
}
