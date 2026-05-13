"use client"

import { DataTable, Column } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import { Plus, CalendarDays, Ban, CheckCircle, Trash2 } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api, unwrap } from "@/lib/api"
import { StatusBadge } from "@/components/shared/status-badge"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { useState } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { AddSlotDialog, GenerateSlotsDialog } from "./schedule-dialogs"

export default function SchedulesPage() {
  const queryClient = useQueryClient()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [isCleaning, setIsCleaning] = useState(false)

  const { data: slots, isLoading } = useQuery({
    queryKey: ["admin", "schedules"],
    queryFn: async () => {
      const res = await api.api.v1.schedules.get()
      return unwrap(res).slots || []
    }
  })

  const blockMutation = useMutation({
    mutationFn: async ({ id, block }: { id: string, block: boolean }) => {
      if (block) {
        const res = await api.api.v1.schedules({ id }).block.put({} as any)
        return unwrap(res)
      } else {
        const res = await api.api.v1.schedules({ id }).put({ status: "available" } as any)
        return unwrap(res)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "schedules"] })
      toast.success("Slot status updated")
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update slot status")
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.api.v1.schedules({ id }).delete()
      return unwrap(res)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "schedules"] })
      toast.success("Slot removed")
    }
  })

  const cleanupMutation = useMutation({
    mutationFn: async () => {
      const now = new Date()
      const pastEmptySlots = (slots || []).filter(s => {
        try {
          const datePart = typeof s.date === 'string' ? s.date.split('T')[0] : format(new Date(s.date), 'yyyy-MM-dd')
          const timePart = s.end_time.substring(0, 5)
          const slotEnd = new Date(`${datePart}T${timePart}`)
          
          return slotEnd < now && Number(s.current_bookings || 0) === 0
        } catch (e) {
          return false
        }
      })
      
      if (pastEmptySlots.length === 0) return { count: 0 }
      
      await Promise.all(pastEmptySlots.map(s => api.api.v1.schedules({ id: s.id }).delete()))
      return { count: pastEmptySlots.length }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "schedules"] })
      if (data.count > 0) {
        toast.success(`Removed ${data.count} expired empty slots`)
      } else {
        toast.info("No expired empty slots found to remove")
      }
      setIsCleaning(false)
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to cleanup slots")
      setIsCleaning(false)
    }
  })

  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await api.api.v1.schedules.post({
        ...values,
        date: format(values.date, "yyyy-MM-dd"),
      })
      return unwrap(res)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "schedules"] })
      toast.success("Schedule slot created")
      setIsAddOpen(false)
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create slot")
    }
  })

  const generateMutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await api.api.v1.schedules.generate.post({
        ...values,
        date_from: format(values.date_from, "yyyy-MM-dd"),
        date_to: format(values.date_to, "yyyy-MM-dd"),
      })
      return unwrap(res)
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "schedules"] })
      toast.success(`Generated ${data.generated} slots (${data.created} created, ${data.skipped} skipped)`)
      setIsGenerateOpen(false)
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to generate slots")
    }
  })

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)

  const filteredSlots = (slots || []).filter(s => {
    if (showHistory) return true
    try {
      const now = new Date()
      const datePart = typeof s.date === 'string' ? s.date.split('T')[0] : format(new Date(s.date), 'yyyy-MM-dd')
      const timePart = s.end_time.substring(0, 5)
      const slotEnd = new Date(`${datePart}T${timePart}`)
      
      return slotEnd >= now
    } catch (e) {
      return true
    }
  })

  const columns: Column<any>[] = [
    {
      header: "Date",
      cell: (s) => <span className="font-bold">{format(new Date(s.date), "MMM d, yyyy")}</span>
    },
    {
      header: "Time",
      cell: (s) => (
        <span className="font-mono text-sm font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
          {s.start_time} - {s.end_time}
        </span>
      )
    },
    {
      header: "Type",
      cell: (s) => <StatusBadge status={s.slot_type === 'maintenance' ? 'maintenance' : `track_${s.slot_type}`} />
    },
    {
      header: "Capacity",
      cell: (s) => (
        <div className="flex items-center gap-2">
          <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full bg-black transition-all",
                (s.current_bookings / s.max_capacity) >= 1 ? "bg-red-500" : ""
              )}
              style={{ width: `${(s.current_bookings / s.max_capacity) * 100}%` }}
            ></div>
          </div>
          <span className="text-xs font-mono font-bold">
            {s.current_bookings}/{s.max_capacity}
          </span>
        </div>
      )
    },
    {
      header: "Status",
      cell: (s) => {
        try {
          const datePart = typeof s.date === 'string' ? s.date.split('T')[0] : format(new Date(s.date), 'yyyy-MM-dd')
          const startPart = s.start_time.substring(0, 5)
          const endPart = s.end_time.substring(0, 5)
          
          const now = new Date()
          const slotStart = new Date(`${datePart}T${startPart}`)
          const slotEnd = new Date(`${datePart}T${endPart}`)
          
          const isRunning = now >= slotStart && now <= slotEnd
          const hasPassed = now > slotEnd
          const isEmpty = Number(s.current_bookings || 0) === 0

          return (
            <div className="flex items-center gap-2">
              <StatusBadge status={s.status} />
              {isRunning && (
                <span className="text-[10px] font-bold text-blue-600 border border-blue-200 px-1 rounded uppercase animate-pulse">
                  Live
                </span>
              )}
              {isRunning && isEmpty && (
                <span className="text-[10px] font-bold text-amber-600 border border-amber-200 px-1 rounded uppercase">
                  Empty
                </span>
              )}
              {hasPassed && (
                <span className="text-[10px] font-bold text-gray-400 border border-gray-200 px-1 rounded uppercase">
                  Passed
                </span>
              )}
            </div>
          )
        } catch (e) {
          return <StatusBadge status={s.status} />
        }
      }
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Track Schedule</h1>
          <p className="text-muted-foreground">Manage time slots, capacity, and maintenance blocks.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 hover:text-red-600"
            onClick={() => {
              setIsCleaning(true)
              cleanupMutation.mutate()
            }}
            disabled={isCleaning}
          >
            {isCleaning ? "Cleaning..." : "Clean Up Past"}
          </Button>
          <Button variant="outline" onClick={() => setIsGenerateOpen(true)}>
            <CalendarDays className="h-4 w-4 mr-2" />
            Generate Weekly
          </Button>
          <Button className="bg-black text-white hover:bg-gray-800" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Slot
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg border border-gray-100 w-fit">
        <Checkbox 
          id="show-history" 
          checked={showHistory} 
          onCheckedChange={(checked) => setShowHistory(checked === true)}
        />
        <Label htmlFor="show-history" className="text-sm font-medium cursor-pointer">
          Show past schedules
        </Label>
      </div>

      <DataTable
        columns={columns}
        data={filteredSlots}
        isLoading={isLoading}
        actions={(s) => (
          <>
            {s.status === "available" ? (
              <DropdownMenuItem onClick={() => blockMutation.mutate({ id: s.id, block: true })}>
                <Ban className="h-4 w-4 mr-2" />
                Block (Maintenance)
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => blockMutation.mutate({ id: s.id, block: false })}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Unblock
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => setDeleteId(s.id)}
              className="text-red-600 focus:text-red-600"
              disabled={s.current_bookings > 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Slot
            </DropdownMenuItem>
          </>
        )}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        onConfirm={async () => {
          if (deleteId) await deleteMutation.mutateAsync(deleteId)
        }}
        title="Delete Schedule Slot"
        description="Are you sure you want to remove this time slot? This cannot be undone if there are no bookings."
      />

      <AddSlotDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSubmit={async (values) => {
          await createMutation.mutateAsync(values)
        }}
        isLoading={createMutation.isPending}
      />

      <GenerateSlotsDialog
        open={isGenerateOpen}
        onOpenChange={setIsGenerateOpen}
        onSubmit={async (values) => {
          await generateMutation.mutateAsync(values)
        }}
        isLoading={generateMutation.isPending}
      />
    </div>
  )
}


