'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, unwrap } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { Loader2, ArrowLeft, Zap, Gauge, History, Settings, Info, Car } from 'lucide-react';
import Link from 'next/link';
import { cn, parseImages, getImageUrl } from '@/lib/utils';

export default function VehicleDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [mainImageIdx, setMainImageIdx] = useState(0);

  useEffect(() => {
    async function fetchVehicle() {
      try {
        const response = await api.api.v1.vehicles({ id: id as string }).get();
        const data = unwrap(response);
        let vehicleData = (data as any).data || data;
        if (vehicleData) {
          vehicleData = { 
            ...vehicleData, 
            images: parseImages(vehicleData.images),
            status: vehicleData.available_stock > 0 ? 'available' : 'out_of_stock'
          };
        }
        setVehicle(vehicleData);
      } catch (error) {
        console.error('Failed to fetch vehicle details:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchVehicle();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-20">
        <h3 className="text-lg font-bold text-[#111827]">Vehicle not found</h3>
        <Button variant="link" onClick={() => router.back()}>Go back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Button variant="ghost" onClick={() => router.back()} className="text-[#6B7280] hover:text-[#111827] p-0">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Fleet
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-video bg-[#F1F3F5] rounded-lg overflow-hidden border border-[#E5E7EB]">
            {vehicle.images?.[mainImageIdx] ? (
              <img src={getImageUrl(vehicle.images[mainImageIdx])} alt={vehicle.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Settings className="h-16 w-16 text-[#9CA3AF]" />
              </div>
            )}
          </div>
          {vehicle.images && vehicle.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {vehicle.images.map((url: string, i: number) => (
                <div 
                  key={i} 
                  onClick={() => setMainImageIdx(i)}
                  className={`aspect-square bg-[#F1F3F5] rounded-md border ${mainImageIdx === i ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20' : 'border-[#E5E7EB] hover:border-[#9CA3AF]'} overflow-hidden cursor-pointer transition-all`}
                >
                  <img src={getImageUrl(url)} alt={`${vehicle.name} view ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <StatusBadge status={vehicle.status} />
            </div>
            <h1 className="text-4xl font-bold text-[#111827]">{vehicle.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-[#6B7280]">Model Year: {vehicle.year}</p>
              <div className="w-1 h-1 rounded-full bg-gray-300" />
              <p className="text-sm font-semibold text-green-600 flex items-center gap-1.5">
                <Car className="h-4 w-4" />
                {vehicle.available_stock} Units Available
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 py-6 border-y border-[#E5E7EB]">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded bg-[#F8F9FA] flex items-center justify-center">
                <Zap className="h-5 w-5 text-[#111827]" />
              </div>
              <div>
                <p className="text-xs text-[#6B7280] font-bold uppercase">Horsepower</p>
                <p className="font-bold text-[#111827]">{vehicle.horsepower} HP</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded bg-[#F8F9FA] flex items-center justify-center">
                <Gauge className="h-5 w-5 text-[#111827]" />
              </div>
              <div>
                <p className="text-xs text-[#6B7280] font-bold uppercase">Class</p>
                <p className="font-bold text-[#111827] uppercase">{vehicle.class}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded bg-[#F8F9FA] flex items-center justify-center">
                <Settings className="h-5 w-5 text-[#111827]" />
              </div>
              <div>
                <p className="text-xs text-[#6B7280] font-bold uppercase">Transmission</p>
                <p className="font-bold text-[#111827]">{vehicle.transmission}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded bg-[#F8F9FA] flex items-center justify-center">
                <History className="h-5 w-5 text-[#111827]" />
              </div>
              <div>
                <p className="text-xs text-[#6B7280] font-bold uppercase">Availability</p>
                <p className="font-bold text-[#111827]">{vehicle.available_stock} / {vehicle.total_stock} Units</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#F8F9FA] p-6 rounded-lg border border-[#E5E7EB]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[#6B7280]">Rental Rate</span>
                <span className="text-3xl font-bold text-[#111827]">${vehicle.hourly_rate}<span className="text-sm font-normal text-[#6B7280]"> / hour</span></span>
              </div>
              {vehicle.available_stock > 0 ? (
                <Button asChild className="w-full bg-[#1C1C1E] text-white hover:bg-[#2D2D2F] h-12 text-lg">
                  <Link href="/bookings/new">Book this Vehicle</Link>
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button disabled className="w-full bg-gray-200 text-gray-500 h-12 text-lg">
                    Temporarily Unavailable
                  </Button>
                  <p className="text-center text-xs text-red-500 font-medium">
                    All units of this model are currently in use or under maintenance.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <Info className="h-5 w-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#2563EB]">
                Rental include basic track insurance and full tank of fuel. Driver must be at least 21 years old with valid license.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
