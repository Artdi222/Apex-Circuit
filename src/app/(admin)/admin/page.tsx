"use client"

import { StatsCard } from "@/components/admin/stats-card"
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  TrendingUp,
  Clock,
  QrCode,
  CalendarDays,
  Car,
  Settings
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function AdminDashboardPage() {
  const stats = [
    {
      title: "Total Revenue",
      value: "$12,450.00",
      description: "Since last month",
      icon: DollarSign,
      trend: { value: 12, label: "from last month", isPositive: true }
    },
    {
      title: "Active Bookings",
      value: "42",
      description: "Across all slots",
      icon: Calendar,
      trend: { value: 8, label: "from last week", isPositive: true }
    },
    {
      title: "Active Users",
      value: "1,240",
      description: "Registered drivers",
      icon: Users,
      trend: { value: 15, label: "from last month", isPositive: true }
    },
    {
      title: "Session Capacity",
      value: "78%",
      description: "Average utilization",
      icon: Activity,
      trend: { value: 2, label: "from last week", isPositive: false }
    }
  ]

  const recentBookings = [
    { id: "1", user: "John Doe", vehicle: "Porsche 911 GT3", date: "2024-05-10", status: "confirmed", amount: "$450" },
    { id: "2", user: "Jane Smith", vehicle: "Ferrari 488 Pista", date: "2024-05-10", status: "pending", amount: "$600" },
    { id: "3", user: "Mike Ross", vehicle: "Own Vehicle", date: "2024-05-11", status: "confirmed", amount: "$150" },
    { id: "4", user: "Sarah Connor", vehicle: "BMW M4 GT4", date: "2024-05-11", status: "checked_in", amount: "$520" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Recent Bookings Table Preview */}
        <Card className="md:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Bookings</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Latest activity across the circuit.</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/bookings">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 border border-transparent hover:border-gray-200 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center font-bold text-gray-500 group-hover:bg-white transition-colors">
                      {booking.user[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">{booking.user}</span>
                      <span className="text-xs text-gray-500">{booking.vehicle}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-bold text-gray-900">{booking.amount}</span>
                    <div className="flex items-center gap-1.5">
                      <div className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        booking.status === "confirmed" ? "bg-green-500" : 
                        booking.status === "pending" ? "bg-amber-500" : "bg-blue-500"
                      )}></div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {booking.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions / System Health */}
        <div className="md:col-span-3 space-y-6">
          <Card className="bg-black text-white border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white h-auto py-4 flex-col gap-2" asChild>
                <Link href="/admin/check-in">
                  <div className="flex flex-col items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    <span className="text-xs">Scan Ticket</span>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white h-auto py-4 flex-col gap-2" asChild>
                <Link href="/admin/schedules">
                  <div className="flex flex-col items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    <span className="text-xs">Manage Slots</span>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white h-auto py-4 flex-col gap-2" asChild>
                <Link href="/admin/vehicles/new">
                  <div className="flex flex-col items-center gap-2">
                    <Car className="h-5 w-5" />
                    <span className="text-xs">Add Vehicle</span>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white h-auto py-4 flex-col gap-2" asChild>
                <Link href="/admin/settings">
                  <div className="flex flex-col items-center gap-2">
                    <Settings className="h-5 w-5" />
                    <span className="text-xs">Settings</span>
                  </div>
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-400" />
                Live Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                  <Activity className="h-6 w-6 text-blue-500 animate-pulse" />
                </div>
                <h3 className="text-sm font-semibold">12 Active Drivers</h3>
                <p className="text-xs text-muted-foreground mt-1">Current session ends in 14:25</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
