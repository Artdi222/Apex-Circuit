'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QRDisplay } from './qr-display';
import { Download, Calendar, Clock, Car, User } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { StatusBadge } from '../shared/status-badge';

export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'no_show';

export interface BookingUser {
  username?: string;
  email?: string;
}

export interface BookingScheduleSlot {
  date: string | Date;
  start_time: string;
  end_time: string;
}

export interface BookingVehicle {
  id?: string;
  brand?: string;
  model: string;
  year?: number;
  internal_id?: string;
}

export interface BookingEquipment {
  equipment_name?: string;
  name?: string;
  quantity: number;
}

export interface BookingWithDetails {
  id: string;
  status: BookingStatus;
  total_price: number | string;
  user?: BookingUser;
  user_username?: string;
  schedule_slot?: BookingScheduleSlot;
  slot_date?: string;
  slot_start_time?: string;
  slot_end_time?: string;
  vehicles?: BookingVehicle[];
  vehicle_name?: string;
  equipment?: BookingEquipment[];
}

interface TicketCardProps {
  booking: BookingWithDetails;
}

export function TicketCard({ booking }: TicketCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    try {
      const response = await fetch(`${apiUrl}/api/v1/tickets/${booking.id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to download PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${booking.id.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      toast.success('Ticket PDF downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download ticket PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl overflow-hidden border-2 border-slate-200">
      <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img src="/Logo.svg" alt="Apex Circuit Logo" className="h-8 w-8" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">APEX CIRCUIT</h2>
            <p className="text-slate-400 text-sm font-mono uppercase">Official Entrance Pass</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 uppercase mb-1">Status</p>
          <StatusBadge status={booking.status} className="border border-white/20" />
        </div>
      </div>

      <CardContent className="p-0 flex flex-col md:flex-row">
        <div className="flex-1 p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <User className="w-3 h-3" /> Driver
              </label>
              <p className="font-semibold">{booking.user?.username || booking.user_username || 'Guest'}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Car className="w-3 h-3" /> Vehicle
              </label>
              <p className="font-semibold">
                {booking.vehicles && booking.vehicles.length > 0 
                  ? booking.vehicles.map((v: BookingVehicle) => v.model).join(', ')
                  : booking.vehicle_name || 'Own Vehicle'}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Date
              </label>
              <p className="font-semibold">
                {booking.schedule_slot?.date ? format(new Date(booking.schedule_slot.date), 'PPP') : (booking.slot_date ? format(new Date(booking.slot_date), 'PPP') : 'N/A')}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3" /> Time Slot
              </label>
              <p className="font-semibold">
                {(booking.schedule_slot?.start_time || booking.slot_start_time)?.slice(0, 5) || '--:--'} - {(booking.schedule_slot?.end_time || booking.slot_end_time)?.slice(0, 5) || '--:--'}
              </p>
            </div>
          </div>

          {booking.equipment && booking.equipment.length > 0 && (
            <div className="pt-4 border-t border-dashed border-slate-200 space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Rented Equipment</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {booking.equipment.map((item: BookingEquipment, idx: number) => (
                  <span key={idx} className="text-xs font-medium text-slate-800">
                    {item.equipment_name || item.name} ({item.quantity})
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-dashed border-slate-200">
            <div className="bg-slate-50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Paid</p>
                <p className="text-xl font-black">${Number(booking.total_price).toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Gate Access</p>
                <p className="text-sm font-bold text-green-600">INCLUDED</p>
              </div>
            </div>
          </div>
          
          <Button 
            className="w-full bg-slate-900 hover:bg-black text-white py-6"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Downloading...
              </span>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download PDF Ticket
              </>
            )}
          </Button>
        </div>

        <div className="bg-slate-50 p-8 flex items-center justify-center border-l border-slate-100 min-w-[300px]">
          <div className="space-y-4 text-center">
            <QRDisplay bookingId={booking.id} />
            <p className="text-[10px] text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
              Show this QR code to the track staff at the pit entry for scanning.
            </p>
          </div>
        </div>
      </CardContent>
      
      <div className="bg-slate-50 border-t border-slate-100 p-4 text-[10px] text-center text-muted-foreground uppercase tracking-[0.2em] font-medium">
        Valid only for the specified date and time • non-transferable • apex circuit rentals © 2024
      </div>
    </Card>
  );
}
