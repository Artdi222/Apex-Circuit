'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { IncidentTypeBadge, IncidentSeverityBadge, IncidentStatusBadge } from '@/components/incidents/incident-badge';
import {
  ArrowLeft, CheckCircle, Clock, AlertCircle, Siren,
  User, Calendar, DollarSign, Shield, FileText,
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import { getImageUrl } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';

interface Incident {
  id: string;
  booking_id: string;
  type: 'damage' | 'accident' | 'mechanical' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: IncidentStatus;
  description: string;
  official_photos?: string[];
  user_photos?: string[];
  user_statement?: string | null;
  user_responded_at?: string | null;
  user_unable_to_respond: boolean;
  medical_response_required: boolean;
  medical_notes?: string | null;
  estimated_cost?: number | null;
  resolution_notes?: string | null;
  insurance_claim_number?: string | null;
  police_report_number?: string | null;
  witnesses?: Array<{ name: string; contact?: string; statement: string; added_at: string }>;
  created_at: string;
  created_by_user?: { username: string; avatar_url?: string | null };
  booking?: { id: string };
  booking_user?: { username: string; email: string; avatar_url?: string | null };
}

function parseJsonArray(val: any): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try { const parsed = JSON.parse(val); return Array.isArray(parsed) ? parsed : []; }
    catch { return []; }
  }
  return [];
}

export default function AdminIncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const incidentId = params.id as string;

  const [status, setStatus] = useState<IncidentStatus>('open');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [insuranceClaim, setInsuranceClaim] = useState('');
  const [policeReport, setPoliceReport] = useState('');

  const { data: incident, isLoading } = useQuery({
    queryKey: ['admin', 'incident', incidentId],
    queryFn: async () => {
      const res = await (api.api.v1.incidents as any)[incidentId].get();
      if (res.error) throw new Error((res.error.value as any)?.message || 'Failed to load incident');
      const data = res.data?.data || res.data;
      // Sync form state
      setStatus(data.status);
      setEstimatedCost(data.estimated_cost?.toString() || '');
      setResolutionNotes(data.resolution_notes || '');
      setInsuranceClaim(data.insurance_claim_number || '');
      setPoliceReport(data.police_report_number || '');
      // Normalize JSONB fields
      data.official_photos = parseJsonArray(data.official_photos);
      data.user_photos = parseJsonArray(data.user_photos);
      data.witnesses = Array.isArray(data.witnesses) ? data.witnesses :
        typeof data.witnesses === 'string' ? JSON.parse(data.witnesses) || [] : [];
      return data as Incident;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await (api.api.v1.incidents as any)[incidentId].put({
        status,
        estimated_cost: estimatedCost ? parseFloat(estimatedCost) : undefined,
        resolution_notes: resolutionNotes || undefined,
        insurance_claim_number: insuranceClaim || undefined,
        police_report_number: policeReport || undefined,
      });
      if (res.error) throw new Error((res.error.value as any)?.message || 'Failed to update');
      return res.data;
    },
    onSuccess: () => {
      toast.success('Incident updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'incident', incidentId] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <h3 className="font-medium">Incident not found</h3>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">Incident Report</h1>
              <span className="text-xs font-mono text-muted-foreground">#{incident.id.slice(0, 8)}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Created {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
              {incident.created_by_user && ` by ${incident.created_by_user.username}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IncidentTypeBadge type={incident.type} />
          <IncidentSeverityBadge severity={incident.severity} />
          <IncidentStatusBadge status={incident.status} />
        </div>
      </div>

      {/* Alerts */}
      {incident.medical_response_required && (
        <Alert className="border-red-300 bg-red-50">
          <Siren className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Medical Response Required</strong>
            {incident.medical_notes && ` — ${incident.medical_notes}`}
          </AlertDescription>
        </Alert>
      )}
      {incident.user_unable_to_respond && (
        <Alert className="border-red-300 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>User Unable to Respond</strong> — User is injured, unconscious, or deceased.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Description */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Official Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{incident.description}</p>

              {incident.official_photos && Array.isArray(incident.official_photos) && incident.official_photos.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Photos ({incident.official_photos.length})
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {incident.official_photos.map((photo, i) => (
                      <img key={i} src={getImageUrl(photo)} alt={`Photo ${i + 1}`} className="w-full h-28 object-cover rounded-md border" />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Statement */}
          {incident.user_statement ? (
            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  User Statement
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Submitted {incident.user_responded_at && formatDistanceToNow(new Date(incident.user_responded_at), { addSuffix: true })}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{incident.user_statement}</p>
                {incident.user_photos && Array.isArray(incident.user_photos) && incident.user_photos.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      User Photos ({incident.user_photos.length})
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {incident.user_photos.map((photo, i) => (
                        <img key={i} src={getImageUrl(photo)} alt={`User photo ${i + 1}`} className="w-full h-28 object-cover rounded-md border" />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : !incident.user_unable_to_respond && incident.status !== 'resolved' ? (
            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardContent className="flex items-center gap-3 py-4">
                <Clock className="h-5 w-5 text-yellow-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">Awaiting User Statement</p>
                  <p className="text-xs text-yellow-700">The user has not yet provided their account of the incident.</p>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Witnesses */}
          {incident.witnesses && incident.witnesses.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Witness Statements ({incident.witnesses.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {incident.witnesses.map((w, i) => (
                  <div key={i} className="border-l-2 border-muted-foreground/20 pl-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{w.name}</span>
                      <span className="text-[10px] text-muted-foreground">{format(new Date(w.added_at), 'PPp')}</span>
                    </div>
                    {w.contact && <p className="text-xs text-muted-foreground">{w.contact}</p>}
                    <p className="text-sm">{w.statement}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Booking Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Booking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-gray-200 shadow-sm">
                  <AvatarImage 
                    src={incident.booking_user?.avatar_url ? (incident.booking_user.avatar_url.startsWith('http') ? incident.booking_user.avatar_url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/uploads/${incident.booking_user.avatar_url}`) : ''} 
                    alt={incident.booking_user?.username} 
                  />
                  <AvatarFallback className="bg-gray-100 text-gray-600 font-bold">
                    {incident.booking_user?.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{incident.booking_user?.username || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{incident.booking_user?.email}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Booking ID</span>
                <Link href={`/admin/bookings/${incident.booking_id}`} className="text-xs text-primary hover:underline font-mono">
                  #{incident.booking_id.slice(0, 8)}
                </Link>
              </div>
              {incident.estimated_cost && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Estimated Cost</span>
                  <span className="text-sm font-semibold">${Number(incident.estimated_cost).toFixed(2)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Update Form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Update Incident
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select value={status} onValueChange={(v: string) => setStatus(v as IncidentStatus)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Estimated Cost ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  placeholder="0.00"
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Resolution Notes</Label>
                <Textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe the resolution..."
                  rows={3}
                  className="resize-none text-sm"
                />
              </div>

              <Separator />

              <div className="space-y-1.5">
                <Label className="text-xs">Insurance Claim #</Label>
                <Input
                  value={insuranceClaim}
                  onChange={(e) => setInsuranceClaim(e.target.value)}
                  placeholder="CLM-2026-001"
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Police Report #</Label>
                <Input
                  value={policeReport}
                  onChange={(e) => setPoliceReport(e.target.value)}
                  placeholder="PR-2026-001"
                  className="h-9"
                />
              </div>

              <Button
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending}
                className="w-full"
              >
                {updateMutation.isPending ? 'Updating...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
