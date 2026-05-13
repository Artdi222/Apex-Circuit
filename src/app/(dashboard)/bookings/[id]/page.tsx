'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { api, unwrap } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, Car, ShieldCheck, Download, QrCode, ArrowLeft, AlertCircle, X } from 'lucide-react';
import Link from 'next/link';
import { TicketCard } from '@/components/tickets/ticket-card';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function BookingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!booking) return;
    setIsDownloading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tickets/${booking.id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to download PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${booking.id.substring(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    async function fetchBooking() {
      try {
        const response = await api.api.v1.bookings({ id: id as string }).get();
        const data = unwrap(response);
        setBooking((data as any)?.data || data);
      } catch (error) {
        console.error('Failed to fetch booking details:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBooking();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-[#111827]">Booking not found</h3>
        <Button variant="link" onClick={() => router.back()}>Go back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-2 text-sm text-[#6B7280] mb-2">
        <Link href="/bookings" className="hover:text-[#2563EB] transition-colors">My Bookings</Link>
        <span>/</span>
        <span className="text-[#111827] font-medium">Booking Details</span>
      </div>

      <PageHeader 
        title={`Booking #${booking.id?.substring(0, 8)}`}
        description={`Created on ${booking.created_at ? new Date(booking.created_at).toLocaleDateString() : 'Unknown date'}`}
      >
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="border-[#D1D5DB] text-[#111827]"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
          >
            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Download PDF
          </Button>
          <Button 
            className="bg-[#1C1C1E] text-white hover:bg-[#2D2D2F]"
            onClick={() => setIsTicketOpen(true)}
            disabled={booking.status !== 'confirmed' && booking.status !== 'checked_in' && booking.status !== 'completed'}
          >
            <QrCode className="mr-2 h-4 w-4" />
            View Ticket
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-[#E5E7EB] shadow-sm">
            <CardHeader className="border-b border-[#E5E7EB] bg-[#F8F9FA]">
              <CardTitle className="text-lg font-bold">Session Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-[#2563EB] mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Date & Time</p>
                    <p className="font-bold text-[#111827] mt-1">
                      {booking.schedule_slot?.date ? new Date(booking.schedule_slot.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : booking.slot_date || 'TBD'}
                    </p>
                    <p className="text-sm text-[#6B7280]">
                      {booking.schedule_slot?.start_time?.substring(0, 5) || booking.slot_start_time?.substring(0, 5) || '--:--'} - {booking.schedule_slot?.end_time?.substring(0, 5) || booking.slot_end_time?.substring(0, 5) || '--:--'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <StatusBadge status={booking.status} className="mt-1" />
                  <div>
                    <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Booking Status</p>
                    <p className="text-sm text-[#6B7280] mt-1">
                      {booking.status === 'pending' ? 'Awaiting admin confirmation' : 
                       booking.status === 'confirmed' ? 'Ready for track day' : 
                       booking.status}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#E5E7EB]">
                <div className="flex items-start space-x-3">
                  <Car className="h-5 w-5 text-[#111827] mt-0.5" />
                  <div className="w-full">
                    <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Vehicle</p>
                    {booking.vehicles && booking.vehicles.length > 0 ? (
                      <div className="mt-2 space-y-2">
                        {booking.vehicles.map((v: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm bg-[#F8F9FA] p-2 rounded">
                            <span className="text-[#111827] font-medium">{v.model} {v.year}</span>
                            <span className="text-[#6B7280]">{v.internal_id}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="font-bold text-[#111827] mt-1">Personal Vehicle</p>
                    )}
                  </div>
                </div>
              </div>

              {booking.equipment && booking.equipment.length > 0 && (
                <div className="pt-6 border-t border-[#E5E7EB]">
                  <div className="flex items-start space-x-3">
                    <ShieldCheck className="h-5 w-5 text-[#16A34A] mt-0.5" />
                    <div className="w-full">
                      <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Rented Equipment</p>
                      <div className="mt-2 space-y-2">
                        {booking.equipment.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm bg-[#F8F9FA] p-2 rounded">
                            <span className="text-[#111827] font-medium">{item.equipment_name || item.name}</span>
                            <span className="text-[#6B7280]">Qty: {item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="border-[#E5E7EB] shadow-sm overflow-hidden">
            <CardHeader className="bg-[#1C1C1E] text-white">
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Base Session Fee ({booking.participants_count || 1}x)</span>
                  <span className="font-medium text-[#111827]">${(booking.participants_count || 1) * 150}</span>
                </div>
                {(booking.total_price / 1.10) > ((booking.participants_count || 1) * 150) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Rentals, Surge & Add-ons</span>
                    <span className="font-medium text-[#111827]">
                      ${((booking.total_price / 1.10) - ((booking.participants_count || 1) * 150)).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-[#E5E7EB]">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Subtotal</span>
                    <span className="font-medium text-[#111827]">${(booking.total_price / 1.10).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-[#6B7280]">Tax (10%)</span>
                    <span className="font-medium text-[#111827]">${(booking.total_price - (booking.total_price / 1.10)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-[#E5E7EB] flex justify-between items-end">
                <div>
                  <p className="text-xs text-[#6B7280] uppercase font-bold">Total Paid</p>
                  <p className="text-2xl font-bold text-[#2563EB]">${booking.total_price}</p>
                </div>
                <StatusBadge status="paid" />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6 border-dashed border-2 border-[#E5E7EB] bg-[#F8F9FA]">
            <CardContent className="p-6 text-center">
              <QrCode className="h-16 w-16 mx-auto text-[#111827] mb-4 opacity-50" />
              <p className="text-sm font-bold text-[#111827]">Check-in QR Code</p>
              <p className="text-xs text-[#6B7280] mt-1">
                {booking.status === 'confirmed' || booking.status === 'checked_in' || booking.status === 'completed' 
                  ? 'Ready to scan at the track' 
                  : 'Available once confirmed'}
              </p>
              
              {(booking.status === 'confirmed' || booking.status === 'checked_in' || booking.status === 'completed') && (
                <Dialog open={isTicketOpen} onOpenChange={setIsTicketOpen}>
                  <DialogTrigger asChild>
                    <Button variant="link" className="text-[#2563EB] mt-2">View Ticket</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl p-0 overflow-hidden border-none bg-transparent">
                    <DialogTitle className="sr-only">Booking Ticket</DialogTitle>
                    <DialogDescription className="sr-only">
                      Visual representation of your booking ticket with QR code for check-in.
                    </DialogDescription>
                    <TicketCard booking={booking} />
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
