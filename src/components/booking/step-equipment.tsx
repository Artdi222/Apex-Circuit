'use client';

import React, { useState, useEffect } from 'react';
import { useBookingStore } from '@/stores/booking-store';
import { Button } from '@/components/ui/button';
import { api, unwrap } from '@/lib/api';
import { Loader2, ArrowRight, ArrowLeft, ShieldCheck, Plus, Minus } from 'lucide-react';
import { cn, parseImages, getImageUrl } from '@/lib/utils';

export function StepEquipment() {
  const { selectedEquipment, toggleEquipment, nextStep, prevStep } = useBookingStore();
  const [equipment, setEquipment] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEquipment() {
      try {
        const response = await api.api.v1.equipment.get();
        const result = unwrap(response);
        let equipmentList = [];
        if (Array.isArray(result)) {
          equipmentList = result;
        } else if (result && typeof result === 'object') {
          equipmentList = (result as any).items || (result as any).equipment || (result as any).data || [];
        }
        
        // Parse images for each equipment item
        const parsedEquipment = (Array.isArray(equipmentList) ? equipmentList : []).map(e => ({
          ...e,
          images: parseImages(e.images)
        }));
        
        setEquipment(parsedEquipment);
      } catch (error) {
        console.error('Failed to fetch equipment:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchEquipment();
  }, []);

  const getQuantity = (id: string) => {
    return selectedEquipment.find((e) => e.id === id)?.quantity || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl font-bold text-[#111827]">Select Equipment</h2>
        <p className="text-[#6B7280]">Rent professional safety gear for your session (optional).</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {equipment.map((item) => {
            const quantity = getQuantity(item.id);
            const isSelected = quantity > 0;
            const isOutOfStock = item.available_quantity <= 0;
            const canAdd = quantity < item.available_quantity;

            return (
              <div
                key={item.id}
                className={cn(
                  'flex items-center p-4 rounded-lg border-2 transition-all text-left relative overflow-hidden',
                  isSelected 
                    ? 'border-[#2563EB] bg-blue-50/50' 
                    : isOutOfStock
                      ? 'border-[#F3F4F6] bg-[#F9FAFB] opacity-80'
                      : 'border-[#E5E7EB] hover:border-[#D1D5DB] bg-white'
                )}
              >
                {isOutOfStock && (
                  <div className="absolute top-0 right-0 bg-[#6B7280] text-white text-[10px] font-bold px-2 py-0.5 rounded-bl uppercase">
                    Out of Stock
                  </div>
                )}
                <div className="h-12 w-12 bg-[#F1F3F5] rounded overflow-hidden flex-shrink-0 flex items-center justify-center mr-4">
                  {item.images?.[0] ? (
                    <img 
                      src={getImageUrl(item.images[0])} 
                      alt={item.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <ShieldCheck className={cn('h-6 w-6', isSelected ? 'text-[#2563EB]' : 'text-[#6B7280]')} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-[#6B7280] uppercase truncate">
                    {item.category} • {item.available_quantity} left
                  </p>
                  <p className="font-bold text-[#111827] truncate">{item.name}</p>
                  <p className="text-xs text-[#111827] mt-0.5">${item.rental_price} / item</p>
                </div>
                
                <div className="flex items-center space-x-3 ml-4">
                  <button
                    onClick={() => toggleEquipment(item.id, Math.max(0, quantity - 1))}
                    disabled={quantity === 0}
                    className="p-1 rounded-full border border-[#D1D5DB] hover:bg-[#F1F3F5] disabled:opacity-30"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-bold w-4 text-center">{quantity}</span>
                  <button
                    onClick={() => toggleEquipment(item.id, quantity + 1)}
                    disabled={!canAdd}
                    className="p-1 rounded-full border border-[#D1D5DB] hover:bg-[#F1F3F5] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
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
          onClick={nextStep}
          className="bg-[#1C1C1E] text-white hover:bg-[#2D2D2F]"
        >
          Review Order
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
