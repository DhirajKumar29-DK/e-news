'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { articleService, ArticleData } from '@/services/articleService';
import {
  Plus, Search, Filter, Trash2, Edit, ExternalLink, Star,
  TrendingUp, RefreshCw, Eye, Calendar, User, CheckCircle,
  AlertCircle, Sparkles
} from 'lucide-react';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'india', label: 'India' },
  { value: 'national', label: 'National' },
  { value: 'cricket', label: 'Cricket' },
  { value: 'sports', label: 'Sports' },
  { value: 'world', label: 'World News' },
  { value: 'tech', label: 'Tech & Science' },
  { value: 'business', label: 'Business' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'fashion', label: 'Fashion & Beauty' },
  { value: 'brandverse', label: 'Brandverse' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'auto', label: 'Auto' },
  { value: 'spiritual', label: 'Spiritual' },
  { value: 'horoscope', label: 'Horoscope & Astrology' },
  { value: 'education', label: 'Education' },
  { value: 'explainer', label: 'Explainer' },
  { value: 'opinion', label: 'Opinion' },
];

function AdminArticlesListContent() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAdminAuth();

  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Delete modal state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await articleService.getArticles({
        category: selectedCategory,
        status: selectedStatus,
        search: searchQuery,
        page,
        limit
      });
      setArticles(res.articles || []);
      setTotalCount(res.pagination.total || 0);
      setTotalPages(res.pagination.totalPages || 1);
    } catch (err: any) {
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchArticles();
    }
  }, [authLoading, page, limit, selectedCategory, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchArticles();
  };

  const handleToggleLead = async (article: ArticleData) => {
    try {
      const updated = await articleService.updateArticle(article.id, {
        isLeadStory: !article.isLeadStory
      });
      setArticles(prev => prev.map(a => a.id === article.id ? { ...a, isLeadStory: updated.isLeadStory } : a));
    } catch (err) {
      alert('Failed to update Lead Story status');
    }
  };

  const handleToggleTrending = async (article: ArticleData) => {
    try {
      const updated = await articleService.updateArticle(article.id, {
        isTrending: !article.isTrending
      });
      setArticles(prev => prev.map(a => a.id === article.id ? { ...a, isTrending: updated.isTrending } : a));
    } catch (err) {
      alert('Failed to update Trending status');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await articleService.deleteArticle(deleteId);
      setArticles(prev => prev.filter(a => a.id !== deleteId));
      setTotalCount(prev => Math.max(0, prev - 1));
      setDeleteId(null);
    } catch (err) {
      alert('Failed to delete article');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex font-sans select-none overflow-hidden">
      
      {/* 1. SIDEBAR */}
      <AdminSidebar />

      {/* 2. MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Pinned Top Bar */}
        <AdminHeader title="Newsroom Articles CMS" />

        {/* Pinned Action Banner & Search Toolbar */}
        <div className="shrink-0 bg-slate-50 border-b border-slate-200/80 px-6 sm:px-8 pt-5 pb-4 max-w-7xl w-full mx-auto space-y-4">
          
          {/* Top Bar with Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full mb-1">
                <Sparkles className="w-3.5 h-3.5 text-red-600" />
                <span>Production CMS Suite</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-serif text-slate-900">
                Articles & Stories ({totalCount})
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Publish, edit, and organize digital news stories across all portal categories.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={fetchArticles}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                title="Refresh Articles"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <Link
                href="/admin/articles/create"
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Write New Article</span>
              </Link>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles by headline or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </form>

            <div className="flex items-center space-x-3">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Table Area (Fixed card with internal scroll) */}
        <div className="flex-1 min-h-0 px-6 sm:px-8 py-4 max-w-7xl w-full mx-auto flex flex-col">

          {/* Table Container Card */}
          <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
            {loading ? (
              <div className="flex-1 flex items-center justify-center p-12 text-center text-slate-400 text-xs font-semibold space-x-2">
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading Articles from Database...</span>
              </div>
            ) : articles.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-16 text-center space-y-3">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-black text-slate-800 text-lg">No Articles Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                  No published stories match your current filters. Start writing your first news article now!
                </p>
                <Link
                  href="/admin/articles/create"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Article</span>
                </Link>
              </div>
            ) : (
              /* Internal Scrollable Table Content */
              <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider shadow-xs">
                    <tr>
                      <th className="py-3 px-4">Article</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Homepage Badges</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Views</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium">
                    {articles.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        
                        {/* Title & Thumbnail */}
                        <td className="py-3.5 px-4 max-w-md">
                          <div className="flex items-center space-x-3">
                            <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                              {item.featuredImage ? (
                                <img
                                  src={item.featuredImage}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300 font-serif font-bold text-xs">
                                  No Pic
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 space-y-0.5">
                              <h4 className="font-bold text-slate-900 font-serif line-clamp-1 hover:text-red-600 transition-colors">
                                {item.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 line-clamp-1">
                                {item.subHeadline || item.authorName}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wide border border-slate-200">
                            {item.category}
                          </span>
                        </td>

                        {/* Homepage Badges (Lead Story / Trending Toggles) */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleToggleLead(item)}
                              className={`p-1.5 rounded-lg border text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-all ${
                                item.isLeadStory
                                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                                  : 'bg-white border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-200'
                              }`}
                              title={item.isLeadStory ? 'Lead Story Active' : 'Make Lead Story'}
                            >
                              <Star className={`w-3.5 h-3.5 ${item.isLeadStory ? 'fill-amber-500 text-amber-500' : ''}`} />
                              <span>Hero</span>
                            </button>

                            <button
                              onClick={() => handleToggleTrending(item)}
                              className={`p-1.5 rounded-lg border text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-all ${
                                item.isTrending
                                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                                  : 'bg-white border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200'
                              }`}
                              title={item.isTrending ? 'Trending Active (01-05)' : 'Mark Trending'}
                            >
                              <TrendingUp className={`w-3.5 h-3.5 ${item.isTrending ? 'text-rose-600' : ''}`} />
                              <span>Top 5</span>
                            </button>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                            <span>{item.status}</span>
                          </span>
                        </td>

                        {/* Views */}
                        <td className="py-3.5 px-4 text-slate-600 font-semibold">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.viewsCount}</span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                          {new Date(item.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            
                            <a
                              href={`/article/${item.slug || item.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                              title="View Article Live"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            <Link
                              href={`/admin/articles/edit/${item.id}`}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                              title="Edit Article"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              onClick={() => setDeleteId(item.id)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-slate-500 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
                              title="Soft Delete Article"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pinned Bottom Pagination & Items Per Page Controls */}
            <div className="shrink-0 p-3.5 sm:px-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-600 bg-slate-50/80">
              <div className="flex items-center space-x-3">
                <span className="text-slate-600">
                  Page {page} of {Math.max(1, totalPages)} <span className="text-slate-400 font-normal">({totalCount} total)</span>
                </span>

                {/* 5, 10, 20, 50 Items Per Page Dropdown */}
                <div className="flex items-center space-x-1.5 border-l border-slate-200 pl-3">
                  <span className="text-slate-400 font-normal text-[11px]">Show:</span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:border-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value={5}>5 / page</option>
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                  </select>
                </div>
              </div>

              {/* Pagination Page Number Buttons */}
              <div className="flex items-center space-x-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                  Math.max(0, page - 3),
                  Math.min(totalPages, page + 2)
                ).map((pNum) => (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      page === pNum
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {pNum}
                  </button>
                ))}
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 border border-slate-200 shadow-xl">
            <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-black text-slate-900 text-lg">Move to Trash?</h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                This article will be soft-deleted and removed from the live website immediately.
              </p>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Article'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AdminArticlesListPage() {
  return (
    <AdminAuthProvider>
      <AdminArticlesListContent />
    </AdminAuthProvider>
  );
}
