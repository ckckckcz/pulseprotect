import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, Users, Calendar, Activity, Clock, Heart, AlertTriangle } from "lucide-react"

export function Analytics() {
  const monthlyStats = [
    { month: "Jan", patients: 45, consultations: 52, revenue: 15600000 },
    { month: "Feb", patients: 52, consultations: 61, revenue: 18300000 },
    { month: "Mar", patients: 48, consultations: 55, revenue: 16500000 },
    { month: "Apr", patients: 61, consultations: 72, revenue: 21600000 },
    { month: "Mei", patients: 58, consultations: 68, revenue: 20400000 },
    { month: "Jun", patients: 65, consultations: 78, revenue: 23400000 },
  ]

  const patientConditions = [
    { condition: "Hipertensi", count: 24, percentage: 32 },
    { condition: "Diabetes", count: 18, percentage: 24 },
    { condition: "ISPA", count: 15, percentage: 20 },
    { condition: "Gastritis", count: 12, percentage: 16 },
    { condition: "Lainnya", count: 6, percentage: 8 },
  ]

  const consultationTypes = [
    { type: "Video Call", count: 45, percentage: 58 },
    { type: "Chat", count: 25, percentage: 32 },
    { type: "Phone Call", count: 8, percentage: 10 },
  ]

  const healthMetrics = [
    {
      title: "Rata-rata Durasi Konsultasi",
      value: "28 menit",
      change: "+2 menit",
      trend: "up",
      icon: Clock,
    },
    {
      title: "Tingkat Kepuasan Pasien",
      value: "4.8/5.0",
      change: "+0.2",
      trend: "up",
      icon: Heart,
    },
    {
      title: "Follow-up Rate",
      value: "85%",
      change: "+5%",
      trend: "up",
      icon: Activity,
    },
    {
      title: "Tingkat Kehadiran",
      value: "92%",
      change: "-3%",
      trend: "down",
      icon: Calendar,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analitik & Statistik</h2>
          <p className="text-muted-foreground">Monitor performa dan kesehatan praktek Anda</p>
        </div>
        <Badge variant="outline">Data 6 Bulan Terakhir</Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {healthMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className={`text-xs ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {metric.change} dari bulan lalu
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="patients">Analisis Pasien</TabsTrigger>
          <TabsTrigger value="consultations">Konsultasi</TabsTrigger>
          <TabsTrigger value="health">Kesehatan Praktek</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Tren Bulanan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyStats.slice(-3).map((stat, index) => (
                    <div key={stat.month} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{stat.month} 2024</p>
                        <p className="text-sm text-muted-foreground">
                          {stat.patients} pasien • {stat.consultations} konsultasi
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Rp {(stat.revenue / 1000000).toFixed(1)}M</p>
                        <Badge variant="outline">
                          <TrendingUp className="h-3 w-3 mr-1" />+{Math.round((stat.patients / 45 - 1) * 100)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribusi Kondisi Pasien</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patientConditions.map((condition, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{condition.condition}</span>
                        <span className="text-sm text-muted-foreground">
                          {condition.count} ({condition.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${condition.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Demografi Pasien
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Laki-laki</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "45%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Perempuan</span>
                      <span className="text-sm font-medium">55%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-pink-500 h-2 rounded-full" style={{ width: "55%" }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kelompok Usia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">18-30 tahun</span>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">31-45 tahun</span>
                    <span className="text-sm font-medium">35%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">46-60 tahun</span>
                    <span className="text-sm font-medium">30%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">60+ tahun</span>
                    <span className="text-sm font-medium">10%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pasien Baru vs Lama</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">68%</div>
                    <p className="text-sm text-muted-foreground">Pasien Lama</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">32%</div>
                    <p className="text-sm text-muted-foreground">Pasien Baru</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="consultations" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Jenis Konsultasi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {consultationTypes.map((type, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{type.type}</span>
                        <span className="text-sm text-muted-foreground">
                          {type.count} ({type.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${type.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Waktu Konsultasi Populer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">08:00 - 10:00</span>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">10:00 - 12:00</span>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">14:00 - 16:00</span>
                    <span className="text-sm font-medium">35%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">16:00 - 18:00</span>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Peringatan & Rekomendasi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                    <p className="text-sm font-medium text-orange-800">Tingkat kehadiran menurun 3%</p>
                    <p className="text-xs text-orange-600 mt-1">Pertimbangkan sistem reminder yang lebih baik</p>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm font-medium text-green-800">Kepuasan pasien meningkat</p>
                    <p className="text-xs text-green-600 mt-1">Pertahankan kualitas layanan saat ini</p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm font-medium text-blue-800">Waktu konsultasi optimal</p>
                    <p className="text-xs text-blue-600 mt-1">Durasi 28 menit memberikan hasil terbaik</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Target Bulanan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Jumlah Pasien</span>
                      <span className="text-sm font-medium">58/70</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "83%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Kepuasan Pasien</span>
                      <span className="text-sm font-medium">4.8/5.0</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "96%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Revenue Target</span>
                      <span className="text-sm font-medium">20.4M/25M</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "82%" }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
