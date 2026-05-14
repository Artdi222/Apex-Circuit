'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { IncidentCard } from '@/components/incidents/incident-card';
import { IncidentForm } from '@/components/incidents/incident-form';
import {
  Search, Plus, Check, ChevronsUpDown, AlertTriangle,
  ShieldAlert, Clock, Activity, Siren, FileWarning,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Incident {
  id: string;
  booking_id: string;
  type: 'damage' | 'accident' | 'mechanical' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  description: string;
  official_photos?: string[];
  user_photos?: string[];
  user_statement?: string | null;
  user_unable_to_respond: boolean;
  medical_response_required: boolean;
  medical_notes?: string | null;
  estimated_cost?: number | null;
  created_at: string;
  created_by_user?: { username: string };
  booking_user?: { username: string };
}

interface Booking {
  id: string;
  user: { username: string; email: string };
  vehicle?: { name: string; model?: string };
  equipment?: { name: string };
  schedule_slot?: { date: string; start_time: string; end_time: string };
  status: string;
}

export default function AdminIncidentsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [openBookingCombobox, setOpenBookingCombobox] = useState(false);

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ['admin', 'incidents', statusFilter, severityFilter],
    queryFn: async () => {
      const query: any = {};
      if (statusFilter !== 'all') query.status = statusFilter;
      if (severityFilter !== 'all') query.severity = severityFilter;
      const res = await api.api.v1.incidents.get({ query });
      if (res.error) throw new Error((res.error.value as any)?.message || 'Failed to load incidents');
      return (res.data as any)?.data || [];
    },
  });

  const { data: bookings = [], isLoading: isLoadingBookings } = useQuery({
    queryKey: ['admin', 'bookings-for-incidents'],
    queryFn: async () => {
      const res = await api.api.v1.bookings.get();
      if (res.error) throw new Error((res.error.value as any)?.message || 'Failed to load bookings');
      const raw = (res.data as any)?.data?.bookings || [];
      return raw.map((b: any) => ({
        id: b.id,
        user: b.user || { username: 'Unknown', email: '' },
        vehicle: b.vehicle || undefined,
        equipment: b.equipment?.[0] || undefined,
        schedule_slot: b.schedule_slot || undefined,
        status: b.status,
      })) as Booking[];
    },
    enabled: showCreateDialog,
  });

  const filtered = incidents.filter((incident: Incident) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      incident.description.toLowerCase().includes(q) ||
      incident.booking_user?.username.toLowerCase().includes(q) ||
      incident.booking_id.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: incidents.length,
    open: incidents.filter((i: Incident) => i.status === 'open').length,
    investigating: incidents.filter((i: Incident) => i.status === 'investigating').length,
    critical: incidents.filter((i: Incident) => i.severity === 'critical').length,
    awaiting: incidents.filter((i: Incident) => !i.user_statement && !i.user_unable_to_respond && i.status !== 'resolved').length,
    medical: incidents.filter((i: Incident) => i.medical_response_required).length,
  };

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    setSelectedBookingId('');
    queryClient.invalidateQueries({ queryKey: ['admin', 'incidents'] });
    toast.success('Incident report created successfully');
  };

  const getTabIncidents = (tab: string) => {
    switch (tab) {
      case 'critical': return filtered.filter((i: Incident) => i.severity === 'critical');
      case 'awaiting': return filtered.filter((i: Incident) => !i.user_statement && !i.user_unable_to_respond && i.status !== 'resolved');
      case 'medical': return filtered.filter((i: Incident) => i.medical_response_required);
      default: return filtered;
    }
  };

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Incident Reports</h1>
          <p className="text-muted-foreground">Manage and track all incident reports</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Report
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={FileWarning} label="Total" value={stats.total} />
        <StatCard icon={Activity} label="Open" value={stats.open} color="blue" />
        <StatCard icon={Search} label="Investigating" value={stats.investigating} color="yellow" />
        <StatCard icon={ShieldAlert} label="Critical" value={stats.critical} color="red" />
        <StatCard icon={Clock} label="Awaiting User" value={stats.awaiting} color="orange" />
        <StatCard icon={Siren} label="Medical" value={stats.medical} color="red" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by description, user, or booking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs + List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({filtered.length})</TabsTrigger>
          <TabsTrigger value="critical" className="gap-1">
            Critical
            {stats.critical > 0 && <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-[10px]">{stats.critical}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="awaiting">Awaiting ({stats.awaiting})</TabsTrigger>
          <TabsTrigger value="medical">Medical ({stats.medical})</TabsTrigger>
        </TabsList>

        {['all', 'critical', 'awaiting', 'medical'].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-3">
            {isLoading ? (
              <LoadingState />
            ) : getTabIncidents(tab).length === 0 ? (
              <EmptyState tab={tab} />
            ) : (
              <div className="grid gap-3">
                {getTabIncidents(tab).map((incident: Incident) => (
                  <IncidentCard
                    key={incident.id}
                    incident={incident}
                    href={`/admin/incidents/${incident.id}`}
                    showBookingInfo
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open: boolean) => {
        setShowCreateDialog(open);
        if (!open) setSelectedBookingId('');
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Incident Report</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Booking Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Associated Booking *</label>
              <Popover open={openBookingCombobox} onOpenChange={setOpenBookingCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      'w-full justify-between h-auto min-h-10 py-2',
                      !selectedBookingId && 'text-muted-foreground'
                    )}
                  >
                    {selectedBooking ? (
                      <div className="flex flex-col items-start text-left">
                        <span className="font-medium">{selectedBooking.user.username}</span>
                        <span className="text-xs text-muted-foreground">
                          {selectedBooking.vehicle?.model || selectedBooking.vehicle?.name || 'Own Vehicle'}
                          {selectedBooking.schedule_slot && ` • ${format(new Date(selectedBooking.schedule_slot.date), 'MMM d, yyyy')}`}
                        </span>
                      </div>
                    ) : (
                      'Select a booking...'
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search by name or booking ID..." />
                    <CommandList>
                      <CommandEmpty>
                        {isLoadingBookings ? 'Loading bookings...' : 'No bookings found.'}
                      </CommandEmpty>
                      <CommandGroup>
                        {bookings.map((booking) => (
                          <CommandItem
                            key={booking.id}
                            value={`${booking.user.username} ${booking.vehicle?.name || ''} ${booking.id}`}
                            onSelect={() => {
                              setSelectedBookingId(booking.id);
                              setOpenBookingCombobox(false);
                            }}
                            className="py-2"
                          >
                            <Check className={cn('mr-2 h-4 w-4', selectedBookingId === booking.id ? 'opacity-100' : 'opacity-0')} />
                            <div className="flex flex-col flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-medium truncate">{booking.user.username}</span>
                                <Badge variant="outline" className="ml-2 text-[10px] shrink-0">{booking.status}</Badge>
                              </div>
                              <span className="text-xs text-muted-foreground truncate">
                                {booking.vehicle?.model || booking.vehicle?.name || 'Own Vehicle'}
                                {booking.schedule_slot && ` • ${format(new Date(booking.schedule_slot.date), 'MMM d')} ${booking.schedule_slot.start_time}`}
                              </span>
                              <span className="text-[10px] text-muted-foreground/60 font-mono">#{booking.id.slice(0, 8)}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Form - only show after booking selected */}
            {selectedBookingId ? (
              <IncidentForm
                bookingId={selectedBookingId}
                onSuccess={handleCreateSuccess}
                onCancel={() => {
                  setShowCreateDialog(false);
                  setSelectedBookingId('');
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-lg">
                <AlertTriangle className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">Select a booking above to create an incident report</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Sub-components ---

function StatCard({ icon: Icon, label, value, color }: {
  icon: any; label: string; value: number; color?: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    orange: 'text-orange-600',
  };

  return (
    <Card>
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <Icon className={cn('h-4 w-4 text-muted-foreground', color && colorMap[color])} />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className={cn('text-2xl font-bold', color && colorMap[color])}>{value}</p>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
    </div>
  );
}

function EmptyState({ tab }: { tab: string }) {
  const messages: Record<string, { title: string; desc: string }> = {
    all: { title: 'No incidents found', desc: 'No incidents match your current filters.' },
    critical: { title: 'No critical incidents', desc: 'No critical severity incidents at this time.' },
    awaiting: { title: 'All caught up', desc: 'No incidents are awaiting user response.' },
    medical: { title: 'No medical incidents', desc: 'No incidents requiring medical response.' },
  };
  const { title, desc } = messages[tab] || messages.all;

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileWarning className="h-10 w-10 text-muted-foreground/40 mb-3" />
      <h3 className="font-medium text-muted-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground/70 mt-1">{desc}</p>
    </div>
  );
}
