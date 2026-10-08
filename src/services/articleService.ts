import { apiRequest } from './api';

export interface ArticleData {
  id: string;
  title: string;
  slug: string;
  subHeadline?: string | null;
  content: string;
  category: string;
  subCategory?: string | null;
  featuredImage?: string | null;
  imageCaption?: string | null;
  authorName: string;
  authorAvatar?: string | null;
  bulletPoints?: string | null; // JSON string or string
  tags?: string | null;
  isLeadStory: boolean;
  isTrending: boolean;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  viewsCount: number;
  likesCount: number;
  readTimeMinutes: number;
  publishedAt: string;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ArticlesQuery {
  category?: string;
  status?: string;
  search?: string;
  isLeadStory?: boolean;
  isTrending?: boolean;
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

export const articleService = {
  // 1. Fetch Paginated Articles
  async getArticles(query: ArticlesQuery = {}): Promise<ArticlesResponse> {
    const params = new URLSearchParams();
    if (query.category) params.append('category', query.category);
    if (query.status) params.append('status', query.status);
    if (query.search) params.append('search', query.search);
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

  // 4. Create New Article
  async createArticle(data: CreateArticleInput): Promise<ArticleData> {
    const res = await apiRequest<{ success: boolean; data: ArticleData }>('/articles', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  },

  // 5. Update Existing Article
  async updateArticle(id: string, data: CreateArticleInput): Promise<ArticleData> {
    const res = await apiRequest<{ success: boolean; data: ArticleData }>(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return res.data;
  },

  // 6. Soft Delete Article
  async deleteArticle(id: string): Promise<void> {
    await apiRequest(`/articles/${id}`, {
      method: 'DELETE'
    });
  },

  // 7. Upload Image File from computer
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
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
