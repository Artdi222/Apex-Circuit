"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { ChevronLeft, CheckCircle, XCircle, PlayCircle, Flag, Ban } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { unwrap } from "@/lib/api"
import { Label } from "@/components/ui/label"

export default function AdminBookingDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: booking, isLoading } = useQuery({
    queryKey: ["admin", "bookings", id],
    queryFn: async () => {
      const res = await api.api.v1.bookings({ id: id as string }).get()
      return unwrap(res)
    },
    enabled: !!id
  })

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      let res: any
      if (status === "confirmed") res = await api.api.v1.bookings({ id: id as string }).confirm.put()
      else if (status === "cancelled") res = await api.api.v1.bookings({ id: id as string }).cancel.put()
      else if (status === "checked_in") res = await api.api.v1.bookings({ id: id as string }).checkIn.put()
      else if (status === "completed") res = await api.api.v1.bookings({ id: id as string }).complete.put()
      else if (status === "no_show") res = await api.api.v1.bookings({ id: id as string }).noShow.put()
      else throw new Error("Invalid status")

      return unwrap(res)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings", id] })
      toast.success("Booking status updated")
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update status")
    }
  })

  if (isLoading) return <div className="flex h-64 items-center justify-center">Loading booking...</div>
  if (!booking) return <div className="text-center py-12">Booking not found.</div>

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/bookings">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Booking Details</h1>
            <p className="text-sm text-muted-foreground">ID: {booking.id}</p>
          </div>
        </div>
        <StatusBadge status={booking.status} className="px-4 py-1 text-sm" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-y-6">
              <div>
                <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Date</Label>
                <p className="text-lg font-bold text-gray-900">
                  {booking.schedule_slot ? format(new Date(booking.schedule_slot.date), "EEEE, MMMM do, yyyy") : "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Time Slot</Label>
                <p className="text-lg font-bold text-gray-900">
                  {booking.schedule_slot?.start_time} - {booking.schedule_slot?.end_time}
                </p>
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Vehicles</Label>
                {booking.vehicles && booking.vehicles.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {booking.vehicles.map((v: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm bg-gray-50 p-2 rounded border">
                        <span className="font-semibold text-gray-900">{v.model} ({v.year})</span>
                        <span className="text-gray-500">{v.internal_id}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-semibold text-gray-900 mt-1">Own Vehicle</p>
                )}
              </div>
              {booking.equipment && booking.equipment.length > 0 && (
                <div className="col-span-2">
                  <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Equipment</Label>
                  <div className="mt-2 space-y-2">
                    {booking.equipment.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm bg-gray-50 p-2 rounded border">
                        <span className="font-semibold text-gray-900">{item.equipment_name || item.name}</span>
                        <span className="text-gray-500">Qty: {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="col-span-2 pt-4 border-t border-gray-100">
                <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Price</Label>
                <p className="text-xl font-black text-gray-900">${booking.total_price}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Driver Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-400">
                {booking.user?.username?.[0] || "U"}
              </div>
              <div className="grid grid-cols-2 flex-1 gap-4">
                <div>
                  <Label className="text-[10px] text-muted-foreground uppercase font-bold">Name</Label>
                  <p className="font-bold text-gray-900">{booking.user?.username}</p>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground uppercase font-bold">Email</Label>
                  <p className="text-sm font-medium">{booking.user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          <Card className="border-2 border-black/5 shadow-lg">
            <CardHeader>
              <CardTitle>Manage Status</CardTitle>
              <CardDescription>Update the lifecycle of this booking.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {booking.status === "pending" && (
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
                  onClick={() => updateStatusMutation.mutate("confirmed")}
                  loading={updateStatusMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Booking
                </Button>
              )}
              
              {booking.status === "confirmed" && (
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  onClick={() => updateStatusMutation.mutate("checked_in")}
                  loading={updateStatusMutation.isPending}
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Check-in Driver
                </Button>
              )}

              {booking.status === "checked_in" && (
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                  onClick={() => updateStatusMutation.mutate("completed")}
                  loading={updateStatusMutation.isPending}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Mark Completed
                </Button>
              )}

              {["pending", "confirmed"].includes(booking.status) && (
                <>
                  <Separator />
                  <Button 
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => updateStatusMutation.mutate("cancelled")}
                    loading={updateStatusMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Booking
                  </Button>
                  <Button 
                    variant="ghost"
                    className="w-full text-gray-500 hover:text-red-600"
                    onClick={() => updateStatusMutation.mutate("no_show")}
                    loading={updateStatusMutation.isPending}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Mark No-Show
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 italic">
                {booking.notes || "No additional notes provided for this booking."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

