import { SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardOverview } from "@/components/widget/dokter/sections/dashboard-overview"
import { ConsultationSchedule } from "@/components/widget/dokter/sections/consultation-schedule"
import { ConsultationRoom } from "@/components/widget/dokter/sections/consultation-room"
import { PatientManagement } from "@/components/widget/dokter/sections/patient-management"
import { PatientHistory } from "@/components/widget/dokter/sections/patient-history"
import { PrescriptionManagement } from "@/components/widget/dokter/sections/prescription-management"
import { PracticeSchedule } from "@/components/widget/dokter/sections/practice-schedule"
import { Analytics } from "@/components/widget/dokter/sections/analytics"
import { ReviewsRatings } from "@/components/widget/dokter/sections/reviews-ratings"
import { FinancialReports } from "@/components/widget/dokter/sections/financial-reports"

interface DashboardContentProps {
  activeSection: string
  selectedPatient: any
  setSelectedPatient: (patient: any) => void
  setActiveSection: (section: string) => void
}

export function DashboardContent({
  activeSection,
  selectedPatient,
  setSelectedPatient,
  setActiveSection,
}: DashboardContentProps) {
  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardOverview />
      case "consultations":
        return <ConsultationSchedule />
      case "consultation-room":
        return <ConsultationRoom selectedPatient={selectedPatient} />
      case "patients":
        return <PatientManagement setSelectedPatient={setSelectedPatient} setActiveSection={setActiveSection} />
      case "patient-history":
        return <PatientHistory />
      case "prescriptions":
        return <PrescriptionManagement />
      case "schedule":
        return <PracticeSchedule />
      case "analytics":
        return <Analytics />
      case "reviews":
        return <ReviewsRatings />
      case "financial":
        return <FinancialReports />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center gap-4 border-b border-gray-300 px-6 py-6">
        <SidebarTrigger className="hover:bg-white hover:text-teal-600" />
        <h1 className="text-2xl font-semibold">
          {activeSection === "dashboard" && "Dashboard"}
          {activeSection === "consultations" && "Konsultasi Terjadwal"}
          {activeSection === "consultation-room" &&
            `Ruang Konsultasi${selectedPatient ? ` - ${selectedPatient.name}` : ""}`}
          {activeSection === "patients" && "Manajemen Pasien"}
          {activeSection === "patient-history" && "Riwayat Pasien"}
          {activeSection === "prescriptions" && "Resep & Rujukan"}
          {activeSection === "schedule" && "Jadwal Praktek"}
          {activeSection === "analytics" && "Analitik"}
          {activeSection === "reviews" && "Ulasan & Rating"}
          {activeSection === "financial" && "Laporan Keuangan"}
        </h1>
      </header>

      <div className="flex-1 overflow-auto p-6">{renderContent()}</div>
    </div>
  )
}
