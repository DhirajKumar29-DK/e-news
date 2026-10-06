import { apiRequest } from './api';
import { LoginCredentials, AuthResponse, AdminUser } from '@/types/admin';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // 1. Instant Demo Bypass Check (Allows UI testing before creating DB user)
    if (
      (credentials.email === 'admin@news.com' || credentials.username === 'admin' || credentials.email === 'admin') &&
      credentials.password === 'admin123'
    ) {
      const demoUser: AdminUser = {
        id: 'admin-1',
        name: 'Super Admin',
        email: 'admin@news.com',
        role: 'SUPER_ADMIN'
      };
      const demoToken = 'demo-jwt-token-xyz-123456';
      return {
        success: true,
        token: demoToken,
        user: demoUser,
        message: 'Login successful (Demo Mode)'
      };
    }

    // 2. Real Express Backend API Call
    const loginEndpoints = [
      '/v1/auth/login',
      '/auth/login',
      '/admin/login',
      '/users/login',
      '/login'
    ];

    let lastError: any = null;

    for (const endpoint of loginEndpoints) {
      try {
        const data = await apiRequest<AuthResponse>(endpoint, {
          method: 'POST',
          body: JSON.stringify(credentials)
        });
        return data;
      } catch (err: any) {
        lastError = err;
        const msg = (err.message || '').toLowerCase();
        if (msg.includes('not found') || msg.includes('404')) {
          continue;
        }
        throw err;
      }
    }

    throw lastError || new Error('Express backend login route not found.');
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
  },

  getCurrentUser(): AdminUser | null {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('admin_user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  }
};
