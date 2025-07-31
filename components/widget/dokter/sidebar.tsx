"use client"

import {
  Calendar,
  Users,
  FileText,
  Clock,
  BarChart3,
  Star,
  DollarSign,
  Settings,
  Home,
  Stethoscope,
  Pill,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    id: "dashboard",
  },
  {
    title: "Manajemen Pasien",
    icon: Users,
    id: "patients",
  },
  {
    title: "Riwayat Pasien",
    icon: FileText,
    id: "patient-history",
  },
  // {
  //   title: "Resep & Rujukan",
  //   icon: Pill,
  //   id: "prescriptions",
  // },
  // {
  //   title: "Analitik",
  //   icon: BarChart3,
  //   id: "analytics",
  // },
  {
    title: "Ulasan & Rating",
    icon: Star,
    id: "reviews",
  },
  {
    title: "Laporan Keuangan",
    icon: DollarSign,
    id: "financial",
  },
]

interface AppSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

export function AppSidebar({ activeSection, setActiveSection }: AppSidebarProps) {
  return (
    <Sidebar className="border-r border-gray-300">
      <SidebarHeader className="border-b border-gray-300 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">MediCare Pro</h2>
            <p className="text-sm text-muted-foreground">Dashboard Dokter</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton isActive={activeSection === item.id} onClick={() => setActiveSection(item.id)}>
                    <item.icon className="h-7 w-7" />
                    <span className="text-md">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-300 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback>DR</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Dr. Ahmad Wijaya</p>
            <p className="text-xs text-muted-foreground truncate">Dokter Umum</p>
          </div>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
