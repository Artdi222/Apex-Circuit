"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { useSettings } from "@/hooks/use-settings";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { getSetting } = useSettings();
  const siteName = getSetting("site.name", "APEX Circuit Rentals");
  const siteDesc = getSetting(
    "site.description",
    "Premium racing track rentals, vehicle fleet management, and professional equipment for the ultimate racing experience.",
  );

  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6">
              <Logo size="sm" />
            </div>
            <p className="text-gray-500 max-w-sm leading-relaxed text-sm">
              {siteDesc}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-6 uppercase tracking-wider text-[10px]">
              Platform
            </h4>
            <ul className="space-y-4">
              {[
                { name: "Vehicles", href: "/vehicles" },
                { name: "Equipment", href: "/equipment" },
                { name: "Schedule", href: "/schedule" },
                { name: "About Us", href: "#" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-6 uppercase tracking-wider text-[10px]">
              Support
            </h4>
            <ul className="space-y-4">
              {[
                { name: "Contact", href: "#" },
                { name: "FAQ", href: "#" },
                { name: "Terms of Service", href: "#" },
                { name: "Privacy Policy", href: "#" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-medium text-gray-400">
            © {currentYear} {siteName}. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link
              href="#"
              className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
