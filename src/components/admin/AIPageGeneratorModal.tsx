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
  'पटना और बिहार के प्रमुख प्रशासनिक व विकास कार्य 4 slots',
  'आज की राष्ट्रीय राजनीति और संसद की बड़ी खबरें 5 slots',
  'क्रीड़ा जगत: राष्ट्रीय व अंतरराष्ट्रीय खेल समाचार 4 slots',
  'अर्थव्यवस्था, शेयर बाजार और व्यापार जगत की हलचल 4 slots',
  'विश्व पटल की प्रमुख कूटनीतिक और वैश्विक हलचल 5 slots'
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
  // Start with clean empty input - NEVER pre-fill hardcoded cricket prompt
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
                      text.match(/(?:^|\s)(\d{1,2})\s*(?:news|खबरें|कहानियां)/i) ||
                      text.match(/\btop\s*(\d{1,2})\b/i);
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
      .replace(/\b(?:with|for|in|me|mein|pe|par|ke liye)\s*(?=\d{1,2}\s*(?:slots?|स्लॉट्स?|स्लॉट|news|खबरें|कहानियां)\b)/gi, '')
      .replace(/\b\d{1,2}\s*(?:slots?|स्लॉट्स?|स्लॉट|news|खबरें|कहानियां)\b/gi, '')
      .replace(/\btop\s*\d{1,2}\b/gi, '')
      .replace(/(?:se related|se judi|se jurhi|se sambandhit)/gi, '')
      .replace(/(?:iss page me|page me|page par|page pe)/gi, '')
      .replace(/\b(?:k\s+jo\s+sabse|jo\s+sabse|sabse\s+top|wo\s+bas|\bwo\b|\bbas\b|\bsirf\b)\b/gi, '')
      .replace(/(?:add karo|add kro|kro|bhai|samjhe|bana do|banao|lagao|dalo|likho|chahiye|set karo|karo)/gi, '')
      .replace(/(?:aaj ki|aaj ke|aaj ka|today|kal ki|yesterday)/gi, '')
      .replace(/\b(20\d\d)[-\/](0?[1-9]|1[0-2])[-\/](0?[1-9]|[12]\d|3[01])\b/gi, '')
      .replace(/(?:bada lekh|in depth|vishesh|deep)/gi, '')
      .replace(/\b(?:me|pe|par|ki|ka|ke|ko|aur|ya|and|or|with|for|hai|h|hain)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    clean = clean.replace(/\b(?:with|for|me|mein|pe|par|ke liye)\s*$/gi, '').trim();

    let displayTopic = clean || text || 'आज की प्रमुख खबरें';
    if (/^(?:top\s*)?breaking\s*news(?:\s*in\s*india)?$/i.test(clean)) {
      displayTopic = 'भारत की टॉप ब्रेकिंग न्यूज़';
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

  // Explicit Generation trigger ONLY upon explicit button click
  const handleGenerate = async () => {
    if (!userPrompt.trim()) {
      setErrorMsg('कृपया कोई विषय या निर्देश दर्ज करें (उदा. "पटना की आज की खबरें 4 slots")');
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
        editionCity: editionCity || 'पटना',
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
        throw new Error('सर्वर से स्लॉट्स डेटा प्राप्त नहीं हुआ। कृपया पुनः प्रयास करें।');
      }
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setErrorMsg(err.message || 'पेज जनरेट करने में त्रुटि आई। कृपया पुनः प्रयास करें।');
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
                  <span>लाइव संस्करण</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans mt-0.5 flex items-center space-x-2">
                <span>पेज {pageNumber} ({editionCity} संस्करण)</span>
                <span>•</span>
                <span className="text-amber-300 font-semibold flex items-center space-x-1">
                  <Calendar className="w-3 h-3 inline" />
                  <span>संस्करण दिनांक: {liveParsed.date}</span>
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

        {/* API KEY SETTINGS POPOVER (IF TOGGLED) */}
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
              डिफ़ॉल्ट रूप से सर्वर में एक्टिव AI इंजन का उपयोग होगा।
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
                  <span>पेज निर्देश दर्ज करें (Topic, Slots, Date):</span>
                </label>
                <div className="flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[11px] font-bold">दिनांक:</span>
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
                  placeholder="उदा: पटना और बिहार के विकास कार्य 4 slots&#10;या: आज की राष्ट्रीय राजनीति और संसद सत्र 5 slots&#10;या: क्रीड़ा जगत के मुख्य मुकाबले 4 slots... (अपनी भाषा में लिखें)"
                  className="w-full text-sm font-sans text-slate-900 bg-slate-50 border-2 border-slate-300 focus:border-red-600 focus:bg-white rounded-xl p-3.5 focus:outline-none transition-all shadow-inner leading-relaxed resize-none"
                />
              </div>

              {/* LIVE INTEL BADGES */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="flex items-center space-x-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
                  <span className="font-bold text-blue-700">विषय (Topic):</span>
                  <span className="font-semibold text-blue-950">
                    "{liveParsed.hasPrompt ? liveParsed.topic : 'निर्देश लिखें...'}"
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="font-bold text-emerald-700">संस्करण दिनांक:</span>
                  <span className="font-bold text-emerald-950">{liveParsed.date}</span>
                </div>

                <div className="flex items-center space-x-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                  <span className="font-bold text-amber-700">स्लॉट विभाजन:</span>
                  <span className="font-extrabold text-amber-950">{liveParsed.slots} स्लॉट्स</span>
                  {liveParsed.isLongForm && (
                    <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 bg-amber-600 text-white rounded">
                      विस्तृत लीड संपादकीय (800+ शब्द)
                    </span>
                  )}
                </div>
              </div>

              {/* QUICK CLICK INSPIRATION CHIPS */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">
                  त्वरित सुझाव (क्लिक करके चुनें):
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
                  {loadingStep === 1 && `दिनांक ${liveParsed.date} के प्रामाणिक समाचार स्रोतों से कनेक्ट हो रहे हैं...`}
                  {loadingStep === 2 && `"${liveParsed.topic}" के प्रमुख तथ्यों का संपादकीय सत्यापन...`}
                  {loadingStep === 3 && `${liveParsed.slots} स्लॉट्स के लिए ब्रॉडशीट कॉलम ज्यामिति व शब्द-सीमा तय हो रही है...`}
                  {loadingStep >= 4 && 'अखबार लेआउट पूर्ण हो रहा है...'}
                </h3>
                <p className="text-xs text-slate-500">
                  Live News Wires + Multi-Source Editorial Desk (संस्करण दिनांक: {liveParsed.date})
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
                  <div className="font-bold text-rose-950">जनरेशन में समस्या आई (Generation Notice)</div>
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
                <span>पुनः प्रयास करें (Retry)</span>
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
                      🎉 "{generatedData.topic}" के {generatedData.slots.length} स्लॉट्स सफलतापूर्वक तैयार!
                    </h4>
                    <p className="text-xs text-emerald-700">
                      संस्करण: <b>{generatedData.formattedDateHindi || generatedData.date}</b> • इंजन: {generatedData.generatedWith}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setGeneratedData(null)}
                    className="px-3 py-1.5 text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs flex items-center space-x-1.5 cursor-pointer"
                    title="प्रॉम्प्ट में बदलाव करें"
                  >
                    <span>✏️ प्रॉम्प्ट बदलें</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="px-3 py-1.5 text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs flex items-center space-x-1.5 cursor-pointer"
                    title="इसी प्रॉम्प्ट से पुनः जनरेट करें"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>पुनः जनरेट करें</span>
                  </button>
                </div>
              </div>

              {/* PREVIEW OF SLOTS */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    तैयार स्लॉट्स का पूर्वावलोकन ({generatedData.slots.length} स्लॉट्स • {generatedData.date})
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    कैन्वस: 1344px × 2112px
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
                              {slot.categoryBadge || 'समाचार'}
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
                        <div className="text-slate-400">{slot.columnsCount} कॉलम</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* APPLY MODE RADIO */}
              <div className="p-3.5 bg-slate-100 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">पेज पर लागू करने का तरीका:</span>
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
                    <span>पेज के सभी स्लॉट रिप्लेस करें (अनुशंसित)</span>
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
                    <span>मौजूदा स्लॉट्स के साथ जोड़ें</span>
                  </label>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <b>पूर्ण संपादकीय नियंत्रण:</b> कैन्वस पर आने के बाद आप किसी भी स्लॉट को ड्रैग (Move), रीसाइज, अथवा टेक्स्ट और फोटो को कभी भी स्वतंत्र रूप से संपादित कर सकते हैं।
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
            रद्द करें (Cancel)
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
                  ? 'पेज तैयार हो रहा है (Generating...)'
                  : userPrompt.trim()
                    ? `⚡ "${liveParsed.topic}" का ${liveParsed.slots} स्लॉट पेज बनाएँ (${liveParsed.date})`
                    : '⚡ निर्देश दर्ज करें और पेज बनाएँ (Generate Page)'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleApply}
              className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>अखबार कैन्वस पर लागू करें (Apply to Page)</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
