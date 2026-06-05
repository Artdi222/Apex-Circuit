"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Search,
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Shield,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { format } from "date-fns"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"

interface User {
  id: string
  email: string
  username: string
  phone?: string | null
  role: "user" | "admin" | "superadmin"
  avatar_url?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  superadmin: {
    label: "Super Admin",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: ShieldCheck,
  },
  admin: {
    label: "Admin",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Shield,
  },
  user: {
    label: "User",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: Users,
  },
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [newRole, setNewRole] = useState<string>("")
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["admin", "users", roleFilter, statusFilter],
    queryFn: async () => {
      const query: any = {}
      if (roleFilter !== "all") query.role = roleFilter
      if (statusFilter !== "all") query.is_active = statusFilter === "active"
      const res = await api.api.v1.users.get({ query })
      if (res.error) throw new Error((res.error.value as any)?.message || "Failed to load users")
      return (res.data as any)?.data
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const res = await api.api.v1.users({ id: userId }).status.put({
        is_active: isActive,
      })
      if (res.error) throw new Error((res.error.value as any)?.message || "Failed to update status")
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
      toast.success("User status updated successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await api.api.v1.users({ id: userId }).role.put({ role: role as "admin" | "user" | "superadmin" })
      if (res.error) throw new Error((res.error.value as any)?.message || "Failed to change role")
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
      setShowRoleDialog(false)
      setSelectedUser(null)
      toast.success("User role updated successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.api.v1.users({ id: userId }).delete()
      if (res.error) throw new Error((res.error.value as any)?.message || "Failed to delete user")
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
      setDeleteUserId(null)
      toast.success("User deleted successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const users: User[] = Array.isArray(usersData) ? usersData : usersData?.users || []

  const filtered = users.filter((user) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      user.username.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.phone?.toLowerCase().includes(q)
    )
  })

  const stats = {
    total: users.length,
    active: users.filter((u) => u.is_active).length,
    inactive: users.filter((u) => !u.is_active).length,
    admins: users.filter((u) => u.role === "admin" || u.role === "superadmin").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage user accounts, roles, and permissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat icon={Users} label="Total Users" value={stats.total} />
        <MiniStat icon={UserCheck} label="Active" value={stats.active} color="green" />
        <MiniStat icon={UserX} label="Inactive" value={stats.inactive} color="red" />
        <MiniStat icon={ShieldCheck} label="Admins" value={stats.admins} color="purple" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="superadmin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="font-medium text-muted-foreground">No users found</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                      User
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3 hidden md:table-cell">
                      Contact
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                      Role
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                      Status
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3 hidden lg:table-cell">
                      Joined
                    </th>
                    <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((user) => {
                    const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.user
                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="flex items-center gap-3 group"
                          >
                            <Avatar className="h-9 w-9 border border-gray-200 shadow-sm shrink-0 group-hover:border-black transition-colors">
                              <AvatarImage 
                                src={user.avatar_url ? (user.avatar_url.startsWith('http') ? user.avatar_url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/uploads/${user.avatar_url}`) : ''} 
                                alt={user.username} 
                                className="object-cover"
                              />
                              <AvatarFallback className="bg-gray-100 text-gray-600 font-bold group-hover:bg-black group-hover:text-white transition-colors">
                                {user.username?.[0]?.toUpperCase() || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 group-hover:underline">
                                {user.username}
                              </p>
                              <p className="text-xs text-muted-foreground md:hidden">
                                {user.email}
                              </p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="space-y-0.5">
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </p>
                            {user.phone && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {user.phone}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] font-bold", roleConfig.color)}
                          >
                            {roleConfig.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <div
                              className={cn(
                                "h-2 w-2 rounded-full",
                                user.is_active ? "bg-green-500" : "bg-red-500"
                              )}
                            />
                            <span className="text-xs font-medium text-muted-foreground">
                              {user.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(user.created_at), "MMM d, yyyy")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {user.id !== currentUser?.id && (currentUser?.role === "superadmin" || user.role === "user") && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() =>
                                  toggleStatusMutation.mutate({
                                    userId: user.id,
                                    isActive: !user.is_active,
                                  })
                                }
                              >
                                {user.is_active ? "Deactivate" : "Activate"}
                              </Button>
                            )}
                            {currentUser?.role === "superadmin" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => {
                                  setSelectedUser(user)
                                  setNewRole(user.role)
                                  setShowRoleDialog(true)
                                }}
                              >
                                Role
                              </Button>
                            )}
                            {currentUser?.role === "superadmin" && user.id !== currentUser?.id && (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-7 text-xs bg-red-600 hover:bg-red-750 text-white"
                                onClick={() => setDeleteUserId(user.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                Delete
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              asChild
                            >
                              <Link href={`/admin/users/${user.id}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <Avatar className="h-10 w-10 border border-gray-200">
                  <AvatarImage 
                    src={selectedUser.avatar_url ? (selectedUser.avatar_url.startsWith('http') ? selectedUser.avatar_url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/uploads/${selectedUser.avatar_url}`) : ''} 
                    alt={selectedUser.username} 
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gray-200 text-gray-600 font-bold">
                    {selectedUser.username?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{selectedUser.username}</p>
                  <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">New Role</label>
                <Select value={newRole} onValueChange={setNewRole}>
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
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedUser) {
                  changeRoleMutation.mutate({
                    userId: selectedUser.id,
                    role: newRole,
                  })
                }
              }}
              disabled={changeRoleMutation.isPending}
            >
              {changeRoleMutation.isPending ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteUserId}
        onOpenChange={(open) => !open && setDeleteUserId(null)}
        onConfirm={async () => {
          if (deleteUserId) {
            await deleteUserMutation.mutateAsync(deleteUserId)
          }
        }}
        title="Delete User"
        description="Are you sure you want to delete this user? This action is permanent and cannot be undone."
      />
    </div>
  )
}

// --- Mini Stat Sub-component ---
function MiniStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any
  label: string
  value: number
  color?: string
}) {
  const colorMap: Record<string, string> = {
    green: "text-green-600",
    red: "text-red-600",
    purple: "text-purple-600",
    blue: "text-blue-600",
  }

  return (
    <Card>
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <Icon
          className={cn(
            "h-4 w-4 text-muted-foreground",
            color && colorMap[color]
          )}
        />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className={cn("text-2xl font-bold", color && colorMap[color])}>
          {value}
        </p>
      </CardContent>
    </Card>
  )
}
