'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { articleService, ArticleData } from '@/services/articleService';
import { categoryService, CategoryData } from '@/services/categoryService';
import { formatTimeAgo } from '@/utils/timeAgo';
import {
  ClipboardCheck, Clock, AlertTriangle, XCircle, CheckCircle2,
  Eye, Edit3, Send, Sparkles, User, MapPin, Tag, Star, TrendingUp,
  RefreshCw, ChevronRight, X, AlertCircle, ExternalLink
} from 'lucide-react';

function AdminReviewQueueContent() {
  const { user } = useAdminAuth();

  // State
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

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await articleService.getReviewQueue({
        page,
        limit,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      setArticles(res.articles || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalCount(res.pagination?.total || 0);
      if (res.counts) {
        setCounts(prev => ({ ...prev, ...res.counts }));
      }
    } catch (err) {
      console.error('Failed to load review queue:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

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
    } catch (err: any) {
      alert(err.message || `Failed to execute ${action}`);
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
          
          {/* Header & Refresh */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black font-serif text-slate-900 tracking-tight">
                Reporter Article Submissions
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Review submitted news stories, perform editorial fact-checking, request revisions, or publish instantly to live website.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={fetchQueue}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-xs cursor-pointer"
                title="Refresh Queue"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* KPI Cards */}
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
        </div>

        {/* Main Queue Area (Fixed card with internal scroll) */}
        <div className="flex-1 min-h-0 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 max-w-7xl w-full mx-auto flex flex-col">
          <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
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

      {/* FULL ARTICLE REVIEW DRAWER / MODAL */}
      {isPreviewOpen && activeArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-bold text-slate-900">Editorial Proofing & Publishing Desk</h3>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              
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
