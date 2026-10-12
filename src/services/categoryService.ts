import { apiRequest } from './api';

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
  showOnHome?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const CATEGORIES_CACHE_KEY = 'e_news_categories_cache';
let memoryCategoriesCache: CategoryData[] | null = null;

export const categoryService = {
  // Synchronous read from memory or localStorage for instant zero-flicker render
  getCachedCategories(): CategoryData[] {
    if (memoryCategoriesCache && memoryCategoriesCache.length > 0) {
      return [...memoryCategoriesCache].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    }
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(CATEGORIES_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const sorted = parsed.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
            memoryCategoriesCache = sorted;
            return sorted;
          }
        }
      } catch {}
    }
    return [];
  },

  // Save to cache helper
  setCache(cats: CategoryData[]) {
    if (!Array.isArray(cats)) return;
    const sorted = [...cats].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    memoryCategoriesCache = sorted;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(sorted));
        window.dispatchEvent(new CustomEvent('categories_changed', { detail: sorted }));
      } catch {}
    }
  },

  // 1. Get all active categories (or all if includeInactive = true)
  async getCategories(includeInactive = false): Promise<CategoryData[]> {
    try {
      const url = includeInactive ? '/categories?all=true' : '/categories';
      const res = await apiRequest<{ success: boolean; data: CategoryData[] }>(url);
      const data = res.data || [];
      const sorted = [...data].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
      if (!includeInactive && sorted.length > 0) {
        this.setCache(sorted);
      }
      return sorted;
    } catch (err) {
      console.warn('Failed to load categories:', err);
      return this.getCachedCategories();
    }
  },

  // 2. Create New Category
  async createCategory(data: { name: string; slug?: string; order?: number; isActive?: boolean; showOnHome?: boolean }): Promise<CategoryData> {
    const res = await apiRequest<{ success: boolean; message: string; data: CategoryData }>('/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (typeof window !== 'undefined') {
      try { localStorage.removeItem(CATEGORIES_CACHE_KEY); } catch {}
    }
    memoryCategoriesCache = null;
    await this.getCategories();
    return res.data;
  },

  // 3. Update Existing Category
  async updateCategory(
    id: string,
    data: Partial<{ name: string; slug: string; order: number; isActive: boolean; showOnHome: boolean }>
  ): Promise<CategoryData> {
    const res = await apiRequest<{ success: boolean; message: string; data: CategoryData }>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (typeof window !== 'undefined') {
      try { localStorage.removeItem(CATEGORIES_CACHE_KEY); } catch {}
    }
    memoryCategoriesCache = null;
    await this.getCategories();
    return res.data;
  },

  // 4. Reorder Categories sequentially
  async reorderCategories(orderedIds: string[]): Promise<CategoryData[]> {
    const res = await apiRequest<{ success: boolean; message: string; data: CategoryData[] }>('/categories/reorder', {
      method: 'PUT',
      body: JSON.stringify({ orderedIds })
    });
    const updatedList = res.data || [];
    this.setCache(updatedList);
    return updatedList;
  },

  // 5. Delete Category
  async deleteCategory(id: string): Promise<void> {
    await apiRequest(`/categories/${id}`, {
      method: 'DELETE'
    });
    if (typeof window !== 'undefined') {
      try { localStorage.removeItem(CATEGORIES_CACHE_KEY); } catch {}
    }
    memoryCategoriesCache = null;
    await this.getCategories();
  }
};
