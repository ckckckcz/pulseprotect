"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Plus, Eye, Edit, Calendar, Phone, Mail, MapPin, MessageSquare } from "lucide-react"

interface PatientManagementProps {
  setSelectedPatient: (patient: any) => void
  setActiveSection: (section: string) => void
}

export function PatientManagement({ setSelectedPatient, setActiveSection }: PatientManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Add handleStartConsultation function
  const handleStartConsultation = (patient: any) => {
    setSelectedPatient(patient)
    setActiveSection("consultation-room")
  }

  const patients = [
    {
      id: 1,
      name: "Siti Nurhaliza",
      age: 28,
      gender: "Perempuan",
      phone: "081234567890",
      email: "siti.nurhaliza@email.com",
      lastVisit: "2024-01-15",
      status: "active",
      condition: "Hipertensi",
    },
    {
      id: 2,
      name: "Budi Santoso",
      age: 45,
      gender: "Laki-laki",
      phone: "081234567891",
      lastVisit: "2024-01-10",
      status: "active",
      condition: "Diabetes",
    },
    {
      id: 3,
      name: "Maria Gonzalez",
      age: 32,
      gender: "Perempuan",
      phone: "081234567892",
      email: "maria.gonzalez@email.com",
      lastVisit: "2024-01-08",
      status: "inactive",
      condition: "Kehamilan",
    },
    {
      id: 4,
      name: "Ahmad Rizki",
      age: 38,
      gender: "Laki-laki",
      phone: "081234567893",
      email: "ahmad.rizki@email.com",
      lastVisit: "2024-01-12",
      status: "active",
      condition: "Asma",
    },
  ]

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    return status === "active" ? "default" : "secondary"
  }

  const getStatusText = (status: string) => {
    return status === "active" ? "Aktif" : "Tidak Aktif"
  }

  return (
    <div className="space-y-6 ">
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
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                <TableHead>Pasien</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Kondisi</TableHead>
                <TableHead>Kunjungan Terakhir</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`/placeholder.svg?height=32&width=32&query=${patient.name}`} />
                        <AvatarFallback>
                          {patient.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {patient.age} tahun, {patient.gender}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {patient.phone}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {patient.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="text-black">{patient.condition}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {new Date(patient.lastVisit).toLocaleDateString("id-ID")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(patient.status)}>{getStatusText(patient.status)}</Badge>
                  </TableCell>
                  <TableCell>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleStartConsultation(patient)}
                        className="gap-1 hover:bg-teal-700 rounded-xl hover:text-white"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Chat
                      </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
