"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Save, Settings, RefreshCw, Bell, Shield, Sliders, DollarSign } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface Setting {
  key: string
  value: any
  updated_at?: string | null
  is_default?: boolean
}

interface AuditLog {
  id: string
  action: string
  entity: string
  entity_id?: string | null
  created_at: string
  user_info: {
    id: string
    username: string
    email: string
    role: string
  }
}

export default function AdminSettingsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [hasChanges, setHasChanges] = useState(false)

  if (user?.role !== "superadmin") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Shield className="h-16 w-16 text-red-500/50" />
        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permission to view or edit system settings.</p>
      </div>
    )
  }

  const { data: settings = [], isLoading: isLoadingSettings } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const res = await api.api.v1.settings.get()
      if (res.error) throw new Error((res.error.value as any)?.message || "Failed to load settings")
      return (res.data as any)?.data as Setting[]
    },
  })

  const { data: auditLogsRes, isLoading: isLoadingLogs } = useQuery({
    queryKey: ["admin", "audit-logs"],
    queryFn: async () => {
      const res = await api.api.v1.settings["audit-logs"].get({ query: { limit: "50" } })
      if (res.error) throw new Error((res.error.value as any)?.message || "Failed to load audit logs")
      return (res.data as any)?.data
    },
  })
  
  const auditLogs = auditLogsRes?.logs || []

  // Initialize form data when settings load
  useEffect(() => {
    if (settings.length > 0) {
      const initialData: Record<string, any> = {}
      settings.forEach((s) => {
        initialData[s.key] = s.value
      })
      setFormData(initialData)
      setHasChanges(false)
    }
  }, [settings])

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value }
      
      // Check if there are changes
      let changed = false
      settings.forEach((s) => {
        if (JSON.stringify(s.value) !== JSON.stringify(next[s.key])) {
          changed = true
        }
      })
      
      setHasChanges(changed)
      return next
    })
  }

  const saveSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: { key: string; value: any }[]) => {
      const res = await api.api.v1.settings.put({ settings: updatedSettings })
      if (res.error) throw new Error((res.error.value as any)?.message || "Failed to save settings")
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] })
      queryClient.invalidateQueries({ queryKey: ["admin", "audit-logs"] })
      queryClient.invalidateQueries({ queryKey: ["public-settings"] })
      toast.success("Settings saved successfully")
      setHasChanges(false)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleSave = () => {
    const updatedSettings = []
    for (const s of settings) {
      if (JSON.stringify(s.value) !== JSON.stringify(formData[s.key])) {
        updatedSettings.push({ key: s.key, value: formData[s.key] })
      }
    }

    if (updatedSettings.length > 0) {
      saveSettingsMutation.mutate(updatedSettings)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage application configuration and view audit logs
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || saveSettingsMutation.isPending}
          className="gap-2"
        >
          {saveSettingsMutation.isPending ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <Sliders className="h-4 w-4" /> General
          </TabsTrigger>
          <TabsTrigger value="booking" className="gap-2">
            <Settings className="h-4 w-4" /> Booking Rules
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="pricing" className="gap-2">
            <DollarSign className="h-4 w-4" /> Pricing & Rates
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <Shield className="h-4 w-4" /> Audit Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic site configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingSettings ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4 max-w-xl">
                  <div className="space-y-2">
                    <Label htmlFor="site.name">Site Name</Label>
                    <Input
                      id="site.name"
                      value={formData["site.name"] || ""}
                      onChange={(e) => handleInputChange("site.name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site.description">Site Description</Label>
                    <Textarea
                      id="site.description"
                      value={formData["site.description"] || ""}
                      onChange={(e) => handleInputChange("site.description", e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="booking">
          <Card>
            <CardHeader>
              <CardTitle>Booking & Schedule Rules</CardTitle>
              <CardDescription>Configure constraints and defaults for track bookings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingSettings ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-6 max-w-xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="booking.max_participants">Max Participants (Default)</Label>
                      <Input
                        id="booking.max_participants"
                        type="number"
                        value={formData["booking.max_participants"] || ""}
                        onChange={(e) => handleInputChange("booking.max_participants", parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="booking.cancellation_hours">Cancellation Window (Hours)</Label>
                      <Input
                        id="booking.cancellation_hours"
                        type="number"
                        value={formData["booking.cancellation_hours"] || ""}
                        onChange={(e) => handleInputChange("booking.cancellation_hours", parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="schedule.default_slot_duration_minutes">Default Slot Duration (Min)</Label>
                      <Input
                        id="schedule.default_slot_duration_minutes"
                        type="number"
                        value={formData["schedule.default_slot_duration_minutes"] || ""}
                        onChange={(e) => handleInputChange("schedule.default_slot_duration_minutes", parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="schedule.default_max_capacity">Default Track Capacity</Label>
                      <Input
                        id="schedule.default_max_capacity"
                        type="number"
                        value={formData["schedule.default_max_capacity"] || ""}
                        onChange={(e) => handleInputChange("schedule.default_max_capacity", parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="schedule.default_start_time">Default Start Time</Label>
                      <Input
                        id="schedule.default_start_time"
                        placeholder="08:00"
                        value={formData["schedule.default_start_time"] || ""}
                        onChange={(e) => handleInputChange("schedule.default_start_time", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="schedule.default_end_time">Default End Time</Label>
                      <Input
                        id="schedule.default_end_time"
                        placeholder="17:00"
                        value={formData["schedule.default_end_time"] || ""}
                        onChange={(e) => handleInputChange("schedule.default_end_time", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="booking.auto_confirm">Auto-Confirm Bookings</Label>
                        <p className="text-sm text-muted-foreground">Automatically confirm new bookings without admin approval</p>
                      </div>
                      <Switch
                        id="booking.auto_confirm"
                        checked={!!formData["booking.auto_confirm"]}
                        onCheckedChange={(c) => handleInputChange("booking.auto_confirm", c)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="booking.require_agreement">Require Safety Agreement</Label>
                        <p className="text-sm text-muted-foreground">Require users to accept safety waiver during booking</p>
                      </div>
                      <Switch
                        id="booking.require_agreement"
                        checked={!!formData["booking.require_agreement"]}
                        onCheckedChange={(c) => handleInputChange("booking.require_agreement", c)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Email and system notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingSettings ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4 max-w-xl">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notification.email_enabled">Enable Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Master switch for all system emails</p>
                    </div>
                    <Switch
                      id="notification.email_enabled"
                      checked={!!formData["notification.email_enabled"]}
                      onCheckedChange={(c) => handleInputChange("notification.email_enabled", c)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notification.booking_confirmation">Booking Confirmation Emails</Label>
                      <p className="text-sm text-muted-foreground">Send email when booking is confirmed</p>
                    </div>
                    <Switch
                      id="notification.booking_confirmation"
                      checked={!!formData["notification.booking_confirmation"]}
                      onCheckedChange={(c) => handleInputChange("notification.booking_confirmation", c)}
                    />
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <div className="space-y-2">
                      <Label htmlFor="notification.booking_reminder_hours">Reminder Notice (Hours before slot)</Label>
                      <Input
                        id="notification.booking_reminder_hours"
                        type="number"
                        value={formData["notification.booking_reminder_hours"] || ""}
                        onChange={(e) => handleInputChange("notification.booking_reminder_hours", parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Revenue Rules</CardTitle>
              <CardDescription>Configure base rates, taxes, and surge pricing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingSettings ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-6 max-w-xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pricing.base_rate_open">Base Rate - Open Session ($/hr)</Label>
                      <Input
                        id="pricing.base_rate_open"
                        type="number"
                        value={formData["pricing.base_rate_open"] || ""}
                        onChange={(e) => handleInputChange("pricing.base_rate_open", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pricing.base_rate_exclusive">Base Rate - Exclusive ($/hr)</Label>
                      <Input
                        id="pricing.base_rate_exclusive"
                        type="number"
                        value={formData["pricing.base_rate_exclusive"] || ""}
                        onChange={(e) => handleInputChange("pricing.base_rate_exclusive", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pricing.tax_rate">Tax Rate (%)</Label>
                      <Input
                        id="pricing.tax_rate"
                        type="number"
                        value={formData["pricing.tax_rate"] || ""}
                        onChange={(e) => handleInputChange("pricing.tax_rate", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pricing.weekend_surge_percent">Weekend Surge (%)</Label>
                      <Input
                        id="pricing.weekend_surge_percent"
                        type="number"
                        value={formData["pricing.weekend_surge_percent"] || ""}
                        onChange={(e) => handleInputChange("pricing.weekend_surge_percent", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>System Audit Logs</CardTitle>
              <CardDescription>Recent administrative actions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingLogs ? (
                <div className="flex justify-center py-12">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Shield className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="font-medium text-muted-foreground">No audit logs found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50/50">
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                          Time
                        </th>
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                          User
                        </th>
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                          Action
                        </th>
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                          Entity
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {auditLogs.map((log: AuditLog) => (
                        <tr key={log.id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-muted-foreground">
                            {format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{log.user_info?.username}</span>
                              <Badge variant="outline" className="text-[10px] h-4 px-1 py-0">
                                {log.user_info?.role}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <Badge variant="secondary" className="font-mono text-xs font-normal">
                              {log.action}
                            </Badge>
                          </td>
                          <td className="px-6 py-3">
                            <span className="text-sm">
                              {log.entity}
                              {log.entity_id && (
                                <span className="text-muted-foreground ml-1">({log.entity_id})</span>
                              )}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
