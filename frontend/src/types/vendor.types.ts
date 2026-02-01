import { User } from './user.types';

export enum VendorStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

export interface Vendor {
  _id: string;
  id: string;
  user: User;
  businessName: string;
  businessDescription: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  logo?: string;
  documents: string[];
  status: VendorStatus;
  verifiedAt?: string;
  verifiedBy?: User;
  rejectionReason?: string;
  totalGoods: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorData {
  businessName: string;
  businessDescription: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
}