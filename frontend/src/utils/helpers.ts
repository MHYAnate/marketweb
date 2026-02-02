import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
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

// For Cloudinary URLs - they are already complete URLs
export function getImageUrl(path: string): string {
  // If it's already a full URL (Cloudinary or other), return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Fallback for legacy local uploads
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

// Get optimized Cloudinary URL with transformations
export function getOptimizedImageUrl(
  url: string,
  options?: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
  }
): string {
  if (!url.includes('cloudinary.com')) {
    return url;
  }

  const { width = 800, height = 800, quality = 'auto', format = 'auto' } = options || {};
  
  // Insert transformations into Cloudinary URL
  // URL format: https://res.cloudinary.com/{cloud}/image/upload/{transformations}/{public_id}
  const transformations = `w_${width},h_${height},c_limit,q_${quality},f_${format}`;
  
  return url.replace('/upload/', `/upload/${transformations}/`);
}

// Get thumbnail URL from Cloudinary
export function getThumbnailUrl(url: string, size: number = 200): string {
  if (!url.includes('cloudinary.com')) {
    return url;
  }
  
  const transformations = `w_${size},h_${size},c_fill,q_auto,f_auto`;
  return url.replace('/upload/', `/upload/${transformations}/`);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
}