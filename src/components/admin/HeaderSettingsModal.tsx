'use client';

import React, { useState, useEffect } from 'react';
import { EPaperHeaderConfig } from '@/types/epaper';
import {
  HEADER_COLOR_PALETTES,
  getEffectiveHeaderConfig
} from '@/utils/epaperHeader';
import BroadsheetHeader from '@/components/common/BroadsheetHeader';
import {
  X, Check, Sparkles, SlidersHorizontal, Palette, Type,
  Layers, Newspaper, Edit3, Minus, Plus, MoveVertical
} from 'lucide-react';

interface HeaderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: {
    id: string;
    pageNumber: number;
    title: string;
    headerConfig?: EPaperHeaderConfig;
  };
  totalPagesCount: number;
  editionCity: string;
  dateStr: string;
  onSaveHeader: (config: EPaperHeaderConfig, applyToAllInsidePages?: boolean) => void;
  availableEditions?: { id: string; name: string; city: string }[];
}

export const HeaderSettingsModal: React.FC<HeaderSettingsModalProps> = ({
  isOpen,
  onClose,
  currentPage,
  totalPagesCount,
  editionCity,
  dateStr,
  onSaveHeader
}) => {
  const initialEffective = getEffectiveHeaderConfig(currentPage, editionCity, dateStr);

  // 2 Core Options: 'default' (Official Broadsheet Headmaster) vs 'custom' (Type Yourself in Hindi/English)
  const [headerMode, setHeaderMode] = useState<'default' | 'custom'>(
    initialEffective.mode || (initialEffective.headerType === 'masthead' ? 'default' : 'custom')
  );

  // Core title input (English or Hindi typed directly by user)
  const [headerTitle, setHeaderTitle] = useState<string>(initialEffective.title || initialEffective.titleMain || '');
  const [twoToneTitle, setTwoToneTitle] = useState<boolean>(initialEffective.twoToneTitle ?? true);

  // Colors
  const [titleColorMain, setTitleColorMain] = useState<string>(initialEffective.titleColorMain || '#c51c24');
  const [titleColorPrefix, setTitleColorPrefix] = useState<string>(initialEffective.titleColorPrefix || '#475569');
  const [borderColor, setBorderColor] = useState<string>(initialEffective.borderColor || '#c51c24');
  const [bgColor, setBgColor] = useState<string>(initialEffective.bgColor || '#ffffff');

  // Dimensions & Sizing
  const [titleFontSize, setTitleFontSize] = useState<number>(initialEffective.titleFontSize || 38);
  const [borderWidth, setBorderWidth] = useState<number>(initialEffective.borderWidth || 2.5);
  const [borderStyle, setBorderStyle] = useState<'single' | 'double'>(initialEffective.borderStyle || 'single');
  const [height, setHeight] = useState<number>(initialEffective.height || 56);
  const [bottomMargin, setBottomMargin] = useState<number>(initialEffective.bottomMargin || 18);

  // Metadata
  const [cityText, setCityText] = useState<string>(editionCity || initialEffective.cityText || 'पटना');
  const [dayText, setDayText] = useState<string>(initialEffective.dayText || '');
  const [dateText, setDateText] = useState<string>(initialEffective.dateText || '');
  const [pageBadgeText, setPageBadgeText] = useState<string>(initialEffective.pageBadgeText || String(currentPage.pageNumber).padStart(2, '0'));
  const [pageBadgeBg, setPageBadgeBg] = useState<string>(initialEffective.pageBadgeBg || '#1e293b');
  const [pageBadgeColor, setPageBadgeColor] = useState<string>(initialEffective.pageBadgeColor || '#ffffff');
  const [subWebsiteText, setSubWebsiteText] = useState<string>(initialEffective.subWebsiteText || 'www.vartiq.com');
  const [showLogo, setShowLogo] = useState<boolean>(initialEffective.showLogo !== undefined ? initialEffective.showLogo : true);

  const [applyToAllInsidePages, setApplyToAllInsidePages] = useState<boolean>(false);

  // Reset form when active page changes or modal opens
  useEffect(() => {
    if (isOpen) {
      const eff = getEffectiveHeaderConfig(currentPage, editionCity, dateStr);
      const m = eff.mode || (eff.headerType === 'masthead' ? 'default' : 'custom');
      setHeaderMode(m);
      setHeaderTitle(eff.title || `${eff.titlePrefix} ${eff.titleMain}`.trim() || `अपना ${editionCity || 'पटना'}`);
      setTwoToneTitle(eff.twoToneTitle ?? true);
      setTitleColorMain(eff.titleColorMain || '#c51c24');
      setTitleColorPrefix(eff.titleColorPrefix || '#475569');
      setTitleFontSize(eff.titleFontSize || 38);
      setBgColor(eff.bgColor || '#ffffff');
      setBorderColor(eff.borderColor || (m === 'default' ? '#0f172a' : '#c51c24'));
      setBorderWidth(eff.borderWidth || (m === 'default' ? 3.5 : 2.5));
      setBorderStyle(eff.borderStyle || (m === 'default' ? 'double' : 'single'));
      setHeight(eff.height || (m === 'default' ? 168 : 56));
      setBottomMargin(eff.bottomMargin || 18);
      setCityText(editionCity || eff.cityText || 'पटना');
      setDayText(eff.dayText || '');
      setDateText(eff.dateText || '');
      setPageBadgeBg(eff.pageBadgeBg || '#1e293b');
      setPageBadgeColor(eff.pageBadgeColor || '#ffffff');
      setPageBadgeText(eff.pageBadgeText || String(currentPage.pageNumber).padStart(2, '0'));
      setShowLogo(eff.showLogo !== undefined ? eff.showLogo : true);
      setSubWebsiteText(eff.subWebsiteText || 'www.vartiq.com');
      setApplyToAllInsidePages(false);
    }
  }, [isOpen, currentPage.id, currentPage.pageNumber, currentPage.headerConfig, editionCity, dateStr]);

  if (!isOpen) return null;

  // Derive prefix and main for live preview
  let derivedPrefix = '';
  let derivedMain = headerTitle.trim();
  if (twoToneTitle && headerTitle.trim().includes(' ')) {
    const spaceIdx = headerTitle.trim().indexOf(' ');
    derivedPrefix = headerTitle.trim().substring(0, spaceIdx);
    derivedMain = headerTitle.trim().substring(spaceIdx + 1);
  }

  const minHeight = headerMode === 'default' ? 120 : 36;
  const maxHeight = headerMode === 'default' ? 240 : 120;
  const effectiveHeaderType = headerMode === 'default' ? 'masthead' : 'section';
  const effectiveHeight = headerMode === 'default'
    ? (height < 120 ? 168 : Math.min(240, height))
    : (height > 120 ? 56 : Math.max(36, height));
  const effectiveBottomMargin = bottomMargin;

  // Active form configuration object for live preview
  const previewConfig: EPaperHeaderConfig = headerMode === 'default'
    ? {
        mode: 'default',
        headerType: 'masthead',
        title: 'वार्तिक',
        twoToneTitle: false,
        titlePrefix: '',
        titleMain: 'वार्तिक',
        titleColor: titleColorMain || '#c51c24',
        titleColorPrefix: '#475569',
        titleColorMain: titleColorMain || '#c51c24',
        titleFontSize: 88,
        bgColor: '#ffffff',
        borderColor: borderColor || '#0f172a',
        borderWidth: borderWidth || 3.5,
        borderStyle: borderStyle || 'double',
        height: effectiveHeight,
        bottomMargin: effectiveBottomMargin,
        cityText: editionCity || cityText || 'पटना',
        dayText,
        dateText,
        temperatureText: '', // Empty means BroadsheetHeader automatically live-fetches from Weather API
        pageBadgeBg: '#1e293b',
        pageBadgeColor: '#ffffff',
        pageBadgeText: String(currentPage.pageNumber).padStart(2, '0'),
        showLogo: true,
        subWebsiteText: 'www.vartiq.com'
      }
    : {
        mode: 'custom',
        headerType: 'section',
        title: headerTitle.trim() || `अपना ${editionCity || cityText || 'पटना'}`,
        twoToneTitle,
        titlePrefix: derivedPrefix,
        titleMain: derivedMain || headerTitle.trim(),
        titleColor: titleColorMain,
        titleColorPrefix,
        titleColorMain,
        titleFontSize,
        bgColor,
        borderColor,
        borderWidth,
        borderStyle,
        height: effectiveHeight,
        bottomMargin,
        cityText: editionCity || cityText || 'पटना',
        dayText,
        dateText,
        temperatureText: '',
        pageBadgeBg: pageBadgeBg || '#1e293b',
        pageBadgeColor: pageBadgeColor || '#ffffff',
        pageBadgeText,
        showLogo,
        subWebsiteText
      };

  const QUICK_SUGGESTIONS = [
    { label: 'City Bulletin', value: `CITY BULLETIN • ${editionCity || cityText || 'PATNA'}` },
    { label: 'SPORTS NEWS', value: 'SPORTS NEWS' },
    { label: 'EDITORIAL DESK', value: 'EDITORIAL DESK' },
    { label: 'BUSINESS & MARKET', value: 'BUSINESS & MARKET' },
    { label: 'NATION & WORLD', value: 'NATION & WORLD' },
    { label: 'ENTERTAINMENT', value: 'ENTERTAINMENT & CINEMA' },
    { label: 'SPECIAL REPORT', value: 'SPECIAL REPORT' },
    { label: 'खेल जगत', value: 'खेल जगत' }
  ];

  const handleSave = () => {
    // Keep temperatureText empty so it always dynamically fetches live weather for the selected city and date
    onSaveHeader({
      ...previewConfig,
      temperatureText: '',
      cityText: editionCity || cityText || 'पटना'
    }, applyToAllInsidePages);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden text-slate-800">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-400">
              <SlidersHorizontal className="w-4 h-4 text-red-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm sm:text-base text-white tracking-wide">
                  Header Designer
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-red-600 text-white">
                  Page {currentPage.pageNumber}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans">
                Choose official master masthead or customize page header title
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LIVE REAL-TIME PREVIEW BOX */}
        <div className="px-5 pt-3.5 pb-2.5 bg-slate-100 border-b border-slate-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Live Header Preview:</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Mode: <strong className="text-slate-800">{headerMode === 'default' ? 'Master Masthead' : 'Custom Section Title'}</strong> • Height: <strong className="text-blue-600 font-bold">{effectiveHeight}px</strong>
            </span>
          </div>

          {/* Miniature Paper Header Preview */}
          <div className="bg-white rounded-lg shadow-xs border border-slate-300 px-1 py-1 overflow-x-auto overflow-y-hidden">
            <div className="w-full min-w-[720px]">
              <BroadsheetHeader
                page={{
                  pageNumber: currentPage.pageNumber,
                  headerConfig: previewConfig
                }}
                editionCity={editionCity}
                dateStr={dateStr}
              />
            </div>
          </div>
        </div>

        {/* MAIN BODY CONTROLS */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">

          {/* 🌟 PROMINENT HEIGHT INCREASE / DECREASE TOOLBAR (ACTIVE IN BOTH OPTION 1 & OPTION 2) */}
          <div className="bg-gradient-to-r from-blue-50/95 via-indigo-50/40 to-blue-50/95 p-3.5 rounded-xl border border-blue-200/90 shadow-2xs space-y-2.5">
            {/* Top Row: Title on Left, Stepper Controls (- / +) on Right */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <MoveVertical className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 tracking-wide">
                    📐 Header Height Toolbar:
                  </span>
                  <span className="text-[11px] text-slate-500 ml-1.5 hidden sm:inline">
                    {headerMode === 'default' ? '(Standard Masthead Range: 120px - 240px)' : '(Custom Header Range: 36px - 120px)'}
                  </span>
                </div>
              </div>

              {/* Stepper Buttons (- / +) and Exact PX Badge */}
              <div className="flex items-center space-x-1 bg-white px-2 py-0.5 rounded-lg border border-slate-300 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setHeight((prev) => Math.max(minHeight, (prev || effectiveHeight) - 2))}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer border border-slate-200 active:scale-95"
                  title="Decrease height by 2px"
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>Decrease</span>
                </button>

                <div className="px-3 py-0.5 text-center min-w-[64px]">
                  <span className="font-mono font-black text-sm text-blue-700">
                    {effectiveHeight}px
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setHeight((prev) => Math.min(maxHeight, (prev || effectiveHeight) + 2))}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 text-slate-700 text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer border border-slate-200 active:scale-95"
                  title="Increase height by 2px"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Increase</span>
                </button>
              </div>
            </div>

            {/* Middle Row: FULL-WIDTH EXTENDED BLUE SLIDER LINE (Spans left to right with small padding) */}
            <div className="w-full px-2 pt-1 pb-0.5">
              <div className="flex items-center gap-3 w-full">
                <span className="text-[11px] font-mono font-bold text-slate-500 shrink-0">
                  {minHeight}px
                </span>
                <div className="flex-1 relative flex items-center">
                  <input
                    type="range"
                    min={minHeight}
                    max={maxHeight}
                    value={effectiveHeight}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-2.5 bg-blue-100 hover:bg-blue-200/70 rounded-lg transition-all"
                  />
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-500 shrink-0">
                  {maxHeight}px
                </span>
              </div>
            </div>

            {/* Bottom Row: Quick Presets */}
            <div className="flex items-center justify-between gap-2 pt-1 px-1 border-t border-blue-200/70">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10.5px] font-bold text-slate-600">Presets:</span>
                {(headerMode === 'default'
                  ? [
                      { label: '140px (Compact)', val: 140 },
                      { label: '168px (Standard)', val: 168 },
                      { label: '190px (Large)', val: 190 },
                      { label: '215px (Grand)', val: 215 }
                    ]
                  : [
                      { label: '44px (Slim)', val: 44 },
                      { label: '56px (Standard)', val: 56 },
                      { label: '70px (Medium)', val: 70 },
                      { label: '88px (Large)', val: 88 },
                      { label: '105px (Grand)', val: 105 }
                    ]
                ).map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setHeight(preset.val)}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold border transition-all cursor-pointer ${
                      effectiveHeight === preset.val
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-500 font-medium hidden md:inline">
                Drag slider or use - / + buttons to adjust height
              </span>
            </div>
          </div>

          {/* 🌟 2-OPTION MODE SELECTOR: HEADMASTER VS CUSTOM TYPING */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-300/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2 px-0.5">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-1.5">
                <span>🎯 Choose Header Style:</span>
              </label>
              <span className="text-[11px] text-slate-500">
                (Select the header layout for this page)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Option 1: Official Standard Headmaster */}
              <button
                type="button"
                onClick={() => {
                  setHeaderMode('default');
                  if (height < 120) setHeight(168);
                  setBorderColor('#0f172a');
                  setBorderWidth(3.5);
                  setBorderStyle('double');
                }}
                className={`p-3.5 rounded-xl border-2 text-left flex items-start space-x-3 transition-all cursor-pointer ${
                  headerMode === 'default'
                    ? 'bg-red-50/50 border-red-600 shadow-sm ring-2 ring-red-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                  headerMode === 'default' ? 'border-red-600 bg-red-600' : 'border-slate-400'
                }`}>
                  {headerMode === 'default' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <Newspaper className="w-4 h-4 text-red-600" />
                    <span>Option 1: Master Masthead</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Official Vartiq logo, tagline, auto weather &amp; edition info (no typing needed, full authentic newspaper layout).
                  </div>
                </div>
              </button>

              {/* Option 2: Custom / Type Yourself */}
              <button
                type="button"
                onClick={() => {
                  setHeaderMode('custom');
                  if (height > 120) setHeight(56);
                  setBorderColor('#c51c24');
                  setBorderWidth(2.5);
                  setBorderStyle('single');
                }}
                className={`p-3.5 rounded-xl border-2 text-left flex items-start space-x-3 transition-all cursor-pointer ${
                  headerMode === 'custom'
                    ? 'bg-red-50/50 border-red-600 shadow-sm ring-2 ring-red-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                  headerMode === 'custom' ? 'border-red-600 bg-red-600' : 'border-slate-400'
                }`}>
                  {headerMode === 'custom' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <Edit3 className="w-4 h-4 text-red-600" />
                    <span>Option 2: Custom Title (Type Any Text)</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Type your own section title (e.g. CITY BULLETIN, SPORTS NEWS, EDITORIAL, SPECIAL REPORT).
                  </div>
                </div>
              </button>

            </div>
          </div>
          {/* IF OPTION 1 (STANDARD HEADMASTER): COLOR, HEIGHT, BORDER & MARGIN CONTROLS (NO TYPING REQUIRED) */}
          {headerMode === 'default' && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 flex items-center space-x-2 text-xs text-amber-900">
                <Newspaper className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Master Masthead:</strong> Authentic newspaper header with official <strong>&quot;वार्तिक&quot;</strong> branding. Customize theme color, height, and border styling below:
                </span>
              </div>

              {/* 2-Column Controls for Standard Headmaster Customization */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Left Column: Theme Color & Headmaster Height */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3.5">
                  <div className="flex items-center space-x-1.5 border-b border-slate-100 pb-2">
                    <Palette className="w-4 h-4 text-red-600" />
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                      Theme Color & Height
                    </span>
                  </div>

                  {/* Theme Color Picker */}
                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1.5">
                      Masthead Accent Color (Logo accent, curved brackets & lines)
                    </label>
                    <div className="flex items-center space-x-2 mb-1.5">
                      <input
                        type="color"
                        value={titleColorMain}
                        onChange={(e) => setTitleColorMain(e.target.value)}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={titleColorMain}
                        onChange={(e) => setTitleColorMain(e.target.value)}
                        className="w-24 px-2 py-1 text-xs font-mono border border-slate-300 rounded font-bold"
                      />
                      <div className="flex gap-1.5">
                        {['#c51c24', '#1d4ed8', '#0f172a', '#991b1b', '#047857', '#b45309', '#7e22ce'].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setTitleColorMain(c)}
                            className={`w-6 h-6 rounded-md border shadow-2xs hover:scale-110 transition-transform cursor-pointer ${titleColorMain === c ? 'ring-2 ring-red-500' : ''}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Automatic City & Live Weather Notice */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                    <span className="flex items-center gap-1.5 font-sans">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Edition City: <strong className="text-slate-900">{editionCity || 'पटना'}</strong></span>
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                      ⚡ Auto Live Weather via API
                    </span>
                  </div>

                  {/* Headmaster Height Slider & Stepper */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700 text-[11px] flex items-center space-x-1">
                        <MoveVertical className="w-3.5 h-3.5 text-blue-600" />
                        <span>Masthead Height</span>
                      </label>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => setHeight((prev) => Math.max(120, (prev || 168) - 2))}
                          className="w-5 h-5 rounded bg-white hover:bg-red-50 hover:text-red-600 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-300 cursor-pointer shadow-2xs"
                          title="Decrease height (-2px)"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">
                          {effectiveHeight}px
                        </span>
                        <button
                          type="button"
                          onClick={() => setHeight((prev) => Math.min(240, (prev || 168) + 2))}
                          className="w-5 h-5 rounded bg-white hover:bg-emerald-50 hover:text-emerald-600 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-300 cursor-pointer shadow-2xs"
                          title="Increase height (+2px)"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={120}
                      max={240}
                      value={effectiveHeight}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      {[
                        { label: 'Compact (140)', val: 140 },
                        { label: 'Standard (168)', val: 168 },
                        { label: 'Large (190)', val: 190 },
                        { label: 'Grand (215)', val: 215 }
                      ].map((p) => (
                        <button
                          key={p.val}
                          type="button"
                          onClick={() => setHeight(p.val)}
                          className={`hover:text-blue-600 cursor-pointer ${effectiveHeight === p.val ? 'font-bold text-blue-600 underline' : ''}`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right Column: Border Line Settings */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3.5">
                  <div className="flex items-center space-x-1.5 border-b border-slate-100 pb-2">
                    <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                      Border Line Settings
                    </span>
                  </div>

                  {/* Border Line Color */}
                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1.5">
                      Border Line Color
                    </label>
                    <div className="flex items-center space-x-2 mb-1.5">
                      <input
                        type="color"
                        value={borderColor}
                        onChange={(e) => setBorderColor(e.target.value)}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={borderColor}
                        onChange={(e) => setBorderColor(e.target.value)}
                        className="w-24 px-2 py-1 text-xs font-mono border border-slate-300 rounded font-bold"
                      />
                      <div className="flex gap-1.5">
                        {['#0f172a', '#c51c24', '#1d4ed8', '#475569', '#b45309', '#047857'].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setBorderColor(c)}
                            className={`w-6 h-6 rounded-md border shadow-2xs hover:scale-110 transition-transform cursor-pointer ${borderColor === c ? 'ring-2 ring-red-500' : ''}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Border Thickness & Style */}
                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1.5">
                      Border Thickness & Style
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1 flex-1">
                        {[2, 2.5, 3, 3.5, 4].map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => setBorderWidth(w)}
                            className={`flex-1 py-1 rounded text-xs font-mono font-bold border transition-all cursor-pointer ${borderWidth === w ? 'border-red-600 bg-red-600 text-white shadow-xs' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
                          >
                            {w}px
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setBorderStyle('double')}
                          className={`px-2 py-1 rounded text-xs font-bold border transition-all cursor-pointer ${borderStyle === 'double' ? 'border-red-600 bg-red-600 text-white' : 'border-slate-300 bg-white text-slate-700'}`}
                        >
                          Double
                        </button>
                        <button
                          type="button"
                          onClick={() => setBorderStyle('single')}
                          className={`px-2 py-1 rounded text-xs font-bold border transition-all cursor-pointer ${borderStyle === 'single' ? 'border-red-600 bg-red-600 text-white' : 'border-slate-300 bg-white text-slate-700'}`}
                        >
                          Single
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* IF OPTION 2 (CUSTOM TYPING): ONLY SHOW CUSTOM TITLE INPUT & CUSTOM CONTROLS */}
          {headerMode === 'custom' && (
            <div className="space-y-4 animate-fade-in">
              {/* Custom Title Input */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-1.5">
                    <Type className="w-4 h-4 text-red-600" />
                    <span>✍️ Header Title:</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    (Type in English or any language)
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <input
                    type="text"
                    value={headerTitle}
                    onChange={(e) => setHeaderTitle(e.target.value)}
                    placeholder="Enter section title (e.g. CITY BULLETIN, SPORTS NEWS, EDITORIAL, SPECIAL REPORT)..."
                    className="flex-1 px-4 py-2.5 rounded-lg border-2 border-red-500/80 focus:border-red-600 focus:ring-3 focus:ring-red-500/20 text-sm font-bold font-sans text-slate-900 shadow-xs bg-white"
                    autoFocus
                  />
                </div>

                {/* Quick Suggestion Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-500 mr-1">Quick Suggestions:</span>
                  {QUICK_SUGGESTIONS.map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => setHeaderTitle(chip.value)}
                      className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white hover:bg-red-50 border border-slate-300 hover:border-red-400 text-slate-700 hover:text-red-600 transition-colors cursor-pointer shadow-2xs"
                    >
                      + {chip.label}
                    </button>
                  ))}
                </div>

                {/* Two-Tone Title Checkbox */}
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={twoToneTitle}
                      onChange={(e) => setTwoToneTitle(e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      Two-Tone Title (Highlight first word in secondary accent color, e.g. &quot;CITY&quot; gray + &quot;BULLETIN&quot; red)
                    </span>
                  </label>
                </div>
              </div>

              {/* Custom Colors & Sizing Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Left: Custom Title Color & Font Size */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3.5">
                  <div className="flex items-center space-x-1.5 border-b border-slate-100 pb-2">
                    <Palette className="w-4 h-4 text-red-600" />
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                      Title Color & Font Size
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1.5">
                      Title Color
                    </label>
                    <div className="flex items-center space-x-2 mb-1.5">
                      <input
                        type="color"
                        value={titleColorMain}
                        onChange={(e) => setTitleColorMain(e.target.value)}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={titleColorMain}
                        onChange={(e) => setTitleColorMain(e.target.value)}
                        className="w-24 px-2 py-1 text-xs font-mono border border-slate-300 rounded font-bold"
                      />
                      <div className="flex gap-1.5">
                        {['#c51c24', '#1d4ed8', '#0f172a', '#047857', '#b45309', '#7e22ce'].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setTitleColorMain(c)}
                            className={`w-6 h-6 rounded-md border shadow-2xs hover:scale-110 transition-transform cursor-pointer ${titleColorMain === c ? 'ring-2 ring-red-500' : ''}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {twoToneTitle && headerTitle.includes(' ') && (
                    <div className="pt-2 border-t border-slate-100">
                      <label className="block font-bold text-slate-700 text-[11px] mb-1.5">
                        First Word Color (Secondary Accent)
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={titleColorPrefix}
                          onChange={(e) => setTitleColorPrefix(e.target.value)}
                          className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={titleColorPrefix}
                          onChange={(e) => setTitleColorPrefix(e.target.value)}
                          className="w-24 px-2 py-1 text-xs font-mono border border-slate-300 rounded font-bold"
                        />
                        <div className="flex gap-1.5">
                          {['#475569', '#0f172a', '#1e3a8a', '#991b1b', '#065f46'].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setTitleColorPrefix(c)}
                              className={`w-6 h-6 rounded-md border shadow-2xs hover:scale-110 transition-transform cursor-pointer ${titleColorPrefix === c ? 'ring-2 ring-slate-700' : ''}`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700 text-[11px]">
                        Title Font Size
                      </label>
                      <span className="font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                        {titleFontSize}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={22}
                      max={60}
                      value={titleFontSize}
                      onChange={(e) => setTitleFontSize(Number(e.target.value))}
                      className="w-full accent-red-600 cursor-pointer"
                    />
                  </div>

                </div>

                {/* Right: Border & Height Settings */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3.5">
                  <div className="flex items-center space-x-1.5 border-b border-slate-100 pb-2">
                    <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                      Border Line &amp; Height
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1.5">
                      Border Line Color
                    </label>
                    <div className="flex items-center space-x-2 mb-1.5">
                      <input
                        type="color"
                        value={borderColor}
                        onChange={(e) => setBorderColor(e.target.value)}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={borderColor}
                        onChange={(e) => setBorderColor(e.target.value)}
                        className="w-24 px-2 py-1 text-xs font-mono border border-slate-300 rounded font-bold"
                      />
                      <div className="flex gap-1.5">
                        {['#c51c24', '#0f172a', '#1d4ed8', '#b45309', '#047857', '#94a3b8'].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setBorderColor(c)}
                            className={`w-6 h-6 rounded-md border shadow-2xs hover:scale-110 transition-transform cursor-pointer ${borderColor === c ? 'ring-2 ring-red-500' : ''}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1.5">
                      Border Thickness
                    </label>
                    <div className="flex gap-2">
                      {[1, 1.5, 2, 2.5, 3, 4].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setBorderWidth(w)}
                          className={`flex-1 py-1 rounded text-xs font-mono font-bold border transition-all cursor-pointer ${borderWidth === w ? 'border-red-600 bg-red-600 text-white shadow-xs' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
                        >
                          {w}px
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Option 2: Header Height Control */}
                  <div className="pt-2 border-t border-slate-100 bg-blue-50/60 p-2.5 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1">
                        <MoveVertical className="w-3.5 h-3.5 text-blue-600" />
                        <label className="font-bold text-blue-950 text-[11px]">
                          Section Header Height
                        </label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => setHeight((prev) => Math.max(36, (prev || effectiveHeight) - 2))}
                          className="w-5 h-5 rounded bg-white hover:bg-red-50 hover:text-red-600 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-300 cursor-pointer shadow-2xs"
                          title="Decrease height (-2px)"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-blue-900 bg-blue-200/80 px-2 py-0.5 rounded text-[11px]">
                          {effectiveHeight}px
                        </span>
                        <button
                          type="button"
                          onClick={() => setHeight((prev) => Math.min(120, (prev || effectiveHeight) + 2))}
                          className="w-5 h-5 rounded bg-white hover:bg-emerald-50 hover:text-emerald-600 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-300 cursor-pointer shadow-2xs"
                          title="Increase height (+2px)"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={36}
                      max={120}
                      value={effectiveHeight}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      {[
                        { label: 'Slim (44px)', val: 44 },
                        { label: 'Standard (56px)', val: 56 },
                        { label: 'Medium (70px)', val: 70 },
                        { label: 'Large (88px)', val: 88 }
                      ].map((p) => (
                        <button
                          key={p.val}
                          type="button"
                          onClick={() => setHeight(p.val)}
                          className={`hover:text-blue-700 cursor-pointer ${effectiveHeight === p.val ? 'font-bold text-blue-700 underline' : ''}`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center space-x-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={applyToAllInsidePages}
              onChange={(e) => setApplyToAllInsidePages(e.target.checked)}
              className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-700 flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Apply this header layout to all inside pages (Page 2 to {totalPagesCount})</span>
            </span>
          </label>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold font-sans text-slate-600 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold font-sans bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-md shadow-red-600/20 flex items-center space-x-2 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{headerMode === 'default' ? '✓ Apply Master Masthead' : '✓ Apply Custom Header'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeaderSettingsModal;
