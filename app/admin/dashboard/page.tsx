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
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Activity,
  Database,
  LogOut,
  Eye,
  Edit,
  Trash2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/admin/dashboard", active: true },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { icon: MessageSquare, label: "Reports Management", href: "/admin/reports" },
  { icon: Users, label: "Citizens", href: "/admin/citizens" },
  { icon: Camera, label: "CCTV Control", href: "/admin/cameras" },
  { icon: Shield, label: "Security", href: "/admin/security" },
  { icon: Database, label: "System Logs", href: "/admin/logs" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
]

const adminStats = [
  {
    title: "Total Citizens",
    value: "15,247",
    change: "+12% this month",
    icon: Users,
    color: "text-blue-400",
  },
  {
    title: "Active Reports",
    value: "89",
    change: "23 pending",
    icon: MessageSquare,
    color: "text-yellow-400",
  },
  {
    title: "System Health",
    value: "99.9%",
    change: "All systems operational",
    icon: Activity,
    color: "text-green-400",
  },
  {
    title: "Security Alerts",
    value: "3",
    change: "2 resolved today",
    icon: Shield,
    color: "text-red-400",
  },
]

const recentReports = [
  {
    id: 1,
    type: "Street Light",
    location: "Main St & 5th Ave",
    status: "pending",
    priority: "medium",
    citizen: "John Doe",
    date: "2024-01-15",
    time: "14:30",
  },
  {
    id: 2,
    type: "Pothole",
    location: "Oak Street",
    status: "in-progress",
    priority: "high",
    citizen: "Jane Smith",
    date: "2024-01-15",
    time: "12:15",
  },
  {
    id: 3,
    type: "Traffic Signal",
    location: "Downtown Plaza",
    status: "resolved",
    priority: "high",
    citizen: "Mike Johnson",
    date: "2024-01-14",
    time: "16:45",
  },
  {
    id: 4,
    type: "Graffiti",
    location: "Park Avenue",
    status: "pending",
    priority: "low",
    citizen: "Sarah Wilson",
    date: "2024-01-14",
    time: "09:20",
  },
]

const systemAlerts = [
  {
    id: 1,
    title: "High Traffic Volume",
    message: "Downtown area experiencing 40% above normal traffic",
    severity: "warning",
    time: "15 minutes ago",
  },
  {
    id: 2,
    title: "Camera Offline",
    message: "CCTV Camera #47 at Central Park is offline",
    severity: "error",
    time: "1 hour ago",
  },
  {
    id: 3,
    title: "System Update",
    message: "Security system updated successfully",
    severity: "success",
    time: "2 hours ago",
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

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-500/10 text-red-400 border-red-500/20"
    case "medium":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
    case "low":
      return "bg-green-500/10 text-green-400 border-green-500/20"
    default:
      return "bg-gray-500/10 text-gray-400 border-gray-500/20"
  }
}

export default function AdminDashboard() {
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
              <span className="text-xs ml-2 px-2 py-1 bg-red-500/20 text-red-400 rounded">ADMIN</span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search reports, citizens, systems..."
                className="pl-10 bg-[#0A0A0F] border-gray-700 text-white placeholder-gray-400 focus:border-[#00D4AA]"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-white hover:text-[#00D4AA] relative">
              <Bell className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </Button>
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">AD</span>
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
              <div className="text-sm text-gray-400 mb-2">Logged in as</div>
              <div className="text-lg font-semibold">Admin User</div>
              <div className="text-sm text-red-400">System Administrator</div>
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
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">System overview and management console</p>
          </motion.div>

          {/* Admin Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {adminStats.map((stat, index) => (
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
                    <div className="flex items-center text-green-400 text-sm">
                      <TrendingUp className="h-4 w-4 mr-1" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-gray-400 text-sm mb-1">{stat.title}</div>
                  <div className="text-xs text-[#00D4AA]">{stat.change}</div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* System Alerts */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-[#1A1A2E] border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">System Alerts</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-700 text-white hover:bg-[#0A0A0F] bg-transparent"
                  >
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {systemAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg bg-[#0A0A0F]/50">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          alert.severity === "error"
                            ? "bg-red-400"
                            : alert.severity === "warning"
                              ? "bg-yellow-400"
                              : "bg-green-400"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{alert.title}</div>
                        <div className="text-xs text-gray-400 mt-1">{alert.message}</div>
                        <div className="text-xs text-gray-500 mt-1">{alert.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="bg-[#1A1A2E] border-gray-800 p-6">
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Button className="w-full bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-black justify-start font-semibold">
                    <BarChart3 className="h-5 w-5 mr-3" />
                    View Analytics
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-gray-700 text-white hover:bg-[#0A0A0F] justify-start bg-transparent"
                  >
                    <Users className="h-5 w-5 mr-3" />
                    Manage Citizens
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-gray-700 text-white hover:bg-[#0A0A0F] justify-start bg-transparent"
                  >
                    <Shield className="h-5 w-5 mr-3" />
                    Security Center
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* System Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2"
            >
              <Card className="bg-[#1A1A2E] border-gray-800 p-6">
                <h2 className="text-xl font-bold mb-4">System Status</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Database</span>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <span className="text-sm text-green-400">Online</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">API Services</span>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <span className="text-sm text-green-400">Online</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">CCTV Network</span>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                        <span className="text-sm text-yellow-400">1 Offline</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Traffic System</span>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <span className="text-sm text-green-400">Online</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Emergency Services</span>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <span className="text-sm text-green-400">Online</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Backup Systems</span>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <span className="text-sm text-green-400">Ready</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Reports Management Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <Card className="bg-[#1A1A2E] border-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Recent Reports Management</h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-700 text-white hover:bg-[#0A0A0F] bg-transparent"
                >
                  Manage All
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 font-medium text-gray-400">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-400">Location</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-400">Citizen</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-400">Priority</th>
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
                        <td className="py-4 px-4 text-gray-400">{report.citizen}</td>
                        <td className="py-4 px-4">
                          <div
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(report.priority)}`}
                          >
                            <span className="capitalize">{report.priority}</span>
                          </div>
                        </td>
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
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="text-[#00D4AA] hover:text-[#00D4AA]/80">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-400/80">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-400/80">
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
