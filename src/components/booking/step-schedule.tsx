'use client';

import React, { useState, useEffect } from 'react';
import { useBookingStore } from '@/stores/booking-store';
import { Button } from '@/components/ui/button';
import { api, unwrap } from '@/lib/api';
import { format } from 'date-fns';
import { TimeSlotGrid } from './time-slot-grid';
import { Loader2, ArrowRight, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useSettings } from '@/hooks/use-settings';

export function StepSchedule() {
  const { selectedSlotId, selectSlot, nextStep, participantsCount, setParticipantsCount } = useBookingStore();
  const { getSetting } = useSettings();
  const maxParticipants = getSetting('booking.max_participants', 6);
  
  const [date, setDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchSlots() {
      setIsLoading(true);
      try {
        const dateStr = format(date, 'yyyy-MM-dd');
        const response = await api.api.v1.schedules.get({ 
          query: { 
            date_from: dateStr,
            date_to: dateStr
          } 
        });
        const result = unwrap(response);
        let slotList: any[] = [];
        
        if (Array.isArray(result)) {
          slotList = result;
        } else if (result && typeof result === 'object') {
          slotList = (result as any).slots || (result as any).data || [];
        }
        
        const now = new Date();
        const isToday = format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
        
        let filteredSlots = Array.isArray(slotList) ? slotList : [];
        
        if (isToday) {
          filteredSlots = filteredSlots.filter(s => {
            const [hours, minutes] = s.end_time.split(':').map(Number);
            const slotEndTime = new Date(new Date(date).setHours(hours, minutes, 0, 0));
            return slotEndTime > now;
          });
        }
        
        setSlots(filteredSlots);
      } catch (error) {
        console.error('Failed to fetch slots:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSlots();
  }, [date]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl font-bold text-[#111827]">Select Session Time</h2>
        <p className="text-[#6B7280]">Choose an available time slot for your track session.</p>
      </div>

      <div className="bg-[#F8F9FA] p-4 rounded-lg border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-[#111827]">Number of Participants</h3>
          <p className="text-sm text-[#6B7280]">How many people are driving in this session?</p>
        </div>
        <div className={cn(
          "bg-white rounded-lg border border-[#E5E7EB] p-1.5",
          maxParticipants > 6 
            ? "grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2" 
            : "flex flex-wrap items-center gap-2"
        )}>
          {Array.from({ length: maxParticipants }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setParticipantsCount(num)}
              className={cn(
                "h-10 min-w-[40px] px-3 rounded-md text-sm font-bold transition-all flex items-center justify-center",
                participantsCount === num
                  ? "bg-[#1C1C1E] text-white shadow-md ring-2 ring-[#1C1C1E] ring-offset-1"
                  : "text-[#6B7280] hover:bg-[#F3F4F6] border border-transparent hover:border-[#E5E7EB]"
              )}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-start md:space-x-8 space-y-6 md:space-y-0">
        <div className="w-full md:w-auto">
           <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => d && setDate(d)}
            className="rounded-md border border-[#E5E7EB] shadow-sm"
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
          />
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-[#6B7280]" />
            <span className="text-sm font-medium text-[#111827]">
              Available slots for {format(date, 'PPP')}
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
            </div>
          ) : (
            <TimeSlotGrid 
              slots={slots} 
              selectedSlotId={selectedSlotId} 
              onSelect={selectSlot} 
              participantsCount={participantsCount}
            />
          )}
        </div>
      </div>

      <div className="pt-6 border-t border-[#E5E7EB] flex justify-end">
        <Button 
          onClick={nextStep} 
          disabled={!selectedSlotId}
          className="bg-[#1C1C1E] text-white hover:bg-[#2D2D2F]"
        >
          Next Step
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
