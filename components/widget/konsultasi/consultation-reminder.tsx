"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Clock, X } from "lucide-react"

interface ConsultationReminderProps {
  doctor: any
  schedule: any
  onStartChat: () => void
  onDismiss: () => void
}

export function ConsultationReminder({ doctor, schedule, onStartChat, onDismiss }: ConsultationReminderProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md animate-in slide-in-from-bottom-4 bg-white text-black rounded-xl border-2 border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Waktu Konsultasi!</h3>
                <p className="text-sm text-gray-600">Konsultasi Anda akan segera dimulai</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onDismiss} className="p-1">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={doctor.image || "/placeholder.svg"} />
              <AvatarFallback>
                {doctor.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{doctor.name}</p>
              <p className="text-sm text-gray-600">{doctor.specialty}</p>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>
                {schedule.date} • {schedule.time}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <schedule.type.icon className="w-4 h-4 text-gray-500" />
              <span>{schedule.type.name}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onDismiss} className="flex-1 bg-gray-200 rounded-xl border border-gray-300 hover:bg-gray-300 hover:text-black">
              Nanti Saja
            </Button>
            <Button onClick={onStartChat} className="flex-1 bg-teal-700 rounded-xl hover:bg-teal-800 text-white">
              Mulai Konsultasi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
