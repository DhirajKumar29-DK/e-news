'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { adService, AdvertisementData, AdSlotType, AdFormatType } from '@/services/adService';
import { getFullMediaUrl } from '@/config/env';
import {
  Megaphone, Plus, Search, Filter, Trash2, Edit2, ExternalLink,
  Eye, MousePointerClick, Calendar, CheckCircle2, XCircle,
  Upload, X, Code, Image as ImageIcon, Sparkles, AlertCircle, RefreshCw,
  LayoutGrid, List, CheckCircle, Clock, ShieldCheck, MapPin, ChevronDown, Check
} from 'lucide-react';
import { formatTimeAgo } from '@/utils/timeAgo';

const SLOT_OPTIONS = [
  {
    category: 'Homepage Placements',
    icon: '🏠',
    slots: [
      { value: 'HOMEPAGE_TOP', label: 'Homepage Top Leaderboard', desc: 'Header ke theek neeche, full-width banner' },
      { value: 'LATEST_VIDEOS_TOP', label: 'Homepage Above Latest Videos', desc: 'Hero 2×2 box ke theek upar' },
      { value: 'HOMEPAGE_SECTION_1', label: 'Homepage After Section 1', desc: 'Pehle news section ke baad' },
      { value: 'HOMEPAGE_SECTION_2', label: 'Homepage After Section 2', desc: 'Dusre news section ke baad' },
      { value: 'HOMEPAGE_SECTION_3', label: 'Homepage After Section 3', desc: 'Teesre news section ke baad' },
      { value: 'HOMEPAGE_SECTION_4', label: 'Homepage After Section 4', desc: 'Chouthe news section ke baad' },
      { value: 'HOMEPAGE_SECTION_5', label: 'Homepage After Section 5', desc: 'Paanchve news section ke baad' },
      { value: 'HOMEPAGE_SECTION_6', label: 'Homepage After Section 6', desc: 'Chhathve news section ke baad' },
      { value: 'HOMEPAGE_SECTION_7', label: 'Homepage After Section 7', desc: 'Saatve news section ke baad' },
      { value: 'HOMEPAGE_SECTION_8', label: 'Homepage After Section 8', desc: 'Aathve news section ke baad' },
      { value: 'HOMEPAGE_SECTION_9', label: 'Homepage After Section 9', desc: 'Nauve news section ke baad' },
      { value: 'HOMEPAGE_SECTION_10', label: 'Homepage After Section 10', desc: 'Dasve news section ke baad' },
      { value: 'HOMEPAGE_BEFORE_VIDEOS', label: 'Homepage Above Videos Showcase', desc: 'Video player section ke theek upar' },
      { value: 'HOMEPAGE_BOTTOM', label: 'Homepage Above Footer', desc: 'Footer ke theek upar' },
    ]
  },
  {
    category: 'Article & Sidebar Placements',
    icon: '📰',
    slots: [
      { value: 'ARTICLE_INLINE', label: 'In-Article Inline Content', desc: 'Khabar ke beech mein / Paragraph 2 ke baad' },
      { value: 'ARTICLE_LATEST_VIDEOS', label: 'Article Sidebar - Above Latest Videos', desc: 'Latest videos ke theek upar' },
      { value: 'ARTICLE_SIDEBAR', label: 'Article Right Sidebar', desc: 'Sidebar ke bottom par' },
      { value: 'ARTICLE_BOTTOM', label: 'Article Above Footer', desc: 'Khabar page footer ke theek upar' },
    ]
  }
];

function AdStudioContent() {
  const { user, isLoading: authLoading } = useAdminAuth();

  const [ads, setAds] = useState<AdvertisementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string>('ALL');

  // Pagination State (Matching Reporter & Article CMS)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<AdvertisementData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slot, setSlot] = useState<AdSlotType>('HOMEPAGE_TOP');
  const [type, setType] = useState<AdFormatType>('IMAGE');
  const [targetUrl, setTargetUrl] = useState('');
  const [scriptCode, setScriptCode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<AdvertisementData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Custom Slot Dropdown State
  const [isSlotDropdownOpen, setIsSlotDropdownOpen] = useState(false);
  const slotDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (slotDropdownRef.current && !slotDropdownRef.current.contains(event.target as Node)) {
        setIsSlotDropdownOpen(false);
      }
    }
    if (isSlotDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSlotDropdownOpen]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const res = await adService.getAllAds({ limit: 100 });
      setAds(res.ads || []);
    } catch (err) {
      console.error('Failed to load advertisements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const openCreateModal = () => {
    setEditingAd(null);
    setTitle('');
    setSlot('HOMEPAGE_TOP');
    setType('IMAGE');
    setTargetUrl('');
    setScriptCode('');
    setStartDate('');
    setEndDate('');
    setIsActive(true);
    setImageFile(null);
    setImagePreview('');
    setFormError(null);
    setIsSlotDropdownOpen(false);
    setIsModalOpen(true);
  };

  const openEditModal = (ad: AdvertisementData) => {
    setEditingAd(ad);
    setTitle(ad.title || '');
    setSlot(ad.slot || 'HOMEPAGE_TOP');
    setType(ad.type || 'IMAGE');
    setTargetUrl(ad.targetUrl || '');
    setScriptCode(ad.scriptCode || '');
    setStartDate(ad.startDate ? ad.startDate.slice(0, 10) : '');
    setEndDate(ad.endDate ? ad.endDate.slice(0, 10) : '');
    setIsActive(ad.isActive);
    setImageFile(null);
    setImagePreview(ad.imageUrl ? getFullMediaUrl(ad.imageUrl) : '');
    setFormError(null);
    setIsSlotDropdownOpen(false);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };

  const handleToggleActive = async (ad: AdvertisementData) => {
    try {
      const updated = await adService.updateAd(ad.id, { isActive: !ad.isActive });
      setAds(prev => prev.map(a => (a.id === ad.id ? updated : a)));
    } catch (err) {
      console.error('Failed to toggle ad status:', err);
    }
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Please enter a campaign / client title.');
      return;
    }

    if (type === 'IMAGE' && !imageFile && !imagePreview) {
      setFormError('Please upload an advertisement banner image.');
      return;
    }

    if (type === 'SCRIPT' && !scriptCode.trim()) {
      setFormError('Please paste your Google AdSense or ad script code.');
      return;
    }

    try {
      setIsSubmitting(true);
      let uploadedImageUrl = editingAd?.imageUrl || null;

      if (imageFile) {
        uploadedImageUrl = await adService.uploadBanner(imageFile);
      }

      const payload = {
        title: title.trim(),
        slot,
        type,
        imageUrl: type === 'IMAGE' ? uploadedImageUrl : null,
        targetUrl: type === 'IMAGE' ? (targetUrl.trim() || null) : null,
        scriptCode: type === 'SCRIPT' ? (scriptCode.trim() || null) : null,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        isActive
      };

      if (editingAd) {
        await adService.updateAd(editingAd.id, payload);
      } else {
        await adService.createAd(payload);
      }

      setIsModalOpen(false);
      await fetchAds();
    } catch (err: any) {
      console.error('Failed to save ad:', err);
      setFormError(err.message || 'Failed to save advertisement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAd = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await adService.deleteAd(deleteTarget.id);
      setAds(prev => prev.filter(a => a.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete ad:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter Ads
  const filteredAds = ads.filter(ad => {
    const matchesSearch =
      ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ad.targetUrl && ad.targetUrl.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSlot =
      selectedSlot === 'ALL' ||
      ad.slot === selectedSlot ||
      (selectedSlot === 'SECTIONS' && ad.slot.startsWith('HOMEPAGE_SECTION_')) ||
      (selectedSlot === 'VIDEOS' && (ad.slot === 'LATEST_VIDEOS_TOP' || ad.slot === 'ARTICLE_LATEST_VIDEOS' || ad.slot === 'HOMEPAGE_BEFORE_VIDEOS')) ||
      (selectedSlot === 'FOOTER' && (ad.slot === 'HOMEPAGE_BOTTOM' || ad.slot === 'ARTICLE_BOTTOM'));
    return matchesSearch && matchesSlot;
  });

  // Calculate Metrics
  const totalCampaigns = ads.length;
  const activeCampaigns = ads.filter(a => a.isActive).length;
  const totalViews = ads.reduce((sum, a) => sum + (a.viewsCount || 0), 0);
  const totalClicks = ads.reduce((sum, a) => sum + (a.clicksCount || 0), 0);
  const overallCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : '0.00';

  // Pagination Calculations (Matching Article CMS)
  const totalCount = filteredAds.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const paginatedAds = filteredAds.slice((page - 1) * limit, page * limit);

  // Auto reset page to 1 on filter or limit change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedSlot, limit]);

  const getSlotBadgeInfo = (s: string) => {
    switch (s) {
      case 'HOMEPAGE_TOP':
        return { label: 'Home Top', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'LATEST_VIDEOS_TOP':
        return { label: 'Hero Above Videos', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'HOMEPAGE_SECTION_1':
        return { label: 'After Section 1', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'HOMEPAGE_SECTION_2':
        return { label: 'After Section 2', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'HOMEPAGE_SECTION_3':
        return { label: 'After Section 3', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'HOMEPAGE_SECTION_4':
        return { label: 'After Section 4', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'HOMEPAGE_SECTION_5':
        return { label: 'After Section 5', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'HOMEPAGE_SECTION_6':
        return { label: 'After Section 6', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'HOMEPAGE_SECTION_7':
        return { label: 'After Section 7', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'HOMEPAGE_SECTION_8':
        return { label: 'After Section 8', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'HOMEPAGE_SECTION_9':
        return { label: 'After Section 9', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'HOMEPAGE_SECTION_10':
        return { label: 'After Section 10', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'HOMEPAGE_BEFORE_VIDEOS':
        return { label: 'Above Videos Section', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'HOMEPAGE_BOTTOM':
        return { label: 'Home Above Footer', color: 'bg-teal-50 text-teal-700 border-teal-200' };
      case 'ARTICLE_INLINE':
        return { label: 'In-Article', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'ARTICLE_SIDEBAR':
        return { label: 'Article Sidebar', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'ARTICLE_LATEST_VIDEOS':
        return { label: 'Article Above Videos', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'ARTICLE_BOTTOM':
        return { label: 'Article Above Footer', color: 'bg-teal-50 text-teal-700 border-teal-200' };
      default:
        return { label: s.replace(/_/g, ' '), color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <AdminHeader title="Newsroom Ad Studio" />

        {/* Top Control Section: Header Banner + KPI Cards + Search & Filter (Pinned / Non-scrollable) */}
        <div className="shrink-0 px-4 sm:px-6 lg:px-8 pt-4 pb-2 max-w-7xl w-full mx-auto space-y-3">
          
          {/* Header Action Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full mb-1">
                <Sparkles className="w-3.5 h-3.5 text-red-600" />
                <span>Monetization &amp; Campaigns Suite</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black font-serif text-slate-900">
                Campaigns &amp; Banner Manager ({totalCampaigns})
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Manage direct sponsor banners, Google AdSense placements, schedules, and real-time impression analytics.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={fetchAds}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                title="Refresh Campaigns"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={openCreateModal}
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Create Advertisement</span>
              </button>
            </div>
          </div>

          {/* Metric KPI Cards (Compact) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Campaigns</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-xl font-black text-slate-900">{totalCampaigns}</span>
                <span className="text-xs text-slate-400 font-semibold">all-time</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Active Live Ads</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-xl font-black text-emerald-600">{activeCampaigns}</span>
                <span className="text-xs text-emerald-500 font-semibold">running</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">Total Impressions</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-xl font-black text-blue-600">{totalViews.toLocaleString()}</span>
                <span className="text-xs text-blue-400 font-semibold">views</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-600">Ad Clicks (CTR)</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-xl font-black text-purple-600">{totalClicks.toLocaleString()}</span>
                <span className="text-xs text-purple-500 font-mono font-bold">({overallCtr}%)</span>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar + View Toggle */}
          <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-2.5 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search campaigns by client or destination URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
              />
            </div>

            {/* Slot Tabs */}
            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0 max-w-full">
              {[
                { id: 'ALL', label: 'All Slots' },
                { id: 'HOMEPAGE_TOP', label: 'Home Top' },
                { id: 'VIDEOS', label: 'Above Videos' },
                { id: 'SECTIONS', label: 'Between Sections' },
                { id: 'FOOTER', label: 'Above Footer' },
                { id: 'ARTICLE_INLINE', label: 'In-Article' },
                { id: 'ARTICLE_SIDEBAR', label: 'Sidebar' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedSlot(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-colors shrink-0 cursor-pointer ${
                    selectedSlot === tab.id
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area (Fixed card with internal scroll + pinned bottom pagination matching Image 1) */}
        <div className="flex-1 min-h-0 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 max-w-7xl w-full mx-auto flex flex-col">
          <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
            
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-2">
                <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold">Loading campaigns...</p>
              </div>
            ) : filteredAds.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Megaphone className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No campaigns found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchQuery || selectedSlot !== 'ALL'
                    ? 'No advertisements match your current search and filter criteria.'
                    : 'You have not created any advertisement campaigns yet. Click below to add your first banner or AdSense slot.'}
                </p>
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Create New Campaign</span>
                </button>
              </div>
            ) : (
              /* EXACT IMAGE 1 ROW LIST VIEW */
              <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider shadow-xs">
                    <tr>
                      <th className="py-3.5 px-4">Ad Campaign</th>
                      <th className="py-3.5 px-4">Destination &amp; Schedule</th>
                      <th className="py-3.5 px-4">Placement Slot</th>
                      <th className="py-3.5 px-4">Format Type</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-center">Impressions</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedAds.map((ad) => {
                      const ctr = ad.viewsCount > 0 ? ((ad.clicksCount / ad.viewsCount) * 100).toFixed(2) : '0.00';
                      const isDirect = ad.type === 'IMAGE';
                      const bannerUrl = ad.imageUrl ? getFullMediaUrl(ad.imageUrl) : '';
                      const now = new Date();
                      const isExpired = ad.endDate ? new Date(ad.endDate) < now : false;
                      const badge = getSlotBadgeInfo(ad.slot);

                      return (
                        <tr key={ad.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* 1. Ad Campaign & Avatar/Thumbnail (Exact Image 1 Reporter Column) */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs overflow-hidden border border-slate-200">
                                {isDirect && bannerUrl ? (
                                  <img
                                    src={bannerUrl}
                                    alt={ad.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span>{ad.title?.charAt(0)?.toUpperCase() || 'A'}</span>
                                )}
                              </div>
                              <div className="min-w-0 max-w-[210px]">
                                <div className="font-bold text-slate-900 truncate text-xs hover:text-red-600 transition-colors" title={ad.title}>
                                  {ad.title}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  Created {ad.createdAt ? formatTimeAgo(ad.createdAt).en : 'Recently'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Destination & Schedule (Exact Image 1 Contact Info Column) */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <div className="text-slate-700 flex items-center space-x-1">
                                <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                                {ad.targetUrl ? (
                                  <a
                                    href={ad.targetUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="truncate max-w-[170px] text-blue-600 hover:underline font-medium text-[11px]"
                                    title={ad.targetUrl}
                                  >
                                    {ad.targetUrl}
                                  </a>
                                ) : (
                                  <span className="text-[11px] text-slate-400 italic">Script / AdSense</span>
                                )}
                              </div>
                              <div className="text-slate-500 text-[10px] flex items-center space-x-1">
                                <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>
                                  {ad.startDate ? new Date(ad.startDate).toLocaleDateString() : 'Immediate'}
                                  {' → '}
                                  {ad.endDate ? new Date(ad.endDate).toLocaleDateString() : 'Ongoing'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* 3. Placement Slot with Red MapPin (Exact Image 1 Reporting Area Column) */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-1 text-slate-700">
                              <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                              <span className="truncate max-w-[140px] font-medium text-slate-800 text-xs">
                                {badge.label}
                              </span>
                            </div>
                          </td>

                          {/* 4. Format Type Badge (Exact Image 1 AADHAAR Pill Column) */}
                          <td className="py-3.5 px-4">
                            {isDirect ? (
                              <a
                                href={bannerUrl || '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold transition-colors group cursor-pointer"
                                title="View Banner Creative"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                                <span>BANNER</span>
                                <ExternalLink className="w-3 h-3 text-red-400 group-hover:text-red-700" />
                              </a>
                            ) : (
                              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-bold">
                                <Code className="w-3.5 h-3.5 text-purple-600" />
                                <span>ADSENSE</span>
                              </span>
                            )}
                          </td>

                          {/* 5. Status Badge (Exact Image 1 Active & Approved Pill Column) */}
                          <td className="py-3.5 px-4">
                            {isExpired ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Expired</span>
                              </span>
                            ) : ad.isActive ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                <span>Active &amp; Approved</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>Paused</span>
                              </span>
                            )}
                          </td>

                          {/* 6. Impressions Count (Exact Image 1 Story Count Column) */}
                          <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                            <div className="text-slate-900 text-xs font-bold">
                              {ad.viewsCount.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {ad.clicksCount} clicks ({ctr}%)
                            </div>
                          </td>

                          {/* 7. Actions (Exact Image 1 Actions Column: Eye, Suspend, Edit, Trash) */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* View / Preview Eye Button */}
                              {bannerUrl || ad.targetUrl ? (
                                <a
                                  href={bannerUrl || ad.targetUrl || '#'}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                                  title="View Creative"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </a>
                              ) : (
                                <button
                                  onClick={() => openEditModal(ad)}
                                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Suspend / Reactivate Amber Button (Exact Image 1 Suspend Style) */}
                              <button
                                onClick={() => handleToggleActive(ad)}
                                className={`px-2 py-1 rounded-lg border text-[11px] font-bold transition-colors cursor-pointer ${
                                  ad.isActive
                                    ? 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800'
                                    : 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                                }`}
                                title={ad.isActive ? 'Suspend / Pause Ad' : 'Activate Ad'}
                              >
                                {ad.isActive ? 'Suspend' : 'Activate'}
                              </button>

                              {/* Edit Modal Button */}
                              <button
                                onClick={() => openEditModal(ad)}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                                title="Edit Campaign"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Trash Button */}
                              <button
                                onClick={() => setDeleteTarget(ad)}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Delete Campaign"
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

            {/* Pinned Bottom Pagination & Items Per Page Controls (Exact Article CMS Style) */}
            <div className="shrink-0 p-3.5 sm:px-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-600 bg-slate-50/80">
              <div className="flex items-center space-x-3">
                <span className="text-slate-600">
                  Page {page} of {Math.max(1, totalPages)} <span className="text-slate-400 font-normal">({totalCount} total)</span>
                </span>

                {/* 10, 20, 50, 100 Items Per Page Dropdown */}
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
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={100}>100 / page</option>
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

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div
          onClick={() => {
            setIsModalOpen(false);
            setIsSlotDropdownOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-red-50 text-red-600 rounded-2xl border border-red-100">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">
                    {editingAd ? 'Edit Campaign' : 'Create New Advertisement'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">Configure direct sponsor banner or Google AdSense script</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsSlotDropdownOpen(false);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveAd} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {formError && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span className="font-semibold">{formError}</span>
                </div>
              )}

              {/* Title / Client */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
                  Campaign / Client Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Coaching 20% Admission Offer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                />
              </div>

              {/* Slot Position (Custom Contained Dropdown) */}
              <div className="space-y-1.5 relative" ref={slotDropdownRef}>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
                  Target Website Placement (Slot) *
                </label>

                {(() => {
                  const currentSlotInfo = SLOT_OPTIONS.flatMap(g => g.slots).find(s => s.value === slot) || {
                    label: slot.replace(/_/g, ' '),
                    desc: 'Custom Slot Placement'
                  };

                  return (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsSlotDropdownOpen(!isSlotDropdownOpen)}
                        className={`w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 focus:bg-white border rounded-xl text-left flex items-center justify-between text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all cursor-pointer ${
                          isSlotDropdownOpen ? 'border-red-500 bg-white ring-2 ring-red-500/10' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <span className="p-1 rounded-md bg-white border border-slate-200 text-xs shrink-0 shadow-2xs">
                            {slot.startsWith('HOMEPAGE') || slot === 'LATEST_VIDEOS_TOP' ? '🏠' : '📰'}
                          </span>
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-slate-900 block truncate">
                              {currentSlotInfo.label}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {currentSlotInfo.desc}
                            </span>
                          </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isSlotDropdownOpen ? 'rotate-180 text-red-600' : ''}`} />
                      </button>

                      {/* Custom Floating Dropdown Menu (Contained & Styled) */}
                      {isSlotDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-56 animate-in fade-in slide-in-from-top-1 duration-150">
                          <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between text-[11px] font-bold text-slate-500 shrink-0">
                            <span>Select Website Placement</span>
                            <span className="text-[10px] text-slate-400 font-normal">18 positions</span>
                          </div>

                          <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
                            {SLOT_OPTIONS.map((group) => (
                              <div key={group.category} className="p-1.5">
                                <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                                  <span>{group.icon}</span>
                                  <span>{group.category}</span>
                                </div>

                                <div className="space-y-0.5 mt-0.5">
                                  {group.slots.map((s) => {
                                    const isSelected = slot === s.value;
                                    return (
                                      <button
                                        key={s.value}
                                        type="button"
                                        onClick={() => {
                                          setSlot(s.value as AdSlotType);
                                          setIsSlotDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                                          isSelected
                                            ? 'bg-red-50 text-red-900 font-bold border border-red-200 shadow-2xs'
                                            : 'hover:bg-slate-50 text-slate-700'
                                        }`}
                                      >
                                        <div className="min-w-0 pr-2">
                                          <div className="font-semibold text-xs truncate">{s.label}</div>
                                          <div className="text-[10px] text-slate-400 truncate">{s.desc}</div>
                                        </div>
                                        {isSelected && (
                                          <Check className="w-4 h-4 text-red-600 shrink-0" />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Ad Format Selector */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
                  Advertisement Format *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setType('IMAGE')}
                    className={`p-3.5 rounded-2xl border flex items-center space-x-3 text-left transition-all cursor-pointer ${
                      type === 'IMAGE'
                        ? 'border-red-600 bg-red-50/80 text-red-900 shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <ImageIcon className="w-5 h-5 text-red-600 shrink-0" />
                    <div>
                      <span className="font-bold block text-xs">Direct Banner</span>
                      <span className="text-[10px] text-slate-500 block font-normal">Custom image &amp; link</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('SCRIPT')}
                    className={`p-3.5 rounded-2xl border flex items-center space-x-3 text-left transition-all cursor-pointer ${
                      type === 'SCRIPT'
                        ? 'border-red-600 bg-red-50/80 text-red-900 shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Code className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <span className="font-bold block text-xs">Google AdSense</span>
                      <span className="text-[10px] text-slate-500 block font-normal">Script / ad network code</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Direct Image Fields */}
              {type === 'IMAGE' && (
                <div className="space-y-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="space-y-2">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
                      Upload Banner Poster / Image *
                    </label>

                    {imagePreview && (
                      <div className="relative aspect-[16/7] w-full rounded-2xl bg-white border border-slate-200 overflow-hidden mb-2 shadow-2xs">
                        <img
                          src={imagePreview}
                          alt="Banner Preview"
                          className="w-full h-full object-contain p-2"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview('');
                          }}
                          className="absolute top-2.5 right-2.5 p-1 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-sm"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-red-600 file:text-white hover:file:bg-red-700 file:cursor-pointer cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400">
                      JPG, PNG, WebP or GIF. Standard recommended resolution: 728x90 (Leaderboard) or 300x250 (Square/Sidebar).
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
                      Target Click Destination (URL / WhatsApp link)
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/admission or https://wa.me/91..."
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Script / AdSense Fields */}
              {type === 'SCRIPT' && (
                <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
                    Google AdSense Code / Script Tag *
                  </label>
                  <textarea
                    rows={4}
                    placeholder={'<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-..." data-ad-slot="..."></ins>'}
                    value={scriptCode}
                    onChange={(e) => setScriptCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <p className="text-[10px] text-slate-400">
                    Paste the entire code provided by Google AdSense or your ad exchange.
                  </p>
                </div>
              )}

              {/* Campaign Schedule Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
                    Expiry / End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 block">Active Campaign</span>
                  <span className="text-[10px] text-slate-500 block">Toggle to enable or temporarily pause this advertisement</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsSlotDropdownOpen(false);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold transition-colors cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold transition-all shadow-md shadow-red-600/20 flex items-center space-x-2 cursor-pointer disabled:opacity-50 text-xs"
                >
                  {isSubmitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{editingAd ? 'Save Changes' : 'Create Campaign'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div
          onClick={() => setDeleteTarget(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl text-center"
          >
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Campaign?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently delete &quot;{deleteTarget.title}&quot;? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2.5 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAd}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-600/20 cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
              >
                {isDeleting && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminAdsPage() {
  return (
    <AdminAuthProvider>
      <AdStudioContent />
    </AdminAuthProvider>
  );
}
