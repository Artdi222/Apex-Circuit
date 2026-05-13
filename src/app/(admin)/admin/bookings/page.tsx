"use client"

import { DataTable, Column } from "@/components/admin/data-table"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { StatusBadge } from "@/components/shared/status-badge"
import Link from "next/link"
import { Edit, CheckCircle, XCircle, UserCheck, UserMinus, Flag } from "lucide-react"
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { toast } from "sonner"

export default function AdminBookingsPage() {
  const queryClient = useQueryClient()

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: async () => {
      const res = await api.api.v1.bookings.get()
      if (res.error) {
        const errorValue = res.error.value as any;
        throw new Error(errorValue?.message || JSON.stringify(errorValue) || 'Failed to fetch bookings');
      }
      return res.data?.data?.bookings || []
    }
  })

  const confirmMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await (api.api.v1.bookings as any)[id].confirm.put()
      if (res.error) {
        const errorValue = res.error.value as any;
        throw new Error(errorValue?.message || 'Failed to confirm booking');
      }
      return res.data
    },
    onSuccess: () => {
      toast.success("Booking confirmed successfully")
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await (api.api.v1.bookings as any)[id].cancel.put()
      if (res.error) {
        const errorValue = res.error.value as any;
        throw new Error(errorValue?.message || 'Failed to cancel booking');
      }
      return res.data
    },
    onSuccess: () => {
      toast.success("Booking cancelled successfully")
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  const checkInMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await (api.api.v1.bookings as any)[id].checkIn.put()
      if (res.error) {
        const errorValue = res.error.value as any;
        throw new Error(errorValue?.message || 'Failed to check in booking');
      }
      return res.data
    },
    onSuccess: () => {
      toast.success("Booking checked in successfully")
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await (api.api.v1.bookings as any)[id].complete.put()
      if (res.error) {
        const errorValue = res.error.value as any;
        throw new Error(errorValue?.message || 'Failed to complete booking');
      }
      return res.data
    },
    onSuccess: () => {
      toast.success("Booking completed successfully")
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  const noShowMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await (api.api.v1.bookings as any)[id].noShow.put()
      if (res.error) {
        const errorValue = res.error.value as any;
        throw new Error(errorValue?.message || 'Failed to mark as no-show');
      }
      return res.data
    },
    onSuccess: () => {
      toast.success("Booking marked as no-show")
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  const columns: Column<any>[] = [
    {
      header: "Booking ID",
      cell: (b) => <span className="font-mono text-[10px] font-bold text-gray-400">#{b.id.slice(0, 8)}</span>
    },
    {
      header: "Driver",
      cell: (b) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900">{b.user?.username || "Unknown"}</span>
          <span className="text-[10px] text-gray-500">{b.user?.email}</span>
        </div>
      )
    },
    {
      header: "Session",
      cell: (b) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">
            {b.schedule_slot ? format(new Date(b.schedule_slot.date), "MMM d, yyyy") : "N/A"}
          </span>
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
            {b.schedule_slot?.start_time} - {b.schedule_slot?.end_time}
          </span>
        </div>
      )
    },
    {
      header: "Vehicle",
      cell: (b) => (
        <span className="text-sm">
          {b.vehicle ? b.vehicle.model : "Own Vehicle"}
        </span>
      )
    },
    {
      header: "Amount",
      cell: (b) => <span className="font-mono font-bold">${b.total_price}</span>
    },
    {
      header: "Status",
      cell: (b) => <StatusBadge status={b.status} />
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">All Bookings</h1>
        <p className="text-muted-foreground">Monitor and manage all track session reservations.</p>
      </div>

      <DataTable
        columns={columns}
        data={bookings || []}
        isLoading={isLoading}
        actions={(b) => (
          <>
            <DropdownMenuItem asChild>
              <Link href={`/admin/bookings/${b.id}`} className="flex items-center">
                <Edit className="h-4 w-4 mr-2" />
                Manage Booking
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            
            {/* Status Transitions */}
            {b.status === "pending" && (
              <DropdownMenuItem 
                className="text-green-600 focus:text-green-600"
                onClick={() => confirmMutation.mutate(b.id)}
                disabled={confirmMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {confirmMutation.isPending && confirmMutation.variables === b.id ? "Confirming..." : "Confirm"}
              </DropdownMenuItem>
            )}

            {b.status === "confirmed" && (
              <>
                <DropdownMenuItem 
                  className="text-blue-600 focus:text-blue-600"
                  onClick={() => checkInMutation.mutate(b.id)}
                  disabled={checkInMutation.isPending}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  {checkInMutation.isPending && checkInMutation.variables === b.id ? "Checking in..." : "Check In"}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-amber-600 focus:text-amber-600"
                  onClick={() => noShowMutation.mutate(b.id)}
                  disabled={noShowMutation.isPending}
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  {noShowMutation.isPending && noShowMutation.variables === b.id ? "Marking..." : "No Show"}
                </DropdownMenuItem>
              </>
            )}

            {b.status === "checked_in" && (
              <DropdownMenuItem 
                className="text-indigo-600 focus:text-indigo-600"
                onClick={() => completeMutation.mutate(b.id)}
                disabled={completeMutation.isPending}
              >
                <Flag className="h-4 w-4 mr-2" />
                {completeMutation.isPending && completeMutation.variables === b.id ? "Completing..." : "Complete Session"}
              </DropdownMenuItem>
            )}

            {/* Cancel Action */}
            {(b.status === "pending" || b.status === "confirmed") && (
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600"
                onClick={() => {
                  if (confirm("Are you sure you want to cancel this booking?")) {
                    cancelMutation.mutate(b.id)
                  }
                }}
                disabled={cancelMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                {cancelMutation.isPending && cancelMutation.variables === b.id ? "Cancelling..." : "Cancel"}
              </DropdownMenuItem>
            )}
          </>
        )}
      />
    </div>
  )
}


