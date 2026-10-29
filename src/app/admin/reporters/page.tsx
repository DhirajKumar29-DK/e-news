'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { reporterAdminService, ReportersQuery } from '@/services/reporterAdminService';
import { ReporterUser } from '@/services/reporterAuthService';
import {
  Users, UserCheck, Clock, UserX, AlertOctagon, Search, Plus,
  Filter, CheckCircle, XCircle, AlertCircle, ExternalLink, ShieldCheck,
  MapPin, Phone, Mail, FileText, ChevronRight, RefreshCw, Trash2, Eye,
  Lock, X
} from 'lucide-react';
import { formatTimeAgo } from '@/utils/timeAgo';

function AdminReportersContent() {
  const { user } = useAdminAuth();

  // State
  const [reporters, setReporters] = useState<(ReporterUser & { _count?: { articles: number } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [kpi, setKpi] = useState({
    totalReporters: 0,
    pending: 0,
    approved: 0,
    suspended: 0,
    rejected: 0,
  });

  // Action Modals State
  const [selectedReporter, setSelectedReporter] = useState<ReporterUser | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<ReporterUser | null>(null);

  // Create Reporter Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    district: '',
    state: '',
    status: 'APPROVED' as 'APPROVED' | 'PENDING',
    idProofType: 'Press ID / Aadhaar',
    idProofNumber: '',
  });
  const [createError, setCreateError] = useState('');

  const fetchReporters = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const query: ReportersQuery = {
        page,
        limit,
        search: searchQuery.trim() || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      };
      const res = await reporterAdminService.getReporters(query);
      setReporters(res.reporters || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalCount(res.pagination?.total || 0);
      if (res.kpi) {
        setKpi(res.kpi);
      }
    } catch (err: any) {
      console.error('Failed to fetch reporters:', err);
      setFetchError(err.message || 'Failed to fetch reporters');
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, searchQuery]);

  useEffect(() => {
    fetchReporters();
  }, [fetchReporters]);

  // Handle Status Update (Approve / Suspend / Reactivate)
  const handleUpdateStatus = async (
    reporterId: string,
    newStatus: 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'PENDING',
    reason?: string
  ) => {
    setIsActionLoading(true);
    try {
      await reporterAdminService.updateReporterStatus(reporterId, newStatus, reason);
      setIsRejectModalOpen(false);
      setRejectReason('');
      setSelectedReporter(null);
      await fetchReporters();
    } catch (err: any) {
      alert(err.message || 'Failed to update reporter status');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Delete Reporter
  const handleDeleteReporter = async () => {
    if (!deleteTarget) return;
    setIsActionLoading(true);
    try {
      await reporterAdminService.deleteReporter(deleteTarget.id);
      setDeleteTarget(null);
      await fetchReporters();
    } catch (err: any) {
      alert(err.message || 'Failed to delete reporter');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Admin Direct Create Reporter
  const handleCreateReporterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setIsActionLoading(true);
    try {
      await reporterAdminService.createReporter(createForm);
      setIsCreateModalOpen(false);
      setCreateForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        city: '',
        district: '',
        state: '',
        status: 'APPROVED',
        idProofType: 'Press ID / Aadhaar',
        idProofNumber: '',
      });
      await fetchReporters();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create reporter');
    } finally {
      setIsActionLoading(false);
    }
  };

  const resolveProofUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    return `${base.replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>Active & Approved</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pending Verification</span>
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertOctagon className="w-3 h-3 text-rose-600" />
            <span>Suspended</span>
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
        <AdminHeader title="Reporter Accreditation & Management" />

        {/* Pinned Top Bar: Header, KPI Summary Cards & Search/Filter Toolbar */}
        <div className="shrink-0 bg-slate-50 border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 pt-4 pb-3 max-w-7xl w-full mx-auto space-y-3">
          
          {/* Top Actions & Title Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black font-serif text-slate-900 tracking-tight">
                Accredited Newsroom Reporters
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Verify identity documents (Aadhaar / Press ID), approve journalist credentials, and govern reporting permissions.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={fetchReporters}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-xs cursor-pointer"
                title="Refresh List"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-600' : ''}`} />
              </button>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Reporter Account</span>
              </button>
            </div>
          </div>

          {/* KPI Summary Cards */}
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
                <span className="text-[10px] font-black uppercase tracking-wider opacity-70">Total Reporters</span>
                <Users className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-xl sm:text-2xl font-black font-serif mt-1">{kpi.totalReporters}</div>
            </div>

            <div
              onClick={() => { setStatusFilter('PENDING'); setPage(1); }}
              className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer ${
                statusFilter === 'PENDING'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider opacity-70">Pending Review</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl sm:text-2xl font-black font-serif mt-1 flex items-center space-x-2">
                <span>{kpi.pending}</span>
                {kpi.pending > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold animate-pulse">
                    Action Needed
                  </span>
                )}
              </div>
            </div>

            <div
              onClick={() => { setStatusFilter('APPROVED'); setPage(1); }}
              className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer ${
                statusFilter === 'APPROVED'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider opacity-70">Active Reporters</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl sm:text-2xl font-black font-serif mt-1">{kpi.approved}</div>
            </div>

            <div
              onClick={() => { setStatusFilter('SUSPENDED'); setPage(1); }}
              className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer ${
                statusFilter === 'SUSPENDED'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider opacity-70">Suspended</span>
                <AlertOctagon className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-xl sm:text-2xl font-black font-serif mt-1">{kpi.suspended}</div>
            </div>
          </div>

          {/* Search & Status Tab Bar */}
          <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search reporters by name, email, phone, city, or district..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-0.5">
              {[
                { id: 'ALL', label: 'All Reporters', count: kpi.totalReporters },
                { id: 'PENDING', label: 'Pending Verification', count: kpi.pending },
                { id: 'APPROVED', label: 'Approved', count: kpi.approved },
                { id: 'SUSPENDED', label: 'Suspended', count: kpi.suspended },
                { id: 'REJECTED', label: 'Rejected', count: kpi.rejected },
              ].map((tab) => {
                const isActive = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setStatusFilter(tab.id);
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

          {/* Error Notice */}
          {fetchError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{fetchError}</span>
              </div>
              <button
                onClick={fetchReporters}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Main Table Area (Fixed card with internal scroll) */}
        <div className="flex-1 min-h-0 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 max-w-7xl w-full mx-auto flex flex-col">
          <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-500">Loading reporter records...</p>
              </div>
            ) : reporters.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-3">
                <Users className="w-10 h-10 text-slate-300 mx-auto" />
                <div className="text-sm font-bold text-slate-700">No reporters found</div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {searchQuery
                    ? 'No reporter records match your search criteria.'
                    : 'There are currently no reporters in this status view.'}
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider shadow-xs">
                    <tr>
                      <th className="py-3.5 px-4">Reporter</th>
                      <th className="py-3.5 px-4">Contact Info</th>
                      <th className="py-3.5 px-4">Reporting Area</th>
                      <th className="py-3.5 px-4">ID Proof (Aadhaar/Press)</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-center">Stories</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reporters.map((rep) => {
                      const isPending = rep.status === 'PENDING';
                      const isApproved = rep.status === 'APPROVED';
                      const isSuspended = rep.status === 'SUSPENDED';

                      return (
                        <tr key={rep.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Reporter Info */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                {rep.name?.charAt(0) || 'R'}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate">{rep.name}</div>
                                <div className="text-[10px] text-slate-400">
                                  Joined {formatTimeAgo(rep.createdAt).en}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Contact Info */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <div className="text-slate-700 flex items-center space-x-1">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span className="truncate max-w-[150px]">{rep.email}</span>
                              </div>
                              {rep.phone && (
                                <div className="text-slate-500 text-[11px] flex items-center space-x-1">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{rep.phone}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Reporting Area */}
                          <td className="py-3.5 px-4">
                            {rep.city || rep.district || rep.state ? (
                              <div className="flex items-center space-x-1 text-slate-700">
                                <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                                <span className="truncate max-w-[130px]">
                                  {[rep.city, rep.district, rep.state].filter(Boolean).join(', ')}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px] italic">Not specified</span>
                            )}
                          </td>

                          {/* ID Proof Document Preview */}
                          <td className="py-3.5 px-4">
                            {rep.idProofUrl ? (
                              <a
                                href={resolveProofUrl(rep.idProofUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold transition-colors group"
                                title="View Submitted Aadhaar / Press ID"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                                <span>{rep.idProofType || 'Aadhaar / ID'}</span>
                                <ExternalLink className="w-3 h-3 text-red-400 group-hover:text-red-700" />
                              </a>
                            ) : (
                              <span className="text-rose-500 font-bold text-[11px] flex items-center space-x-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>Missing ID</span>
                              </span>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4">
                            {getStatusBadge(rep.status)}
                          </td>

                          {/* Article Count */}
                          <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                            {rep._count?.articles ?? 0}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              
                              {/* View Details */}
                              <button
                                onClick={() => {
                                  setSelectedReporter(rep);
                                  setIsViewModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                                title="View Full Profile"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Pending Actions: Approve or Reject */}
                              {isPending && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(rep.id, 'APPROVED')}
                                    disabled={isActionLoading}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors shadow-xs"
                                    title="Approve Reporter"
                                  >
                                    Approve
                                  </button>

                                  <button
                                    onClick={() => {
                                      setSelectedReporter(rep);
                                      setIsRejectModalOpen(true);
                                    }}
                                    disabled={isActionLoading}
                                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition-colors shadow-xs"
                                    title="Reject Registration"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {/* Approved Actions: Suspend */}
                              {isApproved && (
                                <button
                                  onClick={() => handleUpdateStatus(rep.id, 'SUSPENDED')}
                                  disabled={isActionLoading}
                                  className="px-2 py-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] transition-colors"
                                  title="Suspend Reporter Access"
                                >
                                  Suspend
                                </button>
                              )}

                              {/* Suspended Actions: Reactivate */}
                              {isSuspended && (
                                <button
                                  onClick={() => handleUpdateStatus(rep.id, 'APPROVED')}
                                  disabled={isActionLoading}
                                  className="px-2 py-1 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] transition-colors"
                                  title="Reactivate Reporter"
                                >
                                  Reactivate
                                </button>
                              )}

                              {/* Delete Reporter Button */}
                              <button
                                onClick={() => setDeleteTarget(rep)}
                                disabled={isActionLoading}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete Reporter"
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

            {/* Pinned Bottom Pagination & Items Per Page Controls */}
            <div className="shrink-0 p-3.5 sm:px-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-600 bg-slate-50/80">
              <div className="flex items-center space-x-3">
                <span className="text-slate-600">
                  Page {page} of {Math.max(1, totalPages)} <span className="text-slate-400 font-normal">({totalCount} total reporters)</span>
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

      {/* DETAIL VIEW MODAL */}
      {isViewModalOpen && selectedReporter && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-bold text-slate-900">Reporter Credentials Review</h3>
              </div>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedReporter(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center font-serif font-black text-xl shrink-0">
                  {selectedReporter.name?.charAt(0) || 'R'}
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">{selectedReporter.name}</h4>
                  <p className="text-slate-500">{selectedReporter.email}</p>
                  <p className="text-slate-500">{selectedReporter.phone || 'No phone provided'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Status</span>
                  <div className="mt-1">{getStatusBadge(selectedReporter.status)}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Location</span>
                  <span className="font-bold text-slate-800 block mt-1">
                    {[selectedReporter.city, selectedReporter.district, selectedReporter.state].filter(Boolean).join(', ') || 'Not set'}
                  </span>
                </div>
              </div>

              {/* ID Proof Details */}
              <div className="p-4 rounded-2xl border border-red-100 bg-red-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-900">Identity / Accreditation Document</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                    {selectedReporter.idProofType || 'Aadhaar / Press ID'}
                  </span>
                </div>

                {selectedReporter.idProofNumber && (
                  <p className="text-slate-700 font-mono">
                    ID Number: <span className="font-bold">{selectedReporter.idProofNumber}</span>
                  </p>
                )}

                {selectedReporter.idProofUrl ? (
                  <div className="space-y-2 pt-1">
                    <a
                      href={resolveProofUrl(selectedReporter.idProofUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Document in Full Viewer</span>
                    </a>
                  </div>
                ) : (
                  <p className="text-rose-600 font-bold">No verification file uploaded.</p>
                )}
              </div>

              {/* Bio & Categories */}
              {selectedReporter.bio && (
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase mb-1">Journalist Bio</span>
                  <p className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 italic">
                    "{selectedReporter.bio}"
                  </p>
                </div>
              )}

              {selectedReporter.rejectionReason && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                  <span className="font-bold block mb-1">Past Rejection Note:</span>
                  <p>{selectedReporter.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Quick Actions in View Modal */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              {selectedReporter.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(selectedReporter.id, 'APPROVED')}
                    disabled={isActionLoading}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
                  >
                    Approve Accreditation
                  </button>
                  <button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      setIsRejectModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-xs"
                  >
                    Reject with Reason
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedReporter(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL WITH REASON */}
      {isRejectModalOpen && selectedReporter && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <XCircle className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Reject Reporter Registration</h3>
              <p className="text-xs text-slate-500">
                Provide a reason for rejecting <span className="font-bold text-slate-800">{selectedReporter.name}</span>. This explanation will be displayed to them upon attempting to log in.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Rejection Reason</label>
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Identity document unclear. Please submit a valid government-issued Aadhaar card or accredited Press ID."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-red-500 focus:bg-white resize-none"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectReason('');
                }}
                disabled={isActionLoading}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedReporter.id, 'REJECTED', rejectReason)}
                disabled={isActionLoading || !rejectReason.trim()}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold transition-colors shadow-xs"
              >
                {isActionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">Delete Reporter Account?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove <span className="font-bold text-slate-800">{deleteTarget.name}</span>?
              </p>
              <p className="text-[11px] text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 font-medium text-left">
                Safe Retention: All news articles previously published by this reporter will remain intact and will NOT be deleted.
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isActionLoading}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteReporter}
                disabled={isActionLoading}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                {isActionLoading ? 'Deleting...' : 'Yes, Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN CREATE REPORTER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-bold text-slate-900">Directly Create Reporter Account</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateReporterSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-red-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="reporter@vartiq.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-red-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Initial Password *</label>
                  <input
                    type="password"
                    required
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-red-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-red-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Initial Status</label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none"
                  >
                    <option value="APPROVED">Directly Approved (Active)</option>
                    <option value="PENDING">Pending Verification</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">City</label>
                  <input
                    type="text"
                    value={createForm.city}
                    onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
                    placeholder="City"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">District</label>
                  <input
                    type="text"
                    value={createForm.district}
                    onChange={(e) => setCreateForm({ ...createForm, district: e.target.value })}
                    placeholder="District"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">State</label>
                  <input
                    type="text"
                    value={createForm.state}
                    onChange={(e) => setCreateForm({ ...createForm, state: e.target.value })}
                    placeholder="State"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isActionLoading}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold transition-all shadow-md shadow-red-600/20"
                >
                  {isActionLoading ? 'Creating Reporter...' : 'Create Reporter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AdminReportersPage() {
  return (
    <AdminAuthProvider>
      <AdminReportersContent />
    </AdminAuthProvider>
  );
}

