'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Megaphone, ArrowLeft, ArrowRight, CheckCircle2, Phone, Mail, MapPin,
  UploadCloud, ExternalLink, MessageCircle, Globe, Store,
  Check, AlertCircle, Copy, Clock, ShieldCheck,
  ChevronRight, X, PhoneCall, HelpCircle, Eye, Plus, Trash2,
  FileText, CheckCircle, ChevronDown, ChevronUp, Award, Users,
  TrendingUp, Zap, Edit3, Smartphone, Building2, ShoppingBag,
  GraduationCap, Stethoscope, RefreshCw, Layers, Star, Utensils,
  Car, Shield, ArrowUpRight
} from 'lucide-react';
import { adService, AdSlotType, AdActionType, AdPackage, AdPricingConfig } from '@/services/adService';
import { categoryService, CategoryData } from '@/services/categoryService';

// Core 4 fixed layout cards for the ad booking form (section slots are dynamic)
const CORE_PLACEMENT_OPTIONS: { value: AdSlotType; label: string; tag: string; desc: string; size: string; previewBadge: string }[] = [
  {
    value: 'HOMEPAGE_TOP',
    label: 'Homepage Top Banner (Top Leaderboard)',
    tag: 'Highest Reach',
    desc: 'As soon as the website opens, your advertisement will be the first thing seen by readers.',
    size: '728 × 90 px / Responsive',
    previewBadge: 'Top Header Banner'
  },
  {
    value: 'ARTICLE_INLINE',
    label: 'In the middle of the news (In-Article Native)',
    tag: 'Best click rate (High CTR)',
    desc: 'Readers naturally see your ad while reading articles, driving 3x higher click-through.',
    size: 'Fluid / 600 × 250 px',
    previewBadge: 'In-Article Native'
  },
  {
    value: 'ARTICLE_SIDEBAR',
    label: 'Sidebar Ads (Article Sidebar)',
    tag: 'Brand Recall',
    desc: 'Remains sticky on the right side of desktop readers throughout their session.',
    size: '300 × 250 px',
    previewBadge: 'Article Sidebar'
  },
  {
    value: 'HOMEPAGE_BOTTOM',
    label: 'Homepage Bottom (Bottom Banner)',
    tag: 'Budget Friendly',
    desc: 'For high-intent loyal readers who scroll to the end of the page.',
    size: 'Responsive Banner',
    previewBadge: 'Bottom Sticky/Banner'
  }
];

// Duration packages
const PACKAGES = [
  {
    days: 7,
    price: 599,
    originalPrice: 999,
    label: '7 Days (Trial Pack)',
    discount: '40% off',
    perDay: '₹85 / day',
    badge: 'Initial Plan',
    popular: false,
    features: [
      'Live display on homepage and articles',
      'Direct WhatsApp chat button',
      'Direct call button feature',
      'Custom Lead Inquiry Form',
      'Live approval in 24 hours',
      'Email receipt and order status'
    ]
  },
  {
    days: 15,
    price: 1199,
    originalPrice: 2399,
    label: '15 Days (Growth Pack)',
    discount: '50% off',
    perDay: '₹80 / day',
    badge: 'Most Popular ⭐',
    popular: true,
    features: [
      'Priority display across all slots',
      '2x more clicks and views reach',
      'Direct WhatsApp and call integration',
      'Custom Lead Inquiry Form',
      'Priority Admin Approval (12 hours)',
      'Email receipts and digital invoices'
    ]
  },
  {
    days: 30,
    price: 1999,
    originalPrice: 4999,
    label: '30 Days (Super Saver)',
    discount: '60% off',
    perDay: '₹66 / day',
    badge: 'Best Value 🔥',
    popular: false,
    features: [
      'Consistent branding throughout the month',
      'Maximum Local Customer Reach',
      'Direct WhatsApp and call integration',
      'Custom Lead Inquiry Form',
      'VIP Priority Support',
      'Monthly Performance Summary'
    ]
  }
];

// Who should advertise categories
const CATEGORIES = [
  {
    icon: ShoppingBag,
    title: 'Shops & Retail Showrooms',
    desc: 'Clothing, electronics, mobile, jewelry, grocery & department stores',
    tag: 'Local Footfall'
  },
  {
    icon: Building2,
    title: 'Real Estate & Builders',
    desc: 'Residential plots, 2/3 BHK flats, commercial shops & warehouses',
    tag: 'High-Ticket Leads'
  },
  {
    icon: GraduationCap,
    title: 'Schools, Colleges & Coaching',
    desc: 'Admissions open, new batches, IIT-JEE/NEET prep, skill & computer courses',
    tag: 'Students & Parents'
  },
  {
    icon: Stethoscope,
    title: 'Doctors, Hospitals & Labs',
    desc: 'Specialist doctors, pathology tests, dental care, OPD consultations',
    tag: 'Patients & Health'
  },
  {
    icon: Utensils,
    title: 'Hotels, Restaurants & Cafes',
    desc: 'Grand opening, special weekend buffets, party & wedding hall bookings',
    tag: 'Food Lovers'
  },
  {
    icon: Car,
    title: 'Automobiles & Services',
    desc: 'New & pre-owned vehicles, bike showrooms, car repair & accessories',
    tag: 'Vehicle Buyers'
  }
];

export interface LeadQuestion {
  id: string;
  label: string;
  type: 'SHORT_TEXT' | 'PHONE' | 'LONG_TEXT';
  required: boolean;
  error?: string;
}

export interface LeadFormConfig {
  questions: LeadQuestion[];
  postSubmitAction: 'WHATSAPP' | 'THANK_YOU';
  whatsappNumber?: string;
  thankYouMessage?: string;
}

export default function AdvertisePage() {
  // Page View state: 'LANDING', 'FORM', or 'PAYMENT'
  const [pageView, setPageView] = useState<'LANDING' | 'FORM' | 'PAYMENT'>('LANDING');


  // Phone input modal
  const [showPhoneModal, setShowPhoneModal] = useState<boolean>(false);
  const [tempPhone, setTempPhone] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');

  // Advertiser Form details
  const [advertiserName, setAdvertiserName] = useState('');
  const [advertiserPhone, setAdvertiserPhone] = useState('');
  const [advertiserEmail, setAdvertiserEmail] = useState('');
  const [businessName, setBusinessName] = useState('');

  // Ad Details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<AdSlotType>('HOMEPAGE_TOP');
  const [isSlotDropdownOpen, setIsSlotDropdownOpen] = useState(false);
  const [hoveredSlotKey, setHoveredSlotKey] = useState<string | null>(null);
  const slotDropdownRef = useRef<HTMLDivElement>(null);

  // Close custom dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (slotDropdownRef.current && !slotDropdownRef.current.contains(event.target as Node)) {
        setIsSlotDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [selectedDays, setSelectedDays] = useState<number>(7);

  // Creative media
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>('');
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Call-to-action & Destination (EXACTLY matching screenshot requirements)
  const [actionType, setActionType] = useState<AdActionType | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [shopUrl, setShopUrl] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [allowCall, setAllowCall] = useState<boolean>(true);
  const [callingPhone, setCallingPhone] = useState('');

  // Lead Form Builder Modal state
  const [showLeadModal, setShowLeadModal] = useState<boolean>(false);
  const [leadQuestions, setLeadQuestions] = useState<LeadQuestion[]>([]);
  const [leadPostSubmitAction, setLeadPostSubmitAction] = useState<'WHATSAPP' | 'THANK_YOU'>('WHATSAPP');
  const [leadWhatsappNumber, setLeadWhatsappNumber] = useState<string>('');
  const [leadSavedConfig, setLeadSavedConfig] = useState<LeadFormConfig | null>(null);
  const [leadModalGlobalError, setLeadModalGlobalError] = useState<string>('');
  const [showLeadPreviewModal, setShowLeadPreviewModal] = useState<boolean>(false);

  // Payment & Verification state
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<any>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Custom UI Modals & Notifications (replacing native browser alerts/confirm)
  const [showSlotOccupiedModal, setShowSlotOccupiedModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'error' | 'success' | 'info' } | null>(null);

  const showToast = (text: string, type: 'error' | 'success' | 'info' = 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Dynamic Pricing Config from Admin Database
  const [pricingConfig, setPricingConfig] = useState<AdPricingConfig | null>(null);
  const [dynamicPackages, setDynamicPackages] = useState<AdPackage[]>(PACKAGES);
  const [dynamicUpiId, setDynamicUpiId] = useState<string>('9798223366@okbizaxis');
  const [dynamicPayeeName, setDynamicPayeeName] = useState<string>('NewsPortalAds');

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Dynamic categories and real-time slot availability
  const [categories, setCategories] = useState<CategoryData[]>(() => categoryService.getCachedCategories());
  const [slotAvailability, setSlotAvailability] = useState<Record<string, { isOccupied: boolean; adId?: string; endDate?: string | null; startDate?: string | null }>>({});
  const [loadingAvailability, setLoadingAvailability] = useState<boolean>(true);

  // Load categories, slot availability, and admin pricing configuration on mount
  useEffect(() => {
    categoryService.getCategories().then((cats) => {
      if (Array.isArray(cats) && cats.length > 0) {
        setCategories(cats);
      }
    }).catch(() => {});

    adService.getSlotAvailability().then((map) => {
      if (map) {
        setSlotAvailability(map);
      }
    }).catch(() => {}).finally(() => {
      setLoadingAvailability(false);
    });

    // Fetch dynamic admin pricing config (Packages, Slot Multipliers, UPI)
    adService.getPricingConfig().then((cfg) => {
      if (cfg) {
        setPricingConfig(cfg);
        if (cfg.upiId && cfg.upiId.trim()) setDynamicUpiId(cfg.upiId.trim());
        if (cfg.payeeName && cfg.payeeName.trim()) setDynamicPayeeName(cfg.payeeName.trim());
        if (Array.isArray(cfg.packages) && cfg.packages.length > 0) {
          setDynamicPackages(cfg.packages);
          setSelectedDays((prev) => {
            const exists = cfg.packages.some(p => p.days === prev);
            return exists ? prev : cfg.packages[0].days;
          });
        }
      }
    }).catch((err) => {
      console.warn('Failed to load dynamic pricing config:', err);
    });
  }, []);

  // Filter dynamic homepage categories in order
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

  // Format date helper in readable English (e.g. 04 Dec 2026)
  const formatSlotDate = (dateStr?: string | null): string => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      const day = String(d.getDate()).padStart(2, '0');
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      const monthName = months[d.getMonth()];
      return `${day} ${monthName} ${d.getFullYear()}`;
    } catch {
      return '';
    }
  };

  // Get status of any slot
  const getSlotStatus = (slotKey: string) => {
    const item = slotAvailability[slotKey.toUpperCase()];
    if (item && item.isOccupied) {
      const dateStr = formatSlotDate(item.endDate);
      return {
        isOccupied: true,
        endDate: item.endDate,
        formattedDate: dateStr,
        badgeText: dateStr ? `Booked until ${dateStr}` : 'Currently Active / Booked',
        shortBadge: 'Booked'
      };
    }
    return {
      isOccupied: false,
      endDate: null,
      formattedDate: '',
      badgeText: 'Available',
      shortBadge: 'Available'
    };
  };

  // Friendly name for any slot
  const getSlotDisplayName = (slotKey: string) => {
    if (slotKey === 'HOMEPAGE_TOP') return 'Homepage Top Leaderboard';
    if (slotKey === 'ARTICLE_INLINE') return 'In-Article Native Banner';
    if (slotKey === 'ARTICLE_SIDEBAR') return 'Article Sidebar Ad';
    if (slotKey === 'HOMEPAGE_BOTTOM') return 'Homepage Bottom Banner';
    if (slotKey === 'HOMEPAGE_BEFORE_VIDEOS') return 'Homepage Above Videos';

    const match = slotKey.match(/^HOMEPAGE_SECTION_(\d+)$/i);
    if (match) {
      const secNum = parseInt(match[1], 10);
      const cat = dynamicHomeCategories[secNum - 1];
      if (cat) {
        return `Homepage Section ${secNum} (${cat.name})`;
      }
      return `Homepage Section ${secNum}`;
    }

    return slotKey;
  };

  const isSectionSlot = selectedSlot.startsWith('HOMEPAGE_SECTION_') || selectedSlot === 'HOMEPAGE_BEFORE_VIDEOS';
  const currentSelectedStatus = getSlotStatus(selectedSlot);

  // Dynamic pricing calculation with Slot Rate Multiplier
  const slotMultiplier = pricingConfig?.slotPricing?.[selectedSlot]?.rateMultiplier ?? 1.0;
  const slotCustomLabel = pricingConfig?.slotPricing?.[selectedSlot]?.customLabel || '';
  const currentPackage = dynamicPackages.find(p => p.days === selectedDays) || dynamicPackages[0] || PACKAGES[0];
  const basePackagePrice = currentPackage?.price || 1;
  const rawCalculatedPrice = basePackagePrice * slotMultiplier;
  const totalPrice = rawCalculatedPrice < 10
    ? (rawCalculatedPrice % 1 === 0 ? rawCalculatedPrice : Number(rawCalculatedPrice.toFixed(2)))
    : Math.round(rawCalculatedPrice);

  // Lowest package price for overview displays
  const minPrice = dynamicPackages.length > 0 ? Math.min(...dynamicPackages.map(p => p.price)) : 1;

  // Initialize calling phone and WhatsApp when advertiser phone updates
  useEffect(() => {
    if (advertiserPhone) {
      if (!callingPhone) setCallingPhone(advertiserPhone);
      if (!whatsappNumber) setWhatsappNumber(advertiserPhone);
      if (!leadWhatsappNumber) setLeadWhatsappNumber(advertiserPhone);
    }
  }, [advertiserPhone]);

  // Handle media selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setUploadError('File size must be under 50MB');
      return;
    }

    setUploadError('');
    setMediaFile(file);
    const isVideo = file.type.startsWith('video/');
    setMediaType(isVideo ? 'VIDEO' : 'IMAGE');

    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);
  };

  // Open Ad Studio from Landing page
  const handleStartAdCreation = (preferredDays?: number) => {
    if (preferredDays) {
      setSelectedDays(preferredDays);
    }
    if (advertiserPhone && advertiserPhone.length === 10) {
      setPageView('FORM');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setTempPhone(advertiserPhone || '');
      setPhoneError('');
      setShowPhoneModal(true);
    }
  };

  // Confirm phone number modal
  const handleConfirmPhone = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tempPhone.replace(/\D/g, '');
    if (clean.length !== 10) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      return;
    }
    setAdvertiserPhone(clean);
    setCallingPhone(clean);
    setWhatsappNumber(clean);
    setLeadWhatsappNumber(clean);
    setShowPhoneModal(false);
    setPageView('FORM');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Lead Form Builder actions
  const handleOpenLeadModal = () => {
    // If we already have saved questions, load them; else start with clean slate (0 questions)
    if (leadSavedConfig) {
      setLeadQuestions(leadSavedConfig.questions || []);
      setLeadPostSubmitAction(leadSavedConfig.postSubmitAction || 'WHATSAPP');
      setLeadWhatsappNumber(leadSavedConfig.whatsappNumber || advertiserPhone || '');
    } else {
      setLeadQuestions([]);
      setLeadPostSubmitAction('WHATSAPP');
      setLeadWhatsappNumber(advertiserPhone || '');
    }
    setLeadModalGlobalError('');
    setShowLeadModal(true);
  };

  const handleAddLeadQuestion = () => {
    const newQ: LeadQuestion = {
      id: `q_${Date.now()}`,
      label: '',
      type: 'SHORT_TEXT',
      required: true
    };
    setLeadQuestions([...leadQuestions, newQ]);
    setLeadModalGlobalError('');
  };

  const handleRemoveLeadQuestion = (id: string) => {
    setLeadQuestions(leadQuestions.filter(q => q.id !== id));
  };

  const handleUpdateLeadQuestion = (id: string, updates: Partial<LeadQuestion>) => {
    setLeadQuestions(leadQuestions.map(q => {
      if (q.id === id) {
        const updated = { ...q, ...updates };
        if (updates.label && updates.label.trim()) {
          delete updated.error;
        }
        return updated;
      }
      return q;
    }));
  };

  const handleSaveLeadForm = () => {
    if (leadQuestions.length === 0) {
      setLeadModalGlobalError('Please add at least one question field');
      return;
    }

    let hasEmptyLabel = false;
    const updated = leadQuestions.map(q => {
      if (!q.label.trim()) {
        hasEmptyLabel = true;
        return { ...q, error: 'Please enter your question' };
      }
      return { ...q, error: undefined };
    });

    if (hasEmptyLabel) {
      setLeadQuestions(updated);
      setLeadModalGlobalError('Please enter labels for all questions');
      return;
    }

    if (leadPostSubmitAction === 'WHATSAPP') {
      const cleanWa = leadWhatsappNumber.replace(/\D/g, '');
      if (cleanWa.length !== 10) {
        setLeadModalGlobalError('Please enter a valid 10-digit WhatsApp number');
        return;
      }
    }

    const config: LeadFormConfig = {
      questions: leadQuestions,
      postSubmitAction: leadPostSubmitAction,
      whatsappNumber: leadPostSubmitAction === 'WHATSAPP' ? leadWhatsappNumber : undefined
    };

    setLeadSavedConfig(config);
    setShowLeadModal(false);
  };

  // Validation before opening Payment modal
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!advertiserName.trim()) {
      showToast('Please enter your full name');
      return;
    }
    if (!advertiserPhone || advertiserPhone.length !== 10) {
      showToast('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!advertiserEmail.trim()) {
      showToast('Please enter your email address for invoice & confirmation');
      return;
    }
    if (!title.trim()) {
      showToast('Please enter ad headline');
      return;
    }
    if (!mediaFile) {
      showToast('Please upload an ad banner or video creative');
      return;
    }

    // Destination validation
    if (!actionType) {
      showToast('Please choose where readers should be directed when tapping your ad (Step 4: Website, Store, WhatsApp, or Lead Form)');
      return;
    }
    if (actionType === 'WEBSITE' && !websiteUrl.trim()) {
      showToast('Please enter your website URL');
      return;
    }
    if (actionType === 'SHOP' && !shopUrl.trim()) {
      showToast('Please enter your Google Maps location or store link');
      return;
    }
    if (actionType === 'WHATSAPP' && (!whatsappNumber || whatsappNumber.length !== 10)) {
      showToast('Please enter a valid 10-digit WhatsApp number');
      return;
    }
    if (actionType === 'LEAD_FORM' && (!leadSavedConfig || leadSavedConfig.questions.length === 0)) {
      showToast('Please configure at least one question in the lead form and save it');
      return;
    }

    // Slot availability confirmation if currently occupied -> trigger custom branded UI modal
    const slotStatus = getSlotStatus(selectedSlot);
    if (slotStatus.isOccupied) {
      setShowSlotOccupiedModal(true);
      return;
    }

    setPageView('PAYMENT');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmSlotAndProceed = () => {
    setShowSlotOccupiedModal(false);
    setPageView('PAYMENT');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final submit ad with payment details
  const handleFinalSubmit = async () => {
    if (!utrNumber.trim() || utrNumber.trim().length < 6) {
      showToast('Please enter a valid UPI UTR or reference number (at least 6 digits)');
      return;
    }
    if (!actionType) {
      showToast('Please select where readers should be directed (Step 4)');
      return;
    }

    try {
      setIsSubmitting(true);

      const targetUrl =
        actionType === 'WEBSITE' ? websiteUrl :
        actionType === 'SHOP' ? shopUrl :
        actionType === 'WHATSAPP' ? `https://wa.me/91${whatsappNumber}` :
        undefined;

      const formData = new FormData();
      formData.append('title', title);
      if (description) formData.append('description', description);
      formData.append('slot', selectedSlot);
      formData.append('slotType', selectedSlot);
      formData.append('targetDistrict', 'ALL');
      formData.append('startDate', new Date().toISOString());
      formData.append('endDate', new Date(Date.now() + selectedDays * 24 * 60 * 60 * 1000).toISOString());
      formData.append('durationDays', String(selectedDays));
      formData.append('advertiserName', advertiserName);
      formData.append('advertiserPhone', advertiserPhone);
      formData.append('advertiserEmail', advertiserEmail);
      formData.append('actionType', actionType === 'SHOP' ? 'LOCATION' : actionType);
      if (targetUrl) formData.append('targetUrl', targetUrl);
      if (actionType === 'WHATSAPP') {
        formData.append('whatsappNumber', whatsappNumber);
      } else if (leadPostSubmitAction === 'WHATSAPP' && leadWhatsappNumber) {
        formData.append('whatsappNumber', leadWhatsappNumber);
      }
      formData.append('allowCall', String(allowCall));
      if (allowCall && callingPhone) formData.append('callingPhone', callingPhone);
      if (actionType === 'LEAD_FORM' && leadSavedConfig) {
        formData.append('leadFormConfig', JSON.stringify(leadSavedConfig));
      }
      formData.append('amountPaid', String(totalPrice));
      formData.append('paymentMethod', 'UPI');
      formData.append('paymentRefNumber', utrNumber.trim());
      if (mediaFile) formData.append('creative', mediaFile);
      if (paymentScreenshot) formData.append('paymentScreenshot', paymentScreenshot);

      const res = await adService.submitSelfServeAd(formData);
      setSubmissionSuccess(res);
    } catch (err: any) {
      showToast(err.message || 'Failed to submit advertisement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(dynamicUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-36 md:pb-16 font-sans">
      {/* =========================================================================
          PREMIUM TOP NAVIGATION BAR (Crisp, High-Trust, Clean)
          Mobile: Left title/breadcrumbs hidden (as requested in Image 1), right has Create Ad / Back button.
          Desktop: Full breadcrumbs, title, and actions.
          ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Desktop Left: Back to Home | 📢 Advertising Center (Hidden on mobile) */}
          <div className="hidden md:flex items-center gap-3.5">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-red-600 transition group py-1"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 group-hover:text-red-600 transition" />
              <span>Back to Home</span>
            </Link>
            <span className="text-slate-300 select-none">|</span>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 bg-red-50 text-red-600 border border-red-200/60 rounded-xl flex items-center justify-center shadow-xs">
                <Megaphone className="w-4 h-4" />
              </span>
              <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Advertising Center
              </span>
            </div>
          </div>

          {/* Mobile Left: Back Button when in FORM or PAYMENT views */}
          <div className="flex md:hidden items-center gap-2">
            {pageView === 'PAYMENT' ? (
              <button
                type="button"
                onClick={() => {
                  setPageView('FORM');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-red-600 py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-slate-500" />
                <span>Back to Form</span>
              </button>
            ) : pageView === 'FORM' ? (
              <button
                type="button"
                onClick={() => {
                  setPageView('LANDING');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-red-600 py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-slate-500" />
                <span>Back to Overview</span>
              </button>
            ) : (
              /* Mobile Landing View: Clean minimal label */
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-red-600" />
                <span>Ad Studio</span>
              </span>
            )}
          </div>

          {/* Top Right Action Button */}
          <div className="flex items-center gap-3">
            {pageView === 'PAYMENT' ? (
              <>
                <span className="text-[11px] font-bold text-slate-400 md:hidden">Step 2: Payment</span>
                <button
                  type="button"
                  onClick={() => {
                    setPageView('FORM');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hidden md:inline-flex text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 transition items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Form</span>
                </button>
              </>
            ) : pageView === 'FORM' ? (
              <>
                <span className="text-[11px] font-bold text-slate-400 md:hidden">Step 1: Details</span>
                <button
                  type="button"
                  onClick={() => {
                    setPageView('LANDING');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hidden md:inline-flex text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 transition items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Overview</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleStartAdCreation()}
                className="inline-flex items-center justify-center gap-1.5 bg-[#D80032] hover:bg-red-700 text-white font-bold text-xs sm:text-sm px-5 sm:px-7 py-2.5 rounded-xl shadow-md shadow-red-500/20 transition active:scale-95 cursor-pointer whitespace-nowrap tracking-wide"
              >
                <span>Create Ad</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================================
          VIEW 1: LUXURY ADVERTISING LANDING SHOWCASE
          ========================================================================= */}
      {pageView === 'LANDING' && (
        <main className="animate-fadeIn">
          {/* ==========================================
              HERO SECTION: Deep Slate Dark Luxury Canvas
              Explicit dark gradient background so text is crystal clear!
              ========================================== */}
          <section
            className="relative overflow-hidden text-white min-h-[76vh] lg:min-h-[82vh] flex items-center py-7 sm:py-9 lg:py-11 border-b border-slate-800"
            style={{
              backgroundColor: '#070B14',
              backgroundImage:
                'radial-gradient(circle at 40% 10%, rgba(225, 29, 72, 0.22) 0%, transparent 55%), radial-gradient(circle at 85% 40%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), linear-gradient(180deg, #070B14 0%, #0D1322 100%)'
            }}
          >
            {/* Subtle background tech grid lines */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #ffffff15 1px, transparent 1px), linear-gradient(to bottom, #ffffff15 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-2 sm:py-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                {/* Left Column: Clean & Concise Content */}
                <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-center lg:text-left">
                  {/* Clean Pill Badge */}
                  <div className="inline-flex items-center gap-2 bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    <span>Local Business Advertising</span>
                  </div>

                  {/* High-Impact Main Heading */}
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
                    <span className="text-white block">Promote Your Business Online</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-amber-300 inline-block">
                      Reach Millions of Daily Readers Directly
                    </span>
                  </h1>

                  {/* Clean Description */}
                  <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                    Get high-intent local customers directly via instant WhatsApp messages, direct phone calls, and website visits.
                  </p>

                  {/* Prominent Hero CTA Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 justify-center lg:justify-start">
                    <button
                      type="button"
                      onClick={() => handleStartAdCreation()}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-extrabold text-base sm:text-lg px-8 py-4 rounded-2xl shadow-xl shadow-red-600/30 hover:shadow-red-500/50 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                    >
                      <span>Create Ad Now</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white font-bold text-sm sm:text-base px-6 py-4 rounded-2xl border border-slate-700 hover:border-slate-500 transition-all cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-slate-400" />
                      <span>How It Works</span>
                    </button>
                  </div>

                  {/* 4 Sleek Compact Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/70 hover:border-amber-400/50 rounded-2xl p-3 sm:p-4 text-center transition-all hover:scale-[1.02] shadow-lg">
                      <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">50,000+</div>
                      <div className="text-xs font-semibold text-slate-300 mt-1">Daily Readers</div>
                    </div>
                    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/70 hover:border-emerald-400/50 rounded-2xl p-3 sm:p-4 text-center transition-all hover:scale-[1.02] shadow-lg">
                      <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">100%</div>
                      <div className="text-xs font-semibold text-slate-300 mt-1">Local Reach</div>
                    </div>
                    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/70 hover:border-sky-400/50 rounded-2xl p-3 sm:p-4 text-center transition-all hover:scale-[1.02] shadow-lg">
                      <div className="text-2xl sm:text-3xl font-black text-sky-400 tracking-tight">₹{minPrice}</div>
                      <div className="text-xs font-semibold text-slate-300 mt-1">Starting Price</div>
                    </div>
                    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/70 hover:border-rose-400/50 rounded-2xl p-3 sm:p-4 text-center transition-all hover:scale-[1.02] shadow-lg">
                      <div className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight">24 Hours</div>
                      <div className="text-xs font-semibold text-slate-300 mt-1">Live Approval</div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Premium Digital Advertising Showcase Image & Action Button */}
                <div className="lg:col-span-5 flex flex-col justify-center items-center gap-4 w-full">
                  <div className="relative rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl shadow-red-950/50 max-w-lg w-full bg-slate-900 group">
                    <img
                      src="/images/advertise-hero.jpg"
                      alt="Digital Advertising & Business Promotion"
                      className="w-full h-auto max-h-[50vh] sm:max-h-[54vh] object-cover rounded-3xl transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Create Ad Button directly in the Right Column of the Hero Section */}
                  <button
                    type="button"
                    onClick={() => handleStartAdCreation()}
                    className="w-full max-w-lg inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-extrabold text-sm sm:text-base py-3.5 px-6 rounded-2xl shadow-xl shadow-red-600/35 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
                  >
                    <Megaphone className="w-4 h-4" />
                    <span>Create Advertisement Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ==========================================
              SECTION 4: WHO SHOULD ADVERTISE (6 CATEGORIES)
              ========================================== */}
          <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <span className="text-red-600 font-black text-xs uppercase tracking-widest bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                  SUITABLE FOR ALL BUSINESSES
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
                  Which Businesses Benefit the Most?
                </h2>
                <p className="text-slate-600 text-sm sm:text-base mt-2">
                  Connect local customers directly with your shop, showroom, clinic, or office.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {CATEGORIES.map((cat, idx) => {
                  const Icon = cat.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-slate-50 rounded-2xl p-6 border border-slate-200/90 hover:border-red-400/60 hover:bg-white hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white group-hover:bg-red-50 border border-slate-200 group-hover:border-red-200 text-red-600 flex items-center justify-center transition shadow-xs">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                          {cat.tag}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-base group-hover:text-red-600 transition">
                        {cat.title}
                      </h4>
                      <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                        {cat.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ==========================================
              SECTION 5: 3 SIMPLE STEPS PROCESS
              ========================================== */}
          <section id="how-it-works" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200 scroll-mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-14">
                <span className="text-red-600 font-black text-xs uppercase tracking-widest bg-red-100/60 px-3 py-1 rounded-full">
                  FAST & EASY
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
                  Go Live in 3 Simple Steps
                </h2>
                <p className="text-slate-600 text-sm sm:text-base mt-2">
                  Complete the entire setup in under 3 minutes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md text-center relative group hover:border-red-400 transition">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white font-black text-xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-red-500/25">
                    01
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-lg mb-2">Add Details & Creative</h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    Select headline, creative banner or video, and your contact destination (WhatsApp, Website, Call, or Lead Form).
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md text-center relative group hover:border-red-400 transition">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white font-black text-xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-red-500/25">
                    02
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-lg mb-2">Secure UPI Payment</h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    Scan the official QR code using PhonePe, Google Pay, Paytm, or any UPI app to pay the plan amount and enter the transaction UTR number.
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md text-center relative group hover:border-red-400 transition">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white font-black text-xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-red-500/25">
                    03
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-lg mb-2">Verification & Go Live</h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    Our editorial desk reviews and activates your campaign within 24 hours. Invoice and confirmation are sent directly to your email.
                  </p>
                </div>
              </div>

              {/* Big High-Impact CTA Box */}
              <div
                className="mt-14 rounded-3xl p-8 sm:p-12 text-white text-center shadow-2xl relative overflow-hidden"
                style={{
                  backgroundColor: '#0F172A',
                  backgroundImage:
                    'radial-gradient(circle at 50% 0%, rgba(225, 29, 72, 0.35) 0%, transparent 60%), linear-gradient(180deg, #0F172A 0%, #070B14 100%)'
                }}
              >
                <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                  <span className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 text-xs font-semibold px-3.5 py-1 rounded-full border border-red-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    <span>LIMITED TIME SPECIAL OFFER</span>
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-black tracking-tight">
                    Advertise Today &amp; Dominate Your Local Market
                  </h3>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    Reach thousands of active daily readers starting at just ₹{minPrice}.
                  </p>
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => handleStartAdCreation()}
                      className="inline-flex items-center gap-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-base px-9 py-4 rounded-2xl shadow-xl shadow-red-600/40 transition active:scale-95 cursor-pointer border border-red-400/30"
                    >
                      <span>Create Ad Now</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ==========================================
              SECTION 6: FAQ ACCORDION
              ========================================== */}
          <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <span className="text-red-600 font-black text-xs uppercase tracking-widest bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                  HELP & ASSISTANCE
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
                  Frequently Asked Questions
                </h2>
              </div>

              <div className="space-y-4 sm:space-y-5">
                {[
                  {
                    q: 'How long does it take for my ad to go live after submission?',
                    a: 'After you submit your details and payment UTR, our editorial team typically verifies and activates your ad within 2 to 24 hours. You receive an instant email notification and receipt.'
                  },
                  {
                    q: 'Can readers contact me directly via WhatsApp or Phone Call?',
                    a: 'Yes! When readers tap on your ad, they can directly start a WhatsApp conversation with a pre-filled inquiry. You can also enable a direct Call Button for one-tap calling.'
                  },
                  {
                    q: 'How does the Interactive Lead Form feature work?',
                    a: 'With a lead form, you can collect custom details from interested readers (such as their name, city, model of interest, etc.). When a reader submits, their details are sent straight to your WhatsApp.'
                  },
                  {
                    q: 'How do I make the payment and is it secure?',
                    a: 'Yes, 100% secure. You scan the official QR code using PhonePe, Google Pay, Paytm, or any banking UPI app, pay the selected plan amount, and enter the transaction UTR number.'
                  },
                  {
                    q: 'What if I need assistance designing my ad banner?',
                    a: 'You can simply upload your shop board photo, existing pamphlet, or product image. Our editorial desk will format and optimize it perfectly for your selected slot.'
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full px-6 sm:px-8 py-5 sm:py-6 text-left font-bold text-slate-900 flex items-center justify-between gap-5 hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      <span className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                        {item.q}
                      </span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        openFaq === idx ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {openFaq === idx ? (
                          <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                        )}
                      </div>
                    </button>
                    {openFaq === idx && (
                      <div className="px-6 sm:px-8 pt-5 pb-6 sm:pb-7 text-slate-600 text-xs sm:text-sm border-t border-slate-100 leading-relaxed bg-slate-50/50">
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Floating Mobile Bottom Action Island (Image 2) - Safely elevated above mobile bottom nav so it never sticks */}
          <div
            style={{
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 68px)'
            }}
            className="fixed left-3 right-3 z-40 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200/90 dark:border-slate-800/90 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Starting Price</div>
              <div className="text-sm font-black text-red-600 dark:text-red-400">
                ₹{minPrice} {dynamicPackages[0] ? `/ ${dynamicPackages[0].days} Days` : ''}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleStartAdCreation()}
              className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-red-500/25 active:scale-95 transition cursor-pointer"
            >
              <span>Create Ad</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </main>
      )}

      {/* =========================================================================
          VIEW 2: AD CREATION STUDIO / FORM (Clean, Executive, High-Trust UI)
          ========================================================================= */}
      {pageView === 'FORM' && (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
          {/* Top Form Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Create New Advertisement (Ad Studio)
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
                Fill in your campaign details, complete payment, and submit for editorial verification
              </p>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-xs font-bold self-start sm:self-center shadow-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Verified Phone: {advertiserPhone}</span>
            </div>
          </div>

          <form onSubmit={handleProceedToPayment} className="space-y-8">
            {/* Step 1: Advertiser Details */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                <span className="w-9 h-9 rounded-xl bg-red-100 text-red-600 font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                  1
                </span>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    Advertiser Contact Details
                  </h3>
                  <p className="text-xs text-slate-500">Required for booking verification and invoice receipts</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div className="relative">
                  <input
                    type="text"
                    id="advertiserName"
                    required
                    value={advertiserName}
                    onChange={(e) => setAdvertiserName(e.target.value)}
                    placeholder=" "
                    className="block w-full px-4 py-3.5 text-sm text-slate-900 bg-white rounded-xl border border-slate-300 appearance-none focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 peer font-medium transition-all"
                  />
                  <label
                    htmlFor="advertiserName"
                    className="absolute text-sm text-slate-400 duration-200 transform -translate-y-1/2 top-1/2 z-10 origin-[0] bg-white px-1.5 peer-focus:px-1.5 peer-focus:text-red-600 peer-focus:top-0 peer-focus:text-xs peer-focus:font-bold peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-slate-600 start-3.5 pointer-events-none truncate max-w-[85%]"
                  >
                    Your Full Name *
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="tel"
                    id="advertiserPhone"
                    required
                    maxLength={10}
                    value={advertiserPhone}
                    onChange={(e) => setAdvertiserPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder=" "
                    className="block w-full px-4 py-3.5 text-sm font-mono text-slate-900 bg-white rounded-xl border border-slate-300 appearance-none focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 peer font-medium transition-all"
                  />
                  <label
                    htmlFor="advertiserPhone"
                    className="absolute text-sm text-slate-400 duration-200 transform -translate-y-1/2 top-1/2 z-10 origin-[0] bg-white px-1.5 peer-focus:px-1.5 peer-focus:text-red-600 peer-focus:top-0 peer-focus:text-xs peer-focus:font-bold peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-slate-600 start-3.5 pointer-events-none truncate max-w-[85%]"
                  >
                    Mobile Number * (Verified)
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="email"
                    id="advertiserEmail"
                    required
                    value={advertiserEmail}
                    onChange={(e) => setAdvertiserEmail(e.target.value)}
                    placeholder=" "
                    className="block w-full px-4 py-3.5 text-sm text-slate-900 bg-white rounded-xl border border-slate-300 appearance-none focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 peer font-medium transition-all"
                  />
                  <label
                    htmlFor="advertiserEmail"
                    className="absolute text-sm text-slate-400 duration-200 transform -translate-y-1/2 top-1/2 z-10 origin-[0] bg-white px-1.5 peer-focus:px-1.5 peer-focus:text-red-600 peer-focus:top-0 peer-focus:text-xs peer-focus:font-bold peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-slate-600 start-3.5 pointer-events-none truncate max-w-[85%]"
                  >
                    Email Address * (For invoice & confirmation)
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder=" "
                    className="block w-full px-4 py-3.5 text-sm text-slate-900 bg-white rounded-xl border border-slate-300 appearance-none focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 peer font-medium transition-all"
                  />
                  <label
                    htmlFor="businessName"
                    className="absolute text-sm text-slate-400 duration-200 transform -translate-y-1/2 top-1/2 z-10 origin-[0] bg-white px-1.5 peer-focus:px-1.5 peer-focus:text-red-600 peer-focus:top-0 peer-focus:text-xs peer-focus:font-bold peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-slate-600 start-3.5 pointer-events-none truncate max-w-[85%]"
                  >
                    Business / Company Name (Optional)
                  </label>
                </div>
              </div>
            </div>

            {/* Step 2: Ad Creative & Banner */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                <span className="w-9 h-9 rounded-xl bg-red-100 text-red-600 font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                  2
                </span>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    Ad Creative & Media
                  </h3>
                  <p className="text-xs text-slate-500">Headline and creative media shown to readers</p>
                </div>
              </div>

              <div className="space-y-5 pt-1">
                <div className="relative">
                  <input
                    type="text"
                    id="adTitle"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder=" "
                    className="block w-full px-4 py-3.5 text-sm text-slate-900 bg-white rounded-xl border border-slate-300 appearance-none focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 peer font-medium transition-all"
                  />
                  <label
                    htmlFor="adTitle"
                    className="absolute text-sm text-slate-400 duration-200 transform -translate-y-1/2 top-1/2 z-10 origin-[0] bg-white px-1.5 peer-focus:px-1.5 peer-focus:text-red-600 peer-focus:top-0 peer-focus:text-xs peer-focus:font-bold peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-slate-600 start-3.5 pointer-events-none truncate max-w-[85%]"
                  >
                    Ad Headline *
                  </label>
                </div>

                <div className="relative">
                  <textarea
                    id="adDescription"
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder=" "
                    className="block w-full px-4 pt-3.5 pb-2.5 text-sm text-slate-900 bg-white rounded-xl border border-slate-300 appearance-none focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 peer font-medium transition-all resize-none"
                  />
                  <label
                    htmlFor="adDescription"
                    className="absolute text-sm text-slate-400 duration-200 transform -translate-y-1/2 top-5 z-10 origin-[0] bg-white px-1.5 peer-focus:px-1.5 peer-focus:text-red-600 peer-focus:top-0 peer-focus:text-xs peer-focus:font-bold peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-slate-600 start-3.5 pointer-events-none truncate max-w-[85%]"
                  >
                    Ad Description (Optional)
                  </label>
                </div>
              </div>

              {/* Upload Zone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Upload Banner or Video * (JPG, PNG, WebP, MP4 - Max 50MB)
                </label>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                    mediaPreview
                      ? 'border-emerald-400 bg-emerald-50/30'
                      : 'border-slate-300 hover:border-red-400 bg-slate-50 hover:bg-red-50/20'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png,image/jpeg,image/webp,video/mp4"
                    className="hidden"
                  />

                  {mediaPreview ? (
                    <div className="space-y-3">
                      <div className="max-w-md mx-auto max-h-56 overflow-hidden rounded-xl border border-slate-200 bg-black/5 flex items-center justify-center">
                        {mediaType === 'VIDEO' ? (
                          <video src={mediaPreview} controls className="max-h-56 w-auto" />
                        ) : (
                          <img src={mediaPreview} alt="Preview" className="max-h-56 w-auto object-contain" />
                        )}
                      </div>
                      <div className="text-xs font-semibold text-emerald-700 flex items-center justify-center gap-1">
                        <Check className="w-4 h-4" />
                        <span>File selected: {mediaFile?.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="text-xs text-red-600 hover:underline font-bold"
                      >
                        Change File
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div className="text-sm font-bold text-slate-700">
                        Click here to choose file or drag & drop
                      </div>
                      <div className="text-xs text-slate-500">
                        Recommended size: 1200×628 px (Banner) or 600×250 px
                      </div>
                    </div>
                  )}
                </div>
                {uploadError && <p className="text-xs text-red-600 mt-1">{uploadError}</p>}
              </div>
            </div>

            {/* Step 3: Placement Slot Selection (Clean Custom Dropdown, No Redundant Cards) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                <span className="w-9 h-9 rounded-xl bg-red-100 text-red-600 font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                  3
                </span>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    Choose Ad Placement Slot
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select where to display your ad — with instant real-time slot availability
                  </p>
                </div>
              </div>

              {/* Custom Smooth Scrollable Dropdown Menu with Hover Details */}
              <div className="relative" ref={slotDropdownRef}>
                <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center justify-between flex-wrap gap-2">
                  <span className="flex items-center gap-1.5">
                    <span>🎯</span>
                    <span>Select Placement Slot:</span>
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    {dynamicHomeCategories.length > 0 ? `(${dynamicHomeCategories.length} category sections + 4 prime slots)` : ''}
                  </span>
                </label>

                {/* Dropdown Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsSlotDropdownOpen(!isSlotDropdownOpen)}
                  className="w-full px-4 sm:px-5 py-3.5 rounded-2xl border border-slate-300 bg-white hover:border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 shadow-xs flex items-center justify-between gap-3 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                    <span className="text-sm font-bold text-slate-900 truncate">
                      {getSlotDisplayName(selectedSlot)}
                    </span>
                    {slotMultiplier !== 1.0 && (
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full shrink-0">
                        {slotMultiplier}x Rate
                      </span>
                    )}
                    {slotCustomLabel && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full shrink-0">
                        {slotCustomLabel}
                      </span>
                    )}
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                      currentSelectedStatus.isOccupied
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}>
                      {currentSelectedStatus.isOccupied ? (
                        <>
                          <Clock className="w-3 h-3 text-amber-700 shrink-0" />
                          <span>{currentSelectedStatus.formattedDate ? `Booked until ${currentSelectedStatus.formattedDate}` : 'Currently Booked'}</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3 h-3 text-emerald-700 stroke-[3] shrink-0" />
                          <span>100% Available</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className={`w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 transition-transform duration-200 text-slate-600 ${
                    isSlotDropdownOpen ? 'rotate-180 bg-red-50 text-red-600' : 'group-hover:bg-slate-200'
                  }`}>
                    <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </button>

                {/* Custom Dropdown Menu with Fixed Height & Smooth Scroll */}
                {isSlotDropdownOpen && (
                  <div className="absolute z-40 left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl max-h-72 overflow-y-auto divide-y divide-slate-100 animate-fadeIn scrollbar-thin">
                    
                    {/* Group 1: Homepage Prime Slots */}
                    <div className="p-2">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-1.5">
                        👑 Homepage Prime Slots
                      </div>
                      <div className="space-y-1">
                        {CORE_PLACEMENT_OPTIONS.filter(o => o.value.startsWith('HOMEPAGE_')).map(opt => {
                          const st = getSlotStatus(opt.value);
                          const isCurrent = selectedSlot === opt.value;
                          const isHovered = hoveredSlotKey === opt.value;

                          return (
                            <div
                              key={opt.value}
                              onMouseEnter={() => setHoveredSlotKey(opt.value)}
                              onMouseLeave={() => setHoveredSlotKey(null)}
                              onClick={() => {
                                setSelectedSlot(opt.value);
                                setIsSlotDropdownOpen(false);
                              }}
                              className={`px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors flex flex-col gap-1 ${
                                isCurrent
                                  ? 'bg-red-50/80 text-red-900 border-l-4 border-l-red-600 font-bold'
                                  : 'hover:bg-slate-50 text-slate-800'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-xs sm:text-sm font-semibold truncate">
                                    {opt.label}
                                  </span>
                                  {pricingConfig?.slotPricing?.[opt.value]?.rateMultiplier && pricingConfig.slotPricing[opt.value].rateMultiplier !== 1.0 && (
                                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded shrink-0">
                                      {pricingConfig.slotPricing[opt.value].rateMultiplier}x
                                    </span>
                                  )}
                                  {pricingConfig?.slotPricing?.[opt.value]?.customLabel && (
                                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded shrink-0">
                                      {pricingConfig.slotPricing[opt.value].customLabel}
                                    </span>
                                  )}
                                </div>
                                {st.isOccupied ? (
                                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-amber-700" />
                                    <span>Booked</span>
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                                    <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                                    <span>Available</span>
                                  </span>
                                )}
                              </div>

                              {/* Hover details if booked */}
                              {st.isOccupied && isHovered && (
                                <div className="text-[11px] text-amber-900 bg-amber-100/90 border border-amber-300/80 rounded-lg px-2.5 py-1 flex items-center gap-1.5 animate-fadeIn">
                                  <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                  <span>{st.formattedDate ? `Booked until ${st.formattedDate} — Click to reserve next slot` : 'Currently active ad running — Click to queue'}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Group 2: Homepage Category News Sections */}
                    <div className="p-2">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-1.5">
                        📰 Homepage Category News Sections
                      </div>
                      <div className="space-y-1">
                        {dynamicHomeCategories.map((cat, idx) => {
                          const slotKey = `HOMEPAGE_SECTION_${idx + 1}` as AdSlotType;
                          const st = getSlotStatus(slotKey);
                          const isCurrent = selectedSlot === slotKey;
                          const isHovered = hoveredSlotKey === slotKey;

                          return (
                            <div
                              key={slotKey}
                              onMouseEnter={() => setHoveredSlotKey(slotKey)}
                              onMouseLeave={() => setHoveredSlotKey(null)}
                              onClick={() => {
                                setSelectedSlot(slotKey);
                                setIsSlotDropdownOpen(false);
                              }}
                              className={`px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors flex flex-col gap-1 ${
                                isCurrent
                                  ? 'bg-red-50/80 text-red-900 border-l-4 border-l-red-600 font-bold'
                                  : 'hover:bg-slate-50 text-slate-800'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-xs sm:text-sm font-semibold truncate">
                                    Section {idx + 1}: After {cat.name}
                                  </span>
                                  {pricingConfig?.slotPricing?.[slotKey]?.rateMultiplier && pricingConfig.slotPricing[slotKey].rateMultiplier !== 1.0 && (
                                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded shrink-0">
                                      {pricingConfig.slotPricing[slotKey].rateMultiplier}x
                                    </span>
                                  )}
                                  {pricingConfig?.slotPricing?.[slotKey]?.customLabel && (
                                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded shrink-0">
                                      {pricingConfig.slotPricing[slotKey].customLabel}
                                    </span>
                                  )}
                                </div>
                                {st.isOccupied ? (
                                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-amber-700" />
                                    <span>Booked</span>
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                                    <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                                    <span>Available</span>
                                  </span>
                                )}
                              </div>

                              {/* Hover details if booked */}
                              {st.isOccupied && isHovered && (
                                <div className="text-[11px] text-amber-900 bg-amber-100/90 border border-amber-300/80 rounded-lg px-2.5 py-1 flex items-center gap-1.5 animate-fadeIn">
                                  <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                  <span>{st.formattedDate ? `Booked until ${st.formattedDate} — Click to reserve next slot` : 'Currently active ad running — Click to queue'}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Video Showcase Slot */}
                        {(() => {
                          const slotKey = 'HOMEPAGE_BEFORE_VIDEOS' as AdSlotType;
                          const st = getSlotStatus(slotKey);
                          const isCurrent = selectedSlot === slotKey;
                          const isHovered = hoveredSlotKey === slotKey;

                          return (
                            <div
                              key={slotKey}
                              onMouseEnter={() => setHoveredSlotKey(slotKey)}
                              onMouseLeave={() => setHoveredSlotKey(null)}
                              onClick={() => {
                                setSelectedSlot(slotKey);
                                setIsSlotDropdownOpen(false);
                              }}
                              className={`px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors flex flex-col gap-1 ${
                                isCurrent
                                  ? 'bg-red-50/80 text-red-900 border-l-4 border-l-red-600 font-bold'
                                  : 'hover:bg-slate-50 text-slate-800'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-xs sm:text-sm font-semibold truncate">
                                    Above Videos Showcase Banner
                                  </span>
                                  {pricingConfig?.slotPricing?.[slotKey]?.rateMultiplier && pricingConfig.slotPricing[slotKey].rateMultiplier !== 1.0 && (
                                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded shrink-0">
                                      {pricingConfig.slotPricing[slotKey].rateMultiplier}x
                                    </span>
                                  )}
                                  {pricingConfig?.slotPricing?.[slotKey]?.customLabel && (
                                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded shrink-0">
                                      {pricingConfig.slotPricing[slotKey].customLabel}
                                    </span>
                                  )}
                                </div>
                                {st.isOccupied ? (
                                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-amber-700" />
                                    <span>Booked</span>
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                                    <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                                    <span>Available</span>
                                  </span>
                                )}
                              </div>

                              {st.isOccupied && isHovered && (
                                <div className="text-[11px] text-amber-900 bg-amber-100/90 border border-amber-300/80 rounded-lg px-2.5 py-1 flex items-center gap-1.5 animate-fadeIn">
                                  <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                  <span>{st.formattedDate ? `Booked until ${st.formattedDate} — Click to reserve next slot` : 'Currently active ad running — Click to queue'}</span>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Group 3: Article Page Placements */}
                    <div className="p-2">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-1.5">
                        📄 Article Page Placements
                      </div>
                      <div className="space-y-1">
                        {CORE_PLACEMENT_OPTIONS.filter(o => o.value.startsWith('ARTICLE_')).map(opt => {
                          const st = getSlotStatus(opt.value);
                          const isCurrent = selectedSlot === opt.value;
                          const isHovered = hoveredSlotKey === opt.value;

                          return (
                            <div
                              key={opt.value}
                              onMouseEnter={() => setHoveredSlotKey(opt.value)}
                              onMouseLeave={() => setHoveredSlotKey(null)}
                              onClick={() => {
                                setSelectedSlot(opt.value);
                                setIsSlotDropdownOpen(false);
                              }}
                              className={`px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors flex flex-col gap-1 ${
                                isCurrent
                                  ? 'bg-red-50/80 text-red-900 border-l-4 border-l-red-600 font-bold'
                                  : 'hover:bg-slate-50 text-slate-800'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-xs sm:text-sm font-semibold truncate">
                                    {opt.label}
                                  </span>
                                  {pricingConfig?.slotPricing?.[opt.value]?.rateMultiplier && pricingConfig.slotPricing[opt.value].rateMultiplier !== 1.0 && (
                                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded shrink-0">
                                      {pricingConfig.slotPricing[opt.value].rateMultiplier}x
                                    </span>
                                  )}
                                  {pricingConfig?.slotPricing?.[opt.value]?.customLabel && (
                                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded shrink-0">
                                      {pricingConfig.slotPricing[opt.value].customLabel}
                                    </span>
                                  )}
                                </div>
                                {st.isOccupied ? (
                                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-amber-700" />
                                    <span>Booked</span>
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                                    <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                                    <span>Available</span>
                                  </span>
                                )}
                              </div>

                              {/* Hover details if booked */}
                              {st.isOccupied && isHovered && (
                                <div className="text-[11px] text-amber-900 bg-amber-100/90 border border-amber-300/80 rounded-lg px-2.5 py-1 flex items-center gap-1.5 animate-fadeIn">
                                  <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                  <span>{st.formattedDate ? `Booked until ${st.formattedDate} — Click to reserve next slot` : 'Currently active ad running — Click to queue'}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* Real-time Status Notice for Selected Slot */}
              <div>
                {currentSelectedStatus.isOccupied ? (
                  <div className="p-5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 text-xs sm:text-sm flex items-start gap-3.5 shadow-xs animate-fadeIn">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1.5">
                      <div className="font-bold text-amber-900 text-sm flex items-center gap-2 flex-wrap">
                        <span>⚠️ Slot Status: '{getSlotDisplayName(selectedSlot)}'</span>
                        <span className="bg-amber-200/90 text-amber-900 px-2.5 py-0.5 rounded-full text-xs font-bold border border-amber-300">
                          {currentSelectedStatus.formattedDate ? `Booked until ${currentSelectedStatus.formattedDate}` : 'Currently Booked'}
                        </span>
                      </div>
                      <p className="text-amber-800 leading-relaxed text-xs">
                        An active ad is currently running in this slot. If you book now, your slot will be reserved and your campaign will automatically go live after <strong>{currentSelectedStatus.formattedDate || 'the current active schedule'}</strong>.
                      </p>
                      <p className="text-amber-700 text-[11.5px] font-semibold pt-0.5">
                        💡 <em>Tip: To launch your ad immediately (within 24 hours), you can choose any green <strong>'Available'</strong> slot from the dropdown above.</em>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-950 text-xs sm:text-sm flex items-start gap-3.5 shadow-xs animate-fadeIn">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1.5">
                      <div className="font-bold text-emerald-900 text-sm flex items-center gap-2 flex-wrap">
                        <span>✓ Slot Status: '{getSlotDisplayName(selectedSlot)}'</span>
                        <span className="bg-emerald-200/90 text-emerald-900 px-2.5 py-0.5 rounded-full text-xs font-bold border border-emerald-300">
                          100% Available Now
                        </span>
                      </div>
                      <p className="text-emerald-800 leading-relaxed text-xs">
                        Great news! This placement slot is currently available. Your advertisement will go live within 12-24 hours after booking and payment confirmation.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Click Destination (EXACTLY AS SCREENSHOT media_1793777044894_38e15279.png) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                <span className="w-9 h-9 rounded-xl bg-red-100 text-red-600 font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                  4
                </span>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    Where should readers be directed when tapping your ad: *
                  </h3>
                  <p className="text-xs text-slate-500">Choose how interested customers connect with you directly</p>
                </div>
              </div>

              {/* 4 Clean Vertical Destination Cards */}
              <div className="space-y-3">
                {/* 1. Website */}
                <div
                  onClick={() => setActionType('WEBSITE')}
                  className={`p-5 sm:p-6 rounded-2xl border-2 transition cursor-pointer ${
                    actionType === 'WEBSITE'
                      ? 'border-red-500 bg-red-50/20 ring-1 ring-red-500/30'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm sm:text-base">My Website</div>
                      <div className="text-slate-500 text-xs sm:text-sm mt-0.5">
                        Readers tap the ad and land directly on your website or online store
                      </div>
                    </div>
                    <div className="pt-0.5">
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        actionType === 'WEBSITE' ? 'border-red-600 bg-red-600 text-white' : 'border-slate-300'
                      }`}>
                        {actionType === 'WEBSITE' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic field for Website with Proper Padding */}
                  {actionType === 'WEBSITE' && (
                    <div className="mt-5 pt-4 border-t border-red-200/80 bg-white/90 p-4 sm:p-5 rounded-xl border border-red-200/70 shadow-2xs space-y-2 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <input
                          type="url"
                          id="websiteUrl"
                          required
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                          placeholder=" "
                          className="block w-full px-4 py-3.5 text-sm text-slate-900 bg-white rounded-xl border border-slate-300 appearance-none focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 peer font-medium transition-all"
                        />
                        <label
                          htmlFor="websiteUrl"
                          className="absolute text-sm text-slate-400 duration-200 transform -translate-y-1/2 top-1/2 z-10 origin-[0] bg-white px-1.5 peer-focus:px-1.5 peer-focus:text-red-600 peer-focus:top-0 peer-focus:text-xs peer-focus:font-bold peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-slate-600 start-3.5 pointer-events-none truncate max-w-[85%]"
                        >
                          Website URL (e.g. https://yourwebsite.com) *
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Shop / Store */}
                <div
                  onClick={() => setActionType('SHOP')}
                  className={`p-5 sm:p-6 rounded-2xl border-2 transition cursor-pointer ${
                    actionType === 'SHOP'
                      ? 'border-red-500 bg-red-50/20 ring-1 ring-red-500/30'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm sm:text-base">My Store / Location</div>
                      <div className="text-slate-500 text-xs sm:text-sm mt-0.5">
                        Direct readers to your Google Maps location or physical store address
                      </div>
                    </div>
                    <div className="pt-0.5">
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        actionType === 'SHOP' ? 'border-red-600 bg-red-600 text-white' : 'border-slate-300'
                      }`}>
                        {actionType === 'SHOP' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic field for Shop with Proper Padding */}
                  {actionType === 'SHOP' && (
                    <div className="mt-5 pt-4 border-t border-red-200/80 bg-white/90 p-4 sm:p-5 rounded-xl border border-red-200/70 shadow-2xs space-y-2 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <input
                          type="url"
                          id="shopUrl"
                          required
                          value={shopUrl}
                          onChange={(e) => setShopUrl(e.target.value)}
                          placeholder=" "
                          className="block w-full px-4 py-3.5 text-sm text-slate-900 bg-white rounded-xl border border-slate-300 appearance-none focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 peer font-medium transition-all"
                        />
                        <label
                          htmlFor="shopUrl"
                          className="absolute text-sm text-slate-400 duration-200 transform -translate-y-1/2 top-1/2 z-10 origin-[0] bg-white px-1.5 peer-focus:px-1.5 peer-focus:text-red-600 peer-focus:top-0 peer-focus:text-xs peer-focus:font-bold peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-slate-600 start-3.5 pointer-events-none truncate max-w-[85%]"
                        >
                          Store Link or Google Maps URL *
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Lead Form */}
                <div
                  onClick={() => setActionType('LEAD_FORM')}
                  className={`p-5 sm:p-6 rounded-2xl border-2 transition cursor-pointer ${
                    actionType === 'LEAD_FORM'
                      ? 'border-blue-500 bg-blue-50/20 ring-1 ring-blue-500/30'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm sm:text-base">Interactive Lead Form</div>
                      <div className="text-slate-500 text-xs sm:text-sm mt-0.5">
                        Readers tap the ad and fill out an inquiry form with instant WhatsApp delivery.
                      </div>
                    </div>
                    <div className="pt-0.5">
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        actionType === 'LEAD_FORM' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                      }`}>
                        {actionType === 'LEAD_FORM' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </span>
                    </div>
                  </div>

                  {/* Blue action button when Lead form selected (EXACTLY AS SCREENSHOT) */}
                  {actionType === 'LEAD_FORM' && (
                    <div className="mt-4 pt-3.5 border-t border-slate-200 space-y-2.5 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={handleOpenLeadModal}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-xs transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                        <span>{leadSavedConfig ? 'Edit Lead Form' : 'Configure Lead Form'}</span>
                      </button>

                      {leadSavedConfig && leadSavedConfig.questions.length > 0 && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-800">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>
                              <strong>{leadSavedConfig.questions.length} Question(s)</strong> configured
                              {leadSavedConfig.postSubmitAction === 'WHATSAPP' && ` (WhatsApp: ${leadSavedConfig.whatsappNumber})`}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowLeadPreviewModal(true)}
                            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 4. WhatsApp Number */}
                <div
                  onClick={() => setActionType('WHATSAPP')}
                  className={`p-5 sm:p-6 rounded-2xl border-2 transition cursor-pointer ${
                    actionType === 'WHATSAPP'
                      ? 'border-emerald-500 bg-emerald-50/25 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-extrabold text-slate-900 text-base">My WhatsApp Number</div>
                      <div className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed">
                        Readers tap the ad to immediately start a WhatsApp conversation with your business
                      </div>
                    </div>
                    <div className="pt-0.5">
                      <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        actionType === 'WHATSAPP' ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs' : 'border-slate-300 bg-white'
                      }`}>
                        {actionType === 'WHATSAPP' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic field for WhatsApp with Generous Padding & Contrast */}
                  {actionType === 'WHATSAPP' && (
                    <div className="mt-5 pt-4 border-t border-emerald-200/80 bg-white/90 p-4 sm:p-5 rounded-xl border border-emerald-200/70 shadow-2xs space-y-2 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-600 font-mono font-bold z-10">
                          +91
                        </span>
                        <input
                          type="tel"
                          id="whatsappNumber"
                          required
                          maxLength={10}
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder=" "
                          className="block w-full pl-14 pr-4 py-3.5 text-sm text-slate-900 bg-white rounded-xl border border-slate-300 appearance-none focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 peer font-medium font-mono transition-all"
                        />
                        <label
                          htmlFor="whatsappNumber"
                          className="absolute text-sm text-slate-400 duration-200 transform -translate-y-1/2 top-1/2 z-10 origin-[0] bg-white px-1.5 peer-focus:px-1.5 peer-focus:text-emerald-600 peer-focus:top-0 peer-focus:text-xs peer-focus:font-bold peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-slate-600 start-13 pointer-events-none truncate max-w-[80%]"
                        >
                          WhatsApp Number (10 digits) *
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Call Permission Checkbox with Generous Padding */}
              <div className="mt-6 pt-5 border-t border-slate-200 bg-slate-50/80 p-5 sm:p-6 rounded-2xl border border-slate-200/80 space-y-4">
                <label className="flex items-start gap-3.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowCall}
                    onChange={(e) => setAllowCall(e.target.checked)}
                    className="w-5 h-5 mt-0.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                      Allow readers to call your business directly
                    </span>
                    <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                      A prominent Direct Call button will be displayed on your advertisement banner
                    </p>
                  </div>
                </label>

                {allowCall && (
                  <div className="pt-2 pl-8 space-y-2 animate-fadeIn">
                    <div className="relative max-w-sm">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-mono font-bold z-10">
                        +91
                      </span>
                      <input
                        type="tel"
                        id="callingPhone"
                        maxLength={10}
                        value={callingPhone}
                        onChange={(e) => setCallingPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder=" "
                        className="block w-full pl-14 pr-4 py-3.5 text-sm font-mono text-slate-900 bg-white rounded-xl border border-slate-300 appearance-none focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 peer font-medium transition-all"
                      />
                      <label
                        htmlFor="callingPhone"
                        className="absolute text-sm text-slate-400 duration-200 transform -translate-y-1/2 top-1/2 z-10 origin-[0] bg-white px-1.5 peer-focus:px-1.5 peer-focus:text-red-600 peer-focus:top-0 peer-focus:text-xs peer-focus:font-bold peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-slate-600 start-13 pointer-events-none truncate max-w-[80%]"
                      >
                        Direct Call Phone (10 digits) *
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Form Actions - Proceed Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-[#D80032] hover:bg-red-700 text-white font-extrabold text-base sm:text-lg py-4 rounded-2xl shadow-xl shadow-red-500/25 transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed →</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </main>
      )}

      {/* =========================================================================
          VIEW 3: REVIEW & PAYMENT PAGE (pageView === 'PAYMENT')
          ========================================================================= */}
      {pageView === 'PAYMENT' && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
          {/* Top Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Review Campaign & Make Payment
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
                Select your campaign duration, scan the UPI QR code, and verify your transaction
              </p>
            </div>

            <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-2xl text-xs font-bold self-start sm:self-center shadow-xs">
              <ShieldCheck className="w-4 h-4 text-red-600" />
              <span>Step 2 of 2: Payment & Verification</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (lg:col-span-7): Campaign Duration + Order Summary */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Duration & Budget Selection */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                      1. Choose Campaign Duration & Budget
                    </h3>
                    <p className="text-xs text-slate-500">Select how many days your campaign will run</p>
                  </div>
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                    {selectedDays} Days Selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {dynamicPackages.map((pkg) => {
                    const isSelected = selectedDays === pkg.days;
                    const pkgAdjustedPrice = slotMultiplier === 1.0
                      ? pkg.price
                      : (pkg.price * slotMultiplier < 10
                          ? (pkg.price * slotMultiplier % 1 === 0 ? pkg.price * slotMultiplier : Number((pkg.price * slotMultiplier).toFixed(2)))
                          : Math.round(pkg.price * slotMultiplier));

                    return (
                      <div
                        key={pkg.id || pkg.days}
                        onClick={() => setSelectedDays(pkg.days)}
                        className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition relative flex flex-col justify-between shadow-xs ${
                          isSelected
                            ? 'border-red-600 bg-red-50/30 ring-2 ring-red-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        {pkg.badge && (
                          <span className="absolute -top-2.5 right-3 text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-xs">
                            {pkg.badge}
                          </span>
                        )}
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-500 truncate">{pkg.label}</span>
                            {slotMultiplier !== 1.0 && (
                              <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded shrink-0">
                                {slotMultiplier}x
                              </span>
                            )}
                          </div>
                          <div className="text-2xl font-black text-slate-900 mt-1">₹{pkgAdjustedPrice}</div>
                          {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                            <div className="text-[11px] text-slate-400 line-through">
                              ₹{slotMultiplier !== 1.0 ? Math.round(pkg.originalPrice * slotMultiplier) : pkg.originalPrice}
                            </div>
                          )}
                          <div className="text-[11px] text-emerald-600 font-bold">{pkg.discount || `${pkg.days} Days Pack`}</div>
                        </div>
                        <div className="mt-4 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                          <span className="font-semibold text-slate-600">
                            ₹{pkg.days > 0 ? (pkgAdjustedPrice / pkg.days < 10 ? Number((pkgAdjustedPrice / pkg.days).toFixed(2)) : Math.round(pkgAdjustedPrice / pkg.days)) : 0} / day
                          </span>
                          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            isSelected ? 'border-red-600 bg-red-600 text-white shadow-2xs' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary & Creative Preview Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    2. Campaign Summary
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setPageView('FORM');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Details</span>
                  </button>
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  {/* Creative Thumbnail & Title */}
                  <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    {mediaPreview ? (
                      <div className="w-20 h-16 rounded-xl overflow-hidden bg-black/5 shrink-0 border border-slate-200 flex items-center justify-center">
                        {mediaType === 'VIDEO' ? (
                          <video src={mediaPreview} className="w-full h-full object-cover" />
                        ) : (
                          <img src={mediaPreview} alt="Ad Creative Preview" className="w-full h-full object-cover" />
                        )}
                      </div>
                    ) : (
                      <div className="w-20 h-16 rounded-xl bg-slate-200 shrink-0 flex items-center justify-center text-slate-400">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                        Headline
                      </div>
                      <div className="font-bold text-slate-900 text-sm truncate mt-0.5">
                        {title || 'Untitled Ad'}
                      </div>
                      {description && (
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="text-[11px] font-bold text-slate-400">Placement Slot</div>
                      <div className="font-bold text-slate-900 mt-0.5 truncate">
                        {getSlotDisplayName(selectedSlot)}
                      </div>
                      <div className="mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                          currentSelectedStatus.isOccupied
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        }`}>
                          {currentSelectedStatus.isOccupied ? `⚠️ Active after ${currentSelectedStatus.badgeText}` : '✓ Available Now'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="text-[11px] font-bold text-slate-400">Action Destination</div>
                      <div className="font-bold text-slate-900 mt-0.5 truncate">
                        {actionType === 'WHATSAPP' && `WhatsApp (${whatsappNumber})`}
                        {actionType === 'WEBSITE' && (websiteUrl || 'Website URL')}
                        {actionType === 'SHOP' && (shopUrl || 'Store / Map Link')}
                        {actionType === 'LEAD_FORM' && `Interactive Lead Form (${leadSavedConfig?.questions?.length || 0} Questions)`}
                        {!actionType && 'Not Selected'}
                      </div>
                      {allowCall && callingPhone && (
                        <div className="text-[11px] text-blue-600 font-medium mt-1">
                          + Direct Call: {callingPhone}
                        </div>
                      )}
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="text-[11px] font-bold text-slate-400">Advertiser Contact</div>
                      <div className="font-bold text-slate-900 mt-0.5">{advertiserName}</div>
                      <div className="text-xs text-slate-500 mt-0.5 font-mono">{advertiserPhone}</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="text-[11px] font-bold text-slate-400">Confirmation Email</div>
                      <div className="font-bold text-slate-900 mt-0.5 truncate">{advertiserEmail}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Invoice & receipt recipient</div>
                    </div>
                  </div>

                  {/* Price Calculation Row */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-500">Selected Plan: <strong>{selectedDays} Days Campaign</strong></div>
                      <div className="text-[11px] text-emerald-600 font-bold">
                        {slotMultiplier !== 1.0 ? (
                          <span>Slot Multiplier: {slotMultiplier}x (Base ₹{basePackagePrice})</span>
                        ) : (
                          <span>Standard Slot Rate (1.0x Base)</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {currentPackage.originalPrice && currentPackage.originalPrice > currentPackage.price && (
                        <div className="text-xs text-slate-400 line-through">
                          ₹{slotMultiplier !== 1.0 ? Math.round(currentPackage.originalPrice * slotMultiplier) : currentPackage.originalPrice}
                        </div>
                      )}
                      <div className="text-2xl font-black text-red-600">₹{totalPrice}</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column (lg:col-span-5): UPI QR Code & Payment Verification */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-md space-y-5 sticky top-20">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                      3. Secure UPI Payment
                    </h3>
                    <p className="text-xs text-slate-500">
                      Zero convenience fee via any UPI application
                    </p>
                  </div>
                </div>

                {/* QR Code Container */}
                <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-200 space-y-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Scan With Any UPI App
                  </span>

                  {/* QR Code */}
                  <div className="w-48 h-48 mx-auto bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                        `upi://pay?pa=${dynamicUpiId}&pn=${encodeURIComponent(dynamicPayeeName)}&am=${totalPrice}&cu=INR&tn=AdBooking_${selectedDays}days`
                      )}`}
                      alt="UPI Payment QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="text-xs text-slate-700">
                    Payable Amount: <strong className="text-red-600 font-black text-base">₹{totalPrice}</strong>
                  </div>

                  {/* UPI ID with copy */}
                  <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-mono">
                    <span>{dynamicUpiId}</span>
                    <button
                      type="button"
                      onClick={copyUpiId}
                      className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {dynamicPayeeName && (
                    <div className="text-[10px] text-slate-400 font-medium">
                      Payee: <span className="font-bold text-slate-600">{dynamicPayeeName}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-2.5 pt-1 text-[11px] text-slate-500">
                    <span>PhonePe</span> • <span>Google Pay</span> • <span>Paytm</span> • <span>BHIM</span>
                  </div>
                </div>

                {/* UTR Input Form & Screenshot */}
                <div className="space-y-4 pt-1">
                  <div className="relative">
                    <input
                      type="text"
                      id="utrNumber"
                      required
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      placeholder=" "
                      className="block w-full px-4 py-3.5 text-sm font-mono text-slate-900 bg-white rounded-xl border border-slate-300 appearance-none focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 peer font-medium transition-all"
                    />
                    <label
                      htmlFor="utrNumber"
                      className="absolute text-sm text-slate-400 duration-200 transform -translate-y-1/2 top-1/2 z-10 origin-[0] bg-white px-1.5 peer-focus:px-1.5 peer-focus:text-red-600 peer-focus:top-0 peer-focus:text-xs peer-focus:font-bold peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-slate-600 start-3.5 pointer-events-none truncate max-w-[85%]"
                    >
                      UPI UTR / Reference Number (12 digits) *
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-400 -mt-2 px-1">
                    Enter the 12-digit transaction ID / UTR shown in your UPI app receipt.
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Payment Screenshot (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setPaymentScreenshot(e.target.files[0]);
                        }
                      }}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                    />
                    {paymentScreenshot && (
                      <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                        ✓ {paymentScreenshot.name} selected
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-[#D80032] hover:bg-red-700 disabled:bg-slate-400 text-white font-extrabold text-base py-4 rounded-2xl shadow-xl shadow-red-500/25 transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Submitting Your Ad...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        <span>Submit Ad for Verification →</span>
                      </>
                    )}
                  </button>

                  <div className="text-[11px] text-slate-500 text-center leading-relaxed space-y-1">
                    <p>🔒 100% Verified Ad Portal • Editorial verification within 24 hours.</p>
                    <p>An official invoice will be emailed to <span className="font-semibold text-slate-700">{advertiserEmail}</span>.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* =========================================================================
          MODAL 1: PHONE NUMBER ENTRY MODAL (When clicking "Create Ad" from Landing)
          ========================================================================= */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200">
            <button
              type="button"
              onClick={() => setShowPhoneModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4 shadow-xs">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Enter Your Mobile Number
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Enter your 10-digit mobile number for ad booking, status updates, and support.
            </p>

            <form onSubmit={handleConfirmPhone} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mobile Number *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    autoFocus
                    maxLength={10}
                    value={tempPhone}
                    onChange={(e) => {
                      setTempPhone(e.target.value.replace(/\D/g, ''));
                      setPhoneError('');
                    }}
                    placeholder="9876543210"
                    className="w-full pl-14 pr-4 py-3.5 rounded-xl border border-slate-300 font-mono text-base focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                  />
                </div>
                {phoneError && (
                  <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{phoneError}</span>
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm py-3.5 rounded-xl shadow-md transition active:scale-95 cursor-pointer"
                >
                  Continue to Ad Studio →
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                🔒 Your mobile number is secure and only used for your advertising campaign.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: LEAD FORM BUILDER (Clean slate 0 questions initially)
          ========================================================================= */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#F8F9FE] rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200/80 mb-5">
              <button
                type="button"
                onClick={() => setShowLeadModal(false)}
                className="p-1 rounded-lg text-slate-700 hover:bg-slate-200 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Configure Lead Form
              </h3>
            </div>

            <div className="space-y-6">
              {/* Section 1: Form Details */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-3">
                  1. Form Fields:
                </h4>

                {/* If NO questions yet: Show purple lightbulb banner */}
                {leadQuestions.length === 0 ? (
                  <div className="bg-[#EAE8FE] rounded-2xl p-6 text-center text-[#5540D9] space-y-2 mb-4">
                    <div className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center mx-auto text-[#6C5CE7]">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <p className="text-xs sm:text-sm font-medium leading-relaxed">
                      Add question fields for readers to answer by clicking the button below.
                    </p>
                  </div>
                ) : (
                  /* Render Question Cards */
                  <div className="space-y-4 mb-4">
                    {leadQuestions.map((q, idx) => (
                      <div
                        key={q.id}
                        className={`bg-white rounded-2xl p-4 sm:p-5 shadow-xs border relative border-l-4 ${
                          q.error ? 'border-l-red-500 border-slate-200' : 'border-l-[#6C5CE7] border-slate-200'
                        }`}
                      >
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                          QUESTION #{idx + 1}
                        </div>

                        {/* Question label input */}
                        <div className="mb-3">
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Question Label *
                          </label>
                          <input
                            type="text"
                            value={q.label}
                            onChange={(e) => handleUpdateLeadQuestion(q.id, { label: e.target.value })}
                            placeholder="Enter question... (e.g. Your Name, City, Product Model)"
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-hidden ${
                              q.error
                                ? 'border-red-400 bg-red-50/20 focus:ring-2 focus:ring-red-400'
                                : 'border-slate-300 focus:ring-2 focus:ring-[#6C5CE7]'
                            }`}
                          />
                          {q.error && (
                            <div className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{q.error}</span>
                            </div>
                          )}
                        </div>

                        {/* Response type dropdown */}
                        <div className="mb-4">
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Response Type
                          </label>
                          <select
                            value={q.type}
                            onChange={(e) => handleUpdateLeadQuestion(q.id, { type: e.target.value as any })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-[#6C5CE7] focus:outline-hidden"
                          >
                            <option value="SHORT_TEXT">Short text (Name, City, Model, etc.)</option>
                            <option value="PHONE">Phone Number (10 digits)</option>
                            <option value="LONG_TEXT">Long text (Description / Address)</option>
                          </select>
                        </div>

                        {/* Bottom row: Required checkbox & actions */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                            <input
                              type="checkbox"
                              checked={q.required}
                              onChange={(e) => handleUpdateLeadQuestion(q.id, { required: e.target.checked })}
                              className="w-4 h-4 text-[#6C5CE7] rounded border-slate-300 focus:ring-[#6C5CE7]"
                            />
                            <span>Required Field</span>
                          </label>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleRemoveLeadQuestion(q.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg border border-red-200 transition"
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowLeadPreviewModal(true)}
                              className="bg-[#00A86B] hover:bg-[#008f5b] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                            >
                              Preview
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Button: + Add Form Field */}
                <button
                  type="button"
                  onClick={handleAddLeadQuestion}
                  className="w-full bg-[#6C5CE7] hover:bg-[#5a48e0] text-white font-bold text-sm py-3 rounded-xl shadow-xs transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Form Field</span>
                </button>
              </div>

              {/* Section 2: After Form Submission */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-3">
                  2. After Form Submission:
                </h4>

                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 border-l-4 border-l-[#6C5CE7] space-y-4">
                  <div className="text-xs sm:text-sm font-bold text-slate-800">
                    Where should inquiry data be delivered?
                  </div>

                  {/* Option 1: WhatsApp */}
                  <div>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="postAction"
                        checked={leadPostSubmitAction === 'WHATSAPP'}
                        onChange={() => setLeadPostSubmitAction('WHATSAPP')}
                        className="w-4 h-4 text-[#6C5CE7] focus:ring-[#6C5CE7]"
                      />
                      <span className="text-xs sm:text-sm font-semibold text-slate-800">
                        Send directly to WhatsApp
                      </span>
                    </label>

                    {leadPostSubmitAction === 'WHATSAPP' && (
                      <div className="mt-2.5 pl-6">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          WhatsApp Number
                        </label>
                        <input
                          type="tel"
                          maxLength={10}
                          value={leadWhatsappNumber}
                          onChange={(e) => setLeadWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 9876543210"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-[#6C5CE7] focus:outline-hidden"
                        />
                      </div>
                    )}
                  </div>

                  {/* Option 2: Thank you page */}
                  <div>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="postAction"
                        checked={leadPostSubmitAction === 'THANK_YOU'}
                        onChange={() => setLeadPostSubmitAction('THANK_YOU')}
                        className="w-4 h-4 text-[#6C5CE7] focus:ring-[#6C5CE7]"
                      />
                      <span className="text-xs sm:text-sm font-semibold text-slate-800">
                        Show Thank You Message
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 3: Save Form Configuration */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-3">
                  3. Save Form Configuration:
                </h4>

                {leadModalGlobalError && (
                  <div className="mb-3 text-xs text-red-600 font-bold bg-red-50 p-2.5 rounded-xl border border-red-200 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{leadModalGlobalError}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSaveLeadForm}
                  className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-base py-3.5 rounded-xl shadow-md transition active:scale-98 cursor-pointer"
                >
                  Save Form
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: LEAD FORM PUBLIC PREVIEW MODAL
          ========================================================================= */}
      {showLeadPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200">
            <button
              type="button"
              onClick={() => setShowLeadPreviewModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-4 border-b border-slate-100">
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase">
                Live Reader Preview
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">Inquiry Form</h3>
              <p className="text-xs text-slate-500">This is how readers will see your form upon tapping the ad</p>
            </div>

            <div className="mt-4 space-y-3 max-h-72 overflow-y-auto">
              {leadQuestions.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-6">
                  No fields added yet
                </div>
              ) : (
                leadQuestions.map((q, idx) => (
                  <div key={q.id}>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {q.label || `Question #${idx + 1}`} {q.required && <span className="text-red-500">*</span>}
                    </label>
                    {q.type === 'LONG_TEXT' ? (
                      <textarea
                        rows={2}
                        disabled
                        placeholder="Enter answer..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50"
                      />
                    ) : (
                      <input
                        type={q.type === 'PHONE' ? 'tel' : 'text'}
                        disabled
                        placeholder={q.type === 'PHONE' ? '10-digit phone number' : 'Enter answer...'}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50"
                      />
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowLeadPreviewModal(false)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: SUBMISSION SUCCESS NOTIFICATION
          ========================================================================= */}
      {submissionSuccess && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-center space-y-4 border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Ad Submitted Successfully! 🎉
            </h3>

            <p className="text-slate-600 text-sm leading-relaxed">
              Thank you <strong>{advertiserName}</strong>! Your ad submission and payment reference (UTR: {utrNumber}) have been received.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs text-slate-600 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Order Reference:</span>
                <span className="font-mono font-bold text-slate-900">{submissionSuccess?.id || 'SUBMITTED'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duration:</span>
                <span className="font-bold text-slate-900">{selectedDays} Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Amount:</span>
                <span className="font-bold text-emerald-600">₹{totalPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-amber-600">Under Review</span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Once payment is verified by our editorial team, your campaign will go live and confirmation will be sent to <span className="font-semibold text-slate-700">{advertiserEmail}</span>.
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-3 rounded-xl transition"
              >
                Go to Homepage
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSubmissionSuccess(null);
                  setPageView('LANDING');
                }}
                className="w-full text-xs font-semibold text-slate-500 hover:text-slate-700 py-2 cursor-pointer"
              >
                Create Another Ad
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CUSTOM UI MODAL: SLOT OCCUPIED / ADVANCE RESERVATION NOTICE
          ========================================================================= */}
      {showSlotOccupiedModal && (() => {
        const slotStatus = getSlotStatus(selectedSlot);
        const slotName = getSlotDisplayName(selectedSlot);

        return (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in-95">
              <button
                type="button"
                onClick={() => setShowSlotOccupiedModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
                <Clock className="w-8 h-8 stroke-[2.2]" />
              </div>

              <div>
                <span className="inline-flex items-center space-x-1 text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-100/80 border border-amber-200 px-2.5 py-0.5 rounded-full mb-1.5">
                  Slot Currently Active
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Advance Reservation Notice
                </h3>
              </div>

              <div className="bg-gradient-to-br from-amber-50/70 via-orange-50/30 to-slate-50 border border-amber-200 rounded-2xl p-4 text-left space-y-2.5 shadow-2xs">
                <div className="flex items-start justify-between gap-2 border-b border-amber-200/60 pb-2.5">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Selected Slot</span>
                    <div className="font-bold text-slate-900 text-xs sm:text-sm">{slotName}</div>
                  </div>
                  {slotStatus.formattedDate && (
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-extrabold uppercase text-amber-600">Booked Until</span>
                      <div className="font-mono font-bold text-xs text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                        {slotStatus.formattedDate}
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Notice: The slot <strong className="text-slate-900">&apos;{slotName}&apos;</strong> is currently booked {slotStatus.formattedDate ? `until ${slotStatus.formattedDate}` : 'by an active advertiser'}.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  If you book now, your slot will be reserved and activated immediately after that date.
                </p>
              </div>

              <p className="text-xs text-slate-700 font-bold">
                Do you want to proceed to payment?
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSlotOccupiedModal(false)}
                  className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmSlotAndProceed}
                  className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <span>OK / Proceed</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-200">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center space-x-2 text-xs font-bold ${
            toastMessage.type === 'error'
              ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-rose-500/10'
              : toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-500/10'
              : 'bg-slate-900 text-white border-slate-800 shadow-slate-900/10'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0 text-current" />
            <span>{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-current opacity-60 hover:opacity-100 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
