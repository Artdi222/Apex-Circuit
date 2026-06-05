"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Car,
  ShieldCheck,
  History,
  AlertTriangle,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const menuItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Book a Session", href: "/bookings/new", icon: PlusCircle },
  { name: "My Bookings", href: "/bookings", icon: Calendar },
  { name: "Incident Reports", href: "/incidents", icon: AlertTriangle },
  { name: "Profile Settings", href: "/profile", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const { logout, user } = useAuth();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 bg-[#1C1C1E] text-white transition-all duration-300 hidden md:flex flex-col",
        isSidebarOpen ? "w-64" : "w-20",
      )}
    >
      <div
        className={cn(
          "h-16 flex items-center border-b border-[#2D2D2F] transition-all duration-300",
          isSidebarOpen ? "px-6" : "px-0 justify-center",
        )}
      >
        <Link href="/" className="flex items-center transition-all">
          <div className="flex items-center gap-3 select-none">
            <img src="/Logo.svg" alt="Apex Circuit Logo" className="h-10 w-10" />
            {isSidebarOpen && (
              <div className="flex flex-col -space-y-1.5 whitespace-nowrap animate-in fade-in duration-300">
                <span className="text-3xl font-black tracking-tighter italic text-white group-hover:text-blue-400 transition-colors">
                  APEX
                </span>
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase ml-0.5 text-white/60">
                  CIRCUIT
                </span>
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors group",
                isActive
                  ? "bg-[#2563EB] text-white"
                  : "text-[#9CA3AF] hover:bg-[#2D2D2F] hover:text-white",
              )}
              title={item.name}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isActive ? "text-white" : "group-hover:text-white",
                )}
              />
              {isSidebarOpen && (
                <span className="text-sm font-medium whitespace-nowrap">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-[#2D2D2F] space-y-1">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-[#9CA3AF] hover:bg-[#2D2D2F] hover:text-white transition-colors"
          title={isSidebarOpen ? "Collapse" : "Expand"}
        >
          {isSidebarOpen ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
          {isSidebarOpen && (
            <span className="text-sm font-medium">Collapse</span>
          )}
        </button>
        <button
          onClick={() => logout()}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-[#9CA3AF] hover:bg-red-500/10 hover:text-red-500 transition-colors"
          title="Log out"
        >
          <LogOut className="h-5 w-5" />
          {isSidebarOpen && (
            <span className="text-sm font-medium">Log out</span>
          )}
        </button>
      </div>
    </aside>
  );
}
