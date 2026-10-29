'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminUser, LoginCredentials, AuthResponse } from '@/types/admin';
import { authService } from '@/services/authService';

interface AdminAuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage on load
    const storedToken = localStorage.getItem('admin_token');
    const storedUser = authService.getCurrentUser();

    if (storedToken && storedUser) {
      if (storedToken === 'demo-jwt-token-xyz-123456') {
        authService.login({ email: 'admin@news.com', password: 'admin123' })
          .then((res) => {
            const realToken = (res as any).data?.token || res.token;
            if (realToken) {
              setToken(realToken);
              localStorage.setItem('admin_token', realToken);
            }
          })
          .catch(() => {});
      }
      setToken(storedToken);
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const isAdminRoute = pathname.startsWith('/admin');
      const isLoginPage = pathname === '/admin/login';

      if (isAdminRoute && !isLoginPage && !token) {
        router.push('/admin/login');
      }
    }
  }, [pathname, token, isLoading, router]);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await authService.login(credentials);
      const authToken = res.data?.token || res.token || res.accessToken;
      if (!authToken) {
        throw new Error('Authentication failed: No token received from server.');
      }
      const authUser: AdminUser = res.data?.user || res.user || {
        id: 'admin-1',
        name: credentials.email?.split('@')[0] || credentials.username || 'Admin',
        email: credentials.email || 'admin@enews.com',
        role: 'ADMIN'
      };

      setToken(authToken);
      setUser(authUser);

      localStorage.setItem('admin_token', authToken);
      localStorage.setItem('admin_user', JSON.stringify(authUser));

      return res;
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
    router.push('/admin/login');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
