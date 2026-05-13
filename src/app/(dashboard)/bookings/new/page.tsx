'use client';

import React, { useEffect } from 'react';
import { useBookingStore } from '@/stores/booking-store';
import { BookingWizard } from '@/components/booking/booking-wizard';
import { PageHeader } from '@/components/shared/page-header';

export default function NewBookingPage() {
  const resetBooking = useBookingStore((state) => state.resetBooking);

  useEffect(() => {
    // Reset state when component unmounts if desired, 
    // or keep it to allow returning to the wizard.
    // resetBooking();
  }, [resetBooking]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <PageHeader 
        title="Book a Session" 
        description="Follow the steps to schedule your track time and select equipment."
      />
      
      <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm overflow-hidden">
        <BookingWizard />
      </div>
    </div>
  );
}
