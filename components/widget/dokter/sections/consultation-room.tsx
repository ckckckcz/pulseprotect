"use client"

import { useState, useEffect, useRef } from "react"
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
  VideoOff,
  Pill,
  FileCheck,
  Phone,
  Loader2
} from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Database } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context" // Add import for auth context

interface Message {
  id: number | string
  sender: "doctor" | "patient"
  message: string
  time: string
  type: "text" | "image" | "file"
  fileName?: string
}

interface User{
  nama_lengkap: string
}

interface ConsultationRoomProps {
  selectedPatient?: any
}

export function ConsultationRoom({ selectedPatient }: ConsultationRoomProps) {
  const [message, setMessage] = useState("")
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
  const [chatMessages, setChatMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const supabase = createClientComponentClient<Database>()
  const [users, setUsers] = useState<User[]>([])
  
  // Use the auth context to get the logged-in user
  const { user: authUser } = useAuth()
  
  // Use the doctor email from the selected patient, auth context, or as a last resort, the default
  const doctorEmail = selectedPatient?.doctorEmail || authUser?.email || "satria@pulseprotect.com"

  console.log("Using doctor email in consultation room:", doctorEmail)

  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('user')
          .select('*')
          .eq('role', 'user')
        
        if (error) {
          console.error('Error fetching users:', error)
          return
        }
        
        setUsers(data || [])
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [supabase])

  // Update activeConsultation to use selectedPatient or default data
  const [activeConsultation, setActiveConsultation] = useState(() => {
    if (selectedPatient) {
      return {
        patient: selectedPatient.nama_lengkap || selectedPatient.full_name || selectedPatient.email,
        patientEmail: selectedPatient.email,
        patientPhoto: selectedPatient.foto_profile,
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        type: "Chat",
        complaint: selectedPatient.condition || "Konsultasi umum",
        chatRoomId: selectedPatient.chatRoomId
      }
    }
    return {
      patient: "Siti Nurhaliza",
      patientEmail: "patient@example.com",
      patientPhoto: null,
      time: "14:30",
      type: "Video Call",
      complaint: "Sakit kepala berkepanjangan",
      chatRoomId: null
    }
  })

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])

  useEffect(() => {
    // Additional logging to help debug
    console.log('Selected patient in consultation room:', selectedPatient);
    console.log('Active consultation:', activeConsultation);
    
    if (activeConsultation.chatRoomId) {
      loadMessages()
      
      // Set up real-time subscription for new messages
      try {
        const channel = supabase
          .channel(`chat:${activeConsultation.chatRoomId}`)
          .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `chat_room_id=eq.${activeConsultation.chatRoomId}`
          }, (payload) => {
            console.log('Received new message:', payload);
            const newMessage = payload.new
            
            // Add the new message to our state
            setChatMessages(prevMessages => [
              ...prevMessages, 
              {
                id: newMessage.id,
                sender: newMessage.sender_type,
                message: newMessage.content,
                time: new Date(newMessage.created_at).toLocaleTimeString("id-ID", { 
                  hour: "2-digit", 
                  minute: "2-digit" 
                }),
                type: newMessage.message_type || "text",
                fileName: newMessage.file_name
              }
            ])
          })
          .subscribe()
          
        console.log('Successfully subscribed to real-time updates for chat room');
          
        return () => {
          supabase.removeChannel(channel)
        }
      } catch (subError) {
        console.error('Error setting up real-time subscription:', subError);
      }
    } else {
      // Fallback to demo messages if no chat room ID
      const demoMessages = selectedPatient
        ? [
            {
              id: 1,
              sender: "patient" as "patient",
              message: `Selamat siang dokter, saya ${selectedPatient.full_name || selectedPatient.email}. Saya ingin berkonsultasi mengenai ${selectedPatient.condition || "masalah kesehatan saya"}.`,
              time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
              type: "text" as "text",
            },
            {
              id: 2,
              sender: "doctor" as "doctor",
              message: "Selamat siang, terima kasih sudah menghubungi. Bisa ceritakan lebih detail tentang keluhan Anda?",
              time: new Date(Date.now() + 60000).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
              type: "text" as "text",
            },
          ]
        : [
            {
              id: 1,
              sender: "patient" as "patient",
              message: "Selamat siang dokter, saya mengalami sakit kepala yang sudah berlangsung 3 hari",
              time: "14:31",
              type: "text" as "text",
            },
            {
              id: 2,
              sender: "doctor" as "doctor",
              message: "Selamat siang, terima kasih sudah menghubungi. Bisa ceritakan lebih detail tentang sakit kepalanya?",
              time: "14:32",
              type: "text" as "text",
            },
            {
              id: 3,
              sender: "patient" as "patient",
              message: "Sakitnya di bagian dahi dan pelipis, terutama pagi hari. Saya juga merasa mual",
              time: "14:33",
              type: "text" as "text",
            },
            {
              id: 4,
              sender: "patient" as "patient",
              message: "Ini foto hasil lab yang kemarin saya lakukan",
              time: "14:34",
              type: "image" as "image",
              fileName: "lab_result.jpg",
            },
          ]
      
      setChatMessages(demoMessages as Message[])
    }
  }, [activeConsultation.chatRoomId, supabase, selectedPatient])

  const loadMessages = async () => {
    if (!activeConsultation.chatRoomId) {
      console.log('No chat room ID available, skipping message load');
      return;
    }
    
    console.log('Loading messages for chat room:', activeConsultation.chatRoomId);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_room_id', activeConsultation.chatRoomId)
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Error loading messages:', error)
        return
      }
      
      console.log('Loaded messages:', data);
      
      // Transform the messages to our format
      const formattedMessages = data?.map(msg => ({
        id: msg.id,
        sender: msg.sender_type as "doctor" | "patient",
        message: msg.content,
        time: new Date(msg.created_at).toLocaleTimeString("id-ID", { 
          hour: "2-digit", 
          minute: "2-digit" 
        }),
        type: (msg.message_type as "text" | "image" | "file") || "text",
        fileName: msg.file_name
      })) || [];
      
      setChatMessages(formattedMessages)
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!message.trim() || !activeConsultation.chatRoomId) {
      console.log('Cannot send message: Empty message or no chat room ID');
      return;
    }
    
    console.log('Sending message to chat room:', activeConsultation.chatRoomId);
    console.log('Using doctor email for message:', doctorEmail);
    
    try {
      const newMessage = {
        chat_room_id: activeConsultation.chatRoomId,
        sender_type: 'doctor' as const,
        sender_email: doctorEmail, // Use authenticated user's email
        content: message.trim(),
        message_type: 'text' as const
      }
      
      console.log('Message payload:', newMessage);
      
      const { data, error } = await supabase
        .from('messages')
        .insert(newMessage)
      
      console.log('Send message response:', { data, error });
      
      if (error) {
        console.error('Error sending message:', error)
        return
      }
      
      // Clear the input
      setMessage("")
    } catch (error) {
      console.error('Exception sending message:', error)
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
                  <Avatar className="border-2 border-teal-600">
                    <AvatarImage 
                      src={activeConsultation.patientPhoto || `/placeholder.svg?height=40&width=40&query=${activeConsultation.patient}`} 
                    />
                    <AvatarFallback>
                      {activeConsultation.patient
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{activeConsultation.patient}</h3>
                    <p className="text-sm text-muted-foreground">
                      {activeConsultation.patientEmail}
                    </p>
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

            <CardContent className="flex-1 overflow-auto p-4" ref={chatContainerRef}>
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading messages...</span>
                </div>
              ) : (
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
              )}
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
                  disabled={!activeConsultation.chatRoomId || isLoading}
                />
                <Button 
                  className="bg-gray-200 rounded hover:bg-teal-700 hover:text-white" 
                  onClick={sendMessage}
                  disabled={!activeConsultation.chatRoomId || isLoading || !message.trim()}
                >
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
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-16 w-16 border-2 border-teal-600">
                  <AvatarImage 
                    src={activeConsultation.patientPhoto || `/placeholder.svg?height=60&width=60&query=${activeConsultation.patient}`}
                  />
                  <AvatarFallback className="text-lg">
                    {activeConsultation.patient
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-lg">{activeConsultation.patient}</p>
                  <p className="text-sm text-muted-foreground">{activeConsultation.patientEmail}</p>
                </div>
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
