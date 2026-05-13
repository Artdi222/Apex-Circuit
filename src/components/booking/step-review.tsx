'use client';

import React, { useState, useEffect } from 'react';
import { useBookingStore } from '@/stores/booking-store';
import { Button } from '@/components/ui/button';
import { api, unwrap } from '@/lib/api';
import { PriceSummary, PriceItem } from './price-summary';
import { Loader2, ArrowLeft, CheckCircle2, Calendar, Car, ShieldCheck, AlertCircle, CreditCard, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

export function StepReview() {
  const { 
    selectedSlotId, 
    selectedVehicleIds, 
    selectedEquipment, 
    participantsCount,
    prevStep,
    resetBooking 
  } = useBookingStore();
  
  const { user } = useAuth();
  const router = useRouter();
  
  const [details, setDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    async function fetchDetails() {
      try {
        const rentedVehicleIds = selectedVehicleIds.filter(id => id !== null) as string[];
        
        const [slotRes, vehicleRes, equipRes] = await Promise.all([
          api.api.v1.schedules({ id: selectedSlotId! }).get(),
          rentedVehicleIds.length > 0 
            ? Promise.all(rentedVehicleIds.map(id => api.api.v1.vehicles({ id }).get()))
            : Promise.resolve([]),
          api.api.v1.equipment.get()
        ]);

        const slotResult = unwrap(slotRes);
        const slot = Array.isArray(slotResult) ? slotResult[0] : slotResult;

        const vehicles = Array.isArray(vehicleRes) 
          ? vehicleRes.map(res => {
              const raw = unwrap(res);
              return Array.isArray(raw) ? raw[0] : raw;
            })
          : [];

        const equipResult = unwrap(equipRes);
        const allEquip = Array.isArray(equipResult) 
          ? equipResult 
          : (equipResult as any)?.items || (equipResult as any)?.equipment || (equipResult as any)?.data || [];
        
        const selectedEquipDetails = selectedEquipment.map(se => {
          const item = (allEquip as any[]).find(e => e.id === se.id);
          return { ...item, quantity: se.quantity };
        });

        setDetails({
          slot,
          vehicles,
          equipment: selectedEquipDetails
        });
      } catch (err) {
        console.error('Failed to fetch summary details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (selectedSlotId) fetchDetails();
  }, [selectedSlotId, selectedVehicleIds, selectedEquipment]);

  const handleConfirm = async () => {
    if (!agreed) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const payload = {
        schedule_slot_id: selectedSlotId!,
        participants_count: participantsCount,
        vehicle_ids: selectedVehicleIds.filter(id => id !== null) as string[],
        equipment: selectedEquipment.map(e => ({
          equipment_id: e.id,
          quantity: e.quantity
        })),
        agreement_accepted: true
      };

      const response = await api.api.v1.bookings.post(payload);
      const result = unwrap(response);
      const booking = (result as any).data ?? result;
      
      resetBooking();
      router.push(`/bookings/${booking.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
      </div>
    );
  }

  if (!details || !details.slot) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-center">
        <AlertCircle className="h-10 w-10 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-900 mb-2">Error Loading Details</h3>
        <p className="text-red-700 mb-4">We couldn't retrieve your booking summary. This might be due to a connection issue or an invalid session.</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
          Retry Loading
        </Button>
      </div>
    );
  }

  const priceItems: PriceItem[] = [];
  
  const [startH, startM] = details.slot.start_time.split(':').map(Number);
  const [endH, endM] = details.slot.end_time.split(':').map(Number);
  const durationHours = ((endH * 60 + endM) - (startH * 60 + startM)) / 60;

  if (details.slot) {
    const baseRate = details.slot.slot_type === 'exclusive' ? 500 : 150;
    const sessionPrice = baseRate * durationHours;

    priceItems.push({ 
      name: `Track Session Fee (${details.slot.slot_type === 'exclusive' ? 'Exclusive' : 'Open'})`, 
      price: sessionPrice, 
      quantity: participantsCount,
      type: 'slot' as const 
    });
  }

  if (details.vehicles && details.vehicles.length > 0) {
    details.vehicles.forEach((v: any) => {
      const hourlyRate = parseFloat(v.base_hourly_rate);
      const totalPrice = isNaN(hourlyRate) ? 0 : hourlyRate * durationHours;
      priceItems.push({ 
        name: `${v.name} Rental (${durationHours}h)`, 
        price: totalPrice, 
        type: 'vehicle' as const 
      });
    });
  }

  details.equipment?.forEach((e: any) => {
    const price = parseFloat(e.rental_price);
    priceItems.push({ 
      name: e.name, 
      price: isNaN(price) ? 0 : price, 
      quantity: e.quantity, 
      type: 'equipment' as const 
    });
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl font-bold text-[#111827]">Review & Confirm</h2>
        <p className="text-[#6B7280]">Please verify your booking details before proceeding.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Sections */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 space-y-4">
            <div className="flex items-start space-x-4">
              <div className="h-10 w-10 bg-[#F1F3F5] rounded flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-[#111827]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#111827]">Session Date & Time</p>
                <p className="text-sm text-[#6B7280]">
                  {(() => {
                    try {
                      const d = details.slot.date instanceof Date ? details.slot.date : new Date(details.slot.date);
                      return format(d, 'PPP');
                    } catch {
                      return String(details.slot.date);
                    }
                  })()} @ {details.slot.start_time?.substring(0, 5) ?? '00:00'} - {details.slot.end_time?.substring(0, 5) ?? '00:00'}
                </p>
              </div>
              <div className="bg-[#1C1C1E] text-white px-3 py-1 rounded text-xs font-bold">
                {participantsCount} {participantsCount > 1 ? 'Participants' : 'Participant'}
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="h-10 w-10 bg-[#F1F3F5] rounded flex items-center justify-center flex-shrink-0">
                <Car className="h-5 w-5 text-[#111827]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#111827]">Vehicle Rentals</p>
                {details.vehicles && details.vehicles.length > 0 ? (
                  <ul className="text-sm text-[#6B7280] list-disc list-inside">
                    {details.vehicles.map((v: any, idx: number) => (
                      <li key={idx}>{v.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#6B7280]">All participants bringing own vehicles</p>
                )}
              </div>
            </div>

            {details.equipment && details.equipment.length > 0 && (
              <div className="flex items-start space-x-4">
                <div className="h-10 w-10 bg-[#F1F3F5] rounded flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="h-5 w-5 text-[#111827]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111827]">Rented Equipment</p>
                  <ul className="text-sm text-[#6B7280] list-disc list-inside">
                    {details.equipment.map((e: any) => (
                      <li key={e.id}>{e.name} (x{e.quantity})</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider">Payment Method</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: 'card', name: 'Credit Card', image: '/payments/card.png' },
                { id: 'paypal', name: 'PayPal', image: '/payments/paypal.png' },
                { id: 'applepay', name: 'Apple Pay', image: '/payments/apple-pay.png' }
              ].map((method) => (
                <div
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`
                    cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center space-y-3 transition-all duration-200
                    ${paymentMethod === method.id 
                      ? 'border-[#2563EB] bg-[#EFF6FF] shadow-sm' 
                      : 'border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:bg-[#F9FAFB]'}
                  `}
                >
                  <div className="w-26 h-12 flex items-center justify-center relative">
                    <img 
                      src={method.image} 
                      alt={method.name}
                      className={`max-w-full max-h-full object-contain transition-all duration-300 ${paymentMethod === method.id ? 'scale-110' : 'grayscale opacity-50'}`}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.parentElement?.querySelector('.img-fallback');
                        if (fallback) (fallback as HTMLElement).style.display = 'flex';
                      }}
                    />
                    <div className="img-fallback hidden absolute inset-0 items-center justify-center bg-gray-100 rounded text-[10px] font-bold text-gray-400 uppercase tracking-tighter text-center px-1">
                      {method.name}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${paymentMethod === method.id ? 'text-[#2563EB]' : 'text-[#9CA3AF]'}`}>
                    {method.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg">
             <Checkbox 
                id="terms" 
                checked={agreed} 
                onCheckedChange={(checked: boolean | 'indeterminate') => setAgreed(checked as boolean)}
                className="mt-1 border-[#D1D5DB]"
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the Track Safety Regulations and Waiver
                </Label>
                <p className="text-xs text-[#6B7280]">
                  By checking this box, you confirm that you have read and understood our safety policies and liability waiver.
                </p>
              </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          {(() => {
            const day = new Date(details.slot.date).getDay();
            const isWeekend = day === 0 || day === 6;
            return <PriceSummary items={priceItems} surgeMultiplier={isWeekend ? 1.2 : 1} />;
          })()}
        </div>
      </div>

      <div className="pt-6 border-t border-[#E5E7EB] flex justify-between">
        <Button 
          variant="outline" 
          onClick={prevStep}
          disabled={isSubmitting}
          className="border-[#D1D5DB] text-[#111827] hover:bg-[#F8F9FA]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={handleConfirm}
          disabled={!agreed || isSubmitting}
          className="bg-[#2563EB] text-white hover:bg-[#1D4ED8] min-w-[160px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Confirm Booking
              <CheckCircle2 className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
