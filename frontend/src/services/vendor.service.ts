import api from './api';
import { Vendor, CreateVendorData, VendorStatus } from '../types/vendor.types';

interface VendorsResponse {
  vendors: Vendor[];
  total: number;
  pages: number;
}

export const vendorService = {
  async getAll(
    page?: number,
    limit?: number,
    status?: VendorStatus,
    search?: string
  ): Promise<VendorsResponse> {
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    return api.get<VendorsResponse>(`/vendors?${params.toString()}`);
  },

  async getById(id: string): Promise<Vendor> {
    return api.get<Vendor>(`/vendors/${id}`);
  },

  async getMyProfile(): Promise<Vendor | null> {
    try {
      return await api.get<Vendor>('/vendors/my-profile');
    } catch {
      return null;
    }
  },

  async create(data: CreateVendorData): Promise<Vendor> {
    return api.post<Vendor>('/vendors', data);
  },

  async update(id: string, data: Partial<CreateVendorData>): Promise<Vendor> {
    return api.patch<Vendor>(`/vendors/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/vendors/${id}`);
  },
};