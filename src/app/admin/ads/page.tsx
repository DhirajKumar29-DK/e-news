'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import {
  adService,
  AdvertisementData,
  AdSlotType,
  AdFormatType,
  AdActionType,
  AdPricingConfig,
  AdPackage
} from '@/services/adService';
import { getFullMediaUrl } from '@/config/env';
import {
  Megaphone, Plus, Search, Filter, Trash2, Edit2, ExternalLink,
  Eye, MousePointerClick, Calendar, CheckCircle2, XCircle, TrendingUp,
  Upload, X, Code, Image as ImageIcon, AlertCircle, RefreshCw,
  LayoutGrid, List, CheckCircle, Clock, ShieldCheck, MapPin, ChevronDown, Check,
  Phone, Mail, MessageCircle, Copy, IndianRupee, Play, ShoppingBag, Globe,
  ArrowRight, PhoneCall, FileText, Sliders, QrCode, Save, Tag, Percent, Layers,
  HelpCircle, PlusCircle, CheckCheck, CalendarPlus, Zap
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
  const searchParams = useSearchParams();
  const router = useRouter();

  // Top Tabs: 'CAMPAIGNS' (Admin custom campaigns) vs 'ORDERS' (User self-serve ads & payments) vs 'PRICING'
  const tabFromUrl = searchParams.get('tab');
  const [activeMainTab, setActiveMainTab] = useState<'CAMPAIGNS' | 'ORDERS' | 'PRICING'>(() => {
    if (tabFromUrl === 'orders') return 'ORDERS';
    if (tabFromUrl === 'pricing') return 'PRICING';
    return 'CAMPAIGNS';
  });

  useEffect(() => {
    if (tabFromUrl === 'orders') {
      setActiveMainTab('ORDERS');
    } else if (tabFromUrl === 'pricing') {
      setActiveMainTab('PRICING');
    } else if (tabFromUrl === 'campaigns') {
      setActiveMainTab('CAMPAIGNS');
    }
  }, [tabFromUrl]);

  const handleTabSwitch = (tab: 'CAMPAIGNS' | 'ORDERS' | 'PRICING') => {
    setActiveMainTab(tab);
    const tabParam = tab.toLowerCase();
    router.push(`/admin/ads?tab=${tabParam}`, { scroll: false });
  };

  // ================= PRICING & UPI GATEWAY STATE =================
  const [pricingConfig, setPricingConfig] = useState<AdPricingConfig | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingSaving, setPricingSaving] = useState(false);
  const [upiIdInput, setUpiIdInput] = useState('9798223366@okbizaxis');
  const [payeeNameInput, setPayeeNameInput] = useState('Vartiq News');
  const [packagesList, setPackagesList] = useState<AdPackage[]>([]);
  const [slotPricingMap, setSlotPricingMap] = useState<Record<string, { rateMultiplier?: number; customLabel?: string }>>({});

  // Pagination for Pricing Tab
  const [pkgPage, setPkgPage] = useState(1);
  const [pkgLimit, setPkgLimit] = useState(5);
  const [slotPage, setSlotPage] = useState(1);
  const [slotLimit, setSlotLimit] = useState(5);

  const allSlots = SLOT_OPTIONS.flatMap(g => g.slots);
  const totalSlotPages = Math.ceil(allSlots.length / slotLimit);
  const paginatedSlots = allSlots.slice((slotPage - 1) * slotLimit, slotPage * slotLimit);

  // Package Modal state (Add / Edit Package)
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [deletePackageIndex, setDeletePackageIndex] = useState<number | null>(null);
  const [editingPackageIndex, setEditingPackageIndex] = useState<number | null>(null);
  const [pkgDays, setPkgDays] = useState<string | number>(7);
  const [pkgPrice, setPkgPrice] = useState<string | number>(599);
  const [pkgOriginalPrice, setPkgOriginalPrice] = useState<string | number>(999);
  const [pkgLabel, setPkgLabel] = useState<string>('7 Days (Trial Pack)');
  const [pkgDiscount, setPkgDiscount] = useState<string>('40% off');
  const [pkgBadge, setPkgBadge] = useState<string>('Initial Plan');
  const [pkgPopular, setPkgPopular] = useState<boolean>(false);
  const [isManualDiscount, setIsManualDiscount] = useState<boolean>(false);

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

  // Extend Ad Duration State
  const [extendingAd, setExtendingAd] = useState<AdvertisementData | null>(null);
  const [extendPresetDays, setExtendPresetDays] = useState<number>(3);
  const [extendCustomDate, setExtendCustomDate] = useState<string>('');
  const [extendPaymentNote, setExtendPaymentNote] = useState<string>('');
  const [isExtending, setIsExtending] = useState<boolean>(false);

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

  // Fetch pricing configuration
  const fetchPricingConfig = async () => {
    try {
      setPricingLoading(true);
      const cfg = await adService.getPricingConfig();
      if (cfg) {
        setPricingConfig(cfg);
        setUpiIdInput(cfg.upiId || '9798223366@okbizaxis');
        setPayeeNameInput(cfg.payeeName || 'Vartiq News');
        setPackagesList(Array.isArray(cfg.packages) ? cfg.packages : []);
        setSlotPricingMap(cfg.slotPricing || {});
      }
    } catch (err: any) {
      console.error('Failed to load pricing config:', err);
    } finally {
      setPricingLoading(false);
    }
  };

  // Save full pricing configuration
  const handleSavePricingConfig = async () => {
    try {
      setPricingSaving(true);
      const sanitizedSlotPricing: Record<string, { rateMultiplier?: number; customLabel?: string }> = {};
      Object.entries(slotPricingMap).forEach(([k, v]) => {
        sanitizedSlotPricing[k] = {
          ...v,
          rateMultiplier: v?.rateMultiplier !== undefined && v?.rateMultiplier !== null && String(v.rateMultiplier).trim() !== ''
            ? Number(v.rateMultiplier)
            : 1.0
        };
      });
      const res = await adService.updatePricingConfig({
        upiId: upiIdInput.trim(),
        payeeName: payeeNameInput.trim(),
        packages: packagesList,
        slotPricing: sanitizedSlotPricing
      });
      setPricingConfig(res);
      setToastMessage({
        text: '✅ All Ad Pricing, Duration Packages & UPI Settings successfully saved to database!',
        type: 'success'
      });
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to save pricing config:', err);
      setToastMessage({
        text: `❌ Error saving pricing: ${err.message || 'Failed to save'}`,
        type: 'error'
      });
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setPricingSaving(false);
    }
  };

  // Helper to calculate discount text automatically
  const computeDiscount = (priceVal: string | number, origVal: string | number) => {
    const p = parseFloat(String(priceVal)) || 0;
    const op = parseFloat(String(origVal)) || 0;
    if (op > p && p > 0) {
      const pct = Math.round(((op - p) / op) * 100);
      return `${pct}% off`;
    }
    return '';
  };

  // Package Modal Handlers
  const openAddPackageModal = () => {
    setEditingPackageIndex(null);
    setPkgDays(10);
    setPkgPrice(799);
    setPkgOriginalPrice(1299);
    setPkgLabel('10 Days (Power Boost)');
    setPkgDiscount('38% off');
    setPkgBadge('Hot Deal');
    setPkgPopular(false);
    setIsManualDiscount(false);
    setIsPackageModalOpen(true);
  };

  const openEditPackageModal = (pkg: AdPackage, index: number) => {
    setEditingPackageIndex(index);
    const d = pkg.days || 7;
    const p = pkg.price ?? 0;
    const op = pkg.originalPrice ?? Math.round(p * 1.5);
    setPkgDays(d);
    setPkgPrice(p);
    setPkgOriginalPrice(op);
    setPkgLabel(pkg.label || `${d} Days (Pack)`);
    // Recalculate live discount from current p and op
    const autoDisc = computeDiscount(p, op);
    setPkgDiscount(autoDisc || pkg.discount || '');
    setPkgBadge(pkg.badge || '');
    setPkgPopular(Boolean(pkg.popular));
    setIsManualDiscount(false);
    setIsPackageModalOpen(true);
  };

  // Real-time handlers for Package fields
  const handleDaysChange = (val: string) => {
    setPkgDays(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setPkgLabel((prev) => {
        if (/^\d+\s*Days?/i.test(prev.trim())) {
          return prev.replace(/^\d+\s*Days?/i, `${num} ${num === 1 ? 'Day' : 'Days'}`);
        }
        return `${num} ${num === 1 ? 'Day' : 'Days'} Plan`;
      });
    }
  };

  const handlePriceChange = (val: string) => {
    setPkgPrice(val);
    // Always auto-recalculate discount on price change
    const disc = computeDiscount(val, pkgOriginalPrice);
    setPkgDiscount(disc);
    setIsManualDiscount(false);
  };

  const handleOriginalPriceChange = (val: string) => {
    setPkgOriginalPrice(val);
    // Always auto-recalculate discount on MRP change
    const disc = computeDiscount(pkgPrice, val);
    setPkgDiscount(disc);
    setIsManualDiscount(false);
  };

  const handleSavePackageModal = (e: React.FormEvent) => {
    e.preventDefault();
    const daysNum = Number(pkgDays);
    const priceNum = Number(pkgPrice);
    const origNum = Number(pkgOriginalPrice) || 0;

    if (!daysNum || daysNum < 1) {
      alert('Please enter a valid number of days (at least 1 day)');
      return;
    }
    if (isNaN(priceNum) || priceNum < 0) {
      alert('Please enter a valid price (₹)');
      return;
    }

    const calculatedDiscount = computeDiscount(priceNum, origNum) || pkgDiscount.trim() || undefined;

    const perDayText = `₹${Math.round(priceNum / daysNum)} / day`;

    const updatedPackage: AdPackage = {
      id: editingPackageIndex !== null && packagesList[editingPackageIndex]?.id
        ? packagesList[editingPackageIndex].id
        : `pkg-${daysNum}-${Date.now()}`,
      days: daysNum,
      price: priceNum,
      originalPrice: origNum > 0 ? origNum : undefined,
      label: pkgLabel.trim() || `${daysNum} ${daysNum === 1 ? 'Day' : 'Days'} Plan`,
      discount: calculatedDiscount,
      perDay: perDayText,
      badge: pkgBadge.trim() || undefined,
      popular: pkgPopular
    };

    if (editingPackageIndex !== null) {
      const copy = [...packagesList];
      copy[editingPackageIndex] = updatedPackage;
      setPackagesList(copy);
    } else {
      const copy = [...packagesList, updatedPackage].sort((a, b) => (a.days || 0) - (b.days || 0));
      setPackagesList(copy);
    }

    setIsPackageModalOpen(false);
  };

  const handleDeletePackage = (index: number) => {
    setDeletePackageIndex(index);
  };

  const confirmDeletePackage = () => {
    if (deletePackageIndex === null) return;
    setPackagesList(packagesList.filter((_, i) => i !== deletePackageIndex));
    setDeletePackageIndex(null);
    setToastMessage({ text: 'Advertising package deleted successfully.', type: 'success' });
  };

  const handleQuickAddPreset = (days: number, label: string, price: number, originalPrice: number, badge: string) => {
    const exists = packagesList.some(p => p.days === days);
    if (exists) {
      alert(`A package for ${days} days already exists. You can edit it from the list.`);
      return;
    }
    const newPkg: AdPackage = {
      id: `pkg-${days}-${Date.now()}`,
      days,
      price,
      originalPrice,
      label,
      discount: `${Math.round(((originalPrice - price) / originalPrice) * 100)}% off`,
      perDay: `₹${Math.round(price / days)} / day`,
      badge,
      popular: days === 15 || days === 30
    };
    setPackagesList([...packagesList, newPkg].sort((a, b) => a.days - b.days));
  };

  const handleSlotMultiplierChange = (slotKey: string, multiplier: string | number) => {
    setSlotPricingMap(prev => ({
      ...prev,
      [slotKey]: {
        ...prev[slotKey],
        rateMultiplier: multiplier as any
      }
    }));
  };

  const handleSlotLabelChange = (slotKey: string, customLabel: string) => {
    setSlotPricingMap(prev => ({
      ...prev,
      [slotKey]: {
        ...prev[slotKey],
        customLabel: customLabel.trim()
      }
    }));
  };

  const handleResetSlotMultiplier = (slotKey: string) => {
    setSlotPricingMap(prev => {
      const copy = { ...prev };
      delete copy[slotKey];
      return copy;
    });
  };

  useEffect(() => {
    fetchAds();
    checkPendingCount();
    fetchPricingConfig();
  }, []);

  useEffect(() => {
    if (activeMainTab === 'ORDERS') {
      fetchOrders();
    } else if (activeMainTab === 'PRICING') {
      fetchPricingConfig();
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

  // Direct Client Ad Extension Modal Handlers
  const openExtendModal = (ad: AdvertisementData) => {
    setExtendingAd(ad);
    setExtendPresetDays(3);
    const now = new Date();
    // If ad endDate is in the future, extend from that date; if expired or not set, extend from today
    const baseDate = (ad.endDate && new Date(ad.endDate) > now) ? new Date(ad.endDate) : now;
    const initialTarget = new Date(baseDate);
    initialTarget.setDate(initialTarget.getDate() + 3);
    setExtendCustomDate(initialTarget.toISOString().slice(0, 10));
    setExtendPaymentNote('');
    setIsExtending(false);
  };

  const handleSelectExtendPreset = (days: number) => {
    setExtendPresetDays(days);
    if (!extendingAd) return;
    const now = new Date();
    const baseDate = (extendingAd.endDate && new Date(extendingAd.endDate) > now) ? new Date(extendingAd.endDate) : now;
    const target = new Date(baseDate);
    target.setDate(target.getDate() + days);
    setExtendCustomDate(target.toISOString().slice(0, 10));
  };

  const handleConfirmExtend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendingAd) return;
    if (!extendCustomDate) {
      alert('Please choose a valid target end date.');
      return;
    }

    try {
      setIsExtending(true);
      const targetEndDate = new Date(extendCustomDate + 'T23:59:59.999Z');

      const payload: Partial<AdvertisementData> = {
        endDate: targetEndDate.toISOString(),
        isActive: true,
        approvalStatus: 'APPROVED'
      };

      await adService.updateAd(extendingAd.id, payload);

      const formattedDate = targetEndDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      setToastMessage({
        text: `Ad "${extendingAd.title}" has been successfully extended until ${formattedDate}! It is now Active & Live on the portal.`,
        type: 'success'
      });
      setTimeout(() => setToastMessage(null), 6000);

      // Local optimistic update
      setAds(prev => prev.map(a => a.id === extendingAd.id ? { ...a, ...payload } : a));
      setOrders(prev => prev.map(o => o.id === extendingAd.id ? { ...o, ...payload } : o));
      if (selectedOrder?.id === extendingAd.id) {
        setSelectedOrder(prev => prev ? { ...prev, ...payload } : null);
      }

      await fetchAds();
      await fetchOrders();
      setExtendingAd(null);
    } catch (err: any) {
      console.error('Failed to extend ad duration:', err);
      setToastMessage({
        text: `Failed to extend ad: ${err.message || 'Server error'}`,
        type: 'error'
      });
      setTimeout(() => setToastMessage(null), 5000);
    } finally {
      setIsExtending(false);
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

  // Filter Direct Ads (Exclude self-serve ads booked by public users)
  const directAds = ads.filter(ad => !ad.isSelfServe);

  const filteredAds = directAds.filter(ad => {
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

  // Calculate Metrics for Direct Campaigns
  const totalCampaigns = directAds.length;
  const activeCampaigns = directAds.filter(a => a.isActive).length;
  const totalViews = directAds.reduce((sum, a) => sum + (a.viewsCount || 0), 0);
  const totalClicks = directAds.reduce((sum, a) => sum + (a.clicksCount || 0), 0);
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
              <h1 className="text-xl sm:text-2xl font-black font-serif text-slate-900">
                {activeMainTab === 'CAMPAIGNS'
                  ? `Direct Campaigns & Placements (${totalCampaigns})`
                  : activeMainTab === 'ORDERS'
                  ? `Self-Serve Orders & Payments (${ordersTotal})`
                  : `Ad Pricing & Duration Packages`}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {activeMainTab === 'CAMPAIGNS'
                  ? 'Manage direct sponsor banners, Google AdSense placements, schedules, and impression analytics.'
                  : activeMainTab === 'ORDERS'
                  ? 'Verify customer payments (UTR), review ad creatives, and approve ads live.'
                  : 'Manage duration packages (days, price, discount) and direct UPI payment details.'}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  if (activeMainTab === 'CAMPAIGNS') fetchAds();
                  else if (activeMainTab === 'ORDERS') {
                    fetchOrders();
                    checkPendingCount();
                  } else {
                    fetchPricingConfig();
                  }
                }}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                title="Refresh List"
              >
                <RefreshCw className={`w-4 h-4 ${(loading || ordersLoading || pricingLoading) ? 'animate-spin' : ''}`} />
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

              {activeMainTab === 'PRICING' && (
                <button
                  onClick={handleSavePricingConfig}
                  disabled={pricingSaving}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className={`w-4 h-4 ${pricingSaving ? 'animate-spin' : ''}`} />
                  <span>{pricingSaving ? 'Saving...' : 'Save Settings'}</span>
                </button>
              )}
            </div>
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
                                  <div className="flex items-center space-x-1.5">
                                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                      <Clock className="w-3 h-3 text-amber-600" />
                                      <span>Expired</span>
                                    </span>
                                    <button
                                      onClick={() => openExtendModal(ad)}
                                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors cursor-pointer"
                                      title="Renew / Extend Ad"
                                    >
                                      <Zap className="w-2.5 h-2.5" />
                                      <span>Renew</span>
                                    </button>
                                  </div>
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
                                    onClick={() => openExtendModal(ad)}
                                    className="p-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors cursor-pointer"
                                    title="Extend Ad Duration"
                                  >
                                    <CalendarPlus className="w-3.5 h-3.5" />
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
                                    <>
                                      <button
                                        onClick={() => openExtendModal(order)}
                                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors cursor-pointer"
                                        title="Extend / Renew Ad Duration"
                                      >
                                        <CalendarPlus className="w-3.5 h-3.5" />
                                        <span>Extend</span>
                                      </button>
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
                                    </>
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

            {/* VIEW 3: PRICING, PACKAGES & UPI GATEWAY TAB */}
            {activeMainTab === 'PRICING' && (
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

                {pricingLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-500 space-y-2">
                    <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-semibold">Loading pricing configuration...</p>
                  </div>
                ) : (
                  <>
                    {/* CARD 1: UPI & QR Gateway Settings */}
                    <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
                      <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                        <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200">
                          <QrCode className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">UPI Payment & QR Code Gateway</h3>
                          <p className="text-[11px] text-slate-500">Set the UPI ID and payee name for all self-serve ad bookings. Live QR code preview updates instantly.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                        {/* UPI ID & Payee Name Fields */}
                        <div className="md:col-span-2 space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">UPI ID (Merchant VPA) *</label>
                            <input
                              type="text"
                              value={upiIdInput}
                              onChange={(e) => setUpiIdInput(e.target.value)}
                              placeholder="e.g. business@okaxis or 9876543210@upi"
                              className="w-full px-4 py-3 text-sm font-mono font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">This UPI ID will appear on the public ad booking QR code and payment instructions.</p>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Payee / Merchant Name</label>
                            <input
                              type="text"
                              value={payeeNameInput}
                              onChange={(e) => setPayeeNameInput(e.target.value)}
                              placeholder="e.g. Vartiq News or Your Business Name"
                              className="w-full px-4 py-3 text-sm font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Displayed to the advertiser in the UPI payment confirmation dialog.</p>
                          </div>
                        </div>

                        {/* Live QR Code Preview */}
                        <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Live QR Preview</span>
                          <div className="w-36 h-36 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                                `upi://pay?pa=${upiIdInput || '9798223366@okbizaxis'}&pn=${encodeURIComponent(payeeNameInput || 'NewsPortal')}&am=599&cu=INR&tn=AdBooking_7days`
                              )}`}
                              alt="UPI QR Preview"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 truncate max-w-full">
                            {upiIdInput || '9798223366@okbizaxis'}
                          </span>
                          <span className="text-[10px] text-slate-400">{payeeNameInput || 'Vartiq News'}</span>
                        </div>
                      </div>
                    </div>

                    {/* CARD 2: Duration Packages Manager */}
                    <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
                      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl border border-blue-200">
                            <Tag className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Duration Packages ({packagesList.length})</h3>
                            <p className="text-[11px] text-slate-500">Custom pricing packs shown to advertisers: 1 day, 7 days, 10 days, 1 month, 1 year — jitne chaho utne add karo.</p>
                          </div>
                        </div>
                        <button
                          onClick={openAddPackageModal}
                          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer shrink-0"
                        >
                          <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Add Package</span>
                        </button>
                      </div>

{/* Duration Packages List Table with Pagination */}
                      {packagesList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                          <Tag className="w-8 h-8 text-slate-300" />
                          <p className="text-xs font-bold text-slate-500">No duration packages configured yet.</p>
                          <p className="text-[11px] text-slate-400">Click &quot;Add Package&quot; button above to create your first pricing plan.</p>
                        </div>
                      ) : (
                        (() => {
                          const totalPkgPages = Math.max(1, Math.ceil(packagesList.length / pkgLimit));
                          const currentPkgPage = Math.min(pkgPage, totalPkgPages);
                          const startPkgIdx = (currentPkgPage - 1) * pkgLimit;
                          const paginatedPackages = packagesList.slice(startPkgIdx, startPkgIdx + pkgLimit);

                          return (
                            <div className="space-y-3">
                              <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
                                <table className="w-full text-left border-collapse text-xs">
                                  <thead className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                                    <tr>
                                      <th className="py-3 px-4">Package Plan</th>
                                      <th className="py-3 px-4 text-center">Duration</th>
                                      <th className="py-3 px-4 text-center">Selling Price</th>
                                      <th className="py-3 px-4 text-center">Original MRP</th>
                                      <th className="py-3 px-4 text-center">Discount</th>
                                      <th className="py-3 px-4 text-center">Daily Rate</th>
                                      <th className="py-3 px-4 text-center">Tag / Badge</th>
                                      <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {paginatedPackages.map((pkg, pIdx) => {
                                      const actualIdx = startPkgIdx + pIdx;
                                      return (
                                        <tr key={pkg.id || actualIdx} className="hover:bg-slate-50/80 transition-colors">
                                          <td className="py-3 px-4">
                                            <div className="flex items-center space-x-2">
                                              <span className="font-bold text-slate-900 text-xs">{pkg.label}</span>
                                              {pkg.popular && (
                                                <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                                                  ⭐ Recommended
                                                </span>
                                              )}
                                            </div>
                                          </td>
                                          <td className="py-3 px-4 text-center font-bold text-slate-700">
                                            {pkg.days} {pkg.days === 1 ? 'Day' : 'Days'}
                                          </td>
                                          <td className="py-3 px-4 text-center">
                                            <span className="font-black text-slate-900 text-sm">
                                              ₹{pkg.price?.toLocaleString()}
                                            </span>
                                          </td>
                                          <td className="py-3 px-4 text-center text-slate-400">
                                            {pkg.originalPrice && pkg.originalPrice > pkg.price ? (
                                              <span className="line-through text-xs">₹{pkg.originalPrice?.toLocaleString()}</span>
                                            ) : (
                                              <span className="text-slate-300">—</span>
                                            )}
                                          </td>
                                          <td className="py-3 px-4 text-center">
                                            {pkg.discount ? (
                                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                                {pkg.discount}
                                              </span>
                                            ) : (
                                              <span className="text-slate-300">—</span>
                                            )}
                                          </td>
                                          <td className="py-3 px-4 text-center font-semibold text-slate-600 text-[11px]">
                                            {pkg.perDay || `₹${pkg.days > 0 ? Math.round(pkg.price / pkg.days) : 0} / day`}
                                          </td>
                                          <td className="py-3 px-4 text-center">
                                            {pkg.badge ? (
                                              <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-2xs">
                                                {pkg.badge}
                                              </span>
                                            ) : (
                                              <span className="text-slate-300">—</span>
                                            )}
                                          </td>
                                          <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end space-x-1.5">
                                              <button
                                                onClick={() => openEditPackageModal(pkg, actualIdx)}
                                                className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-slate-600 hover:text-blue-700 text-[11px] font-bold transition-colors cursor-pointer"
                                              >
                                                <Edit2 className="w-3 h-3" />
                                                <span>Edit</span>
                                              </button>
                                              <button
                                                onClick={() => handleDeletePackage(actualIdx)}
                                                className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-300 text-slate-400 hover:text-rose-600 text-[11px] font-bold transition-colors cursor-pointer"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                                <span>Delete</span>
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>

                              {/* Duration Packages Pagination Controls */}
                              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-slate-500 pt-1">
                                <div className="flex items-center space-x-3">
                                  <span>
                                    Showing {packagesList.length === 0 ? 0 : startPkgIdx + 1} to {Math.min(startPkgIdx + pkgLimit, packagesList.length)} of {packagesList.length} packages
                                  </span>
                                  <div className="flex items-center space-x-1.5 border-l border-slate-200 pl-3">
                                    <span className="text-slate-400 font-normal text-[11px]">Show:</span>
                                    <select
                                      value={pkgLimit}
                                      onChange={(e) => {
                                        setPkgLimit(Number(e.target.value));
                                        setPkgPage(1);
                                      }}
                                      className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:border-slate-300 focus:outline-none cursor-pointer"
                                    >
                                      <option value={5}>5 / page</option>
                                      <option value={10}>10 / page</option>
                                      <option value={20}>20 / page</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-1.5">
                                  <button
                                    disabled={currentPkgPage <= 1}
                                    onClick={() => setPkgPage(p => Math.max(1, p - 1))}
                                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                  >
                                    Previous
                                  </button>
                                  {Array.from({ length: totalPkgPages }, (_, i) => i + 1).map((pNum) => (
                                    <button
                                      key={pNum}
                                      onClick={() => setPkgPage(pNum)}
                                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                        currentPkgPage === pNum
                                          ? 'bg-blue-600 text-white shadow-xs'
                                          : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                                      }`}
                                    >
                                      {pNum}
                                    </button>
                                  ))}
                                  <button
                                    disabled={currentPkgPage >= totalPkgPages}
                                    onClick={() => setPkgPage(p => Math.min(totalPkgPages, p + 1))}
                                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                  >
                                    Next
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })()
                      )}
                    </div>

                    {/* CARD 3: Slot-Wise Rate Multipliers with Pagination */}
                    {(() => {
                      const allSlots = slotOptions.flatMap(group =>
                        group.slots.map(s => ({ ...s, groupCategory: group.category }))
                      );
                      const totalSlotPages = Math.max(1, Math.ceil(allSlots.length / slotLimit));
                      const currentSlotPage = Math.min(slotPage, totalSlotPages);
                      const startSlotIdx = (currentSlotPage - 1) * slotLimit;
                      const paginatedSlots = allSlots.slice(startSlotIdx, startSlotIdx + slotLimit);

                      return (
                        <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
                          <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                            <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl border border-purple-200">
                              <Layers className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Slot-Wise Rate Multiplier & Pricing ({allSlots.length})</h3>
                              <p className="text-[11px] text-slate-500">Set custom rate multiplier per slot. 1.0x = base price, 1.5x = 50% premium. Leave 1.0 for standard pricing.</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                                  <tr>
                                    <th className="py-3 px-4">Slot Name</th>
                                    <th className="py-3 px-4 text-center">Rate Multiplier</th>
                                    <th className="py-3 px-4 text-center">Example Price (7-day ₹599)</th>
                                    <th className="py-3 px-4 text-center">Custom Label</th>
                                    <th className="py-3 px-4 text-center">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {paginatedSlots.map((s) => {
                                    const mult = slotPricingMap[s.value]?.rateMultiplier ?? 1.0;
                                    const label = slotPricingMap[s.value]?.customLabel ?? '';
                                    const examplePrice = Math.round(599 * mult);
                                    const isCustom = mult !== 1.0 || label.trim() !== '';

                                    return (
                                      <tr key={s.value} className={`hover:bg-slate-50/80 transition-colors ${isCustom ? 'bg-purple-50/50' : ''}`}>
                                        <td className="py-3 px-4">
                                          <div className="font-bold text-slate-800 text-xs">{s.label}</div>
                                          <div className="text-[10px] text-slate-400">{s.desc}</div>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                          <input
                                            type="number"
                                            step="0.1"
                                            min="0.1"
                                            max="10"
                                            value={mult}
                                            onChange={(e) => handleSlotMultiplierChange(s.value, parseFloat(e.target.value))}
                                            className={`w-20 px-2.5 py-1.5 text-center text-xs font-bold rounded-lg border focus:outline-none focus:ring-1 transition-all ${
                                              mult !== 1.0
                                                ? 'border-purple-300 bg-purple-50 text-purple-800 focus:ring-purple-500 focus:border-purple-500'
                                                : 'border-slate-200 bg-white text-slate-700 focus:ring-slate-400 focus:border-slate-400'
                                            }`}
                                          />
                                          <span className="text-[10px] text-slate-400 ml-1">×</span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                          <span className={`font-bold text-xs ${mult > 1 ? 'text-amber-700' : mult < 1 ? 'text-emerald-700' : 'text-slate-600'}`}>
                                            ₹{examplePrice.toLocaleString()}
                                          </span>
                                          {mult !== 1.0 && (
                                            <span className={`ml-1 text-[9px] font-bold px-1 py-0.5 rounded ${
                                              mult > 1 ? 'text-amber-700 bg-amber-100' : 'text-emerald-700 bg-emerald-100'
                                            }`}>
                                              {mult > 1 ? `+${Math.round((mult - 1) * 100)}%` : `${Math.round((mult - 1) * 100)}%`}
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                          <input
                                            type="text"
                                            value={label}
                                            onChange={(e) => handleSlotLabelChange(s.value, e.target.value)}
                                            placeholder="Optional label"
                                            className="w-full max-w-[140px] mx-auto px-2.5 py-1.5 text-[11px] rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-400 focus:border-purple-400 transition-all"
                                          />
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                          {isCustom && (
                                            <button
                                              onClick={() => handleResetSlotMultiplier(s.value)}
                                              className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 text-[10px] font-bold transition-colors cursor-pointer"
                                            >
                                              Reset
                                            </button>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>

                            {/* Slot-Wise Pagination Controls */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-slate-500 pt-1">
                              <div className="flex items-center space-x-3">
                                <span>
                                  Showing {allSlots.length === 0 ? 0 : startSlotIdx + 1} to {Math.min(startSlotIdx + slotLimit, allSlots.length)} of {allSlots.length} slots
                                </span>
                                <div className="flex items-center space-x-1.5 border-l border-slate-200 pl-3">
                                  <span className="text-slate-400 font-normal text-[11px]">Show:</span>
                                  <select
                                    value={slotLimit}
                                    onChange={(e) => {
                                      setSlotLimit(Number(e.target.value));
                                      setSlotPage(1);
                                    }}
                                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:border-slate-300 focus:outline-none cursor-pointer"
                                  >
                                    <option value={5}>5 / page</option>
                                    <option value={10}>10 / page</option>
                                    <option value={20}>20 / page</option>
                                  </select>
                                </div>
                              </div>

                              <div className="flex items-center space-x-1.5">
                                <button
                                  disabled={currentSlotPage <= 1}
                                  onClick={() => setSlotPage(p => Math.max(1, p - 1))}
                                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                >
                                  Previous
                                </button>
                                {Array.from({ length: totalSlotPages }, (_, i) => i + 1).map((pNum) => (
                                  <button
                                    key={pNum}
                                    onClick={() => setSlotPage(pNum)}
                                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                      currentSlotPage === pNum
                                        ? 'bg-purple-600 text-white shadow-xs'
                                        : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {pNum}
                                  </button>
                                ))}
                                <button
                                  disabled={currentSlotPage >= totalSlotPages}
                                  onClick={() => setSlotPage(p => Math.min(totalSlotPages, p + 1))}
                                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                >
                                  Next
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ================= DELETE PACKAGE MODAL ================= */}
      {deletePackageIndex !== null && packagesList[deletePackageIndex] && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Ad Package?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete the package &ldquo;{packagesList[deletePackageIndex]?.label}&rdquo;?
              </p>
            </div>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletePackageIndex(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeletePackage}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-md shadow-red-600/20 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD / EDIT PACKAGE MODAL ================= */}
      {isPackageModalOpen && (
        <div
          onClick={() => setIsPackageModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">
                    {editingPackageIndex !== null ? 'Edit Duration Package' : 'Add New Duration Package'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Set the number of days, pricing, discount badge, and labels.</p>
                </div>
              </div>
              <button
                onClick={() => setIsPackageModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePackageModal} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Duration (Days) *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={pkgDays}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*$/.test(val)) {
                        handleDaysChange(val);
                      }
                    }}
                    placeholder="e.g. 7"
                    className="w-full px-4 py-3 text-sm font-bold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Price (₹) *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={pkgPrice}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*$/.test(val)) {
                        handlePriceChange(val);
                      }
                    }}
                    placeholder="e.g. 599"
                    className="w-full px-4 py-3 text-sm font-bold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Original / MRP Price (₹)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={pkgOriginalPrice}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*$/.test(val)) {
                        handleOriginalPriceChange(val);
                      }
                    }}
                    placeholder="e.g. 999"
                    className="w-full px-4 py-3 text-sm text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Strikethrough price shown to customer</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Discount Text</label>
                  <input
                    type="text"
                    value={pkgDiscount}
                    onChange={(e) => {
                      setPkgDiscount(e.target.value);
                      setIsManualDiscount(true);
                    }}
                    placeholder="Auto-calculated (e.g. 40% off)"
                    className="w-full px-4 py-3 text-sm text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Auto-updates from Price & MRP</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Package Label / Title *</label>
                <input
                  type="text"
                  value={pkgLabel}
                  onChange={(e) => setPkgLabel(e.target.value)}
                  placeholder="e.g. 7 Days (Trial Pack)"
                  className="w-full px-4 py-3 text-sm text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Badge Text</label>
                  <input
                    type="text"
                    value={pkgBadge}
                    onChange={(e) => setPkgBadge(e.target.value)}
                    placeholder="e.g. Most Popular ⭐"
                    className="w-full px-4 py-3 text-sm text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pkgPopular}
                      onChange={(e) => setPkgPopular(e.target.checked)}
                      className="w-4 h-4 accent-amber-600 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700">⭐ Mark as Popular / Recommended</span>
                  </label>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Preview</span>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-600">{pkgLabel || 'Package Label'}</div>
                    <div className="text-lg font-black text-slate-900">₹{(Number(pkgPrice) || 0).toLocaleString()}</div>
                    <div className="text-[11px] text-emerald-600 font-bold">
                      {pkgDiscount || computeDiscount(pkgPrice, pkgOriginalPrice) || ''}
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <div className="font-semibold">
                      ₹{Number(pkgDays) > 0 ? Math.round((Number(pkgPrice) || 0) / Number(pkgDays)) : 0} / day
                    </div>
                    <div>
                      {Number(pkgDays) || 0} {Number(pkgDays) === 1 ? 'Day' : 'Days'}
                    </div>
                    {pkgBadge && (
                      <span className="inline-block mt-1 text-[9px] font-black uppercase bg-amber-500 text-white px-1.5 py-0.5 rounded-full">{pkgBadge}</span>
                    )}
                  </div>
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-100 flex items-center justify-end space-x-3 shrink-0 bg-slate-50/30">
              <button
                onClick={() => setIsPackageModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={(e) => handleSavePackageModal(e as any)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{editingPackageIndex !== null ? 'Update Package' : 'Add Package'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
              {/* Live Performance Analytics Strip */}
              {selectedOrder.approvalStatus === 'APPROVED' ? (
                <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md">
                  <div className="text-center p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-center gap-1.5 text-blue-400 text-xs font-bold mb-1">
                      <Eye className="w-4 h-4" />
                      <span>Total Impressions</span>
                    </div>
                    <div className="text-xl font-black text-white">
                      {(selectedOrder.viewsCount || 0).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Ad Impressions</div>
                  </div>

                  <div className="text-center p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-center gap-1.5 text-purple-400 text-xs font-bold mb-1">
                      <MousePointerClick className="w-4 h-4" />
                      <span>Total Clicks</span>
                    </div>
                    <div className="text-xl font-black text-white">
                      {(selectedOrder.clicksCount || 0).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Direct Clicks</div>
                  </div>

                  <div className="text-center p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>Click Rate (CTR)</span>
                    </div>
                    <div className="text-xl font-black text-emerald-400">
                      {selectedOrder.viewsCount > 0 ? (((selectedOrder.clicksCount || 0) / selectedOrder.viewsCount) * 100).toFixed(1) : '0.0'}%
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Engagement Rate</div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-amber-800">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-[11px] font-medium">This campaign is pending verification. Performance analytics will be tracked live once approved and published.</span>
                </div>
              )}

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
                        href={`https://wa.me/91${selectedOrder.advertiserPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${selectedOrder.advertiserName || ''}, regarding your advertisement "${selectedOrder.title}" on e-News:`)}`}
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
                      <span className="font-bold text-xs text-red-600">{selectedOrder.targetDistrict || 'All Districts'}</span>
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
                  <>
                    <button
                      onClick={() => openExtendModal(selectedOrder)}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      title="Extend Ad Duration"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                      <span>Extend Duration</span>
                    </button>
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
                  </>
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

      {/* ================= EXTEND AD DURATION MODAL (DIRECT CLIENT RENEWAL) ================= */}
      {extendingAd && (
        <div
          onClick={() => setExtendingAd(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-2xl text-left"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0">
                  <CalendarPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Extend Campaign Duration</h3>
                  <p className="text-xs text-slate-500 truncate max-w-[280px]">
                    {extendingAd.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setExtendingAd(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Status Box */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Placement Slot:</span>
                <span className="font-bold text-slate-800">{getSlotBadgeInfo(extendingAd.slot).label}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Current Expiry:</span>
                <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <span>
                    {extendingAd.endDate
                      ? new Date(extendingAd.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : 'Ongoing / No End Date'}
                  </span>
                  {extendingAd.endDate && new Date(extendingAd.endDate) < new Date() && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Expired
                    </span>
                  )}
                </span>
              </div>
              {(extendingAd.advertiserName || extendingAd.advertiserPhone) && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Client / Advertiser:</span>
                  <span className="font-bold text-slate-800">
                    {extendingAd.advertiserName || 'Direct Client'} {extendingAd.advertiserPhone ? `(${extendingAd.advertiserPhone})` : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider">
                Select Extension Period
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { days: 1, label: '+1 Day', sub: '24 Hours' },
                  { days: 2, label: '+2 Days', sub: 'Short Boost' },
                  { days: 3, label: '+3 Days', sub: 'Weekend Plan' },
                  { days: 7, label: '+7 Days', sub: '1 Week' },
                  { days: 15, label: '+15 Days', sub: 'Fortnight' },
                  { days: 30, label: '+30 Days', sub: '1 Month', popular: true },
                ].map((preset) => {
                  const isSelected = extendPresetDays === preset.days;
                  return (
                    <button
                      key={preset.days}
                      type="button"
                      onClick={() => handleSelectExtendPreset(preset.days)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50/80 text-purple-900 shadow-xs'
                          : 'border-slate-200 hover:border-purple-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {preset.popular && (
                        <span className="absolute -top-1.5 right-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-purple-600 text-white">
                          Popular
                        </span>
                      )}
                      <div className="text-xs font-black">{preset.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{preset.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Date Picker */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider">
                Target Expiry Date (Custom)
              </label>
              <input
                type="date"
                value={extendCustomDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => {
                  setExtendCustomDate(e.target.value);
                  setExtendPresetDays(0);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-purple-500 transition-colors"
              />
              <p className="text-[11px] text-purple-700 font-medium flex items-center space-x-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-purple-600" />
                <span>
                  Ad will remain live until {extendCustomDate ? new Date(extendCustomDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '---'} 11:59 PM.
                </span>
              </p>
            </div>

            {/* Offline Payment Note (Optional) */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider">
                Direct Payment Note (Optional)
              </label>
              <input
                type="text"
                value={extendPaymentNote}
                onChange={(e) => setExtendPaymentNote(e.target.value)}
                placeholder="e.g. Paid ₹1,200 directly via direct UPI / PhonePe / Cash"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-500 focus:bg-white transition-colors"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setExtendingAd(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isExtending || !extendCustomDate}
                onClick={handleConfirmExtend}
                className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 cursor-pointer disabled:opacity-50"
              >
                {isExtending ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5" />
                )}
                <span>Confirm &amp; Make Live Now</span>
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
      <Suspense fallback={<div className="min-h-screen bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">Loading Ad Studio...</div>}>
        <AdStudioContent />
      </Suspense>
    </AdminAuthProvider>
  );
}
