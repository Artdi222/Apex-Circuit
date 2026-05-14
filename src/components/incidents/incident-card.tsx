import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IncidentTypeBadge, IncidentSeverityBadge, IncidentStatusBadge } from './incident-badge';
import { Calendar, User, Camera, MessageSquare, Siren, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

interface IncidentCardProps {
  incident: Incident;
  href: string;
  showBookingInfo?: boolean;
}

export function IncidentCard({ incident, href, showBookingInfo = false }: IncidentCardProps) {
  const photos = Array.isArray(incident.official_photos) ? incident.official_photos : [];
  const userPhotos = Array.isArray(incident.user_photos) ? incident.user_photos : [];
  const photoCount = photos.length + userPhotos.length;
  const hasUserStatement = !!incident.user_statement;
  const needsResponse = !hasUserStatement && !incident.user_unable_to_respond && incident.status !== 'resolved';
  const isCritical = incident.severity === 'critical';

  return (
    <Link href={href}>
      <Card className={`hover:shadow-md transition-all cursor-pointer group ${isCritical ? 'border-red-200 hover:border-red-300' : 'hover:border-primary/20'}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Left: Content */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Top row: badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <IncidentTypeBadge type={incident.type} />
                <IncidentSeverityBadge severity={incident.severity} />
                <IncidentStatusBadge status={incident.status} />
                {incident.medical_response_required && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 text-[10px]">
                    <Siren className="h-3 w-3" />
                    Medical
                  </Badge>
                )}
                {needsResponse && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1 text-[10px]">
                    <Clock className="h-3 w-3" />
                    Awaiting Response
                  </Badge>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-foreground/80 line-clamp-2 leading-relaxed">
                {incident.description}
              </p>

              {/* Meta row */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
                </span>
                {showBookingInfo && incident.booking_user && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {incident.booking_user.username}
                  </span>
                )}
                {photoCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Camera className="h-3 w-3" />
                    {photoCount}
                  </span>
                )}
                {hasUserStatement && (
                  <span className="flex items-center gap-1 text-green-600">
                    <MessageSquare className="h-3 w-3" />
                    Responded
                  </span>
                )}
                {showBookingInfo && (
                  <span className="font-mono text-[10px] text-muted-foreground/60">
                    #{incident.booking_id.slice(0, 8)}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Cost */}
            {incident.estimated_cost && Number(incident.estimated_cost) > 0 && (
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground">Cost</p>
                <p className="text-base font-semibold font-mono">${Number(incident.estimated_cost).toFixed(0)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
