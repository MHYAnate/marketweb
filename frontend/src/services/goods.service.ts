import api from './api';
import { Goods, CreateGoodsData, GoodsQuery } from '../types/goods.types';

interface GoodsResponse {
  goods: Goods[];
  total: number;
  pages: number;
}

export const goodsService = {
  async getAll(query?: GoodsQuery): Promise<GoodsResponse> {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return api.get<GoodsResponse>(`/goods?${params.toString()}`);
  },

  async getById(id: string): Promise<Goods> {
    return api.get<Goods>(`/goods/${id}`);
  },

  async create(data: CreateGoodsData): Promise<Goods> {
    return api.post<Goods>('/goods', data);
  },

  async update(id: string, data: Partial<CreateGoodsData>): Promise<Goods> {
    return api.patch<Goods>(`/goods/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/goods/${id}`);
  },

  async getCategories(): Promise<string[]> {
    return api.get<string[]>('/goods/categories');
  },

  async getMyGoods(query?: GoodsQuery): Promise<GoodsResponse> {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return api.get<GoodsResponse>(`/goods/my-goods?${params.toString()}`);
  },
};