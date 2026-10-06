'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { apiRequest } from '@/services/api';
import {
  Newspaper, Eye, Download, Send, Plus, Upload, CheckCircle2,
  ChevronDown, Layers, Layout, Maximize2, Sparkles, FileText, Check,
  Trash2, AlertCircle, RefreshCw, X, Sliders, Image as ImageIcon,
  Copy, Share2, Grid, MoveHorizontal, MoveVertical, Minimize2, ArrowLeftRight, ArrowLeft,
  ArrowUpDown, PlusCircle, Trash, GripVertical, GripHorizontal,
  Move, ArrowUpLeft, Move3D, RotateCcw,
  Edit3, Bold, Italic, Underline, Highlighter, Palette, Type, Eraser,
  Columns, AlignJustify,
  Menu, ChevronLeft, ExternalLink
} from 'lucide-react';

import { AIAgentDrawer, ParsedNewsPayload } from '@/components/admin/AIAgentDrawer';

export interface EPaperSlotData {
  id: string;
  slotNumber: number;
  slotBadge: string;
  x: number;      // Position X in pixels (0 to 800)
  y: number;      // Position Y in pixels (0 to 2000)
  width: number;  // Width in pixels (50 to 840)
  height: number; // Height in pixels (50 to 1000)
  categoryBadge: string;
  headline: string;
  subHeadline: string;
  summary: string;
  imageUrl: string;
  imageAlignment?: 'Left' | 'Center Wrap' | 'Center' | 'Right';
  imageAlign?: string;
  imageVertAlign?: 'top' | 'middle' | 'bottom';
  imageHeight?: number; // Height of photo in pixels (20 to 500)
  imageWidth?: number;  // Width of photo in pixels (20 to 600)
  imgPxX?: number;      // Exact X position of photo inside card (px)
  imgPxY?: number;      // Exact Y position of photo inside card (px)
  imgRelX?: number;     // Relative X position inside card (px)
  imgRelY?: number;     // Relative Y position inside card (px)
  imagePositionX?: number; // Image focal X percentage (0 to 100)
  imagePositionY?: number; // Image focal Y percentage (0 to 100)
  headlineFontSize?: number;
  headlineColor?: string;
  subHeadlineFontSize?: number;
  subHeadlineColor?: string;
  summaryFontSize?: number;
  summaryColor?: string;
  columnsCount?: number;   // Newspaper columns: 1, 2, 3 or 4
  columnGap?: number;      // Spacing between columns in px (default 14)
  showColumnDivider?: boolean; // Vertical separator line between columns
  imageWrapMode?: 'auto' | 'top-span'; // Smart wrap inside column or span on top of columns
  isAd?: boolean;
}

interface EPaperPageData {
  id: string;
  pageNumber: number;
  title: string;
  templateKey: string;
  slots: EPaperSlotData[];
}

function cleanPagesForStorage(pagesList: any[]) {
  if (!Array.isArray(pagesList)) return pagesList;
  return pagesList.map((pg: any) => ({
    ...pg,
    slots: (pg.slots || []).map((s: any) => ({
      ...s,
      imageUrl: s.imageUrl || ''
    }))
  }));
}

function safeSaveToLocalStorage(key: string, data: any) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err: any) {
    if (err && (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED' || err.code === 22)) {
      try {
        // Prune old draft keys to free up localStorage space
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (k && k.startsWith('epaper_studio_draft_') && k !== key) {
            localStorage.removeItem(k);
          }
        }

        let lightweight = data;
        if (Array.isArray(data)) {
          lightweight = cleanPagesForStorage(data);
        } else if (data && typeof data === 'object' && Array.isArray(data.pages)) {
          lightweight = {
            ...data,
            pages: cleanPagesForStorage(data.pages)
          };
        }

        localStorage.setItem(key, JSON.stringify(lightweight));
      } catch {
        // Silently handled: Backend MySQL auto-save (/epaper/admin/save-pages-bulk) is active
      }
    }
  }
}

const initialPages: EPaperPageData[] = [
  {
    id: 'page-1',
    pageNumber: 1,
    title: 'Page 1',
    templateKey: 'Free-Form Drag & Scale Canvas',
    slots: []
  }
];

const DEFAULT_EDITIONS = [
  { id: 'patna', name: 'पटना (मुख्य)', city: 'पटना', title: 'अपना पटना', state: 'बिहार मुख्य संस्करण', slug: 'patna-main' },
  { id: 'delhi', name: 'दिल्ली एनसीआर', city: 'दिल्ली NCR', title: 'अपना दिल्ली NCR', state: 'राजधानी संस्करण', slug: 'delhi-ncr' },
  { id: 'muzaffarpur', name: 'मुजफ्फरपुर', city: 'मुजफ्फरपुर', title: 'अपना मुजफ्फरपुर', state: 'उत्तर बिहार संस्करण', slug: 'muzaffarpur' },
  { id: 'gaya', name: 'गया', city: 'गया', title: 'अपना गया', state: 'दक्षिण बिहार संस्करण', slug: 'gaya' },
  { id: 'bhagalpur', name: 'भागलपुर', city: 'भागलपुर', title: 'अपना भागलपुर', state: 'पूर्वी बिहार संस्करण', slug: 'bhagalpur' },
  { id: 'ranchi', name: 'राँची', city: 'राँची', title: 'अपना राँची', state: 'झारखंड संस्करण', slug: 'ranchi' },
  { id: 'lucknow', name: 'लखनऊ', city: 'लखनऊ', title: 'अपना लखनऊ', state: 'उत्तर प्रदेश संस्करण', slug: 'lucknow' }
];

function getEditionInfo(selectedEditionName: string, list: typeof DEFAULT_EDITIONS) {
  const found = list.find(
    e => e.name.toLowerCase() === selectedEditionName.toLowerCase() ||
      e.id.toLowerCase() === selectedEditionName.toLowerCase() ||
      e.slug.toLowerCase() === selectedEditionName.toLowerCase()
  );
  if (found) return found;

  const cleanCity = selectedEditionName
    .replace(/edition/i, '')
    .replace(/main/i, '')
    .replace(/\(.*\)/g, '')
    .trim() || selectedEditionName;

  return {
    id: selectedEditionName.toLowerCase().replace(/\s+/g, '-'),
    name: selectedEditionName,
    city: cleanCity,
    title: `अपना ${cleanCity}`,
    state: `${cleanCity} संस्करण`,
    slug: selectedEditionName.toLowerCase().replace(/\s+/g, '-')
  };
}

function formatHindiDateString(dateStr: string) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const days = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
    const months = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
    return `${days[d.getDay()]} • ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

// Utility to strip all raw HTML tags like <p>, </p>, <mark>, <div>, etc. and preserve paragraph breaks
export function stripHtmlTagsToPlainText(input: string): string {
  if (!input) return '';
  let str = input.trim();
  // decode escaped tags if any
  if (str.includes('&lt;') && str.includes('&gt;')) {
    str = str
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
  }
  // Replace paragraph endings and breaks with double newlines
  str = str
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<li\b[^>]*>/gi, '• ')
    .replace(/<\/li>/gi, '\n');
  // Strip all remaining HTML tags
  str = str.replace(/<[^>]*>/g, '');
  // Normalize double newlines and trim
  return str.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function sliceHtmlTokens(html: string): string[] {
  if (!html) return [];
  // Tokenize preserving HTML tags, words and whitespace
  const tagRegex = /(<[^>]+>|[^\s<]+|\s+)/g;
  return html.match(tagRegex) || [];
}

function buildHtmlFromTokens(tokens: string[], startIdx: number, endIdx: number): string {
  if (!tokens || tokens.length === 0 || startIdx >= tokens.length || startIdx >= endIdx) return '';
  const rawChunk = tokens.slice(startIdx, endIdx).join('');
  if (typeof document === 'undefined') return rawChunk;

  // Track any open formatting tags before startIdx so column inherits active styles
  const openStack: { tag: string; full: string }[] = [];
  for (let i = 0; i < startIdx; i++) {
    const t = tokens[i];
    if (t.startsWith('</')) {
      const tagName = t.slice(2, -1).toLowerCase().split(' ')[0];
      for (let j = openStack.length - 1; j >= 0; j--) {
        if (openStack[j].tag === tagName) {
          openStack.splice(j, 1);
          break;
        }
      }
    } else if (t.startsWith('<') && !t.endsWith('/>') && !t.startsWith('<!')) {
      const match = t.match(/<([a-zA-Z0-9]+)/);
      if (match) {
        const tagName = match[1].toLowerCase();
        if (!['br', 'img', 'hr', 'input'].includes(tagName)) {
          openStack.push({ tag: tagName, full: t });
        }
      }
    }
  }
  const prefix = openStack.map(item => item.full).join('');

  // Auto-close any unclosed tags at the end of the chunk using a browser div
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = prefix + rawChunk;
  return tempDiv.innerHTML;
}

let measureContainer: HTMLDivElement | null = null;
function getMeasureDiv(): HTMLDivElement | null {
  if (typeof document === 'undefined') return null;
  if (!measureContainer || !document.body.contains(measureContainer)) {
    measureContainer = document.createElement('div');
    measureContainer.id = '__epaper_measure_div__';
    measureContainer.style.position = 'fixed';
    measureContainer.style.left = '-99999px';
    measureContainer.style.top = '-99999px';
    measureContainer.style.visibility = 'hidden';
    measureContainer.style.pointerEvents = 'none';
    measureContainer.style.zIndex = '-9999';
    document.body.appendChild(measureContainer);
  }
  return measureContainer;
}

function findBestTokenFit(
  tokens: string[],
  startTokenIdx: number,
  width: number,
  height: number,
  cols: number,
  fontSize: number,
  colGap: number = 14
): number {
  if (startTokenIdx >= tokens.length) return tokens.length;
  const div = getMeasureDiv();
  if (!div) {
    return tokens.length;
  }

  const targetW = Math.max(50, width);
  const targetH = Math.max(20, height);

  div.style.width = `${targetW}px`;
  div.style.height = `${targetH}px`;
  div.style.maxHeight = `${targetH}px`;
  div.style.fontSize = `${fontSize || 10.5}px`;
  div.style.fontFamily = "'Noto Serif Devanagari', 'Merriweather', serif";
  div.style.lineHeight = '1.38';
  div.style.textAlign = 'justify';
  (div.style as any).textJustify = 'inter-word';
  div.style.wordBreak = 'break-word';
  div.style.overflow = 'hidden';
  div.style.boxSizing = 'border-box';
  div.style.padding = '0';
  div.style.margin = '0';
  div.style.whiteSpace = 'pre-line';

  if (cols > 1) {
    div.style.columnCount = `${cols}`;
    div.style.columnGap = `${colGap}px`;
    div.style.columnFill = 'auto';
  } else {
    div.style.columnCount = 'unset';
    div.style.columnGap = 'unset';
    div.style.columnFill = 'unset';
  }

  // Quick check: does all remaining text fit without overflow?
  const fullHtml = buildHtmlFromTokens(tokens, startTokenIdx, tokens.length);
  div.innerHTML = fullHtml;
  const fitsAll = cols === 1
    ? (div.scrollHeight <= targetH)
    : (div.scrollWidth <= targetW && div.scrollHeight <= targetH);

  if (fitsAll) {
    return tokens.length;
  }

  let low = startTokenIdx + 1;
  let high = tokens.length;
  let bestFit = startTokenIdx;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    div.innerHTML = buildHtmlFromTokens(tokens, startTokenIdx, mid);
    const fits = cols === 1
      ? (div.scrollHeight <= targetH)
      : (div.scrollWidth <= targetW && div.scrollHeight <= targetH);

    if (fits) {
      bestFit = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return Math.max(startTokenIdx + 1, bestFit);
}

function computeSlotSections(s: EPaperSlotData) {
  const colsCount = s.columnsCount || 1;
  const colGap = s.columnGap || 14;
  const cardH = s.height || 400;
  const cardContentW = Math.max(100, s.width - 24);
  const showDivider = s.showColumnDivider || false;

  const hasBadge = Boolean((s.categoryBadge || (s as any).categoryTag)?.trim());
  const badgeH = hasBadge ? 18 : 0;

  const hlFont = s.headlineFontSize || 24;
  const subFont = s.subHeadlineFontSize || 16;
  const hlCharsPerLine = Math.max(12, Math.floor(cardContentW / (hlFont * 0.52)));
  const hlLines = s.headline ? Math.max(1, Math.ceil(s.headline.length / hlCharsPerLine)) : 0;
  const hlH = hlLines * hlFont * 1.25;

  const subCharsPerLine = Math.max(18, Math.floor(cardContentW / (subFont * 0.52)));
  const subLines = s.subHeadline ? Math.max(1, Math.ceil(s.subHeadline.length / subCharsPerLine)) : 0;
  const subH = subLines * subFont * 1.25;

  // Card framing: 8px top padding + 8px bottom padding + 4px gap + 4px cushion = 24px
  const cardFraming = 24;
  let headerTotalH = Math.ceil(badgeH + hlH + subH + cardFraming);
  if (typeof document !== 'undefined') {
    const liveHeader = document.getElementById(`slot-header-${s.id}`);
    if (liveHeader && liveHeader.offsetHeight > 0) {
      headerTotalH = Math.ceil(liveHeader.offsetHeight + cardFraming);
    }
  }

  const fullStoryH = Math.max(40, cardH - headerTotalH);

  const imgW = s.imageWidth || 180;
  const imgH = s.imageHeight || 140;
  const isFullCardPhoto = imgW >= cardContentW - 30 || s.imageWrapMode === 'top-span';

  if (colsCount === 1 || isFullCardPhoto) {
    return {
      isFullWidth: true,
      text1: s.summary || '',
      text2: '',
      text2b: '',
      text3: '',
      leftCols: 0,
      photoCols: colsCount,
      rightCols: 0,
      leftSectionW: 0,
      photoSectionW: cardContentW,
      rightSectionW: 0,
      underPhotoH: Math.max(30, fullStoryH - imgH - 10),
      fullStoryH,
      colsCount,
      colGap,
      singleColW: cardContentW,
      showDivider,
      startCol: 0
    };
  }

  const singleColW = Math.max(60, Math.floor((cardContentW - (colGap * (colsCount - 1))) / colsCount));
  const colStep = singleColW + colGap;
  const spanCols = Math.min(colsCount - 1, Math.max(1, Math.round((imgW + (colGap * 0.5)) / colStep)));
  const maxStartCol = Math.max(0, colsCount - spanCols);

  const normAlign = (s.imageAlignment || s.imageAlign || 'Center').toLowerCase();
  const isLeft = normAlign === 'left';
  const isRight = normAlign === 'right';

  let startCol = 0;
  if (s.imgPxX !== undefined && maxStartCol >= 1) {
    startCol = Math.max(0, Math.min(maxStartCol, Math.round(s.imgPxX / colStep)));
  } else if (isLeft) {
    startCol = 0;
  } else if (isRight) {
    startCol = maxStartCol;
  } else {
    startCol = Math.floor(maxStartCol / 2);
  }

  const leftCols = startCol;
  const photoCols = spanCols;
  const rightCols = colsCount - (startCol + spanCols);

  const leftSectionW = leftCols > 0 ? (leftCols * singleColW) + ((leftCols - 1) * colGap) : 0;
  const photoSectionW = (photoCols * singleColW) + ((photoCols - 1) * colGap);
  const rightSectionW = rightCols > 0 ? (rightCols * singleColW) + ((rightCols - 1) * colGap) : 0;
  const underPhotoH = Math.max(30, fullStoryH - imgH - 10);
  const vertAlign = s.imageVertAlign || 'top';

  const tokens = sliceHtmlTokens(s.summary || '');
  let text1 = '';
  let text2 = '';
  let text2b = '';
  let text3 = '';
  let currentTokenIdx = 0;

  if (leftCols > 0) {
    const fit1 = findBestTokenFit(tokens, currentTokenIdx, leftSectionW, fullStoryH, leftCols, s.summaryFontSize || 10.5, colGap);
    text1 = buildHtmlFromTokens(tokens, currentTokenIdx, fit1);
    currentTokenIdx = fit1;
  }

  if (vertAlign === 'middle') {
    const midTopH = Math.max(20, Math.floor(underPhotoH / 2));
    const midBottomH = Math.max(20, Math.ceil(underPhotoH / 2));

    if (currentTokenIdx < tokens.length) {
      const fit2a = findBestTokenFit(tokens, currentTokenIdx, photoSectionW, midTopH, photoCols, s.summaryFontSize || 10.5, colGap);
      text2 = buildHtmlFromTokens(tokens, currentTokenIdx, fit2a);
      currentTokenIdx = fit2a;
    }

    if (currentTokenIdx < tokens.length) {
      const fit2b = findBestTokenFit(tokens, currentTokenIdx, photoSectionW, midBottomH, photoCols, s.summaryFontSize || 10.5, colGap);
      text2b = buildHtmlFromTokens(tokens, currentTokenIdx, fit2b);
      currentTokenIdx = fit2b;
    }
  } else {
    if (currentTokenIdx < tokens.length) {
      const fit2 = findBestTokenFit(tokens, currentTokenIdx, photoSectionW, underPhotoH, photoCols, s.summaryFontSize || 10.5, colGap);
      text2 = buildHtmlFromTokens(tokens, currentTokenIdx, fit2);
      currentTokenIdx = fit2;
    }
  }

  if (rightCols > 0 && currentTokenIdx < tokens.length) {
    const fit3 = findBestTokenFit(tokens, currentTokenIdx, rightSectionW, fullStoryH, rightCols, s.summaryFontSize || 10.5, colGap);
    text3 = buildHtmlFromTokens(tokens, currentTokenIdx, fit3);
  }

  return {
    isFullWidth: false,
    text1,
    text2,
    text2b,
    text3,
    leftCols,
    photoCols,
    rightCols,
    leftSectionW,
    photoSectionW,
    rightSectionW,
    underPhotoH,
    fullStoryH,
    colsCount,
    colGap,
    singleColW,
    showDivider,
    startCol
  };
}

function enrichPagesWithComputedSections(pagesList: EPaperPageData[]): EPaperPageData[] {
  if (!Array.isArray(pagesList)) return pagesList;
  return pagesList.map(pg => ({
    ...pg,
    slots: (pg.slots || []).map(s => {
      if (s.isAd) return s;
      return {
        ...s,
        computedSections: computeSlotSections(s)
      };
    })
  }));
}

function FullStudioInner() {
  const { isLoading } = useAdminAuth();

  // Dynamic Editions List (Fetched from API with fallback)
  const [editionsList, setEditionsList] = useState(DEFAULT_EDITIONS);

  // Core Studio State
  const [edition, setEdition] = useState('पटना (मुख्य)');
  const [archiveDate, setArchiveDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [publishStatus, setPublishStatus] = useState<'Draft' | 'Published'>('Draft');
  const [pages, setPages] = useState<EPaperPageData[]>(initialPages);
  const [activePageId, setActivePageId] = useState<string>('page-1');
  const [activeSlotId, setActiveSlotId] = useState<string>('slot-1-1');

  // Fetch dynamic editions list from Backend API endpoint (/api/v1/epaper/editions)
  useEffect(() => {
    async function loadEditionsFromApi() {
      try {
        const res = await fetch('http://localhost:5000/api/v1/epaper/editions');
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : (data.data || data.editions || []);
          if (items.length > 0) {
            const formatted = items.map((item: any) => {
              const stateName = item.state?.name || '';
              const stateBadge = item.tag || (stateName ? `${stateName} संस्करण` : `${item.city || 'मुख्य'} संस्करण`);
              return {
                id: item.id || item.slug,
                name: item.name,
                city: item.city || item.name,
                title: item.title || `अपना ${item.city || item.name}`,
                state: stateBadge,
                slug: item.slug
              };
            });
            setEditionsList(formatted);
            // Sync default edition if needed
            setEdition(prev => {
              const exists = formatted.some((e: any) => e.name === prev);
              return exists ? prev : formatted[0].name;
            });
          }
        }
      } catch (err) {
        // Fallback to DEFAULT_EDITIONS
      }
    }
    loadEditionsFromApi();
  }, []);

  const currentEditionInfo = getEditionInfo(edition, editionsList);
  const [isLoadedFromStorage, setIsLoadedFromStorage] = useState(false);
  const [isPastUncreatedDate, setIsPastUncreatedDate] = useState(false);
  const activeEditionSlugRef = useRef('');

  // Word-Style Rich Text Editor & Highlighter State
  const [isRichEditorOpen, setIsRichEditorOpen] = useState(false);
  const [richEditingSlot, setRichEditingSlot] = useState<EPaperSlotData | null>(null);
  const [richHeadline, setRichHeadline] = useState('');
  const [richSubHeadline, setRichSubHeadline] = useState('');
  const [richSummaryHtml, setRichSummaryHtml] = useState('');
  const richEditorContentRef = useRef<HTMLDivElement>(null);

  // Dropdown states for toolbar (MS Word Style)
  const [showHighlightDropdown, setShowHighlightDropdown] = useState(false);
  const [showTextColorDropdown, setShowTextColorDropdown] = useState(false);
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [currentSelectedHighlight, setCurrentSelectedHighlight] = useState('#fef08a');
  const [currentSelectedTextColor, setCurrentSelectedTextColor] = useState('#b91c1c');
  const [currentSelectedFontSize, setCurrentSelectedFontSize] = useState('14px');

  const toggleHighlightDropdown = () => {
    setShowHighlightDropdown(prev => !prev);
    setShowTextColorDropdown(false);
    setShowFontSizeDropdown(false);
  };

  const toggleTextColorDropdown = () => {
    setShowTextColorDropdown(prev => !prev);
    setShowHighlightDropdown(false);
    setShowFontSizeDropdown(false);
  };

  const toggleFontSizeDropdown = () => {
    setShowFontSizeDropdown(prev => !prev);
    setShowHighlightDropdown(false);
    setShowTextColorDropdown(false);
  };

  const handleOpenRichEditor = (slot: EPaperSlotData) => {
    setRichEditingSlot(slot);
    setRichHeadline(slot.headline || '');
    setRichSubHeadline(slot.subHeadline || '');
    setRichSummaryHtml(slot.summary || '');
    setShowHighlightDropdown(false);
    setShowTextColorDropdown(false);
    setShowFontSizeDropdown(false);
    setIsRichEditorOpen(true);
  };

  useEffect(() => {
    if (isRichEditorOpen && richEditorContentRef.current) {
      richEditorContentRef.current.innerHTML = richSummaryHtml;
    }
  }, [isRichEditorOpen]);

  const handleSaveRichEditor = () => {
    if (!richEditingSlot) return;

    let finalHtml = richSummaryHtml;
    if (richEditorContentRef.current) {
      finalHtml = richEditorContentRef.current.innerHTML;
    }

    setPages(prevPages => prevPages.map(pg => {
      return {
        ...pg,
        slots: pg.slots.map(s => {
          if (s.id === richEditingSlot.id) {
            return {
              ...s,
              headline: richHeadline,
              subHeadline: richSubHeadline,
              summary: finalHtml
            };
          }
          return s;
        })
      };
    }));

    if (activeSlotId === richEditingSlot.id) {
      setFormHeadline(richHeadline);
      setFormSubHeadline(richSubHeadline);
      setFormSummary(finalHtml);
    }

    setIsRichEditorOpen(false);
    triggerToast(`🎉 Slot #${richEditingSlot.slotNumber} का कंटेंट और स्टाइल अपडेट हो गया!`);
  };

  const applyRichCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (richEditorContentRef.current) {
      setRichSummaryHtml(richEditorContentRef.current.innerHTML);
    }
  };

  const applyHighlight = (color: string) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      triggerToast('कृपया पहले वह शब्द या वाक्य सिलेक्ट करें जिसे हाइलाइट करना है!');
      return;
    }
    if (color === 'transparent') {
      document.execCommand('removeFormat');
      if (richEditorContentRef.current) setRichSummaryHtml(richEditorContentRef.current.innerHTML);
      triggerToast('हाइलाइट हटा दिया गया!');
      return;
    }

    const range = sel.getRangeAt(0);
    const mark = document.createElement('mark');
    mark.style.backgroundColor = color;
    mark.style.color = '#0f172a';
    mark.style.padding = '1px 4px';
    mark.style.borderRadius = '3px';
    mark.style.fontWeight = '700';
    try {
      range.surroundContents(mark);
    } catch {
      document.execCommand('hiliteColor', false, color);
    }
    if (richEditorContentRef.current) {
      setRichSummaryHtml(richEditorContentRef.current.innerHTML);
    }
    triggerToast('शब्द हाइलाइट हो गया!');
  };

  const applyTextColor = (color: string) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      triggerToast('कृपया पहले वह शब्द या वाक्य सिलेक्ट करें जिसका रंग बदलना है!');
      return;
    }
    const range = sel.getRangeAt(0);
    const span = document.createElement('span');
    span.style.color = color;
    span.style.fontWeight = 'bold';
    try {
      range.surroundContents(span);
    } catch {
      document.execCommand('foreColor', false, color);
    }
    if (richEditorContentRef.current) {
      setRichSummaryHtml(richEditorContentRef.current.innerHTML);
    }
    triggerToast('टेक्स्ट रंग बदल दिया गया!');
  };

  const applyFontSizeToSelection = (sizePx: string) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      triggerToast('कृपया पहले वह शब्द या वाक्य सिलेक्ट करें जिसका साइज बदलना है!');
      return;
    }
    const range = sel.getRangeAt(0);
    const span = document.createElement('span');
    span.style.fontSize = sizePx;
    try {
      range.surroundContents(span);
    } catch {
      document.execCommand('fontSize', false, '4');
    }
    if (richEditorContentRef.current) {
      setRichSummaryHtml(richEditorContentRef.current.innerHTML);
    }
    triggerToast(`फॉन्ट साइज (${sizePx}) सेट हो गया!`);
  };

  // 1. Auto-Load draft from Backend DB & localStorage when Edition or Date changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;
    setIsLoadedFromStorage(false);
    activeEditionSlugRef.current = `${currentEditionInfo.slug}_${archiveDate}`;

    const storageKey = `epaper_studio_draft_${currentEditionInfo.slug}_${archiveDate}`;

    async function loadData() {
      let loadedPages: EPaperPageData[] | null = null;

      // 1. Check Backend MySQL DB first (has full longtext & slots support)
      try {
        const res = await fetch(`http://localhost:5000/api/v1/epaper/issue?edition=${currentEditionInfo.slug}&date=${archiveDate}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.pages && data.data.pages.length > 0) {
            const dbPages = data.data.pages.map((p: any) => ({
              id: p.id || `page-${p.pageNumber}`,
              pageNumber: p.pageNumber,
              title: p.title || `Page ${p.pageNumber}`,
              templateKey: p.templateKey || 'layout_1',
              slots: (p.slots || []).map((s: any, idx: number) => ({
                id: s.id || `slot-${p.pageNumber}-${s.slotIndex || (idx + 1)}`,
                slotNumber: s.slotIndex || (idx + 1),
                slotBadge: `Slot ${s.slotIndex || (idx + 1)}`,
                x: s.x !== undefined && s.x !== null ? Number(s.x) : 16,
                y: s.y !== undefined && s.y !== null ? Number(s.y) : 115,
                width: s.width !== undefined && s.width !== null ? Number(s.width) : 400,
                height: s.height !== undefined && s.height !== null ? Number(s.height) : 250,
                headline: s.headline || '',
                subHeadline: s.subHeadline || '',
                categoryBadge: s.categoryTag || '',
                summary: stripHtmlTagsToPlainText(s.contentText || s.summary || ''),
                imageUrl: s.imageUrl || '',
                imageAlignment: s.imageAlign === 'RIGHT' ? 'Right' : s.imageAlign === 'CENTER' ? 'Center Wrap' : 'Left',
                imageWidth: s.imageWidth || 180,
                imageHeight: s.imageHeight || 140,
                imgPxX: s.imgPxX || 0,
                imgPxY: s.imgPxY || 0,
                isAd: s.isAd || false,
                headlineFontSize: s.headlineFontSize ?? s.headline_font_size ?? undefined,
                headlineColor: s.headlineColor || s.headline_color || undefined,
                subHeadlineFontSize: s.subHeadlineFontSize ?? s.sub_headline_font_size ?? undefined,
                subHeadlineColor: s.subHeadlineColor || s.sub_headline_color || undefined,
                summaryFontSize: s.summaryFontSize ?? s.bodyFontSize ?? s.summary_font_size ?? undefined,
                summaryColor: s.summaryColor ?? s.bodyTextColor ?? s.summary_color ?? undefined,
                columnsCount: s.columnsCount ?? s.columnCount ?? s.columns_count ?? 1,
                columnGap: s.columnGap ?? s.column_gap ?? 14,
                showColumnDivider: s.showColumnDivider ?? s.showColumnDividers ?? s.show_column_divider ?? false,
                imageWrapMode: s.imageWrapMode ?? s.image_wrap_mode ?? 'auto'
              }))
            }));

            // Set loaded pages directly from DB for this edition & date if it has slots
            if (dbPages && dbPages.length > 0 && dbPages.some((p: any) => p.slots && p.slots.length > 0)) {
              loadedPages = dbPages;
            }
          }
        }
      } catch { }

      const todayIso = new Date().toISOString().split('T')[0];
      const isPast = archiveDate < todayIso;
      const hasDbSlots = Boolean(loadedPages && loadedPages.some(p => p.slots && p.slots.length > 0));
      if (isPast && !hasDbSlots) {
        setIsPastUncreatedDate(true);
      } else {
        setIsPastUncreatedDate(false);
      }

      // 2. Check localStorage for local edits ONLY if database did not have any slots
      if (!loadedPages && typeof window !== 'undefined') {
        try {
          let saved = localStorage.getItem(storageKey);
          let localPages: EPaperPageData[] | null = null;
          if (saved) {
            localPages = JSON.parse(saved);
          } else {
            const activeDraftStr = localStorage.getItem('epaper_studio_active_draft');
            if (activeDraftStr) {
              const activeDraft = JSON.parse(activeDraftStr);
              // STRICT GUARD: Must match current edition AND current date!
              if (
                activeDraft &&
                activeDraft.archiveDate === archiveDate &&
                activeDraft.editionSlug === currentEditionInfo.slug &&
                Array.isArray(activeDraft.pages) &&
                activeDraft.pages.length > 0
              ) {
                localPages = activeDraft.pages;
              }
            }
          }

          if (Array.isArray(localPages) && localPages.length > 0) {
            loadedPages = localPages;
          }
        } catch { }
      }

      // 3. Fallback to 1 clean blank page if no saved draft in DB or localStorage for this date
      if (!loadedPages || loadedPages.length === 0) {
        loadedPages = [
          {
            id: `page-1`,
            pageNumber: 1,
            title: `Page 1`,
            templateKey: 'layout_1',
            slots: []
          }
        ];
      }

      if (isMounted) {
        const cleanedLoadedPages = loadedPages.map(pg => ({
          ...pg,
          slots: (pg.slots || []).map(s => ({
            ...s,
            summary: stripHtmlTagsToPlainText(s.summary || '')
          }))
        }));
        setPages(cleanedLoadedPages);
        setActivePageId(cleanedLoadedPages[0].id);
        const firstSlot = cleanedLoadedPages[0].slots[0];
        if (firstSlot) {
          setActiveSlotId(firstSlot.id);
          setFormHeadline(firstSlot.headline || '');
          setFormCategory(firstSlot.categoryBadge || '');
          setFormSubHeadline(firstSlot.subHeadline || '');
          setFormSummary(stripHtmlTagsToPlainText(firstSlot.summary || ''));
          setFormX(firstSlot.x !== undefined ? firstSlot.x : 16);
          setFormY(firstSlot.y !== undefined ? firstSlot.y : 115);
          setFormW(firstSlot.width || 400);
          setFormH(firstSlot.height || 250);
          setFormImageUrl(firstSlot.imageUrl || '');
          setFormImageAlign(firstSlot.imageAlignment || 'Center Wrap');
          setFormImageWidth(firstSlot.imageWidth || 180);
          setFormImageHeight(firstSlot.imageHeight || 140);
          setFormImgPxX(firstSlot.imgPxX || 0);
          setFormImgPxY(firstSlot.imgPxY || 0);
          setFormIsAd(firstSlot.isAd || false);
          setFormHeadlineFontSize(firstSlot.headlineFontSize || 18);
          setFormHeadlineColor(firstSlot.headlineColor || '#0f172a');
          setFormSubHeadlineFontSize(firstSlot.subHeadlineFontSize || 12);
          setFormSubHeadlineColor(firstSlot.subHeadlineColor || '#b91c1c');
          setFormSummaryFontSize(firstSlot.summaryFontSize || 11);
          setFormSummaryColor(firstSlot.summaryColor || '#1e293b');
          setFormColumnsCount(firstSlot.columnsCount || 1);
          setFormColumnGap(firstSlot.columnGap || 14);
          setFormShowColumnDivider(firstSlot.showColumnDivider || false);
          setFormImageWrapMode(firstSlot.imageWrapMode || 'auto');
        } else {
          setActiveSlotId('');
          setFormHeadline('');
          setFormCategory('');
          setFormSubHeadline('');
          setFormSummary('');
          setFormImageUrl('');
        }
        setIsLoadedFromStorage(true);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [currentEditionInfo.slug, archiveDate]);

  // 2. Continuous Debounced Auto-Save to MySQL DB & localStorage
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  useEffect(() => {
    if (!isLoadedFromStorage || typeof window === 'undefined') return;
    if (activeEditionSlugRef.current !== `${currentEditionInfo.slug}_${archiveDate}`) return;

    // Do NOT auto-save empty past or draft pages to MySQL if they have 0 slots!
    const hasAnySlots = pages.some(p => p.slots && p.slots.length > 0);
    if (!hasAnySlots) {
      return;
    }

    // Save to localStorage immediately (with quota-exceeded safety fallback)
    const storageKey = `epaper_studio_draft_${currentEditionInfo.slug}_${archiveDate}`;
    safeSaveToLocalStorage(storageKey, pages);
    safeSaveToLocalStorage('epaper_studio_active_draft', {
      editionSlug: currentEditionInfo.slug,
      archiveDate,
      pages
    });

    // Debounced Auto-Save to Backend MySQL Database (1.5 seconds after last edit)
    const timer = setTimeout(async () => {
      setIsAutoSaving(true);
      try {
        await apiRequest('/epaper/admin/save-pages-bulk', {
          method: 'POST',
          body: JSON.stringify({
            editionSlug: currentEditionInfo.slug,
            publishDate: archiveDate,
            pages: pages.map(pg => ({
              ...pg,
              slots: (pg.slots || []).map((s, idx) => ({
                ...s,
                slotNumber: idx + 1,
                slotIndex: idx + 1
              }))
            }))
          })
        });
      } catch {
        // Quiet fallback
      } finally {
        setIsAutoSaving(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [pages, isLoadedFromStorage, currentEditionInfo.slug, archiveDate]);

  // Flush-save when user refreshes, leaves or closes tab
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pages && pages.length > 0) {
        const storageKey = `epaper_studio_draft_${currentEditionInfo.slug}_${archiveDate}`;
        safeSaveToLocalStorage(storageKey, pages);
        safeSaveToLocalStorage('epaper_studio_active_draft', {
          editionSlug: currentEditionInfo.slug,
          archiveDate,
          pages
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [pages, currentEditionInfo.slug, archiveDate]);

  // Reset Draft back to initial template
  const handleResetDraft = () => {
    if (confirm(`Are you sure you want to reset "${currentEditionInfo.name}" (${archiveDate}) draft? All custom pages & slots will be reset.`)) {
      const storageKey = `epaper_studio_draft_${currentEditionInfo.slug}_${archiveDate}`;
      try {
        localStorage.removeItem(storageKey);
      } catch { }
      setPages(initialPages);
      setActivePageId(initialPages[0].id);
      setActiveSlotId(initialPages[0].slots[0]?.id || '');
      triggerToast('Draft reset to default state');
    }
  };

  // Permanent Uniform Standard Real Broadsheet Dimensions (14" x 22" -> 1344px x 2112px • ~35cm x 56cm)
  const paperWidth = 1344;
  const customMinPaperHeight = 2112;

  // Interactive Free Drag-Move & Resize State
  const [dragState, setDragState] = useState<{
    mode: 'move' | 'resize-w' | 'resize-h' | 'resize-corner' | 'drag-card-img' | 'resize-img-corner' | 'resize-img-w' | 'resize-img-h';
    slotId: string;
    startMouseX: number;
    startMouseY: number;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    startImgPxX?: number;
    startImgPxY?: number;
    startImgW?: number;
    startImgH?: number;
  } | null>(null);

  // UI Modals & Toasts State
  const [toastMsg, setToastMsg] = useState<string>('');
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [showReaderPreviewModal, setShowReaderPreviewModal] = useState(false);
  const [readerModalArticle, setReaderModalArticle] = useState<EPaperSlotData | null>(null);
  const [readerModalTab, setReaderModalTab] = useState<'image' | 'text'>('text');
  const [imgErrorMap, setImgErrorMap] = useState<Record<string, boolean>>({});
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showSlotGuides, setShowSlotGuides] = useState<boolean>(true);
  const [showPagesSidebar, setShowPagesSidebar] = useState<boolean>(true);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [publishModal, setPublishModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'already-published' | 'error';
    title: string;
    message: string;
    pdfUrl?: string | null;
    readerUrl?: string;
    editionName: string;
    publishDate: string;
    totalPages: number;
  } | null>(null);

  // Active page & slot calculations (Directly resolved from activePageId so empty pages switch instantly)
  const activePage = pages.find(p => p.id === activePageId) || pages[0];
  const activeSlot = (activePage.slots && activePage.slots.find(s => s.id === activeSlotId)) || (activePage.slots && activePage.slots[0]) || {
    id: 'temp',
    slotNumber: 1,
    slotBadge: 'Slot 1',
    x: 16,
    y: 115,
    width: 400,
    height: 250,
    categoryBadge: '',
    headline: '',
    subHeadline: '',
    summary: '',
    imageUrl: '',
    imageAlignment: 'Left'
  };

  // Form input state bound to active slot
  const [formHeadline, setFormHeadline] = useState(activeSlot.headline);
  const [formCategory, setFormCategory] = useState(activeSlot.categoryBadge || '');
  const [formSubHeadline, setFormSubHeadline] = useState(activeSlot.subHeadline || '');
  const [formSummary, setFormSummary] = useState(activeSlot.summary || '');
  const [formX, setFormX] = useState(activeSlot.x || 16);
  const [formY, setFormY] = useState(activeSlot.y || 115);
  const [formW, setFormW] = useState(activeSlot.width || 400);
  const [formH, setFormH] = useState(activeSlot.height || 250);
  const [formImageUrl, setFormImageUrl] = useState(activeSlot.imageUrl || '');
  const [formImageAlign, setFormImageAlign] = useState<'Left' | 'Center Wrap' | 'Center' | 'Right'>(activeSlot.imageAlignment || 'Left');
  const [formImageWidth, setFormImageWidth] = useState(activeSlot.imageWidth || 180);
  const [formImageHeight, setFormImageHeight] = useState(activeSlot.imageHeight || 140);
  const [formImageVertAlign, setFormImageVertAlign] = useState<'top' | 'middle' | 'bottom'>(activeSlot.imageVertAlign || 'top');
  const [formImgPxX, setFormImgPxX] = useState(activeSlot.imgPxX || 0);
  const [formImgPxY, setFormImgPxY] = useState(activeSlot.imgPxY || 0);
  const [formIsAd, setFormIsAd] = useState(activeSlot.isAd || false);

  // Text Styling States (Font Sizes & Colors)
  const [formHeadlineFontSize, setFormHeadlineFontSize] = useState<number>(activeSlot.headlineFontSize || 18);
  const [formHeadlineColor, setFormHeadlineColor] = useState<string>(activeSlot.headlineColor || '#0f172a');
  const [formSubHeadlineFontSize, setFormSubHeadlineFontSize] = useState<number>(activeSlot.subHeadlineFontSize || 12);
  const [formSubHeadlineColor, setFormSubHeadlineColor] = useState<string>(activeSlot.subHeadlineColor || '#b91c1c');
  const [formSummaryFontSize, setFormSummaryFontSize] = useState<number>(activeSlot.summaryFontSize || 11);
  const [formSummaryColor, setFormSummaryColor] = useState<string>(activeSlot.summaryColor || '#1e293b');

  // Newspaper Multi-Column & Wrap States
  const [formColumnsCount, setFormColumnsCount] = useState<number>(activeSlot.columnsCount || 1);
  const [formColumnGap, setFormColumnGap] = useState<number>(activeSlot.columnGap || 14);
  const [formShowColumnDivider, setFormShowColumnDivider] = useState<boolean>(activeSlot.showColumnDivider || false);
  const [formImageWrapMode, setFormImageWrapMode] = useState<'auto' | 'top-span'>(activeSlot.imageWrapMode || 'auto');

  // Sync form inputs when active slot changes or moves on canvas
  useEffect(() => {
    if (activeSlot) {
      setFormHeadline(activeSlot.headline || '');
      setFormCategory(activeSlot.categoryBadge || '');
      setFormSubHeadline(activeSlot.subHeadline || '');
      setFormSummary(activeSlot.summary || '');
      setFormX(activeSlot.x !== undefined ? activeSlot.x : 16);
      setFormY(activeSlot.y !== undefined ? activeSlot.y : 115);
      setFormW(activeSlot.width || 400);
      setFormH(activeSlot.height || 250);
      setFormImageUrl(activeSlot.imageUrl || '');
      setFormImageAlign(activeSlot.imageAlignment || 'Left');
      setFormImageVertAlign(activeSlot.imageVertAlign || 'top');
      setFormImageWidth(activeSlot.imageWidth || 180);
      setFormImageHeight(activeSlot.imageHeight || 140);
      setFormImgPxX(activeSlot.imgPxX || 0);
      setFormImgPxY(activeSlot.imgPxY || 0);
      setFormIsAd(activeSlot.isAd || false);
      setFormHeadlineFontSize(activeSlot.headlineFontSize || 18);
      setFormHeadlineColor(activeSlot.headlineColor || '#0f172a');
      setFormSubHeadlineFontSize(activeSlot.subHeadlineFontSize || 12);
      setFormSubHeadlineColor(activeSlot.subHeadlineColor || '#b91c1c');
      setFormSummaryFontSize(activeSlot.summaryFontSize || 11);
      setFormSummaryColor(activeSlot.summaryColor || '#1e293b');
      setFormColumnsCount(activeSlot.columnsCount || 1);
      setFormColumnGap(activeSlot.columnGap || 14);
      setFormShowColumnDivider(activeSlot.showColumnDivider || false);
      setFormImageWrapMode(activeSlot.imageWrapMode || 'auto');
    }
  }, [activeSlotId, activePageId]);

  // FILE UPLOADER REF & HANDLER FOR COMPUTERS/DEVICES
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit! Please select a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setFormImageUrl(dataUrl);
        setPages(prevPages => prevPages.map(pg => {
          if (pg.slots.some(s => s.id === activeSlotId)) {
            return {
              ...pg,
              slots: pg.slots.map(s => {
                if (s.id === activeSlotId) {
                  return { ...s, imageUrl: dataUrl };
                }
                return s;
              })
            };
          }
          return pg;
        }));
        setImgErrorMap(prev => ({ ...prev, [activeSlotId]: false }));
        triggerToast(`Uploaded photo "${file.name}" live to slot!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setFormImageUrl('');
    setPages(prevPages => prevPages.map(pg => {
      if (pg.slots.some(s => s.id === activeSlotId)) {
        return {
          ...pg,
          slots: pg.slots.map(s => {
            if (s.id === activeSlotId) {
              return { ...s, imageUrl: '' };
            }
            return s;
          })
        };
      }
      return pg;
    }));
    triggerToast('Removed photo from slot');
  };

  // LIVE UPDATERS FOR IMAGE ALIGNMENT, PHOTO WIDTH, PHOTO HEIGHT & PHOTO 2D PIXEL POSITION
  const handleUpdateImageWidth = (val: number) => {
    const safeVal = Math.max(10, Math.min(3000, val));
    setFormImageWidth(safeVal);
    setPages(prevPages => prevPages.map(pg => {
      if (pg.slots.some(s => s.id === activeSlotId)) {
        return {
          ...pg,
          slots: pg.slots.map(s => {
            if (s.id === activeSlotId) {
              return { ...s, imageWidth: safeVal };
            }
            return s;
          })
        };
      }
      return pg;
    }));
  };

  const handleUpdateImageHeight = (val: number) => {
    const safeVal = Math.max(10, Math.min(3000, val));
    setFormImageHeight(safeVal);
    setPages(prevPages => prevPages.map(pg => {
      if (pg.slots.some(s => s.id === activeSlotId)) {
        return {
          ...pg,
          slots: pg.slots.map(s => {
            if (s.id === activeSlotId) {
              return { ...s, imageHeight: safeVal };
            }
            return s;
          })
        };
      }
      return pg;
    }));
  };

  const handleUpdateImagePxX = (val: number) => {
    const safeVal = Math.max(0, val);
    setFormImgPxX(safeVal);
    setPages(prevPages => prevPages.map(pg => {
      if (pg.slots.some(s => s.id === activeSlotId)) {
        return {
          ...pg,
          slots: pg.slots.map(s => {
            if (s.id === activeSlotId) {
              return { ...s, imgPxX: safeVal };
            }
            return s;
          })
        };
      }
      return pg;
    }));
  };

  const handleUpdateImagePxY = (val: number) => {
    const safeVal = Math.max(0, val);
    setFormImgPxY(safeVal);
    setPages(prevPages => prevPages.map(pg => {
      if (pg.slots.some(s => s.id === activeSlotId)) {
        return {
          ...pg,
          slots: pg.slots.map(s => {
            if (s.id === activeSlotId) {
              return { ...s, imgPxY: safeVal };
            }
            return s;
          })
        };
      }
      return pg;
    }));
  };

  const handleUpdateImageAlign = (align: 'Left' | 'Center Wrap' | 'Center' | 'Right') => {
    const cleanAlign: 'Left' | 'Center' | 'Right' = align === 'Center Wrap' ? 'Center' : align;
    setFormImageAlign(cleanAlign);
    setPages(prevPages => prevPages.map(pg => {
      if (pg.slots.some(s => s.id === activeSlotId)) {
        return {
          ...pg,
          slots: pg.slots.map(s => {
            if (s.id === activeSlotId) {
              const cardContentW = Math.max(100, s.width - 24);
              const colsCount = s.columnsCount || 1;
              const colGap = s.columnGap || 14;
              const singleColW = Math.max(60, Math.floor((cardContentW - (colGap * (colsCount - 1))) / colsCount));
              const colStep = singleColW + colGap;
              const imgW = s.imageWidth || 180;
              const spanCols = Math.min(colsCount - 1, Math.max(1, Math.round((imgW + (colGap * 0.5)) / colStep)));
              const maxStartCol = Math.max(0, colsCount - spanCols);

              let targetCol = 0;
              if (cleanAlign === 'Left') {
                targetCol = 0;
              } else if (cleanAlign === 'Right') {
                targetCol = maxStartCol;
              } else {
                targetCol = Math.floor(maxStartCol / 2);
              }

              const targetPxX = colsCount > 1 ? targetCol * colStep : (cleanAlign === 'Right' ? Math.max(0, cardContentW - imgW) : cleanAlign === 'Left' ? 0 : Math.round(Math.max(0, cardContentW - imgW) / 2));
              setFormImgPxX(targetPxX);

              return {
                ...s,
                imageAlignment: cleanAlign,
                imageAlign: cleanAlign,
                imgPxX: targetPxX
              };
            }
            return s;
          })
        };
      }
      return pg;
    }));
    triggerToast(`Photo aligned ${cleanAlign}!`);
  };

  const handleUpdateImageVertAlign = (vAlign: 'top' | 'middle' | 'bottom') => {
    setFormImageVertAlign(vAlign);
    setPages(prevPages => prevPages.map(pg => {
      if (pg.slots.some(s => s.id === activeSlotId)) {
        return {
          ...pg,
          slots: pg.slots.map(s => {
            if (s.id === activeSlotId) {
              return {
                ...s,
                imageVertAlign: vAlign
              };
            }
            return s;
          })
        };
      }
      return pg;
    }));
    triggerToast(`Photo placed at ${vAlign === 'top' ? 'Top (ऊपर)' : vAlign === 'bottom' ? 'Bottom (नीचे)' : 'Middle (बीच में)'}!`);
  };

  const handleFitImageFullWidth = () => {
    if (!activeSlot) return;
    const cardContentW = Math.max(100, activeSlot.width - 24);
    setFormImageWidth(cardContentW);
    setFormImgPxX(0);
    setFormImageAlign('Center');
    setPages(prevPages => prevPages.map(pg => {
      if (pg.slots.some(s => s.id === activeSlotId)) {
        return {
          ...pg,
          slots: pg.slots.map(s => {
            if (s.id === activeSlotId) {
              return {
                ...s,
                imageWidth: cardContentW,
                imgPxX: 0,
                imageAlignment: 'Center',
                imageAlign: 'Center'
              };
            }
            return s;
          })
        };
      }
      return pg;
    }));
    triggerToast('Photo set to 100% Full Card Width!');
  };

  const handleQuickSnapPhotoPosition = (pos: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right') => {
    if (!activeSlot) return;

    const imgW = activeSlot.imageWidth || 180;
    const imgH = activeSlot.imageHeight || 140;
    const maxPxX = Math.max(0, activeSlot.width - imgW);
    const maxPxY = Math.max(0, activeSlot.height - imgH);

    let targetX = 0;
    let targetY = 0;

    if (pos === 'top-left') { targetX = 0; targetY = 0; }
    else if (pos === 'top-center') { targetX = Math.round(maxPxX / 2); targetY = 0; }
    else if (pos === 'top-right') { targetX = maxPxX; targetY = 0; }
    else if (pos === 'bottom-left') { targetX = 0; targetY = maxPxY; }
    else if (pos === 'bottom-center') { targetX = Math.round(maxPxX / 2); targetY = maxPxY; }
    else if (pos === 'bottom-right') { targetX = maxPxX; targetY = maxPxY; }

    setFormImgPxX(targetX);
    setFormImgPxY(targetY);

    setPages(prevPages => prevPages.map(pg => {
      if (pg.slots.some(s => s.id === activeSlotId)) {
        return {
          ...pg,
          slots: pg.slots.map(s => {
            if (s.id === activeSlotId) {
              return {
                ...s,
                imgPxX: targetX,
                imgPxY: targetY
              };
            }
            return s;
          })
        };
      }
      return pg;
    }));
    triggerToast(`Photo snapped to ${pos.replace('-', ' ')}!`);
  };



  const handleApplyAiNewsToActiveSlot = (news: ParsedNewsPayload) => {
    // Require user to have an active selected slot on the canvas
    if (!activeSlotId || !activeSlot || activeSlot.id === 'temp') {
      triggerToast('⚠️ कृपया पहले कैनवास पर वह स्लॉट सिलेक्ट करें जिसमें यह समाचार डालना है!');
      return;
    }

    const targetSlot = activeSlot;
    const isTopSpan = news.imageWrapMode === 'top-span' || (news.imageWidth && targetSlot.width && news.imageWidth >= targetSlot.width - 40);
    const newHl = news.headline || formHeadline || targetSlot.headline || '';
    const newSub = news.subHeadline !== undefined ? news.subHeadline : (formSubHeadline || targetSlot.subHeadline || '');
    const newCategory = news.categoryBadge || formCategory || targetSlot.categoryBadge || '';
    const newSummary = stripHtmlTagsToPlainText(news.content || formSummary || targetSlot.summary || '');
    const newImg = news.imageUrl !== undefined && news.imageUrl !== '' ? news.imageUrl : (formImageUrl || targetSlot.imageUrl || '');
    const newAlign = isTopSpan ? 'Center Wrap' : (news.imageAlignment ? (news.imageAlignment === 'Center' ? 'Center Wrap' : news.imageAlignment) : (formImageAlign || targetSlot.imageAlignment || 'Left'));
    const newVertAlign = isTopSpan ? 'top' : (news.imageVertAlign || formImageVertAlign || targetSlot.imageVertAlign || 'top');
    const newCols = news.columnsCount || formColumnsCount || targetSlot.columnsCount || (isTopSpan ? 2 : 1);
    const newImgW = isTopSpan ? Math.max(100, (targetSlot.width || 400) - 24) : (news.imageWidth || targetSlot.imageWidth || 180);
    const newWrapMode = isTopSpan ? 'top-span' : (targetSlot.imageWrapMode || 'auto');

    // Update form state (keep user's manual slot height untouched!)
    setFormHeadline(newHl);
    setFormSubHeadline(newSub);
    setFormCategory(newCategory);
    setFormSummary(newSummary);
    if (newImg) setFormImageUrl(newImg);
    setFormImageAlign(newAlign as any);
    setFormImageVertAlign(newVertAlign as any);
    setFormColumnsCount(newCols);
    setFormShowColumnDivider(newCols > 1);
    setFormImageWidth(newImgW);
    setFormImageWrapMode(newWrapMode);

    setPages(prevPages => prevPages.map(pg => {
      if (pg.slots.some(s => s.id === activeSlotId)) {
        return {
          ...pg,
          slots: pg.slots.map(s => {
            if (s.id === activeSlotId) {
              return {
                ...s,
                headline: newHl,
                subHeadline: newSub,
                categoryBadge: newCategory,
                summary: newSummary,
                imageUrl: newImg || s.imageUrl,
                imageAlignment: newAlign as any,
                imageAlign: newAlign as any,
                imageVertAlign: newVertAlign as any,
                columnsCount: newCols,
                showColumnDivider: newCols > 1,
                imageWrapMode: newWrapMode,
                imageWidth: isTopSpan ? newImgW : (newImg && (!s.imageWidth || s.imageWidth < 100) ? (newCols > 1 ? 260 : 200) : (s.imageWidth || 180)),
                imageHeight: newImg && (!s.imageHeight || s.imageHeight < 80) ? (newCols > 1 ? 180 : 140) : (s.imageHeight || 140)
              };
            }
            return s;
          })
        };
      }
      return pg;
    }));

    triggerToast(`🎉 AI: स्लॉट #${activeSlot.slotNumber} में समाचार सफलतापूर्वक लागू हो गया!`);
  };

  // GLOBAL MOUSEMOVE AND MOUSEUP LISTENER FOR 100% FREE CANVAS DRAG & RESIZE
  useEffect(() => {
    if (!dragState) return;

    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const deltaX = e.clientX - dragState.startMouseX;
        const deltaY = e.clientY - dragState.startMouseY;

        setPages(prevPages => prevPages.map(pg => {
          if (!pg.slots.some(s => s.id === dragState.slotId)) return pg;

          return {
            ...pg,
            slots: pg.slots.map(s => {
              if (s.id === dragState.slotId) {
                let updatedX = s.x;
                let updatedY = s.y;
                let updatedW = s.width;
                let updatedH = s.height;

                // Mode 1: FREE POSITION MOVE (Drag slot anywhere X, Y)
                if (dragState.mode === 'move') {
                  updatedX = Math.max(0, dragState.startX + deltaX);
                  updatedY = Math.max(0, dragState.startY + deltaY);
                }

                // Mode 2: RESIZE WIDTH (1px to Npx)
                if (dragState.mode === 'resize-w' || dragState.mode === 'resize-corner') {
                  updatedW = Math.max(1, dragState.startW + deltaX);
                }

                // Mode 3: RESIZE HEIGHT (1px to Npx)
                if (dragState.mode === 'resize-h' || dragState.mode === 'resize-corner') {
                  updatedH = Math.max(1, dragState.startH + deltaY);
                }

                // Mode 4: DRAG PHOTO FREELY & SMOOTHLY ANYWHERE INSIDE CARD
                if (dragState.mode === 'drag-card-img') {
                  const startPxX = dragState.startImgPxX ?? 0;
                  const startPxY = dragState.startImgPxY ?? 0;

                  const cardContentW = Math.max(100, s.width - 24);
                  const imgW = s.imageWidth || 180;
                  const imgH = s.imageHeight || 140;
                  const maxPxX = Math.max(0, cardContentW - imgW);
                  const maxPxY = Math.max(0, s.height - imgH - 40);

                  const newPxX = Math.max(0, Math.min(maxPxX, Math.round(startPxX + deltaX)));
                  const newPxY = Math.max(0, Math.min(maxPxY, Math.round(startPxY + deltaY)));

                  let alignName: 'Left' | 'Center' | 'Right' = 'Center';
                  if (newPxX <= 20) {
                    alignName = 'Left';
                  } else if (newPxX >= maxPxX - 20) {
                    alignName = 'Right';
                  } else {
                    alignName = 'Center';
                  }

                  let vertAlign: 'top' | 'middle' | 'bottom' = s.imageVertAlign || 'top';
                  if (maxPxY > 60) {
                    const yRatio = newPxY / maxPxY;
                    if (yRatio > 0.7) vertAlign = 'bottom';
                    else if (yRatio > 0.35) vertAlign = 'middle';
                    else vertAlign = 'top';
                  }

                  return {
                    ...s,
                    imgPxX: newPxX,
                    imgPxY: newPxY,
                    imageAlignment: alignName,
                    imageAlign: alignName,
                    imageVertAlign: vertAlign
                  };
                }

                // Mode 5: RESIZE IMAGE CORNER (WIDTH & HEIGHT)
                if (dragState.mode === 'resize-img-corner') {
                  const startW = dragState.startImgW || s.imageWidth || 180;
                  const startH = dragState.startImgH || s.imageHeight || 140;
                  const cardContentW = Math.max(100, s.width - 24);
                  const newW = Math.max(30, Math.min(cardContentW, Math.round(startW + deltaX)));
                  const newH = Math.max(30, Math.round(startH + deltaY));
                  return {
                    ...s,
                    imageWidth: newW,
                    imageHeight: newH
                  };
                }

                // Mode 6: RESIZE IMAGE WIDTH ONLY
                if (dragState.mode === 'resize-img-w') {
                  const startW = dragState.startImgW || s.imageWidth || 180;
                  const cardContentW = Math.max(100, s.width - 24);
                  const newW = Math.max(30, Math.min(cardContentW, Math.round(startW + deltaX)));
                  return {
                    ...s,
                    imageWidth: newW
                  };
                }

                // Mode 7: RESIZE IMAGE HEIGHT ONLY
                if (dragState.mode === 'resize-img-h') {
                  const startH = dragState.startImgH || s.imageHeight || 140;
                  const newH = Math.max(30, Math.round(startH + deltaY));
                  return {
                    ...s,
                    imageHeight: newH
                  };
                }

                return {
                  ...s,
                  x: updatedX,
                  y: updatedY,
                  width: updatedW,
                  height: updatedH
                };
              }
              return s;
            })
          };
        }));
      });
    };

    const handleMouseUp = () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (dragState) {
        setPages(prevPages => {
          const currentPageObj = prevPages.find(p => p.slots.some(s => s.id === dragState.slotId));
          const draggedSlotObj = currentPageObj?.slots.find(s => s.id === dragState.slotId);
          if (draggedSlotObj) {
            setFormX(draggedSlotObj.x);
            setFormY(draggedSlotObj.y);
            setFormW(draggedSlotObj.width);
            setFormH(draggedSlotObj.height);
            if (draggedSlotObj.imgPxX !== undefined) setFormImgPxX(draggedSlotObj.imgPxX);
            if (draggedSlotObj.imgPxY !== undefined) setFormImgPxY(draggedSlotObj.imgPxY);
            if (draggedSlotObj.imageAlignment) setFormImageAlign(draggedSlotObj.imageAlignment);
            if (draggedSlotObj.imageVertAlign) setFormImageVertAlign(draggedSlotObj.imageVertAlign);
            if (draggedSlotObj.imageWidth !== undefined) setFormImageWidth(draggedSlotObj.imageWidth);
            if (draggedSlotObj.imageHeight !== undefined) setFormImageHeight(draggedSlotObj.imageHeight);
          }
          return prevPages;
        });
      }
      setDragState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, activePageId, activeSlotId]);

  // KEYBOARD ARROW CONTROLS FOR PIXEL-PERFECT SMOOTH MOVEMENT (LEFT, RIGHT, UP, DOWN)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeSlotId) return;
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      const step = e.shiftKey ? 10 : 2;
      let dx = 0;
      let dy = 0;

      if (e.key === 'ArrowLeft') dx = -step;
      else if (e.key === 'ArrowRight') dx = step;
      else if (e.key === 'ArrowUp') dy = -step;
      else if (e.key === 'ArrowDown') dy = step;
      else return;

      e.preventDefault();

      setPages(prevPages => prevPages.map(pg => ({
        ...pg,
        slots: pg.slots.map(s => {
          if (s.id === activeSlotId) {
            const newX = Math.max(0, s.x + dx);
            const newY = Math.max(0, s.y + dy);
            setFormX(newX);
            setFormY(newY);
            return { ...s, x: newX, y: newY };
          }
          return s;
        })
      })));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSlotId]);

  // Initiate Mouse Dragging (Move Card or Resize or Drag Image inside Card)
  const handleStartDrag = (
    e: React.MouseEvent,
    slot: EPaperSlotData,
    mode: 'move' | 'resize-w' | 'resize-h' | 'resize-corner' | 'drag-card-img' | 'resize-img-corner' | 'resize-img-w' | 'resize-img-h'
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveSlotId(slot.id);

    const parentPg = pages.find(p => p.slots.some(s => s.id === slot.id));
    if (parentPg && parentPg.id !== activePageId) {
      setActivePageId(parentPg.id);
    }

    const cardContentW = Math.max(100, slot.width - 24);
    const imgW = slot.imageWidth || 180;
    const maxPxX = Math.max(0, cardContentW - imgW);

    let initialPxX = 0;
    if (slot.imgPxX !== undefined) {
      initialPxX = Math.max(0, Math.min(maxPxX, slot.imgPxX));
    } else {
      const normAlign = (slot.imageAlignment || slot.imageAlign || 'Center').toLowerCase();
      if (normAlign === 'right') initialPxX = maxPxX;
      else if (normAlign === 'left') initialPxX = 0;
      else initialPxX = Math.round(maxPxX / 2);
    }
    const initialPxY = slot.imgPxY ?? 0;

    setDragState({
      mode,
      slotId: slot.id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startX: slot.x,
      startY: slot.y,
      startW: slot.width,
      startH: slot.height,
      startImgPxX: initialPxX,
      startImgPxY: initialPxY,
      startImgW: slot.imageWidth || 180,
      startImgH: slot.imageHeight || 140
    });
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // 1. Select Slot Handler
  const handleSelectSlot = (slot: EPaperSlotData) => {
    const parentPg = pages.find(p => p.slots.some(s => s.id === slot.id));
    if (parentPg && parentPg.id !== activePageId) {
      setActivePageId(parentPg.id);
    }
    setActiveSlotId(slot.id);
  };

  // 2. Select Page Handler (Robust Empty Page Switching)
  const handleSelectPage = (page: EPaperPageData) => {
    setActivePageId(page.id);
    if (page.slots && page.slots.length > 0) {
      setActiveSlotId(page.slots[0].id);
    } else {
      setActiveSlotId('');
    }
    triggerToast(`Switched to ${page.title}`);
  };

  // 3. UNLIMITED: Add New Custom Slot anywhere on Canvas (Smart 3-Column & Auto-Page Creation with ZERO Overlap)
  const handleAddCustomSlot = () => {
    const slotsOnActivePg = activePage.slots || [];
    const nextSlotNumber = slotsOnActivePg.reduce((max, s) => Math.max(max, s.slotNumber || 0), 0) + 1;
    const slotW = 390;
    const slotH = 250;
    const canvasTopY = 115;
    const canvasMaxY = 2000;

    // Standard 3 columns across broadsheet canvas (paperWidth = 1344)
    // Col 1: 16 to 406
    // Col 2: 430 to 820
    // Col 3: 844 to 1234
    const columns = [16, 430, 844];
    const candidates: { x: number; y: number }[] = [];

    for (const colX of columns) {
      let testY = canvasTopY;

      while (testY + slotH <= canvasMaxY) {
        // Find any existing slot that overlaps 2D bounding-box with candidate (colX, testY, slotW, slotH)
        // Include a 15px gap margin to keep slots cleanly separated
        const overlappingSlot = slotsOnActivePg.find(s => {
          const sx = s.x ?? 16;
          const sy = s.y ?? 115;
          const sw = s.width ?? 390;
          const sh = s.height ?? 250;

          const horizontalOverlap = colX < sx + sw && colX + slotW > sx;
          const verticalOverlap = testY < sy + sh + 15 && testY + slotH + 15 > sy;

          return horizontalOverlap && verticalOverlap;
        });

        if (!overlappingSlot) {
          // Free, non-overlapping spot found in this column!
          candidates.push({ x: colX, y: testY });
          break;
        }

        // Advance testY below the overlapping slot
        testY = (overlappingSlot.y ?? 115) + (overlappingSlot.height ?? 250) + 15;
      }
    }

    let targetX = 16;
    let targetY = canvasTopY;

    if (candidates.length > 0) {
      // Sort candidates by Y first (fill highest available spot on canvas), then by X (left to right)
      candidates.sort((a, b) => {
        if (Math.abs(a.y - b.y) <= 20) {
          return a.x - b.x;
        }
        return a.y - b.y;
      });

      targetX = candidates[0].x;
      targetY = candidates[0].y;
    } else {
      // All primary column spaces occupied: place on active page with a neat cascade offset
      const offsetIdx = slotsOnActivePg.length % 6;
      targetX = 16 + (offsetIdx * 35);
      targetY = canvasTopY + (offsetIdx * 35);
    }

    // Always add slot to the CURRENT active page (unlimited slots!)
    const newSlot: EPaperSlotData = {
      id: `slot-${activePage.pageNumber}-${Date.now()}`,
      slotNumber: nextSlotNumber,
      slotBadge: `Slot ${nextSlotNumber}`,
      x: targetX,
      y: targetY,
      width: slotW,
      height: slotH,
      categoryBadge: '',
      headline: '',
      subHeadline: '',
      summary: '',
      imageUrl: '',
      imageAlignment: 'Center Wrap'
    };

    setPages(prevPages => prevPages.map(pg => {
      if (pg.id === activePageId) {
        return {
          ...pg,
          slots: [...pg.slots, newSlot]
        };
      }
      return pg;
    }));

    setActiveSlotId(newSlot.id);
    triggerToast(`✨ नया स्लॉट #${nextSlotNumber} (Page ${activePage.pageNumber}) पर जोड़ दिया गया!`);
  };

  // 4. Delete Specific Slot (Allows removing any slot so page can be made blank)
  const handleDeleteSlotById = (slotId: string) => {
    setPages(prevPages => prevPages.map(pg => {
      if (pg.id === activePageId) {
        const updatedSlots = pg.slots.filter(s => s.id !== slotId).map((s, idx) => ({
          ...s,
          slotNumber: idx + 1,
          slotBadge: `Slot ${idx + 1}`
        }));
        return { ...pg, slots: updatedSlots };
      }
      return pg;
    }));

    const remainingSlots = activePage.slots.filter(s => s.id !== slotId);
    if (remainingSlots.length > 0) {
      setActiveSlotId(remainingSlots[0].id);
    } else {
      setActiveSlotId('');
    }

    triggerToast(`Deleted slot from canvas`);
  };

  // 5. Update Geometry via Form Sliders/Inputs
  const handleUpdateGeometryForm = (field: 'x' | 'y' | 'w' | 'h', val: number) => {
    if (field === 'x') setFormX(val);
    if (field === 'y') setFormY(val);
    if (field === 'w') setFormW(val);
    if (field === 'h') setFormH(val);

    setPages(prevPages => prevPages.map(pg => {
      if (pg.slots.some(s => s.id === activeSlotId)) {
        return {
          ...pg,
          slots: pg.slots.map(s => {
            if (s.id === activeSlotId) {
              return {
                ...s,
                x: field === 'x' ? val : s.x,
                y: field === 'y' ? val : s.y,
                width: field === 'w' ? val : s.width,
                height: field === 'h' ? val : s.height
              };
            }
            return s;
          })
        };
      }
      return pg;
    }));
  };

  // Live Field Updater for Instant Realtime Auto-Save
  const handleUpdateSlotField = (field: keyof EPaperSlotData, val: any) => {
    setPages(prevPages => prevPages.map(pg => {
      if (pg.slots.some(s => s.id === activeSlotId)) {
        return {
          ...pg,
          slots: pg.slots.map(s => {
            if (s.id === activeSlotId) {
              return {
                ...s,
                [field]: val
              };
            }
            return s;
          })
        };
      }
      return pg;
    }));
  };

  // 6. Apply Form Edits to Canvas Live
  const handleApplyChanges = async () => {
    setPages(prevPages => prevPages.map(pg => {
      if (pg.slots.some(s => s.id === activeSlotId)) {
        return {
          ...pg,
          slots: pg.slots.map(s => {
            if (s.id === activeSlotId) {
              return {
                ...s,
                headline: formHeadline,
                categoryBadge: formCategory,
                subHeadline: formSubHeadline,
                summary: formSummary,
                x: formX,
                y: formY,
                width: formW,
                height: formH,
                imageUrl: formImageUrl,
                imageAlignment: formImageAlign,
                imageAlign: formImageAlign,
                imageWidth: formImageWidth,
                imageHeight: formImageHeight,
                imgPxX: formImgPxX,
                imgPxY: formImgPxY,
                isAd: formIsAd,
                headlineFontSize: formHeadlineFontSize,
                headlineColor: formHeadlineColor,
                subHeadlineFontSize: formSubHeadlineFontSize,
                subHeadlineColor: formSubHeadlineColor,
                summaryFontSize: formSummaryFontSize,
                summaryColor: formSummaryColor,
                columnsCount: formColumnsCount,
                columnGap: formColumnGap,
                showColumnDivider: formShowColumnDivider,
                imageWrapMode: formImageWrapMode
              };
            }
            return s;
          })
        };
      }
      return pg;
    }));

    triggerToast('✓ Applied content, styling & geometry to Canvas!');

    // Express API Sync
    try {
      await apiRequest('/epaper/admin/save-slot', {
        method: 'POST',
        body: JSON.stringify({
          editionSlug: currentEditionInfo.slug,
          publishDate: archiveDate,
          pageNumber: activePage.pageNumber,
          slotIndex: activeSlot.slotNumber,
          x: formX,
          y: formY,
          width: formW,
          height: formH,
          headline: formHeadline,
          subHeadline: formSubHeadline,
          categoryTag: formCategory,
          contentText: formSummary,
          imageUrl: formImageUrl,
          imageAlign: formImageAlign === 'Left' ? 'LEFT' : formImageAlign === 'Right' ? 'RIGHT' : 'CENTER',
          imageWidth: formImageWidth,
          imageHeight: formImageHeight,
          imgPxX: formImgPxX,
          imgPxY: formImgPxY,
          isAd: formIsAd,
          headlineFontSize: formHeadlineFontSize,
          headlineColor: formHeadlineColor,
          subHeadlineFontSize: formSubHeadlineFontSize,
          subHeadlineColor: formSubHeadlineColor,
          bodyFontSize: formSummaryFontSize,
          summaryFontSize: formSummaryFontSize,
          bodyTextColor: formSummaryColor,
          summaryColor: formSummaryColor,
          columnsCount: formColumnsCount,
          columnCount: formColumnsCount,
          columnGap: formColumnGap,
          showColumnDivider: formShowColumnDivider,
          showColumnDividers: formShowColumnDivider,
          imageWrapMode: formImageWrapMode
        })
      });
      // Also immediately sync localStorage so refreshing/closing tab retains changes 100%
      const storageKey = `epaper_studio_draft_${currentEditionInfo.slug}_${archiveDate}`;
      safeSaveToLocalStorage(storageKey, pages);
    } catch {
      // Fallback
    }
  };

  // Create Page
  const handleCreatePage = () => {
    const nextPgNum = pages.length + 1;
    const title = newPageTitle.trim() || `Page ${nextPgNum} (City Updates)`;
    const newPage: EPaperPageData = {
      id: `page-${Date.now()}`,
      pageNumber: nextPgNum,
      title,
      templateKey: 'Free-Form Drag & Scale Canvas',
      slots: []
    };

    setPages([...pages, newPage]);
    setActivePageId(newPage.id);
    setActiveSlotId('');
    setShowAddPageModal(false);
    setNewPageTitle('');
    triggerToast(`Created Page ${nextPgNum} (Blank Sheet)!`);
  };

  // Delete Page
  const handleDeletePage = (pageId: string) => {
    if (pages.length <= 1) {
      alert('Cannot delete the only remaining page in edition!');
      return;
    }

    const filtered = pages.filter(p => p.id !== pageId);
    const updated = filtered.map((p, idx) => ({
      ...p,
      pageNumber: idx + 1,
      title: p.title.startsWith('Page ') ? `Page ${idx + 1}` : p.title
    }));

    setPages(updated);
    setActivePageId(updated[0].id);
    setActiveSlotId(updated[0].slots[0]?.id || '');
    triggerToast('Page deleted & re-indexed!');
  };

  // Publish Paper with Smart Publish & Duplicate Guard and Modern Rich Modal
  const handlePublishPaper = async () => {
    setIsGeneratingPdf(true);
    triggerToast('🚀 Publishing paper & compiling edition...');
    try {
      const backendBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

      let publishRes: any = null;
      const enriched = enrichPagesWithComputedSections(pages);

      // 1. Persist all pages & slots to database so database matches canvas 100%
      try {
        await apiRequest('/epaper/admin/save-pages-bulk', {
          method: 'POST',
          body: JSON.stringify({
            editionSlug: currentEditionInfo.slug,
            publishDate: archiveDate,
            pages: enriched
          })
        });
      } catch (saveErr) {
        console.warn('save-pages-bulk pre-save error:', saveErr);
      }

      // 2. Publish edition & trigger compilation
      try {
        publishRes = await apiRequest('/epaper/admin/publish', {
          method: 'POST',
          body: JSON.stringify({
            editionSlug: currentEditionInfo.slug,
            publishDate: archiveDate,
            status: 'PUBLISHED',
            pages: enriched
          })
        });
      } catch {
        // Fallback to alias if needed
        publishRes = await apiRequest('/epaper/admin/publish-issue', {
          method: 'POST',
          body: JSON.stringify({
            editionSlug: currentEditionInfo.slug,
            publishDate: archiveDate,
            status: 'PUBLISHED',
            pages: enriched
          })
        });
      }

      const isAlreadyPublished = Boolean(publishRes?.isAlreadyPublished || publishRes?.data?.isAlreadyPublished);
      const resMsg = publishRes?.message || publishRes?.data?.message;

      setPublishStatus('Published');

      // 3. Always generate fresh High-Res PDF and WebP page screenshots with latest slots
      let pdfUrl = publishRes?.data?.pdfUrl || publishRes?.pdfUrl || publishRes?.data?.issue?.broadsheetPdfUrl;

      try {
        const response = await fetch(`${backendBase}/epaper/generate-pdf`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            editionSlug: currentEditionInfo.slug,
            editionName: currentEditionInfo.name,
            editionTitle: currentEditionInfo.title,
            editionCity: currentEditionInfo.city,
            editionState: currentEditionInfo.state,
            publishDate: archiveDate,
            pages: enriched
          })
        });

        const resData = await response.json();
        if (resData.success && resData.data?.pdfUrl) {
          pdfUrl = resData.data.pdfUrl;
        }
      } catch (pdfErr) {
        console.warn('PDF fetch error:', pdfErr);
      }

      const fullPdfUrl = pdfUrl
        ? (pdfUrl.startsWith('http') ? pdfUrl : `http://localhost:5000${pdfUrl}`)
        : null;

      const publicReaderUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/epaper`
        : '/epaper';

      // Open the beautiful rich publication modal popup!
      setPublishModal({
        isOpen: true,
        type: isAlreadyPublished ? 'already-published' : 'success',
        title: isAlreadyPublished ? 'ई-पेपर पहले से प्रकाशित है!' : 'ई-पेपर सफलतापूर्वक प्रकाशित हो गया!',
        message: resMsg || (isAlreadyPublished
          ? 'यह अंक पहले से प्रकाशित और लाइव है। आप नीचे से इसे सीधे लाइव देख सकते हैं या PDF डाउनलोड कर सकते हैं।'
          : 'आपका ई-पेपर सफलतापूर्वक प्रकाशित कर दिया गया है और अब पाठकों (Readers) के लिए लाइव उपलब्ध है।'),
        pdfUrl: fullPdfUrl,
        readerUrl: publicReaderUrl,
        editionName: currentEditionInfo.name,
        publishDate: archiveDate,
        totalPages: pages.length
      });

    } catch (err: any) {
      setPublishModal({
        isOpen: true,
        type: 'error',
        title: 'प्रकाशन में समस्या आई (Publish Failed)',
        message: err.message || 'सर्वर से कनेक्ट करने में त्रुटि हुई। कृपया पुनः प्रयास करें।',
        editionName: currentEditionInfo.name,
        publishDate: archiveDate,
        totalPages: pages.length
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Generate Broadsheet PDF
  const handleGenerateBroadsheetPdf = async () => {
    setIsGeneratingPdf(true);
    triggerToast('⏳ Generating High-Res PDF...');

    // Open a preview tab synchronously right upon click so browser NEVER blocks it!
    const previewTab = typeof window !== 'undefined' ? window.open('about:blank', '_blank') : null;
    if (previewTab) {
      try {
        previewTab.document.write(`
          <!DOCTYPE html>
          <html>
            <head><title>Generating PDF...</title></head>
            <body style="font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: #f8fafc;">
              <div style="text-align: center; padding: 24px;">
                <div style="width: 40px; height: 40px; border: 3px solid #ef4444; border-top-color: transparent; border-radius: 50%; margin: 0 auto 16px; animation: spin 1s linear infinite;"></div>
                <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 8px;">⏳ Generating High-Res E-Paper PDF...</h2>
                <p style="color: #94a3b8; font-size: 14px;">कृपया प्रतीक्षा करें, आपकी ई-पेपर PDF तैयार हो रही है...</p>
              </div>
              <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
            </body>
          </html>
        `);
      } catch (_) {}
    }

    try {
      const backendBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const enriched = enrichPagesWithComputedSections(pages);
      const response = await fetch(`${backendBase}/epaper/generate-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          editionSlug: currentEditionInfo.slug,
          editionName: currentEditionInfo.name,
          editionTitle: currentEditionInfo.title,
          editionCity: currentEditionInfo.city,
          editionState: currentEditionInfo.state,
          publishDate: archiveDate,
          pages: enriched
        })
      });

      const resData = await response.json();
      if (resData.success && resData.data?.pdfUrl) {
        triggerToast('🎉 PDF Generated!');
        const rawUrl = resData.data.pdfUrl;
        const basePdf = rawUrl.startsWith('http')
          ? rawUrl
          : `http://localhost:5000${rawUrl}`;
        const openUrl = `${basePdf}${basePdf.includes('?') ? '&' : '?'}v=${Date.now()}`;

        if (previewTab && !previewTab.closed) {
          previewTab.location.href = openUrl;
        } else {
          window.open(openUrl, '_blank');
        }
      } else {
        if (previewTab && !previewTab.closed) previewTab.close();
        triggerToast(resData.message || 'PDF Generation failed.');
      }
    } catch (err: any) {
      if (previewTab && !previewTab.closed) previewTab.close();
      triggerToast(`PDF Generation error: ${err.message || 'Server error'}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Fixed Broadsheet Canvas Height: Always 2112px (14" x 22" • ~35cm x 56cm)
  const FIXED_BROADSHEET_HEIGHT = 2112;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-sans">
        <div className="flex items-center space-x-3 text-sm font-semibold">
          <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Free Canvas Studio Engine...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen max-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans select-none overflow-hidden">

      {/* TOP STUDIO MASTER HEADER */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-40 shadow-xs">

        {/* Brand Logo & Edition Controller */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Dashboard Button */}
          <a
            href="/admin/dashboard"
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-xs hover:border-slate-300"
            title="मुख्य एडमिन डैशबोर्ड पर वापस जाएं"
          >
            <ArrowLeft className="w-4 h-4 text-amber-600" />
            <span>डैशबोर्ड</span>
          </a>

          {/* Toggle Pages Stack Sidebar (Hamburger Menu Icon) */}
          <button
            type="button"
            onClick={() => setShowPagesSidebar(prev => !prev)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm ${
              showPagesSidebar
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 hover:border-slate-300'
                : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200 hover:border-red-300'
            }`}
            title={showPagesSidebar ? 'पेज स्टैक छुपाएं (Hide Pages Stack for More Canvas Space)' : 'पेज स्टैक दिखाएं (Show Pages Stack)'}
          >
            <Menu className="w-4 h-4 shrink-0 text-red-600" />
            <span className="hidden sm:inline font-mono text-[11px]">{showPagesSidebar ? 'Hide Pages' : 'Show Pages'}</span>
          </button>

          <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

          {/* City / Edition Selector */}
          <div className="hidden md:flex items-center space-x-2 text-xs">
            <span className="text-slate-500 font-medium">Edition:</span>
            <select
              value={edition}
              onChange={(e) => {
                setEdition(e.target.value);
                triggerToast(`Loaded Edition: ${e.target.value}`);
              }}
              className="bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-800 font-bold px-3 py-1.5 rounded-xl outline-none text-xs cursor-pointer focus:border-red-500 focus:bg-white shadow-xs"
            >
              {editionsList.map((ed) => (
                <option key={ed.id} value={ed.name}>
                  {ed.name}
                </option>
              ))}
            </select>
          </div>

          {/* Archive Date Calendar Switcher */}
          <div className="hidden lg:flex items-center space-x-2 text-xs">
            <span className="text-slate-500 font-medium">Archive Date:</span>
            <input
              type="date"
              value={archiveDate}
              onChange={(e) => {
                setArchiveDate(e.target.value);
                triggerToast(`Date set to ${e.target.value}`);
              }}
              className="bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-800 font-mono text-xs px-3 py-1.5 rounded-xl outline-none cursor-pointer focus:border-red-500 focus:bg-white shadow-xs"
            />
            {isPastUncreatedDate && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                <span>अंक नहीं बना (Not Created)</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Controls & Publish Button */}
        <div className="flex items-center space-x-3">

          {/* Export PDF Button */}
          <button
            onClick={handleGenerateBroadsheetPdf}
            disabled={isGeneratingPdf}
            className="hidden md:flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
          >
            {isGeneratingPdf ? (
              <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Download className="w-3.5 h-3.5 text-red-600" />
            )}
            <span>{isGeneratingPdf ? 'Generating PDF...' : '🖨️ Export High-Res PDF'}</span>
          </button>

          {/* Publish Paper Main Action Button */}
          <button
            onClick={handlePublishPaper}
            disabled={isGeneratingPdf}
            className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md shadow-red-600/25 transition-all cursor-pointer whitespace-nowrap disabled:opacity-60"
          >
            {isGeneratingPdf ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-4 h-4 shrink-0" />
            )}
            <span>{isGeneratingPdf ? 'Publishing...' : 'Publish Paper'}</span>
          </button>

        </div>

      </header>

      {/* 3-PANEL INDEPENDENT SCROLL WORKSPACE */}
      <div className="flex-1 flex overflow-hidden min-h-0 h-[calc(100vh-4rem)]">

        {/* 1. LEFT PANEL: PAGES STACK (Independent Scroll & Collapsible) */}
        <div
          className={`${
            showPagesSidebar ? 'w-56' : 'w-0 border-none'
          } transition-all duration-200 ease-in-out bg-white border-r border-slate-200 flex flex-col shrink-0 select-none h-full min-h-0 overflow-hidden shadow-sm`}
        >

          {/* Header tabs */}
          <div className="p-3.5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/50">
            <div className="flex items-center space-x-2 text-xs font-black text-slate-800 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-red-600" />
              <span>Pages Stack ({pages.length})</span>
            </div>
            <button
              type="button"
              onClick={() => setShowPagesSidebar(false)}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="पेज लिस्ट छुपाएं (Hide Pages Stack)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Toast Alert Banner */}
          {toastMsg && (
            <div className="mx-3 mt-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold rounded-xl flex items-center space-x-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span className="truncate">{toastMsg}</span>
            </div>
          )}

          {/* Pages Thumbnails List */}
          <div className="flex-1 p-3 space-y-3 overflow-y-auto no-scrollbar bg-white">
            {pages.map((pg) => {
              const isActive = pg.id === activePageId;
              return (
                <div
                  key={pg.id}
                  onClick={() => handleSelectPage(pg)}
                  className={`p-3 rounded-2xl transition-all cursor-pointer space-y-2 relative group ${isActive
                    ? 'bg-red-50/50 border-2 border-red-600 shadow-md shadow-red-600/10'
                    : 'bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100/80'
                    }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                    <span className="truncate max-w-[120px]">{pg.title}</span>
                    <div className="flex items-center space-x-1">
                      {isActive && (
                        <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.2 rounded font-extrabold">Active</span>
                      )}
                      {pages.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePage(pg.id);
                          }}
                          className="p-1 hover:bg-red-100 rounded text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Page"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Miniature Broadsheet Print Replica Box */}
                  <div className="bg-[#fcfbf7] rounded p-2 text-[6px] text-slate-900 font-serif leading-none space-y-1 shadow-xs h-28 overflow-hidden border border-slate-200">
                    <div className="text-center font-black text-red-700 text-[9px] border-b border-slate-200 pb-0.5">
                      अपना पटना
                    </div>
                    <div className="font-bold text-[7px] text-slate-900 line-clamp-2">
                      {(pg.slots[0]?.headline || 'व्यावसायिक प्रतिष्ठानों के संपत्ति कर का आकलन').replace(/<[^>]*>/g, '')}
                    </div>
                    <div className="text-[5.5px] text-slate-600 line-clamp-3">
                      {(pg.slots[0]?.summary || 'नगर निगम क्षेत्र में 100% शुद्ध पारदर्शी कर व्यवस्था लागू होगी।').replace(/<[^>]*>/g, '')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Page Button at Bottom */}
          <div className="p-3 border-t border-slate-200 bg-slate-50/80 space-y-2">
            <button
              type="button"
              onClick={handleCreatePage}
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase rounded-xl shadow-md flex items-center justify-center space-x-1.5 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Page</span>
            </button>
          </div>

        </div>

        {/* 2. CENTER PANEL: 100% FREE-FORM DRAG & RESIZE CANVAS (Independent Center 2D Scroll) */}
        <div className="flex-1 bg-[#eaeff5] p-6 overflow-x-auto overflow-y-auto h-full min-h-0 select-none no-scrollbar relative">
          {/* Quick Floating Re-open Button when Left Panel is Hidden */}
          {!showPagesSidebar && (
            <button
              type="button"
              onClick={() => setShowPagesSidebar(true)}
              className="fixed left-4 bottom-6 z-50 flex items-center space-x-2 px-3.5 py-2 bg-white hover:bg-slate-50 border-2 border-red-500 text-slate-800 rounded-xl shadow-2xl text-xs font-bold transition-all cursor-pointer backdrop-blur group"
              title="पेज स्टैक खोलें (Show Pages Stack)"
            >
              <Menu className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
              <span>Pages ({pages.length})</span>
            </button>
          )}

          <div className="min-w-full w-max flex flex-col items-center min-h-full">

            {/* Canvas Header Control Status Bar */}
            <div style={{ width: `${paperWidth}px`, maxWidth: `${paperWidth}px` }} className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-600">
              <span className="font-bold uppercase text-slate-700 flex items-center space-x-2">
                <Newspaper className="w-4 h-4 text-red-600 animate-pulse" />
                <span>FIXED BROADSHEET CANVAS (14" x 22" • ~35cm x 56cm • FIXED {paperWidth}px x {FIXED_BROADSHEET_HEIGHT}px)</span>
              </span>
              <div className="flex items-center space-x-3">
                {/* ⚡ AI News Editor Agent (Gemini Powered) */}
                <button
                  type="button"
                  onClick={() => setIsAiDrawerOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold font-sans flex items-center space-x-1.5 transition-all cursor-pointer bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md shadow-red-600/20 transform hover:scale-105 active:scale-95"
                  title="Open AI News Editor Agent (Gemini Powered)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '3.5s' }} />
                  <span>⚡ AI News Editor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSlotGuides(prev => !prev)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold font-sans flex items-center space-x-1.5 transition-all cursor-pointer border ${
                    showSlotGuides
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-xs'
                  }`}
                  title="स्लॉट की सीमा रेखाएं (Slot Boundaries Outline) चालू / बंद करें"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Slot Borders: {showSlotGuides ? 'VISIBLE (दिख रहे हैं)' : 'HIDDEN (छिपे हैं)'}</span>
                </button>
                <span className="text-emerald-700 font-bold hidden sm:inline">🖱️ Drag Header to Move • Drag Edges to Resize</span>
              </div>
            </div>

            {/* THE REAL PRINT BROADSHEET SHEET CANVAS (Absolute Positioned Container) */}
            <div
              style={{
                width: `${paperWidth}px`,
                minWidth: `${paperWidth}px`,
                maxWidth: `${paperWidth}px`,
                height: `${FIXED_BROADSHEET_HEIGHT}px`,
                minHeight: `${FIXED_BROADSHEET_HEIGHT}px`,
                maxHeight: `${FIXED_BROADSHEET_HEIGHT}px`
              }}
              className="bg-[#fffdf7] text-slate-950 border border-slate-300/80 shadow-2xl ring-1 ring-slate-900/5 p-6 sm:p-10 font-serif rounded-sm relative mb-20 shrink-0 overflow-hidden"
            >

              {/* Top Date Line Bar */}
              <div className="flex items-center justify-between border-b border-slate-900 pb-1 text-xs font-sans font-bold text-slate-800">
                <span>{currentEditionInfo.city} • {formatHindiDateString(archiveDate)}</span>
                <span className="font-serif italic text-slate-600">डिजिटल संस्करण • epaper</span>
                <span>पेज 0{activePage.pageNumber}</span>
              </div>

              {/* BIG RED BROADSHEET MASTHEAD */}
              <div className="text-center border-b-4 border-double border-slate-900 pb-1.5 space-y-0.5">
                <h1
                  style={{ fontFamily: "'Noto Serif Devanagari', 'Merriweather', serif", lineHeight: 0.95 }}
                  className="text-5xl sm:text-6xl font-black text-red-700 tracking-tight select-none"
                >
                  {currentEditionInfo.title}
                </h1>
                <div className="flex items-center justify-center space-x-3 text-[10px] font-sans font-bold uppercase tracking-wider text-slate-700 pt-0.5">
                  <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black">Free-Form Canvas</span>
                  <span>•</span>
                  <span>{currentEditionInfo.state}</span>
                  <span>•</span>
                  <span>{currentEditionInfo.name}</span>
                </div>
              </div>

              {/* IF PAGE IS 100% BLANK (0 SLOTS) */}
              {activePage.slots.length === 0 && (
                isPastUncreatedDate ? (
                  <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-amber-400/80 rounded-2xl bg-amber-50/70 text-center my-14 max-w-2xl mx-auto space-y-4 shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-md">
                      <AlertCircle className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-900 uppercase tracking-wide">
                        ⚠️ पिछली तिथि (Past Date) — कोई अंक नहीं बना
                      </span>
                      <h3 className="text-xl font-bold font-serif text-slate-900 mt-2">
                        इस तारीख ({archiveDate}) का कोई ई-पेपर नहीं बनाया गया है
                      </h3>
                      <p className="text-xs text-slate-600 font-sans mt-1">
                        (No ePaper was created or published for this date)
                      </p>
                      <p className="text-xs text-slate-500 font-sans mt-2">
                        यह तारीख पूरी तरह खाली है। यदि आप इस पिछली तारीख के लिए नया अंक तैयार करना चाहते हैं, तो नीचे बटन दबाकर पहला स्लॉट जोड़ें।
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCustomSlot}
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2 transition-all cursor-pointer transform hover:scale-105"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>+ इस तारीख के लिए नया अंक बनाएं (+ Create Paper)</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-red-300 rounded-2xl bg-red-50/30 text-center my-16 max-w-2xl mx-auto space-y-4">
                    <div className="w-16 h-16 rounded-full bg-red-100 border border-red-300 flex items-center justify-center text-red-600 shadow-md">
                      <PlusCircle className="w-8 h-8 animate-bounce" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-serif text-slate-900">
                        पेज 0{activePage.pageNumber} अभी पूरी तरह खाली (Blank Page) है
                      </h3>
                      <p className="text-xs text-slate-600 font-sans mt-1">
                        इस नए पन्ने पर समाचार प्रकाशित करने के लिए पहला News Slot जोड़ें।
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCustomSlot}
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2 transition-all cursor-pointer transform hover:scale-105"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>+ नया News Slot जोड़ें (Add First Slot)</span>
                    </button>
                  </div>
                )
              )}

              {/* ABSOLUTE POSITIONED SLOTS CONTAINER */}
              {activePage.slots.map((s) => {
                const isSelected = s.id === activeSlotId;
                const isBeingDragged = dragState?.slotId === s.id;

                const slotStyle: React.CSSProperties = {
                  position: 'absolute',
                  left: `${s.x}px`,
                  top: `${s.y}px`,
                  width: `${s.width}px`,
                  height: `${s.height}px`,
                  willChange: isBeingDragged ? 'left, top, width, height' : undefined,
                  transition: isBeingDragged ? 'none' : 'box-shadow 0.15s ease'
                };

                if (s.isAd) {
                  return (
                    <div
                      key={s.id}
                      onMouseDown={(e) => handleStartDrag(e, s, 'move')}
                      onClick={() => handleSelectSlot(s)}
                      style={slotStyle}
                      className={`p-3.5 bg-amber-100/90 rounded-xl border-2 border-amber-400 text-center space-y-1 transition-shadow cursor-move relative overflow-hidden group select-none print:border-none print:shadow-none ${isSelected ? 'ring-4 ring-red-600/40 border-red-600 z-30 shadow-2xl' : 'z-10'
                        }`}
                    >
                      {/* Header bar for dragging position */}
                      <div
                        className="flex items-center justify-between font-sans mb-1 bg-amber-300/80 px-2 py-1 rounded cursor-move"
                      >
                        <span className="text-[9px] font-black uppercase text-amber-900 flex items-center space-x-1">
                          <Move className="w-3 h-3 text-red-600" />
                          <span>Slot {s.slotNumber} (Ad Box • Click & Drag Anywhere)</span>
                        </span>

                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectSlot(s);
                              handleOpenRichEditor(s);
                            }}
                            className="p-1 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded cursor-pointer flex items-center space-x-0.5 text-[9px] font-bold"
                            title="Edit Ad Slot"
                          >
                            <Edit3 className="w-2.5 h-2.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSlotById(s.id);
                            }}
                            className="p-1 bg-red-600 hover:bg-red-500 text-white rounded cursor-pointer"
                            title="Delete Slot"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-lg font-black text-blue-900 font-sans tracking-wide break-words">
                        {s.headline}
                      </h4>
                      <p className="text-[11px] font-bold text-red-700 font-sans leading-tight block break-words">{s.subHeadline}</p>
                      <p className="text-[10px] font-semibold text-slate-700 font-mono break-words">{s.summary}</p>
                    </div>
                  );
                }

                return (
                  <div
                    key={s.id}
                    onMouseDown={(e) => handleStartDrag(e, s, 'move')}
                    onClick={() => handleSelectSlot(s)}
                    style={slotStyle}
                    className={`cursor-move relative group select-none print:border-none print:shadow-none ${
                      isBeingDragged ? 'transition-none cursor-grabbing z-40' : 'transition-colors duration-150'
                    } ${
                      isSelected
                        ? 'border-2 border-red-600 ring-4 ring-red-600/30 shadow-2xl z-30 bg-white/40 rounded-xl'
                        : showSlotGuides
                          ? 'border-2 border-dashed border-slate-400/90 hover:border-red-500 hover:border-solid bg-white/10 z-10 rounded-lg shadow-xs'
                          : 'border-2 border-transparent hover:border-red-400/40 z-10 rounded-lg'
                    }`}
                  >
                    {/* SLOT ACTION CONTROLS (Hover or Selected: Edit Button & Delete Button) */}
                    <div
                      className={`absolute top-1.5 right-1.5 z-30 flex items-center space-x-1.5 print:hidden pointer-events-auto transition-opacity duration-150 ${
                        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <button
                        type="button"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectSlot(s);
                          handleOpenRichEditor(s);
                        }}
                        className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded shadow-md flex items-center space-x-1 cursor-pointer transition-transform hover:scale-105 border border-amber-500/50"
                        title="Word-Style Text Editor (एडिट करें)"
                      >
                        <Edit3 className="w-3 h-3 text-slate-950" />
                        <span>Edit</span>
                      </button>
                      {isSelected && (
                        <button
                          type="button"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSlotById(s.id);
                          }}
                          className="bg-red-600 hover:bg-red-500 text-white p-1 rounded shadow-md flex items-center justify-center cursor-pointer transition-transform hover:scale-105 border border-red-700"
                          title="Delete Slot"
                        >
                          <Trash2 className="w-3 h-3 text-white" />
                        </button>
                      )}
                    </div>

                    {/* CARD CONTENT WRAPPER (100% PURE NEWSPAPER) */}
                    <div className="w-full h-full p-2 flex flex-col overflow-hidden space-y-1">
                      {/* Slot Headline (Never Cut Off / Full Display) */}
                      <div id={`slot-header-${s.id}`} className="space-y-0.5">
                        {Boolean((s.categoryBadge || (s as any).categoryTag)?.trim()) && (
                          <div className="mb-1 flex items-center">
                            <span
                              style={{ fontFamily: "'Inter', 'Mukta', sans-serif" }}
                              className="inline-flex items-center px-1.5 py-0.5 rounded bg-red-600 text-white text-[9.5px] font-bold uppercase tracking-wide leading-none shadow-xs"
                            >
                              {(s.categoryBadge || (s as any).categoryTag).trim()}
                            </span>
                          </div>
                        )}

                        <h2
                          style={{
                            fontFamily: "'Noto Serif Devanagari', 'Merriweather', serif",
                            fontSize: `${s.headlineFontSize || 22}px`,
                            color: s.headlineColor || '#020617'
                          }}
                          className="font-black text-slate-950 leading-tight break-words"
                          dangerouslySetInnerHTML={{ __html: s.headline || '' }}
                        />

                        {s.subHeadline && (
                          <p
                            style={{
                              fontFamily: "'Mukta', 'Inter', sans-serif",
                              fontSize: `${s.subHeadlineFontSize || 13}px`,
                              color: s.subHeadlineColor || '#b91c1c'
                            }}
                            className="font-bold text-red-700 leading-tight block break-words text-justify my-0.5"
                            dangerouslySetInnerHTML={{ __html: s.subHeadline || '' }}
                          />
                        )}
                      </div>

                      {/* PURE CONTINUOUS NATIVE NEWSPAPER MULTI-COLUMN & AUTO-WRAP ENGINE */}
                      {(() => {
                        const comp = computeSlotSections(s);
                        const hasImage = Boolean(s.imageUrl && !imgErrorMap[s.id]);
                        const cardContentW = Math.max(100, s.width - 24);
                        const isDraggingThisImg = dragState?.mode === 'drag-card-img' && dragState.slotId === s.id;
                        const isResizingThisImg = (dragState?.mode === 'resize-img-corner' || dragState?.mode === 'resize-img-w' || dragState?.mode === 'resize-img-h') && dragState?.slotId === s.id;
                        const isManipulatingImg = isDraggingThisImg || isResizingThisImg;
                        const vertAlign: 'top' | 'middle' | 'bottom' = s.imageVertAlign || 'top';
                        const normAlign = (s.imageAlignment || s.imageAlign || 'Center').toLowerCase();
                        const isLeft = normAlign === 'left';
                        const isRight = normAlign === 'right';

                        if (!hasImage) {
                          return (
                            <div className="flex-1 min-h-0 text-slate-800 text-[10.5px] leading-normal select-none w-full overflow-hidden shrink-0">
                              <div
                                style={{
                                  fontFamily: "'Noto Serif Devanagari', 'Merriweather', serif",
                                  lineHeight: '1.38',
                                  columnCount: comp.colsCount > 1 ? comp.colsCount : undefined,
                                  columnGap: `${comp.colGap}px`,
                                  columnFill: 'auto',
                                  height: `${comp.fullStoryH}px`,
                                  maxHeight: `${comp.fullStoryH}px`,
                                  overflow: 'hidden',
                                  columnRule: comp.showDivider ? '1px solid #cbd5e1' : undefined,
                                  textAlign: 'justify',
                                  textJustify: 'inter-word',
                                  fontSize: s.summaryFontSize ? `${s.summaryFontSize}px` : undefined,
                                  color: s.summaryColor || undefined,
                                  whiteSpace: 'pre-line'
                                }}
                                className="leading-normal h-full overflow-hidden whitespace-pre-line text-justify"
                                dangerouslySetInnerHTML={{ __html: s.summary || '' }}
                              />
                            </div>
                          );
                        }

                        // Mode 1: 1-COLUMN LAYOUT OR GENUINE FULL-WIDTH PHOTO
                        if (comp.isFullWidth) {
                          const bannerTextH = comp.underPhotoH;
                          const isTopSpanPhoto = s.imageWrapMode === 'top-span' || (s.imageWidth && s.imageWidth >= cardContentW - 30);
                          const currentImgW = isTopSpanPhoto ? cardContentW : Math.min(s.imageWidth || 180, cardContentW);
                          const maxPxX = Math.max(0, cardContentW - currentImgW);

                          let photoPxX = 0;
                          if (isTopSpanPhoto) {
                            photoPxX = 0;
                          } else if (s.imgPxX !== undefined) {
                            photoPxX = Math.max(0, Math.min(maxPxX, s.imgPxX));
                          } else {
                            if (isLeft) photoPxX = 0;
                            else if (isRight) photoPxX = maxPxX;
                            else photoPxX = Math.round(maxPxX / 2);
                          }

                          const singleColPhoto = (
                            <div className="w-full mb-1.5 shrink-0 relative select-none">
                              <span
                                onMouseDown={(e) => handleStartDrag(e, s, 'drag-card-img')}
                                style={{
                                  width: isTopSpanPhoto ? '100%' : `${currentImgW}px`,
                                  height: `${s.imageHeight || 140}px`,
                                  display: 'block',
                                  marginLeft: isTopSpanPhoto ? '0px' : `${photoPxX}px`,
                                  willChange: isManipulatingImg ? 'width, height, margin-left' : undefined,
                                  transition: isManipulatingImg ? 'none' : 'box-shadow 0.15s ease'
                                }}
                                className={`block overflow-visible shadow-md cursor-grab active:cursor-grabbing bg-slate-900 group/img relative select-none rounded-md border-2 ${
                                  isManipulatingImg
                                    ? 'border-amber-500 shadow-2xl ring-4 ring-amber-400/50'
                                    : 'border-slate-300 hover:border-slate-400'
                                }`}
                                title="Feature Photo (Drag to Move Smoothly Anywhere • Drag Corner Arrow to Resize)"
                              >
                                <div className="w-full h-full overflow-hidden rounded-[4px] relative pointer-events-none">
                                  <img
                                    src={s.imageUrl}
                                    alt="Slot photo"
                                    draggable={false}
                                    className="w-full h-full object-cover pointer-events-none select-none block"
                                    onError={() => setImgErrorMap(prev => ({ ...prev, [s.id]: true }))}
                                  />
                                </div>

                                {/* Clean Bottom-Right Corner Arrow to Resize Photo */}
                                <div
                                  onMouseDown={(e) => handleStartDrag(e, s, 'resize-img-corner')}
                                  className="absolute -bottom-2 -right-2 px-1.5 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-[9px] font-bold rounded flex items-center space-x-0.5 shadow-lg border border-white cursor-se-resize z-30 select-none opacity-90 hover:opacity-100 hover:scale-105"
                                  title="Drag Corner Arrow to Resize Image Width & Height"
                                >
                                  <ArrowLeftRight className="w-2.5 h-2.5 rotate-45 text-slate-950" />
                                  <span>{Math.round(s.imageWidth || 180)}×{Math.round(s.imageHeight || 140)}px</span>
                                </div>
                              </span>
                            </div>
                          );

                          const textDiv = (
                            <div
                              style={{
                                fontFamily: "'Noto Serif Devanagari', 'Merriweather', serif",
                                lineHeight: '1.38',
                                columnCount: comp.colsCount > 1 ? comp.colsCount : undefined,
                                columnGap: `${comp.colGap}px`,
                                columnFill: 'auto',
                                height: comp.colsCount > 1 ? `${bannerTextH}px` : undefined,
                                maxHeight: `${bannerTextH}px`,
                                overflow: 'hidden',
                                columnRule: comp.showDivider ? '1px solid #cbd5e1' : undefined,
                                textAlign: 'justify',
                                textJustify: 'inter-word',
                                fontSize: s.summaryFontSize ? `${s.summaryFontSize}px` : undefined,
                                color: s.summaryColor || undefined,
                                whiteSpace: 'pre-line'
                              }}
                              className="leading-[1.35] flex-1 overflow-hidden break-words whitespace-pre-line text-justify"
                              dangerouslySetInnerHTML={{ __html: comp.text1 || s.summary || '' }}
                            />
                          );

                          return (
                            <div className="flex-1 min-h-0 text-slate-800 text-[10.5px] leading-normal select-none w-full flex flex-col overflow-hidden shrink-0">
                              {vertAlign === 'bottom' ? (
                                <>
                                  {textDiv}
                                  {singleColPhoto}
                                </>
                              ) : (
                                <>
                                  {singleColPhoto}
                                  {textDiv}
                                </>
                              )}
                            </div>
                          );
                        }

                        // Mode 2: GENERALIZED BROADSHEET MULTI-COLUMN ENGINE (Sequential Flow!)
                        const colStyleLeft: React.CSSProperties = {
                          fontFamily: "'Noto Serif Devanagari', 'Merriweather', serif",
                          lineHeight: '1.38',
                          columnCount: comp.leftCols > 1 ? comp.leftCols : undefined,
                          columnGap: `${comp.colGap}px`,
                          columnFill: 'auto',
                          height: comp.leftCols > 1 ? `${comp.fullStoryH}px` : undefined,
                          maxHeight: `${comp.fullStoryH}px`,
                          overflow: 'hidden',
                          columnRule: comp.showDivider ? '1px solid #cbd5e1' : undefined,
                          textAlign: 'justify',
                          textJustify: 'inter-word',
                          fontSize: s.summaryFontSize ? `${s.summaryFontSize}px` : undefined,
                          color: s.summaryColor || undefined,
                          whiteSpace: 'pre-line'
                        };

                        const colStylePhoto: React.CSSProperties = {
                          fontFamily: "'Noto Serif Devanagari', 'Merriweather', serif",
                          lineHeight: '1.38',
                          columnCount: comp.photoCols > 1 ? comp.photoCols : undefined,
                          columnGap: `${comp.colGap}px`,
                          columnFill: 'auto',
                          height: comp.photoCols > 1 ? `${comp.underPhotoH}px` : undefined,
                          maxHeight: `${comp.underPhotoH}px`,
                          overflow: 'hidden',
                          columnRule: comp.showDivider ? '1px solid #cbd5e1' : undefined,
                          textAlign: 'justify',
                          textJustify: 'inter-word',
                          fontSize: s.summaryFontSize ? `${s.summaryFontSize}px` : undefined,
                          color: s.summaryColor || undefined,
                          whiteSpace: 'pre-line'
                        };

                        const colStyleRight: React.CSSProperties = {
                          fontFamily: "'Noto Serif Devanagari', 'Merriweather', serif",
                          lineHeight: '1.38',
                          columnCount: comp.rightCols > 1 ? comp.rightCols : undefined,
                          columnGap: `${comp.colGap}px`,
                          columnFill: 'auto',
                          height: comp.rightCols > 1 ? `${comp.fullStoryH}px` : undefined,
                          maxHeight: `${comp.fullStoryH}px`,
                          overflow: 'hidden',
                          columnRule: comp.showDivider ? '1px solid #cbd5e1' : undefined,
                          textAlign: 'justify',
                          textJustify: 'inter-word',
                          fontSize: s.summaryFontSize ? `${s.summaryFontSize}px` : undefined,
                          color: s.summaryColor || undefined,
                          whiteSpace: 'pre-line'
                        };

                        const displayImgW = Math.max(30, Math.min(s.imageWidth || comp.photoSectionW, comp.photoSectionW));
                        const localMaxPxX = Math.max(0, comp.photoSectionW - displayImgW);
                        let localPhotoPxX = 0;
                        if (s.imgPxX !== undefined) {
                          const sectionStartX = comp.leftCols > 0 ? (comp.leftCols * comp.singleColW) + (comp.leftCols * comp.colGap) : 0;
                          localPhotoPxX = Math.max(0, Math.min(localMaxPxX, s.imgPxX - sectionStartX));
                        } else {
                          if (isLeft) localPhotoPxX = 0;
                          else if (isRight) localPhotoPxX = localMaxPxX;
                          else localPhotoPxX = Math.round(localMaxPxX / 2);
                        }

                        const photoBlock = (
                          <div className="w-full mb-1.5 shrink-0 relative select-none">
                            <span
                              onMouseDown={(e) => handleStartDrag(e, s, 'drag-card-img')}
                              style={{
                                width: s.imageWidth && s.imageWidth < comp.photoSectionW ? `${displayImgW}px` : '100%',
                                height: `${s.imageHeight || 140}px`,
                                display: 'block',
                                marginLeft: s.imageWidth && s.imageWidth < comp.photoSectionW ? `${localPhotoPxX}px` : '0px',
                                willChange: isManipulatingImg ? 'width, height, margin-left' : undefined,
                                transition: isManipulatingImg ? 'none' : 'box-shadow 0.15s ease'
                              }}
                              className={`block overflow-visible shadow-md cursor-grab active:cursor-grabbing bg-slate-900 group/img relative select-none rounded-md border-2 ${
                                isManipulatingImg
                                  ? 'border-amber-500 shadow-2xl ring-4 ring-amber-400/50'
                                  : 'border-slate-300 hover:border-slate-400'
                              }`}
                              title="Feature Photo (Drag to Move Smoothly Anywhere • Drag Corner Arrow to Resize Width & Height)"
                            >
                              <div className="w-full h-full overflow-hidden rounded-[4px] relative pointer-events-none">
                                <img
                                  src={s.imageUrl}
                                  alt="Slot photo"
                                  draggable={false}
                                  className="w-full h-full object-cover pointer-events-none select-none block"
                                  onError={() => setImgErrorMap(prev => ({ ...prev, [s.id]: true }))}
                                />
                                <div className="absolute top-1 left-1 bg-black/80 backdrop-blur-xs text-amber-300 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded shadow pointer-events-none opacity-0 group-hover/img:opacity-100 transition-opacity z-20">
                                  {Math.round(s.imageWidth || comp.photoSectionW)}×{Math.round(s.imageHeight || 140)}px
                                </div>
                              </div>

                              {/* Clean Bottom-Right Corner Arrow: Resizes BOTH Width & Height! */}
                              <div
                                onMouseDown={(e) => handleStartDrag(e, s, 'resize-img-corner')}
                                className="absolute -bottom-2 -right-2 px-1.5 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-[9px] font-bold rounded flex items-center space-x-0.5 shadow-lg border border-white cursor-se-resize z-30 select-none opacity-90 hover:opacity-100 hover:scale-105"
                                title="Drag Corner Arrow to Resize Photo Width & Height"
                              >
                                <ArrowLeftRight className="w-2.5 h-2.5 rotate-45 text-slate-950" />
                                <span>{Math.round(s.imageWidth || comp.photoSectionW)}×{Math.round(s.imageHeight || 140)}px</span>
                              </div>
                            </span>
                          </div>
                        );

                        return (
                          <div
                            style={{ gap: `${comp.colGap}px` }}
                            className="flex-1 min-h-0 font-serif text-slate-800 text-[10.5px] leading-normal select-none w-full flex items-start overflow-hidden shrink-0"
                          >
                            {/* 1. Left Section: Columns before Photo (Starts at TOP!) */}
                            {comp.leftCols > 0 && (
                              <>
                                <div
                                  style={{ width: `${comp.leftSectionW}px`, height: '100%' }}
                                  className="flex flex-col shrink-0 overflow-hidden"
                                >
                                  <div
                                    style={colStyleLeft}
                                    className="leading-normal font-serif w-full overflow-hidden break-words whitespace-pre-line text-justify"
                                    dangerouslySetInnerHTML={{ __html: comp.text1 }}
                                  />
                                </div>
                                {comp.showDivider && <div className="self-stretch w-px min-w-[1px] bg-slate-300 border-l border-slate-300 shrink-0" />}
                              </>
                            )}

                            {/* 2. Photo Section: Photo & Text based on vertAlign */}
                            <div
                              style={{ width: `${comp.photoSectionW}px`, height: '100%' }}
                              className="flex flex-col shrink-0 overflow-hidden"
                            >
                              {vertAlign === 'top' && (
                                <>
                                  {photoBlock}
                                  <div
                                    style={colStylePhoto}
                                    className="leading-normal font-serif flex-1 overflow-hidden break-words whitespace-pre-line text-justify"
                                    dangerouslySetInnerHTML={{ __html: comp.text2 }}
                                  />
                                </>
                              )}

                              {vertAlign === 'bottom' && (
                                <>
                                  <div
                                    style={colStylePhoto}
                                    className="leading-normal font-serif flex-1 overflow-hidden break-words mb-2 whitespace-pre-line text-justify"
                                    dangerouslySetInnerHTML={{ __html: comp.text2 }}
                                  />
                                  {photoBlock}
                                </>
                              )}

                              {vertAlign === 'middle' && (
                                <>
                                  <div
                                    style={{ ...colStylePhoto, height: `${Math.floor(comp.underPhotoH / 2)}px`, maxHeight: `${Math.floor(comp.underPhotoH / 2)}px`, flex: 'none' }}
                                    className="leading-normal font-serif overflow-hidden break-words mb-1.5 whitespace-pre-line text-justify"
                                    dangerouslySetInnerHTML={{ __html: comp.text2 }}
                                  />
                                  {photoBlock}
                                  <div
                                    style={{ ...colStylePhoto, height: `${Math.ceil(comp.underPhotoH / 2)}px`, maxHeight: `${Math.ceil(comp.underPhotoH / 2)}px`, flex: '1' }}
                                    className="leading-normal font-serif overflow-hidden break-words mt-1.5 whitespace-pre-line text-justify"
                                    dangerouslySetInnerHTML={{ __html: comp.text2b }}
                                  />
                                </>
                              )}
                            </div>

                            {/* 3. Right Section: Columns after Photo */}
                            {comp.rightCols > 0 && (
                              <>
                                {comp.showDivider && <div className="self-stretch w-px min-w-[1px] bg-slate-300 border-l border-slate-300 shrink-0" />}
                                <div
                                  style={{ width: `${comp.rightSectionW}px`, height: '100%' }}
                                  className="flex flex-col flex-1 overflow-hidden"
                                >
                                  <div
                                    style={colStyleRight}
                                    className="leading-normal font-serif w-full overflow-hidden break-words whitespace-pre-line text-justify"
                                    dangerouslySetInnerHTML={{ __html: comp.text3 }}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* RESIZE HANDLE: BOTTOM-RIGHT CORNER (Both Width & Height Free Resize) */}
                    {isSelected && (
                      <div
                        onMouseDown={(e) => handleStartDrag(e, s, 'resize-corner')}
                        className="absolute -bottom-2.5 -right-2.5 px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white font-mono text-[9px] font-bold rounded-lg flex items-center space-x-1 shadow-2xl border-2 border-white cursor-se-resize z-50"
                        title="Drag Mouse Corner to Resize Exact Width & Height"
                      >
                        <ArrowLeftRight className="w-3 h-3 rotate-45" />
                        <span>{s.width}x{s.height}px</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* BOTTOM PAGE BOUNDARY LIMIT LINE (Fixed Height: 2112px) */}
              <div className="absolute bottom-0 left-0 right-0 h-10 border-t-2 border-dashed border-red-600 bg-red-50/95 px-6 flex items-center justify-between font-sans text-xs font-black text-red-700 z-30 select-none shadow-md">
                <span className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                  <span>🛑 PAGE 0{activePage.pageNumber} BOTTOM BOUNDARY (Fixed Height: 2112px • ~56cm Broadsheet)</span>
                </span>
                <span className="hidden sm:inline bg-red-600 text-white px-3 py-1 rounded-full text-[11px] font-bold">
                  Space Full? Click "+ Add Page" for Page 0{activePage.pageNumber + 1}
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* 3. RIGHT PANEL: 100% FREE GEOMETRY & CONTENT CONTROLLER (Independent Right Scroll) */}
        <div className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 select-none h-full min-h-0 shadow-sm">

          {/* Engine Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-2 text-xs font-black text-slate-800 uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-red-600" />
              <span>FREE GEOMETRY & CONTENT</span>
            </div>
            <span className="bg-red-50 text-red-600 border border-red-200 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
              Slot #{activeSlot.slotNumber}
            </span>
          </div>

          {/* Form Controls Container */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto text-xs no-scrollbar bg-white">

            {/* UNLIMITED SLOT ADD BUTTON */}
            <button
              type="button"
              onClick={handleAddCustomSlot}
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-red-600/20 transition-all cursor-pointer text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Slot (Total: {activePage.slots.length})</span>
            </button>

            {/* ACTIVE SELECTED SLOT QUICK ACTIONS & WORD-STYLE EDIT */}
            <div className="p-3 bg-red-50/40 rounded-2xl border-2 border-red-500/30 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                  <span className="font-mono text-xs font-black uppercase text-red-700">
                    Slot #{activeSlot.slotNumber}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    ({activeSlot.width}px × {activeSlot.height}px)
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="text-[9px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-xs">
                    X:{activeSlot.x} Y:{activeSlot.y}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteSlotById(activeSlotId)}
                    className="p-1 bg-red-100 hover:bg-red-600 text-red-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Delete this Slot"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* ⚡ Quick AI Editor Trigger */}
              <button
                type="button"
                onClick={() => setIsAiDrawerOpen(true)}
                className="w-full mt-2 py-2 px-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs rounded-xl shadow-md shadow-red-600/20 flex items-center justify-center space-x-1.5 transition-all cursor-pointer transform hover:scale-[1.01]"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
                <span>⚡ AI News Editor से लिखवाएं / सुधारें</span>
              </button>

            </div>

            {/* 100% FREE-FORM POSITION (X, Y) & SIZE (W, H) NUMERIC CONTROLLERS */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-700 tracking-wider border-b border-slate-200 pb-2">
                <span className="flex items-center space-x-1.5 text-red-600">
                  <Move3D className="w-3.5 h-3.5" />
                  <span>POSITION & SIZE (1px to Npx)</span>
                </span>
                <span className="text-slate-800 font-mono font-bold">Slot #{activeSlot.slotNumber}</span>
              </div>

              {/* 100% FREE-FORM POSITION (X, Y) & SIZE (W, H) NUMERIC CONTROLLERS */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600">
                <div className="bg-white border border-slate-200 p-2 rounded-xl flex items-center justify-between shadow-xs">
                  <span>X (Left):</span>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min={0}
                      value={formX}
                      onChange={(e) => handleUpdateGeometryForm('x', Math.max(0, Number(e.target.value)))}
                      className="w-16 bg-slate-50 border border-slate-200 focus:bg-white text-slate-900 font-mono font-bold px-1.5 py-0.5 rounded text-right text-xs outline-none focus:border-red-500"
                    />
                    <span className="text-slate-400 font-mono">px</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-2 rounded-xl flex items-center justify-between shadow-xs">
                  <span>Y (Top):</span>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min={0}
                      value={formY}
                      onChange={(e) => handleUpdateGeometryForm('y', Math.max(0, Number(e.target.value)))}
                      className="w-16 bg-slate-50 border border-slate-200 focus:bg-white text-slate-900 font-mono font-bold px-1.5 py-0.5 rounded text-right text-xs outline-none focus:border-red-500"
                    />
                    <span className="text-slate-400 font-mono">px</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-2 rounded-xl flex items-center justify-between shadow-xs">
                  <span>Width:</span>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min={1}
                      value={formW}
                      onChange={(e) => handleUpdateGeometryForm('w', Math.max(1, Number(e.target.value)))}
                      className="w-16 bg-slate-50 border border-slate-200 focus:bg-white text-slate-900 font-mono font-bold px-1.5 py-0.5 rounded text-right text-xs outline-none focus:border-red-500"
                    />
                    <span className="text-slate-400 font-mono">px</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-2 rounded-xl flex items-center justify-between shadow-xs">
                  <span>Height:</span>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min={1}
                      value={formH}
                      onChange={(e) => handleUpdateGeometryForm('h', Math.max(1, Number(e.target.value)))}
                      className="w-16 bg-slate-50 border border-slate-200 focus:bg-white text-slate-900 font-mono font-bold px-1.5 py-0.5 rounded text-right text-xs outline-none focus:border-red-500"
                    />
                    <span className="text-slate-400 font-mono">px</span>
                  </div>
                </div>
              </div>



              {/* Delete & Ad Toggles */}
              <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                <label className="flex items-center space-x-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={formIsAd}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setFormIsAd(val);
                      handleUpdateSlotField('isAd', val);
                    }}
                    className="accent-red-600 rounded"
                  />
                  <span>Sponsored Ad Box</span>
                </label>

                <button
                  type="button"
                  onClick={() => handleDeleteSlotById(activeSlotId)}
                  className="text-red-600 hover:text-red-700 font-bold text-[10px] flex items-center space-x-1 cursor-pointer"
                >
                  <Trash className="w-3 h-3" />
                  <span>Delete Slot</span>
                </button>
              </div>
            </div>

            {/* Headline Input (Hindi) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Headline (Hindi)
              </label>
              <textarea
                rows={2}
                value={formHeadline}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormHeadline(val);
                  handleUpdateSlotField('headline', val);
                }}
                placeholder="यहाँ मुख्य शीर्षक लिखें..."
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 text-slate-900 font-serif font-bold p-2.5 rounded-xl outline-none text-sm transition-colors shadow-xs"
              />
            </div>

            {/* Category / Tag Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Category / Tag (ट्रेंडिंग / श्रेणी)
              </label>
              <input
                type="text"
                value={formCategory}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormCategory(val);
                  handleUpdateSlotField('categoryBadge', val);
                }}
                placeholder="ट्रेंडिंग / नगर निगम / स्वास्थ्य"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 text-slate-900 font-bold p-2.5 rounded-xl outline-none text-xs transition-colors shadow-xs"
              />
              {/* Quick Preset Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['ट्रेंडिंग', 'बड़ी खबर', 'राजनीति', 'नगर निगम', 'अपराध', 'खेल', 'विशेष', 'संपादकीय'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setFormCategory(tag);
                      handleUpdateSlotField('categoryBadge', tag);
                    }}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                      formCategory === tag
                        ? 'bg-red-600 border-red-500 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400 hover:text-slate-900 shadow-xs'
                    }`}
                  >
                    {tag === 'ट्रेंडिंग' ? '🔥 ' + tag : tag}
                  </button>
                ))}
                {formCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormCategory('');
                      handleUpdateSlotField('categoryBadge', '');
                    }}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-red-600 hover:bg-red-50 border border-slate-200 cursor-pointer"
                    title="हटाएं"
                  >
                    ✕ हटाएं
                  </button>
                )}
              </div>
            </div>

            {/* Sub-Headline Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Sub-Headline (Hindi)
              </label>
              <input
                type="text"
                value={formSubHeadline}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormSubHeadline(val);
                  handleUpdateSlotField('subHeadline', val);
                }}
                placeholder="उप-शीर्षक यहाँ लिखें..."
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 text-slate-800 p-2.5 rounded-xl outline-none text-xs transition-colors shadow-xs"
              />
            </div>

            {/* Featured Image Upload Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <span>Featured Photo</span>
                {formImageUrl && (
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="text-red-600 hover:text-red-700 font-bold text-[10px] cursor-pointer"
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageFileUpload}
                className="hidden"
              />

              <div className="space-y-2">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2.5 px-3 border border-dashed border-slate-300 hover:border-red-500 rounded-xl bg-slate-50 hover:bg-red-50/20 flex items-center justify-center space-x-2 text-slate-600 text-[11px] cursor-pointer group transition-all"
                >
                  <Upload className="w-4 h-4 text-red-600 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-slate-700 group-hover:text-red-600 truncate">
                    Upload Image
                  </span>
                </div>
              </div>
            </div>

            {/* Photo Size (W, H) Controls */}
            <div className="space-y-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <span>PHOTO SIZE</span>
                <span className="text-[9px] font-mono text-slate-500">px</span>
              </div>

              {/* Photo Numeric Input Grid */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600">
                <div className="bg-white border border-slate-200 p-2 rounded-xl flex items-center justify-between shadow-xs">
                  <span>Photo W:</span>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min={10}
                      max={3000}
                      value={formImageWidth}
                      onChange={(e) => handleUpdateImageWidth(Number(e.target.value))}
                      className="w-16 bg-slate-50 border border-slate-200 focus:bg-white text-slate-900 font-mono font-bold px-1.5 py-0.5 rounded text-right text-xs outline-none focus:border-red-500"
                    />
                    <span className="text-slate-400 font-mono">px</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-2 rounded-xl flex items-center justify-between shadow-xs">
                  <span>Photo H:</span>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min={10}
                      max={3000}
                      value={formImageHeight}
                      onChange={(e) => handleUpdateImageHeight(Number(e.target.value))}
                      className="w-16 bg-slate-50 border border-slate-200 focus:bg-white text-slate-900 font-mono font-bold px-1.5 py-0.5 rounded text-right text-xs outline-none focus:border-red-500"
                    />
                    <span className="text-slate-400 font-mono">px</span>
                  </div>
                </div>
              </div>

              {/* Quick Fit Full Width Button */}
              <button
                type="button"
                onClick={handleFitImageFullWidth}
                className="w-full py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-xs"
                title="फोटो को कार्ड की पूरी चौड़ाई (100% Full Width) में सेट करें"
              >
                <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
                <span>Fit 100% Full Width (पूरी चौड़ाई में सेट करें)</span>
              </button>
            </div>

            {/* TEXT STYLING (FONT SIZE & COLORS) */}
            <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2">
                <span>🎨 TEXT SIZE & COLOR STYLING</span>
              </div>

              {/* 1. Headline Formatting */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                  <span>Headline Size & Color:</span>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min={10}
                      max={72}
                      value={formHeadlineFontSize}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFormHeadlineFontSize(val);
                        handleUpdateSlotField('headlineFontSize', val);
                      }}
                      className="w-14 bg-white border border-slate-300 text-slate-900 font-mono font-bold px-1.5 py-0.5 rounded text-right text-xs outline-none focus:border-red-500"
                    />
                    <span className="text-slate-400 font-mono text-[9px]">px</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formHeadlineColor}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormHeadlineColor(val);
                      handleUpdateSlotField('headlineColor', val);
                    }}
                    className="w-7 h-7 rounded cursor-pointer bg-transparent border-0 p-0"
                    title="Click to select Color"
                  />
                  <div className="flex items-center space-x-1.5 text-[9px]">
                    {[
                      { name: 'Black', hex: '#0f172a' },
                      { name: 'Red', hex: '#b91c1c' },
                      { name: 'Blue', hex: '#1d4ed8' },
                      { name: 'Dark Red', hex: '#7f1d1d' },
                      { name: 'White', hex: '#ffffff' }
                    ].map(c => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => {
                          setFormHeadlineColor(c.hex);
                          handleUpdateSlotField('headlineColor', c.hex);
                        }}
                        className={`w-4 h-4 rounded-full border border-slate-300 cursor-pointer ${formHeadlineColor === c.hex ? 'ring-2 ring-red-500 scale-110' : ''}`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Sub-Headline Formatting */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                  <span>Sub-Headline Size & Color:</span>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min={8}
                      max={48}
                      value={formSubHeadlineFontSize}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFormSubHeadlineFontSize(val);
                        handleUpdateSlotField('subHeadlineFontSize', val);
                      }}
                      className="w-14 bg-white border border-slate-300 text-slate-900 font-mono font-bold px-1.5 py-0.5 rounded text-right text-xs outline-none focus:border-red-500"
                    />
                    <span className="text-slate-400 font-mono text-[9px]">px</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formSubHeadlineColor}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormSubHeadlineColor(val);
                      handleUpdateSlotField('subHeadlineColor', val);
                    }}
                    className="w-7 h-7 rounded cursor-pointer bg-transparent border-0 p-0"
                    title="Click to select Color"
                  />
                  <div className="flex items-center space-x-1.5 text-[9px]">
                    {[
                      { name: 'Red', hex: '#b91c1c' },
                      { name: 'Black', hex: '#0f172a' },
                      { name: 'Blue', hex: '#1d4ed8' },
                      { name: 'Dark Red', hex: '#7f1d1d' },
                      { name: 'Slate', hex: '#475569' }
                    ].map(c => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => {
                          setFormSubHeadlineColor(c.hex);
                          handleUpdateSlotField('subHeadlineColor', c.hex);
                        }}
                        className={`w-4 h-4 rounded-full border border-slate-300 cursor-pointer ${formSubHeadlineColor === c.hex ? 'ring-2 ring-red-500 scale-110' : ''}`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Body Text Formatting */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                  <span>Body Text Size & Color:</span>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min={6}
                      max={36}
                      value={formSummaryFontSize}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFormSummaryFontSize(val);
                        handleUpdateSlotField('summaryFontSize', val);
                      }}
                      className="w-14 bg-white border border-slate-300 text-slate-900 font-mono font-bold px-1.5 py-0.5 rounded text-right text-xs outline-none focus:border-red-500"
                    />
                    <span className="text-slate-400 font-mono text-[9px]">px</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formSummaryColor}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormSummaryColor(val);
                      handleUpdateSlotField('summaryColor', val);
                    }}
                    className="w-7 h-7 rounded cursor-pointer bg-transparent border-0 p-0"
                    title="Click to select Color"
                  />
                  <div className="flex items-center space-x-1.5 text-[9px]">
                    {[
                      { name: 'Slate', hex: '#1e293b' },
                      { name: 'Black', hex: '#000000' },
                      { name: 'Dark Red', hex: '#991b1b' },
                      { name: 'Dark Blue', hex: '#1e3a8a' },
                      { name: 'Gray', hex: '#4b5563' }
                    ].map(c => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => {
                          setFormSummaryColor(c.hex);
                          handleUpdateSlotField('summaryColor', c.hex);
                        }}
                        className={`w-4 h-4 rounded-full border border-slate-300 cursor-pointer ${formSummaryColor === c.hex ? 'ring-2 ring-red-500 scale-110' : ''}`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 📰 NEWSPAPER MULTI-COLUMN & AUTO-WRAP CONTROLLER */}
            <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2">
                <span className="flex items-center space-x-1.5 text-red-600">
                  <Columns className="w-3.5 h-3.5" />
                  <span>NEWSPAPER TEXT COLUMNS & WRAP</span>
                </span>
                <span className="bg-amber-100 text-amber-800 border border-amber-200 font-mono text-[9px] px-1.5 py-0.5 rounded font-black">
                  {formColumnsCount} {formColumnsCount === 1 ? 'Col' : 'Cols'}
                </span>
              </div>

              {/* 1. Columns Count Selector (1, 2, 3, 4) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                  <span>Columns Count (स्तंभों की संख्या):</span>
                  <span className="text-slate-800 font-mono font-bold">{formColumnsCount} Column{formColumnsCount > 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((num) => {
                    const isSelected = formColumnsCount === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setFormColumnsCount(num);
                          handleUpdateSlotField('columnsCount', num);
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center space-x-1 cursor-pointer border ${
                          isSelected
                            ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-500 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100 shadow-xs'
                        }`}
                      >
                        <span>{num}</span>
                        <span className="text-[10px]">{num === 1 ? 'Col' : 'Cols'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Column Gap & Divider Line (Only if columnsCount > 1) */}
              {formColumnsCount > 1 && (
                <div className="space-y-2 pt-2 border-t border-slate-200 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                    <span>Column Gap (दूरी):</span>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        min={6}
                        max={36}
                        value={formColumnGap}
                        onChange={(e) => {
                          const val = Math.max(4, Math.min(40, Number(e.target.value)));
                          setFormColumnGap(val);
                          handleUpdateSlotField('columnGap', val);
                        }}
                        className="w-14 bg-white border border-slate-300 text-slate-900 font-mono font-bold px-1.5 py-0.5 rounded text-right text-xs outline-none focus:border-red-500"
                      />
                      <span className="text-slate-400 font-mono text-[9px]">px</span>
                    </div>
                  </div>

                  {/* Vertical Column Rule Toggle */}
                  <label className="flex items-center space-x-2 text-[11px] text-slate-700 font-medium cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={formShowColumnDivider}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setFormShowColumnDivider(val);
                        handleUpdateSlotField('showColumnDivider', val);
                      }}
                      className="accent-red-600 rounded cursor-pointer"
                    />
                    <span>Vertical Divider Line (स्तंभ विभाजक रेखा)</span>
                  </label>
                </div>
              )}

              {/* 3. Image Auto-Wrap Mode (When Image exists) */}
              {formImageUrl && (
                <div className="space-y-1.5 pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-bold text-slate-600 block">Photo Wrap Flow (फोटो और टेक्स्ट एडजस्टमेंट):</span>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setFormImageWrapMode('auto');
                        handleUpdateSlotField('imageWrapMode', 'auto');
                      }}
                      className={`p-2 rounded-lg text-center transition-all cursor-pointer border ${
                        formImageWrapMode === 'auto'
                          ? 'bg-red-50 text-red-700 border-red-500 font-black shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100 shadow-xs'
                      }`}
                      title="Text wraps around photo inside column or with float"
                    >
                      <span>Auto Wrap Flow</span>
                      <span className="block text-[8px] font-mono text-slate-500 mt-0.5">चारों तरफ टेक्स्ट</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFormImageWrapMode('top-span');
                        handleUpdateSlotField('imageWrapMode', 'top-span');
                      }}
                      className={`p-2 rounded-lg text-center transition-all cursor-pointer border ${
                        formImageWrapMode === 'top-span'
                          ? 'bg-red-50 text-red-700 border-red-500 font-black shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100 shadow-xs'
                      }`}
                      title="Image spans on top across all columns, columns flow below"
                    >
                      <span>Top Banner Span</span>
                      <span className="block text-[8px] font-mono text-slate-500 mt-0.5">फोटो ऊपर, कॉलम नीचे</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Content Body Text Area */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Content Body (Hindi Unicode)
                </label>
                {activeSlot && (
                  <div className="flex items-center space-x-1.5">
                    {/<p\b|<mark\b|&lt;p&gt;/i.test(formSummary) && (
                      <button
                        type="button"
                        onClick={() => {
                          const plain = stripHtmlTagsToPlainText(formSummary);
                          setFormSummary(plain);
                          handleUpdateSlotField('summary', plain);
                          triggerToast('✨ HTML टैग हटाकर साफ़ टेक्स्ट कर दिया गया!');
                        }}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg border border-slate-300 flex items-center space-x-1 cursor-pointer transition-all"
                        title="सभी <p>, <mark> टैग्स हटाकर साफ़ टेक्स्ट करें"
                      >
                        <span>✨ Clean Tags</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenRichEditor(activeSlot)}
                      className="px-2 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-[10px] rounded-lg shadow-sm flex items-center space-x-1 cursor-pointer transition-all hover:scale-105"
                      title="Word-Style Text Editor & Word Highlighter (शब्द हाइलाइट करें)"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Word-Style Edit</span>
                    </button>
                  </div>
                )}
              </div>
              <textarea
                rows={4}
                value={formSummary}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormSummary(val);
                  handleUpdateSlotField('summary', val);
                }}
                placeholder="समाचार का सम्पूर्ण विवरण यहाँ लिखें..."
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 text-slate-900 font-serif p-2.5 rounded-xl outline-none text-xs transition-colors shadow-xs"
              />
              {/* Word Count */}
              <div className="flex items-center justify-between mt-1 px-1 text-[11px] text-slate-500">
                <span className="font-mono">
                  {formSummary ? formSummary.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length : 0} शब्द (Words)
                </span>
              </div>
            </div>

          </div>

          {/* BIG RED ACTION BUTTON AT BOTTOM */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/80">
            <button
              onClick={handleApplyChanges}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>APPLY</span>
            </button>
          </div>

        </div>

      </div>

      {/* MODAL 1: ADD NEW PAGE MODAL */}
      {showAddPageModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-black text-slate-800 font-serif uppercase">Add New Broadsheet Page</h3>
              <button onClick={() => setShowAddPageModal(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Page Title</label>
                <input
                  type="text"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  placeholder="e.g. Page 3 (Editorial / Opinion)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-red-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowAddPageModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePage}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/20 cursor-pointer"
              >
                Create Page
              </button>
            </div>
          </div>
        </div>
      )}



      {/* WORD-STYLE RICH TEXT EDITOR & HIGHLIGHTER MODAL POPUP */}
      {isRichEditorOpen && richEditingSlot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-[#1e2430] text-slate-100 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-700 flex flex-col font-sans">

            {/* 1. Modal Top Header */}
            <div className="bg-slate-900 px-6 py-4 border-b border-slate-700 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-sm">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white font-serif tracking-wide flex items-center space-x-2">
                    <span>Word-Style Text Editor & Word Highlighter</span>
                    <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded text-xs font-mono font-bold">
                      Slot #{richEditingSlot.slotNumber}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 font-sans">
                    किसी भी शब्द/वाक्य को माउस से सिलेक्ट करें और MS Word की तरह तुरंत हाइलाइट करें या रंग बदलें
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRichEditorOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="बंद करें (Close)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. MS Word-Style Formatting Ribbon / Toolbar */}
            <div className="bg-slate-800/90 px-4 py-2.5 border-b border-slate-700 flex flex-wrap items-center gap-2 text-xs shrink-0 select-none">

              {/* Group 1: Font Style (Bold, Italic, Underline) */}
              <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyRichCommand('bold')}
                  className="px-2.5 py-1.5 rounded font-black hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer"
                  title="Bold (Ctrl+B)"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyRichCommand('italic')}
                  className="px-2.5 py-1.5 rounded italic hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer"
                  title="Italic (Ctrl+I)"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyRichCommand('underline')}
                  className="px-2.5 py-1.5 rounded underline hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer"
                  title="Underline (Ctrl+U)"
                >
                  <Underline className="w-4 h-4" />
                </button>
              </div>

              {/* Group 2: Word Highlighters (🟡 Yellow, 🟢 Green, 🔵 Cyan, 🟠 Orange, 🔴 Rose) */}
              <div className="relative">
                <div className="flex items-center bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyHighlight(currentSelectedHighlight)}
                    className="px-2.5 py-1.5 flex items-center space-x-1.5 hover:bg-slate-800 transition-colors cursor-pointer"
                    title={`सिलेक्टेड शब्द को ${currentSelectedHighlight} से हाइलाइट करें`}
                  >
                    <Highlighter className="w-4 h-4 text-amber-300" />
                    <span
                      className="w-3.5 h-3.5 rounded border border-white/40 shadow-xs"
                      style={{ backgroundColor: currentSelectedHighlight }}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={toggleHighlightDropdown}
                    className="px-1.5 py-1.5 hover:bg-slate-800 border-l border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                    title="हाइलाइटर रंग चुनें"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                {/* Highlighter Color Palette Dropdown */}
                {showHighlightDropdown && (
                  <div className="absolute top-full left-0 mt-1.5 p-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 flex items-center space-x-2 animate-in fade-in zoom-in-95 duration-100">
                    {[
                      { color: '#fef08a', name: 'Yellow (पीला)' },
                      { color: '#bbf7d0', name: 'Green (हरा)' },
                      { color: '#a5f3fc', name: 'Cyan (हल्का नीला)' },
                      { color: '#fed7aa', name: 'Orange (नारंगी)' },
                      { color: '#fecdd3', name: 'Rose (गुलाबी/लाल)' },
                      { color: 'transparent', name: 'No Color (हटाएं)' }
                    ].map(item => (
                      <button
                        key={item.color}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setCurrentSelectedHighlight(item.color);
                          applyHighlight(item.color);
                          setShowHighlightDropdown(false);
                        }}
                        className="w-6 h-6 rounded-lg border border-slate-600 hover:scale-110 transition-transform cursor-pointer flex items-center justify-center shadow-xs"
                        style={{ backgroundColor: item.color === 'transparent' ? '#1e293b' : item.color }}
                        title={item.name}
                      >
                        {item.color === 'transparent' && <span className="text-[10px] text-red-400 font-bold">✕</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Group 3: Text Font Color Dropdown */}
              <div className="relative">
                <div className="flex items-center bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyTextColor(currentSelectedTextColor)}
                    className="px-2.5 py-1.5 flex items-center space-x-1.5 hover:bg-slate-800 transition-colors cursor-pointer"
                    title={`सिलेक्टेड शब्द का फॉन्ट रंग बदलें`}
                  >
                    <Palette className="w-4 h-4 text-red-400" />
                    <span
                      className="w-3.5 h-3.5 rounded border border-white/40 shadow-xs"
                      style={{ backgroundColor: currentSelectedTextColor }}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={toggleTextColorDropdown}
                    className="px-1.5 py-1.5 hover:bg-slate-800 border-l border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                    title="फॉन्ट रंग चुनें"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                {/* Font Color Palette Dropdown */}
                {showTextColorDropdown && (
                  <div className="absolute top-full left-0 mt-1.5 p-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 flex items-center space-x-2 animate-in fade-in zoom-in-95 duration-100">
                    {[
                      { color: '#b91c1c', name: 'Editorial Red (संपादकीय लाल)' },
                      { color: '#1e3a8a', name: 'Dark Navy Blue (गहरा नीला)' },
                      { color: '#15803d', name: 'Forest Green (हरा)' },
                      { color: '#b45309', name: 'Amber Gold (सुनहरा)' },
                      { color: '#0f172a', name: 'Black (काला)' },
                      { color: '#64748b', name: 'Slate Gray (ग्रे)' }
                    ].map(item => (
                      <button
                        key={item.color}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setCurrentSelectedTextColor(item.color);
                          applyTextColor(item.color);
                          setShowTextColorDropdown(false);
                        }}
                        className="w-6 h-6 rounded-lg border border-slate-600 hover:scale-110 transition-transform cursor-pointer flex items-center justify-center shadow-xs"
                        style={{ backgroundColor: item.color }}
                        title={item.name}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Group 4: Font Size Control */}
              <div className="relative">
                <div className="flex items-center bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                  <div className="px-2.5 py-1.5 flex items-center space-x-1 text-slate-200">
                    <Type className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-xs font-bold">{currentSelectedFontSize}</span>
                  </div>
                  <button
                    type="button"
                    onClick={toggleFontSizeDropdown}
                    className="px-1.5 py-1.5 hover:bg-slate-800 border-l border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                    title="फॉन्ट साइज चुनें"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                {/* Font Size Dropdown Menu */}
                {showFontSizeDropdown && (
                  <div className="absolute top-full left-0 mt-1.5 w-28 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-1 animate-in fade-in zoom-in-95 duration-100">
                    {[
                      { size: '1', label: '10px (Very Small)' },
                      { size: '2', label: '12px (Small)' },
                      { size: '3', label: '14px (Normal Body)' },
                      { size: '4', label: '16px (Medium)' },
                      { size: '5', label: '18px (Sub-lead)' },
                      { size: '6', label: '24px (Large)' }
                    ].map(item => (
                      <button
                        key={item.size}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setCurrentSelectedFontSize(item.label.split(' ')[0]);
                          applyRichCommand('fontSize', item.size);
                          setShowFontSizeDropdown(false);
                        }}
                        className="w-full text-left px-2.5 py-1 rounded-lg text-xs hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Group 5: Remove Formatting (Eraser) */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyRichCommand('removeFormat')}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-red-400 transition-colors cursor-pointer flex items-center space-x-1"
                title="सिलेक्टेड शब्दों से फॉर्मेटिंग और हाइलाइटर हटाएं"
              >
                <Eraser className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px]">Clear Format</span>
              </button>

            </div>

            {/* 3. Editor Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/50">
              {/* Slot Headline Quick Edit */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  मुख्य शीर्षक (Headline)
                </label>
                <input
                  type="text"
                  value={richHeadline}
                  onChange={(e) => setRichHeadline(e.target.value)}
                  placeholder="मुख्य शीर्षक दर्ज करें..."
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-serif font-black text-sm outline-none focus:border-red-500 shadow-inner"
                />
              </div>

              {/* Slot SubHeadline Quick Edit */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  उप-शीर्षक (Sub-Headline)
                </label>
                <input
                  type="text"
                  value={richSubHeadline}
                  onChange={(e) => setRichSubHeadline(e.target.value)}
                  placeholder="उप-शीर्षक यहाँ लिखें..."
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-red-400 font-bold text-xs outline-none focus:border-red-500 shadow-inner"
                />
              </div>

              {/* WYSIWYG Editable Story Body with Word Highlighting */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">
                    कंटेंट बॉडी (WYSIWYG Live Editor)
                  </span>
                  <span className="text-[11px] text-amber-400 font-medium">
                    💡 माउस से शब्द चुनें और ऊपर दिए गए हाइलाइटर टूल का प्रयोग करें
                  </span>
                </div>

                <div
                  ref={richEditorContentRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={() => {
                    if (richEditorContentRef.current) {
                      setRichSummaryHtml(richEditorContentRef.current.innerHTML);
                    }
                  }}
                  className="min-h-[220px] max-h-[360px] overflow-y-auto p-4 bg-white text-slate-950 font-serif text-[15px] leading-relaxed rounded-xl shadow-inner border-2 border-slate-700 focus:border-amber-400 outline-none select-text"
                  style={{
                    fontFamily: "'Noto Serif Devanagari', 'Merriweather', serif",
                    whiteSpace: 'pre-wrap',
                    textAlign: 'justify'
                  }}
                />
              </div>
            </div>

            {/* 4. Bottom Footer Action Bar */}
            <div className="bg-slate-900 px-6 py-3.5 border-t border-slate-700 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-400 hidden sm:inline">
                ✨ शब्द सिलेक्ट करके ऊपर दिए गए 🟡 पीला, 🟢 हरा, 🔴 लाल हाइलाइटर दबाएं
              </span>
              <div className="flex items-center space-x-3 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsRichEditorOpen(false)}
                  className="px-5 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  type="button"
                  onClick={handleSaveRichEditor}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-900/30 flex items-center space-x-2 transition-all cursor-pointer transform hover:scale-105"
                >
                  <Check className="w-4 h-4" />
                  <span>स्लॉट में लागू करें (Apply to Slot)</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 🚀 STUNNING PUBLISH RESULT MODAL POPUP (BEAUTIFUL MODERN DIALOG) */}
      {publishModal && publishModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-slate-800 shadow-2xl relative overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-150">
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setPublishModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Glowing Icon Header */}
            <div className="flex flex-col items-center text-center">
              {publishModal.type === 'success' && (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/25 mb-4 border border-emerald-400/40">
                  <CheckCircle2 className="w-9 h-9 text-white" />
                </div>
              )}
              {publishModal.type === 'already-published' && (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center shadow-xl shadow-amber-500/25 mb-4 border border-amber-400/40">
                  <AlertCircle className="w-9 h-9 text-white" />
                </div>
              )}
              {publishModal.type === 'error' && (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-xl shadow-red-600/25 mb-4 border border-red-500/40">
                  <X className="w-9 h-9 text-white" />
                </div>
              )}

              <h3 className="text-xl sm:text-2xl font-black font-serif tracking-wide text-slate-900">
                {publishModal.title}
              </h3>
              <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
                {publishModal.message}
              </p>
            </div>

            {/* Edition & Publishing Meta Details Card */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">संस्करण (Edition):</span>
                <span className="font-bold text-slate-800">{publishModal.editionName}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">प्रकाशन दिनांक (Date):</span>
                <span className="font-mono font-bold text-red-700">{publishModal.publishDate}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">कुल पृष्ठ (Pages):</span>
                <span className="font-bold text-slate-800">{publishModal.totalPages} Pages</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                <span className="text-slate-500 font-medium">स्थिति (Status):</span>
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>LIVE ON PORTAL</span>
                </span>
              </div>
            </div>

            {/* Action Buttons Grid */}
            <div className="mt-6 space-y-2.5">
              {/* Button 1: Open Live Reader E-Paper */}
              <a
                href="/epaper"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-red-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer transform hover:scale-[1.01]"
              >
                <Newspaper className="w-4 h-4" />
                <span>📰 लाइव पाठक ई-पेपर देखें (Open Reader View)</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>

              {/* Button 2: Download / View PDF (if available) */}
              {publishModal.pdfUrl && (
                <a
                  href={publishModal.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs border border-slate-200 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>📄 हाई-रेजोल्यूशन PDF खोलें (Open PDF)</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1 text-slate-500" />
                </a>
              )}

              {/* Close / Dismiss Button */}
              <button
                type="button"
                onClick={() => setPublishModal(null)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold border border-slate-200 transition-all cursor-pointer flex items-center justify-center"
              >
                बंद करें
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 4. CONVERSATIONAL AI NEWS EDITOR AGENT DRAWER (Gemini Powered) */}
      <AIAgentDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        activeSlot={activeSlot && activeSlot.id !== 'temp' ? activeSlot : null}
        onApplyToSlot={handleApplyAiNewsToActiveSlot}
      />

    </div>
  );
}

export default function BroadsheetStudioPage() {
  return (
    <AdminAuthProvider>
      <FullStudioInner />
    </AdminAuthProvider>
  );
}
