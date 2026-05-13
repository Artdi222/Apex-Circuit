export const APP_NAME = 'APEX Circuit Rentals';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const BOOKING_STATUSES = {
  pending: { label: 'Pending', color: 'warning' },
  confirmed: { label: 'Confirmed', color: 'success' },
  checked_in: { label: 'Checked In', color: 'primary' },
  completed: { label: 'Completed', color: 'muted' },
  cancelled: { label: 'Cancelled', color: 'destructive' },
  no_show: { label: 'No Show', color: 'destructive' },
} as const;

export const VEHICLE_CLASSES = {
  gt: { label: 'GT', description: 'Grand Touring' },
  touring: { label: 'Touring', description: 'Touring Car' },
  formula: { label: 'Formula', description: 'Open Wheel' },
  drift: { label: 'Drift', description: 'Drift Spec' },
  endurance: { label: 'Endurance', description: 'Endurance Racing' },
} as const;

export const EQUIPMENT_CATEGORIES = {
  helmet: { label: 'Helmet' },
  suit: { label: 'Racing Suit' },
  gloves: { label: 'Gloves' },
  shoes: { label: 'Racing Shoes' },
  hans_device: { label: 'HANS Device' },
  other: { label: 'Other' },
} as const;

export const SLOT_TYPES = {
  open: { label: 'Open Session', description: 'Multiple drivers on track' },
  exclusive: { label: 'Exclusive', description: 'Private track session' },
  maintenance: { label: 'Maintenance', description: 'Track maintenance' },
} as const;

export const USER_ROLES = {
  user: { label: 'User' },
  admin: { label: 'Admin' },
  superadmin: { label: 'Super Admin' },
} as const;
