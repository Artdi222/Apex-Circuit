"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Menu,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  X,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Vehicles", href: "/vehicles" },
  { name: "Equipment", href: "/equipment" },
  { name: "Schedule", href: "/schedule" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, refreshUser, isInitialized } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      refreshUser();
    }
  }, [isInitialized, refreshUser]);

  const isHeroPage = pathname === "/";
  const isTransparent = isHeroPage && !isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b",
        isTransparent
          ? "bg-transparent border-transparent backdrop-blur-none"
          : "bg-white/95 border-gray-200 shadow-sm backdrop-blur-xl",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="transition-all">
            <div className="flex items-center gap-3 select-none">
              <img src="/Logo.svg" alt="Apex Circuit Logo" className="h-8 w-8 transition-all" />
              <div className="flex flex-col -space-y-1.5 whitespace-nowrap">
                <span className={cn("text-xl font-black tracking-tighter italic transition-colors duration-300", isTransparent ? "text-white group-hover:text-white/80" : "text-gray-900")}>
                  APEX
                </span>
                <span className={cn("text-[10px] font-bold tracking-[0.4em] uppercase ml-0.5", isTransparent ? "text-white/60" : "text-blue-600/60")}>
                  CIRCUIT
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-all rounded-xl relative overflow-hidden group",
                    isTransparent
                      ? isActive
                        ? "text-white bg-white/15"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                      : isActive
                        ? "text-blue-600 bg-blue-50/50"
                        : "text-gray-600 hover:text-blue-600 hover:bg-gray-50/50",
                  )}
                >
                  {link.name}
                  {isActive && (
                    <span
                      className={cn(
                        "absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                        isTransparent ? "bg-white" : "bg-blue-600",
                      )}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Auth & Mobile Toggle */}
          <div className="flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "relative h-10 w-10 rounded-xl p-0 transition-colors",
                      isTransparent
                        ? "hover:bg-white/10"
                        : "hover:bg-gray-100/50",
                    )}
                  >
                    <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                      <AvatarImage
                        src={
                          user?.avatar_url
                            ? user.avatar_url.startsWith("http")
                              ? user.avatar_url
                              : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/v1/uploads/${user.avatar_url}`
                            : ""
                        }
                        alt={user.username}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-[#2563EB]/10 text-[#2563EB] font-bold">
                        {user.username.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-64 p-2 rounded-2xl shadow-xl border-gray-100"
                  align="end"
                  sideOffset={12}
                >
                  <DropdownMenuLabel className="p-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {user.username}
                      </p>
                      <p className="text-xs text-gray-500 font-medium truncate">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-50" />
                  <div className="p-1 space-y-1">
                    <DropdownMenuItem
                      asChild
                      className="rounded-xl cursor-pointer py-2.5"
                    >
                      <Link href="/dashboard" className="flex items-center">
                        <LayoutDashboard className="mr-3 h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-700">
                          Dashboard
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="rounded-xl cursor-pointer py-2.5"
                    >
                      <Link href="/profile" className="flex items-center">
                        <UserIcon className="mr-3 h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-700">
                          My Profile
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator className="bg-gray-50" />
                  <div className="p-1">
                    <DropdownMenuItem
                      onClick={() => logout()}
                      className="rounded-xl cursor-pointer py-2.5 text-red-600 focus:bg-red-50 focus:text-red-600"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span className="font-medium">Sign Out</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  asChild
                  className={cn(
                    "rounded-xl font-semibold transition-all",
                    isTransparent
                      ? "text-white/90 hover:text-white hover:bg-white/10"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/50",
                  )}
                >
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button
                  className={cn(
                    "rounded-xl px-6 transition-all shadow-md active:scale-95 font-semibold",
                    isTransparent
                      ? "bg-white text-gray-900 hover:bg-white/90"
                      : "bg-gray-900 hover:bg-gray-800",
                  )}
                  asChild
                >
                  <Link href="/register">Join Now</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              className={cn(
                "lg:hidden h-10 w-10 p-0 rounded-xl",
                isTransparent ? "hover:bg-white/10" : "hover:bg-gray-100/50",
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X
                  className={cn(
                    "h-6 w-6",
                    isTransparent ? "text-white" : "text-gray-900",
                  )}
                />
              ) : (
                <Menu
                  className={cn(
                    "h-6 w-6",
                    isTransparent ? "text-white" : "text-gray-900",
                  )}
                />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-white border-b border-gray-100 shadow-xl overflow-hidden p-4">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl transition-all",
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50",
                    )}
                  >
                    <span className="font-bold text-lg">{link.name}</span>
                    <ChevronRight
                      className={cn(
                        "h-5 w-5",
                        isActive ? "text-blue-600" : "text-gray-300",
                      )}
                    />
                  </Link>
                );
              })}
              {!user && (
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    asChild
                    className="rounded-2xl h-14 font-bold border-gray-200"
                  >
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button
                    asChild
                    className="rounded-2xl h-14 font-bold bg-gray-900 hover:bg-gray-800"
                  >
                    <Link href="/register">Join Now</Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
