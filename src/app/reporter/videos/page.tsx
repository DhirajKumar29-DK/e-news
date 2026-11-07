'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Video, Play, Plus, Search, Filter, Eye, Trash2,
  ExternalLink, Clock, MapPin, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import { ReporterLayout } from '@/components/reporter/ReporterLayout';
import { useReporterAuth } from '@/context/ReporterAuthContext';
import { videoService, VideoData } from '@/services/videoService';
import { formatTimeAgo } from '@/utils/timeAgo';

function ReporterVideosContent() {
  const router = useRouter();
  const { reporter } = useReporterAuth();

  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_REVIEW' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [deleteTarget, setDeleteTarget] = useState<VideoData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await videoService.getVideos({ limit: 100, status: 'ALL' });
      // Filter videos submitted by this reporter (matching reporterName or reporter's name)
      const myVideos = (res.videos || []).filter(v => {
        if (!reporter?.name) return true;
        const repName = reporter.name.toLowerCase().trim();
        const vName = (v.reporterName || '').toLowerCase().trim();
        return vName === repName || vName === 'field reporter' || !vName;
      });
      setVideos(myVideos);
    } catch (err) {
      console.error('Failed to load reporter videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [reporter?.name]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await videoService.deleteVideo(deleteTarget.id);
      setVideos(prev => prev.filter(v => v.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete video report');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered videos
  const filteredVideos = useMemo(() => {
    return videos.filter(v => {
      const matchesSearch =
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.location && v.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        v.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || v.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [videos, searchQuery, statusFilter]);

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredVideos.length / limit) || 1;
  const paginatedVideos = useMemo(() => {
    const startIndex = (currentPage - 1) * limit;
    return filteredVideos.slice(startIndex, startIndex + limit);
  }, [filteredVideos, currentPage, limit]);

  // Metric stats
  const totalVideos = videos.length;
  const publishedVideos = videos.filter(v => v.status === 'PUBLISHED').length;
  const pendingVideos = videos.filter(v => v.status === 'PENDING_REVIEW').length;
  const totalViews = videos.reduce((sum, v) => sum + (v.viewsCount || 0), 0);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/90 text-white backdrop-blur-md shadow-xs flex items-center space-x-1">
            <span>● Live</span>
          </span>
        );
      case 'PENDING_REVIEW':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/95 text-white backdrop-blur-md shadow-xs flex items-center space-x-1">
            <Clock className="w-2.5 h-2.5" />
            <span>In Review</span>
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800/90 text-slate-300 backdrop-blur-md shadow-xs">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Sticky Header, Metric Counters & Search Bar */}
      {/* Sticky Header Container */}
      <div className="sticky top-0 lg:top-3 z-20 bg-slate-50/95 backdrop-blur-md pt-1 pb-2 space-y-1.5 transition-all">
        {/* Top Header Card */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black font-serif text-slate-900">
              Video Reports &amp; Stories ({filteredVideos.length})
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Manage your ground coverage videos, track editorial verification status, and monitor reader views.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={fetchVideos}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs cursor-pointer"
              title="Refresh Videos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-600' : ''}`} />
            </button>

            <Link
              href="/reporter/videos/create"
              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Post Video Story</span>
            </Link>
          </div>
        </div>

        {/* 4 Compact Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="bg-white px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Reports
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900 font-mono">
                {totalVideos}
              </span>
            </div>
            <div className="w-7 h-7 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 border border-slate-100">
              <Video className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="bg-white px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
                In Review
              </span>
              <span className="text-base sm:text-lg font-black text-amber-700 font-mono">
                {pendingVideos}
              </span>
            </div>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="bg-white px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                Live Published
              </span>
              <span className="text-base sm:text-lg font-black text-emerald-700 font-mono">
                {publishedVideos}
              </span>
            </div>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="bg-white px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                Total Plays
              </span>
              <span className="text-base sm:text-lg font-black text-blue-700 font-mono">
                {totalViews.toLocaleString()}
              </span>
            </div>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <Eye className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search articles by headline or content..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none cursor-pointer w-full sm:w-auto"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING_REVIEW">In Review</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Area (Exact Admin Articles Style) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-16 text-center text-slate-400 text-xs font-semibold space-x-2">
            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading Video Reports from Database...</span>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center space-y-3">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-black text-slate-800 text-lg">No Video Stories Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              No video reports match your current filter. Post your ground video report now!
            </p>
            <Link
              href="/reporter/videos/create"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Post First Video Report</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-0">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/95 backdrop-blur-xs border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Article</th>
                  <th className="py-3 px-4">Badge</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Views</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {paginatedVideos.map((vid) => {
                  const thumb = vid.thumbnailUrl || (vid.youtubeId ? `https://img.youtube.com/vi/${vid.youtubeId}/hqdefault.jpg` : '/images/video-placeholder.jpg');

                  return (
                    <tr key={vid.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Video Story + Thumbnail */}
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="flex items-center space-x-3">
                          <div className="w-16 h-10 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-200 relative shadow-2xs">
                            <img
                              src={thumb}
                              alt={vid.title}
                              className="w-full h-full object-cover"
                            />
                            {vid.duration && (
                              <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-[8px] font-mono text-white px-1 rounded">
                                {vid.duration}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <h4 className="font-bold text-slate-900 font-serif line-clamp-1 hover:text-red-600 transition-colors">
                              {vid.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              {vid.description || (vid.location ? `Reported from ${vid.location}` : `By ${vid.reporterName || 'Field Reporter'}`)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Badge */}
                      <td className="py-3.5 px-4">
                        {vid.badge ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wide border border-red-200">
                            {vid.badge}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-[10px] uppercase">Standard</span>
                        )}
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          vid.videoType === 'FILE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {vid.videoType === 'FILE' ? 'MP4 File' : (vid.videoType === 'YOUTUBE' ? 'YouTube' : 'Embed')}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          vid.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : vid.status === 'PENDING_REVIEW'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            vid.status === 'PUBLISHED'
                              ? 'bg-emerald-500'
                              : vid.status === 'PENDING_REVIEW'
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`}></span>
                          <span>{vid.status}</span>
                        </span>
                      </td>

                      {/* Views */}
                      <td className="py-3.5 px-4 text-slate-600 font-semibold">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>{vid.viewsCount || 0}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                        {new Date(vid.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <Link
                            href="/videos"
                            target="_blank"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                            title="View on Site"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => setDeleteTarget(vid)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-slate-500 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
                            title="Delete Video Story"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pinned Bottom Pagination & Items Per Page Controls (Exact Admin Articles Style) */}
        <div className="shrink-0 p-3.5 sm:px-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-600 bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <span className="text-slate-600">
              Page {currentPage} of {Math.max(1, totalPages)}{' '}
              <span className="text-slate-400 font-normal">({filteredVideos.length} total)</span>
            </span>

            {/* 5, 10, 20, 50 Items Per Page Dropdown */}
            <div className="flex items-center space-x-1.5 border-l border-slate-200 pl-3">
              <span className="text-slate-400 font-normal text-[11px]">Show:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setCurrentPage(1);
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
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
              Math.max(0, currentPage - 3),
              Math.min(totalPages, currentPage + 2)
            ).map((pNum) => (
              <button
                key={pNum}
                onClick={() => setCurrentPage(pNum)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  currentPage === pNum
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                {pNum}
              </button>
            ))}
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-slate-900">Delete Video Story?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete <strong>&quot;{deleteTarget.title}&quot;</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReporterVideosPage() {
  return (
    <ReporterLayout>
      <ReporterVideosContent />
    </ReporterLayout>
  );
}

