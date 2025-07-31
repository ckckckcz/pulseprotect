"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Plus, Settings } from "lucide-react"

export function PracticeSchedule() {
  const [schedules, setSchedules] = useState([
    { day: "Senin", startTime: "08:00", endTime: "17:00", isActive: true, breakStart: "12:00", breakEnd: "13:00" },
    { day: "Selasa", startTime: "08:00", endTime: "17:00", isActive: true, breakStart: "12:00", breakEnd: "13:00" },
    { day: "Rabu", startTime: "08:00", endTime: "17:00", isActive: true, breakStart: "12:00", breakEnd: "13:00" },
    { day: "Kamis", startTime: "08:00", endTime: "17:00", isActive: true, breakStart: "12:00", breakEnd: "13:00" },
    { day: "Jumat", startTime: "08:00", endTime: "16:00", isActive: true, breakStart: "11:30", breakEnd: "13:30" },
    { day: "Sabtu", startTime: "08:00", endTime: "14:00", isActive: true, breakStart: "12:00", breakEnd: "13:00" },
    { day: "Minggu", startTime: "09:00", endTime: "15:00", isActive: false, breakStart: "12:00", breakEnd: "13:00" },
  ])

  const timeSlots = [
    "07:00",
    "07:30",
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
  ]

  const toggleDayActive = (index: number) => {
    const updated = [...schedules]
    updated[index].isActive = !updated[index].isActive
    setSchedules(updated)
  }

  const updateSchedule = (index: number, field: string, value: string) => {
    const updated = [...schedules]
    updated[index] = { ...updated[index], [field]: value }
    setSchedules(updated)
  }

  const bookedSlots = [
    { day: "Senin", time: "09:00", patient: "Siti Nurhaliza" },
    { day: "Senin", time: "10:30", patient: "Budi Santoso" },
    { day: "Selasa", time: "14:00", patient: "Maria Gonzalez" },
    { day: "Rabu", time: "15:30", patient: "Ahmad Rizki" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Jadwal Praktek</h2>
          <p className="text-muted-foreground">Atur jam dan hari praktek Anda</p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Pengaturan Lanjutan
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Schedule Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pengaturan Jadwal Harian
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {schedules.map((schedule, index) => (
              <div key={schedule.day} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{schedule.day}</h3>
                  <Switch checked={schedule.isActive} onCheckedChange={() => toggleDayActive(index)} />
                </div>

                {schedule.isActive && (
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">Jam Mulai</label>
                      <Select
                        value={schedule.startTime}
                        onValueChange={(value) => updateSchedule(index, "startTime", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Jam Selesai</label>
                      <Select
                        value={schedule.endTime}
                        onValueChange={(value) => updateSchedule(index, "endTime", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Istirahat Mulai</label>
                      <Select
                        value={schedule.breakStart}
                        onValueChange={(value) => updateSchedule(index, "breakStart", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Istirahat Selesai</label>
                      <Select
                        value={schedule.breakEnd}
                        onValueChange={(value) => updateSchedule(index, "breakEnd", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Button className="w-full mt-4">Simpan Jadwal</Button>
          </CardContent>
        </Card>

        {/* Current Week Overview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Jadwal Minggu Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {schedules
                  .filter((s) => s.isActive)
                  .map((schedule) => (
                    <div key={schedule.day} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{schedule.day}</p>
                        <p className="text-sm text-muted-foreground">
                          {schedule.startTime} - {schedule.endTime}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {bookedSlots.filter((slot) => slot.day === schedule.day).length} pasien
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Slot Terisi Hari Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {bookedSlots
                  .filter((slot) => slot.day === "Senin")
                  .map((slot, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="font-medium">{slot.time}</span>
                      <span className="text-sm text-muted-foreground">{slot.patient}</span>
                    </div>
                  ))}
                {bookedSlots.filter((slot) => slot.day === "Senin").length === 0 && (
                  <p className="text-center text-muted-foreground py-4">Tidak ada jadwal hari ini</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Hari Libur
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Clock className="h-4 w-4 mr-2" />
                Ubah Durasi Konsultasi
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Calendar className="h-4 w-4 mr-2" />
                Sinkronisasi Kalender
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
