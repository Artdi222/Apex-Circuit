import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ 
  className, 
  iconClassName, 
  textClassName, 
  showText = true,
  size = 'md' 
}: LogoProps) {
  const sizes = {
    sm: { icon: 'h-6 w-6', text: 'text-lg' },
    md: { icon: 'h-8 w-8', text: 'text-xl' },
    lg: { icon: 'h-10 w-10', text: 'text-3xl' },
    xl: { icon: 'h-14 w-14', text: 'text-5xl' },
  };

  const gradientId = `logo-gradient-${size}`;

  return (
    <div className={cn("flex items-center gap-3 group select-none", className)}>
      <div 
        className={cn(
          sizes[size].icon,
          "relative flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3",
          iconClassName
        )}
      >
        {/* Sleek Racing Apex 'A' Logo */}
        <svg 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          {/* Main 'A' Structure - Sharp and Aggressive */}
          <path 
            d="M16 2L2 30H9L16 16L23 30H30L16 2Z" 
            fill={`url(#${gradientId})`} 
            className="transition-all duration-300"
          />
          
          {/* Dynamic Internal Cutout */}
          <path 
            d="M16 16L12 24H20L16 16Z" 
            fill="white" 
            className="opacity-90"
          />

          {/* Speed Accent */}
          <rect 
            x="13" 
            y="26" 
            width="6" 
            height="1.5" 
            rx="0.75" 
            fill="white" 
            fillOpacity="0.5"
            className="transition-all duration-500 group-hover:w-[10px] group-hover:translate-x-[-2px]"
          />
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col -space-y-1.5 flex-shrink-0 whitespace-nowrap">
          <span 
            className={cn(
              sizes[size].text,
              "font-black tracking-tighter transition-colors duration-300 group-hover:text-blue-600 italic",
              !textClassName && "text-gray-900",
              textClassName
            )}
          >
            APEX
          </span>
          <span className={cn(
            "text-[10px] font-bold tracking-[0.4em] uppercase ml-0.5",
            !textClassName ? "text-blue-600/60" : "text-white/60"
          )}>
            CIRCUIT
          </span>
        </div>
      )}
    </div>
  );
}
