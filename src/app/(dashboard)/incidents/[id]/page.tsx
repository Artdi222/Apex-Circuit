'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IncidentTypeBadge, IncidentSeverityBadge, IncidentStatusBadge } from '@/components/incidents/incident-badge';
import { UserStatementForm } from '@/components/incidents/user-statement-form';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  DollarSign,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatDistanceToNow, format } from 'date-fns';
import { getImageUrl } from '@/lib/utils';

type IncidentType = 'damage' | 'accident' | 'mechanical' | 'other';
type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';

interface Incident {
  id: string;
  booking_id: string;
  type: IncidentType;
  severity: IncidentSeverity;
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
  created_at: string;
}
import Link from 'next/link';

function parseJsonArray(val: any): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try { const parsed = JSON.parse(val); return Array.isArray(parsed) ? parsed : []; }
    catch { return []; }
  }
  return [];
}

export default function UserIncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const incidentId = params.id as string;

  const [incident, setIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStatementForm, setShowStatementForm] = useState(false);

  useEffect(() => {
    loadIncident();
  }, [incidentId]);

  const loadIncident = async () => {
    try {
      setIsLoading(true);
      const res = await (api.api.v1.incidents as any)[incidentId].get();
      if (res.error) {
        const errorValue = res.error.value as any;
        throw new Error(errorValue?.message || 'Failed to load incident');
      }
      const data = res.data?.data || res.data;
      data.official_photos = parseJsonArray(data.official_photos);
      data.user_photos = parseJsonArray(data.user_photos);
      setIncident(data);
    } catch (error) {
      console.error('Failed to load incident:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatementSuccess = () => {
    setShowStatementForm(false);
    loadIncident();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium">Incident not found</h3>
      </div>
    );
  }

  const canAddStatement =
    !incident.user_statement && !incident.user_unable_to_respond && incident.status !== 'resolved';

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Incident Report</h1>
            <p className="text-sm text-gray-600">
              {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IncidentTypeBadge type={incident.type} />
          <IncidentSeverityBadge severity={incident.severity} />
          <IncidentStatusBadge status={incident.status} />
        </div>
      </div>

      {/* Action Alert */}
      {canAddStatement && !showStatementForm && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 flex items-center justify-between">
            <span>
              <strong>Action Required:</strong> Please provide your account of what happened.
            </span>
            <Button
              size="sm"
              onClick={() => setShowStatementForm(true)}
              className="ml-4 bg-orange-600 hover:bg-orange-700"
            >
              Add Statement
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Medical Alert */}
      {incident.medical_response_required && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Medical Response:</strong> {incident.medical_notes}
          </AlertDescription>
        </Alert>
      )}

      {/* Official Report */}
      <Card>
        <CardHeader>
          <CardTitle>Official Incident Report</CardTitle>
          <CardDescription>
            Filed by track staff on {format(new Date(incident.created_at), 'PPp')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Description</Label>
            <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{incident.description}</p>
          </div>

          {incident.official_photos && incident.official_photos.length > 0 && (
            <div>
              <Label>Official Photos ({incident.official_photos.length})</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {incident.official_photos.map((photo, index) => (
                  <img
                    key={index}
                    src={getImageUrl(photo)}
                    alt={`Official photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-90"
                    onClick={() => window.open(getImageUrl(photo), '_blank')}
                  />
                ))}
              </div>
            </div>
          )}

          {incident.estimated_cost && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
              <DollarSign className="h-5 w-5 text-gray-600" />
              <div>
                <div className="text-sm text-gray-600">Estimated Repair Cost</div>
                <div className="text-lg font-semibold">${Number(incident.estimated_cost).toFixed(2)}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Statement Form */}
      {showStatementForm && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle>Add Your Statement</CardTitle>
            <CardDescription>
              Provide your account of what happened. Be honest and detailed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserStatementForm
              incidentId={incident.id}
              onSuccess={handleStatementSuccess}
              onCancel={() => setShowStatementForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* User Statement (if submitted) */}
      {incident.user_statement && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Your Statement
            </CardTitle>
            <CardDescription>
              Submitted {formatDistanceToNow(new Date(incident.user_responded_at!), { addSuffix: true })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Your Account</Label>
              <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                {incident.user_statement}
              </p>
            </div>

            {incident.user_photos && incident.user_photos.length > 0 && (
              <div>
                <Label>Your Photos ({incident.user_photos.length})</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {incident.user_photos.map((photo, index) => (
                    <img
                      key={index}
                      src={getImageUrl(photo)}
                      alt={`Your photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-90"
                      onClick={() => window.open(getImageUrl(photo), '_blank')}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resolution */}
      {incident.status === 'resolved' && incident.resolution_notes && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Resolution
            </CardTitle>
            <CardDescription>This incident has been resolved</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{incident.resolution_notes}</p>
            {incident.estimated_cost && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">Final Cost</div>
                <div className="text-xl font-semibold">${Number(incident.estimated_cost).toFixed(2)}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status Info */}
      {incident.status === 'investigating' && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            This incident is currently under investigation. You will be notified when it is resolved.
          </AlertDescription>
        </Alert>
      )}

      {/* Booking Link */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Related Booking</CardTitle>
        </CardHeader>
        <CardContent>
          <Link
            href={`/bookings/${incident.booking_id}`}
            className="text-blue-600 hover:underline"
          >
            View Booking Details →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
