"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Calendar, FileText, Pill, Activity, Eye } from "lucide-react"

export function PatientHistory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<any>(null)

  const patientHistory = [
    {
      id: 1,
      patient: "Siti Nurhaliza",
      consultations: [
        {
          date: "2024-01-15",
          complaint: "Sakit kepala berkepanjangan",
          diagnosis: "Tension headache",
          treatment: "Paracetamol 500mg 3x1",
          notes: "Pasien mengalami stress kerja. Disarankan istirahat cukup.",
        },
        {
          date: "2024-01-01",
          complaint: "Demam dan batuk",
          diagnosis: "ISPA",
          treatment: "Amoxicillin 500mg 3x1, OBH Combi",
          notes: "Kondisi membaik setelah 3 hari pengobatan.",
        },
      ],
      prescriptions: [
        {
          date: "2024-01-15",
          medicines: ["Paracetamol 500mg", "Vitamin B Complex"],
          status: "completed",
        },
      ],
    },
    {
      id: 2,
      patient: "Budi Santoso",
      consultations: [
        {
          date: "2024-01-10",
          complaint: "Kontrol diabetes rutin",
          diagnosis: "Diabetes Mellitus Type 2",
          treatment: "Metformin 500mg 2x1",
          notes: "Gula darah terkontrol. Lanjutkan diet dan olahraga.",
        },
      ],
      prescriptions: [
        {
          date: "2024-01-10",
          medicines: ["Metformin 500mg", "Glimepiride 2mg"],
          status: "active",
        },
      ],
    },
  ]

  const filteredHistory = patientHistory.filter((history) =>
    history.patient.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Riwayat Pasien</h2>
          <p className="text-muted-foreground">Lihat riwayat konsultasi dan pengobatan pasien</p>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari pasien..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-64 bg-white rounded-xl border border-gray-200"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredHistory.map((history) => (
          <Card key={history.id} className="bg-white rounded-xl border border-gray-200 text-black shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={`/placeholder.svg?height=40&width=40&query=${history.patient}`} />
                    <AvatarFallback>
                      {history.patient
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{history.patient}</h3>
                    <p className="text-sm text-muted-foreground">
                      {history.consultations.length} konsultasi • {history.prescriptions.length} resep
                    </p>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild className="bg-white rounded-xl border border-gray-200 text-black shadow-md hover:bg-teal-700 hover:text-white">
                    <Button onClick={() => setSelectedPatient(history)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Lihat Detail
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto bg-white rounded-2xl border border-gray-200 text-black shadow-md">
                    <DialogHeader>
                      <DialogTitle>Riwayat Lengkap - {history.patient}</DialogTitle>
                    </DialogHeader>

                    <Tabs defaultValue="consultations" className="space-y-4 ">
                      <TabsList className="bg-white">
                        <TabsTrigger value="consultations">Konsultasi</TabsTrigger>
                        <TabsTrigger value="prescriptions">Resep</TabsTrigger>
                        <TabsTrigger value="summary">Ringkasan</TabsTrigger>
                      </TabsList>

                      <TabsContent value="consultations" className="space-y-4">
                        {history.consultations.map((consultation, index) => (
                          <Card key={index} className="bg-white rounded-xl border border-gray-200 text-black shadow-md">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span className="font-medium">
                                    {new Date(consultation.date).toLocaleDateString("id-ID")}
                                  </span>
                                </div>
                                <Badge className="bg-white rounded-xl border border-gray-200 text-black shadow-md">Selesai</Badge>
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <label className="text-sm font-medium">Keluhan:</label>
                                  <p className="text-sm text-muted-foreground">{consultation.complaint}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Diagnosis:</label>
                                  <p className="text-sm text-muted-foreground">{consultation.diagnosis}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Pengobatan:</label>
                                  <p className="text-sm text-muted-foreground">{consultation.treatment}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Catatan:</label>
                                  <p className="text-sm text-muted-foreground">{consultation.notes}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </TabsContent>

                      <TabsContent value="prescriptions" className="space-y-4">
                        {history.prescriptions.map((prescription, index) => (
                          <Card key={index} className="bg-white rounded-xl border border-gray-200 text-black shadow-md">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Pill className="h-4 w-4" />
                                  <span className="font-medium">
                                    {new Date(prescription.date).toLocaleDateString("id-ID")}
                                  </span>
                                </div>
                                <Badge variant={prescription.status === "active" ? "default" : "secondary"}>
                                  {prescription.status === "active" ? "Aktif" : "Selesai"}
                                </Badge>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Obat:</label>
                                <ul className="text-sm text-muted-foreground mt-1">
                                  {prescription.medicines.map((medicine, idx) => (
                                    <li key={idx}>• {medicine}</li>
                                  ))}
                                </ul>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </TabsContent>

                      <TabsContent value="summary">
                        <Card className="bg-white rounded-xl border border-gray-200 text-black shadow-md">
                          <CardContent className="p-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <h4 className="font-medium mb-2">Statistik Konsultasi</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm">Total Konsultasi:</span>
                                    <span className="text-sm font-medium">{history.consultations.length}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm">Konsultasi Terakhir:</span>
                                    <span className="text-sm font-medium">
                                      {new Date(history.consultations[0]?.date).toLocaleDateString("id-ID")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Riwayat Pengobatan</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm">Total Resep:</span>
                                    <span className="text-sm font-medium">{history.prescriptions.length}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm">Resep Aktif:</span>
                                    <span className="text-sm font-medium">
                                      {history.prescriptions.filter((p) => p.status === "active").length}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Konsultasi Terakhir
                  </h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Tanggal:</strong> {new Date(history.consultations[0]?.date).toLocaleDateString("id-ID")}
                    </p>
                    <p>
                      <strong>Keluhan:</strong> {history.consultations[0]?.complaint}
                    </p>
                    <p>
                      <strong>Diagnosis:</strong> {history.consultations[0]?.diagnosis}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Status Pengobatan
                  </h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Resep Aktif:</strong> {history.prescriptions.filter((p) => p.status === "active").length}
                    </p>
                    <p>
                      <strong>Total Konsultasi:</strong> {history.consultations.length}
                    </p>
                    <p>
                      <strong>Kondisi Terakhir:</strong> Stabil
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
