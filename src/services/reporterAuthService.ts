import { apiRequest } from './api';
import { API_BASE_URL } from '@/config/env';

export interface ReporterUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'REPORTER' | 'ADMIN';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  city?: string | null;
  district?: string | null;
  state?: string | null;
  bio?: string | null;
  profileImage?: string | null;
  idProofUrl?: string | null;
  idProofType?: string | null;
  idProofNumber?: string | null;
  preferredCategories?: string | null;
  rejectionReason?: string | null;
  createdAt?: string;
}

export interface ReporterRegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  city?: string;
  district?: string;
  state?: string;
  bio?: string;
  idProofUrl: string; // Mandatory!
  idProofType?: string;
  idProofNumber?: string;
  preferredCategories?: string[];
}

export interface ReporterAuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: ReporterUser;
  };
}

export const reporterAuthService = {
  async register(data: ReporterRegisterData): Promise<ReporterAuthResponse> {
    const res = await apiRequest<ReporterAuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (res.data?.token && typeof window !== 'undefined') {
      localStorage.setItem('reporter_token', res.data.token);
      localStorage.setItem('reporter_user', JSON.stringify(res.data.user));
    }

    return res;
  },

  async login(credentials: { email: string; password: string }): Promise<ReporterAuthResponse> {
    const res = await apiRequest<ReporterAuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    if (res.data?.token && typeof window !== 'undefined') {
      localStorage.setItem('reporter_token', res.data.token);
      localStorage.setItem('reporter_user', JSON.stringify(res.data.user));
    }

    return res;
  },

  async uploadIdProof(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('idProof', file);

    const cleanBase = API_BASE_URL.replace(/\/v1\/?$/, '');
    const url = `${cleanBase}/v1/auth/upload-id-proof`;

    const res = await fetch(url, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Identity document upload failed. Please try again.');
    }

    return data.data.fileUrl;
  },

  async sendOtp(phone: string): Promise<{ phone: string; otp?: string }> {
    const res = await apiRequest<{ success: boolean; data: { phone: string; otp?: string } }>('/auth/reporter/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
    return res.data;
  },

  async verifyOtp(phone: string, otp: string): Promise<boolean> {
    const res = await apiRequest<{ success: boolean; data: { verified: boolean } }>('/auth/reporter/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp })
    });
    return res.data?.verified || false;
  },

  async sendEmailOtp(email: string): Promise<{ email: string }> {
    const res = await apiRequest<{ success: boolean; data: { email: string } }>('/auth/reporter/send-email-otp', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    return res.data;
  },

  async verifyEmailOtp(email: string, otp: string): Promise<boolean> {
    const res = await apiRequest<{ success: boolean; data: { verified: boolean } }>('/auth/reporter/verify-email-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp })
    });
    return res.data?.verified || false;
  },

  async getMe(): Promise<ReporterUser> {
    const res = await apiRequest<{ success: boolean; data: ReporterUser }>('/auth/me');
    if (res.data && typeof window !== 'undefined') {
      localStorage.setItem('reporter_user', JSON.stringify(res.data));
    }
    return res.data;
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword })
    });
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; data?: { resetToken?: string } }> {
    return await apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword })
    });
    return { success: true, message: 'Password reset successfully' };
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('reporter_token');
      localStorage.removeItem('reporter_user');
      window.location.href = '/reporter/login';
    }
  },

  getUser(): ReporterUser | null {
    if (typeof window === 'undefined') return null;
    const str = localStorage.getItem('reporter_user');
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('reporter_token');
  }
};
