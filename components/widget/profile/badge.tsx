"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Medal, Shield, Eye, Users, Award, Star, CheckCircle, Lock, ArrowRight } from "lucide-react"

const badges = [
  {
    id: 1,
    name: "Detektif Pemula",
    description: "Badge untuk pengguna yang baru memulai perjalanan deteksi obat palsu",
    points: 100,
    icon: Eye,
    color: "bg-teal-500",
    earned: true,
    progress: 100,
    requirements: ["Daftar akun di platform", "Selesaikan tutorial dasar", "Lakukan 1 kali verifikasi obat"],
    howToEarn:
      "Badge ini diberikan secara otomatis setelah Anda menyelesaikan registrasi dan tutorial dasar sistem deteksi obat palsu.",
  },
  {
    id: 2,
    name: "Penjaga Kesehatan",
    description: "Untuk pengguna yang telah memverifikasi 10 obat dengan akurat",
    points: 250,
    icon: Shield,
    color: "bg-teal-600",
    earned: true,
    progress: 100,
    requirements: ["Verifikasi 10 obat berbeda", "Tingkat akurasi minimal 85%", "Tidak ada laporan palsu"],
    howToEarn:
      "Lakukan verifikasi obat secara konsisten dengan tingkat akurasi tinggi. Gunakan fitur scan barcode dan analisis visual untuk memastikan keaslian obat.",
  },
  {
    id: 3,
    name: "Ahli Farmasi",
    description: "engguna dengan keahlian tinggi dalam identifikasi obat",
    points: 500,
    icon: Award,
    color: "bg-teal-700",
    earned: false,
    progress: 60,
    requirements: [
      "Verifikasi 50 obat dengan akurasi 95%",
      "Laporkan 5 obat palsu yang terkonfirmasi",
      "Dapatkan 20 like dari komunitas",
    ],
    howToEarn:
      "Tingkatkan keahlian Anda dengan mempelajari karakteristik obat asli vs palsu. Aktif melaporkan temuan obat palsu dan berbagi pengetahuan dengan komunitas.",
  },
  {
    id: 4,
    name: "Kontributor Komunitas",
    description: "Untuk pengguna yang aktif membantu sesama dalam komunitas",
    points: 300,
    icon: Users,
    color: "bg-emerald-600",
    earned: false,
    progress: 30,
    requirements: ["Bantu 15 pengguna lain", "Posting 10 tips berguna", "Rating komunitas minimal 4.5/5"],
    howToEarn:
      "Aktif di forum komunitas, jawab pertanyaan pengguna lain, dan bagikan tips praktis tentang cara mengenali obat palsu.",
  },
  {
    id: 5,
    name: "Master Validator",
    description: "Badge tertinggi untuk validator obat terpercaya",
    points: 1000,
    icon: Medal,
    color: "bg-cyan-600",
    earned: false,
    progress: 10,
    requirements: [
      "Verifikasi 200+ obat",
      "Akurasi 98% atau lebih",
      "Sertifikasi dari ahli farmasi",
      "Kontribusi database obat",
    ],
    howToEarn:
      "Capai level tertinggi dengan konsistensi dan keahlian luar biasa. Ikuti program sertifikasi dan berkontribusi pada pengembangan database obat.",
  },
  {
    id: 6,
    name: "Guardian Angel",
    description: "Untuk pengguna yang telah menyelamatkan nyawa dengan mendeteksi obat berbahaya",
    points: 750,
    icon: Star,
    color: "bg-teal-800",
    earned: false,
    progress: 0,
    requirements: [
      "Laporkan obat palsu berbahaya",
      "Konfirmasi dari otoritas kesehatan",
      "Dampak positif terdokumentasi",
    ],
    howToEarn:
      "Badge khusus yang diberikan ketika laporan Anda tentang obat palsu berbahaya dikonfirmasi oleh otoritas kesehatan dan terbukti mencegah bahaya pada masyarakat.",
  },
]

export default function BadgeSystem() {
  const totalPoints = badges.filter((badge) => badge.earned).reduce((sum, badge) => sum + badge.points, 0)
  const earnedBadges = badges.filter((badge) => badge.earned).length
  const earnedBadgeList = badges.filter((badge) => badge.earned)
  const lockedBadgeList = badges.filter((badge) => !badge.earned)

  const renderBadgeCard = (badge: any) => {
    const IconComponent = badge.icon
    return (
      <Card
        key={badge.id}
        className={`relative overflow-hidden transition-all duration-300 rounded-xl hover:shadow-lg hover:-translate-y-1 bg-white border border-gray-200 ${
          badge.earned ? "" : ""
        }`}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className={`p-3 rounded-xl ${badge.color} ${badge.earned ? "" : "opacity-60"} shadow-sm`}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-2">
              {badge.earned && (
                <div className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded-full font-semibold">DIRAIH</div>
              )}
              {!badge.earned && <Lock className="w-4 h-4 text-gray-400" />}
            </div>
          </div>
          <CardTitle className={`text-lg font-semibold ${badge.earned ? "text-gray-900" : "text-gray-600"}`}>
            {badge.name}
          </CardTitle>
          <CardDescription className="text-sm text-gray-500 leading-relaxed">{badge.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge
              variant={badge.earned ? "default" : "secondary"}
              className={`font-semibold ${badge.earned ? "bg-teal-600 hover:bg-teal-600 text-white" : "bg-black text-white hover:bg-black"}`}
            >
              {badge.points} Poin
            </Badge>
            <span className={`text-xs font-medium ${badge.earned ? "text-teal-600" : "text-gray-500"}`}>
              {badge.earned ? "Berhasil Diraih" : `${badge.progress}% Progress`}
            </span>
          </div>

          {!badge.earned && (
            <div className="space-y-2">
              <Progress value={badge.progress} className="h-2 bg-gray-100" />
              <p className="text-xs text-gray-500">{badge.progress}% menuju badge ini</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-gray-300 hover:bg-gray-50 bg-transparent rounded-xl text-black hover:text-black"
                >
                  Lihat Detail
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`p-3 rounded-xl ${badge.color} shadow-sm`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-semibold">{badge.name}</DialogTitle>
                      <Badge variant="secondary" className="mt-1">
                        {badge.points} Poin
                      </Badge>
                    </div>
                  </div>
                  <DialogDescription className="text-base text-gray-600 leading-relaxed">
                    {badge.description}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Persyaratan Badge:</h4>
                    <ul className="space-y-2">
                      {badge.requirements.map((req: string, index: number) => (
                        <li key={index} className="flex items-start gap-3 text-sm">
                          <CheckCircle className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Cara Mendapatkan:</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{badge.howToEarn}</p>
                  </div>

                  {!badge.earned && (
                    <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-teal-900">Progress Saat Ini</span>
                        <span className="text-sm font-semibold text-teal-600">{badge.progress}%</span>
                      </div>
                      <Progress value={badge.progress} className="h-2" />
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {!badge.earned && (
              <Button size="sm" className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl">
                Dapatkan Badge
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 border border-gray-200 rounded-xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="max-w-3xl">
            <h1 className="text-1xl sm:text-2xl font-bold text-gray-900 mb-1">Sistem Badge Deteksi Obat Palsu</h1>
            <p className="text-md text-gray-600 mb-8">
              Kumpulkan badge dan tingkatkan keahlian Anda dalam mendeteksi obat palsu untuk melindungi kesehatan
              masyarakat
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-2xl sm:text-3xl font-bold text-teal-600 mb-1">{totalPoints}</div>
              <div className="text-sm text-gray-500">Total Poin Terkumpul</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-1">{earnedBadges}</div>
              <div className="text-sm text-gray-500">Badge Berhasil Diraih</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-2xl sm:text-3xl font-bold text-cyan-600 mb-1">{badges.length}</div>
              <div className="text-sm text-gray-500">Streak</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {earnedBadgeList.map((badge) => renderBadgeCard(badge))}
        </div>

        {earnedBadgeList.length > 0 && lockedBadgeList.length > 0 && (
          <hr className="my-6 border-gray-200" />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {lockedBadgeList.map((badge) => renderBadgeCard(badge))}
        </div>

        {/* <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Mulai Perjalanan Deteksi Obat Palsu</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Bergabunglah dengan komunitas detektif obat palsu dan bantu melindungi kesehatan masyarakat. Setiap
              verifikasi yang Anda lakukan berkontribusi pada keamanan obat-obatan di Indonesia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white">
                Mulai Verifikasi Obat
              </Button>
              <Button size="lg" variant="outline" className="border-gray-300 hover:bg-gray-50 bg-transparent">
                Pelajari Tutorial
              </Button>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  )
}
