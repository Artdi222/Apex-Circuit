'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { Loader2, ShieldCheck, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { parseImages, getImageUrl } from '@/lib/utils';

interface Equipment {
  id: string;
  name: string;
  category: string;
  size: string;
  brand: string;
  condition: string;
  rental_price: string;
  available_quantity: number;
  images: string[];
  status: string;
}

export default function EquipmentPage() {
  const { data: equipment = [], isLoading, error } = useQuery<Equipment[]>({
    queryKey: ['equipment'],
    queryFn: async () => {
      const res = await api.api.v1.equipment.get();
      if (res.error) throw new Error((res.error.value as any)?.message || 'Failed to fetch equipment');
      const list = (res.data as any)?.data?.items || (res.data as any)?.data?.equipment || (Array.isArray((res.data as any)?.data) ? (res.data as any)?.data : []);
      return list.map((item: any) => ({ ...item, images: parseImages(item.images) }));
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
        title="Racing Gear"
        description="Professional grade safety equipment for your track session."
      />

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
          {(error as Error).message}
        </div>
      )}

      {!error && equipment.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#6B7280]">No equipment available at the moment.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {equipment.map((item) => (
          <Card key={item.id} className="overflow-hidden border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-[2rem] group flex flex-col">
            <div className="aspect-square bg-gray-50 relative overflow-hidden flex items-center justify-center">
              {item.images?.[0] ? (
                <img
                  src={getImageUrl(item.images[0])}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <ShieldCheck className="h-20 w-20 text-gray-200 group-hover:text-blue-200 transition-colors duration-500" />
              )}
              <div className="absolute top-4 right-4">
                <StatusBadge status={item.status} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <CardHeader className="p-6 pb-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-1">{item.category}</span>
                <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 flex-1">
              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Size</span>
                  <span className="text-sm font-bold text-gray-900">{item.size}</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-gray-900">${item.rental_price}</span>
                  <span className="text-[10px] text-gray-400 font-bold ml-1 uppercase">/ session</span>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex flex-col">
                   <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Condition</span>
                   <span className="text-xs font-bold text-gray-700">{item.condition}</span>
                </div>
                <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{item.available_quantity} available</span>
              </div>
            </CardContent>
            <div className="p-6 pt-0 mt-auto">
              <Button
                asChild
                disabled={item.available_quantity === 0}
                className="w-full h-12 rounded-2xl bg-gray-900 text-white hover:bg-blue-600 transition-all font-bold shadow-md active:scale-95 disabled:opacity-50"
              >
                <Link href="/schedule">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Reserve Now
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
