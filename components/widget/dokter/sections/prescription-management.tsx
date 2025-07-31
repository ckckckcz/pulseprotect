"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Pill, FileText, Download, Send, Calendar } from "lucide-react"

export function PrescriptionManagement() {
  const [selectedPatient, setSelectedPatient] = useState("")
  const [medicines, setMedicines] = useState([{ name: "", dosage: "", frequency: "", duration: "" }])

  const prescriptions = [
    {
      id: 1,
      patient: "Siti Nurhaliza",
      date: "2024-01-15",
      medicines: [
        { name: "Paracetamol 500mg", dosage: "1 tablet", frequency: "3x sehari", duration: "5 hari" },
        { name: "Vitamin B Complex", dosage: "1 tablet", frequency: "1x sehari", duration: "30 hari" },
      ],
      status: "sent",
      notes: "Diminum setelah makan",
    },
    {
      id: 2,
      patient: "Budi Santoso",
      date: "2024-01-10",
      medicines: [
        { name: "Metformin 500mg", dosage: "1 tablet", frequency: "2x sehari", duration: "30 hari" },
        { name: "Glimepiride 2mg", dosage: "1 tablet", frequency: "1x sehari", duration: "30 hari" },
      ],
      status: "active",
      notes: "Kontrol gula darah rutin",
    },
  ]

  const referrals = [
    {
      id: 1,
      patient: "Maria Gonzalez",
      date: "2024-01-12",
      type: "Lab Test",
      destination: "Lab Kimia Farma",
      tests: ["Gula Darah Puasa", "HbA1c", "Kolesterol"],
      status: "pending",
    },
    {
      id: 2,
      patient: "Ahmad Rizki",
      date: "2024-01-08",
      type: "Specialist",
      destination: "Dr. Cardiologist - RS Harapan",
      reason: "Konsultasi jantung",
      status: "completed",
    },
  ]

  const addMedicine = () => {
    setMedicines([...medicines, { name: "", dosage: "", frequency: "", duration: "" }])
  }

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index))
  }

  const updateMedicine = (index: number, field: string, value: string) => {
    const updated = medicines.map((med, i) => (i === index ? { ...med, [field]: value } : med))
    setMedicines(updated)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Resep & Rujukan</h2>
          <p className="text-muted-foreground">Kelola resep obat dan rujukan pasien</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Pill className="h-4 w-4 mr-2" />
                Tulis Resep
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Tulis Resep Digital</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Pilih Pasien</label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih pasien..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="siti">Siti Nurhaliza</SelectItem>
                      <SelectItem value="budi">Budi Santoso</SelectItem>
                      <SelectItem value="maria">Maria Gonzalez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Daftar Obat</label>
                    <Button variant="outline" size="sm" onClick={addMedicine}>
                      <Plus className="h-4 w-4 mr-1" />
                      Tambah Obat
                    </Button>
                  </div>

                  {medicines.map((medicine, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <Input
                          placeholder="Nama obat"
                          value={medicine.name}
                          onChange={(e) => updateMedicine(index, "name", e.target.value)}
                        />
                        <Input
                          placeholder="Dosis (misal: 1 tablet)"
                          value={medicine.dosage}
                          onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                        />
                        <Input
                          placeholder="Frekuensi (misal: 3x sehari)"
                          value={medicine.frequency}
                          onChange={(e) => updateMedicine(index, "frequency", e.target.value)}
                        />
                        <Input
                          placeholder="Durasi (misal: 7 hari)"
                          value={medicine.duration}
                          onChange={(e) => updateMedicine(index, "duration", e.target.value)}
                        />
                      </div>
                      {medicines.length > 1 && (
                        <Button variant="destructive" size="sm" className="mt-2" onClick={() => removeMedicine(index)}>
                          Hapus
                        </Button>
                      )}
                    </Card>
                  ))}
                </div>

                <div>
                  <label className="text-sm font-medium">Catatan Tambahan</label>
                  <Textarea placeholder="Aturan pakai, peringatan, atau instruksi khusus..." />
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Send className="h-4 w-4 mr-2" />
                    Kirim Resep
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Buat Rujukan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Buat Rujukan</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Pilih Pasien</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih pasien..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="siti">Siti Nurhaliza</SelectItem>
                      <SelectItem value="budi">Budi Santoso</SelectItem>
                      <SelectItem value="maria">Maria Gonzalez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Jenis Rujukan</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis rujukan..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lab">Pemeriksaan Lab</SelectItem>
                      <SelectItem value="specialist">Dokter Spesialis</SelectItem>
                      <SelectItem value="hospital">Rumah Sakit</SelectItem>
                      <SelectItem value="radiology">Radiologi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Tujuan Rujukan</label>
                  <Input placeholder="Nama rumah sakit/klinik/lab..." />
                </div>

                <div>
                  <label className="text-sm font-medium">Alasan Rujukan</label>
                  <Textarea placeholder="Jelaskan alasan rujukan..." />
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Send className="h-4 w-4 mr-2" />
                    Kirim Rujukan
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="prescriptions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="prescriptions">Resep ({prescriptions.length})</TabsTrigger>
          <TabsTrigger value="referrals">Rujukan ({referrals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="prescriptions" className="space-y-4">
          {prescriptions.map((prescription) => (
            <Card key={prescription.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Pill className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{prescription.patient}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(prescription.date).toLocaleDateString("id-ID")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={prescription.status === "active" ? "default" : "secondary"}>
                      {prescription.status === "active" ? "Aktif" : "Terkirim"}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Daftar Obat:</h4>
                    <div className="space-y-2">
                      {prescription.medicines.map((medicine, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div>
                            <p className="font-medium">{medicine.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {medicine.dosage} • {medicine.frequency} • {medicine.duration}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {prescription.notes && (
                    <div>
                      <h4 className="font-medium mb-1">Catatan:</h4>
                      <p className="text-sm text-muted-foreground">{prescription.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4">
          {referrals.map((referral) => (
            <Card key={referral.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{referral.patient}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(referral.date).toLocaleDateString("id-ID")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={referral.status === "completed" ? "default" : "secondary"}>
                      {referral.status === "completed" ? "Selesai" : "Pending"}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Jenis: </span>
                    <span className="text-muted-foreground">{referral.type}</span>
                  </div>
                  <div>
                    <span className="font-medium">Tujuan: </span>
                    <span className="text-muted-foreground">{referral.destination}</span>
                  </div>
                  {referral.tests && (
                    <div>
                      <span className="font-medium">Pemeriksaan: </span>
                      <span className="text-muted-foreground">{referral.tests.join(", ")}</span>
                    </div>
                  )}
                  {referral.reason && (
                    <div>
                      <span className="font-medium">Alasan: </span>
                      <span className="text-muted-foreground">{referral.reason}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
