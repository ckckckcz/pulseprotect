import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MessageSquare, Phone, Video } from "lucide-react"

export function ConsultationSchedule() {
  const todayConsultations = [
    {
      id: 1,
      patient: "Siti Nurhaliza",
      time: "14:30",
      duration: "30 menit",
      type: "Video Call",
      status: "confirmed",
      complaint: "Sakit kepala berkepanjangan",
    },
    {
      id: 2,
      patient: "Budi Santoso",
      time: "15:00",
      duration: "45 menit",
      type: "Chat",
      status: "waiting",
      complaint: "Follow up diabetes",
    },
    {
      id: 3,
      patient: "Maria Gonzalez",
      time: "15:30",
      duration: "30 menit",
      type: "Video Call",
      status: "confirmed",
      complaint: "Konsultasi kehamilan",
    },
    {
      id: 4,
      patient: "Ahmad Rizki",
      time: "16:00",
      duration: "30 menit",
      type: "Phone Call",
      status: "pending",
      complaint: "Nyeri punggung",
    },
  ]

  const tomorrowConsultations = [
    {
      id: 5,
      patient: "Dewi Sartika",
      time: "09:00",
      duration: "30 menit",
      type: "Video Call",
      status: "confirmed",
      complaint: "Pemeriksaan rutin",
    },
    {
      id: 6,
      patient: "Rudi Hartono",
      time: "09:30",
      duration: "45 menit",
      type: "Chat",
      status: "confirmed",
      complaint: "Konsultasi hipertensi",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "waiting":
        return "secondary"
      case "pending":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Dikonfirmasi"
      case "waiting":
        return "Menunggu"
      case "pending":
        return "Pending"
      default:
        return status
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Video Call":
        return <Video className="h-4 w-4" />
      case "Phone Call":
        return <Phone className="h-4 w-4" />
      case "Chat":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const ConsultationCard = ({ consultation }: { consultation: any }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`/placeholder.svg?height=48&width=48&query=${consultation.patient}`} />
              <AvatarFallback>
                {consultation.patient
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">{consultation.patient}</h3>
              <p className="text-sm text-muted-foreground">{consultation.complaint}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="h-4 w-4" />
                  {consultation.time} ({consultation.duration})
                </div>
                <div className="flex items-center gap-1 text-sm">
                  {getTypeIcon(consultation.type)}
                  {consultation.type}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={getStatusColor(consultation.status)}>{getStatusText(consultation.status)}</Badge>
            <Button size="sm" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Mulai Konsultasi
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Konsultasi Terjadwal</h2>
          <p className="text-muted-foreground">Kelola jadwal konsultasi pasien Anda</p>
        </div>
        <Button>
          <Calendar className="h-4 w-4 mr-2" />
          Tambah Jadwal
        </Button>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Hari Ini ({todayConsultations.length})</TabsTrigger>
          <TabsTrigger value="tomorrow">Besok ({tomorrowConsultations.length})</TabsTrigger>
          <TabsTrigger value="week">Minggu Ini</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Konsultasi Hari Ini -{" "}
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayConsultations.map((consultation) => (
                <ConsultationCard key={consultation.id} consultation={consultation} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tomorrow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Konsultasi Besok
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tomorrowConsultations.map((consultation) => (
                <ConsultationCard key={consultation.id} consultation={consultation} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Jadwal Minggu Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">Fitur jadwal mingguan akan segera tersedia</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
