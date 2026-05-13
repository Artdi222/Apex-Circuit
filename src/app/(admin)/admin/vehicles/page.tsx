"use client";

import { DataTable, Column } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn, parseImages, getImageUrl } from "@/lib/utils";

export default function VehiclesPage() {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["admin", "vehicles"],
    queryFn: async () => {
      const res = await api.api.v1.vehicles.get();
      if (res.error)
        throw new Error(
          (res.error.value as any)?.message || JSON.stringify(res.error.value),
        );
      
      const list = res.data?.data?.models || [];
      return list.map((v: any) => ({
        ...v,
        images: parseImages(v.images),
      }));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Note: Delete endpoint might be /vehicles/:id
      const res = await api.api.v1.vehicles({ id }).delete();
      if (res.error)
        throw new Error(
          (res.error.value as any)?.message || JSON.stringify(res.error.value),
        );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vehicles"] });
      toast.success("Vehicle deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete vehicle");
    },
  });

  const columns: Column<any>[] = [
    {
      header: "Vehicle",
      cell: (v) => {
        const images = v.images || [];

        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-16 relative rounded bg-gray-100 overflow-hidden border shrink-0">
              {images?.[0] ? (
                <Image
                  src={getImageUrl(images[0])}
                  fill
                  className="object-cover"
                  alt={v.name}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-[10px] text-gray-400 font-bold uppercase">
                  No Pic
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-gray-900 truncate">{v.name}</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold truncate">
                {v.brand} {v.model} • {v.class}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Rate",
      cell: (v) => (
        <span className="font-mono font-bold">${v.hourly_rate}/hr</span>
      ),
    },
    {
      header: "Stock",
      cell: (v) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900">{v.total_stock} Units</span>
          <span className={cn(
            "text-[10px] font-bold uppercase",
            v.available_stock > 0 ? "text-green-600" : "text-red-600"
          )}>
            {v.available_stock} Available
          </span>
        </div>
      ),
    },
    {
      header: "Specs",
      cell: (v) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{v.year} {v.model_code || ""}</span>
          <span className="text-[10px] text-gray-400 font-bold uppercase">
            {v.horsepower} HP • {v.transmission}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (v) => (
        <StatusBadge 
          status={v.available_stock > 0 ? "available" : "maintenance"} 
          label={v.available_stock > 0 ? "ACTIVE" : "OUT OF STOCK"}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vehicles</h1>
          <p className="text-muted-foreground">
            Manage your racing fleet inventory and availability.
          </p>
        </div>
        <Button asChild className="bg-black text-white hover:bg-gray-800">
          <Link href="/admin/vehicles/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={vehicles || []}
        isLoading={isLoading}
        actions={(v) => (
          <>
            <DropdownMenuItem asChild>
              <Link href={`/vehicles/${v.id}`} className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                View Public
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={`/admin/vehicles/${v.id}`}
                className="flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Vehicle
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setDeleteId(v.id)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutateAsync(deleteId);
        }}
        title="Delete Vehicle"
        description="Are you sure you want to remove this vehicle from the fleet? This action cannot be undone."
      />
    </div>
  );
}
