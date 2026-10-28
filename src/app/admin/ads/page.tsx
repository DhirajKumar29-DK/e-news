'use client';

import React, { useState, useEffect } from 'react';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { adService, AdvertisementData, AdSlotType, AdFormatType } from '@/services/adService';
import { getFullMediaUrl } from '@/config/env';
import {
  Megaphone, Plus, Search, Filter, Trash2, Edit2, ExternalLink,
  Eye, MousePointerClick, Calendar, CheckCircle2, XCircle,
  Upload, X, Code, Image as ImageIcon, Sparkles, AlertCircle, RefreshCw
} from 'lucide-react';

function AdStudioContent() {
  const { user, isLoading: authLoading } = useAdminAuth();

  const [ads, setAds] = useState<AdvertisementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string>('ALL');

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

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader title="Newsroom Ad Studio" />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Header Action Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full mb-1">
                <Sparkles className="w-3.5 h-3.5 text-red-600" />
                <span>Monetization &amp; Campaigns Suite</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black font-serif text-slate-900">
                Campaigns &amp; Banner Manager ({totalCampaigns})
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
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
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Create Advertisement</span>
              </button>
            </div>
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Campaigns</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-slate-900">{totalCampaigns}</span>
                <span className="text-xs text-slate-400 font-semibold">all-time</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Active Live Ads</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-emerald-600">{activeCampaigns}</span>
                <span className="text-xs text-emerald-500 font-semibold">running</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">Total Impressions</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-blue-600">{totalViews.toLocaleString()}</span>
                <span className="text-xs text-blue-400 font-semibold">views</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-600">Ad Clicks (CTR)</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-purple-600">{totalClicks.toLocaleString()}</span>
                <span className="text-xs text-purple-500 font-mono font-bold">({overallCtr}%)</span>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
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
            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0">
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

          {/* Campaigns Grid / Cards */}
          {loading ? (
            <div className="p-12 text-center text-slate-500 space-y-2 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold">Loading campaigns...</p>
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-dashed border-slate-300 space-y-3">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAds.map((ad) => {
                const ctr = ad.viewsCount > 0 ? ((ad.clicksCount / ad.viewsCount) * 100).toFixed(2) : '0.00';
                const isDirect = ad.type === 'IMAGE';
                const bannerUrl = ad.imageUrl ? getFullMediaUrl(ad.imageUrl) : '';

                // Date logic
                const now = new Date();
                const isExpired = ad.endDate ? new Date(ad.endDate) < now : false;

                return (
                  <div
                    key={ad.id}
                    className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                      ad.isActive && !isExpired
                        ? 'border-slate-200 hover:border-slate-300'
                        : 'border-slate-200/80 opacity-70 bg-slate-50/50'
                    }`}
                  >
                    {/* Top Preview Banner */}
                    <div className="aspect-[16/8] bg-slate-50 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                      {isDirect && bannerUrl ? (
                        <img
                          src={bannerUrl}
                          alt={ad.title}
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <div className="text-center p-4 space-y-1 text-slate-500 font-mono text-[11px]">
                          <Code className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                          <span className="font-bold text-slate-700">Script / AdSense Code</span>
                          <p className="text-[10px] truncate max-w-[240px] text-slate-400">
                            {ad.scriptCode?.slice(0, 45) || 'Custom Script'}
                          </p>
                        </div>
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5">
                        {(() => {
                          const badge = getSlotBadgeInfo(ad.slot);
                          return (
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${badge.color}`}>
                              {badge.label}
                            </span>
                          );
                        })()}
                      </div>

                      <div className="absolute top-2.5 right-2.5">
                        {isExpired ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Expired
                          </span>
                        ) : ad.isActive ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Live</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            Paused
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1" title={ad.title}>
                          {ad.title}
                        </h4>

                        {ad.targetUrl ? (
                          <a
                            href={ad.targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 hover:underline truncate max-w-full font-medium"
                          >
                            <span className="truncate">{ad.targetUrl}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        ) : (
                          <p className="text-xs text-slate-400 italic">No external click destination</p>
                        )}

                        {/* Dates info */}
                        <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 pt-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {ad.startDate ? new Date(ad.startDate).toLocaleDateString() : 'Immediate'}
                            {' → '}
                            {ad.endDate ? new Date(ad.endDate).toLocaleDateString() : 'No expiry'}
                          </span>
                        </div>
                      </div>

                      {/* Performance Counters */}
                      <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-400 uppercase font-black block">Views</span>
                          <span className="font-bold text-slate-800">{ad.viewsCount}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-400 uppercase font-black block">Clicks</span>
                          <span className="font-bold text-slate-800">{ad.clicksCount}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-400 uppercase font-black block">CTR</span>
                          <span className="font-bold text-purple-600">{ctr}%</span>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => handleToggleActive(ad)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5 ${
                            ad.isActive
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          {ad.isActive ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                          <span>{ad.isActive ? 'Active' : 'Paused'}</span>
                        </button>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => openEditModal(ad)}
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit Campaign"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(ad)}
                            className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Campaign"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
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
                onClick={() => setIsModalOpen(false)}
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

              {/* Slot Position */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
                  Target Website Placement (Slot) *
                </label>
                <select
                  value={slot}
                  onChange={(e) => setSlot(e.target.value as AdSlotType)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all cursor-pointer text-xs sm:text-sm"
                >
                  <optgroup label="🏠 Homepage Placements">
                    <option value="HOMEPAGE_TOP">Homepage Top Leaderboard (Header ke theek neeche)</option>
                    <option value="LATEST_VIDEOS_TOP">Homepage Above Latest Videos (Hero 2x2 box ke theek upar)</option>
                    <option value="HOMEPAGE_SECTION_1">Homepage After Section 1 (Pehle news section ke baad)</option>
                    <option value="HOMEPAGE_SECTION_2">Homepage After Section 2 (Dusre news section ke baad)</option>
                    <option value="HOMEPAGE_SECTION_3">Homepage After Section 3 (Teesre news section ke baad)</option>
                    <option value="HOMEPAGE_SECTION_4">Homepage After Section 4 (Chouthe news section ke baad)</option>
                    <option value="HOMEPAGE_SECTION_5">Homepage After Section 5 (Paanchve news section ke baad)</option>
                    <option value="HOMEPAGE_SECTION_6">Homepage After Section 6 (Chhathve news section ke baad)</option>
                    <option value="HOMEPAGE_SECTION_7">Homepage After Section 7 (Saatve news section ke baad)</option>
                    <option value="HOMEPAGE_SECTION_8">Homepage After Section 8 (Aathve news section ke baad)</option>
                    <option value="HOMEPAGE_SECTION_9">Homepage After Section 9 (Nauve news section ke baad)</option>
                    <option value="HOMEPAGE_SECTION_10">Homepage After Section 10 (Dasve news section ke baad)</option>
                    <option value="HOMEPAGE_BEFORE_VIDEOS">Homepage Above Videos Showcase (Video player section ke upar)</option>
                    <option value="HOMEPAGE_BOTTOM">Homepage Above Footer (Footer ke theek upar)</option>
                  </optgroup>
                  <optgroup label="📰 Article &amp; Sidebar Placements">
                    <option value="ARTICLE_INLINE">In-Article Content (Khabar ke beech mein / Paragraph 2 ke baad)</option>
                    <option value="ARTICLE_LATEST_VIDEOS">Article Sidebar - Above Latest Videos (Latest videos ke theek upar)</option>
                    <option value="ARTICLE_SIDEBAR">Article Right Sidebar (Sidebar ke bottom par)</option>
                    <option value="ARTICLE_BOTTOM">Article Above Footer (Khabar page footer ke theek upar)</option>
                  </optgroup>
                </select>
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
                  onClick={() => setIsModalOpen(false)}
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
