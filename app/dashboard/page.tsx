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
  TrendingUp,
  Users,
  Shield,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard", active: true },
  { icon: MessageSquare, label: "Report Issue", href: "/dashboard/reports" },
  { icon: Camera, label: "Live Cameras", href: "/dashboard/cameras" },
  { icon: MapPin, label: "City Services", href: "/dashboard/services" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
]

const statsCards = [
  {
    title: "Total Reports",
    value: "1,247",
    change: "+12%",
    icon: MessageSquare,
    color: "text-blue-400",
  },
  {
    title: "Online Cameras",
    value: "486",
    change: "+2%",
    icon: Camera,
    color: "text-green-400",
  },
  {
    title: "Smart Lights Active",
    value: "2,891",
    change: "+8%",
    icon: Shield,
    color: "text-[#FF6A00]",
  },
  {
    title: "Active Citizens",
    value: "15.2K",
    change: "+24%",
    icon: Users,
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
  {
    id: 4,
    type: "Graffiti",
    location: "Park Avenue",
    status: "resolved",
    date: "2024-01-14",
    time: "09:20",
  },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "resolved":
      return <CheckCircle className="h-4 w-4 text-green-400" />
    case "in-progress":
      return <Clock className="h-4 w-4 text-[#FF6A00]" />
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
      return "bg-[#FF6A00]/10 text-[#FF6A00] border-[#FF6A00]/20"
    case "pending":
      return "bg-yellow-400/10 text-yellow-400 border-yellow-400/20"
    default:
      return "bg-red-400/10 text-red-400 border-red-400/20"
  }
}

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      {/* Top Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1A1A1A] border-b border-gray-800 px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-white hover:text-[#FF6A00]"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="text-2xl font-bold">
              Smart<span className="text-[#FF6A00]">City</span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#A1A1AA]" />
              <Input
                placeholder="Search city services..."
                className="pl-10 bg-[#0D0D0D] border-gray-700 text-white placeholder-[#A1A1AA] focus:border-[#FF6A00]"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-white hover:text-[#FF6A00] relative">
              <Bell className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-[#FF6A00] rounded-full"></span>
            </Button>
            <div className="w-8 h-8 bg-[#FF6A00] rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">JD</span>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -280 }}
          animate={{ x: sidebarOpen ? 0 : -280 }}
          className={`fixed lg:static inset-y-0 left-0 z-50 w-70 bg-[#1A1A1A] border-r border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-8 lg:hidden">
              <div className="text-xl font-bold">
                Smart<span className="text-[#FF6A00]">City</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="text-white hover:text-[#FF6A00]"
              >
                <X className="h-6 w-6" />
              </Button>
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
                      ? "bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/20"
                      : "text-[#A1A1AA] hover:text-white hover:bg-[#0D0D0D]"
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
            <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
            <p className="text-[#A1A1AA]">Welcome back! Here's what's happening in your city today.</p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {statsCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="bg-[#1A1A1A] border-gray-800 p-6 hover:border-[#FF6A00]/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div className="flex items-center text-green-400 text-sm">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {stat.change}
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-[#A1A1AA] text-sm">{stat.title}</div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Map Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <Card className="bg-[#1A1A1A] border-gray-800 p-6">
                <h2 className="text-xl font-bold mb-4">City Overview</h2>
                <div className="relative bg-[#0D0D0D] rounded-xl h-80 flex items-center justify-center border border-gray-800">
                  <img
                    src="/placeholder.svg?height=320&width=600"
                    alt="City Map"
                    className="w-full h-full object-cover rounded-xl opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-[#FF6A00] mx-auto mb-2" />
                      <p className="text-[#A1A1AA]">Interactive city map coming soon</p>
                    </div>
                  </div>
                  {/* Sample markers */}
                  <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-[#FF6A00] rounded-full animate-pulse"></div>
                  <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="bg-[#1A1A1A] border-gray-800 p-6">
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Button className="w-full bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white justify-start">
                    <MessageSquare className="h-5 w-5 mr-3" />
                    Report Issue
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-gray-700 text-white hover:bg-[#0D0D0D] justify-start bg-transparent"
                  >
                    <Camera className="h-5 w-5 mr-3" />
                    View CCTV
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-gray-700 text-white hover:bg-[#0D0D0D] justify-start bg-transparent"
                  >
                    <TrendingUp className="h-5 w-5 mr-3" />
                    System Stats
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Recent Reports Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <Card className="bg-[#1A1A1A] border-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Recent Reports</h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-700 text-white hover:bg-[#0D0D0D] bg-transparent"
                >
                  View All
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 font-medium text-[#A1A1AA]">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-[#A1A1AA]">Location</th>
                      <th className="text-left py-3 px-4 font-medium text-[#A1A1AA]">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-[#A1A1AA]">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-[#A1A1AA]">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentReports.map((report, index) => (
                      <motion.tr
                        key={report.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="border-b border-gray-800/50 hover:bg-[#0D0D0D]/50 transition-colors"
                      >
                        <td className="py-4 px-4 font-medium">{report.type}</td>
                        <td className="py-4 px-4 text-[#A1A1AA]">{report.location}</td>
                        <td className="py-4 px-4">
                          <div
                            className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}
                          >
                            {getStatusIcon(report.status)}
                            <span className="capitalize">{report.status.replace("-", " ")}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-[#A1A1AA]">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {report.date}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-[#A1A1AA]">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {report.time}
                          </div>
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
