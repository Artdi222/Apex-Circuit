import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/shared/logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <header className="p-6">
        <Link href="/" className="transition-all">
          <Logo size="md" />
        </Link>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      <footer className="p-6 text-center text-[#6B7280] text-sm">
        &copy; {new Date().getFullYear()} Apex Circuit Rentals. All rights reserved.
      </footer>
    </div>
  );
}
