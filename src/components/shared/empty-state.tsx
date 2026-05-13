import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ 
  title, 
  description, 
  icon: Icon, 
  actionLabel, 
  actionHref 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-dashed border-[#E5E7EB] rounded-lg">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F8F9FA] mb-4">
        <Icon className="h-8 w-8 text-[#9CA3AF]" />
      </div>
      <h3 className="text-lg font-bold text-[#111827]">{title}</h3>
      <p className="text-[#6B7280] mt-1 max-w-xs mx-auto text-sm">{description}</p>
      {actionLabel && actionHref && (
        <Button asChild className="mt-6 bg-[#1C1C1E] text-white hover:bg-[#2D2D2F]">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
