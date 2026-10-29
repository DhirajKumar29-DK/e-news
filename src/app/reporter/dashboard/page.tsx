'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText, Plus, CheckCircle2, Clock, AlertTriangle, XCircle,
  Eye, ArrowRight, Sparkles, MessageSquare, Edit3, Send
} from 'lucide-react';
import { ReporterLayout } from '@/components/reporter/ReporterLayout';
import { useReporterAuth } from '@/context/ReporterAuthContext';
import { articleService, ArticleData } from '@/services/articleService';
import { formatTimeAgo } from '@/utils/timeAgo';

function ReporterDashboardContent() {
  const router = useRouter();
  const { reporter } = useReporterAuth();

  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (reporter?.id) {
      articleService.getArticles({ reporterId: reporter.id, limit: 10 })
        .then(res => setArticles(res.articles || []))
        .catch(err => console.error('Failed to load reporter articles:', err))
        .finally(() => setLoading(false));
    }
  }, [reporter?.id]);

  // Metric counts
  const totalCount = articles.length;
  const publishedCount = articles.filter(a => a.status === 'PUBLISHED').length;
  const pendingCount = articles.filter(a => a.status === 'PENDING_REVIEW').length;
  const revisionCount = articles.filter(a => a.status === 'NEEDS_REVISION').length;
  const draftCount = articles.filter(a => a.status === 'DRAFT').length;
  const totalViews = articles.reduce((sum, a) => sum + (a.viewsCount || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Live Published</span>
          </span>
        );
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>In Editorial Review</span>
          </span>
        );
      case 'NEEDS_REVISION':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Changes Requested</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <XCircle className="w-3 h-3 text-slate-500" />
            <span>Rejected</span>
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <span>Draft</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-0.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Field Reporter Desk</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-serif text-slate-900">
            Welcome back, {reporter?.name || 'Reporter'}!
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Reporting Area: <span className="text-slate-800 font-bold">{reporter?.city || 'Regional'}, {reporter?.state || 'India'}</span> • Credentials: <span className="text-emerald-600 font-bold">Verified</span>
          </p>
        </div>

        <Link
          href="/reporter/articles/create"
          className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Write New News Story</span>
        </Link>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Stories</span>
          <div className="text-2xl font-black text-slate-900">{totalCount}</div>
          <span className="text-[10px] text-slate-500 font-medium">All submissions</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Live Published</span>
          <div className="text-2xl font-black text-emerald-700">{publishedCount}</div>
          <span className="text-[10px] text-emerald-600 font-medium">{totalViews} reader views</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">In Editorial Review</span>
          <div className="text-2xl font-black text-amber-700">{pendingCount}</div>
          <span className="text-[10px] text-amber-600 font-medium">Awaiting admin review</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-rose-600">Needs Revision</span>
          <div className="text-2xl font-black text-rose-700">{revisionCount}</div>
          <span className="text-[10px] text-rose-600 font-medium">Admin notes attached</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1 col-span-2 lg:col-span-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Drafts</span>
          <div className="text-2xl font-black text-slate-700">{draftCount}</div>
          <span className="text-[10px] text-slate-500 font-medium">Unsubmitted drafts</span>
        </div>
      </div>

      {/* Revision Alerts Notice (If any article needs correction) */}
      {revisionCount > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold block">
                {revisionCount} {revisionCount === 1 ? 'Article Requires Revision' : 'Articles Require Revision'}
              </span>
              <p className="text-[11px] text-amber-800">
                The editorial desk has reviewed your story and requested clarification or additional details before publication.
              </p>
            </div>
          </div>
          <Link
            href="/reporter/articles?status=NEEDS_REVISION"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 text-center transition-colors shadow-xs"
          >
            Review Feedback &amp; Resubmit
          </Link>
        </div>
      )}

      {/* Recent Stories Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-black font-serif text-slate-900">
              Recent Submissions
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Real-time editorial status of your contributed stories
            </p>
          </div>
          <Link
            href="/reporter/articles"
            className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold">Loading your stories...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <FileText className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs font-semibold">You have not submitted any news stories yet.</p>
            <Link
              href="/reporter/articles/create"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Draft Your First Story</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {articles.slice(0, 8).map((article) => (
              <div
                key={article.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
              >
                <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">
                      {article.category}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {formatTimeAgo(article.submittedAt || article.createdAt).en}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 truncate font-serif">
                    {article.title}
                  </h3>
                  {article.adminFeedback && article.status === 'NEEDS_REVISION' && (
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start space-x-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span><strong>Editorial Desk Note:</strong> {article.adminFeedback}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  {getStatusBadge(article.status)}

                  <div className="flex items-center space-x-1.5">
                    {article.status === 'NEEDS_REVISION' || article.status === 'DRAFT' ? (
                      <Link
                        href={`/reporter/articles/edit/${article.id}`}
                        className="p-2 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors font-bold text-xs flex items-center space-x-1"
                        title="Edit & Resubmit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </Link>
                    ) : (
                      <Link
                        href={`/reporter/articles/edit/${article.id}`}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors font-bold text-xs flex items-center space-x-1"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">View</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReporterDashboardPage() {
  return (
    <ReporterLayout>
      <ReporterDashboardContent />
    </ReporterLayout>
  );
}

