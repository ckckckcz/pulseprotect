import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Calendar, Clock, Bell, Activity, TrendingUp, MessageSquare, CheckCircle } from "lucide-react"

export function DashboardOverview() {
  const todayStats = [
    {
      title: "Pasien Hari Ini",
      value: "24",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Konsultasi Selesai",
      value: "18",
      change: "+8%",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Konsultasi Tersisa",
      value: "6",
      change: "-2",
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "Notifikasi Baru",
      value: "12",
      change: "+5",
      icon: Bell,
      color: "text-red-600",
    },
  ]

  const upcomingConsultations = [
    {
      id: 1,
      patient: "Siti Nurhaliza",
      time: "14:30",
      type: "Konsultasi Rutin",
      status: "confirmed",
    },
    {
      id: 2,
      patient: "Budi Santoso",
      time: "15:00",
      type: "Follow Up",
      status: "waiting",
    },
    {
      id: 3,
      patient: "Maria Gonzalez",
      time: "15:30",
      type: "Konsultasi Baru",
      status: "confirmed",
    },
  ]

  const recentActivities = [
    {
      id: 1,
      action: "Konsultasi selesai dengan Ahmad Rizki",
      time: "10 menit lalu",
      type: "consultation",
    },
    {
      id: 2,
      action: "Resep dikirim ke Sari Dewi",
      time: "25 menit lalu",
      type: "prescription",
    },
    {
      id: 3,
      action: "Jadwal praktek diperbarui",
      time: "1 jam lalu",
      type: "schedule",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {todayStats.map((stat, index) => (
          <Card key={index} className="bg-white rounded-xl border border-gray-200 text-black shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> dari kemarin
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 ">
        {/* Upcoming Consultations */}
        <Card className="lg:col-span-2 bg-white rounded-xl border border-gray-200 text-black shadow-md ">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Konsultasi Berikutnya
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 ">
              {upcomingConsultations.map((consultation) => (
                <div key={consultation.id} className="lg:flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 text-black">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`/placeholder.svg?height=40&width=40&query=${consultation.patient}`} />
                      <AvatarFallback>
                        {consultation.patient
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{consultation.patient}</p>
                      <p className="text-sm text-muted-foreground">{consultation.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 lg:mt-0 mt-4 bg-white rounded-xl border border-gray-200 text-black shadow-md justify-between">
                    <Badge variant={consultation.status === "confirmed" ? "default" : "default"} className="bg-white">
                      {consultation.status === "confirmed" ? "Dikonfirmasi" : "Menunggu"}
                    </Badge>
                    <span className="text-sm font-medium">{consultation.time}</span>
                    <Button size="sm" className="bg-teal-600 rounded-tr-xl rounded-br-xl text-white hover:bg-teal-700">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Mulai
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="bg-white rounded-xl border border-gray-200 text-black shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Aktivitas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-white mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white border border-gray-200 text-black rounded-xl shadow-md">
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button className="h-20 flex-col gap-2 bg-gray-50 border-gray-300 rounded-xl hover:bg-teal-600 hover:text-white hover:border-0 border">
              <Users className="h-6 w-6" />
              Tambah Pasien Baru
            </Button>
            <Button className="h-20 flex-col gap-2 bg-gray-50 border-gray-300 rounded-xl hover:bg-teal-600 hover:text-white hover:border-0 border">
              <Calendar className="h-6 w-6" />
              Atur Jadwal
            </Button>
            <Button className="h-20 flex-col gap-2 bg-gray-50 border-gray-300 rounded-xl hover:bg-teal-600 hover:text-white hover:border-0 border">
              <MessageSquare className="h-6 w-6" />
              Mulai Konsultasi
            </Button>
            <Button className="h-20 flex-col gap-2 bg-gray-50 border-gray-300 rounded-xl hover:bg-teal-600 hover:text-white hover:border-0 border">
              <TrendingUp className="h-6 w-6" />
              Lihat Laporan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
