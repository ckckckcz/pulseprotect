"use client"

import { useEffect, useState } from "react"
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
  LogOut,
} from "lucide-react"
import { useRouter } from "next/navigation"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"

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
  const { user, logout } = useAuth()
  const router = useRouter()
  const [doctorName, setDoctorName] = useState("Dr.")
  const [specialty, setSpecialty] = useState("Dokter")
  const [email, setEmail] = useState("Dokter")
  const [avatarUrl, setAvatarUrl] = useState("/placeholder.svg?height=32&width=32")
  
  useEffect(() => {
    if (user) {
      setDoctorName(user.nama_lengkap || "Dr.")
      setEmail(user.email)
      
      // Get specialty from profile if available
      if (user.profile && user.profile.spesialis) {
        setSpecialty(user.profile.spesialis)
      }
      
      // Set avatar if available - access from both possible locations
      if (user.foto_profile) {
        setAvatarUrl(user.foto_profile);
      } else if (user.profile && user.profile.foto_profile) {
        setAvatarUrl(user.profile.foto_profile);
      }
    }
  }, [user])
  
  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      logout()
      router.push('/login')
    }
  }
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

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
          <Avatar className="h-8 w-8 border-2 border-teal-600">
            <AvatarImage src={avatarUrl} alt={doctorName} />
            <AvatarFallback>{getInitials(doctorName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{doctorName}</p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout} 
                  className="h-8 w-8 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Logout</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Keluar dari sistem</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
