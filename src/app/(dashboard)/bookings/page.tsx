'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { api, unwrap } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, ArrowRight, Filter, Search } from 'lucide-react';
import Link from 'next/link';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const response = await api.api.v1.bookings.get();
        const result = unwrap(response);
        const bookingList = Array.isArray(result) 
          ? result 
          : (result as any)?.bookings || (result as any)?.data || [];
        setBookings(Array.isArray(bookingList) ? bookingList : []);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBookings();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader 
        title="My Bookings" 
        description="View and manage your past and upcoming track sessions."
      />

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
          <input 
            type="text" 
            placeholder="Search bookings..." 
            className="pl-10 pr-4 py-2 rounded-md border border-[#E5E7EB] bg-white text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
          />
        </div>
        <Button variant="outline" className="border-[#D1D5DB] text-[#111827]">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed border-[#E5E7EB] rounded-lg">
          <Calendar className="h-12 w-12 text-[#9CA3AF] mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#111827]">No bookings found</h3>
          <p className="text-[#6B7280] mt-1">You haven't booked any track sessions yet.</p>
          <Button asChild className="mt-6 bg-[#2563EB] text-white hover:bg-[#1D4ED8]">
            <Link href="/bookings/new">Book a Session</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center p-6 space-y-4 md:space-y-0">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Date & Time</p>
                      <p className="font-bold text-[#111827]">
                        {booking.schedule_slot?.date ? new Date(booking.schedule_slot.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : booking.slot_date || 'TBD'}
                      </p>
                      <p className="text-sm text-[#6B7280]">
                        {booking.schedule_slot?.start_time?.substring(0, 5) || booking.slot_start_time?.substring(0, 5) || '--:--'} - {booking.schedule_slot?.end_time?.substring(0, 5) || booking.slot_end_time?.substring(0, 5) || '--:--'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Vehicle</p>
                      <p className="font-medium text-[#111827]">
                        {booking.vehicle ? booking.vehicle.model : booking.vehicle_name || 'Own Vehicle'}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        {booking.vehicle ? 'Rented' : 'Driver-owned'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Status</p>
                      <div className="pt-1">
                        <StatusBadge status={booking.status} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right mr-4 hidden md:block">
                      <p className="text-xs text-[#6B7280]">Total Price</p>
                      <p className="font-bold text-[#111827]">${booking.total_price}</p>
                    </div>
                    <Button variant="outline" asChild className="border-[#D1D5DB] text-[#111827] hover:bg-[#F1F3F5]">
                      <Link href={`/bookings/${booking.id}`}>
                        Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
