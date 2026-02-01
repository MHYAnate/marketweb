'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types/user.types';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isVendor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = authService.getUser();
        const token = authService.getToken();

        if (storedUser && token) {
          // Verify token by fetching user
          const currentUser = await authService.getMe();
          setUser(currentUser);
        }
      } catch (error) {
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    setUser(response.user);
  };

  const register = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    const response = await authService.register(data);
    setUser(response.user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    isAdmin: user?.role === Role.ADMIN,
    isVendor: user?.role === Role.VENDOR,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}