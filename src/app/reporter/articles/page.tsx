'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText, Plus, Search, Filter, CheckCircle2, Clock, AlertTriangle,
  XCircle, Eye, Edit3, Trash2, ExternalLink, MessageSquare, AlertCircle, RefreshCw,
  Sparkles, X
} from 'lucide-react';
import { ReporterLayout } from '@/components/reporter/ReporterLayout';
import { useReporterAuth } from '@/context/ReporterAuthContext';
import { articleService, ArticleData } from '@/services/articleService';
import { formatTimeAgo } from '@/utils/timeAgo';

type StatusFilter = 'ALL' | 'PENDING_REVIEW' | 'NEEDS_REVISION' | 'PUBLISHED' | 'DRAFT' | 'REJECTED';

function ReporterArticlesContent() {
  const router = useRouter();
  const { reporter } = useReporterAuth();

  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('ALL');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewArticle, setPreviewArticle] = useState<ArticleData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchArticles = async () => {
    if (!reporter?.id) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await articleService.getArticles({
        reporterId: reporter.id,
        limit: 100
      });
      setArticles(res.articles || []);
    } catch (err: any) {
      console.error('Failed to load submissions:', err);
      setErrorMsg(err.message || 'Unable to fetch your articles. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [reporter?.id]);

  const handleDeleteDraft = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await articleService.deleteArticle(deleteId);
      setArticles(prev => prev.filter(a => a.id !== deleteId));
      setDeleteId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete article.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      // Status filter
      if (activeFilter !== 'ALL' && article.status !== activeFilter) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = article.title?.toLowerCase().includes(q);
        const catMatch = article.category?.toLowerCase().includes(q);
        return titleMatch || catMatch;
      }
      return true;
    });
  }, [articles, activeFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      ALL: articles.length,
      PENDING_REVIEW: articles.filter(a => a.status === 'PENDING_REVIEW').length,
      NEEDS_REVISION: articles.filter(a => a.status === 'NEEDS_REVISION').length,
      PUBLISHED: articles.filter(a => a.status === 'PUBLISHED').length,
      DRAFT: articles.filter(a => a.status === 'DRAFT').length,
      REJECTED: articles.filter(a => a.status === 'REJECTED').length,
    };
  }, [articles]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Live Published</span>
          </span>
        );
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Under Editorial Review</span>
          </span>
        );
      case 'NEEDS_REVISION':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Revision Required</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Rejected</span>
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Saved Draft</span>
          </span>
        );
    }
  };

  return (
    <>
      <div className="space-y-6">
        
        {/* Header Title & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black font-serif text-slate-900 tracking-tight">
              My Submissions
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Track the editorial lifecycle of your news stories from submission to live publication.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchArticles}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
              title="Refresh Articles"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-600' : ''}`} />
            </button>

            <Link
              href="/reporter/articles/create"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Write New Story</span>
            </Link>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          
          {/* Top Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by article title or category..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-1">
            {(
              [
                { id: 'ALL', label: 'All Stories' },
                { id: 'PENDING_REVIEW', label: 'In Review' },
                { id: 'NEEDS_REVISION', label: 'Needs Revision' },
                { id: 'PUBLISHED', label: 'Published' },
                { id: 'DRAFT', label: 'Drafts' },
                { id: 'REJECTED', label: 'Rejected' },
              ] as { id: StatusFilter; label: string }[]
            ).map((tab) => {
              const count = counts[tab.id];
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
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
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Articles Table / List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-500">Loading your news stories...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-700">No submissions found</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery
                  ? 'No news articles match your current search criteria.'
                  : 'You have not submitted any articles under this category yet.'}
              </p>
              <Link
                href="/reporter/articles/create"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Write First Story</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredArticles.map((article) => {
                const isRevision = article.status === 'NEEDS_REVISION';
                const isDraft = article.status === 'DRAFT';
                const isPending = article.status === 'PENDING_REVIEW';
                const isPublished = article.status === 'PUBLISHED';

                return (
                  <div
                    key={article.id}
                    className={`p-5 transition-colors hover:bg-slate-50/80 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isRevision ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    {/* Left: Thumbnail & Details */}
                    <div className="flex items-start space-x-4 min-w-0 flex-1">
                      {(article.imageUrl || article.featuredImage) ? (
                        <img
                          src={(article.imageUrl || article.featuredImage)!}
                          alt={article.title}
                          className="w-20 h-16 sm:w-24 sm:h-18 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
                        />
                      ) : (
                        <div className="w-20 h-16 sm:w-24 sm:h-18 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6 text-slate-300" />
                        </div>
                      )}

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          {getStatusBadge(article.status)}
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {article.category || 'General'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {formatTimeAgo(article.createdAt).en}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                          {article.title}
                        </h3>

                        {/* Admin Feedback Banner (if Revision or Rejected) */}
                        {article.adminFeedback && (isRevision || article.status === 'REJECTED') && (
                          <div className="mt-2 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2">
                            <MessageSquare className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold">Editor's Feedback: </span>
                              <span>{article.adminFeedback}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center space-x-2 shrink-0 self-end md:self-center flex-wrap gap-y-2">
                      
                      {/* Preview Button (Available for all stories!) */}
                      <button
                        type="button"
                        onClick={() => setPreviewArticle(article)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                        title="Preview submitted news story"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Preview</span>
                      </button>

                      {/* Live Public Link */}
                      {isPublished && (
                        <Link
                          href={`/article/${article.slug || article.id}`}
                          target="_blank"
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors"
                        >
                          <span>Live Site</span>
                          <ExternalLink className="w-3 h-3 text-emerald-600" />
                        </Link>
                      )}

                      {/* Edit Pending Story (Allows fixing mistakes while in Review Queue!) */}
                      {isPending && (
                        <Link
                          href={`/reporter/articles/edit/${article.id}`}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all shadow-2xs"
                          title="Edit & correct any mistakes before admin publishes"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                          <span>Edit Story</span>
                        </Link>
                      )}

                      {/* Edit & Resubmit (for Drafts or Revision requests) */}
                      {(isDraft || isRevision) && (
                        <Link
                          href={`/reporter/articles/edit/${article.id}`}
                          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition-colors shadow-xs ${
                            isRevision
                              ? 'bg-rose-600 hover:bg-rose-700 ring-2 ring-rose-200'
                              : 'bg-slate-900 hover:bg-slate-800'
                          }`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{isRevision ? 'Fix & Resubmit' : 'Edit Draft'}</span>
                        </Link>
                      )}

                      {/* Delete Draft Button */}
                      {isDraft && (
                        <button
                          onClick={() => setDeleteId(article.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Draft"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">Delete Draft Story?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently delete this draft? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDraft}
                disabled={isDeleting}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Story Modal */}
      {previewArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center space-x-2">
                {getStatusBadge(previewArticle.status)}
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700">
                  {previewArticle.category || 'General'}
                </span>
              </div>
              <button
                onClick={() => setPreviewArticle(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                title="Close Preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
              
              {/* Category & Headline */}
              <div className="space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-black font-serif text-slate-900 leading-tight">
                  {previewArticle.title}
                </h2>
                {previewArticle.subHeadline && (
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed italic border-l-2 border-red-500 pl-2.5">
                    {previewArticle.subHeadline}
                  </p>
                )}
              </div>

              {/* Cover Photo */}
              {(previewArticle.imageUrl || previewArticle.featuredImage) && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={(previewArticle.imageUrl || previewArticle.featuredImage)!}
                    alt={previewArticle.title}
                    className="w-full max-h-80 object-cover"
                  />
                  {previewArticle.imageCaption && (
                    <p className="text-[11px] text-slate-500 px-3 py-1.5 bg-slate-50 border-t border-slate-100 italic">
                      {previewArticle.imageCaption}
                    </p>
                  )}
                </div>
              )}

              {/* Highlights (if any) */}
              {previewArticle.bulletPoints && (
                <div className="p-4 rounded-2xl border border-amber-200/90 bg-amber-50/50 space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-amber-900">
                    <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span>Story Highlights</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-amber-950 font-medium pl-1">
                    {(typeof previewArticle.bulletPoints === 'string'
                      ? (() => {
                          try {
                            const p = JSON.parse(previewArticle.bulletPoints);
                            return Array.isArray(p) ? p : [previewArticle.bulletPoints];
                          } catch {
                            return [previewArticle.bulletPoints];
                          }
                        })()
                      : (previewArticle.bulletPoints || [])
                    ).map((point: any, idx: number) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{String(point)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Story Content */}
              <div
                className="prose prose-sm max-w-none text-slate-800 leading-relaxed font-serif pt-1"
                dangerouslySetInnerHTML={{
                  __html: previewArticle.content || '<p class="text-slate-400 italic">No content body written.</p>'
                }}
              />

              {/* Tags */}
              {previewArticle.tags && (
                <div className="pt-3 border-t border-slate-100 flex items-center space-x-2 flex-wrap gap-y-1 text-xs text-slate-500">
                  <span className="font-bold">Keywords / Tags:</span>
                  <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                    {previewArticle.tags}
                  </span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/60">
              <span className="text-[11px] text-slate-500 font-medium">
                Reporter Desk • {previewArticle.status === 'PUBLISHED' ? 'Live Published' : 'In Review / Draft'}
              </span>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setPreviewArticle(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>

                {previewArticle.status !== 'PUBLISHED' && (
                  <Link
                    href={`/reporter/articles/edit/${previewArticle.id}`}
                    className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit &amp; Correct Story</span>
                  </Link>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default function ReporterArticlesPage() {
  return (
    <ReporterLayout>
      <ReporterArticlesContent />
    </ReporterLayout>
  );
}

