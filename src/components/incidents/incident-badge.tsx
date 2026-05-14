import { Badge } from '@/components/ui/badge';

type IncidentType = 'damage' | 'accident' | 'mechanical' | 'other';
type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';

interface IncidentTypeBadgeProps {
  type: IncidentType;
}

export function IncidentTypeBadge({ type }: IncidentTypeBadgeProps) {
  const config = {
    damage: { label: 'Damage', className: 'bg-orange-100 text-orange-800 border-orange-200' },
    accident: { label: 'Accident', className: 'bg-red-100 text-red-800 border-red-200' },
    mechanical: { label: 'Mechanical', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    other: { label: 'Other', className: 'bg-gray-100 text-gray-800 border-gray-200' },
  };

  const { label, className } = config[type];

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

interface IncidentSeverityBadgeProps {
  severity: IncidentSeverity;
}

export function IncidentSeverityBadge({ severity }: IncidentSeverityBadgeProps) {
  const config = {
    low: { label: 'Low', className: 'bg-gray-100 text-gray-700 border-gray-300' },
    medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    high: { label: 'High', className: 'bg-orange-100 text-orange-800 border-orange-300' },
    critical: { label: 'Critical', className: 'bg-red-100 text-red-800 border-red-300' },
  };

  const { label, className } = config[severity];

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

interface IncidentStatusBadgeProps {
  status: IncidentStatus;
}

export function IncidentStatusBadge({ status }: IncidentStatusBadgeProps) {
  const config = {
    open: { label: 'Open', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    investigating: { label: 'Investigating', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    resolved: { label: 'Resolved', className: 'bg-green-100 text-green-800 border-green-200' },
    dismissed: { label: 'Dismissed', className: 'bg-gray-100 text-gray-800 border-gray-200' },
  };

  const { label, className } = config[status];

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
