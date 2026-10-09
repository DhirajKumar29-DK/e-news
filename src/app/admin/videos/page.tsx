'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { videoService, VideoData } from '@/services/videoService';
import {
  Plus, Search, Filter, Trash2, Edit, ExternalLink, Star,
  TrendingUp, RefreshCw, Eye, Calendar, User, CheckCircle,
  AlertCircle, Sparkles, Video, Play
} from 'lucide-react';

function AdminVideosListContent() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAdminAuth();

  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Delete modal state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await videoService.getVideos({
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        search: searchQuery.trim() || undefined,
        page,
        limit
      });
      setVideos(res.videos || []);
      setTotalCount(res.pagination?.total || 0);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err: any) {
      console.error('Failed to load videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchVideos();
    }
  }, [user, page, limit, selectedStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchVideos();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await videoService.deleteVideo(deleteId);
      setVideos(prev => prev.filter(v => v.id !== deleteId));
      setTotalCount(prev => Math.max(0, prev - 1));
      setDeleteId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete video');
    } finally {
      setIsDeleting(false);
    }
  };

  const getThumb = (vid: VideoData) => {
    if (vid.thumbnailUrl) return vid.thumbnailUrl;
    if (vid.youtubeId) return `https://img.youtube.com/vi/${vid.youtubeId}/mqdefault.jpg`;
    return 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=300&q=80';
  };

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex font-sans select-none overflow-hidden">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Pinned Top Bar */}
        <AdminHeader title="Video Studio CMS" />

        {/* Pinned Action Banner & Filter Toolbar */}
        <div className="shrink-0 bg-slate-50 border-b border-slate-200/80 px-6 sm:px-8 pt-5 pb-4 max-w-7xl w-full mx-auto space-y-4">
          {/* Top Bar with Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full mb-1">
                <Sparkles className="w-3.5 h-3.5 text-red-600" />
                <span>Video Studio CMS Suite</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black font-serif text-slate-900 tracking-tight">
                Video Broadcasts & Bulletins
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage high-res video broadcasts, YouTube streams, ground reports, and video SEO ({totalCount} total)
              </p>
            </div>

            <Link
              href="/admin/videos/create"
              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Publish New Video</span>
            </Link>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <form onSubmit={handleSearch} className="flex-1 w-full flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by video title, tags, or reporter..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer"
              >
                Search
              </button>
            </form>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>

              <button
                onClick={fetchVideos}
                title="Refresh"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Table Area (Fixed card with internal scroll) */}
        <div className="flex-1 min-h-0 px-6 sm:px-8 py-4 max-w-7xl w-full mx-auto flex flex-col">
          {/* Videos Table Container Card */}
          <div className="flex-1 min-h-0 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col overflow-hidden">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-16 text-center text-slate-500 space-y-3">
                <RefreshCw className="w-8 h-8 mx-auto animate-spin text-red-600" />
                <p className="text-xs font-mono">Loading video broadcasts...</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-16 text-center space-y-3 text-slate-500">
                <Video className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm font-bold text-slate-900">No videos found</p>
                <p className="text-xs text-slate-500">Try adjusting your filters or publish a new video.</p>
              </div>
            ) : (
              /* Internal Scrollable Table Content */
              <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 text-slate-500 font-mono text-[11px] uppercase tracking-wider border-b border-slate-200 shadow-xs">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Video Clip</th>
                      <th className="py-3.5 px-4 font-semibold">Badge</th>
                      <th className="py-3.5 px-4 font-semibold">Type</th>
                      <th className="py-3.5 px-4 font-semibold">Reporter</th>
                      <th className="py-3.5 px-4 font-semibold">Highlights</th>
                      <th className="py-3.5 px-4 font-semibold">Views</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {videos.map((vid) => (
                      <tr key={vid.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Video Clip + Title */}
                        <td className="py-3.5 px-4 max-w-sm">
                          <div className="flex items-center space-x-3">
                            <div className="w-20 h-12 rounded-lg bg-slate-900 overflow-hidden relative shrink-0 border border-slate-200 shadow-2xs">
                              <img
                                src={getThumb(vid)}
                                alt={vid.title}
                                className="w-full h-full object-cover"
                              />
                              {vid.duration && (
                                <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-[9px] font-mono font-bold text-white px-1 rounded">
                                  {vid.duration}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-900 line-clamp-2 leading-snug">
                                {vid.title}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                                slug: {vid.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Badge */}
                        <td className="py-3.5 px-4">
                          {vid.badge ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 text-[10px] font-black uppercase tracking-wider">
                              {vid.badge}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono text-[10px]">Standard</span>
                          )}
                        </td>

                        {/* Type */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            vid.videoType === 'FILE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {vid.videoType === 'FILE' ? 'MP4 File' : (vid.videoType === 'YOUTUBE' ? 'YouTube' : 'Embed')}
                          </span>
                        </td>

                        {/* Reporter */}
                        <td className="py-3.5 px-4 text-slate-600">
                          {vid.reporterName || 'News Desk'}
                        </td>

                        {/* Highlights (Featured / Trending) */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {vid.isFeaturedHero && (
                              <span className="bg-amber-50 text-amber-800 border border-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> Hero
                              </span>
                            )}
                            {vid.isTrending && (
                              <span className="bg-red-50 text-red-700 border border-red-200 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <TrendingUp className="w-2.5 h-2.5 text-red-600" /> Trend
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Views */}
                        <td className="py-3.5 px-4 text-slate-600 font-mono">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span>{vid.viewsCount.toLocaleString()}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            vid.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : vid.status === 'DRAFT'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {vid.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/videos`}
                              target="_blank"
                              title="Public Preview"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>

                            <Link
                              href={`/admin/videos/edit/${vid.id}`}
                              title="Edit Video"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-blue-600 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              onClick={() => setDeleteId(vid.id)}
                              title="Delete Video"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Video Broadcast?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete this video? This action will remove it from the homepage and videos stream.
              </p>
            </div>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-md shadow-red-600/20 cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminVideosPage() {
  return (
    <AdminAuthProvider>
      <AdminVideosListContent />
    </AdminAuthProvider>
  );
}
