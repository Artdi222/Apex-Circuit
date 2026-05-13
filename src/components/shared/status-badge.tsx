import React from 'react';
import { cn } from '@/lib/utils';

type StatusType = 
  | 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'no_show'
  | 'available' | 'full' | 'blocked'
  | 'new' | 'good' | 'fair' | 'needs_replacement'
  | 'open' | 'investigating' | 'resolved' | 'dismissed'
  | 'gt' | 'touring' | 'formula' | 'drift' | 'endurance';

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  // Booking Status
  pending: 'bg-[#FEF3C7] text-[#D97706]',
  confirmed: 'bg-[#DCFCE7] text-[#16A34A]',
  checked_in: 'bg-[#DBEAFE] text-[#2563EB]',
  completed: 'bg-[#F1F3F5] text-[#111827]',
  cancelled: 'bg-[#FEE2E2] text-[#DC2626]',
  no_show: 'bg-[#FEE2E2] text-[#DC2626]',

  // Slot Status
  available: 'bg-[#DCFCE7] text-[#16A34A]',
  full: 'bg-[#FEE2E2] text-[#DC2626]',
  blocked: 'bg-[#F1F3F5] text-[#6B7280]',

  // Condition
  new: 'bg-[#DCFCE7] text-[#16A34A]',
  good: 'bg-[#DBEAFE] text-[#2563EB]',
  fair: 'bg-[#FEF3C7] text-[#D97706]',
  needs_replacement: 'bg-[#FEE2E2] text-[#DC2626]',

  // Incident Status
  open: 'bg-[#FEE2E2] text-[#DC2626]',
  investigating: 'bg-[#FEF3C7] text-[#D97706]',
  resolved: 'bg-[#DCFCE7] text-[#16A34A]',
  dismissed: 'bg-[#F1F3F5] text-[#6B7280]',

  // Vehicle Special Status
  on_track: 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]',
  in_use: 'bg-[#DBEAFE] text-[#2563EB]',
  out_of_stock: 'bg-gray-100 text-gray-500 border border-gray-200',

  // Slot Type
  track_open: 'bg-[#DBEAFE] text-[#2563EB]',
  track_exclusive: 'bg-[#FDF2F8] text-[#DB2777]',
  maintenance: 'bg-[#F1F3F5] text-[#6B7280]',
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const normalizedStatus = (status || '').toLowerCase().replace(/ /g, '_');
  const styleClass = statusStyles[normalizedStatus] || 'bg-gray-100 text-gray-800';

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight whitespace-nowrap w-fit',
      styleClass,
      className
    )}>
      {label || (status || '').replace(/_/g, ' ')}
    </span>
  );
}
