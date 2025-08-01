"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Plus, Calendar, Phone, Mail, MapPin, MessageSquare, Loader2 } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Database } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context" // Add import for auth context

interface User {
  id: string
  email: string
  nama_lengkap?: string
  nomor_telepon?: string
  created_at: string
  role: string
  foto_profile?: string
  gender?: string
  age?: number
  condition?: string
  last_visit?: string
}

interface PatientManagementProps {
  setSelectedPatient: (patient: any) => void
  setActiveSection: (section: string) => void
}

export function PatientManagement({ setSelectedPatient, setActiveSection }: PatientManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingUser, setProcessingUser] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()
  
  // Use the auth context to get the logged-in user
  const { user: authUser } = useAuth()
  
  // Get doctor email from auth context
  const doctorEmail = authUser?.email || "satria@pulseprotect.com"

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

  const handleStartConsultation = async (patient: User) => {
    try {
      setProcessingUser(patient.id)
      
      console.log('Starting consultation with patient:', patient.email)
      console.log('Using doctor email from auth context:', doctorEmail)
      
      // Check if a chat room already exists between this doctor and patient
      const { data: existingRooms, error: roomError } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('doctor_email', doctorEmail)
        .eq('patient_email', patient.email)
        .eq('status', 'active')
      
      if (roomError) {
        console.error('Error checking for existing chat room:', roomError)
        return
      }
      
      console.log('Existing rooms:', existingRooms)
      
      let chatRoomId = existingRooms && existingRooms.length > 0 ? existingRooms[0].id : null
      
      // If no chat room exists, create a new one
      if (!chatRoomId) {
        console.log('Creating new chat room...')
        
        try {
          const { data: newRooms, error: createError } = await supabase
            .from('chat_rooms')
            .insert({
              doctor_email: doctorEmail, // Use authenticated user's email
              patient_email: patient.email,
              status: 'active'
            })
            .select('id')
          
          console.log('Insert response:', { newRooms, createError })
          
          if (createError) {
            console.error('Error creating new chat room:', createError)
            return
          }
          
          if (!newRooms || newRooms.length === 0) {
            console.error('No room created despite no error')
            return
          }
          
          chatRoomId = newRooms[0].id
        } catch (insertError) {
          console.error('Exception during room creation:', insertError)
          return
        }
      }
      
      console.log('Using chat room ID:', chatRoomId)
      
      if (!chatRoomId) {
        console.error('Failed to get a valid chat room ID')
        return
      }
      
      // Set the selected patient with the chat room ID and doctor email
      setSelectedPatient({
        ...patient,
        full_name: patient.nama_lengkap, // Map fields for consistency
        condition: "Konsultasi umum", // Default condition
        chatRoomId,
        doctorEmail // Pass the authenticated user's email
      })
      
      setActiveSection("consultation-room")
    } catch (error) {
      console.error('Error handling chat initiation:', error)
    } finally {
      setProcessingUser(null)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      (user.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (user.condition?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  )

  const getStatusColor = (user: User): "default" | "secondary" | "destructive" | "outline" => {
    // You can define your own status logic here, for example based on last activity
    return "default"
  }

  const getStatusText = (user: User) => {
    // You can define your own status logic here
    return "Aktif"
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("id-ID")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manajemen Pasien</h2>
          <p className="text-muted-foreground">Kelola data dan informasi pasien</p>
        </div>
        <Dialog>
          {/* <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Pasien
            </Button>
          </DialogTrigger> */}
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Pasien Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Nama Lengkap" />
              <Input placeholder="Umur" type="number" />
              <Input placeholder="Nomor Telepon" />
              <Input placeholder="Email" type="email" />
              <Input placeholder="Alamat" />
              <Button className="w-full">Simpan Pasien</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white rounded-xl border border-gray-200 text-black shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Pasien</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 bg top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari pasien..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64 bg-white rounded-xl border border-gray-200"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading data pasien...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                  <TableHead>Pasien</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Terdaftar</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      {searchTerm ? "Tidak ada pasien yang sesuai dengan pencarian" : "Belum ada data pasien"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="border-2 border-teal-600">
                            <AvatarImage src={user.foto_profile || `/placeholder.svg?height=32&width=32&query=${user.nama_lengkap || user.email}`} />
                            <AvatarFallback>
                              {user.nama_lengkap
                                ? user.nama_lengkap
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                : user.email?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.nama_lengkap || user.email}</p>
                            <p className="text-sm text-muted-foreground">
                              {user.age ? `${user.age} tahun, ` : ""}{user.gender || ""}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {user.nomor_telepon && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {user.nomor_telepon}
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {formatDate(user.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(user)}>{getStatusText(user)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleStartConsultation(user)}
                          disabled={processingUser === user.id}
                          className="gap-1 hover:bg-teal-700 rounded-xl hover:text-white"
                        >
                          {processingUser === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MessageSquare className="h-4 w-4" />
                          )}
                          Chat
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}