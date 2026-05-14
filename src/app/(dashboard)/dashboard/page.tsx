'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Car, ShieldCheck, ArrowRight, PlusCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { api, unwrap } from '@/lib/api';
import { StatusBadge } from '@/components/shared/status-badge';
import { format } from 'date-fns';

export default function DashboardOverviewPage() {
  const { user, isInitialized } = useAuth();
  const [stats, setStats] = useState({
    upcoming: 0,
    total: 0,
    incidents: 0
  });
  const [upcomingBooking, setUpcomingBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!isInitialized || !user) return;
      
      setIsLoading(true);
      try {
        console.log('Fetching dashboard data for user:', user.email);
        
        // Fetch total bookings and upcoming bookings in parallel
        const [bookingsRes, upcomingRes] = await Promise.all([
          api.api.v1.bookings.get(),
          api.api.v1.bookings.upcoming.get()
        ]);
        
        const bookingsResult = unwrap(bookingsRes);
        const upcomingBookings = unwrap(upcomingRes);
        
        // Handle paginated response for total count
        const bookingsData = (bookingsResult as any)?.bookings ? (bookingsResult as any) : { bookings: bookingsResult, pagination: { total: Array.isArray(bookingsResult) ? bookingsResult.length : 0 } };
        const totalCount = bookingsData.pagination?.total || (bookingsData.bookings?.length || 0);
        
        setStats({
          upcoming: upcomingBookings.length,
          total: totalCount,
          incidents: 0
        });
        
        if (upcomingBookings.length > 0) {
          setUpcomingBooking(upcomingBookings[0]);
        } else {
          setUpcomingBooking(null);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, [isInitialized, user]);

  return (
    <div className="space-y-8">
      <PageHeader 
        title={`Welcome back, ${user?.username}`} 
        description="Here's what's happening with your track sessions."
      >
        <Button asChild className="bg-[#2563EB] text-white hover:bg-[#1D4ED8]">
          <Link href="/bookings/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Booking
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-[#E5E7EB] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-[#6B7280]">Upcoming Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-[#2563EB]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#111827]">{stats.upcoming}</div>
            <p className="text-xs text-[#6B7280] mt-1">Sessions booked and ready</p>
          </CardContent>
        </Card>
        
        <Card className="border-[#E5E7EB] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-[#6B7280]">Total Bookings</CardTitle>
            <Clock className="h-4 w-4 text-[#111827]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#111827]">{stats.total}</div>
            <p className="text-xs text-[#6B7280] mt-1">Lifetime sessions completed</p>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-[#6B7280]">Active Incidents</CardTitle>
            <ShieldCheck className="h-4 w-4 text-[#DC2626]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#111827]">{stats.incidents}</div>
            <p className="text-xs text-[#6B7280] mt-1">Pending resolutions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-[#E5E7EB] shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#111827]">Next Session</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingBooking ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-lg border border-[#E5E7EB]">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#111827]">
                      {upcomingBooking.schedule_slot?.date 
                        ? format(new Date(upcomingBooking.schedule_slot.date), 'EEEE, MMMM do')
                        : (upcomingBooking.slot_date ? format(new Date(upcomingBooking.slot_date), 'EEEE, MMMM do') : 'Unknown Date')}
                    </p>
                    <div className="flex items-center text-xs text-[#6B7280]">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>
                        {(upcomingBooking.schedule_slot?.start_time || upcomingBooking.slot_start_time)?.substring(0, 5)} - {(upcomingBooking.schedule_slot?.end_time || upcomingBooking.slot_end_time)?.substring(0, 5)}
                      </span>
                    </div>
                    {upcomingBooking.vehicle && (
                      <div className="flex items-center text-xs text-[#2563EB] mt-1">
                        <Car className="mr-1 h-3 w-3" />
                        <span>{upcomingBooking.vehicle.model}</span>
                      </div>
                    )}
                  </div>
                  <StatusBadge status={upcomingBooking.status} />
                </div>
                <Button variant="outline" asChild className="w-full border-[#D1D5DB] text-[#111827] hover:bg-[#F1F3F5]">
                  <Link href={`/bookings/${upcomingBooking.id}`}>
                    View Ticket & Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 bg-[#F8F9FA] rounded-lg border border-dashed border-[#E5E7EB]">
                <p className="text-[#6B7280] text-sm">No upcoming sessions.</p>
                <Button variant="link" asChild className="mt-2 text-[#2563EB]">
                  <Link href="/bookings/new">Book your first session</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#111827]">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            <Button variant="ghost" asChild className="justify-start h-auto py-3 px-4 hover:bg-[#F1F3F5]">
              <Link href="/vehicles" className="flex items-center">
                <div className="h-8 w-8 rounded bg-blue-50 flex items-center justify-center mr-3">
                  <Car className="h-4 w-4 text-[#2563EB]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-[#111827]">Explore Fleet</p>
                  <p className="text-xs text-[#6B7280]">View available racing vehicles</p>
                </div>
              </Link>
            </Button>
            <Button variant="ghost" asChild className="justify-start h-auto py-3 px-4 hover:bg-[#F1F3F5]">
              <Link href="/incidents/new" className="flex items-center">
                <div className="h-8 w-8 rounded bg-red-50 flex items-center justify-center mr-3">
                  <ShieldCheck className="h-4 w-4 text-[#DC2626]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-[#111827]">Report Damage</p>
                  <p className="text-xs text-[#6B7280]">File an incident report</p>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
