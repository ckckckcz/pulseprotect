"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calendar, MessageSquare, Video, Phone, CreditCard } from "lucide-react"

interface ScheduleConsultationProps {
  doctor: any
  onConfirm: (schedule: any) => void
  onBack: () => void
}

export function ScheduleConsultation({ doctor, onConfirm, onBack }: ScheduleConsultationProps) {
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [consultationType, setConsultationType] = useState("chat")
  const [complaint, setComplaint] = useState("")

  const availableDates = [
    { value: "2024-01-16", label: "Hari Ini - 16 Jan 2024" },
    { value: "2024-01-17", label: "Besok - 17 Jan 2024" },
    { value: "2024-01-18", label: "Kamis - 18 Jan 2024" },
    { value: "2024-01-19", label: "Jumat - 19 Jan 2024" },
    { value: "2024-01-20", label: "Sabtu - 20 Jan 2024" },
  ]

  const availableTimes = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
  ]

  const consultationTypes = [
    {
      id: "chat",
      name: "Chat",
      icon: MessageSquare,
      price: doctor.price.chat,
      description: "Konsultasi melalui pesan teks",
      color: "text-blue-600",
    },
    {
      id: "video",
      name: "Video Call",
      icon: Video,
      price: doctor.price.video,
      description: "Konsultasi melalui video call",
      color: "text-green-600",
    },
    {
      id: "phone",
      name: "Telepon",
      icon: Phone,
      price: doctor.price.phone,
      description: "Konsultasi melalui panggilan telepon",
      color: "text-orange-600",
    },
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime || !consultationType || !complaint.trim()) {
      alert("Mohon lengkapi semua field")
      return
    }

    const schedule = {
      date: availableDates.find((d) => d.value === selectedDate)?.label,
      time: selectedTime,
      type: consultationTypes.find((t) => t.id === consultationType),
      complaint: complaint,
    }

    onConfirm(schedule)
  }

  const selectedConsultationType = consultationTypes.find((t) => t.id === consultationType)

  return (
    <div className="min-h-screen bg-white p-4 mt-32">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2 text-black hover:bg-gray-200 hover:text-black rounded">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Jadwalkan Konsultasi</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Doctor Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 bg-white text-black rounded-xl border-2 border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={doctor.image || "/placeholder.svg"} />
                    <AvatarFallback>
                      {doctor.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-lg">{doctor.name}</h3>
                    <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                    <p className="text-sm text-gray-500">{doctor.experience} pengalaman</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rating</span>
                    <span className="font-semibold">{doctor.rating}/5.0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Ulasan</span>
                    <span className="font-semibold">{doctor.reviews} ulasan</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Bahasa</span>
                    <span className="font-semibold">{doctor.languages.join(", ")}</span>
                  </div>
                </div>

                {selectedConsultationType && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <selectedConsultationType.icon className={`w-5 h-5 ${selectedConsultationType.color}`} />
                      <span className="font-semibold">{selectedConsultationType.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{selectedConsultationType.description}</p>
                    <p className="text-2xl font-bold text-blue-600">{formatPrice(selectedConsultationType.price)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Scheduling Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white text-black rounded-xl border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Detail Konsultasi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 ">
                {/* Consultation Type */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Jenis Konsultasi</label>
                  <div className="grid gap-3 md:grid-cols-3">
                    {consultationTypes.map((type) => (
                      <div
                        key={type.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          consultationType === type.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setConsultationType(type.id)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <type.icon className={`w-5 h-5 ${type.color}`} />
                          <span className="font-semibold">{type.name}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                        <p className="font-bold text-lg">{formatPrice(type.price)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="text-sm font-medium  text-gray-700 mb-2 block">Pilih Tanggal</label>
                  <Select value={selectedDate} onValueChange={setSelectedDate}>
                    <SelectTrigger className="h-12 bg-white text-black rounded-xl border-2 border-gray-200">
                      <SelectValue placeholder="Pilih tanggal konsultasi" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black rounded-xl border-2 border-gray-200">
                      {availableDates.map((date) => (
                        <SelectItem key={date.value} value={date.value}>
                          {date.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Time Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Pilih Waktu</label>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2 ">
                    {availableTimes.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        onClick={() => setSelectedTime(time)}
                        className="h-10 bg-white text-black rounded-xl border-2 border-gray-200 hover:bg-gray-200 hover:text-black"
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Complaint */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Keluhan / Gejala yang Dialami</label>
                  <Textarea
                    placeholder="Jelaskan keluhan atau gejala yang Anda alami..."
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    className="min-h-[100px] bg-white text-black rounded-xl border-2 border-gray-200"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Informasi ini akan membantu dokter mempersiapkan konsultasi
                  </p>
                </div>

                {/* Summary */}
                {selectedDate && selectedTime && selectedConsultationType && (
                  <div className="p-4 bg-white text-black rounded-xl">
                    <h4 className="font-semibold mb-3">Ringkasan Konsultasi</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Dokter:</span>
                        <span className="font-medium">{doctor.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tanggal:</span>
                        <span className="font-medium">
                          {availableDates.find((d) => d.value === selectedDate)?.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Waktu:</span>
                        <span className="font-medium">{selectedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Jenis:</span>
                        <span className="font-medium">{selectedConsultationType.name}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                        <span className="font-semibold">Total Biaya:</span>
                        <span className="font-bold text-lg text-teal-600">
                          {formatPrice(selectedConsultationType.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirm Button */}
                <Button
                  onClick={handleConfirm}
                  className="w-full h-12 text-lg font-semibold"
                  disabled={!selectedDate || !selectedTime || !consultationType || !complaint.trim()}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Konfirmasi & Bayar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
