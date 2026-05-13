"use client"

import { useAuth } from "@/hooks/use-auth"
import { redirect } from "next/navigation"
import { ReactNode, useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Calendar,
  QrCode,
  Car,
  ShieldCheck,
  CalendarDays,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { Logo } from "@/components/shared/logo"

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Bookings", href: "/admin/bookings", icon: Calendar },
  { name: "Check-in", href: "/admin/check-in", icon: QrCode },
  { name: "Vehicles", href: "/admin/vehicles", icon: Car },
  { name: "Equipment", href: "/admin/equipment", icon: ShieldCheck },
  { name: "Schedules", href: "/admin/schedules", icon: CalendarDays },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, isInitialized, logout, refreshUser } = useAuth()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (!isInitialized) {
      refreshUser()
    }
  }, [isInitialized, refreshUser])

  if (!isInitialized || (isLoading && !user) || !isMounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "admin" && user.role !== "superadmin") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Nav Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-black text-white">
        <div className="flex items-center gap-2">
          <Logo size="sm" textClassName="text-white" />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white hover:bg-white/10"
        >
          {isSidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-black text-gray-400 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 flex flex-col shadow-2xl",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 flex flex-col gap-1 border-b border-white/10">
          <Logo size="lg" textClassName="text-white" />
          <span className="text-[10px] text-white/30 font-bold uppercase tracking-[0.4em] ml-[52px]">Management</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group",
                  isActive
                    ? "bg-white text-black shadow-lg"
                    : "hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive ? "text-black" : "group-hover:text-white")} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3 px-3 py-4 mb-4">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold">
              {user.username?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-white truncate">{user.username}</span>
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{user.role}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-white/60 hover:bg-red-500/10 hover:text-red-400 px-3 h-10"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex h-16 items-center justify-between px-8 bg-white border-b shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
             <span className="text-sm text-muted-foreground font-medium">
               {pathname === "/admin" ? "Overview" : navItems.find(n => pathname.startsWith(n.href))?.name || "Management"}
             </span>
          </div>
          <div className="flex items-center gap-4">
             {/* Add notifications or search here later */} 
          </div>
        </header>
        <div className="p-6 md:p-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  )
}
