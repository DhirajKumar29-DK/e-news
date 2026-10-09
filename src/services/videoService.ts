import { apiRequest } from './api';

export interface VideoData {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  videoType: 'YOUTUBE' | 'FILE' | 'EXTERNAL_EMBED';
  videoUrl: string;
  youtubeId?: string | null;
  thumbnailUrl?: string | null;
  duration?: string | null;
  durationSeconds?: number | null;
  category: string;
  subCategory?: string | null;
  badge?: string | null;
  location?: string | null;
  reporterName?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  tags?: string | null; // JSON string or comma-separated
  isFeaturedHero: boolean;
  isTrending: boolean;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  viewsCount: number;
  likesCount: number;
  publishedAt: string;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VideosQuery {
  category?: string;
  status?: string;
  search?: string;
  isFeaturedHero?: boolean;
  isTrending?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface VideosResponse {
  videos: VideoData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FeaturedAndTrendingResponse {
  heroVideo: VideoData | null;
  trendingVideos: VideoData[];
  categoryVideos: Record<string, VideoData[]>;
}

export type CreateVideoInput = Omit<Partial<VideoData>, 'tags'> & {
  tags?: string[] | string | null;
};

export const videoService = {
  // 1. Fetch Paginated Videos
  async getVideos(query: VideosQuery = {}): Promise<VideosResponse> {
    const params = new URLSearchParams();
    if (query.category) params.append('category', query.category);
    if (query.status) params.append('status', query.status);
    if (query.search) params.append('search', query.search);
    if (typeof query.isFeaturedHero !== 'undefined') params.append('isFeaturedHero', String(query.isFeaturedHero));
    if (typeof query.isTrending !== 'undefined') params.append('isTrending', String(query.isTrending));
    if (query.page) params.append('page', String(query.page));
    if (query.limit) params.append('limit', String(query.limit));
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const res = await apiRequest<{ success: boolean; data: VideosResponse }>(
      `/videos?${params.toString()}`
    );
    return res.data;
  },

  // 2. Fetch Hero, Trending & Category Showcases
  async getFeaturedAndTrending(): Promise<FeaturedAndTrendingResponse> {
    const res = await apiRequest<{ success: boolean; data: FeaturedAndTrendingResponse }>(
      '/videos/featured-trending'
    );
    return res.data;
  },

  // 3. Fetch Single Video by ID or unique Slug
  async getVideoByIdOrSlug(idOrSlug: string): Promise<VideoData> {
    const res = await apiRequest<{ success: boolean; data: VideoData }>(
      `/videos/${encodeURIComponent(idOrSlug)}`
    );
    return res.data;
  },

  // 4. Create New Video
  async createVideo(data: CreateVideoInput): Promise<VideoData> {
    const res = await apiRequest<{ success: boolean; data: VideoData }>('/videos', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  },

  // 5. Update Existing Video
  async updateVideo(id: string, data: CreateVideoInput): Promise<VideoData> {
    const res = await apiRequest<{ success: boolean; data: VideoData }>(`/videos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return res.data;
  },

  // 6. Delete Video
  async deleteVideo(id: string): Promise<void> {
    await apiRequest(`/videos/${id}`, {
      method: 'DELETE'
    });
  },

  // 7. Increment Video Views
  async incrementViews(id: string): Promise<{ viewsCount: number }> {
    const res = await apiRequest<{ success: boolean; data: { viewsCount: number } }>(
      `/videos/${id}/view`,
      { method: 'POST' }
    );
    return res.data;
  },

  // 8. Upload MP4 / WebM Video File (Full object)
  async uploadVideoFile(file: File): Promise<{ videoUrl: string; duration?: string }> {
    const formData = new FormData();
    formData.append('video', file);

    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const res = await fetch(`${apiUrl}/videos/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Video upload failed');
    }
    return {
      videoUrl: data.data.videoUrl,
      duration: data.data.duration
    };
  },

  // Helper alias returning just URL string
  async uploadVideo(file: File): Promise<string> {
    const res = await this.uploadVideoFile(file);
    return res.videoUrl;
  },

  // 9. Upload Custom Video Thumbnail
  async uploadThumbnail(file: File): Promise<{ thumbnailUrl: string }> {
    const formData = new FormData();
    formData.append('thumbnail', file);

    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const res = await fetch(`${apiUrl}/videos/upload-thumbnail`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Thumbnail upload failed');
    }
    return {
      thumbnailUrl: data.data.thumbnailUrl
    };
  }
};
