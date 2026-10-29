import { apiRequest } from './api';
import { ReporterUser } from './reporterAuthService';

export interface ReportersQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ReportersListResponse {
  success: boolean;
  message: string;
  data: {
    reporters: (ReporterUser & { _count?: { articles: number } })[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    kpi: {
      totalReporters: number;
      pending: number;
      approved: number;
      suspended: number;
      rejected: number;
    };
  };
}

export interface ReporterDetailResponse {
  success: boolean;
  message: string;
  data: ReporterUser & {
    articles: {
      id: string;
      title: string;
      slug: string;
      status: string;
      category: string;
      publishedAt: string;
      createdAt: string;
      viewsCount: number;
    }[];
    _count?: { articles: number };
  };
}

export const reporterAdminService = {
  async getReporters(query: ReportersQuery = {}): Promise<ReportersListResponse['data']> {
    const params = new URLSearchParams();
    if (query.page) params.append('page', String(query.page));
    if (query.limit) params.append('limit', String(query.limit));
    if (query.status) params.append('status', query.status);
    if (query.search) params.append('search', query.search);
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const res = await apiRequest<ReportersListResponse>(`/reporters?${params.toString()}`);
    return res.data;
  },

  async getReporterById(id: string): Promise<ReporterDetailResponse['data']> {
    const res = await apiRequest<ReporterDetailResponse>(`/reporters/${id}`);
    return res.data;
  },

  async createReporter(data: Partial<ReporterUser> & { password?: string }): Promise<ReporterUser> {
    const res = await apiRequest<{ success: boolean; data: ReporterUser }>('/reporters', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  },

  async updateReporterStatus(
    id: string,
    status: 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'PENDING',
    rejectionReason?: string
  ): Promise<ReporterUser> {
    const res = await apiRequest<{ success: boolean; data: ReporterUser }>(`/reporters/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, rejectionReason })
    });
    return res.data;
  },

  async deleteReporter(id: string): Promise<void> {
    await apiRequest(`/reporters/${id}`, {
      method: 'DELETE'
    });
  }
};

