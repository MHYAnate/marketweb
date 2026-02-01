import api from './api';
import { Vendor } from '../types/vendor.types';
import { Goods } from '../types/goods.types';

interface DashboardStats {
  users: { total: number };
  vendors: { total: number; pending: number };
  goods: {
    total: number;
    pending: number;
    approved: number;
    flagged: number;
    dropped: number;
  };
}

interface VendorsResponse {
  vendors: Vendor[];
  total: number;
  pages: number;
}

interface GoodsResponse {
  goods: Goods[];
  total: number;
  pages: number;
}

export const adminService = {
  async getDashboardStats(): Promise<DashboardStats> {
    return api.get<DashboardStats>('/admin/dashboard');
  },

  async getPendingVendors(page?: number, limit?: number): Promise<VendorsResponse> {
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));
    return api.get<VendorsResponse>(`/admin/vendors/pending?${params.toString()}`);
  },

  async verifyVendor(vendorId: string): Promise<Vendor> {
    return api.patch<Vendor>(`/admin/vendors/${vendorId}/verify`);
  },

  async rejectVendor(vendorId: string, reason: string): Promise<Vendor> {
    return api.patch<Vendor>(`/admin/vendors/${vendorId}/reject`, { reason });
  },

  async suspendVendor(vendorId: string, reason: string): Promise<Vendor> {
    return api.patch<Vendor>(`/admin/vendors/${vendorId}/suspend`, { reason });
  },

  async getPendingGoods(page?: number, limit?: number): Promise<GoodsResponse> {
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));
    return api.get<GoodsResponse>(`/admin/goods/pending?${params.toString()}`);
  },

  async approveGoods(goodsId: string): Promise<Goods> {
    return api.patch<Goods>(`/admin/goods/${goodsId}/approve`);
  },

  async flagGoods(goodsId: string, reason: string): Promise<Goods> {
    return api.patch<Goods>(`/admin/goods/${goodsId}/flag`, { reason });
  },

  async dropGoods(goodsId: string, reason: string): Promise<Goods> {
    return api.patch<Goods>(`/admin/goods/${goodsId}/drop`, { reason });
  },

  async getAllGoods(page?: number, limit?: number): Promise<GoodsResponse> {
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));
    return api.get<GoodsResponse>(`/goods/admin?${params.toString()}`);
  },
};