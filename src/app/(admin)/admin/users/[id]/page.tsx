"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  User,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { format } from "date-fns"
import Link from "next/link"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
  superadmin: {
    label: "Super Admin",
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  admin: {
    label: "Admin",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  user: {
    label: "User",
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
}

export default function AdminUserDetailPage() {
  const { user: currentUser } = useAuth()
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const userId = params.id as string
  const [selectedRole, setSelectedRole] = useState<string>("")

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["admin", "user", userId],
    queryFn: async () => {
      const res = await api.api.v1.users({ id: userId }).get()
      if (res.error) throw new Error((res.error.value as any)?.message || "Failed to load user")
      return (res.data as any)?.data
    },
    enabled: !!userId,
  })

  const { data: userBookings = [] } = useQuery({
    queryKey: ["admin", "user-bookings", userId],
    queryFn: async () => {
      const res = await api.api.v1.bookings.get({ query: { user_id: userId } as any })
      if (res.error) return []
      const data = (res.data as any)?.data
      return data?.bookings || (Array.isArray(data) ? data : [])
    },
    enabled: !!userId,
  })

  const toggleStatusMutation = useMutation({
    mutationFn: async (isActive: boolean) => {
      const res = await api.api.v1.users({ id: userId }).status.put({ is_active: isActive })
      if (res.error) throw new Error((res.error.value as any)?.message || "Failed to update status")
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "user", userId] })
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
      toast.success("User status updated")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const changeRoleMutation = useMutation({
    mutationFn: async (role: string) => {
      const res = await api.api.v1.users({ id: userId }).role.put({ role: role as "admin" | "user" | "superadmin" })
      if (res.error) throw new Error((res.error.value as any)?.message || "Failed to change role")
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "user", userId] })
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
      toast.success("User role updated")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" className="gap-2" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" /> Back to Users
          </Link>
        </Button>
        <div className="text-center py-16">
          <User className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="font-medium text-muted-foreground">User not found</p>
        </div>
      </div>
    )
  }

  const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.user

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" className="gap-2 -ml-2" asChild>
        <Link href="/admin/users">
          <ArrowLeft className="h-4 w-4" /> Back to Users
        </Link>
      </Button>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-20 w-20 border-4 border-white shadow-lg shrink-0">
                <AvatarImage 
                  src={user.avatar_url ? (user.avatar_url.startsWith('http') ? user.avatar_url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/uploads/${user.avatar_url}`) : ''} 
                  alt={user.username} 
                  className="object-cover"
                />
                <AvatarFallback className="bg-gray-100 text-2xl font-bold text-gray-600">
                  {user.username?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-3 border-white",
                  user.is_active ? "bg-green-500" : "bg-red-500"
                )}
              />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{user.username}</h1>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <Badge variant="outline" className={cn("text-xs font-bold", roleConfig.color)}>
                    {roleConfig.label}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-bold",
                      user.is_active
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    )}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {user.email}
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> {user.phone}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined {format(new Date(user.created_at), "MMMM d, yyyy")}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Updated {format(new Date(user.updated_at), "MMM d, yyyy h:mm a")}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0">
              {user.id !== currentUser?.id && (currentUser?.role === "superadmin" || user.role === "user") && (
                <Button
                  variant={user.is_active ? "destructive" : "default"}
                  size="sm"
                  onClick={() => toggleStatusMutation.mutate(!user.is_active)}
                  disabled={toggleStatusMutation.isPending}
                  className="gap-1.5"
                >
                  {user.is_active ? (
                    <>
                      <UserX className="h-4 w-4" /> Deactivate
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4" /> Activate
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Role Management */}
        {currentUser?.role === "superadmin" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-gray-500" />
                Role Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Role</label>
                <div className="p-3 rounded-lg bg-gray-50 border">
                  <Badge variant="outline" className={cn("text-xs font-bold", roleConfig.color)}>
                    {roleConfig.label}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Change Role</label>
                <Select
                  value={selectedRole || user.role}
                  onValueChange={setSelectedRole}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="superadmin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                disabled={
                  !selectedRole ||
                  selectedRole === user.role ||
                  changeRoleMutation.isPending
                }
                onClick={() => {
                  if (selectedRole) changeRoleMutation.mutate(selectedRole)
                }}
              >
                {changeRoleMutation.isPending ? "Updating..." : "Update Role"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              Booking Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">
                  {userBookings.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Total Bookings</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">
                  {userBookings.filter((b: any) => b.status === "completed").length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Completed</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">
                  {userBookings.filter((b: any) => b.status === "confirmed" || b.status === "pending").length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Upcoming</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">
                  {userBookings.filter((b: any) => b.status === "cancelled").length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Cancelled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="User ID" value={user.id} mono />
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Username" value={user.username} />
            <InfoRow label="Phone" value={user.phone || "Not provided"} />
            <InfoRow
              label="Created"
              value={format(new Date(user.created_at), "PPP")}
            />
            <InfoRow
              label="Last Updated"
              value={format(new Date(user.updated_at), "PPP p")}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      {userBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userBookings.slice(0, 10).map((booking: any) => (
                <Link
                  key={booking.id}
                  href={`/admin/bookings/${booking.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 border border-transparent hover:border-gray-200 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-mono text-muted-foreground">
                      #{booking.id.slice(0, 8)}
                    </div>
                    <div>
                      <p className="text-sm font-medium group-hover:underline">
                        {booking.schedule_slot
                          ? format(new Date(booking.schedule_slot.date), "MMM d, yyyy")
                          : "Unknown date"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.vehicle?.name || "Own Vehicle"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold">
                      ${Number(booking.total_price || 0).toFixed(2)}
                    </span>
                    <StatusDot status={booking.status} />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs font-medium text-muted-foreground shrink-0">
        {label}
      </span>
      <span
        className={cn(
          "text-xs text-right truncate",
          mono && "font-mono text-[10px]"
        )}
      >
        {value}
      </span>
    </div>
  )
}

function StatusDot({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    pending: "bg-amber-500",
    confirmed: "bg-blue-500",
    checked_in: "bg-purple-500",
    completed: "bg-green-500",
    cancelled: "bg-red-500",
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("h-2 w-2 rounded-full", colorMap[status] || "bg-gray-400")} />
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {status?.replace("_", " ")}
      </span>
    </div>
  )
}
