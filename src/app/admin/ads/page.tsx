'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import {
  adService,
  AdvertisementData,
  AdSlotType,
  AdFormatType,
  AdActionType
} from '@/services/adService';
import { getFullMediaUrl } from '@/config/env';
import {
  Megaphone, Plus, Search, Filter, Trash2, Edit2, ExternalLink,
  Eye, MousePointerClick, Calendar, CheckCircle2, XCircle,
  Upload, X, Code, Image as ImageIcon, Sparkles, AlertCircle, RefreshCw,
  LayoutGrid, List, CheckCircle, Clock, ShieldCheck, MapPin, ChevronDown, Check,
  Phone, Mail, MessageCircle, Copy, IndianRupee, Play, ShoppingBag, Globe,
  ArrowRight, PhoneCall, FileText
} from 'lucide-react';
import { formatTimeAgo } from '@/utils/timeAgo';
import { categoryService, CategoryData } from '@/services/categoryService';

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

  // Top Tabs: 'CAMPAIGNS' (Admin custom campaigns) vs 'ORDERS' (User self-serve ads & payments)
  const [activeMainTab, setActiveMainTab] = useState<'CAMPAIGNS' | 'ORDERS'>('CAMPAIGNS');

  // ================= CAMPAIGNS STATE =================
  const [ads, setAds] = useState<AdvertisementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string>('ALL');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<AdvertisementData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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

  const [deleteTarget, setDeleteTarget] = useState<AdvertisementData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isSlotDropdownOpen, setIsSlotDropdownOpen] = useState(false);
  const slotDropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic categories from database to power exact section dropdowns
  const [categories, setCategories] = useState<CategoryData[]>(() => categoryService.getCachedCategories());

  useEffect(() => {
    categoryService.getCategories(true).then((cats) => {
      if (cats && cats.length > 0) setCategories(cats);
    }).catch(() => {});
  }, []);

  const dynamicHomeCategories = React.useMemo(() => {
    return categories
      .filter(c =>
        c.isActive &&
        c.showOnHome !== false &&
        c.slug !== 'all' &&
        c.slug !== 'latest' &&
        c.slug !== 'videos' &&
        c.slug !== 'video'
      )
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  }, [categories]);

  // Construct dynamic SLOT_OPTIONS based on live categories
  const slotOptions = React.useMemo(() => {
    const sectionSlots = dynamicHomeCategories.map((cat, idx) => ({
      value: `HOMEPAGE_SECTION_${idx + 1}` as AdSlotType,
      label: `Homepage After Section ${idx + 1} (${cat.name})`,
      desc: `'${cat.name}' न्यूज़ सेक्शन के ठीक नीचे विज्ञापन बैनर`
    }));

    return [
      {
        category: 'Homepage Placements (मुख्य पृष्ठ)',
        icon: '🏠',
        slots: [
          { value: 'HOMEPAGE_TOP' as AdSlotType, label: 'Homepage Top Leaderboard', desc: 'Header ke theek neeche, full-width banner' },
          { value: 'LATEST_VIDEOS_TOP' as AdSlotType, label: 'Homepage Above Latest Videos', desc: 'Hero 2×2 box ke theek upar' },
          ...(sectionSlots.length > 0 ? sectionSlots : [
            { value: 'HOMEPAGE_SECTION_1' as AdSlotType, label: 'Homepage After Section 1', desc: 'Pehle news section ke baad' },
            { value: 'HOMEPAGE_SECTION_2' as AdSlotType, label: 'Homepage After Section 2', desc: 'Dusre news section ke baad' },
            { value: 'HOMEPAGE_SECTION_3' as AdSlotType, label: 'Homepage After Section 3', desc: 'Teesre news section ke baad' },
            { value: 'HOMEPAGE_SECTION_4' as AdSlotType, label: 'Homepage After Section 4', desc: 'Chouthe news section ke baad' },
            { value: 'HOMEPAGE_SECTION_5' as AdSlotType, label: 'Homepage After Section 5', desc: 'Paanchve news section ke baad' },
          ]),
          { value: 'HOMEPAGE_BEFORE_VIDEOS' as AdSlotType, label: 'Homepage Above Videos Showcase', desc: 'Video player section ke theek upar' },
          { value: 'HOMEPAGE_BOTTOM' as AdSlotType, label: 'Homepage Above Footer', desc: 'Footer ke theek upar' },
        ]
      },
      {
        category: 'Article & Sidebar Placements (समाचार पृष्ठ)',
        icon: '📰',
        slots: [
          { value: 'ARTICLE_INLINE' as AdSlotType, label: 'In-Article Inline Content', desc: 'Khabar ke beech mein / Paragraph 2 ke baad' },
          { value: 'ARTICLE_LATEST_VIDEOS' as AdSlotType, label: 'Article Sidebar - Above Latest Videos', desc: 'Latest videos ke theek upar' },
          { value: 'ARTICLE_SIDEBAR' as AdSlotType, label: 'Article Right Sidebar', desc: 'Sidebar ke bottom par' },
          { value: 'ARTICLE_BOTTOM' as AdSlotType, label: 'Article Above Footer', desc: 'Khabar page footer ke theek upar' },
        ]
      }
    ];
  }, [dynamicHomeCategories]);

  // ================= SELF-SERVE ORDERS STATE =================
  const [orders, setOrders] = useState<AdvertisementData[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersSearch, setOrdersSearch] = useState('');
  const [ordersStatusFilter, setOrdersStatusFilter] = useState<string>('ALL');
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersLimit, setOrdersLimit] = useState(10);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);

  // Order Details Modal & Actions
  const [selectedOrder, setSelectedOrder] = useState<AdvertisementData | null>(null);
  const [rejectOrderTarget, setRejectOrderTarget] = useState<AdvertisementData | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [copiedUtrId, setCopiedUtrId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Fetch admin campaigns
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

  // Fetch self-serve orders
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await adService.getSelfServeOrders({
        page: ordersPage,
        limit: ordersLimit,
        status: ordersStatusFilter === 'ALL' ? undefined : ordersStatusFilter,
        search: ordersSearch.trim() || undefined
      });
      setOrders(res.orders || []);
      setOrdersTotal(res.pagination.total || 0);
      setOrdersTotalPages(res.pagination.totalPages || 1);
    } catch (err) {
      console.error('Failed to load self-serve orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Check count of pending orders for notification badge
  const checkPendingCount = async () => {
    try {
      const res = await adService.getSelfServeOrders({ status: 'PENDING_VERIFICATION', limit: 1 });
      setPendingOrdersCount(res.pagination.total || 0);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchAds();
    checkPendingCount();
  }, []);

  useEffect(() => {
    if (activeMainTab === 'ORDERS') {
      fetchOrders();
    }
  }, [activeMainTab, ordersPage, ordersLimit, ordersStatusFilter, ordersSearch]);

  // Handle outside click for slot dropdown
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

  // Copy UTR helper
  const handleCopyUtr = (utr: string, id: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtrId(id);
    setTimeout(() => setCopiedUtrId(null), 2000);
  };

  // Verify and publish self-serve order
  const handleVerifyAndPublish = async (order: AdvertisementData) => {
    try {
      setVerifyingId(order.id);
      await adService.verifyAndPublishAd(order.id);
      setToastMessage({
        text: `विज्ञापन "${order.title}" सफलतापूर्वक सत्यापित और लाइव कर दिया गया है! आवेदक (${order.advertiserEmail || 'Advertiser'}) को ईमेल भेज दिया गया है।`,
        type: 'success'
      });
      setTimeout(() => setToastMessage(null), 6000);
      await fetchOrders();
      await fetchAds();
      await checkPendingCount();
      if (selectedOrder?.id === order.id) {
        setSelectedOrder(prev => prev ? { ...prev, approvalStatus: 'APPROVED', isActive: true } : null);
      }
    } catch (err: any) {
      setToastMessage({ text: err.message || 'सत्यापित करने में विफल', type: 'error' });
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setVerifyingId(null);
    }
  };

  // Reject self-serve order
  const handleRejectOrder = async () => {
    if (!rejectOrderTarget) return;
    try {
      setIsRejecting(true);
      await adService.rejectAd(rejectOrderTarget.id, rejectionReason.trim());
      setToastMessage({
        text: `विज्ञापन अस्वीकार (Reject) कर दिया गया और आवेदक को ईमेल भेज दिया गया।`,
        type: 'success'
      });
      setTimeout(() => setToastMessage(null), 6000);
      setRejectOrderTarget(null);
      setRejectionReason('');
      await fetchOrders();
      await checkPendingCount();
      if (selectedOrder?.id === rejectOrderTarget.id) {
        setSelectedOrder(null);
      }
    } catch (err: any) {
      setToastMessage({ text: err.message || 'रिजेक्ट करने में विफल', type: 'error' });
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsRejecting(false);
    }
  };

  // Admin Campaigns Modal functions
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

  // Order Metrics
  const approvedOrders = orders.filter(o => o.approvalStatus === 'APPROVED');
  const totalRevenue = approvedOrders.length * 599;

  // Pagination for campaigns
  const totalCount = filteredAds.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const paginatedAds = filteredAds.slice((page - 1) * limit, page * limit);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedSlot, limit]);

  const getSlotBadgeInfo = (s: string) => {
    if (s.startsWith('HOMEPAGE_SECTION_')) {
      const secNum = parseInt(s.replace('HOMEPAGE_SECTION_', ''), 10);
      const cat = dynamicHomeCategories[secNum - 1];
      return {
        label: cat ? `After Sec ${secNum} (${cat.name})` : `After Section ${secNum}`,
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
      };
    }
    switch (s) {
      case 'HOMEPAGE_TOP':
        return { label: 'Home Top (Leaderboard)', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'LATEST_VIDEOS_TOP':
        return { label: 'Hero Above Videos', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'HOMEPAGE_BEFORE_VIDEOS':
        return { label: 'Above Videos Section', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'HOMEPAGE_BOTTOM':
        return { label: 'Home Above Footer', color: 'bg-teal-50 text-teal-700 border-teal-200' };
      case 'ARTICLE_INLINE':
        return { label: 'In-Article Inline', color: 'bg-blue-50 text-blue-700 border-blue-200' };
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

        {/* Global Toast Alert */}
        {toastMessage && (
          <div className="px-4 sm:px-6 lg:px-8 pt-2">
            <div
              className={`p-3.5 rounded-2xl flex items-center justify-between shadow-lg text-xs font-semibold animate-in fade-in duration-200 ${
                toastMessage.type === 'success'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-600 text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                {toastMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{toastMessage.text}</span>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Top Control Section: Header Banner + Main Navigation Tabs + KPI Cards */}
        <div className="shrink-0 px-4 sm:px-6 lg:px-8 pt-3 pb-2 max-w-7xl w-full mx-auto space-y-3">
          
          {/* Header Action Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full mb-1">
                <Sparkles className="w-3.5 h-3.5 text-red-600" />
                <span>Monetization &amp; Self-Serve Ad Portal Suite</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black font-serif text-slate-900">
                {activeMainTab === 'CAMPAIGNS'
                  ? `Direct Campaigns & Placements (${totalCampaigns})`
                  : `Self-Serve Orders & Payments (${ordersTotal})`}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {activeMainTab === 'CAMPAIGNS'
                  ? 'Manage direct sponsor banners, Google AdSense placements, schedules, and real-time impression analytics.'
                  : 'Verify customer payments (UTR), review ad creatives, and approve ads live with automatic email notifications.'}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  if (activeMainTab === 'CAMPAIGNS') fetchAds();
                  else {
                    fetchOrders();
                    checkPendingCount();
                  }
                }}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                title="Refresh List"
              >
                <RefreshCw className={`w-4 h-4 ${(loading || ordersLoading) ? 'animate-spin' : ''}`} />
              </button>

              {activeMainTab === 'CAMPAIGNS' && (
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Create Advertisement</span>
                </button>
              )}

              {activeMainTab === 'ORDERS' && (
                <a
                  href="/advertise"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Public Ad Page</span>
                </a>
              )}
            </div>
          </div>

          {/* MAIN TABS SWITCHER */}
          <div className="flex items-center space-x-2 bg-slate-200/70 p-1 rounded-2xl w-fit">
            <button
              onClick={() => setActiveMainTab('CAMPAIGNS')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMainTab === 'CAMPAIGNS'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Direct Campaigns &amp; Banners</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700">
                {totalCampaigns}
              </span>
            </button>

            <button
              onClick={() => setActiveMainTab('ORDERS')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMainTab === 'ORDERS'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <IndianRupee className="w-3.5 h-3.5" />
              <span>Self-Serve Orders &amp; Payments</span>
              {pendingOrdersCount > 0 ? (
                <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse">
                  {pendingOrdersCount} Pending
                </span>
              ) : (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700">
                  {ordersTotal}
                </span>
              )}
            </button>
          </div>

          {/* TAB 1: CAMPAIGNS METRICS & FILTERS */}
          {activeMainTab === 'CAMPAIGNS' && (
            <>
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

              {/* Filter & Search Bar + Slot Tabs */}
              <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-2.5 items-center justify-between">
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
            </>
          )}

          {/* TAB 2: SELF-SERVE ORDERS METRICS & FILTERS */}
          {activeMainTab === 'ORDERS' && (
            <>
              {/* Metric KPI Cards for Orders */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Orders</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-xl font-black text-slate-900">{ordersTotal}</span>
                    <span className="text-xs text-slate-400 font-semibold">self-serve</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">Pending Review</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-xl font-black text-amber-600">{pendingOrdersCount}</span>
                    <span className="text-xs text-amber-500 font-semibold">payment check</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Approved &amp; Live</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-xl font-black text-emerald-600">{approvedOrders.length}</span>
                    <span className="text-xs text-emerald-500 font-semibold">published</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-600">Total Collected</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-xl font-black text-purple-600">₹{totalRevenue.toLocaleString()}</span>
                    <span className="text-xs text-purple-500 font-bold">UPI verified</span>
                  </div>
                </div>
              </div>

              {/* Orders Search & Status Filter Bar */}
              <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-2.5 items-center justify-between">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search orders by advertiser name, phone, email, UTR number or ad title..."
                    value={ordersSearch}
                    onChange={(e) => {
                      setOrdersSearch(e.target.value);
                      setOrdersPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
                  />
                </div>

                {/* Status Tabs */}
                <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0 max-w-full">
                  {[
                    { id: 'ALL', label: 'All Orders' },
                    { id: 'PENDING_VERIFICATION', label: 'Pending Review' },
                    { id: 'APPROVED', label: 'Approved & Live' },
                    { id: 'REJECTED', label: 'Rejected' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setOrdersStatusFilter(tab.id);
                        setOrdersPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                        ordersStatusFilter === tab.id
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {tab.label}
                      {tab.id === 'PENDING_VERIFICATION' && pendingOrdersCount > 0 && (
                        <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
                          {pendingOrdersCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>

        {/* ================= MAIN CONTENT VIEW ================= */}
        <div className="flex-1 min-h-0 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 max-w-7xl w-full mx-auto flex flex-col">
          <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
            
            {/* VIEW 1: CAMPAIGNS TAB */}
            {activeMainTab === 'CAMPAIGNS' && (
              <>
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

                              <td className="py-3.5 px-4">
                                <div className="flex items-center space-x-1 text-slate-700">
                                  <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                                  <span className="truncate max-w-[140px] font-medium text-slate-800 text-xs">
                                    {badge.label}
                                  </span>
                                </div>
                              </td>

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

                              <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                                <div className="text-slate-900 text-xs font-bold">
                                  {ad.viewsCount.toLocaleString()}
                                </div>
                                <div className="text-[10px] text-slate-400 font-normal">
                                  {ad.clicksCount} clicks ({ctr}%)
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end space-x-1.5">
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

                                  <button
                                    onClick={() => openEditModal(ad)}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                                    title="Edit Campaign"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

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

                {/* Campaigns Pagination */}
                <div className="shrink-0 p-3.5 sm:px-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-600 bg-slate-50/80">
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-600">
                      Page {page} of {Math.max(1, totalPages)} <span className="text-slate-400 font-normal">({totalCount} total)</span>
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
                        <option value={10}>10 / page</option>
                        <option value={20}>20 / page</option>
                        <option value={50}>50 / page</option>
                        <option value={100}>100 / page</option>
                      </select>
                    </div>
                  </div>

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
              </>
            )}

            {/* VIEW 2: SELF-SERVE ORDERS & PAYMENTS TAB */}
            {activeMainTab === 'ORDERS' && (
              <>
                {ordersLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-2">
                    <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-semibold">Loading self-serve orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">No ad orders found</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {ordersSearch || ordersStatusFilter !== 'ALL'
                        ? 'No orders match your filter criteria.'
                        : 'Self-serve advertising orders submitted by local businesses will appear here for payment verification.'}
                    </p>
                    <a
                      href="/advertise"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Test / View Public Ad Booking Page</span>
                    </a>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider shadow-xs">
                        <tr>
                          <th className="py-3.5 px-4">Ad Creative &amp; Title</th>
                          <th className="py-3.5 px-4">Advertiser Contact</th>
                          <th className="py-3.5 px-4">Slot &amp; District</th>
                          <th className="py-3.5 px-4">Payment &amp; UTR No.</th>
                          <th className="py-3.5 px-4">Approval Status</th>
                          <th className="py-3.5 px-4 text-right">Verification Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders.map((order) => {
                          const mediaUrl = order.imageUrl ? getFullMediaUrl(order.imageUrl) : '';
                          const isVideo = order.type === 'VIDEO' || (order.imageUrl && (order.imageUrl.endsWith('.mp4') || order.imageUrl.endsWith('.webm')));
                          const isPending = order.approvalStatus === 'PENDING_VERIFICATION';
                          const isApproved = order.approvalStatus === 'APPROVED';
                          const isRejected = order.approvalStatus === 'REJECTED';
                          const badge = getSlotBadgeInfo(order.slot);

                          return (
                            <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                              {/* 1. Ad Creative & Title */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center space-x-3">
                                  <div
                                    onClick={() => setSelectedOrder(order)}
                                    className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 relative group cursor-pointer shadow-xs"
                                    title="Click to preview creative"
                                  >
                                    {isVideo ? (
                                      <div className="w-full h-full bg-slate-800 flex items-center justify-center text-rose-400">
                                        <Play className="w-5 h-5 fill-current" />
                                      </div>
                                    ) : mediaUrl ? (
                                      <img
                                        src={mediaUrl}
                                        alt={order.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                      />
                                    ) : (
                                      <Megaphone className="w-5 h-5 text-slate-400" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <Eye className="w-3.5 h-3.5 text-white" />
                                    </div>
                                  </div>

                                  <div className="min-w-0 max-w-[220px]">
                                    <div
                                      onClick={() => setSelectedOrder(order)}
                                      className="font-bold text-slate-900 truncate text-xs hover:text-red-600 transition-colors cursor-pointer"
                                      title={order.title}
                                    >
                                      {order.title}
                                    </div>
                                    {order.description && (
                                      <div className="text-[11px] text-slate-500 truncate" title={order.description}>
                                        {order.description}
                                      </div>
                                    )}
                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                      Booked {order.createdAt ? formatTimeAgo(order.createdAt).en : 'Recently'}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* 2. Advertiser Contact */}
                              <td className="py-3.5 px-4">
                                <div className="space-y-1">
                                  <div className="font-bold text-slate-900 text-xs">
                                    {order.advertiserName || 'Customer'}
                                  </div>

                                  {/* Phone with Call & WhatsApp links */}
                                  {order.advertiserPhone && (
                                    <div className="flex items-center space-x-2 text-[11px]">
                                      <a
                                        href={`tel:${order.advertiserPhone}`}
                                        className="text-slate-700 hover:text-blue-600 font-medium flex items-center space-x-1"
                                      >
                                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                        <span>{order.advertiserPhone}</span>
                                      </a>

                                      <a
                                        href={`https://wa.me/91${order.advertiserPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`नमस्ते ${order.advertiserName || ''}, e-News पर आपके विज्ञापन "${order.title}" के संबंध में:`)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center space-x-0.5 text-emerald-600 hover:text-emerald-700 font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 transition-colors"
                                        title="Chat on WhatsApp"
                                      >
                                        <MessageCircle className="w-3 h-3" />
                                        <span>WA</span>
                                      </a>
                                    </div>
                                  )}

                                  {/* Email */}
                                  {order.advertiserEmail && (
                                    <div className="text-[11px]">
                                      <a
                                        href={`mailto:${order.advertiserEmail}`}
                                        className="text-slate-500 hover:text-slate-800 truncate max-w-[170px] inline-flex items-center space-x-1"
                                        title={order.advertiserEmail}
                                      >
                                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                        <span className="truncate">{order.advertiserEmail}</span>
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* 3. Slot & Target District */}
                              <td className="py-3.5 px-4">
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-1">
                                    <span className="truncate max-w-[150px] font-bold text-slate-800 text-xs">
                                      {badge.label}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1 text-slate-500 text-[11px]">
                                    <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                                    <span className="truncate max-w-[140px]">
                                      {order.targetDistrict || 'सभी जिले'}
                                    </span>
                                  </div>

                                  {/* Destination Link */}
                                  {order.targetUrl && (
                                    <div className="text-[10px] text-blue-600 truncate max-w-[150px]">
                                      <a
                                        href={order.targetUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="hover:underline flex items-center space-x-1"
                                      >
                                        <Globe className="w-2.5 h-2.5 shrink-0" />
                                        <span className="truncate">{order.targetUrl}</span>
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* 4. Payment & UTR No. */}
                              <td className="py-3.5 px-4">
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-1 text-slate-900 font-black text-xs">
                                    <span>₹{order.amountPaid || 599}</span>
                                    <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.2 rounded bg-slate-100">
                                      {order.paymentMethod || 'UPI'}
                                    </span>
                                  </div>

                                  {/* Copyable UTR */}
                                  <div className="flex items-center space-x-1.5">
                                    <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 select-all">
                                      {order.paymentRefNumber || 'N/A'}
                                    </span>
                                    {order.paymentRefNumber && (
                                      <button
                                        onClick={() => handleCopyUtr(order.paymentRefNumber || '', order.id)}
                                        className="p-1 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                                        title="Copy UTR Reference Number"
                                      >
                                        {copiedUtrId === order.id ? (
                                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        ) : (
                                          <Copy className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* 5. Approval Status */}
                              <td className="py-3.5 px-4">
                                {isPending && (
                                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 animate-pulse" />
                                    <span>Pending Check</span>
                                  </span>
                                )}
                                {isApproved && (
                                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>Verified &amp; Live</span>
                                  </span>
                                )}
                                {isRejected && (
                                  <div className="space-y-0.5">
                                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
                                      <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                      <span>Rejected</span>
                                    </span>
                                    {order.rejectionReason && (
                                      <div className="text-[10px] text-rose-600 truncate max-w-[140px]" title={order.rejectionReason}>
                                        {order.rejectionReason}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </td>

                              {/* 6. Verification Actions */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end space-x-1.5">
                                  {/* View Creative & Details Button */}
                                  <button
                                    onClick={() => setSelectedOrder(order)}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                                    title="View Full Ad Creative & Details"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>

                                  {isPending && (
                                    <>
                                      {/* Verify & Publish Button */}
                                      <button
                                        disabled={verifyingId === order.id}
                                        onClick={() => handleVerifyAndPublish(order)}
                                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
                                        title="Verify UPI Payment & Publish Live"
                                      >
                                        {verifyingId === order.id ? (
                                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                                        )}
                                        <span>Verify &amp; Publish</span>
                                      </button>

                                      {/* Reject Button */}
                                      <button
                                        onClick={() => {
                                          setRejectOrderTarget(order);
                                          setRejectionReason('Payment transaction reference could not be verified in bank records.');
                                        }}
                                        className="px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors cursor-pointer"
                                        title="Reject Order"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}

                                  {isApproved && (
                                    <button
                                      onClick={() => handleToggleActive(order)}
                                      className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                                        order.isActive
                                          ? 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800'
                                          : 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                                      }`}
                                      title={order.isActive ? 'Pause Live Ad' : 'Resume Live Ad'}
                                    >
                                      {order.isActive ? 'Pause Ad' : 'Resume Ad'}
                                    </button>
                                  )}

                                  {isRejected && (
                                    <button
                                      onClick={() => handleVerifyAndPublish(order)}
                                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                                      title="Re-verify and Publish"
                                    >
                                      Re-Verify
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Orders Pagination */}
                <div className="shrink-0 p-3.5 sm:px-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-600 bg-slate-50/80">
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-600">
                      Page {ordersPage} of {Math.max(1, ordersTotalPages)} <span className="text-slate-400 font-normal">({ordersTotal} total)</span>
                    </span>

                    <div className="flex items-center space-x-1.5 border-l border-slate-200 pl-3">
                      <span className="text-slate-400 font-normal text-[11px]">Show:</span>
                      <select
                        value={ordersLimit}
                        onChange={(e) => {
                          setOrdersLimit(Number(e.target.value));
                          setOrdersPage(1);
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

                  <div className="flex items-center space-x-1.5">
                    <button
                      disabled={ordersPage <= 1}
                      onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      Previous
                    </button>
                    {Array.from({ length: ordersTotalPages }, (_, i) => i + 1).slice(
                      Math.max(0, ordersPage - 3),
                      Math.min(ordersTotalPages, ordersPage + 2)
                    ).map((pNum) => (
                      <button
                        key={pNum}
                        onClick={() => setOrdersPage(pNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          ordersPage === pNum
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        {pNum}
                      </button>
                    ))}
                    <button
                      disabled={ordersPage >= ordersTotalPages}
                      onClick={() => setOrdersPage(p => Math.min(ordersTotalPages, p + 1))}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>

      {/* ================= ORDER DETAILS & FULL CREATIVE MODAL ================= */}
      {selectedOrder && (
        <div
          onClick={() => setSelectedOrder(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-red-50 text-red-600 rounded-2xl border border-red-100">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">
                    {selectedOrder.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Self-Serve Ad Order • ID: {selectedOrder.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Creative Media Preview */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Ad Creative / Banner
                </span>
                <div className="rounded-2xl border border-slate-200 bg-slate-950 overflow-hidden flex items-center justify-center min-h-[220px]">
                  {selectedOrder.imageUrl ? (
                    selectedOrder.type === 'VIDEO' || selectedOrder.imageUrl.endsWith('.mp4') || selectedOrder.imageUrl.endsWith('.webm') ? (
                      <video
                        src={getFullMediaUrl(selectedOrder.imageUrl)}
                        controls
                        className="max-h-[360px] w-full object-contain"
                      />
                    ) : (
                      <img
                        src={getFullMediaUrl(selectedOrder.imageUrl)}
                        alt={selectedOrder.title}
                        className="max-h-[360px] w-full object-contain"
                      />
                    )
                  ) : (
                    <div className="p-8 text-center text-slate-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No media uploaded</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {selectedOrder.description && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Ad Description</span>
                  <p className="text-slate-800 font-medium leading-relaxed">{selectedOrder.description}</p>
                </div>
              )}

              {/* Grid Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Advertiser Contact */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                    Advertiser Details
                  </span>
                  <div className="space-y-1 text-slate-800">
                    <p className="font-bold text-sm text-slate-900">{selectedOrder.advertiserName || 'N/A'}</p>
                    <p className="flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{selectedOrder.advertiserPhone || 'N/A'}</span>
                    </p>
                    <p className="flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{selectedOrder.advertiserEmail || 'N/A'}</span>
                    </p>
                  </div>

                  {selectedOrder.advertiserPhone && (
                    <div className="pt-2 flex items-center space-x-2">
                      <a
                        href={`https://wa.me/91${selectedOrder.advertiserPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`नमस्ते ${selectedOrder.advertiserName || ''}, e-News पर आपके विज्ञापन "${selectedOrder.title}" के संबंध में:`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat WhatsApp</span>
                      </a>
                      <a
                        href={`tel:${selectedOrder.advertiserPhone}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Placement & Target */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                    Placement &amp; District
                  </span>
                  <div className="space-y-1.5 text-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Slot Placement</span>
                      <span className="font-bold text-xs">{getSlotBadgeInfo(selectedOrder.slot).label}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Target District</span>
                      <span className="font-bold text-xs text-red-600">{selectedOrder.targetDistrict || 'सभी जिले'}</span>
                    </div>
                    {selectedOrder.targetUrl && (
                      <div>
                        <span className="text-[10px] text-slate-400 block">Target Click Destination</span>
                        <a
                          href={selectedOrder.targetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-xs text-blue-600 hover:underline flex items-center space-x-1 truncate"
                        >
                          <span className="truncate">{selectedOrder.targetUrl}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Lead Form Details if configured */}
              {selectedOrder.actionType === 'LEAD_FORM' && selectedOrder.leadFormConfig && (() => {
                let parsedConfig: any = null;
                try {
                  parsedConfig = typeof selectedOrder.leadFormConfig === 'string'
                    ? JSON.parse(selectedOrder.leadFormConfig)
                    : selectedOrder.leadFormConfig;
                } catch {}

                if (!parsedConfig) return null;

                return (
                  <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-blue-900 tracking-wider flex items-center space-x-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>Configured Lead Form Questions</span>
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {parsedConfig.afterSubmit === 'WHATSAPP' ? 'Redirects to WhatsApp' : 'Thank You Page'}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {parsedConfig.questions?.map((q: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-blue-100 text-[11px]">
                          <span className="font-semibold text-slate-800">
                            {i + 1}. {q.label} {q.required && <span className="text-red-500">*</span>}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {q.type}
                          </span>
                        </div>
                      ))}
                    </div>

                    {parsedConfig.afterSubmit === 'WHATSAPP' && parsedConfig.whatsappNumber && (
                      <p className="text-[10px] text-blue-700">
                        Leads are forwarded directly to WhatsApp: <strong>+91 {parsedConfig.whatsappNumber}</strong>
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Payment Receipt Box */}
              <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                    Payment Verification (UPI)
                  </span>
                  <span className="text-xs font-black text-slate-900">
                    ₹{selectedOrder.amountPaid || 599} INR
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-amber-200/80">
                  <div>
                    <span className="text-[10px] text-slate-400 block">UPI Transaction UTR / Ref ID</span>
                    <span className="font-mono font-bold text-xs text-slate-900 select-all">
                      {selectedOrder.paymentRefNumber || 'N/A'}
                    </span>
                  </div>
                  {selectedOrder.paymentRefNumber && (
                    <button
                      onClick={() => handleCopyUtr(selectedOrder.paymentRefNumber || '', selectedOrder.id)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold text-xs flex items-center space-x-1 transition-colors cursor-pointer"
                    >
                      {copiedUtrId === selectedOrder.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy UTR</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-amber-700 font-medium">
                  Check your Bank or UPI statement for this UTR number. Once confirmed, click &quot;Verify &amp; Publish Live&quot; below. An automated email will be sent to the customer immediately.
                </p>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center space-x-2">
                {selectedOrder.approvalStatus === 'PENDING_VERIFICATION' && (
                  <>
                    <button
                      onClick={() => {
                        setRejectOrderTarget(selectedOrder);
                        setRejectionReason('Payment transaction reference could not be verified in bank records.');
                      }}
                      className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Reject Ad
                    </button>

                    <button
                      disabled={verifyingId === selectedOrder.id}
                      onClick={() => handleVerifyAndPublish(selectedOrder)}
                      className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {verifyingId === selectedOrder.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      )}
                      <span>Verify Payment &amp; Publish Live</span>
                    </button>
                  </>
                )}

                {selectedOrder.approvalStatus === 'APPROVED' && (
                  <button
                    onClick={() => handleToggleActive(selectedOrder)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      selectedOrder.isActive
                        ? 'border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800'
                        : 'border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {selectedOrder.isActive ? 'Pause Live Ad' : 'Resume Live Ad'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= REJECT ORDER MODAL ================= */}
      {rejectOrderTarget && (
        <div
          onClick={() => setRejectOrderTarget(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reject Advertisement Order</h3>
                <p className="text-xs text-slate-500">Ad: &quot;{rejectOrderTarget.title}&quot;</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-[11px] font-black uppercase text-slate-600">
                Reason for Rejection *
              </label>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                {[
                  'Payment transaction reference could not be verified in bank records.',
                  'Creative photo or video does not meet resolution and quality guidelines.',
                  'Advertising content violates editorial terms and newsroom policies.'
                ].map((reasonText) => (
                  <button
                    key={reasonText}
                    type="button"
                    onClick={() => setRejectionReason(reasonText)}
                    className={`w-full text-left p-2.5 rounded-xl border text-[11px] font-medium transition-all cursor-pointer ${
                      rejectionReason === reasonText
                        ? 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-500/10'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {reasonText}
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Or write custom reason to explain to the advertiser..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-xs"
              />

              <p className="text-[10px] text-slate-400">
                This reason will be included in the automated rejection email sent to <span className="font-semibold text-slate-600">{rejectOrderTarget.advertiserEmail}</span>.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setRejectOrderTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isRejecting || !rejectionReason.trim()}
                onClick={handleRejectOrder}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
              >
                {isRejecting && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>Confirm Rejection &amp; Email</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CREATE / EDIT CAMPAIGN MODAL (ADMIN) ================= */}
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

            <form onSubmit={handleSaveAd} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {formError && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span className="font-semibold">{formError}</span>
                </div>
              )}

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

              <div className="space-y-1.5 relative" ref={slotDropdownRef}>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
                  Target Website Placement (Slot) *
                </label>

                {(() => {
                  const currentSlotInfo = slotOptions.flatMap(g => g.slots).find(s => s.value === slot) || {
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

                      {isSlotDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-56 animate-in fade-in slide-in-from-top-1 duration-150">
                          <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between text-[11px] font-bold text-slate-500 shrink-0">
                            <span>Select Website Placement</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {slotOptions.flatMap(g => g.slots).length} positions
                            </span>
                          </div>

                          <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
                            {slotOptions.map((group) => (
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
                                        className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                                          isSelected
                                            ? 'bg-red-50 text-red-900 font-bold'
                                            : 'hover:bg-slate-100 text-slate-700'
                                        }`}
                                      >
                                        <div className="min-w-0 pr-2">
                                          <div className="text-xs truncate">{s.label}</div>
                                          <div className="text-[10px] text-slate-400 truncate">{s.desc}</div>
                                        </div>
                                        {isSelected && (
                                          <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />
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

              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
                  Format Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('IMAGE')}
                    className={`p-3 rounded-2xl border text-left flex items-center space-x-2.5 transition-all cursor-pointer ${
                      type === 'IMAGE'
                        ? 'border-red-500 bg-red-50 text-red-900 ring-2 ring-red-500/10'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4 text-red-600 shrink-0" />
                    <div>
                      <div className="font-bold text-xs">Direct Banner</div>
                      <div className="text-[10px] text-slate-500">Image upload + click URL</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('SCRIPT')}
                    className={`p-3 rounded-2xl border text-left flex items-center space-x-2.5 transition-all cursor-pointer ${
                      type === 'SCRIPT'
                        ? 'border-red-500 bg-red-50 text-red-900 ring-2 ring-red-500/10'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Code className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <div className="font-bold text-xs">Script / AdSense</div>
                      <div className="text-[10px] text-slate-500">Paste AdSense or HTML script</div>
                    </div>
                  </button>
                </div>
              </div>

              {type === 'IMAGE' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
                      Banner Image *
                    </label>
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:bg-slate-50 transition-colors relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      {imagePreview ? (
                        <div className="space-y-2">
                          <img
                            src={imagePreview}
                            alt="Banner Preview"
                            className="max-h-36 mx-auto rounded-xl object-contain border border-slate-200"
                          />
                          <p className="text-[10px] text-slate-500">Click or drag to replace image</p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                            <Upload className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-slate-800">Upload Banner Image</p>
                          <p className="text-[10px] text-slate-400">JPG, PNG, WebP up to 10MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
                      Destination URL (Click Redirect)
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/admission-2026"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
                    Google AdSense / Custom Script Code *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder={'<ins class="adsbygoogle" style="display:block" ...></ins>'}
                    value={scriptCode}
                    onChange={(e) => setScriptCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl text-slate-900 font-mono text-[11px] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="ad-active"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
                  />
                  <label htmlFor="ad-active" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Publish Active Campaign Immediately
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2.5">
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

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
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
