'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { api, unwrap } from '@/lib/api';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/status-badge';
import { Loader2, Users, Clock, Calendar as CalendarIcon, Info } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

import { cn } from '@/lib/utils';

export default function PublicSchedulePage() {
  const [date, setDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        const slotList = Array.isArray(result) 
          ? result 
          : (result as any)?.slots || (result as any)?.data || [];
        setSlots(Array.isArray(slotList) ? slotList : []);
      } catch (error) {
        console.error('Failed to fetch slots:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSlots();
  }, [date]);

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Track Schedule" 
        description="Check availability and book your next session on the circuit."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="border-[#E5E7EB] shadow-sm sticky top-24">
            <CardHeader className="bg-[#F8F9FA] border-b border-[#E5E7EB]">
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Select Date</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                className="rounded-md"
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </CardContent>
            <div className="p-4 border-t border-[#E5E7EB] bg-blue-50 text-xs text-[#2563EB] flex items-start space-x-2">
              <Info className="h-4 w-4 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-semibold">Booking Information</p>
                <p>Open Track: Public session with other drivers.</p>
                <p>Exclusive Track: Private session booking.</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#111827] flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5 text-[#2563EB]" />
              {format(date, 'PPPP')}
            </h2>
            <StatusBadge status="track_open" label="Track Status: Open" />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-20 bg-white border border-dashed border-[#E5E7EB] rounded-lg">
              <p className="text-[#6B7280]">No sessions scheduled for this date.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {slots.map((slot) => (
                <Card 
                  key={slot.id} 
                  className={cn(
                    "border-[#E5E7EB] shadow-sm hover:shadow-md transition-all border-l-4",
                    slot.slot_type === 'exclusive' ? "border-l-pink-500" : "border-l-blue-500"
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5 text-[#6B7280]" />
                          <span className="text-lg font-bold text-[#111827]">
                            {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2 text-[#6B7280]">
                            <Users className="h-4 w-4" />
                            <span className="text-sm font-medium">{slot.current_bookings} / {slot.max_capacity} Drivers</span>
                          </div>
                          <StatusBadge 
                            status={`track_${slot.slot_type}`} 
                            label={slot.slot_type === 'exclusive' ? 'Exclusive Track' : 'Open Track'} 
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <StatusBadge status={slot.status} />
                        <Button 
                          asChild 
                          disabled={slot.status === 'full' || slot.status === 'blocked'} 
                          className={cn(
                            "text-white",
                            slot.slot_type === 'exclusive' ? "bg-pink-600 hover:bg-pink-700" : "bg-[#1C1C1E] hover:bg-[#2D2D2F]"
                          )}
                        >
                          <Link href="/bookings/new">Book Spot</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
