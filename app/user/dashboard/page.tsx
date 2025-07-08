"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import {
  Menu,
  X,
  Home,
  MessageSquare,
  Camera,
  Settings,
  Bell,
  Search,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  Eye,
  LogOut,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/user/dashboard", active: true },
  { icon: MessageSquare, label: "Report Issue", href: "/user/reports" },
  { icon: Camera, label: "Live Cameras", href: "/user/cameras" },
  { icon: MapPin, label: "City Services", href: "/user/services" },
  { icon: Bell, label: "Notifications", href: "/user/notifications" },
  { icon: Settings, label: "Settings", href: "/user/settings" },
]

const quickStats = [
  {
    title: "My Reports",
    value: "12",
    change: "+3 this month",
    icon: MessageSquare,
    color: "text-blue-400",
  },
  {
    title: "Service Requests",
    value: "8",
    change: "+1 pending",
    icon: Settings,
    color: "text-green-400",
  },
  {
    title: "Notifications",
    value: "24",
    change: "5 unread",
    icon: Bell,
    color: "text-[#00D4AA]",
  },
  {
    title: "Community Events",
    value: "6",
    change: "2 upcoming",
    icon: Calendar,
    color: "text-purple-400",
  },
]

const recentReports = [
  {
    id: 1,
    type: "Street Light",
    location: "Main St & 5th Ave",
    status: "resolved",
    date: "2024-01-15",
    time: "14:30",
  },
  {
    id: 2,
    type: "Pothole",
    location: "Oak Street",
    status: "in-progress",
    date: "2024-01-15",
    time: "12:15",
  },
  {
    id: 3,
    type: "Traffic Signal",
    location: "Downtown Plaza",
    status: "pending",
    date: "2024-01-14",
    time: "16:45",
  },
]

const notifications = [
  {
    id: 1,
    title: "Report Update",
    message: "Your street light report has been resolved",
    time: "2 hours ago",
    type: "success",
  },
  {
    id: 2,
    title: "Community Event",
    message: "Town Hall Meeting scheduled for next week",
    time: "1 day ago",
    type: "info",
  },
  {
    id: 3,
    title: "Service Alert",
    message: "Water maintenance scheduled in your area",
    time: "2 days ago",
    type: "warning",
  },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "resolved":
      return <CheckCircle className="h-4 w-4 text-green-400" />
    case "in-progress":
      return <Clock className="h-4 w-4 text-[#00D4AA]" />
    case "pending":
      return <AlertTriangle className="h-4 w-4 text-yellow-400" />
    default:
      return <AlertTriangle className="h-4 w-4 text-red-400" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "resolved":
      return "bg-green-400/10 text-green-400 border-green-400/20"
    case "in-progress":
      return "bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/20"
    case "pending":
      return "bg-yellow-400/10 text-yellow-400 border-yellow-400/20"
    default:
      return "bg-red-400/10 text-red-400 border-red-400/20"
  }
}

export default function UserDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Top Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1A1A2E] border-b border-gray-800 px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-white hover:text-[#00D4AA]"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="text-2xl font-bold">
              Smart<span className="text-[#00D4AA]">City</span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search city services..."
                className="pl-10 bg-[#0A0A0F] border-gray-700 text-white placeholder-gray-400 focus:border-[#00D4AA]"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-white hover:text-[#00D4AA] relative">
              <Bell className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-[#00D4AA] rounded-full"></span>
            </Button>
            <div className="w-8 h-8 bg-[#00D4AA] rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-black">JD</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:text-red-400">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </motion.nav>

      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -280 }}
          animate={{ x: sidebarOpen ? 0 : -280 }}
          className={`fixed lg:static inset-y-0 left-0 z-50 w-70 bg-[#1A1A2E] border-r border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-8 lg:hidden">
              <div className="text-xl font-bold">
                Smart<span className="text-[#00D4AA]">City</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="text-white hover:text-[#00D4AA]"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="mb-6">
              <div className="text-sm text-gray-400 mb-2">Welcome back,</div>
              <div className="text-lg font-semibold">John Doe</div>
              <div className="text-sm text-[#00D4AA]">Citizen</div>
            </div>

            <nav className="space-y-2">
              {sidebarItems.map((item, index) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                    item.active
                      ? "bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/20"
                      : "text-gray-400 hover:text-white hover:bg-[#0A0A0F]"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.a>
              ))}
            </nav>
          </div>
        </motion.aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:ml-0">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Citizen Dashboard</h1>
            <p className="text-gray-400">Welcome back! Here's your city activity overview.</p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {quickStats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="bg-[#1A1A2E] border-gray-800 p-6 hover:border-[#00D4AA]/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-gray-400 text-sm mb-1">{stat.title}</div>
                  <div className="text-xs text-[#00D4AA]">{stat.change}</div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-[#1A1A2E] border-gray-800 p-6">
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Button className="w-full bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-black justify-start font-semibold">
                    <Plus className="h-5 w-5 mr-3" />
                    Report Issue
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-gray-700 text-white hover:bg-[#0A0A0F] justify-start bg-transparent"
                  >
                    <Camera className="h-5 w-5 mr-3" />
                    View CCTV
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-gray-700 text-white hover:bg-[#0A0A0F] justify-start bg-transparent"
                  >
                    <MapPin className="h-5 w-5 mr-3" />
                    Find Services
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Recent Notifications */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="bg-[#1A1A2E] border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Notifications</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-700 text-white hover:bg-[#0A0A0F] bg-transparent"
                  >
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-start space-x-3 p-3 rounded-lg bg-[#0A0A0F]/50">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          notification.type === "success"
                            ? "bg-green-400"
                            : notification.type === "warning"
                              ? "bg-yellow-400"
                              : "bg-blue-400"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{notification.title}</div>
                        <div className="text-xs text-gray-400 mt-1">{notification.message}</div>
                        <div className="text-xs text-gray-500 mt-1">{notification.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* City Map */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="bg-[#1A1A2E] border-gray-800 p-6">
                <h2 className="text-xl font-bold mb-4">City Overview</h2>
                <div className="relative bg-[#0A0A0F] rounded-xl h-48 flex items-center justify-center border border-gray-800">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-[#00D4AA] mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Interactive map coming soon</p>
                  </div>
                  {/* Sample markers */}
                  <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-[#00D4AA] rounded-full animate-pulse"></div>
                  <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Recent Reports Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <Card className="bg-[#1A1A2E] border-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">My Recent Reports</h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-700 text-white hover:bg-[#0A0A0F] bg-transparent"
                >
                  View All
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 font-medium text-gray-400">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-400">Location</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-400">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentReports.map((report, index) => (
                      <motion.tr
                        key={report.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="border-b border-gray-800/50 hover:bg-[#0A0A0F]/50 transition-colors"
                      >
                        <td className="py-4 px-4 font-medium">{report.type}</td>
                        <td className="py-4 px-4 text-gray-400">{report.location}</td>
                        <td className="py-4 px-4">
                          <div
                            className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}
                          >
                            {getStatusIcon(report.status)}
                            <span className="capitalize">{report.status.replace("-", " ")}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-400">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {report.date}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Button variant="ghost" size="sm" className="text-[#00D4AA] hover:text-[#00D4AA]/80">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
