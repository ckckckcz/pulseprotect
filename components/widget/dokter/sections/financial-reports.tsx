import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, TrendingUp, Download, Calendar, CreditCard, PieChart, BarChart3 } from "lucide-react"

export function FinancialReports() {
  const monthlyRevenue = [
    { month: "Jan", revenue: 15600000, consultations: 52, avgPerConsult: 300000 },
    { month: "Feb", revenue: 18300000, consultations: 61, avgPerConsult: 300000 },
    { month: "Mar", revenue: 16500000, consultations: 55, avgPerConsult: 300000 },
    { month: "Apr", revenue: 21600000, consultations: 72, avgPerConsult: 300000 },
    { month: "Mei", revenue: 20400000, consultations: 68, avgPerConsult: 300000 },
    { month: "Jun", revenue: 23400000, consultations: 78, avgPerConsult: 300000 },
  ]

  const revenueByType = [
    { type: "Konsultasi Video", amount: 14040000, percentage: 60, count: 45 },
    { type: "Konsultasi Chat", amount: 7020000, percentage: 30, count: 25 },
    { type: "Konsultasi Telepon", amount: 2340000, percentage: 10, count: 8 },
  ]

  const expenses = [
    { category: "Platform Fee", amount: 2340000, percentage: 10 },
    { category: "Pajak", amount: 3510000, percentage: 15 },
    { category: "Asuransi Praktik", amount: 1170000, percentage: 5 },
    { category: "Peralatan Medis", amount: 2340000, percentage: 10 },
    { category: "Lain-lain", amount: 1170000, percentage: 5 },
  ]

  const currentMonth = {
    revenue: 23400000,
    expenses: 10530000,
    netIncome: 12870000,
    consultations: 78,
    avgPerConsult: 300000,
    growth: 14.7,
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Laporan Keuangan</h2>
          <p className="text-muted-foreground">Monitor penghasilan dan pengeluaran praktek</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="2024">
            <SelectTrigger className="w-32 bg-white rounded-xl border border-gray-200 text-black shadow-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white rounded-xl border border-gray-200 text-black shadow-md">
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-white rounded-xl border border-gray-200 text-black shadow-md">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white rounded-xl border border-gray-200 text-black shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendapatan Bulan Ini</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentMonth.revenue)}</div>
            <p className="text-xs text-teal-700">
              <TrendingUp className="h-3 w-3 inline mr-1" />+{currentMonth.growth}% dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl border border-gray-200 text-black shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pengeluaran</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentMonth.expenses)}</div>
            <p className="text-xs text-muted-foreground">
              {((currentMonth.expenses / currentMonth.revenue) * 100).toFixed(1)}% dari pendapatan
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl border border-gray-200 text-black shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendapatan Bersih</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-700">{formatCurrency(currentMonth.netIncome)}</div>
            <p className="text-xs text-muted-foreground">
              Margin {((currentMonth.netIncome / currentMonth.revenue) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl border border-gray-200 text-black shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata per Konsultasi</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentMonth.avgPerConsult)}</div>
            <p className="text-xs text-muted-foreground">{currentMonth.consultations} konsultasi bulan ini</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white rounded-xl border border-gray-200 text-black shadow-md">
          <TabsTrigger value="revenue">Pendapatan</TabsTrigger>
          <TabsTrigger value="detailed">Laporan Detail</TabsTrigger>
        </TabsList>
        <TabsContent value="revenue" className="space-y-4">
          <Card className="bg-white rounded-xl border border-gray-200 text-black shadow-md">
            <CardHeader>
              <CardTitle>Detail Pendapatan Bulanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyRevenue.map((month, index) => (
                  <div key={month.month} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-black" />
                      </div>
                      <div>
                        <p className="font-medium">{month.month} 2024</p>
                        <p className="text-sm text-muted-foreground">{month.consultations} konsultasi</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatCurrency(month.revenue)}</p>
                      <p className="text-sm text-muted-foreground">Avg: {formatCurrency(month.avgPerConsult)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-white rounded-xl border border-gray-200 text-black shadow-md">
              <CardHeader>
                <CardTitle>Laporan Laba Rugi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Pendapatan Kotor</span>
                    <span className="font-medium">{formatCurrency(currentMonth.revenue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">- Platform Fee</span>
                    <span className="text-muted-foreground">-{formatCurrency(2340000)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">- Pajak</span>
                    <span className="text-muted-foreground">-{formatCurrency(3510000)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">- Operasional</span>
                    <span className="text-muted-foreground">-{formatCurrency(4680000)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between font-bold text-teal-700">
                      <span>Pendapatan Bersih</span>
                      <span>{formatCurrency(currentMonth.netIncome)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl border border-gray-200 text-black shadow-md">
              <CardHeader>
                <CardTitle>Proyeksi Tahunan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Pendapatan Proyeksi</span>
                    <span className="text-sm font-medium">{formatCurrency(280800000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Pengeluaran Proyeksi</span>
                    <span className="text-sm font-medium">{formatCurrency(126360000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Target Konsultasi</span>
                    <span className="text-sm font-medium">936 konsultasi</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between font-bold">
                      <span>Proyeksi Laba Bersih</span>
                      <span className="text-teal-700">{formatCurrency(154440000)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white rounded-xl border border-gray-200 text-black shadow-md">
            <CardHeader>
              <CardTitle>Riwayat Transaksi Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                  <div>
                    <p className="font-medium">Konsultasi - Siti Nurhaliza</p>
                    <p className="text-sm text-muted-foreground">15 Jan 2024, 14:30</p>
                  </div>
                  <span className="font-medium text-teal-700">+{formatCurrency(300000)}</span>
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                  <div>
                    <p className="font-medium">Konsultasi - Budi Santoso</p>
                    <p className="text-sm text-muted-foreground">14 Jan 2024, 10:00</p>
                  </div>
                  <span className="font-medium text-teal-700">+{formatCurrency(300000)}</span>
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                  <div>
                    <p className="font-medium">Platform Fee</p>
                    <p className="text-sm text-muted-foreground">13 Jan 2024</p>
                  </div>
                  <span className="font-medium text-red-600">-{formatCurrency(30000)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
