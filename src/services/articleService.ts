import { API_BASE_URL } from '@/config/env';
import { apiRequest } from './api';

export type ArticleStatusType =
  | 'PUBLISHED'
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'NEEDS_REVISION'
  | 'APPROVED'
  | 'REJECTED'
  | 'UNPUBLISHED'
  | string;

export interface ArticleData {
  id: string;
  title: string;
  slug: string;
  subHeadline?: string | null;
  content: string;
  category: string;
  subCategory?: string | null;
  featuredImage?: string | null;
  imageUrl?: string | null;
  imageCaption?: string | null;
  caption?: string | null;
  summary?: string | null;
  author?: string | null;
  authorName: string;
  authorAvatar?: string | null;
  bulletPoints?: string | null; // JSON string or string
  tags?: string | null;
  isLeadStory: boolean;
  isTrending: boolean;
  status: ArticleStatusType;
  viewsCount: number;
  likesCount: number;
  readTimeMinutes: number;
  publishedAt: string;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  // Reporter & Editorial Workflow Fields
  reporterId?: string | null;
  adminFeedback?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  reporter?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    city?: string | null;
    district?: string | null;
    state?: string | null;
    profileImage?: string | null;
    idProofUrl?: string | null;
  } | null;
  // SEO Metadata Fields
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  canonicalUrl?: string | null;
  isIndexed?: boolean;
}

export interface ArticlesQuery {
  category?: string;
  subCategory?: string;
  status?: string;
  search?: string;
  isLeadStory?: boolean;
  isTrending?: boolean;
  reporterId?: string;
  reviewQueue?: boolean | string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ArticlesResponse {
  articles: ArticleData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ReviewQueueResponse {
  articles: ArticleData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  counts: {
    pendingReview: number;
    needsRevision: number;
    rejected?: number;
    total?: number;
  };
}

export interface HomeArticlesResponse {
  leadStory: ArticleData | null;
  subLeads: ArticleData[];
  quickHighlights: ArticleData[];
  trending: ArticleData[];
  categories: Record<string, ArticleData[]>;
}

export type CreateArticleInput = Omit<Partial<ArticleData>, 'bulletPoints' | 'tags'> & {
  bulletPoints?: string[] | string | null;
  tags?: string[] | string | null;
};

function sanitizeArticlePayload(data: CreateArticleInput): Record<string, any> {
  const payload: Record<string, any> = { ...data };
  if (typeof payload.metaTitle !== 'undefined') {
    payload.metaTitle = payload.metaTitle ? String(payload.metaTitle).trim() : null;
  }
  if (typeof payload.metaDescription !== 'undefined') {
    payload.metaDescription = payload.metaDescription ? String(payload.metaDescription).trim() : null;
  }
  if (typeof payload.metaKeywords !== 'undefined') {
    payload.metaKeywords = payload.metaKeywords ? String(payload.metaKeywords).trim() : null;
  }
  if (typeof payload.canonicalUrl !== 'undefined') {
    payload.canonicalUrl = payload.canonicalUrl ? String(payload.canonicalUrl).trim() : null;
  }
  if (typeof payload.isIndexed !== 'undefined') {
    payload.isIndexed = Boolean(payload.isIndexed);
  }
  return payload;
}

export const articleService = {
  // 1. Fetch Paginated Articles (supports status, category, reporterId, search)
  async getArticles(query: ArticlesQuery = {}): Promise<ArticlesResponse> {
    const params = new URLSearchParams();
    if (query.category) params.append('category', query.category);
    if (query.subCategory) params.append('subCategory', query.subCategory);
    if (query.status) params.append('status', query.status);
    if (query.search) params.append('search', query.search);
    if (query.reporterId) params.append('reporterId', query.reporterId);
    if (typeof query.reviewQueue !== 'undefined') params.append('reviewQueue', String(query.reviewQueue));
    if (typeof query.isLeadStory !== 'undefined') params.append('isLeadStory', String(query.isLeadStory));
    if (typeof query.isTrending !== 'undefined') params.append('isTrending', String(query.isTrending));
    if (query.page) params.append('page', String(query.page));
    if (query.limit) params.append('limit', String(query.limit));
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const res = await apiRequest<{ success: boolean; data: ArticlesResponse }>(
      `/articles?${params.toString()}`
    );
    return res.data;
  },

  // 2. Fetch Homepage Aggregated Articles
  async getHomeArticles(): Promise<HomeArticlesResponse> {
    const res = await apiRequest<{ success: boolean; data: HomeArticlesResponse }>(
      '/articles/home'
    );
    return res.data;
  },

  // 3. Fetch Single Article by ID or unique Slug
  async getArticleByIdOrSlug(idOrSlug: string): Promise<ArticleData> {
    const res = await apiRequest<{ success: boolean; data: ArticleData }>(
      `/articles/${encodeURIComponent(idOrSlug)}`
    );
    return res.data;
  },

  // 4. Create New Article (Admin or Reporter)
  async createArticle(data: CreateArticleInput): Promise<ArticleData> {
    const payload = sanitizeArticlePayload(data);
    const res = await apiRequest<{ success: boolean; data: ArticleData }>('/articles', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res.data;
  },

  // 5. Update Existing Article
  async updateArticle(id: string, data: CreateArticleInput): Promise<ArticleData> {
    const payload = sanitizeArticlePayload(data);
    const res = await apiRequest<{ success: boolean; data: ArticleData }>(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return res.data;
  },

  // 6. Editorial Review Queue (Admin Only)
  async getReviewQueue(query: { page?: number; limit?: number; status?: string } = {}): Promise<ReviewQueueResponse> {
    const params = new URLSearchParams();
    if (query.page) params.append('page', String(query.page));
    if (query.limit) params.append('limit', String(query.limit));
    if (query.status) params.append('status', query.status);

    const res = await apiRequest<{ success: boolean; data: ReviewQueueResponse }>(
      `/articles/review/queue?${params.toString()}`
    );
    return res.data;
  },

  // 7. Admin Review Action (Publish, Request Revision, Reject, Unpublish)
  async reviewArticle(
    id: string,
    reviewData: {
      action: 'PUBLISH' | 'APPROVE' | 'REQUEST_REVISION' | 'REJECT' | 'UNPUBLISH';
      feedback?: string;
      category?: string;
      isLeadStory?: boolean;
      isTrending?: boolean;
    }
  ): Promise<ArticleData> {
    const res = await apiRequest<{ success: boolean; data: ArticleData }>(`/articles/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify(reviewData)
    });
    return res.data;
  },

  // 8. Soft Delete Article
  async deleteArticle(id: string): Promise<void> {
    await apiRequest(`/articles/${id}`, {
      method: 'DELETE'
    });
  },

  // 9. Upload Image File from computer (supports both admin and reporter tokens)
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    let token = typeof window !== 'undefined' ? localStorage.getItem('reporter_token') : null;
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('admin_token');
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || API_BASE_URL;
    const res = await fetch(`${apiUrl}/articles/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Image upload failed');
    }
    return data.data.imageUrl;
  }
};
