"use client";

import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUIStore } from "@/stores/ui-store";
import { Menu, Bell, Search, User as UserIcon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export function Topbar() {
  const { user, logout } = useAuth();
  const { toggleMobileNav } = useUIStore();

  return (
    <header className="h-16 border-b border-[#E5E7EB] bg-white sticky top-0 z-40">
      <div className="h-full px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2"
            onClick={toggleMobileNav}
          >
            <Menu className="h-6 w-6 text-[#111827]" />
          </Button>

          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search bookings..."
              className="pl-10 pr-4 py-1.5 rounded-md border border-[#E5E7EB] bg-[#F8F9FA] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 w-64 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-[#6B7280] hover:text-[#111827]"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-[#DC2626] border-2 border-white" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="p-1 h-auto flex items-center space-x-3"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-bold text-[#111827] leading-none">
                    {user?.username}
                  </p>
                </div>
                <Avatar className="h-9 w-9 border border-[#E5E7EB]">
                  <AvatarImage
                    src={
                      user?.avatar_url
                        ? user.avatar_url.startsWith("http")
                          ? user.avatar_url
                          : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/v1/uploads/${user.avatar_url}`
                        : ""
                    }
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-[#2563EB]/10 text-[#2563EB] font-bold">
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.username}
                  </p>
                  <p className="text-xs leading-none text-[#6B7280]">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout()}
                className="text-[#DC2626] cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
