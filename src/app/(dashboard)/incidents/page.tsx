'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { IncidentCard } from '@/components/incidents/incident-card';
import { AlertTriangle, CheckCircle, Clock, FileWarning } from 'lucide-react';
import { api } from '@/lib/api';

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

export default function UserIncidentsPage() {
  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ['user', 'incidents'],
    queryFn: async () => {
      const res = await api.api.v1.incidents.get();
      if (res.error) throw new Error((res.error.value as any)?.message || 'Failed to load incidents');
      return ((res.data as any)?.data || []) as Incident[];
    },
  });

  const needsResponse = incidents.filter(
    (i) => !i.user_statement && !i.user_unable_to_respond && i.status !== 'resolved'
  );
  const responded = incidents.filter((i) => !!i.user_statement);
  const resolved = incidents.filter((i) => i.status === 'resolved');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Incidents</h1>
        <p className="text-muted-foreground">View and respond to incident reports for your bookings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={FileWarning} label="Total" value={incidents.length} />
        <StatCard icon={Clock} label="Needs Response" value={needsResponse.length} color="orange" />
        <StatCard icon={CheckCircle} label="Responded" value={responded.length} color="blue" />
        <StatCard icon={AlertTriangle} label="Resolved" value={resolved.length} color="green" />
      </div>

      {/* Urgent Banner */}
      {needsResponse.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-orange-200 bg-orange-50">
          <Clock className="h-5 w-5 text-orange-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-900">
              {needsResponse.length} incident{needsResponse.length > 1 ? 's' : ''} need{needsResponse.length === 1 ? 's' : ''} your response
            </p>
            <p className="text-xs text-orange-700">Please provide your statement as soon as possible.</p>
          </div>
          <Badge variant="outline" className="border-orange-300 text-orange-700 shrink-0">Action Required</Badge>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue={needsResponse.length > 0 ? 'needs-response' : 'all'} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({incidents.length})</TabsTrigger>
          <TabsTrigger value="needs-response" className="gap-1">
            Needs Response
            {needsResponse.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-[10px]">{needsResponse.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="responded">Responded ({responded.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolved.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          <IncidentList incidents={incidents} isLoading={isLoading} emptyTitle="No incidents" emptyDesc="You don't have any incident reports. This is a good thing!" />
        </TabsContent>

        <TabsContent value="needs-response" className="space-y-3">
          <IncidentList incidents={needsResponse} isLoading={isLoading} emptyTitle="All caught up" emptyDesc="No incidents need your response right now." />
        </TabsContent>

        <TabsContent value="responded" className="space-y-3">
          <IncidentList incidents={responded} isLoading={isLoading} emptyTitle="No responses yet" emptyDesc="You haven't responded to any incidents yet." />
        </TabsContent>

        <TabsContent value="resolved" className="space-y-3">
          <IncidentList incidents={resolved} isLoading={isLoading} emptyTitle="No resolved incidents" emptyDesc="No incidents have been resolved yet." />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function IncidentList({ incidents, isLoading, emptyTitle, emptyDesc }: {
  incidents: Incident[]; isLoading: boolean; emptyTitle: string; emptyDesc: string;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileWarning className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <h3 className="font-medium text-muted-foreground">{emptyTitle}</h3>
        <p className="text-sm text-muted-foreground/70 mt-1">{emptyDesc}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {incidents.map((incident) => (
        <IncidentCard
          key={incident.id}
          incident={incident}
          href={`/incidents/${incident.id}`}
        />
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: any; label: string; value: number; color?: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
  };

  return (
    <Card>
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <Icon className={`h-4 w-4 ${color ? colorMap[color] : 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className={`text-2xl font-bold ${color ? colorMap[color] : ''}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
