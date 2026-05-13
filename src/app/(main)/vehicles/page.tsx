'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { Loader2, Car, Gauge, Zap } from 'lucide-react';
import Link from 'next/link';
import { cn, parseImages, getImageUrl } from '@/lib/utils';

interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  class: string;
  horsepower: number;
  transmission: string;
  hourly_rate: string;
  status: string;
  images: string[];
}

export default function VehiclesPage() {
  const { data: vehicles = [], isLoading, error } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const res = await api.api.v1.vehicles.get();
      if (res.error) throw new Error((res.error.value as any)?.message || 'Failed to fetch vehicles');
      
      const vehicleList = (res.data as any)?.data?.models || [];
      return Array.isArray(vehicleList)
        ? vehicleList.map((v: any) => ({ 
            ...v, 
            images: parseImages(v.images),
            status: v.available_stock > 0 ? 'available' : 'out_of_stock' 
          }))
        : [];
    },
    staleTime: 0,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Vehicle Fleet" 
        description="Choose from our range of high-performance racing vehicles."
      />

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
          {(error as Error).message}
        </div>
      )}

      {!error && vehicles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#6B7280]">No vehicles available at the moment.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {vehicles.map((vehicle) => (
          <Card 
            key={vehicle.id} 
            className={cn(
              "overflow-hidden border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-[2rem] group",
              (vehicle as any).available_stock === 0 && "grayscale opacity-75"
            )}
          >
            <div className="aspect-[16/10] bg-gray-50 relative overflow-hidden">
              {vehicle.images?.[0] ? (
                <img 
                  src={getImageUrl(vehicle.images[0])} 
                  alt={vehicle.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Car className="h-16 w-16" />
                </div>
              )}
              <div className="absolute top-4 right-4">
                <StatusBadge status={vehicle.status} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <CardHeader className="pb-2">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900 leading-tight">{vehicle.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="flex items-center gap-4 text-sm font-medium text-gray-500 mb-6">
                <div className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span>{vehicle.horsepower} HP</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-300" />
                <div className="flex items-center gap-1.5">
                  <Gauge className="h-4 w-4 text-indigo-500" />
                  <span className="uppercase">{vehicle.class}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-300" />
                <div className="flex items-center gap-1.5">
                  <Car className="h-4 w-4 text-green-600" />
                  <span>{(vehicle as any).available_stock} available</span>
                </div>
              </div>
              <div className="flex items-end justify-between border-t border-gray-50 pt-6">
                <div>
                  <span className="text-lg font-semibold text-gray-900">${vehicle.hourly_rate}</span>
                  <span className="text-sm font-medium text-gray-400 ml-1">/ hour</span>
                </div>
                <Button asChild className="rounded-2xl bg-gray-900 px-6 hover:bg-blue-600 transition-all shadow-md active:scale-95 font-semibold">
                  <Link href={`/vehicles/${vehicle.id}`}>Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
