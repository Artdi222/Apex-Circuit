import React from 'react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-zinc-50 dark:bg-zinc-950 font-sans">
      {/* Left side: Hero/Brand Panel (Desktop only) */}
      <div className="hidden lg:flex lg:col-span-5 relative bg-zinc-950 text-white flex-col justify-between p-12 overflow-hidden border-r border-zinc-900">
        {/* High tech grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
        
        {/* Neon blue and violet gradient glow orbs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600 rounded-full blur-[128px] opacity-25 pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600 rounded-full blur-[128px] opacity-25 pointer-events-none" />

        {/* Top: Logo & Title */}
        <div className="relative z-10">
          <Link href="/" className="inline-block transition-all hover:opacity-90">
            <div className="flex items-center gap-3 select-none">
              <img src="/Logo.svg" alt="Apex Circuit Logo" className="h-9 w-9 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              <div className="flex flex-col -space-y-1.5 whitespace-nowrap">
                <span className="text-2xl font-black tracking-tighter italic text-white">APEX</span>
                <span className="text-[11px] font-bold tracking-[0.4em] uppercase ml-0.5 text-blue-400">CIRCUIT</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Middle: Value Proposition */}
        <div className="relative z-10 space-y-4 my-auto">
          <h1 className="text-4xl font-extrabold tracking-tight leading-none xl:text-5xl bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Feel the Apex.
          </h1>
          <p className="text-base text-zinc-400 max-w-md leading-relaxed">
            Reserve your slot on the world's most challenging track layouts. Access live telemetry, schedule coaching sessions, and manage your track vehicles in one unified workspace.
          </p>
        </div>

        {/* Bottom: Stats */}
        <div className="relative z-10 border-t border-zinc-900 pt-8 mt-auto">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-2xl font-black text-white">5+</p>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Vechicle Classes</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">6</p>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Session Max</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">24/7</p>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Available Bookings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Auth Form Content */}
      <div className="col-span-12 lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 lg:p-16 relative">
        {/* Subtle grid pattern background for the form area */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

        {/* Mobile Header: Logo & Title (Visible on lg and below) */}
        <div className="lg:hidden flex items-center justify-between w-full mb-8 relative z-10">
          <Link href="/" className="transition-all hover:opacity-90">
            <div className="flex items-center gap-2 select-none">
              <img src="/Logo.svg" alt="Apex Circuit Logo" className="h-7 w-7" />
              <div className="flex flex-col -space-y-1.5 whitespace-nowrap">
                <span className="text-lg font-black tracking-tighter italic text-zinc-900 dark:text-white">APEX</span>
                <span className="text-[9px] font-bold tracking-[0.4em] uppercase ml-0.5 text-blue-600 dark:text-blue-400">CIRCUIT</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Main Content Area */}
        <div className="my-auto flex items-center justify-center relative z-10 w-full">
          <div className="w-full max-w-[440px] animate-fade-up">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-8 relative z-10">
          &copy; {new Date().getFullYear()} Apex Circuit Rentals. All rights reserved.
        </div>
      </div>
    </div>
  );
}

