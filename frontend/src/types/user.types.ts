export enum Role {
  USER = 'user',
  VENDOR = 'vendor',
  ADMIN = 'admin',
}

export interface User {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: Role;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}