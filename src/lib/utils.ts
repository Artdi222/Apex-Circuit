import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function parseImages(raw: any): string[] {
  let images = raw || [];
  if (typeof images === 'string') {
    try { images = JSON.parse(images); } catch (e) {}
  }
  if (Array.isArray(images) && images.length > 0 && typeof images[0] === 'string' && images[0].startsWith('[')) {
    try { images = JSON.parse(images[0]); } catch (e) {}
  }
  return Array.isArray(images) ? images : [];
}

export function getImageUrl(url: string | undefined): string {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  // If the url is just a path like "vehicles/image.jpg", we need to point to the uploads endpoint
  // The backend likely serves these from /api/v1/uploads/
  const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
  
  // If the path already includes 'api/v1/uploads', just prepend baseUrl
  if (cleanUrl.includes('api/v1/uploads')) {
    return `${baseUrl}/${cleanUrl}`;
  }
  
  return `${baseUrl}/api/v1/uploads/${cleanUrl}`;
}
