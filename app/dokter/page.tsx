"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/widget/dokter/sidebar"
import { DashboardContent } from "@/components/widget/dokter/dashboard-content"
import { RoleGuard } from "@/components/auth/role-guard"
import { useAuth } from "@/context/auth-context" 

export default function DoctorDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const { user, loading } = useAuth()

  return (
    <RoleGuard allowedRoles={['dokter']}>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full bg-white text-black">
          <AppSidebar 
            activeSection={activeSection} 
            setActiveSection={setActiveSection} 
          />
          <main className="flex-1 overflow-hidden">
            <DashboardContent
              activeSection={activeSection}
              selectedPatient={selectedPatient}
              setSelectedPatient={setSelectedPatient}
              setActiveSection={setActiveSection}
            />
          </main>
        </div>
      </SidebarProvider>
    </RoleGuard>
  )
}
