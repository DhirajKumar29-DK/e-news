'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { articleService, ArticleData } from '@/services/articleService';
import { categoryService, CategoryData } from '@/services/categoryService';
import { videoService, VideoData } from '@/services/videoService';
import { formatTimeAgo } from '@/utils/timeAgo';
import {
  ClipboardCheck, Clock, AlertTriangle, XCircle, CheckCircle2,
  Eye, Edit3, Send, Sparkles, User, MapPin, Tag, Star, TrendingUp,
  RefreshCw, ChevronRight, X, AlertCircle, ExternalLink, Video, Play, Trash2
} from 'lucide-react';

function AdminReviewQueueContent() {
  const { user } = useAdminAuth();

  // Content type toggle (Articles vs Video Reports)
  const [contentType, setContentType] = useState<'articles' | 'videos'>('articles');

  // Article State
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_REVIEW' | 'NEEDS_REVISION' | 'REJECTED'>('ALL');
  const [counts, setCounts] = useState({
    pendingReview: 0,
    needsRevision: 0,
    rejected: 0,
    total: 0,
  });

  // Video State
  const [pendingVideos, setPendingVideos] = useState<VideoData[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [activeVideoModal, setActiveVideoModal] = useState<VideoData | null>(null);
  const [videoToReject, setVideoToReject] = useState<VideoData | null>(null);
  const [actionLoadingVideoId, setActionLoadingVideoId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Dynamic Categories for editorial re-assignment
  const [categories, setCategories] = useState<CategoryData[]>([]);

  // Review Drawer / Modal State
  const [activeArticle, setActiveArticle] = useState<ArticleData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Editorial settings in preview
  const [overrideCategory, setOverrideCategory] = useState('');
  const [overrideLead, setOverrideLead] = useState(false);
  const [overrideTrending, setOverrideTrending] = useState(false);

  const fetchCategories = async () => {
    try {
      const cats = await categoryService.getCategories();
      setCategories(cats || []);
    } catch (err) {
      console.warn('Failed to fetch categories:', err);
    }
  };

  const fetchPendingVideos = useCallback(async () => {
    try {
      setVideosLoading(true);
      const res = await videoService.getVideos({ status: 'PENDING_REVIEW', limit: 50 });
      const list = res.videos || [];
      setPendingVideos(list);
      return list;
    } catch (err) {
      console.error('Failed to load pending videos:', err);
      return [];
    } finally {
      setVideosLoading(false);
    }
  }, []);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const [artRes, vList] = await Promise.all([
        articleService.getReviewQueue({
          page,
          limit,
          status: statusFilter === 'ALL' ? undefined : statusFilter,
        }),
        fetchPendingVideos()
      ]);
      const loadedArticles = artRes.articles || [];
      setArticles(loadedArticles);
      setTotalPages(artRes.pagination?.totalPages || 1);
      setTotalCount(artRes.pagination?.total || 0);
      if (artRes.counts) {
        setCounts(prev => ({ ...prev, ...artRes.counts }));
      }

      // Check query param or auto-switch to videos if articles are empty but videos exist
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('type') === 'videos' || urlParams.get('tab') === 'videos') {
          setContentType('videos');
        } else if (loadedArticles.length === 0 && (vList || []).length > 0 && !sessionStorage.getItem('user_chose_articles_tab')) {
          setContentType('videos');
        }
      }
    } catch (err) {
      console.error('Failed to load review queue:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, fetchPendingVideos]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('type') === 'videos' || urlParams.get('tab') === 'videos') {
        setContentType('videos');
      }
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // Handle Video Review Actions
  const handleApproveVideo = async (videoId: string) => {
    try {
      setActionLoadingVideoId(videoId);
      await videoService.updateVideo(videoId, { status: 'PUBLISHED' });
      setPendingVideos(prev => prev.filter(v => v.id !== videoId));
      if (activeVideoModal?.id === videoId) {
        setActiveVideoModal(null);
      }
      setToastMessage({ text: 'Video broadcast approved and published live!', type: 'success' });
    } catch (err: any) {
      setToastMessage({ text: err.message || 'Failed to approve video', type: 'error' });
    } finally {
      setActionLoadingVideoId(null);
    }
  };

  const confirmRejectVideo = async () => {
    if (!videoToReject) return;
    const videoId = videoToReject.id;
    try {
      setActionLoadingVideoId(videoId);
      await videoService.deleteVideo(videoId);
      setPendingVideos(prev => prev.filter(v => v.id !== videoId));
      if (activeVideoModal?.id === videoId) {
        setActiveVideoModal(null);
      }
      setVideoToReject(null);
      setToastMessage({ text: 'Video report rejected and removed successfully.', type: 'success' });
    } catch (err: any) {
      setToastMessage({ text: err.message || 'Failed to reject video', type: 'error' });
    } finally {
      setActionLoadingVideoId(null);
    }
  };

  // Handle Review Action (Publish, Request Revision, Reject)
  const handleReviewAction = async (
    action: 'PUBLISH' | 'APPROVE' | 'REQUEST_REVISION' | 'REJECT',
    articleId: string,
    feedback?: string
  ) => {
    setIsActionLoading(true);
    try {
      await articleService.reviewArticle(articleId, {
        action,
        feedback,
        category: overrideCategory || undefined,
        isLeadStory: overrideLead,
        isTrending: overrideTrending,
      });

      setIsPreviewOpen(false);
      setIsRevisionModalOpen(false);
      setIsRejectModalOpen(false);
      setFeedbackNote('');
      setActiveArticle(null);
      await fetchQueue();
      setToastMessage({
        text: action === 'PUBLISH' || action === 'APPROVE'
          ? 'Article published live successfully!'
          : action === 'REQUEST_REVISION'
          ? 'Revision request sent to reporter.'
          : 'Article rejected and removed.',
        type: 'success'
      });
    } catch (err: any) {
      setToastMessage({ text: err.message || `Failed to execute ${action}`, type: 'error' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const openPreview = (article: ArticleData) => {
    setActiveArticle(article);
    setOverrideCategory(article.category || '');
    setOverrideLead(Boolean(article.isLeadStory));
    setOverrideTrending(Boolean(article.isTrending));
    setIsPreviewOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Awaiting Review</span>
          </span>
        );
      case 'NEEDS_REVISION':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Revision Sent</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <XCircle className="w-3 h-3 text-slate-500" />
            <span>Rejected</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <AdminHeader title="Editorial Review & Publishing Queue" />

        {/* Pinned Top Bar: Header, KPI Summary Cards & Status Tabs */}
        <div className="shrink-0 bg-slate-50 border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 pt-4 pb-3 max-w-7xl w-full mx-auto space-y-3">
          
          {/* Header & Content Type Tabs & Refresh */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black font-serif text-slate-900 tracking-tight">
                Editorial Review Queue
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Review submitted field stories and video broadcasts, perform editorial verification, or approve live to the website.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center p-1 bg-slate-200/80 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setContentType('articles')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    contentType === 'articles'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ClipboardCheck className="w-3.5 h-3.5 text-red-600" />
                  <span>Articles ({counts.pendingReview})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setContentType('videos')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    contentType === 'videos'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 text-red-600" />
                  <span>Video Reports ({pendingVideos.length})</span>
                  {pendingVideos.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-white animate-pulse">
                      {pendingVideos.length} NEW
                    </span>
                  )}
                </button>
              </div>

              <button
                onClick={fetchQueue}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-xs cursor-pointer"
                title="Refresh Queue"
              >
                <RefreshCw className={`w-4 h-4 ${loading || videosLoading ? 'animate-spin text-red-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Pending Videos Banner for Article tab */}
          {pendingVideos.length > 0 && contentType === 'articles' && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-950 animate-fadeIn">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center space-x-2">
                    <span>{pendingVideos.length} Ground Video Reports Awaiting Approval</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-white">NEW</span>
                  </h4>
                  <p className="text-xs text-amber-800">
                    Field reporters have submitted video stories ready for editorial verification and publication.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setContentType('videos')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center space-x-1.5 self-start sm:self-center shrink-0"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Review {pendingVideos.length} Videos</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* KPI Cards (for Articles) */}
          {contentType === 'articles' ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div
                  onClick={() => { setStatusFilter('ALL'); setPage(1); }}
                  className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    statusFilter === 'ALL'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-70">All Submissions</span>
                    <ClipboardCheck className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black font-serif mt-1">{counts.total}</div>
                </div>

                <div
                  onClick={() => { setStatusFilter('PENDING_REVIEW'); setPage(1); }}
                  className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    statusFilter === 'PENDING_REVIEW'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-70">Awaiting Review</span>
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black font-serif mt-1 flex items-center space-x-2">
                    <span>{counts.pendingReview}</span>
                    {counts.pendingReview > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold animate-pulse">
                        Needs Action
                      </span>
                    )}
                  </div>
                </div>

                <div
                  onClick={() => { setStatusFilter('NEEDS_REVISION'); setPage(1); }}
                  className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    statusFilter === 'NEEDS_REVISION'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-70">With Reporter</span>
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black font-serif mt-1">{counts.needsRevision}</div>
                </div>

                <div
                  onClick={() => { setStatusFilter('REJECTED'); setPage(1); }}
                  className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    statusFilter === 'REJECTED'
                      ? 'bg-slate-700 text-white border-slate-700 shadow-md'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-70">Rejected</span>
                    <XCircle className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black font-serif mt-1">{counts.rejected}</div>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-2 overflow-x-auto no-scrollbar">
                {[
                  { id: 'ALL', label: 'All Submissions', count: counts.total },
                  { id: 'PENDING_REVIEW', label: 'Pending Review', count: counts.pendingReview },
                  { id: 'NEEDS_REVISION', label: 'Awaiting Reporter Revision', count: counts.needsRevision },
                  { id: 'REJECTED', label: 'Rejected', count: counts.rejected },
                ].map((tab) => {
                  const isActive = statusFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setStatusFilter(tab.id as any);
                        setPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                          isActive ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Video className="w-4 h-4 text-red-600" />
                <span className="text-xs font-bold text-slate-800">
                  Ground Video Submissions ({pendingVideos.length} pending approval)
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Reporter video stories will not stream publicly until approved here
              </span>
            </div>
          )}
        </div>

        {/* Main Queue Area (Fixed card with internal scroll) */}
        <div className="flex-1 min-h-0 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 max-w-7xl w-full mx-auto flex flex-col">
          <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
            {contentType === 'articles' ? (
              <>
                {loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-bold text-slate-500">Checking submission queue...</p>
                  </div>
                ) : articles.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-3">
                    <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto" />
                    <div className="text-sm font-bold text-slate-700">Queue is clear!</div>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      There are no reporter articles awaiting editorial review in this view.
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-slate-100">
                    {articles.map((art) => {
                      return (
                        <div
                          key={art.id}
                          className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          {/* Left: Thumbnail & Details */}
                          <div className="flex items-start space-x-4 min-w-0 flex-1">
                            {(art.imageUrl || art.featuredImage) ? (
                              <img
                                src={(art.imageUrl || art.featuredImage)!}
                                alt={art.title}
                                className="w-24 h-18 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
                              />
                            ) : (
                              <div className="w-24 h-18 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                <Tag className="w-6 h-6 text-slate-300" />
                              </div>
                            )}

                            <div className="space-y-1.5 min-w-0 flex-1">
                              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                {getStatusBadge(art.status)}
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-100">
                                  {art.category || 'General'}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  Submitted {formatTimeAgo(art.submittedAt || art.createdAt).en}
                                </span>
                              </div>

                              <h3
                                onClick={() => openPreview(art)}
                                className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 cursor-pointer hover:text-red-600 transition-colors"
                              >
                                {art.title}
                              </h3>

                              {/* Reporter Info Row */}
                              <div className="flex items-center space-x-2 text-xs text-slate-600">
                                <span className="font-bold flex items-center space-x-1 text-slate-800">
                                  <User className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{art.reporter?.name || art.authorName || 'Reporter'}</span>
                                </span>
                                {(art.reporter?.district || (art.reporter as any)?.state) && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center space-x-1 text-slate-500">
                                      <MapPin className="w-3 h-3 text-red-500" />
                                      <span>{[art.reporter?.city, art.reporter?.district].filter(Boolean).join(', ')}</span>
                                    </span>
                                  </>
                                )}
                              </div>

                              {/* Past Admin Feedback if revision or rejected */}
                              {art.adminFeedback && (
                                <div className="mt-1 p-2 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-900 text-[11px]">
                                  <span className="font-bold">Editorial Note: </span>
                                  <span>{art.adminFeedback}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                            
                            {/* Review Story Full Preview Modal */}
                            <button
                              onClick={() => openPreview(art)}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-xs"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              <span>Review & Fact-Check</span>
                            </button>

                            {/* One-Click Publish */}
                            <button
                              onClick={() => handleReviewAction('PUBLISH', art.id)}
                              disabled={isActionLoading}
                              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5"
                              title="Publish story directly to live site"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Publish Live</span>
                            </button>

                            {/* Request Revision */}
                            <button
                              onClick={() => {
                                setActiveArticle(art);
                                setIsRevisionModalOpen(true);
                              }}
                              disabled={isActionLoading}
                              className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors"
                              title="Ask reporter for revision"
                            >
                              <span>Request Changes</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pinned Bottom Pagination & Items Per Page Controls */}
                <div className="shrink-0 p-3.5 sm:px-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-600 bg-slate-50/80">
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-600">
                      Page {page} of {Math.max(1, totalPages)} <span className="text-slate-400 font-normal">({totalCount} total stories in review)</span>
                    </span>

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

                  <div className="flex items-center space-x-2">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Previous
                    </button>
                    <span className="text-xs font-bold px-2 text-slate-700">{page} / {Math.max(1, totalPages)}</span>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* VIDEOS QUEUE */
              <div className="flex-1 flex flex-col min-h-0">
                {videosLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-bold text-slate-500">Checking pending ground videos...</p>
                  </div>
                ) : pendingVideos.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-3">
                    <Video className="w-10 h-10 text-slate-300 mx-auto" />
                    <div className="text-sm font-bold text-slate-700">No pending video broadcasts</div>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      All reporter video reports have been reviewed or published live to the website.
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-slate-100">
                    {pendingVideos.map((vid) => {
                      const thumb = vid.thumbnailUrl || (vid.youtubeId ? `https://img.youtube.com/vi/${vid.youtubeId}/hqdefault.jpg` : '/images/video-placeholder.jpg');

                      return (
                        <div
                          key={vid.id}
                          className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          {/* Left: Thumbnail & Details */}
                          <div className="flex items-start space-x-4 min-w-0 flex-1">
                            <div
                              onClick={() => setActiveVideoModal(vid)}
                              className="relative w-36 aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0 shadow-xs cursor-pointer group"
                            >
                              <img
                                src={thumb}
                                alt={vid.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                                  <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                                </div>
                              </div>
                              {vid.duration && (
                                <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[9px] font-bold text-white">
                                  {vid.duration}
                                </span>
                              )}
                            </div>

                            <div className="space-y-1.5 min-w-0 flex-1">
                              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>Pending Approval</span>
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-100">
                                  {vid.category || 'General'}
                                </span>
                                {vid.badge && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                    {vid.badge}
                                  </span>
                                )}
                                <span className="text-[11px] text-slate-400">
                                  Submitted {vid.createdAt ? formatTimeAgo(vid.createdAt).en : 'Recently'}
                                </span>
                              </div>

                              <h3
                                onClick={() => setActiveVideoModal(vid)}
                                className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 cursor-pointer hover:text-red-600 transition-colors font-serif"
                              >
                                {vid.title}
                              </h3>

                              <div className="flex items-center space-x-2 text-xs text-slate-600">
                                <span className="font-bold flex items-center space-x-1 text-slate-800">
                                  <User className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{vid.reporterName || 'Field Reporter'}</span>
                                </span>
                                {vid.location && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center space-x-1 text-slate-500">
                                      <MapPin className="w-3 h-3 text-red-500" />
                                      <span>{vid.location}</span>
                                    </span>
                                  </>
                                )}
                              </div>

                              {vid.description && (
                                <p className="text-xs text-slate-500 line-clamp-1">
                                  {vid.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                            <button
                              onClick={() => setActiveVideoModal(vid)}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 text-red-600 fill-red-600" />
                              <span>Watch &amp; Verify</span>
                            </button>

                            <button
                              onClick={() => handleApproveVideo(vid.id)}
                              disabled={actionLoadingVideoId === vid.id}
                              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                              title="Approve and stream video live on website"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{actionLoadingVideoId === vid.id ? 'Publishing...' : 'Approve & Publish Live'}</span>
                            </button>

                            <button
                              onClick={() => setVideoToReject(vid)}
                              disabled={actionLoadingVideoId === vid.id}
                              className="p-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                              title="Reject video report"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="shrink-0 p-3.5 sm:px-6 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600 bg-slate-50/80">
                  <span>{pendingVideos.length} Video Reports Awaiting Verification</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Approved video reports appear on homepage &amp; Video Studio immediately
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FULL ARTICLE REVIEW DRAWER / MODAL */}
      {isPreviewOpen && activeArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col overflow-hidden">
            
            {/* Pinned Sticky Top Bar (Icon removed per user request) */}
            <div className="shrink-0 flex items-center justify-between border-b border-slate-200/80 px-6 sm:px-8 py-4 bg-white z-10">
              <h3 className="text-base font-extrabold text-slate-900 font-serif">
                Editorial Proofing &amp; Publishing Desk
              </h3>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Story Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              {/* Reporter Bylines */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white font-serif font-black flex items-center justify-center text-sm">
                    {activeArticle.reporter?.name?.charAt(0) || 'R'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">
                      By {activeArticle.reporter?.name || activeArticle.authorName}
                    </div>
                    <div className="text-slate-500">
                      {activeArticle.reporter?.email}
                      {activeArticle.reporter?.phone ? ` • ${activeArticle.reporter.phone}` : ''}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Submitted</span>
                  <span className="font-bold text-slate-700">
                    {formatTimeAgo(activeArticle.submittedAt || activeArticle.createdAt).en}
                  </span>
                </div>
              </div>

            {/* Story Content Preview */}
            <div className="space-y-4">
              {/* Category & Status */}
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">
                  {activeArticle.category || 'General'}
                </span>
                {getStatusBadge(activeArticle.status)}
              </div>

              {/* Headline */}
              <h2 className="text-xl sm:text-2xl font-black font-serif text-slate-900 leading-snug">
                {activeArticle.title}
              </h2>

              {/* Cover Image */}
              {(activeArticle.imageUrl || activeArticle.featuredImage) && (
                <div className="rounded-2xl overflow-hidden border border-slate-200">
                  <img
                    src={(activeArticle.imageUrl || activeArticle.featuredImage)!}
                    alt={activeArticle.title}
                    className="w-full h-64 sm:h-80 object-cover"
                  />
                  {(activeArticle.caption || activeArticle.imageCaption) && (
                    <p className="p-2 bg-slate-50 text-[11px] text-slate-500 italic text-center border-t border-slate-100">
                      {activeArticle.caption || activeArticle.imageCaption}
                    </p>
                  )}
                </div>
              )}

              {/* Summary / Lead */}
              {(activeArticle.summary || activeArticle.subHeadline) && (
                <div className="p-4 rounded-xl bg-slate-50 border-l-4 border-red-600 text-xs sm:text-sm font-semibold text-slate-700 italic">
                  {activeArticle.summary || activeArticle.subHeadline}
                </div>
              )}

              {/* Formatted Body */}
              <div
                className="prose prose-sm max-w-none text-slate-800 leading-relaxed pt-2"
                dangerouslySetInnerHTML={{ __html: activeArticle.content }}
              />
            </div>

            {/* Editorial Control Box (Category reassign, Lead story, Trending) */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <span className="text-xs font-bold text-slate-900 block">
                Editorial Controls & Categorization
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Category Override */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Category / Beat</label>
                  <select
                    value={overrideCategory}
                    onChange={(e) => setOverrideCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Lead Story Toggle */}
                <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer self-end">
                  <input
                    type="checkbox"
                    checked={overrideLead}
                    onChange={(e) => setOverrideLead(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      <span>Promote to Lead</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Homepage Top Lead</span>
                  </div>
                </label>

                {/* Trending Toggle */}
                <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer self-end">
                  <input
                    type="checkbox"
                    checked={overrideTrending}
                    onChange={(e) => setOverrideTrending(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                      <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                      <span>Mark Trending</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Highlight in Trending</span>
                  </div>
                </label>
              </div>
            </div>

            {/* End of Scrollable Body */}
            </div>

            {/* Pinned Bottom Actions Bar */}
            <div className="shrink-0 border-t border-slate-200/80 px-6 sm:px-8 py-3.5 bg-slate-50/90 backdrop-blur-xs flex flex-wrap items-center justify-between gap-3 z-10">
              
              <Link
                href={`/admin/articles/edit/${activeArticle.id}`}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center space-x-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                <span>Open in Full Article CMS Editor</span>
              </Link>

              <div className="flex items-center space-x-2">
                {/* Reject */}
                <button
                  onClick={() => setIsRejectModalOpen(true)}
                  disabled={isActionLoading}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors"
                >
                  Reject Story
                </button>

                {/* Request Revision */}
                <button
                  onClick={() => setIsRevisionModalOpen(true)}
                  disabled={isActionLoading}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  Request Revision
                </button>

                {/* Publish to Live Site */}
                <button
                  onClick={() => handleReviewAction('PUBLISH', activeArticle.id)}
                  disabled={isActionLoading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isActionLoading ? 'Publishing...' : 'Approve & Publish Live'}</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* REQUEST REVISION MODAL */}
      {isRevisionModalOpen && activeArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Request Editorial Changes</h3>
              <p className="text-xs text-slate-500">
                Provide clear instructions for <span className="font-bold text-slate-800">{activeArticle.reporter?.name || 'Reporter'}</span> to update and re-submit this story.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Editorial Feedback Note *</label>
              <textarea
                rows={3}
                required
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder="e.g. Please verify the official quote from the District Magistrate and provide a higher resolution photograph."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-red-500 focus:bg-white resize-none"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => {
                  setIsRevisionModalOpen(false);
                  setFeedbackNote('');
                }}
                disabled={isActionLoading}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReviewAction('REQUEST_REVISION', activeArticle.id, feedbackNote)}
                disabled={isActionLoading || !feedbackNote.trim()}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-xs font-bold transition-colors shadow-xs"
              >
                {isActionLoading ? 'Sending...' : 'Send Revision Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT STORY MODAL */}
      {isRejectModalOpen && activeArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <XCircle className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Reject Story Submission</h3>
              <p className="text-xs text-slate-500">
                Explain why this story does not meet newsroom editorial standards.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Rejection Reason *</label>
              <textarea
                rows={3}
                required
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder="e.g. This story has already been covered extensively or contains unverified claims."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-red-500 focus:bg-white resize-none"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setFeedbackNote('');
                }}
                disabled={isActionLoading}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReviewAction('REJECT', activeArticle.id, feedbackNote)}
                disabled={isActionLoading || !feedbackNote.trim()}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold transition-colors shadow-xs"
              >
                {isActionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIDEO WATCH & APPROVE MODAL */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded-full">
                  {activeVideoModal.badge || 'GROUND REPORT'}
                </span>
                <span className="text-xs font-bold text-slate-800 uppercase">
                  {activeVideoModal.category}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideoModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Frame */}
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg">
              {activeVideoModal.youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideoModal.youtubeId}?autoplay=1&rel=0`}
                  title={activeVideoModal.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : activeVideoModal.videoUrl ? (
                <video
                  src={activeVideoModal.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                  No video stream available
                </div>
              )}
            </div>

            {/* Video Details */}
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-base text-slate-900 leading-snug font-serif">
                {activeVideoModal.title}
              </h3>
              <div className="flex items-center space-x-3 text-xs text-slate-500 font-medium">
                <span className="font-bold text-slate-800">
                  By {activeVideoModal.reporterName || 'Field Reporter'}
                </span>
                {activeVideoModal.location && (
                  <>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-red-500" />
                      <span>{activeVideoModal.location}</span>
                    </span>
                  </>
                )}
                <span>•</span>
                <span>{activeVideoModal.duration || '00:00'}</span>
              </div>
              {activeVideoModal.description && (
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 max-h-24 overflow-y-auto">
                  {activeVideoModal.description}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setVideoToReject(activeVideoModal)}
                disabled={actionLoadingVideoId === activeVideoModal.id}
                className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer disabled:opacity-50"
              >
                Reject Video
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveVideoModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleApproveVideo(activeVideoModal.id)}
                  disabled={actionLoadingVideoId === activeVideoModal.id}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{actionLoadingVideoId === activeVideoModal.id ? 'Publishing...' : 'Approve & Publish Live'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECT VIDEO CONFIRMATION MODAL */}
      {videoToReject && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <Trash2 className="w-6 h-6 text-rose-600" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 font-serif">
                Reject Video Report?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to reject and remove this video report? This will discard the submission from the review queue.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1 text-left">
              <div className="flex items-center space-x-2">
                <span className="text-[9px] font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded-full">
                  {videoToReject.badge || 'REPORT'}
                </span>
                <span className="text-[11px] font-bold text-slate-600 uppercase">
                  {videoToReject.category}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900 line-clamp-2 pt-1 font-serif">
                {videoToReject.title}
              </p>
              <div className="flex items-center space-x-2 text-[11px] text-slate-500 pt-0.5 font-medium">
                <span>By {videoToReject.reporterName || 'Field Reporter'}</span>
                {videoToReject.duration && (
                  <>
                    <span>•</span>
                    <span>{videoToReject.duration}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setVideoToReject(null)}
                disabled={actionLoadingVideoId === videoToReject.id}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRejectVideo}
                disabled={actionLoadingVideoId === videoToReject.id}
                className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{actionLoadingVideoId === videoToReject.id ? 'Rejecting...' : 'Yes, Reject Video'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[70] max-w-sm animate-in fade-in slide-in-from-top-3 duration-200">
          <div
            className={`p-3.5 rounded-2xl flex items-center space-x-3 shadow-xl text-xs font-bold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 text-white'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span className="flex-1">{toastMessage.text}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AdminReviewQueuePage() {
  return (
    <AdminAuthProvider>
      <AdminReviewQueueContent />
    </AdminAuthProvider>
  );
}
