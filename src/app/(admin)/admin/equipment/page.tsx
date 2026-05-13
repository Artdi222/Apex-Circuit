"use client"

import { DataTable, Column } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Edit } from "lucide-react"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { StatusBadge } from "@/components/shared/status-badge"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { useState } from "react"
import { toast } from "sonner"
import Image from "next/image"
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { cn, parseImages, getImageUrl } from "@/lib/utils"

export default function EquipmentPage() {
  const queryClient = useQueryClient()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: equipment, isLoading } = useQuery({
    queryKey: ["admin", "equipment"],
    queryFn: async () => {
      const res = await api.api.v1.equipment.get()
      if (res.error) throw new Error((res.error.value as any)?.message || JSON.stringify(res.error.value))
      const list = (res.data as any)?.data?.items || (res.data as any)?.data?.equipment || (Array.isArray((res.data as any)?.data) ? (res.data as any)?.data : [])
      return list.map((e: any) => ({ ...e, images: parseImages(e.images) }))
    },
    staleTime: 0,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.api.v1.equipment({ id }).delete()
      if (res.error) throw new Error((res.error.value as any)?.message || JSON.stringify(res.error.value))
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "equipment"] })
      queryClient.invalidateQueries({ queryKey: ["equipment"] })
      toast.success("Equipment deleted successfully")
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete equipment")
    }
  })

  const columns: Column<any>[] = [
    {
      header: "Equipment",
      cell: (e) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 relative rounded bg-gray-100 overflow-hidden border">
            {e.images?.[0] ? (
              <Image src={getImageUrl(e.images[0])} fill className="object-cover" alt={e.name} />
            ) : (
              <div className="flex items-center justify-center h-full text-[8px] text-gray-400 font-bold uppercase">No Pic</div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">{e.name}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{e.category}</span>
          </div>
        </div>
      )
    },
    {
      header: "Size",
      accessorKey: "size"
    },
    {
      header: "Stock",
      cell: (e) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-sm">{e.available_quantity}</span>
          <span className="text-xs text-gray-400">/ {e.stock_quantity}</span>
        </div>
      )
    },
    {
      header: "Price",
      cell: (e) => <span className="font-mono font-bold">${e.rental_price}</span>
    },
    {
      header: "Status",
      cell: (e) => <StatusBadge status={e.status} />
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Equipment</h1>
          <p className="text-muted-foreground">Manage racing gear inventory and stock levels.</p>
        </div>
        <Button asChild className="bg-black text-white hover:bg-gray-800">
          <Link href="/admin/equipment/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={equipment || []}
        isLoading={isLoading}
        actions={(e) => (
          <>
            <DropdownMenuItem asChild>
              <Link href={`/admin/equipment/${e.id}`} className="flex items-center">
                <Edit className="h-4 w-4 mr-2" />
                Edit Equipment
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setDeleteId(e.id)}
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
        onConfirm={async () => {
          if (deleteId) {
            await deleteMutation.mutateAsync(deleteId)
            setDeleteId(null)
          }
        }}
        title="Delete Equipment"
        description="Are you sure you want to remove this equipment from inventory?"
      />
    </div>
  )
}
