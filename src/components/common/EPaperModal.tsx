'use client';

import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import {
  FileText, Download, X, Calendar, ChevronDown, MapPin, Loader2, ExternalLink,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, LayoutGrid, Check, ArrowLeft,
  Share2, Image as ImageIcon, Copy, Volume2, VolumeX, ZoomIn, ZoomOut, Plus, Minus,
  AlertCircle, Newspaper
} from 'lucide-react';
import { BACKEND_URL, getFullMediaUrl } from '@/config/env';
import {
  fetchStatesWithEditions,
  fetchArchiveDates,
  fetchEpaperIssue,
  getTtsAudioUrl,
} from '@/services/epaperService';

// Utility to decode HTML entities and format paragraphs properly
function cleanAndFormatHtml(htmlOrText: string): string {
  if (!htmlOrText) return '';
  let str = htmlOrText.trim();

  // If HTML entities were accidentally escaped (like &lt;p&gt; or &lt;mark), decode them:
  if (str.includes('&lt;') && str.includes('&gt;')) {
    str = str
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
  }

  // If text does not have any <p> or <br> tags, format newlines into clean <p> paragraphs
  if (!/<p\b|<br\s*\/?>/i.test(str)) {
    str = str
      .split(/\n\n+/)
      .map(p => `<p class="mb-3">${p.trim().replace(/\n/g, '<br/>')}</p>`)
      .join('');
  }

  return str;
}

interface EPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface EPaperSlot {
  id: string;
  pageId?: string;
  slotIndex?: number;
  slotNumber?: number;
  x: number;
  y: number;
  width: number;
  height: number;
  headline?: string;
  subHeadline?: string;
  categoryTag?: string;
  categoryBadge?: string;
  contentText?: string;
  summary?: string;
  imageUrl?: string;
  imageAlign?: string;
  imageAlignment?: string;
  isAd?: boolean;
  [key: string]: any;
}

interface EPaperPage {
  id: string;
  pageNumber: number;
  title: string;
  pdfUrl?: string;
  pageImageUrl?: string;
  pageImage?: string;
  slots?: EPaperSlot[];
}

export interface EditionItem {
  id: string;
  name: string;
  city: string;
  title: string;
  tag?: string;
  slug: string;
  order: number;
}

export interface StateItem {
  id: string;
  name: string;
  slug: string;
  order: number;
  editions: EditionItem[];
}

export interface ArchiveDateItem {
  date: string;
  pdfUrl?: string;
  status: string;
  totalPages?: number;
}

const DEFAULT_FALLBACK_EDITION: EditionItem = {
  id: 'patna',
  name: 'पटना (मुख्य)',
  city: 'पटना',
  title: 'अपना पटना',
  tag: 'बिहार मुख्य संस्करण',
  slug: 'patna-main',
  order: 1
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEAR_OPTIONS = [2024, 2025, 2026, 2027];

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

function formatHindiDate(dateStr: string) {
  return formatHindiDateString(dateStr);
}

export function stripHtmlTagsToPlainText(input: string): string {
  if (!input) return '';
  let str = input.trim();
  if (str.includes('&lt;') && str.includes('&gt;')) {
    str = str
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
  }
  str = str
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<li\b[^>]*>/gi, '• ')
    .replace(/<\/li>/gi, '\n');
  str = str.replace(/<[^>]*>/g, '');
  return str.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function normalizeSlotData(s: any): any {
  const width = s.width !== undefined && s.width !== null ? Number(s.width) : 400;
  const height = s.height !== undefined && s.height !== null ? Number(s.height) : 250;
  const columnsCount = Number(
    s.columnsCount ?? s.columnCount ?? s.columns_count ?? s.colsCount ?? (width >= 550 ? 2 : 1)
  );
  const colGap = Number(s.columnGap ?? s.column_gap ?? 14);
  const showColumnDivider = Boolean(
    s.showColumnDivider ?? s.show_column_divider ?? s.showColumnDividers ?? false
  );
  const imageWidth = s.imageWidth !== undefined && s.imageWidth !== null
    ? Number(s.imageWidth)
    : (s.image_width !== undefined ? Number(s.image_width) : undefined);
  const imageHeight = s.imageHeight !== undefined && s.imageHeight !== null
    ? Number(s.imageHeight)
    : (s.image_height !== undefined ? Number(s.image_height) : 140);
  const imgPxX = s.imgPxX !== undefined ? Number(s.imgPxX) : (s.img_px_x !== undefined ? Number(s.img_px_x) : undefined);
  const imgPxY = s.imgPxY !== undefined ? Number(s.imgPxY) : (s.img_px_y !== undefined ? Number(s.img_px_y) : undefined);

  const rawHlSize = s.headlineFontSize ?? s.headline_font_size ?? s.content?.headlineFontSize ?? s.content?.headline_font_size;
  const rawSubHlSize = s.subHeadlineFontSize ?? s.sub_headline_font_size ?? s.content?.subHeadlineFontSize ?? s.content?.sub_headline_font_size;
  const rawSummarySize = s.summaryFontSize ?? s.summary_font_size ?? s.bodyFontSize ?? s.body_font_size ?? s.content?.summaryFontSize ?? s.content?.bodyFontSize ?? s.content?.summary_font_size ?? s.content?.fontSize;

  return {
    ...s,
    id: s.id || s.slot_id || `slot-${Math.random().toString(36).substr(2, 9)}`,
    x: s.x !== undefined && s.x !== null ? Number(s.x) : 16,
    y: s.y !== undefined && s.y !== null ? Number(s.y) : 115,
    width,
    height,
    headline: s.headline || s.content?.headline || '',
    subHeadline: s.subHeadline || s.content?.subHeadline || '',
    categoryBadge: s.categoryBadge || s.categoryTag || s.content?.categoryBadge || s.content?.categoryTag || '',
    categoryTag: s.categoryTag || s.categoryBadge || s.content?.categoryTag || s.content?.categoryBadge || '',
    summary: s.summary || s.contentText || s.content?.body || s.content?.summary || '',
    imageUrl: s.imageUrl || s.content?.imageUrl || '',
    imageAlignment: s.imageAlignment || s.imageAlign || 'Left',
    imageAlign: s.imageAlign || s.imageAlignment || 'Left',
    imageWidth,
    imageHeight,
    imgPxX,
    imgPxY,
    headlineFontSize: rawHlSize !== undefined && rawHlSize !== null && !isNaN(Number(rawHlSize)) ? Number(rawHlSize) : 22,
    headlineColor: s.headlineColor || s.headline_color || s.content?.headlineColor || '#020617',
    subHeadlineFontSize: rawSubHlSize !== undefined && rawSubHlSize !== null && !isNaN(Number(rawSubHlSize)) ? Number(rawSubHlSize) : 13,
    subHeadlineColor: s.subHeadlineColor || s.sub_headline_color || s.content?.subHeadlineColor || '#b91c1c',
    summaryFontSize: rawSummarySize !== undefined && rawSummarySize !== null && !isNaN(Number(rawSummarySize)) ? Number(rawSummarySize) : 14,
    summaryColor: s.summaryColor || s.summary_color || s.bodyTextColor || s.content?.summaryColor || undefined,
    columnsCount,
    columnGap: colGap,
    showColumnDivider,
    imageWrapMode: s.imageWrapMode || s.image_wrap_mode || 'auto',
    imageVertAlign: s.imageVertAlign || s.image_vert_align || 'top',
    isAd: s.isAd || s.type === 'ad' || false,
    computedSections: s.computedSections
  };
}


function sliceHtmlTokens(html: string): string[] {
  if (!html) return [];
  const tagRegex = /(<[^>]+>|[^\s<]+|\s+)/g;
  return html.match(tagRegex) || [];
}

function buildHtmlFromTokens(tokens: string[], startIdx: number, endIdx: number): string {
  if (!tokens || tokens.length === 0 || startIdx >= tokens.length || startIdx >= endIdx) return '';
  const rawChunk = tokens.slice(startIdx, endIdx).join('');
  if (typeof document === 'undefined') return rawChunk;

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
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = prefix + rawChunk;
  return tempDiv.innerHTML;
}

let readerMeasureContainer: HTMLDivElement | null = null;
function getReaderMeasureDiv(): HTMLDivElement | null {
  if (typeof document === 'undefined') return null;
  if (!readerMeasureContainer || !document.body.contains(readerMeasureContainer)) {
    readerMeasureContainer = document.createElement('div');
    readerMeasureContainer.id = '__epaper_reader_measure_div__';
    readerMeasureContainer.style.position = 'fixed';
    readerMeasureContainer.style.left = '-99999px';
    readerMeasureContainer.style.top = '-99999px';
    readerMeasureContainer.style.visibility = 'hidden';
    readerMeasureContainer.style.pointerEvents = 'none';
    readerMeasureContainer.style.zIndex = '-9999';
    document.body.appendChild(readerMeasureContainer);
  }
  return readerMeasureContainer;
}

function getSummaryLineHeight(fontSize: number): number {
  const f = Math.round(Number(fontSize) || 14);
  if (f <= 12) return 17;
  if (f === 13) return 19;
  if (f === 14) return 21;
  if (f === 15) return 22;
  if (f === 16) return 24;
  if (f === 17) return 25;
  if (f === 18) return 26;
  return Math.round(f * 1.47);
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
  const div = getReaderMeasureDiv();
  if (!div) {
    return tokens.length;
  }

  const targetW = Math.max(50, width);
  const targetH = Math.max(20, height);

  const lineH = getSummaryLineHeight(fontSize);
  div.style.width = `${targetW}px`;
  div.style.height = `${targetH}px`;
  div.style.maxHeight = `${targetH}px`;
  div.style.fontSize = `${fontSize || 14}px`;
  div.style.fontFamily = "'Noto Serif Devanagari', 'Merriweather', serif";
  div.style.lineHeight = `${lineH}px`;
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

function computeSlotSections(s: any) {
  const colsCount = s.columnsCount || 1;
  const colGap = s.columnGap || 14;
  const cardH = s.height || 400;
  const cardContentW = Math.max(100, s.width - 24);
  const showDivider = s.showColumnDivider || false;

  const hasBadge = Boolean((s.categoryBadge || s.categoryTag)?.trim());
  const badgeH = hasBadge ? 18 : 0;

  const hlFont = s.headlineFontSize ? Number(s.headlineFontSize) : 22;
  const subFont = s.subHeadlineFontSize ? Number(s.subHeadlineFontSize) : 13;
  const summaryFont = s.summaryFontSize ? Number(s.summaryFontSize) : 14;
  const lineH = getSummaryLineHeight(summaryFont);

  const hlCharsPerLine = Math.max(12, Math.floor(cardContentW / (hlFont * 0.52)));
  const hlLines = s.headline ? Math.max(1, Math.ceil(s.headline.length / hlCharsPerLine)) : 0;
  const hlH = hlLines * hlFont * 1.25;

  const subCharsPerLine = Math.max(18, Math.floor(cardContentW / (subFont * 0.52)));
  const subLines = s.subHeadline ? Math.max(1, Math.ceil(s.subHeadline.length / subCharsPerLine)) : 0;
  const subH = subLines * subFont * 1.25;

  const cardFraming = 14;
  let headerTotalH = Math.ceil(badgeH + hlH + subH + cardFraming);
  if (typeof document !== 'undefined') {
    const liveHeader = document.getElementById(`reader-slot-header-${s.id}`);
    if (liveHeader && liveHeader.offsetHeight > 0) {
      headerTotalH = Math.ceil(liveHeader.offsetHeight + cardFraming);
    }
  }

  const rawStoryH = Math.max(lineH, cardH - headerTotalH);
  const fullStoryH = Math.max(lineH, Math.floor(rawStoryH / lineH) * lineH);

  const imgW = s.imageWidth || 180;
  const imgH = s.imageHeight || 140;
  const isFullCardPhoto = imgW >= cardContentW - 30 || s.imageWrapMode === 'top-span';

  const rawUnderPhotoH = Math.max(lineH, fullStoryH - imgH - 8);
  const underPhotoH = Math.max(lineH, Math.floor(rawUnderPhotoH / lineH) * lineH);

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
      underPhotoH,
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

  const normAlign = (s.imageAlignment || s.imageAlign || 'Left').toLowerCase();
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
    startCol = 0;
  }

  const leftCols = startCol;
  const photoCols = spanCols;
  const rightCols = colsCount - (startCol + spanCols);

  const leftSectionW = leftCols > 0 ? (leftCols * singleColW) + ((leftCols - 1) * colGap) : 0;
  const photoSectionW = (photoCols * singleColW) + ((photoCols - 1) * colGap);
  const rightSectionW = rightCols > 0 ? (rightCols * singleColW) + ((rightCols - 1) * colGap) : 0;
  const vertAlign = s.imageVertAlign || 'top';

  const tokens = sliceHtmlTokens(s.summary || '');
  let text1 = '';
  let text2 = '';
  let text2b = '';
  let text3 = '';
  let currentTokenIdx = 0;

  if (leftCols > 0) {
    const fit1 = findBestTokenFit(tokens, currentTokenIdx, leftSectionW, fullStoryH, leftCols, summaryFont, colGap);
    text1 = buildHtmlFromTokens(tokens, currentTokenIdx, fit1);
    currentTokenIdx = fit1;
  }

  if (vertAlign === 'middle') {
    const midTopH = Math.max(20, Math.floor(underPhotoH / 2));
    const midBottomH = Math.max(20, Math.ceil(underPhotoH / 2));

    if (currentTokenIdx < tokens.length) {
      const fit2a = findBestTokenFit(tokens, currentTokenIdx, photoSectionW, midTopH, photoCols, summaryFont, colGap);
      text2 = buildHtmlFromTokens(tokens, currentTokenIdx, fit2a);
      currentTokenIdx = fit2a;
    }

    if (currentTokenIdx < tokens.length) {
      const fit2b = findBestTokenFit(tokens, currentTokenIdx, photoSectionW, midBottomH, photoCols, summaryFont, colGap);
      text2b = buildHtmlFromTokens(tokens, currentTokenIdx, fit2b);
      currentTokenIdx = fit2b;
    }
  } else {
    if (currentTokenIdx < tokens.length) {
      const fit2 = findBestTokenFit(tokens, currentTokenIdx, photoSectionW, underPhotoH, photoCols, summaryFont, colGap);
      text2 = buildHtmlFromTokens(tokens, currentTokenIdx, fit2);
      currentTokenIdx = fit2;
    }
  }

  if (rightCols > 0 && currentTokenIdx < tokens.length) {
    const fit3 = findBestTokenFit(tokens, currentTokenIdx, rightSectionW, fullStoryH, rightCols, summaryFont, colGap);
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

export const EPaperModal: React.FC<EPaperModalProps> = ({ isOpen, onClose }) => {
  // Dynamic States & Editions Data
  const [statesData, setStatesData] = useState<StateItem[]>([]);
  const [activeStateSlug, setActiveStateSlug] = useState<string>('bihar');
  const [activeEdition, setActiveEdition] = useState<EditionItem>(DEFAULT_FALLBACK_EDITION);
  const [isEditionMenuOpen, setIsEditionMenuOpen] = useState(false);

  // Date state & Archive Dates List
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [archiveDatesList, setArchiveDatesList] = useState<ArchiveDateItem[]>([]);

  // Interactive Monthly Calendar Navigation State (Hindustan ePaper Standard)
  const [viewYear, setViewYear] = useState<number>(() => {
    const d = new Date();
    return d.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    const d = new Date();
    return d.getMonth();
  });
  const [tempSelectedDate, setTempSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Data state
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pages, setPages] = useState<EPaperPage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [totalPagesCount, setTotalPagesCount] = useState<number>(4);
  const [showAllPagesGrid, setShowAllPagesGrid] = useState<boolean>(false);

  // LiveHindustan Hotspot & Dual-View Article Modal State
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(900);
  const [selectedArticle, setSelectedArticle] = useState<EPaperSlot | null>(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState<boolean>(false);
  const [activeViewTab, setActiveViewTab] = useState<'text' | 'image'>('text');
  const [fontSize, setFontSize] = useState<number>(18);
  const [articleCopiedToast, setArticleCopiedToast] = useState<boolean>(false);
  const [isDownloadingArticle, setIsDownloadingArticle] = useState<boolean>(false);
  const [articleDownloadedToast, setArticleDownloadedToast] = useState<string>('');
  const [readerViewMode, setReaderViewMode] = useState<'newspaper' | 'pdf'>('newspaper');
  const [canvasZoom, setCanvasZoom] = useState<number>(0.90);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [clippingZoom, setClippingZoom] = useState<number>(1);
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);
  const [hasImageLoaded, setHasImageLoaded] = useState<boolean>(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const currentChunkIndexRef = useRef<number>(0);
  const audioChunksRef = useRef<string[]>([]);
  const isSpeakingRef = useRef<boolean>(false);
  const clippingSheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setImageLoadError(false);
    setHasImageLoaded(false);
  }, [currentPageIndex, activeEdition.slug, selectedDate]);

  // Helper to split text into natural punctuation chunks (<160 chars) for smooth streaming audio
  const splitIntoTtsChunks = (text: string, maxLength = 160): string[] => {
    if (!text) return [];
    const rawSentences = text.split(/([।?!.\n]+)/).filter(Boolean);
    const sentences: string[] = [];
    for (let i = 0; i < rawSentences.length; i += 2) {
      const s = (rawSentences[i] || '').trim();
      const punct = (rawSentences[i + 1] || '').trim();
      if (s) sentences.push(s + (punct ? ' ' + punct : ''));
    }
    const chunks: string[] = [];
    let current = '';
    for (const s of sentences) {
      if ((current + ' ' + s).trim().length <= maxLength) {
        current = (current + ' ' + s).trim();
      } else {
        if (current) chunks.push(current);
        if (s.length <= maxLength) {
          current = s;
        } else {
          const words = s.split(/\s+/);
          let sub = '';
          for (const w of words) {
            if ((sub + ' ' + w).trim().length <= maxLength) {
              sub = (sub + ' ' + w).trim();
            } else {
              if (sub) chunks.push(sub);
              sub = w;
            }
          }
          current = sub;
        }
      }
    }
    if (current) chunks.push(current);
    return chunks.filter(c => c.trim().length > 0);
  };

  const stopAllAudio = () => {
    isSpeakingRef.current = false;
    setIsSpeaking(false);
    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.onended = null;
        audioPlayerRef.current.onerror = null;
        audioPlayerRef.current.src = '';
      } catch {
        // ignore
      }
      audioPlayerRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  };

  // Stop speaking when modal closes or article changes
  useEffect(() => {
    stopAllAudio();
  }, [selectedArticle, isArticleModalOpen]);

  const handleToggleSpeech = () => {
    if (!selectedArticle) return;

    if (isSpeaking) {
      stopAllAudio();
      return;
    }

    stopAllAudio();

    const headline = selectedArticle.headline || '';
    const subHeadline = selectedArticle.subHeadline || '';
    const body = selectedArticle.contentText || selectedArticle.summary || '';
    const fullText = `${headline}। ${subHeadline ? subHeadline + '। ' : ''}${body}`.replace(/\s+/g, ' ').trim();

    if (!fullText) {
      alert('बोलने के लिए कोई समाचार सामग्री नहीं मिली।');
      return;
    }

    const chunks = splitIntoTtsChunks(fullText, 160);
    if (chunks.length === 0) return;

    audioChunksRef.current = chunks;
    currentChunkIndexRef.current = 0;
    isSpeakingRef.current = true;
    setIsSpeaking(true);

    const playNextChunk = (index: number) => {
      if (!isSpeakingRef.current || index >= audioChunksRef.current.length) {
        stopAllAudio();
        return;
      }

      currentChunkIndexRef.current = index;
      const chunkText = audioChunksRef.current[index];
      const audioUrl = getTtsAudioUrl(chunkText);

      try {
        if (!audioPlayerRef.current) {
          audioPlayerRef.current = new Audio();
        }

        const audio = audioPlayerRef.current;
        audio.src = audioUrl;

        audio.onended = () => {
          if (isSpeakingRef.current) {
            playNextChunk(index + 1);
          }
        };

        audio.onerror = () => {
          console.warn('Audio stream error, falling back to Web Speech for chunk:', index);
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            try {
              const utt = new SpeechSynthesisUtterance(chunkText);
              utt.lang = 'hi-IN';
              utt.onend = () => {
                if (isSpeakingRef.current) playNextChunk(index + 1);
              };
              utt.onerror = () => stopAllAudio();
              window.speechSynthesis.speak(utt);
            } catch {
              stopAllAudio();
            }
          } else {
            stopAllAudio();
          }
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('Audio play prevented or failed, trying Web Speech:', err);
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
              try {
                const utt = new SpeechSynthesisUtterance(fullText);
                utt.lang = 'hi-IN';
                utt.onend = () => stopAllAudio();
                utt.onerror = () => stopAllAudio();
                window.speechSynthesis.speak(utt);
              } catch {
                stopAllAudio();
              }
            } else {
              stopAllAudio();
            }
          });
        }
      } catch (err) {
        console.error('Audio initialization error:', err);
        stopAllAudio();
      }
    };

    playNextChunk(0);
  };

  // Responsive Coordinate Scaling Listener (Base 900px admin standard)
  useEffect(() => {
    if (!isOpen) return;

    const updateDimensions = () => {
      if (pageContainerRef.current) {
        const w = pageContainerRef.current.clientWidth;
        if (w > 0) {
          setContainerWidth(w);
        }
      }
    };

    updateDimensions();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && pageContainerRef.current) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const w = entry.contentRect.width;
          if (w > 0) setContainerWidth(w);
        }
      });
      resizeObserver.observe(pageContainerRef.current);
    }

    window.addEventListener('resize', updateDimensions);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [isOpen, currentPageIndex, pdfUrl]);

  const handleCopyArticle = () => {
    if (typeof window !== 'undefined' && navigator.clipboard && selectedArticle) {
      const textToCopy = `${selectedArticle.headline || ''}\n\n${selectedArticle.contentText || selectedArticle.summary || ''}\n\nपढ़ें डिजिटल ई-पेपर: ${window.location.href}`;
      navigator.clipboard.writeText(textToCopy);
      setArticleCopiedToast(true);
      setTimeout(() => setArticleCopiedToast(false), 2200);
    }
  };

  const handleShareArticle = async () => {
    if (!selectedArticle) return;
    const shareText = `${selectedArticle.headline || 'डिजिटल ई-पेपर'}\n\n${selectedArticle.subHeadline ? selectedArticle.subHeadline + '\n\n' : ''}पढ़ें डिजिटल ई-पेपर:\n${window.location.href}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: selectedArticle.headline || 'डिजिटल ई-पेपर',
          text: shareText,
          url: window.location.href
        });
        return;
      } catch {
        // Fallback to whatsapp
      }
    }

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
  };

  // Canvas text wrap helper for offline clipping image generation
  const wrapCanvasText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    maxLines = 20
  ) => {
    const words = text.split(/\s+/);
    let line = '';
    let currentY = y;
    let linesCount = 0;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
        linesCount++;
        if (linesCount >= maxLines) {
          ctx.fillText('...', x, currentY);
          return;
        }
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
  };

  // Dual-mode Download Handler: Downloads Text in Text View & Image/Clipping in Image View
  const handleDownloadArticle = async () => {
    if (!selectedArticle) return;
    setIsDownloadingArticle(true);

    try {
      const headline = (selectedArticle.headline || 'समाचार').replace(/<[^>]*>/g, '').trim();
      const safeTitle = headline.slice(0, 30).replace(/[^a-zA-Z0-9\u0900-\u097F_-]/g, '_') || 'epaper_article';

      if (activeViewTab === 'text') {
        // MODE 1: DOWNLOAD TEXT VIEW (.txt)
        const subHeadline = (selectedArticle.subHeadline || '').replace(/<[^>]*>/g, '').trim();
        const category = (selectedArticle.categoryTag || selectedArticle.categoryBadge || 'विशेष खबर').trim();
        const dateStr = formatHindiDate(selectedDate);
        const city = activeEdition.city || activeEdition.name || '';
        const pageNo = String(currentPageIndex + 1).padStart(2, '0');
        const rawBody = (selectedArticle.contentText || selectedArticle.summary || '')
          .replace(/<\/p>/gi, '\n\n')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .trim();

        const fileContent = `=================================================================
${activeEdition.title || 'डिजिटल ई-पेपर'} • ${city}
दिनांक: ${dateStr} • पृष्ठ संख्या: ${pageNo}
श्रेणी: ${category}
=================================================================

${headline}
${subHeadline ? `\n${subHeadline}\n` : ''}
-----------------------------------------------------------------

${rawBody}

=================================================================
स्रोत: ${activeEdition.title || 'डिजिटल ई-पेपर'} (${typeof window !== 'undefined' ? window.location.origin : ''})
=================================================================`;

        const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${safeTitle}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setArticleDownloadedToast('टेक्स्ट डाउनलोड हो गया!');
        setTimeout(() => setArticleDownloadedToast(''), 2500);
        return;
      }

      // MODE 2: DOWNLOAD IMAGE VIEW (.png clipping)
      // 1. Direct High-Definition Clipping Card Capture via html2canvas (Zero studio watermarks, 100% clean)
      if (clippingSheetRef.current) {
        try {
          const cardEl = clippingSheetRef.current;
          const canvas = await html2canvas(cardEl, {
            scale: 2, // 2x crispness for retina/high-DPI print export
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#fdfcf9',
            logging: false,
            onclone: (clonedDoc) => {
              const clonedCard = clonedDoc.querySelector('[data-clipping-card="true"]') as HTMLElement | null;
              if (clonedCard && clonedCard.parentElement) {
                clonedCard.parentElement.style.transform = 'none';
                clonedCard.parentElement.style.margin = '0 auto';
              }
            }
          });

          const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png'));
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${safeTitle}_clipping.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setArticleDownloadedToast('क्लिपिंग डाउनलोड हो गई!');
            setTimeout(() => setArticleDownloadedToast(''), 2500);
            return;
          }
        } catch (captureErr) {
          console.warn('html2canvas clipping capture error, falling back to 2D canvas:', captureErr);
        }
      }

      // 2. Fallback: Draw complete, clean news cutout card on 2D Canvas (No editor UI, complete headline & body)
      const canvas = document.createElement('canvas');
      canvas.width = 900;
      canvas.height = 1200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#fdfcf9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 4;
        ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

        ctx.fillStyle = '#ba1228';
        ctx.font = 'bold 22px serif';
        ctx.fillText(activeEdition.title || 'डिजिटल ई-पेपर', 36, 60);

        ctx.fillStyle = '#475569';
        ctx.font = '14px sans-serif';
        ctx.fillText(`${formatHindiDate(selectedDate)} • पेज ${String(currentPageIndex + 1).padStart(2, '0')}`, canvas.width - 260, 60);

        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(36, 76);
        ctx.lineTo(canvas.width - 36, 76);
        ctx.stroke();

        const cat = (selectedArticle.categoryTag || selectedArticle.categoryBadge || 'विशेष खबर').trim();
        ctx.fillStyle = '#ba1228';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(cat.toUpperCase(), 36, 110);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 28px serif';
        wrapCanvasText(ctx, headline, 36, 150, canvas.width - 72, 38, 4);

        if (selectedArticle.subHeadline) {
          const subH = selectedArticle.subHeadline.replace(/<[^>]*>/g, '').trim();
          ctx.fillStyle = '#b91c1c';
          ctx.font = 'italic 16px serif';
          wrapCanvasText(ctx, subH, 36, 260, canvas.width - 72, 24, 2);
        }

        const rawBody = (selectedArticle.contentText || selectedArticle.summary || '')
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .trim();
        ctx.fillStyle = '#1e293b';
        ctx.font = '16px serif';
        wrapCanvasText(ctx, rawBody, 36, 320, canvas.width - 72, 26, 25);

        const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png'));
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${safeTitle}_clipping.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setArticleDownloadedToast('क्लिपिंग डाउनलोड हो गई!');
          setTimeout(() => setArticleDownloadedToast(''), 2500);
          return;
        }
      }
    } catch (err: any) {
      alert('डाउनलोड में त्रुटि: ' + (err.message || 'Error'));
    } finally {
      setIsDownloadingArticle(false);
    }
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Fetch Dynamic States & Editions on Open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const loadStatesAndEditions = async () => {
      try {
        const data = await fetchStatesWithEditions();
        if (isMounted && data.length > 0) {
          setStatesData(data);
          const firstState = data[0];
          setActiveStateSlug(firstState.slug);
          if (firstState.editions && firstState.editions.length > 0) {
            setActiveEdition(firstState.editions[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch states with editions:', err);
      }
    };

    loadStatesAndEditions();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // 1.1 Fetch Available Archive Dates for Active Edition
  useEffect(() => {
    if (!isOpen || !activeEdition?.slug) return;

    let isMounted = true;
    const loadArchiveDates = async () => {
      try {
        const data = await fetchArchiveDates(activeEdition.slug);
        if (isMounted) {
          setArchiveDatesList(data);
        }
      } catch (err) {
        console.error('Failed to fetch archive dates:', err);
      }
    };

    loadArchiveDates();

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeEdition.slug]);

  // 2. Fetch or Generate Broadsheet PDF when active edition or date changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchOrGeneratePdf = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      setPdfUrl(null);
      setPages([]);
      setCurrentPageIndex(0);
      setShowAllPagesGrid(false);

      const editionSlug = activeEdition.slug || 'patna-main';

      try {
        // 1. Fetch issue details from DB via service
        const issueData = await fetchEpaperIssue(editionSlug, selectedDate);

        if (isMounted && issueData) {
          const issue = issueData.issue;
          const rawPages = issueData.pages || (issue && issue.pages) || [];

          // Only show paper if it is actually published with valid pages/slots
          const isPublished = issue?.status === 'PUBLISHED';
          const hasContent = Array.isArray(rawPages) && rawPages.length > 0 && rawPages.some((p: any) => (p.slots && p.slots.length > 0) || p.pageImage || p.pageImageUrl);

          if (isPublished && hasContent) {
            if (issue && issue.broadsheetPdfUrl) {
              setPdfUrl(issue.broadsheetPdfUrl);
            }
            setPages(rawPages);
            setTotalPagesCount(rawPages.length);
            setIsLoading(false);
            return;
          }
        }

        // If not published or no content, do NOT auto-generate for past or uncreated dates!
        if (isMounted) {
          setErrorMsg('NOT_CREATED');
        }
      } catch (err) {
        if (isMounted) {
          console.error(err);
          setErrorMsg('सर्वर से कनेक्ट करने में असमर्थ। कृपया backend server चेक करें।');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchOrGeneratePdf();

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeEdition.slug, selectedDate]);

  if (!isOpen) return null;

  const proxyPdfUrl = pdfUrl ? pdfUrl.replace('/uploads/', '/backend-uploads/') : null;
  const directFullUrl = pdfUrl ? getFullMediaUrl(pdfUrl) : null;

  // Single Page PDF URL with Toolbar Hidden (#toolbar=0&navpanes=0&scrollbar=0)
  const singlePagePdfUrl = proxyPdfUrl
    ? (proxyPdfUrl + '#page=' + (currentPageIndex + 1) + '&toolbar=0&navpanes=0&scrollbar=0&view=FitH')
    : null;

  const totalPages = Math.max(1, pages.length > 0 ? pages.length : totalPagesCount);

  const currentPage = pages[currentPageIndex];
  const currentSlots: EPaperSlot[] = (currentPage && Array.isArray(currentPage.slots)) ? currentPage.slots : [];

  const rawPageImage = currentPage?.pageImage || currentPage?.pageImageUrl;
  const canvasImageUrl = rawPageImage
    ? getFullMediaUrl(rawPageImage)
    : getFullMediaUrl(`/uploads/epaper/pages/${activeEdition?.slug || 'patna-main'}-${selectedDate}-page-${currentPageIndex + 1}.webp`);

  // Pad number string e.g. 1 -> "01", 16 -> "16"
  const formattedCurrentPage = String(currentPageIndex + 1).padStart(2, '0');
  const formattedTotalPages = String(totalPages).padStart(2, '0');

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const isCurrentOrFutureMonth =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth >= today.getMonth());

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (isCurrentOrFutureMonth) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const handleApplyDate = () => {
    if (tempSelectedDate) {
      setSelectedDate(tempSelectedDate);
      setIsDatePickerOpen(false);
    }
  };

  // Calendar cells generator for viewed month
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const calendarCells = [];

  // Previous month tail days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarCells.push({
      dayNum: daysInPrevMonth - i,
      isCurrentMonth: false,
      dateStr: '',
      isFuture: false,
      isSelected: false,
      hasArchive: false
    });
  }

  // Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const dStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      dayNum: d,
      isCurrentMonth: true,
      dateStr: dStr,
      isFuture: dStr > todayStr,
      isSelected: tempSelectedDate === dStr,
      hasArchive: archiveDatesList.some(item => item.date === dStr)
    });
  }

  // Next month lead days (clean 7-col alignment)
  const remainingCells = 7 - (calendarCells.length % 7);
  if (remainingCells < 7) {
    for (let i = 1; i <= remainingCells; i++) {
      calendarCells.push({
        dayNum: i,
        isCurrentMonth: false,
        dateStr: '',
        isFuture: false,
        isSelected: false,
        hasArchive: false
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#111827] flex flex-col text-slate-100 font-sans select-none overflow-hidden animate-in fade-in duration-200">

      {/* 1. TOP CONTROL TOOLBAR */}
      <header className="h-[64px] bg-gradient-to-r from-[#ba1228] via-[#8a0b1d] to-[#680714] px-4 sm:px-8 flex items-center justify-between shrink-0 shadow-2xl relative z-40 border-b border-red-900/60">

        {/* Brand & Edition & Date Selector */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center space-x-2.5">
            <div className="bg-white text-[#ba1228] w-9 h-9 rounded-lg flex items-center justify-center shadow-md border border-amber-300">
              <Newspaper className="w-5 h-5 text-[#ba1228]" />
            </div>
            <div className="hidden md:block">
              <span className="font-serif font-black text-lg tracking-wide text-white block leading-tight">
                डिजिटल <span className="text-amber-300 text-xs font-sans tracking-normal uppercase bg-black/40 px-1.5 py-0.5 rounded ml-1">E-PAPER</span>
              </span>
              <span className="text-[10px] text-red-100/90 font-medium block">
                {activeEdition.tag || activeEdition.title}
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-red-700/80 hidden sm:block" />

          {/* Dynamic 2-Column Mega-Menu Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsEditionMenuOpen(!isEditionMenuOpen)}
              className="flex items-center space-x-1.5 bg-black/30 hover:bg-black/40 border border-white/25 rounded-lg px-3 py-1.5 text-xs text-white font-bold cursor-pointer transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              <span>{activeEdition.city || activeEdition.name}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {isEditionMenuOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 z-50 w-[340px] sm:w-[500px] overflow-hidden animate-in fade-in duration-150">
                {/* Mega-Menu Top Header */}
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-[#ba1228]" />
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      राज्य और शहर चुनें (Select Edition)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditionMenuOpen(false)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 2-Column Mega Menu (Left: States, Right: Cities) */}
                <div className="flex h-72 divide-x divide-slate-100">
                  {/* Left Column: States List */}
                  <div className="w-2/5 bg-slate-50/80 overflow-y-auto p-1.5 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                      राज्य (States)
                    </div>
                    {statesData.length > 0 ? (
                      statesData.map((st) => {
                        const isSelectedState = st.slug === activeStateSlug;
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setActiveStateSlug(st.slug)}
                            onMouseEnter={() => setActiveStateSlug(st.slug)}
                            className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-between ${isSelectedState
                              ? 'bg-[#ba1228] text-white shadow-sm'
                              : 'hover:bg-slate-200/70 text-slate-700'
                              }`}
                          >
                            <span>{st.name}</span>
                            {isSelectedState && <ChevronRight className="w-3.5 h-3.5 text-white shrink-0" />}
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-3 text-xs text-slate-400 text-center">लोड हो रहा है...</div>
                    )}
                  </div>

                  {/* Right Column: Selected State's Editions/Cities */}
                  <div className="w-3/5 p-3 overflow-y-auto bg-white space-y-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      शहर / संस्करण (Editions)
                    </div>
                    {(() => {
                      const selectedState = statesData.find(st => st.slug === activeStateSlug) || statesData[0];
                      const editionsList = selectedState?.editions || [];

                      if (editionsList.length === 0) {
                        return (
                          <div className="p-6 text-center text-xs text-slate-400">
                            इस राज्य में कोई संस्करण उपलब्ध नहीं है।
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {editionsList.map((ed) => {
                            const isCurrentActive = activeEdition?.slug === ed.slug;
                            return (
                              <button
                                key={ed.id}
                                type="button"
                                onClick={() => {
                                  setActiveEdition(ed);
                                  setIsEditionMenuOpen(false);
                                }}
                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${isCurrentActive
                                  ? 'border-[#ba1228] bg-red-50/70 text-[#ba1228] ring-1 ring-[#ba1228]'
                                  : 'border-slate-200 hover:border-red-300 hover:bg-slate-50 text-slate-800'
                                  }`}
                              >
                                <div className="text-xs font-extrabold flex items-center justify-between">
                                  <span>{ed.city || ed.name}</span>
                                  {isCurrentActive && <Check className="w-3.5 h-3.5 text-[#ba1228]" />}
                                </div>
                                {ed.tag && (
                                  <div className="text-[9px] text-slate-500 font-medium truncate mt-0.5">
                                    {ed.tag}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Date Picker Trigger & Custom Calendar Grid */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                const parts = selectedDate.split('-').map(Number);
                if (parts[0] && parts[1]) {
                  setViewYear(parts[0]);
                  setViewMonth(parts[1] - 1);
                }
                setTempSelectedDate(selectedDate);
                setIsDatePickerOpen(!isDatePickerOpen);
              }}
              className="flex items-center space-x-2 bg-black/30 hover:bg-black/40 border border-white/25 rounded-lg px-3 py-1.5 text-xs text-white font-bold cursor-pointer transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">{formatHindiDate(selectedDate)}</span>
              <span className="sm:hidden">{selectedDate}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {isDatePickerOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 w-80 animate-in fade-in duration-150">
                {/* 1. Top Header Navigation Bar */}
                <div className="flex items-center justify-between mb-3 px-0.5">
                  {/* Previous Month Arrow Button */}
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="w-8 h-8 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                    aria-label="Previous Month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Center Month & Year Dropdowns */}
                  <div className="flex items-center space-x-1.5">
                    {/* Month Dropdown */}
                    <div className="relative">
                      <select
                        value={viewMonth}
                        onChange={(e) => setViewMonth(Number(e.target.value))}
                        className="appearance-none bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl pl-3 pr-6 py-1 text-xs font-bold text-slate-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#ba1228]"
                      >
                        {MONTH_NAMES.map((name, idx) => (
                          <option key={name} value={idx}>{name}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Year Dropdown */}
                    <div className="relative">
                      <select
                        value={viewYear}
                        onChange={(e) => setViewYear(Number(e.target.value))}
                        className="appearance-none bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl pl-3 pr-6 py-1 text-xs font-bold text-slate-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#ba1228]"
                      >
                        {YEAR_OPTIONS.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Next Month Arrow Button */}
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    disabled={isCurrentOrFutureMonth}
                    className={`w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 transition-colors ${isCurrentOrFutureMonth
                      ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-300'
                      : 'hover:border-slate-300 hover:bg-slate-50 cursor-pointer'
                      }`}
                    aria-label="Next Month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* 2. Days of Week Header */}
                <div className="grid grid-cols-7 mb-1 text-center">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                    <div key={idx} className="text-[11px] font-bold text-slate-400 py-1 uppercase">
                      {day}
                    </div>
                  ))}
                </div>

                {/* 3. 7-Column Date Grid Cells */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarCells.map((cell, idx) => {
                    if (!cell.isCurrentMonth) {
                      return (
                        <div
                          key={`other-${idx}`}
                          className="h-8 flex items-center justify-center text-xs font-normal text-slate-300 select-none"
                        >
                          {cell.dayNum}
                        </div>
                      );
                    }

                    if (cell.isFuture) {
                      return (
                        <div
                          key={`future-${cell.dateStr}`}
                          className="h-8 flex items-center justify-center text-xs font-medium text-slate-300 cursor-not-allowed select-none"
                          title="Future date not available"
                        >
                          {cell.dayNum}
                        </div>
                      );
                    }

                    const isSelected = tempSelectedDate === cell.dateStr;

                    return (
                      <button
                        key={`cell-${cell.dateStr}`}
                        type="button"
                        onClick={() => setTempSelectedDate(cell.dateStr)}
                        className={`h-8 rounded-xl flex flex-col items-center justify-center text-xs transition-all relative cursor-pointer ${isSelected
                          ? 'bg-[#ba1228] text-white font-bold shadow-sm'
                          : 'text-slate-700 font-semibold hover:bg-slate-100 hover:text-slate-900'
                          }`}
                      >
                        <span>{cell.dayNum}</span>
                        {cell.hasArchive && (
                          <span
                            className={`w-1 h-1 rounded-full absolute bottom-0.5 ${isSelected ? 'bg-amber-300' : 'bg-emerald-500'
                              }`}
                            title="अंक उपलब्ध (Edition available)"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* 4. Bottom Action Footer Bar */}
                <div className="border-t border-slate-100 flex items-center justify-between pt-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsDatePickerOpen(false)}
                    className="rounded-xl border border-slate-200 px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyDate}
                    className="rounded-xl bg-[#ba1228] hover:bg-[#9b0f21] px-6 py-2 text-xs font-bold text-white shadow-sm transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Tools & Download */}
        <div className="flex items-center space-x-2">
          {directFullUrl && (
            <button
              type="button"
              onClick={() => window.open(directFullUrl, '_blank')}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-[#ba1228] font-extrabold text-xs rounded-lg flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF डाउनलोड</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-black/30 hover:bg-white/20 text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      </header>

      {/* 2. MAIN BROADSHEET PDF VIEWER STAGE */}
      <main className="flex-1 overflow-hidden bg-[#0a0e17] p-0 flex flex-col items-center justify-start relative">

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-8 space-y-3 text-center my-auto">
            <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
            <p className="text-sm font-bold text-slate-200 font-serif">
              ई-पेपर ब्रॉडशीट लोड हो रहा है...
            </p>
            <p className="text-xs text-slate-400 font-sans">
              {activeEdition.name} • {formatHindiDate(selectedDate)}
            </p>
          </div>
        )}

        {/* Error State or Not Created State */}
        {!isLoading && errorMsg && (
          errorMsg === 'NOT_CREATED' ? (
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 border border-slate-700/60 rounded-3xl bg-slate-900/90 max-w-lg text-center space-y-5 my-auto shadow-2xl backdrop-blur-md">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wide">
                  अंक उपलब्ध नहीं है (Not Available)
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white font-serif pt-1">
                  {formatHindiDate(selectedDate)} का ई-पेपर प्रकाशित नहीं हुआ है
                </h3>
                <p className="text-xs text-slate-400 font-sans max-w-sm mx-auto">
                  इस तारीख के लिए कोई ई-पेपर नहीं बनाया गया है (No ePaper was created for this date)। कृपया कैलेंडर से कोई अन्य तारीख चुनें या नवीनतम अंक पढ़ें।
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {archiveDatesList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const latest = archiveDatesList.find(a => a.status === 'PUBLISHED') || archiveDatesList[0];
                      if (latest) {
                        setSelectedDate(latest.date);
                        setTempSelectedDate(latest.date);
                      }
                    }}
                    className="px-5 py-2.5 bg-[#ba1228] hover:bg-[#9b0f21] text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center space-x-1.5"
                  >
                    <FileText className="w-4 h-4" />
                    <span>नवीनतम प्रकाशित अंक देखें</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(true)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>कैलेंडर खोलें</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border border-red-500/30 rounded-2xl bg-red-950/20 max-w-md text-center space-y-4 my-auto shadow-2xl">
              <FileText className="w-12 h-12 text-red-400" />
              <h3 className="text-base font-bold text-red-200 font-serif">{errorMsg}</h3>
              <button
                type="button"
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
              >
                आज का अंक लोड करें
              </button>
            </div>
          )
        )}

        {/* BROADSHEET CANVAS & HOTSPOT OVERLAY VIEWER */}
        {!isLoading && !errorMsg && (
          <div className="w-full h-full flex flex-col items-center justify-start overflow-hidden relative">
            {readerViewMode === 'newspaper' ? (
              /* 1. 1344x2112 BROADSHEET CANVAS + INTERACTIVE HOTSPOT OVERLAY */
              <div className="w-full h-full overflow-auto flex justify-center items-start pt-0 pb-16 px-2 sm:px-4 custom-scrollbar select-none">
                <div
                  className="transition-transform duration-150 origin-top mt-0 mb-8"
                  style={{
                    width: `${Math.round(1344 * canvasZoom)}px`,
                    height: `${Math.round(2112 * canvasZoom)}px`,
                  }}
                >
                                    <div
                    ref={pageContainerRef}
                    style={{
                      width: '1344px',
                      minWidth: '1344px',
                      maxWidth: '1344px',
                      height: '2112px',
                      minHeight: '2112px',
                      maxHeight: '2112px',
                      transform: `scale(${canvasZoom})`,
                      transformOrigin: 'top left',
                    }}
                    className="bg-[#fffdf7] text-slate-950 border border-slate-300/80 shadow-2xl ring-1 ring-slate-900/5 p-6 sm:p-10 font-serif rounded-sm relative mb-20 shrink-0 overflow-hidden select-none"
                  >
                    {/* Top Date Line Bar */}
                    <div className="flex items-center justify-between border-b border-slate-900 pb-1 text-xs font-sans font-bold text-slate-800">
                      <span>{(activeEdition.city || 'पटना')} • {formatHindiDateString(selectedDate)}</span>
                      <span className="font-serif italic text-slate-600">डिजिटल संस्करण • epaper</span>
                      <span>पेज {formattedCurrentPage}</span>
                    </div>

                    {/* BIG RED BROADSHEET MASTHEAD (Exact Match to Admin Broadsheet Canvas) */}
                    <div className="text-center border-b-4 border-double border-slate-900 pb-1.5 space-y-0.5">
                      <h1
                        style={{ fontFamily: "'Noto Serif Devanagari', 'Merriweather', serif", lineHeight: 0.95 }}
                        className="text-5xl sm:text-6xl font-black text-red-700 tracking-tight select-none"
                      >
                        {activeEdition.title || 'डिजिटल ई-पेपर'}
                      </h1>
                      <div className="flex items-center justify-center space-x-3 text-[10px] font-sans font-bold uppercase tracking-wider text-slate-700 pt-0.5">
                        <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black">Free-Form Canvas</span>
                        <span>•</span>
                        <span>{(activeEdition as any).state || 'बिहार'}</span>
                        <span>•</span>
                        <span>{activeEdition.name || 'पटना'}</span>
                      </div>
                    </div>

                    {/* ABSOLUTE POSITIONED SLOTS CONTAINER (Identical rendering to Admin Studio Canvas!) */}
                    {currentSlots.map((rawSlot, sIdx) => {
                      const s = normalizeSlotData(rawSlot);
                      const comp = (s.computedSections && s.computedSections.text1 !== undefined) ? s.computedSections : computeSlotSections(s);
                      const cardContentW = Math.max(100, s.width - 24);
                      const vertAlign: 'top' | 'middle' | 'bottom' = s.imageVertAlign || 'top';
                      const normAlign = (s.imageAlignment || s.imageAlign || 'Center').toLowerCase();
                      const isLeft = normAlign === 'left';
                      const isRight = normAlign === 'right';
                      const hasImage = Boolean(s.imageUrl);

                      const slotStyle: React.CSSProperties = {
                        position: 'absolute',
                        left: `${s.x}px`,
                        top: `${s.y}px`,
                        width: `${s.width}px`,
                        height: `${s.height}px`,
                      };

                      if (s.isAd) {
                        return (
                          <div
                            key={`slot-ad-${s.id || sIdx}`}
                            style={slotStyle}
                            className="p-3.5 bg-amber-100/90 rounded-xl border-2 border-amber-400 text-center space-y-1 relative overflow-hidden select-none z-0"
                          >
                            <h4 className="text-lg font-black text-blue-900 font-sans tracking-wide break-words">{s.headline}</h4>
                            {s.subHeadline && <p className="text-[11px] font-bold text-red-700 font-sans leading-tight block break-words">{s.subHeadline}</p>}
                            {s.summary && <p className="text-[10px] font-semibold text-slate-700 font-mono break-words">{s.summary}</p>}
                          </div>
                        );
                      }

                      const headerContent = (
                        <div id={`reader-slot-header-${s.id}`} className="space-y-0.5">
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
                      );

                      let bodyContent = null;
                      const lineH = getSummaryLineHeight(s.summaryFontSize || 14);

                      if (!hasImage) {
                        bodyContent = (
                          <div className="flex-1 min-h-0 text-slate-800 leading-normal select-none w-full overflow-hidden shrink-0">
                            <div
                              style={{
                                fontFamily: "'Noto Serif Devanagari', 'Merriweather', serif",
                                lineHeight: `${lineH}px`,
                                columnCount: comp.colsCount > 1 ? comp.colsCount : undefined,
                                columnGap: `${comp.colGap}px`,
                                columnFill: 'auto',
                                height: `${comp.fullStoryH}px`,
                                maxHeight: `${comp.fullStoryH}px`,
                                overflow: 'hidden',
                                columnRule: comp.showDivider ? '1px solid #cbd5e1' : undefined,
                                textAlign: 'justify',
                                textJustify: 'inter-word',
                                fontSize: `${s.summaryFontSize || 14}px`,
                                color: s.summaryColor || undefined,
                                whiteSpace: 'pre-line',
                                boxSizing: 'border-box',
                                paddingRight: '2px'
                              }}
                              className="leading-normal h-full overflow-hidden whitespace-pre-line text-justify"
                              dangerouslySetInnerHTML={{ __html: s.summary || '' }}
                            />
                          </div>
                        );
                      } else if (comp.isFullWidth) {
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
                            <div
                              style={{
                                width: isTopSpanPhoto ? '100%' : `${currentImgW}px`,
                                height: `${s.imageHeight || 140}px`,
                                marginLeft: isTopSpanPhoto ? '0px' : `${photoPxX}px`,
                              }}
                              className="overflow-hidden rounded-[4px] relative bg-slate-900 shadow-xs border border-slate-300"
                            >
                              <img
                                src={getFullMediaUrl(s.imageUrl)}
                                alt="Slot photo"
                                className="w-full h-full object-cover block"
                                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                              />
                            </div>
                          </div>
                        );

                        const textDiv = (
                          <div
                            style={{
                              fontFamily: "'Noto Serif Devanagari', 'Merriweather', serif",
                              lineHeight: `${lineH}px`,
                              columnCount: comp.colsCount > 1 ? comp.colsCount : undefined,
                              columnGap: `${comp.colGap}px`,
                              columnFill: 'auto',
                              height: `${bannerTextH}px`,
                              maxHeight: `${bannerTextH}px`,
                              overflow: 'hidden',
                              columnRule: comp.showDivider ? '1px solid #cbd5e1' : undefined,
                              textAlign: 'justify',
                              textJustify: 'inter-word',
                              fontSize: `${s.summaryFontSize || 14}px`,
                              color: s.summaryColor || undefined,
                              whiteSpace: 'pre-line',
                              boxSizing: 'border-box',
                              paddingRight: '2px'
                            }}
                            className="leading-[1.35] flex-1 overflow-hidden break-words whitespace-pre-line text-justify"
                            dangerouslySetInnerHTML={{ __html: comp.text1 || s.summary || '' }}
                          />
                        );

                        bodyContent = (
                          <div className="flex-1 min-h-0 text-slate-800 leading-normal select-none w-full flex flex-col overflow-hidden shrink-0">
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
                      } else {
                        const colStyleLeft: React.CSSProperties = {
                          fontFamily: "'Noto Serif Devanagari', 'Merriweather', serif",
                          lineHeight: `${lineH}px`,
                          columnCount: comp.leftCols > 1 ? comp.leftCols : undefined,
                          columnGap: `${comp.colGap}px`,
                          columnFill: 'auto',
                          height: `${comp.fullStoryH}px`,
                          maxHeight: `${comp.fullStoryH}px`,
                          overflow: 'hidden',
                          columnRule: comp.showDivider ? '1px solid #cbd5e1' : undefined,
                          textAlign: 'justify',
                          textJustify: 'inter-word',
                          fontSize: `${s.summaryFontSize || 14}px`,
                          color: s.summaryColor || undefined,
                          whiteSpace: 'pre-line',
                          boxSizing: 'border-box',
                          paddingRight: '2px'
                        };

                        const colStylePhoto: React.CSSProperties = {
                          fontFamily: "'Noto Serif Devanagari', 'Merriweather', serif",
                          lineHeight: `${lineH}px`,
                          columnCount: comp.photoCols > 1 ? comp.photoCols : undefined,
                          columnGap: `${comp.colGap}px`,
                          columnFill: 'auto',
                          height: `${comp.underPhotoH}px`,
                          maxHeight: `${comp.underPhotoH}px`,
                          overflow: 'hidden',
                          columnRule: comp.showDivider ? '1px solid #cbd5e1' : undefined,
                          textAlign: 'justify',
                          textJustify: 'inter-word',
                          fontSize: `${s.summaryFontSize || 14}px`,
                          color: s.summaryColor || undefined,
                          whiteSpace: 'pre-line',
                          boxSizing: 'border-box',
                          paddingRight: '2px'
                        };

                        const colStyleRight: React.CSSProperties = {
                          fontFamily: "'Noto Serif Devanagari', 'Merriweather', serif",
                          lineHeight: `${lineH}px`,
                          columnCount: comp.rightCols > 1 ? comp.rightCols : undefined,
                          columnGap: `${comp.colGap}px`,
                          columnFill: 'auto',
                          height: `${comp.fullStoryH}px`,
                          maxHeight: `${comp.fullStoryH}px`,
                          overflow: 'hidden',
                          columnRule: comp.showDivider ? '1px solid #cbd5e1' : undefined,
                          textAlign: 'justify',
                          textJustify: 'inter-word',
                          fontSize: `${s.summaryFontSize || 14}px`,
                          color: s.summaryColor || undefined,
                          whiteSpace: 'pre-line',
                          boxSizing: 'border-box',
                          paddingRight: '2px'
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
                            <div
                              style={{
                                width: s.imageWidth && s.imageWidth < comp.photoSectionW ? `${displayImgW}px` : '100%',
                                height: `${s.imageHeight || 140}px`,
                                marginLeft: s.imageWidth && s.imageWidth < comp.photoSectionW ? `${localPhotoPxX}px` : '0px',
                              }}
                              className="overflow-hidden rounded-[4px] relative bg-slate-900 shadow-xs border border-slate-300"
                            >
                              <img
                                src={getFullMediaUrl(s.imageUrl)}
                                alt="Slot photo"
                                className="w-full h-full object-cover block"
                                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                              />
                            </div>
                          </div>
                        );

                        bodyContent = (
                          <div
                            style={{ gap: `${comp.colGap}px` }}
                            className="flex-1 min-h-0 font-serif text-slate-800 leading-normal select-none w-full flex items-start overflow-hidden shrink-0"
                          >
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
                      }

                      return (
                        <div
                          key={`rendered-slot-${s.id || sIdx}`}
                          style={slotStyle}
                          className="relative z-0 select-none overflow-hidden"
                        >
                          <div className="w-full h-full p-2 flex flex-col overflow-hidden space-y-1">
                            {headerContent}
                            {bodyContent}
                          </div>
                        </div>
                      );
                    })}

                    {/* High-Res Compiled WebP Photo Layer (Overlays if generated & successfully loaded) */}
                    {!imageLoadError && canvasImageUrl && (
                      <img
                        key={canvasImageUrl}
                        src={canvasImageUrl}
                        alt={`${activeEdition.name} - Page ${currentPageIndex + 1}`}
                        onLoad={() => setHasImageLoaded(true)}
                        onError={() => setImageLoadError(true)}
                        className={`absolute inset-0 w-full h-full object-cover select-none pointer-events-none z-10 transition-opacity duration-300 ${hasImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                      />
                    )}

                    {/* Interactive Hotspot Overlay Boxes with Light Red Border & Red Overlay Tint */}
                    {currentSlots.map((rawSlot, sIdx) => {
                      const slot = normalizeSlotData(rawSlot);
                      return (
                        <div
                          key={slot.id || `slot-${currentPageIndex}-${sIdx}`}
                          onClick={() => {
                            setSelectedArticle(slot);
                            setIsArticleModalOpen(true);
                          }}
                          title={slot.headline || ''}
                          className="absolute cursor-pointer border border-transparent epaper-slot-hotspot hover:border-[#ba1228] hover:bg-[#ba1228]/15 hover:ring-2 hover:ring-[#ba1228]/20 transition-all duration-150 rounded-xs z-20 select-none"
                          style={{
                            position: 'absolute',
                            left: `${slot.x}px`,
                            top: `${slot.y}px`,
                            width: `${slot.width}px`,
                            height: `${slot.height}px`
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : singlePagePdfUrl ? (
              /* 2. PDF EMBED VIEWER (WHEN PDF VIEW IS SELECTED) */
              <div className="w-full h-full max-w-[1300px] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80 relative flex flex-col">
                <object
                  key={singlePagePdfUrl}
                  data={singlePagePdfUrl}
                  type="application/pdf"
                  className="w-full h-full border-0 bg-[#fffdf7]"
                >
                  <iframe
                    src={singlePagePdfUrl}
                    title={'Broadsheet E-Paper Page ' + (currentPageIndex + 1)}
                    className="w-full h-full border-0 bg-[#fffdf7]"
                  />
                </object>
              </div>
            ) : null}
          </div>
        )}

        {/* 3. FLOATING PAGE NAVIGATION PILL BAR (EXACT MATCHING IMAGE 2) */}
        {!isLoading && !errorMsg && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4 duration-200">
            <div className="bg-[#2d3342] text-slate-100 px-4 py-2 rounded-2xl border border-slate-600/60 shadow-2xl flex items-center space-x-3 text-xs font-sans font-bold">

              {/* All Pages Button */}
              <button
                type="button"
                onClick={() => setShowAllPagesGrid(!showAllPagesGrid)}
                className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-700/80 text-slate-200 transition-colors cursor-pointer"
              >
                <LayoutGrid className="w-4 h-4 text-amber-300" />
                <span className="text-xs">सभी पृष्ठ देखें</span>
              </button>

              {/* View Mode Toggle (Newspaper vs PDF) */}
              {singlePagePdfUrl && (
                <>
                  <div className="h-5 w-px bg-slate-500/50" />
                  <button
                    type="button"
                    onClick={() => setReaderViewMode(prev => prev === 'newspaper' ? 'pdf' : 'newspaper')}
                    className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-700/80 text-amber-300 transition-colors cursor-pointer"
                    title={readerViewMode === 'newspaper' ? 'मूल PDF ब्रॉडशीट देखें' : 'अखबार कैनवास देखें'}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span className="text-xs">
                      {readerViewMode === 'newspaper' ? 'PDF देखें' : 'अखबार देखें'}
                    </span>
                  </button>
                </>
              )}

              {/* Canvas Zoom Controls (When in Broadsheet Canvas view) */}
              {readerViewMode === 'newspaper' && (
                <>
                  <div className="h-5 w-px bg-slate-500/50" />
                  <div className="flex items-center space-x-1 bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-600/50">
                    <button
                      type="button"
                      onClick={() => setCanvasZoom(prev => Math.max(0.3, Number((prev - 0.05).toFixed(2))))}
                      className="p-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="ज़ूम कम करें (Zoom Out -5%)"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCanvasZoom(0.90)}
                      className="font-mono text-[11px] font-bold text-amber-300 px-1 hover:text-white cursor-pointer"
                      title="रीसेट ज़ूम (Reset 90%)"
                    >
                      {Math.round(canvasZoom * 100)}%
                    </button>
                    <button
                      type="button"
                      onClick={() => setCanvasZoom(prev => Math.min(2.0, Number((prev + 0.05).toFixed(2))))}
                      className="p-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="ज़ूम बढ़ाएं (Zoom In +5%)"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}

              {/* Vertical Divider Line | */}
              <div className="h-5 w-px bg-slate-500/50" />

              {/* First Page Button |< */}
              <button
                type="button"
                disabled={currentPageIndex === 0}
                onClick={() => setCurrentPageIndex(0)}
                className="p-1.5 rounded-lg hover:bg-slate-700/80 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="पहला पृष्ठ (First Page)"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Previous Page Button < */}
              <button
                type="button"
                disabled={currentPageIndex === 0}
                onClick={() => setCurrentPageIndex(prev => Math.max(0, prev - 1))}
                className="p-1.5 rounded-lg hover:bg-slate-700/80 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="पिछला पृष्ठ (Previous Page)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Current Page Display Text e.g. "Page 01 of 04" */}
              <span className="px-3 py-1 font-mono font-extrabold text-white text-xs bg-slate-900/60 rounded-lg border border-slate-600/40 tracking-wide">
                Page {formattedCurrentPage} of {formattedTotalPages}
              </span>

              {/* Next Page Button > */}
              <button
                type="button"
                disabled={currentPageIndex >= totalPages - 1}
                onClick={() => setCurrentPageIndex(prev => Math.min(totalPages - 1, prev + 1))}
                className="p-1.5 rounded-lg hover:bg-slate-700/80 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="अगला पृष्ठ (Next Page)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Last Page Button >| */}
              <button
                type="button"
                disabled={currentPageIndex >= totalPages - 1}
                onClick={() => setCurrentPageIndex(totalPages - 1)}
                className="p-1.5 rounded-lg hover:bg-slate-700/80 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="अंतिम पृष्ठ (Last Page)"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>

            </div>
          </div>
        )}

      </main>

      {/* 4. "सभी पृष्ठ देखें" ALL PAGES GRID OVERLAY MODAL */}
      {showAllPagesGrid && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#1e2430] text-slate-100 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-700 flex flex-col p-6 font-sans">

            <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-6">
              <div className="flex items-center space-x-2">
                <LayoutGrid className="w-5 h-5 text-red-500" />
                <h2 className="text-base font-black text-white font-serif tracking-wide">
                  सभी पृष्ठ चुनें (Select Page) — {activeEdition.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAllPagesGrid(false)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCurrentPageIndex(idx);
                    setShowAllPagesGrid(false);
                  }}
                  className={'p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center space-y-2 cursor-pointer ' + (currentPageIndex === idx ? 'border-red-500 bg-red-950/40 text-white shadow-xl scale-105' : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:border-slate-500 hover:bg-slate-700/80')}
                >
                  <div className="w-10 h-12 bg-white rounded-md border border-slate-400 flex items-center justify-center font-serif font-black text-slate-900 text-base shadow">
                    {idx + 1}
                  </div>
                  <span className="text-xs font-bold font-mono">
                    Page {String(idx + 1).padStart(2, '0')}
                  </span>
                  {currentPageIndex === idx && (
                    <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold flex items-center">
                      <Check className="w-3 h-3 mr-1" /> सक्रिय
                    </span>
                  )}
                </button>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* 5. LIVE HINDUSTAN DUAL-VIEW ARTICLE DETAIL MODAL (100% PIXEL-PERFECT LAYOUT) */}
      {isArticleModalOpen && selectedArticle && (
        <div className="fixed inset-0 z-50 bg-[#f4f5f7] flex flex-col text-slate-900 select-text overflow-hidden animate-in fade-in duration-150">

          {/* 1. TOP HEADER NAVIGATION (EXACT LIVEHINDUSTAN SPECIFICATION) */}
          <header className="h-14 sm:h-16 px-4 sm:px-8 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0 shadow-xs z-30 relative">
            {/* Left: < Back button */}
            <button
              type="button"
              onClick={() => {
                setIsArticleModalOpen(false);
                setSelectedArticle(null);
              }}
              className="flex items-center gap-1.5 font-bold text-slate-800 text-sm hover:text-[#ba1228] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {/* Center Pill Switcher (Centered / Shifted to the right over clipping content) */}
            <div className="bg-slate-200 p-1 flex items-center gap-1 rounded-xl shadow-inner md:absolute md:left-1/2 md:-translate-x-1/2">
              <button
                type="button"
                onClick={() => setActiveViewTab('text')}
                className={`px-4 py-1.5 text-xs flex items-center gap-1.5 rounded-lg transition-all cursor-pointer ${activeViewTab === 'text'
                  ? 'bg-[#ba1228] text-white font-bold shadow-sm'
                  : 'text-slate-600 font-semibold hover:text-slate-900'
                  }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Text View</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab('image')}
                className={`px-4 py-1.5 text-xs flex items-center gap-1.5 rounded-lg transition-all cursor-pointer ${activeViewTab === 'image'
                  ? 'bg-[#ba1228] text-white font-bold shadow-sm'
                  : 'text-slate-600 font-semibold hover:text-slate-900'
                  }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Image View</span>
              </button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* A- / A+ Font Size Controls */}
              {activeViewTab === 'text' && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setFontSize(prev => Math.max(14, prev - 1))}
                    className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="फ़ॉन्ट छोटा करें (A-)"
                  >
                    A-
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSize(prev => Math.min(26, prev + 1))}
                    className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="फ़ॉन्ट बड़ा करें (A+)"
                  >
                    A+
                  </button>
                </div>
              )}

              {/* Clipping Zoom Controls (- 100% + Reset) - In Header to the left of Listen */}
              {activeViewTab === 'image' && (
                <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg p-0.5 mr-1 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setClippingZoom(prev => Math.max(0.6, Number((prev - 0.15).toFixed(2))))}
                    className="p-1 rounded hover:bg-white text-slate-700 transition-colors cursor-pointer"
                    title="Zoom Out (-)"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono font-bold text-slate-700 px-1 min-w-[38px] text-center">
                    {Math.round(clippingZoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setClippingZoom(prev => Math.min(2.0, Number((prev + 0.15).toFixed(2))))}
                    className="p-1 rounded hover:bg-white text-slate-700 transition-colors cursor-pointer"
                    title="Zoom In (+)"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setClippingZoom(1)}
                    className="text-[11px] font-bold text-slate-600 hover:text-slate-900 px-1.5 py-0.5 rounded hover:bg-white transition-colors"
                    title="Reset Zoom"
                  >
                    Reset
                  </button>
                </div>
              )}

              {/* Blue Audio Pill: [ 🔊 Listen ] */}
              <button
                type="button"
                onClick={handleToggleSpeech}
                className={`rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer ${isSpeaking
                  ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                  : 'bg-[#0088cc] hover:bg-[#0077b5] text-white'
                  }`}
                title={isSpeaking ? 'ऑडियो रोकें (Stop)' : 'समाचार सुनें (Listen)'}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? 'Pause' : 'Listen'}</span>
              </button>

              {/* Quick Share / Copy Icon Set */}
              <button
                type="button"
                onClick={handleCopyArticle}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer relative"
                title="समाचार कॉपी करें (Copy)"
              >
                <Copy className="w-4 h-4" />
                {articleCopiedToast && (
                  <span className="absolute -bottom-8 right-0 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-50">
                    कॉपी हो गया!
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={handleShareArticle}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-[#ba1228] transition-colors cursor-pointer"
                title="शेयर करें (Share / WhatsApp)"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Download Button (Downloads Text in Text View & Image in Image View) */}
              <button
                type="button"
                onClick={handleDownloadArticle}
                disabled={isDownloadingArticle}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-[#ba1228] transition-colors cursor-pointer flex items-center gap-1.5 relative text-xs font-bold shadow-xs active:scale-95"
                title={activeViewTab === 'text' ? 'टेक्स्ट डाउनलोड करें (Download Text)' : 'क्लिपिंग / इमेज डाउनलोड करें (Download Image)'}
              >
                {isDownloadingArticle ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#ba1228]" />
                ) : (
                  <Download className="w-4 h-4 text-slate-700" />
                )}
                <span className="hidden sm:inline">
                  {activeViewTab === 'text' ? 'Download Text' : 'Download Image'}
                </span>
                {articleDownloadedToast && (
                  <span className="absolute -bottom-8 right-0 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-50">
                    {articleDownloadedToast}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsArticleModalOpen(false);
                  setSelectedArticle(null);
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer ml-1"
                title="बंद करें (Close)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* 2. SCROLLABLE MIDDLE CONTENT AREA */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
            {activeViewTab === 'text' ? (
              /* TAB 1: TEXT VIEW (IMAGE 1 SPECIFICATION) */
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8 sm:p-12 mx-auto my-6 max-w-3xl">
                {/* Kicker / Category */}
                {(selectedArticle.categoryTag || selectedArticle.categoryBadge) && (
                  <div className="text-xs sm:text-sm font-semibold text-slate-600 mb-2 tracking-wide uppercase font-sans">
                    {selectedArticle.categoryTag || selectedArticle.categoryBadge}
                  </div>
                )}

                {/* Main Headline */}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-4 font-serif" dangerouslySetInnerHTML={{ __html: selectedArticle.headline || 'अनाम समाचार' }} />

                {/* Sub-headline (if exists) */}
                {selectedArticle.subHeadline && (
                  <h3
                    className="text-sm sm:text-base font-medium text-slate-700 mb-6 italic font-serif border-l-2 border-[#ba1228] pl-3 py-0.5"
                    dangerouslySetInnerHTML={{ __html: selectedArticle.subHeadline }}
                  />
                )}

                {/* Dateline & Meta */}
                <div className="text-xs text-slate-500 font-sans flex items-center gap-2 mb-6 pb-3 border-b border-slate-100">
                  <span>{activeEdition.city}</span>
                  <span>•</span>
                  <span>{formatHindiDate(selectedDate)}</span>
                  <span>•</span>
                  <span>पेज {String(currentPageIndex + 1).padStart(2, '0')}</span>
                </div>

                {/* Story Image (if exists) */}
                {selectedArticle.imageUrl && (
                  <div className="rounded-xl border border-slate-100 shadow-xs mb-6 overflow-hidden bg-slate-50">
                    <img
                      src={getFullMediaUrl(selectedArticle.imageUrl)}
                      alt={selectedArticle.headline || 'Article Image'}
                      className="w-full max-h-[420px] object-cover"
                    />
                  </div>
                )}

                {/* Body Paragraphs (dynamically scaled by fontSize) */}
                <div
                  style={{ fontSize: `${fontSize}px` }}
                  className="font-serif text-slate-800 leading-relaxed text-justify space-y-4 [&_p]:mb-3 [&_b]:font-bold [&_mark]:bg-amber-200 [&_mark]:px-1.5 [&_mark]:py-0.5 [&_mark]:rounded-xs [&_mark]:font-bold"
                  dangerouslySetInnerHTML={{
                    __html: cleanAndFormatHtml(selectedArticle.contentText || selectedArticle.summary || 'इस समाचार का विस्तृत विवरण जल्द उपलब्ध होगा।')
                  }}
                />
              </div>
            ) : (
              /* TAB 2: IMAGE VIEW (PRINT NEWSPAPER CLIPPING CUTOUT - IMAGE 2 SPECIFICATION) */
              <div className="flex flex-col items-center justify-start pb-8 relative pt-2">
                {/* Print Newspaper Clipping Cutout Sheet */}
                <div
                  style={{
                    transform: `scale(${clippingZoom})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.15s ease-out'
                  }}
                  className="max-w-2xl w-full mx-auto shadow-2xl rounded-sm border border-slate-300 bg-white p-2 relative"
                >
                  <div
                    ref={clippingSheetRef}
                    data-clipping-card="true"
                    className="p-4 sm:p-6 bg-[#fdfcf9] border border-slate-200 space-y-4 font-serif text-slate-950"
                  >
                    {/* Newspaper Masthead / Clipping Bar */}
                    <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2 text-[11px] font-sans font-bold text-slate-800 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span className="text-[#ba1228] font-black text-sm">डिजिटल ई-पेपर</span>
                        <span className="text-slate-400">|</span>
                        <span>{activeEdition.title}</span>
                      </div>
                      <div>
                        <span>{formatHindiDate(selectedDate)}</span>
                        <span className="mx-2">•</span>
                        <span>पेज {String(currentPageIndex + 1).padStart(2, '0')}</span>
                      </div>
                    </div>

                    {/* Category & Headline */}
                    <div className="space-y-1">
                      {(selectedArticle.categoryTag || selectedArticle.categoryBadge) && (
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#ba1228] font-sans block">
                          {selectedArticle.categoryTag || selectedArticle.categoryBadge}
                        </span>
                      )}
                      <h2
                        className="text-2xl sm:text-3xl font-black text-slate-950 font-serif leading-tight"
                        dangerouslySetInnerHTML={{ __html: cleanAndFormatHtml(selectedArticle.headline || 'अनाम समाचार') }}
                      />
                      {selectedArticle.subHeadline && (
                        <p
                          className="text-sm font-bold text-red-700 font-serif italic"
                          dangerouslySetInnerHTML={{ __html: cleanAndFormatHtml(selectedArticle.subHeadline) }}
                        />
                      )}
                    </div>

                    {/* Clipping Photo */}
                    {selectedArticle.imageUrl && (
                      <div className="border border-slate-300 p-1 bg-white shadow-xs rounded-xs my-2">
                        <img
                          src={getFullMediaUrl(selectedArticle.imageUrl)}
                          crossOrigin="anonymous"
                          alt={selectedArticle.headline || 'Print Clipping'}
                          className="w-full max-h-[380px] object-contain"
                        />
                      </div>
                    )}

                    {/* Columnar Print Newspaper Body */}
                    <div
                      className="text-xs sm:text-sm text-slate-900 font-serif leading-relaxed text-justify columns-1 sm:columns-2 gap-6 pt-3 border-t border-slate-200 [&_p]:mb-3 [&_b]:font-bold [&_mark]:bg-amber-200 [&_mark]:px-1.5 [&_mark]:py-0.5 [&_mark]:rounded-xs [&_mark]:font-bold"
                      dangerouslySetInnerHTML={{
                        __html: cleanAndFormatHtml(selectedArticle.contentText || selectedArticle.summary || 'इस समाचार का विस्तृत प्रिंट विवरण उपलब्ध नहीं है।')
                      }}
                    />

                    {/* Clipping Watermark Footer */}
                    <div className="pt-3 border-t border-slate-300 flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span className="font-semibold text-slate-600">डिजिटल ई-पेपर क्लिपिंग</span>
                      <span className="text-slate-400">डिजिटल संस्करण</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
