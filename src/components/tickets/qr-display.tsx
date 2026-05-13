'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface QRDisplayProps {
  bookingId: string;
}

export function QRDisplay({ bookingId }: QRDisplayProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['booking-qr', bookingId],
    queryFn: async () => {
      const { data, error } = await api.api.v1.tickets({ bookingId }).qr.get();
      if (error) throw error;
      return data.data; // The QR Data URL string
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border border-border shadow-sm">
        <Skeleton className="w-64 h-64 rounded-md" />
        <Skeleton className="h-4 w-32 mt-4" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 shadow-sm text-center">
        <AlertCircle className="w-12 h-12 mb-4" />
        <h3 className="font-bold text-lg">Failed to load QR code</h3>
        <p className="text-sm opacity-90 mt-1 max-w-[250px]">
          There was an error generating your check-in code.
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-6 border-destructive/30 hover:bg-destructive/10"
          onClick={() => refetch()}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border border-border shadow-sm">
      <div className="relative w-64 h-64 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-center">
        {data && (
          <Image 
            src={data} 
            alt="Check-in QR Code" 
            width={250} 
            height={250}
            className="rounded-sm"
            priority
          />
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-4 font-mono uppercase tracking-widest">
        Booking Ticket #{bookingId.slice(0, 8)}
      </p>
    </div>
  );
}
