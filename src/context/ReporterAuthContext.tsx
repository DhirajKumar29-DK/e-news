'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { reporterAuthService, ReporterUser, ReporterRegisterData } from '@/services/reporterAuthService';

interface ReporterAuthContextType {
  reporter: ReporterUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<any>;
  register: (data: ReporterRegisterData) => Promise<any>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const ReporterAuthContext = createContext<ReporterAuthContextType | undefined>(undefined);

export const ReporterAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [reporter, setReporter] = useState<ReporterUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = reporterAuthService.getToken();
    const storedUser = reporterAuthService.getUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setReporter(storedUser);
    }
    setIsLoading(false);
  }, []);

  // Protected route check
  useEffect(() => {
    if (!isLoading) {
      const publicReporterRoutes = [
        '/reporter/login',
        '/reporter/register',
        '/reporter/forgot-password',
        '/reporter/reset-password'
      ];

      const isReporterRoute = pathname.startsWith('/reporter');
      const isPublicReporterRoute = publicReporterRoutes.some(r => pathname.startsWith(r));

      if (isReporterRoute && !isPublicReporterRoute && !token) {
        router.push('/reporter/login');
      }
    }
  }, [pathname, token, isLoading, router]);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await reporterAuthService.login(credentials);
      setToken(res.data.token);
      setReporter(res.data.user);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: ReporterRegisterData) => {
    setIsLoading(true);
    try {
      const res = await reporterAuthService.register(data);
      if (res.data?.token) {
        setToken(res.data.token);
        setReporter(res.data.user);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    reporterAuthService.logout();
    setToken(null);
    setReporter(null);
  };

  const refreshProfile = async () => {
    try {
      const updated = await reporterAuthService.getMe();
      setReporter(updated);
    } catch (err) {
      console.warn('Failed to refresh reporter profile:', err);
    }
  };

  return (
    <ReporterAuthContext.Provider
      value={{
        reporter,
        token,
        isAuthenticated: !!token && !!reporter,
        isLoading,
        login,
        register,
        logout,
        refreshProfile
      }}
    >
      {children}
    </ReporterAuthContext.Provider>
  );
};

export const useReporterAuth = () => {
  const context = useContext(ReporterAuthContext);
  if (!context) {
    throw new Error('useReporterAuth must be used within a ReporterAuthProvider');
  }
  return context;
};

