"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Send,
  Paperclip,
  FileText,
  ImageIcon,
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Pill,
  FileCheck,
  Phone,
} from "lucide-react"

interface ConsultationRoomProps {
  selectedPatient?: any
}

export function ConsultationRoom({ selectedPatient }: ConsultationRoomProps) {
  const [message, setMessage] = useState("")
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)

  // Update activeConsultation to use selectedPatient or default data
  const [activeConsultation, setActiveConsultation] = useState(() => {
    if (selectedPatient) {
      return {
        patient: selectedPatient.name,
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        type: "Chat",
        complaint: selectedPatient.condition || "Konsultasi umum",
      }
    }
    return {
      patient: "Siti Nurhaliza",
      time: "14:30",
      type: "Video Call",
      complaint: "Sakit kepala berkepanjangan",
    }
  })

  // Update chatMessages to be more dynamic based on selected patient
  const chatMessages = selectedPatient
    ? [
        {
          id: 1,
          sender: "patient",
          message: `Selamat siang dokter, saya ${selectedPatient.name}. Saya ingin berkonsultasi mengenai ${selectedPatient.condition}.`,
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          type: "text",
        },
        {
          id: 2,
          sender: "doctor",
          message: "Selamat siang, terima kasih sudah menghubungi. Bisa ceritakan lebih detail tentang keluhan Anda?",
          time: new Date(Date.now() + 60000).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          type: "text",
        },
      ]
    : [
        {
          id: 1,
          sender: "patient",
          message: "Selamat siang dokter, saya mengalami sakit kepala yang sudah berlangsung 3 hari",
          time: "14:31",
          type: "text",
        },
        {
          id: 2,
          sender: "doctor",
          message:
            "Selamat siang, terima kasih sudah menghubungi. Bisa ceritakan lebih detail tentang sakit kepalanya?",
          time: "14:32",
          type: "text",
        },
        {
          id: 3,
          sender: "patient",
          message: "Sakitnya di bagian dahi dan pelipis, terutama pagi hari. Saya juga merasa mual",
          time: "14:33",
          type: "text",
        },
        {
          id: 4,
          sender: "patient",
          message: "Ini foto hasil lab yang kemarin saya lakukan",
          time: "14:34",
          type: "image",
          fileName: "lab_result.jpg",
        },
      ]

  const sendMessage = () => {
    if (message.trim()) {
      // Logic to send message
      setMessage("")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ruang Konsultasi</h2>
          <p className="text-muted-foreground">Konsultasi aktif dengan pasien</p>
        </div>
        <Badge variant="default" className="bg-teal-600 px-4 py-2 text-white">
          Sedang Berlangsung
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 ">
        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col bg-white rounded-xl border border-gray-200 text-black shadow-md">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={`/placeholder.svg?height=40&width=40&query=${activeConsultation.patient}`} />
                    <AvatarFallback>SN</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{activeConsultation.patient}</h3>
                    <p className="text-sm text-muted-foreground">{activeConsultation.complaint}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="default" className="rounded bg-gray-200 hover:bg-teal-600 hover:text-white"
                    onClick={() => setIsVideoOn(!isVideoOn)}
                  >
                    {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>
                  <Button variant="default" className="rounded bg-gray-200 hover:bg-teal-600 hover:text-white">
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-auto p-4">
              <div className="space-y-4">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "doctor" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.sender === "doctor" ? "bg-teal-600 text-white rounded-tr rounded-br-xl rounded-bl-xl rounded-tl-xl" : "bg-gray-200 rounded-tr-xl rounded-br-xl rounded-bl-xl rounded-tl"
                      }`}
                    >
                      {msg.type === "text" ? (
                        <p className="text-sm">{msg.message}</p>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            <span className="text-sm">{msg.fileName}</span>
                          </div>
                          <div className="w-48 h-32 bg-gray-200 rounded flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        </div>
                      )}
                      <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>

            <div className="border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <Button className="rounded bg-gray-200">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Ketik pesan..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1 bg-gray-200 border border-gray-200 rounded"
                />
                <Button className="bg-gray-200 rounded hover:bg-teal-700 hover:text-white" onClick={sendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Patient Info & Actions */}
        <div className="flex flex-col justify-between lg:space-y-0 space-y-4">
          <Card className="bg-white rounded-xl border border-gray-200 text-black shadow-md">
            <CardHeader>
              <CardTitle>Informasi Pasien</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nama Lengkap</label>
                <p className="text-sm text-muted-foreground">{activeConsultation.patient}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Keluhan Utama</label>
                <p className="text-sm text-muted-foreground">{activeConsultation.complaint}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Waktu Konsultasi</label>
                <p className="text-sm text-muted-foreground">{activeConsultation.time}</p>
              </div>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader>
              <CardTitle>Catatan Konsultasi</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea placeholder="Tulis catatan diagnosis dan tindakan..." className="min-h-[100px]" />
            </CardContent>
          </Card> */}

          <Card className="bg-white rounded-xl border border-gray-200 text-black shadow-md">
            <CardHeader>
              <CardTitle>Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 ">
              <Button className="w-full justify-start gap-2 bg-white rounded-xl border border-gray-200 text-black hover:bg-gray-200">
                <Pill className="h-4 w-4" />
                Kirim Resep
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 bg-white hover:text-black rounded-xl border border-gray-200 text-black hover:bg-gray-200">
                <FileCheck className="h-4 w-4" />
                Buat Rujukan
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 bg-white hover:text-black rounded-xl border border-gray-200 text-black hover:bg-gray-200">
                <FileText className="h-4 w-4" />
                Cetak Surat Keterangan
              </Button>
            </CardContent>
          </Card>

          <Button className="w-full bg-red-600 rounded-xl text-white hover:bg-red-700">
            Selesai Konsultasi
          </Button>
        </div>
      </div>
    </div>
  )
}
