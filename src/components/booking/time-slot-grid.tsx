'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Clock, Users } from 'lucide-react';

interface Slot {
  id: string;
  start_time: string;
  end_time: string;
  current_bookings: number;
  max_capacity: number;
  status: string;
  slot_type: 'open' | 'exclusive' | 'maintenance';
}

interface TimeSlotGridProps {
  slots: Slot[];
  selectedSlotId: string | null;
  onSelect: (id: string) => void;
  participantsCount?: number;
}

export function TimeSlotGrid({ 
  slots = [], 
  selectedSlotId, 
  onSelect, 
  participantsCount = 1 
}: TimeSlotGridProps) {
  if (!slots || slots.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-[#E5E7EB] rounded-lg">
        <p className="text-[#6B7280]">No available slots for this date.</p>
      </div>
    );
  }

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '--:--';
    // Handle HH:mm:ss and HH:mm
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  };

  const calculatePrice = (slot: Slot) => {
    const [startH, startM] = slot.start_time.split(':').map(Number);
    const [endH, endM] = slot.end_time.split(':').map(Number);
    const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    const durationHours = durationMinutes / 60;
    
    const baseRate = slot.slot_type === 'exclusive' ? 500 : 150;
    return baseRate * durationHours;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {slots.map((slot) => {
        if (!slot) return null;
        
        const isSelected = selectedSlotId === slot.id;
        const isFull = (slot.current_bookings || 0) + participantsCount > (slot.max_capacity || 0) || slot.status === 'full';
        const isBlocked = slot.status === 'blocked';
        const isDisabled = isFull || isBlocked;

        return (
          <button
            key={slot.id}
            disabled={isDisabled}
            onClick={() => onSelect(slot.id)}
            className={cn(
              'flex flex-col p-4 rounded-lg border-2 transition-all text-left group relative overflow-hidden',
              isSelected 
                ? 'border-[#2563EB] bg-blue-50/50' 
                : 'border-[#E5E7EB] hover:border-[#D1D5DB] bg-white',
              isDisabled && 'opacity-50 cursor-not-allowed bg-[#F8F9FA] border-[#E5E7EB]'
            )}
          >
            {slot.slot_type === 'exclusive' && (
              <div className="absolute top-0 right-0 bg-[#DB2777] text-white text-[9px] font-bold px-2 py-0.5 rounded-bl uppercase tracking-tighter">
                Exclusive Track
              </div>
            )}
            
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <Clock className={cn('h-4 w-4', isSelected ? 'text-[#2563EB]' : 'text-[#6B7280]')} />
                <span className={cn('font-bold', isSelected ? 'text-[#2563EB]' : 'text-[#111827]')}>
                  {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                </span>
              </div>
              <div className="text-right">
                <p className={cn('text-sm font-bold', isSelected ? 'text-[#2563EB]' : 'text-[#111827]')}>
                  ${calculatePrice(slot).toFixed(2)}
                </p>
                <p className="text-[10px] text-[#6B7280]">per driver</p>
              </div>
            </div>

            <div className="mt-auto pt-3 space-y-1.5">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-1 text-xs text-[#6B7280]">
                  <Users className="h-3 w-3" />
                  <span>{slot.current_bookings || 0} / {slot.max_capacity || 0} drivers</span>
                </div>
                <span className={cn(
                  'text-[10px] font-bold uppercase tracking-tight',
                  isFull ? 'text-[#DC2626]' : isBlocked ? 'text-[#6B7280]' : 'text-[#16A34A]'
                )}>
                  {isFull ? 'Full' : isBlocked ? 'Blocked' : 'Available'}
                </span>
              </div>
              {slot.slot_type === 'exclusive' && (
                <p className="text-[10px] text-[#DB2777] font-bold">
                  ★ Exclusive Track: Private session booking
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
