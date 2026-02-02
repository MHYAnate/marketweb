import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiError } from '@/types/api.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  resource_type: string;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<{ data: T }>(url, config);
    return response.data.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<{ data: T }>(url, data, config);
    return response.data.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.patch<{ data: T }>(url, data, config);
    return response.data.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<{ data: T }>(url, data, config);
    return response.data.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<{ data: T }>(url, config);
    return response.data.data;
  }

  // Cloudinary Upload - Single File
  async uploadFile(file: File, folder: string = 'goods'): Promise<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.api.post<{ success: boolean; data: CloudinaryUploadResponse }>(
      `/uploads/single?folder=${folder}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data;
  }

  // Cloudinary Upload - Multiple Files
  async uploadFiles(files: File[], folder: string = 'goods'): Promise<CloudinaryUploadResponse[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const response = await this.api.post<{ success: boolean; data: CloudinaryUploadResponse[] }>(
      `/uploads/multiple?folder=${folder}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data;
  }

  // Delete file from Cloudinary
  async deleteFile(publicId: string): Promise<void> {
    await this.api.delete(`/uploads/single/${encodeURIComponent(publicId)}`);
  }

  // Delete file by URL
  async deleteFileByUrl(url: string): Promise<void> {
    await this.api.post('/uploads/delete-by-url', { url });
  }
}

export const api = new ApiService();
export default api;