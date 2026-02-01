import { User } from './user.types';
import { Vendor } from './vendor.types';

export enum GoodsStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  FLAGGED = 'flagged',
  DROPPED = 'dropped',
}

export enum GoodsType {
  SALE = 'sale',
  LEASE = 'lease',
}

export interface Goods {
  _id: string;
  id: string;
  title: string;
  description: string;
  price: number;
  type: GoodsType;
  category: string;
  images: string[];
  status: GoodsStatus;
  vendor: Vendor;
  createdBy: User;
  location?: string;
  specifications?: Record<string, any>;
  views: number;
  flagReason?: string;
  flaggedBy?: User;
  flaggedAt?: string;
  approvedAt?: string;
  approvedBy?: User;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoodsData {
  title: string;
  description: string;
  price: number;
  type: GoodsType;
  category?: string;
  images?: string[];
  location?: string;
  specifications?: Record<string, any>;
}

export interface GoodsQuery {
  page?: number;
  limit?: number;
  status?: GoodsStatus;
  type?: GoodsType;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  vendorId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}