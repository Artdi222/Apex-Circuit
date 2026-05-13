'use client';

import React, { useState, useEffect } from 'react';
import { useBookingStore } from '@/stores/booking-store';
import { Button } from '@/components/ui/button';
import { api, unwrap } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ArrowRight, ArrowLeft, Car, Check, AlertCircle } from 'lucide-react';
import { cn, parseImages, getImageUrl } from '@/lib/utils';

export function StepVehicle() {
  const { selectedVehicleIds, selectVehicle, nextStep, prevStep, participantsCount } = useBookingStore();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeParticipant, setActiveParticipant] = useState(0);

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const response = await api.api.v1.vehicles.get();
        const result = unwrap(response);
        let vehicleList = [];
        if (Array.isArray(result)) {
          vehicleList = result;
        } else if (result && typeof result === 'object') {
          vehicleList = (result as any).models || (result as any).data || (result as any).vehicles || [];
        }
        
        // Parse images for each vehicle
        const parsedVehicles = (Array.isArray(vehicleList) ? vehicleList : []).map(v => ({
          ...v,
          images: parseImages(v.images)
        }));
        
        setVehicles(parsedVehicles);
      } catch (error) {
        console.error('Failed to fetch vehicles:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchVehicles();
  }, []);

  const currentVehicleId = selectedVehicleIds[activeParticipant];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl font-bold text-[#111827]">Select Vehicle</h2>
        <p className="text-[#6B7280]">Choose a vehicle for each participant or select "No Vehicle" to bring your own.</p>
      </div>

      {participantsCount > 1 && (
        <div className="flex items-center space-x-2 bg-[#F8F9FA] p-1 rounded-lg border border-[#E5E7EB]">
          {Array.from({ length: participantsCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveParticipant(i)}
              className={cn(
                "flex-1 py-2 px-4 rounded-md text-sm font-bold transition-all",
                activeParticipant === i
                  ? "bg-white text-[#2563EB] shadow-sm border border-[#E5E7EB]"
                  : "text-[#6B7280] hover:bg-[#F3F4F6]"
              )}
            >
              Participant {i + 1}
              {selectedVehicleIds[i] && (
                <span className="ml-2 inline-block w-2 h-2 rounded-full bg-[#16A34A]" />
              )}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => selectVehicle(activeParticipant, null)}
            className={cn(
              'flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all',
              currentVehicleId === null 
                ? 'border-[#2563EB] bg-blue-50/50' 
                : 'border-[#E5E7EB] hover:border-[#D1D5DB] bg-white'
            )}
          >
            <div className="w-12 h-12 rounded-full bg-[#F1F3F5] flex items-center justify-center mb-3">
              <Check className={cn('h-6 w-6', currentVehicleId === null ? 'text-[#2563EB]' : 'text-[#6B7280]')} />
            </div>
            <span className="font-bold text-[#111827]">Bring Own Vehicle</span>
            <span className="text-sm text-[#6B7280] mt-1">$0.00 / session</span>
          </button>

          {vehicles.map((vehicle) => {
            const totalSelected = selectedVehicleIds.filter(id => id === vehicle.id).length;
            const isAlreadySelectedByMe = currentVehicleId === vehicle.id;
            
            const remainingStock = vehicle.available_stock - (totalSelected - (isAlreadySelectedByMe ? 1 : 0));
            const isAvailable = vehicle.available_stock > 0 && (isAlreadySelectedByMe || totalSelected < vehicle.available_stock);
            
            let statusLabel = vehicle.available_stock === 0 ? 'OUT OF STOCK' : `${vehicle.available_stock} AVAILABLE`;
            if (totalSelected >= vehicle.available_stock && !isAlreadySelectedByMe) statusLabel = 'ALL RENTED';
            
            return (
              <button
                key={vehicle.id}
                disabled={!isAvailable}
                onClick={() => selectVehicle(activeParticipant, vehicle.id)}
                className={cn(
                  'flex items-center p-4 rounded-lg border-2 transition-all text-left relative overflow-hidden',
                  currentVehicleId === vehicle.id 
                    ? 'border-[#2563EB] bg-blue-50/50' 
                    : isAvailable 
                      ? 'border-[#E5E7EB] hover:border-[#D1D5DB] bg-white'
                      : 'border-[#F3F4F6] bg-[#F9FAFB] cursor-not-allowed grayscale'
                )}
              >
                {!isAvailable && (
                  <div className="absolute top-0 right-0 bg-[#EF4444] text-white text-[10px] font-bold px-2 py-0.5 rounded-bl uppercase tracking-tighter">
                    {statusLabel}
                  </div>
                )}
                <div className="h-16 w-24 bg-[#F1F3F5] rounded overflow-hidden flex-shrink-0 mr-4">
                  {vehicle.images?.[0] ? (
                    <img 
                      src={getImageUrl(vehicle.images[0])} 
                      alt={vehicle.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#9CA3AF]">
                      <Car className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#111827] truncate">{vehicle.name}</p>
                  <p className="text-sm text-[#111827] mt-1">${vehicle.hourly_rate} / hour</p>
                  <p className={cn(
                    "text-[10px] font-bold mt-1 uppercase",
                    remainingStock > 0 ? "text-[#16A34A]" : "text-[#EF4444]"
                  )}>
                    {remainingStock} Units Available
                  </p>
                </div>
                {currentVehicleId === vehicle.id && (
                  <div className="h-2 w-2 rounded-full bg-[#2563EB] ml-2" />
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="pt-6 border-t border-[#E5E7EB] flex justify-between">
        <Button 
          variant="outline" 
          onClick={prevStep}
          className="border-[#D1D5DB] text-[#111827] hover:bg-[#F8F9FA]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={() => {
            if (activeParticipant < participantsCount - 1) {
              setActiveParticipant(activeParticipant + 1);
            } else {
              nextStep();
            }
          }}
          className="bg-[#1C1C1E] text-white hover:bg-[#2D2D2F]"
        >
          {activeParticipant < participantsCount - 1 ? 'Next Participant' : 'Next Step'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
