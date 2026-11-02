'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Zap,
  Newspaper,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Settings,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { EPaperSlotData } from '@/app/admin/epaper/page';
import { getEditorialStoryImage } from '@/utils/editorialPhotos';
import { autoGenerateEpaperPage } from '@/services/epaperService';

interface AIPageGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageNumber: number;
  editionCity: string;
  date?: string;
  onApplySlots: (slots: EPaperSlotData[], mode: 'replace' | 'append') => void;
}

const SAMPLE_PROMPTS = [
  'top breaking news in india with 10 slots',
  'national politics and parliament session 5 slots',
  'patna and bihar governance and development 4 slots',
  'sports arena: cricket and football highlights 4 slots',
  'economy, stock market and business updates 4 slots',
  'world news and global diplomacy 5 slots'
];

function cleanDateline(str: string): string {
  if (!str) return '';
  return str
    .replace(/<[^>]+>/g, ' ')
    .replace(/^[\s#*_\-]+/gm, '')
    .replace(/[*_#\`]/g, '')
    .replace(/^[【\[][^】\]]*[】\]]\s*:?\s*/gi, '')
    .replace(/【[^】]*】\s*:?\s*/gi, '')
    .replace(/\[[^\]]*\]\s*:?\s*/gi, '')
    .replace(/^[\u0900-\u097F\w\s]{2,15}\s*•\s*[\d\u0900-\u097F\w\s]{4,30}\s*[:\-]\s*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function AIPageGeneratorModal({
  isOpen,
  onClose,
  pageNumber,
  editionCity,
  date: initialDate,
  onApplySlots
}: AIPageGeneratorModalProps) {
  // Clean empty input - strictly user-driven
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || new Date().toISOString().split('T')[0]);
  const [applyMode, setApplyMode] = useState<'replace' | 'append'>('replace');
  const [apiKey, setApiKey] = useState<string>('');
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedData, setGeneratedData] = useState<{
    slots: EPaperSlotData[];
    topic: string;
    date: string;
    formattedDateHindi?: string;
    generatedWith: string;
    realtimeSourceCount: number;
  } | null>(null);

  // Sync selectedDate with initialDate prop if it changes
  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
    }
  }, [initialDate]);

  // Sync API key with localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gemini_api_key') || '';
      if (stored) setApiKey(stored);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gemini_api_key', key);
    }
  };

  // Real-time local parser to extract slot count, clean topic, and date while typing
  const liveParsed = useMemo(() => {
    const text = (userPrompt || '').trim();
    const hasPrompt = Boolean(text);
    const today = selectedDate ? new Date(selectedDate) : new Date();

    let count = 6;
    const slotMatch = text.match(/(\d{1,2})\s*(?:slots?|स्लॉट्स?|स्लॉट)/i) || 
                      text.match(/(?:^|\s)(\d{1,2})\s*(?:top\s+|breaking\s+)?(?:news|खबरें|कहानियां|stories|story|posts?|khabar|khabren|khabrein|badi\s*khabar)/i) ||
                      text.match(/\btop\s*(\d{1,2})\b/i) ||
                      text.match(/\b(\d{1,2})\s*(?:khabrein|khabren|khabar)\b/i);
    if (slotMatch) {
      const p = parseInt(slotMatch[1], 10);
      if (!isNaN(p) && p >= 1 && p <= 12) {
        count = p;
      }
    }

    // Date extraction from prompt text
    let detectedDate = selectedDate;
    const lower = text.toLowerCase();

    const isoMatch = lower.match(/\b(20\d\d)[-\/](0?[1-9]|1[0-2])[-\/](0?[1-9]|[12]\d|3[01])\b/);
    if (isoMatch) {
      const [, y, m, d] = isoMatch;
      detectedDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    } else {
      const dmyMatch = lower.match(/\b(0?[1-9]|[12]\d|3[01])[-\/](0?[1-9]|1[0-2])[-\/](20\d\d)\b/);
      if (dmyMatch) {
        const [, d, m, y] = dmyMatch;
        detectedDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      } else if (lower.includes('kal ki') || lower.includes('yesterday')) {
        const yest = new Date(today);
        yest.setDate(yest.getDate() - 1);
        detectedDate = yest.toISOString().split('T')[0];
      }
    }

    let clean = text
      .replace(/\[[^\]]*\]/g, ' ')
      // Strip page target directives: "2nd page k liye", "page 2 ke liye", "dusre page me", etc.
      .replace(/\b(?:(?:1st|2nd|3rd|4th|\d+(?:st|nd|rd|th)?)\s*page|page\s*\d+|pehla\s*page|dusra\s*page|teesra\s*page|chautha\s*page)\b(?:\s*(?:k\s*liye|ke\s*liye|pe|par|me|mein))?/gi, ' ')
      .replace(/(\d{1,4})\s*(?:words?|शब्द|shabd|varn|slots?|स्लॉट्स?|स्लॉट|news|खबरें|stories|khabar|khabren|khabrein)\b/gi, ' ')
      .replace(/\btop\s*\d{1,2}\b/gi, ' ')
      .replace(/\b(?:add|create|generate|write|put|insert|bana\s*do|banao|bana|dalo|dal\s*do|lagao|laga\s*do|likho|likh\s*do|chahiye|lao|karo|kro|kar\s*do|batao|karna\s*hai)\b/gi, ' ')
      .replace(/\b(?:bhai\s*mere|bhai|samjhe|please|plz|zara|thoda|kripya|thik\s*hai|theek\s*hai|ok|okay)\b/gi, ' ')
      .replace(/\b(?:k\s*liye|ke\s*liye|k\s+jo\s+sabse|ke\s+jo\s+sabse|jo\s+sabse|sabse\s+top|wo\s+bas|\bwo\b|\bbas\b|\bsirf\b|only)\b/gi, ' ')
      .replace(/\b(?:se\s*related|se\s*judi|se\s*jurhi|se\s*sambandhit|ke\s*baare\s*me|ke\s*bare\s*me|about|regarding)\b/gi, ' ')
      .replace(/\b(?:iss\s*page\s*me|page\s*me|page\s*par|page\s*pe)\b/gi, ' ')
      .replace(/\b(?:aaj\s*ki|aaj\s*ke|aaj\s*ka|today|kal\s*ki|kal\s*ka|yesterday)\b/gi, ' ')
      .replace(/\b(20\d\d)[-\/](0?[1-9]|1[0-2])[-\/](0?[1-9]|[12]\d|3[01])\b/gi, ' ')
      .replace(/(?:bada\s*lekh|in\s*depth|vishesh|deep\s*analysis)/gi, ' ')
      .replace(/\b(?:in|with|for|me|mein|pe|par|ko|ki|ka|ke|hai|h|hain)\b/gi, ' ')
      .replace(/[.,;!?]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    clean = clean.replace(/\b(?:with|for|me|mein|pe|par|ke\s*liye|and|aur|hai|h|in)\s*$/gi, '').trim();

    let displayTopic = clean || text || 'Top Headlines';
    if (/\b(?:patna|पटना)\b/i.test(clean)) {
      displayTopic = 'Patna Local & Bihar News';
    } else if (/^(?:top\s*)?breaking(?:\s*news)?(?:\s*in\s*india)?$/i.test(clean) || /^india\s+breaking$/i.test(clean)) {
      displayTopic = 'Top Breaking News in India';
    } else if (/^cricket(?:\s+news)?$/i.test(clean)) {
      displayTopic = 'Cricket News';
    } else if (/share\s*market|sensex/i.test(clean)) {
      displayTopic = 'Share Market & Economy';
    } else if (/bihar\s*rajneeti|vidhansabha/i.test(clean)) {
      displayTopic = 'Bihar Politics & Vidhansabha';
    } else if (/hajipur.*vaishali|vaishali.*hajipur/i.test(clean)) {
      displayTopic = 'Hajipur & Vaishali News';
    } else if (/world/i.test(clean) && /breaking|news/i.test(clean)) {
      displayTopic = 'World Breaking News';
    } else if (clean.length > 0) {
      displayTopic = clean.charAt(0).toUpperCase() + clean.slice(1);
    }

    return {
      slots: count,
      topic: displayTopic,
      hasPrompt,
      date: detectedDate,
      isLongForm: count <= 2
    };
  }, [userPrompt, selectedDate]);

  if (!isOpen) return null;

  // Explicit Generation trigger ONLY upon button click
  const handleGenerate = async () => {
    if (!userPrompt.trim()) {
      setErrorMsg('Please enter a topic or page instruction (e.g., "top breaking news in india with 10 slots")');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setGeneratedData(null);
    setLoadingStep(1);

    const stepTimer1 = setTimeout(() => setLoadingStep(2), 1200);
    const stepTimer2 = setTimeout(() => setLoadingStep(3), 2800);

    try {
      const result = await autoGenerateEpaperPage({
        prompt: userPrompt.trim(),
        pageNumber,
        editionCity: editionCity || 'Patna',
        slotCount: liveParsed.slots,
        date: liveParsed.date || selectedDate,
        apiKey: apiKey || undefined
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setLoadingStep(4);

      if (result && Array.isArray(result.slots) && result.slots.length > 0) {
        const sanitizedSlots = result.slots.map((s: any) => ({
          ...s,
          headline: cleanDateline(s.headline),
          subHeadline: cleanDateline(s.subHeadline),
          summary: cleanDateline(s.summary || s.contentText)
        }));
        setGeneratedData({
          slots: sanitizedSlots,
          topic: result.topic || liveParsed.topic,
          date: result.date || liveParsed.date,
          formattedDateHindi: result.formattedDateHindi,
          generatedWith: result.generatedWith || 'AI Engine',
          realtimeSourceCount: result.realtimeSourceCount || result.slots.length
        });
      } else {
        throw new Error('No slots returned from news engine. Please try another prompt.');
      }
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setErrorMsg(err.message || 'Error generating broadsheet page. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!generatedData || !generatedData.slots.length) return;
    const sanitized = (generatedData.slots || []).map((s: any, sIdx: number) => {
      const cleanHl = cleanDateline(s.headline);
      const cleanSub = cleanDateline(s.subHeadline);
      const cleanBody = cleanDateline(s.summary || s.contentText);
      const cleanImg = getEditorialStoryImage({
        topic: s.categoryBadge || s.categoryTag,
        headline: cleanHl,
        category: s.categoryBadge || s.categoryTag,
        rawImageUrl: s.imageUrl,
        slotIndex: sIdx
      });
      return {
        ...s,
        headline: cleanHl,
        subHeadline: cleanSub,
        summary: cleanBody,
        contentText: cleanBody,
        imageUrl: cleanImg
      };
    });
    onApplySlots(sanitized, applyMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-700/80 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black tracking-tight text-white flex items-center space-x-2 font-serif">
                  <span>AI Broadsheet Page Studio</span>
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Live Edition</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans mt-0.5 flex items-center space-x-2">
                <span>Page {pageNumber} ({editionCity} Edition)</span>
                <span>•</span>
                <span className="text-amber-300 font-semibold flex items-center space-x-1">
                  <Calendar className="w-3 h-3 inline" />
                  <span>Edition Date: {liveParsed.date}</span>
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowSettings(prev => !prev)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="API Key Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* API KEY SETTINGS POPOVER */}
        {showSettings && (
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 shrink-0 flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1 max-w-lg">
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Gemini API Key:</span>
              <input
                type="password"
                value={apiKey}
                onChange={e => handleSaveApiKey(e.target.value)}
                placeholder="Google AI Studio Key (AIzaSy...)"
                className="w-full text-xs font-mono bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-red-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 ml-4 hidden sm:block">
              Default active AI engine configured in Server Settings will be used.
            </p>
          </div>
        )}

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* MAIN PROMPT INPUT AREA */}
          {!generatedData && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center space-x-1.5 font-sans">
                  <span>Enter Page Instructions (Topic, Slots, Date):</span>
                </label>
                <div className="flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[11px] font-bold">Date:</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="bg-transparent text-xs font-mono font-bold text-slate-800 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Textarea: Strictly NO auto-submission on Enter */}
              <div className="relative">
                <textarea
                  rows={3}
                  value={userPrompt}
                  onChange={e => setUserPrompt(e.target.value)}
                  placeholder="e.g.: top breaking news in india with 10 slots&#10;or: bihar politics and state assembly session 5 slots&#10;or: cricket world cup & sports round-up 4 slots... (Write in your own words)"
                  className="w-full text-sm font-sans text-slate-900 bg-slate-50 border-2 border-slate-300 focus:border-red-600 focus:bg-white rounded-xl p-3.5 focus:outline-none transition-all shadow-inner leading-relaxed resize-none"
                />
              </div>

              {/* LIVE INTEL BADGES */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="flex items-center space-x-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
                  <span className="font-bold text-blue-700">Topic:</span>
                  <span className="font-semibold text-blue-950">
                    "{liveParsed.hasPrompt ? liveParsed.topic : 'Write instruction...'}"
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="font-bold text-emerald-700">Edition Date:</span>
                  <span className="font-bold text-emerald-950">{liveParsed.date}</span>
                </div>

                <div className="flex items-center space-x-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                  <span className="font-bold text-amber-700">Layout:</span>
                  <span className="font-extrabold text-amber-950">{liveParsed.slots} Slots</span>
                  {liveParsed.isLongForm && (
                    <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 bg-amber-600 text-white rounded">
                      Long-form Feature Editorial (800+ words)
                    </span>
                  )}
                </div>
              </div>

              {/* QUICK CLICK INSPIRATION CHIPS */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">
                  Quick Suggestions (Click to test):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_PROMPTS.map((sample, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setUserPrompt(sample)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* LOADING STATE ANIMATION */}
          {isLoading && (
            <div className="py-12 px-6 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-red-600 animate-spin" />
                <Sparkles className="w-6 h-6 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-base text-slate-900 font-serif">
                  {loadingStep === 1 && `Connecting to verified real-time news sources for ${liveParsed.date}...`}
                  {loadingStep === 2 && `Fact-checking and verifying headlines for "${liveParsed.topic}"...`}
                  {loadingStep === 3 && `Calculating broadsheet column geometry & word limits for ${liveParsed.slots} slots...`}
                  {loadingStep >= 4 && 'Typesetting newspaper broadsheet page...'}
                </h3>
                <p className="text-xs text-slate-500">
                  Live News Wires + Multi-Source Editorial Desk (Edition Date: {liveParsed.date})
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                {[1, 2, 3].map(step => (
                  <div
                    key={step}
                    className={`h-2 rounded-full transition-all ${
                      loadingStep >= step
                        ? 'w-8 bg-red-600'
                        : 'w-2 bg-slate-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ERROR ALERT WITH EXPLICIT RETRY BUTTON */}
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-rose-900">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
                <div className="text-xs">
                  <div className="font-bold text-rose-950">Generation Notice</div>
                  <div className="text-rose-700 mt-0.5">{errorMsg}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
                className="self-end sm:self-center px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shrink-0 flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* GENERATED PREVIEW & APPLY SECTION */}
          {generatedData && !isLoading && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-emerald-950 font-sans">
                      Ready: "{generatedData.topic}" ({generatedData.slots.length} Slots Prepared)
                    </h4>
                    <p className="text-xs text-emerald-700">
                      Edition Date: <b>{generatedData.date}</b> • Engine: {generatedData.generatedWith}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setGeneratedData(null)}
                    className="px-3 py-1.5 text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs flex items-center space-x-1.5 cursor-pointer"
                    title="Change prompt and regenerate"
                  >
                    <span>✏️ Change Prompt</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="px-3 py-1.5 text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs flex items-center space-x-1.5 cursor-pointer"
                    title="Regenerate with current prompt"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerate</span>
                  </button>
                </div>
              </div>

              {/* PREVIEW OF SLOTS */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Prepared Slots Preview ({generatedData.slots.length} Slots • {generatedData.date})
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Canvas: 1344px × 2112px
                  </span>
                </div>

                <div className="p-3 max-h-72 overflow-y-auto space-y-2">
                  {generatedData.slots.map((slot, i) => (
                    <div
                      key={slot.id}
                      className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs flex items-start justify-between space-x-3 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 shrink-0">
                              {slot.categoryBadge || 'News'}
                            </span>
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {slot.headline}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {slot.subHeadline}
                          </p>
                        </div>
                      </div>

                      <div className="text-right text-[11px] text-slate-500 font-mono shrink-0">
                        <div>{slot.width}×{slot.height}px</div>
                        <div className="text-slate-400">{slot.columnsCount} Col{slot.columnsCount && slot.columnsCount > 1 ? 's' : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* APPLY MODE RADIO */}
              <div className="p-3.5 bg-slate-100 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Apply to Newspaper Page:</span>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-1.5 text-xs text-slate-800 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="applyMode"
                      value="replace"
                      checked={applyMode === 'replace'}
                      onChange={() => setApplyMode('replace')}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span>Replace all slots (Recommended)</span>
                  </label>
                  <label className="flex items-center space-x-1.5 text-xs text-slate-800 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="applyMode"
                      value="append"
                      checked={applyMode === 'append'}
                      onChange={() => setApplyMode('append')}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span>Append to existing slots</span>
                  </label>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <b>Full Editorial Control:</b> Once applied, you can freely move, resize, edit headlines, photos, and body copy on the broadsheet canvas.
                </span>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {!generatedData ? (
            <button
              type="button"
              disabled={isLoading || !userPrompt.trim()}
              onClick={handleGenerate}
              className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 shadow-lg shadow-red-600/30 flex items-center space-x-2 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>
                {isLoading
                  ? 'Generating Page...'
                  : userPrompt.trim()
                    ? `⚡ Generate ${liveParsed.slots}-Slot Broadsheet Page (${liveParsed.date})`
                    : '⚡ Enter Instructions & Generate Page'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleApply}
              className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply to Newspaper Canvas</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
