"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Send, Paperclip, ImageIcon, FileText, Video, Phone, MoreVertical, ArrowLeft, Clock, CheckCircle, Upload } from "lucide-react";

interface ChatRoomProps {
  doctor: any;
  schedule: any;
  onBack: () => void;
}

// Tambahkan tipe Message
type Message = {
  id: number;
  sender: string;
  message: string;
  time: string;
  type: string;
  fileName?: string;
  fileSize?: string;
};

export function ChatRoom({ doctor, schedule, onBack }: ChatRoomProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "doctor",
      message: `Selamat ${getGreeting()}, saya ${doctor.name}. Terima kasih telah memilih konsultasi dengan saya. Bagaimana kabar Anda hari ini?`,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      type: "text",
    },
    {
      id: 2,
      sender: "system",
      message: "Konsultasi dimulai. Durasi: 30 menit",
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      type: "system",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "pagi";
    if (hour < 15) return "siang";
    if (hour < 18) return "sore";
    return "malam";
  }

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      sender: "patient",
      message: message,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      type: "text",
    };

    setMessages([...messages, newMessage]);
    setMessage("");

    // Simulate doctor typing
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const doctorReply: Message = {
        id: messages.length + 2,
        sender: "doctor",
        message: "Terima kasih atas informasinya. Saya akan menganalisis keluhan Anda dan memberikan saran yang tepat.",
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        type: "text",
      };
      setMessages((prev) => [...prev, doctorReply]);
    }, 2000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newMessage: Message = {
        id: messages.length + 1,
        sender: "patient",
        message: `File: ${file.name}`,
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        type: "file",
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(1) + " KB",
      };
      setMessages([...messages, newMessage]);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen max-w-[85rem] mx-auto bg-white flex flex-col mt-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={onBack} className="p-2 md:hidden">
            <ArrowLeft className="w-5 h-5 text-black" />
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarImage src={doctor.image || "/placeholder.svg"} />
            <AvatarFallback>
              {doctor.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Online</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="hidden md:flex bg-teal-600 border-none py-2">
            {schedule.type.name} • {formatPrice(schedule.type.price)}
          </Badge>
          <Button size="sm" className="bg-gray-100 rounded text-black hover:text-white hover:bg-teal-600">
            <Video className="w-5 h-5" />
          </Button>
          <Button size="sm" className="bg-gray-100 rounded text-black hover:text-white hover:bg-teal-600">
            <Phone className="w-5 h-5" />
          </Button>
          <Button size="sm" className="bg-gray-100 rounded text-black hover:text-white hover:bg-teal-600">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Consultation Info */}
      <div className="bg-teal-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            <span className="text-teal-800">
              Konsultasi {schedule.type.name} • {schedule.date} • {schedule.time}
            </span>
          </div>
          <Badge variant="default" className="bg-teal-600 text-white">
            Aktif
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.type === "system" ? (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4" />
                  {msg.message}
                </div>
              </div>
            ) : (
              <div className={`flex ${msg.sender === "patient" ? "justify-end" : "justify-start"}`}>
                <div className="flex items-start gap-2 max-w-[70%]">
                  {msg.sender === "doctor" && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={doctor.image || "/placeholder.svg"} />
                      <AvatarFallback>DR</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`rounded-2xl px-4 py-2 ${msg.sender === "patient" ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-900"}`}>
                    {msg.type === "file" ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm font-medium">{msg.fileName ?? "File"}</span>
                        </div>
                        <p className="text-xs opacity-75">{msg.fileSize ?? ""}</p>
                      </div>
                    ) : (
                      <p className="text-sm">{msg.message}</p>
                    )}
                    <p className={`text-xs mt-1 ${msg.sender === "patient" ? "text-teal-100" : "text-gray-500"}`}>{msg.time}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={doctor.image || "/placeholder.svg"} />
                <AvatarFallback>DR</AvatarFallback>
              </Avatar>
              <div className="bg-gray-100 rounded-2xl px-4 py-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,.pdf,.doc,.docx" />

          <Dialog>
            <DialogTrigger asChild>
              <Button className=" bg-gray-200 rounded hover:bg-gray-300">
                <Paperclip className="w-5 h-5 text-black" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm bg-white text-black rounded-xl border-2 border-gray-200">
              <DialogHeader>
                <DialogTitle>Upload File</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-white text-black rounded-xl border-2 border-gray-200 hover:bg-gray-200 hover:text-black gap-3 h-12 bg-transparent" onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon className="w-5 h-5 text-black" />
                  Upload Gambar
                </Button>
                <Button variant="outline" className="w-full justify-start bg-white text-black rounded-xl border-2 border-gray-200 hover:bg-gray-200 hover:text-black gap-3 h-12 bg-transparent" onClick={() => fileInputRef.current?.click()}>
                  <FileText className="w-5 h-5 text-black" />
                  Upload Dokumen
                </Button>
                <Button variant="outline" className="w-full justify-start bg-white text-black rounded-xl border-2 border-gray-200 hover:bg-gray-200 hover:text-black gap-3 h-12 bg-transparent" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-5 h-5 text-black" />
                  Upload File Lainnya
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Input
            placeholder="Ketik pesan..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 h-10 bg-gray-200 rounded border border-gray-200 text-black"
          />
          <Button onClick={sendMessage} className=" bg-gray-200 rounded hover:bg-gray-300">
            <Send className="w-5 h-5 text-black" />
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-2 text-center">Konsultasi akan berakhir dalam 25 menit</p>
      </div>
    </div>
  );
}
