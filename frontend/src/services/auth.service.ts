import api from './api';
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types/user.types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    this.setSession(response);
    return response;
  },

  async register(data: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    this.setSession(response);
    return response;
  },

  async getMe(): Promise<User> {
    return api.get<User>('/auth/me');
  },

  setSession(authResponse: AuthResponse): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', authResponse.accessToken);
      localStorage.setItem('user', JSON.stringify(authResponse.user));
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  },

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};