export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  pages: number;
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  errors?: any;
  timestamp: string;
  path: string;
}