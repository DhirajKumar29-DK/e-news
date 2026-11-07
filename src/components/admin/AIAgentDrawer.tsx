'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Send, X, AlertCircle, CheckCircle2, RotateCcw,
  Copy, Check, Loader2, ArrowRight, FileText, Download,
  ExternalLink, ChevronRight, Settings
} from 'lucide-react';
import { callAIAgent } from '@/services/epaperService';
import { getEditorialStoryImage } from '@/utils/editorialPhotos';

// Clean dateline brackets like 【पटना • 29 अक्टूबर 2026】 :
export function cleanDatelineBrackets(str: string): string {
  if (!str) return '';
  return str
    .replace(/<[^>]+>/g, ' ')
    .replace(/^[【\[][^】\]]*[】\]]\s*:?\s*/gi, '')
    .replace(/【[^】]*】\s*:?\s*/gi, '')
    .replace(/\[[^\]]*\]\s*:?\s*/gi, '')
    .replace(/^[\u0900-\u097F\w\s]{2,15}\s*•\s*[\d\u0900-\u097F\w\s]{4,30}\s*[:\-]\s*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Strip markdown characters (*, **, #, ###, _, etc.) and review headings
export function stripMarkdown(str: string): string {
  if (!str) return '';
  return str
    .replace(/^[\s#*_\-]+/gm, '')
    .replace(/[*_#\`]/g, '')
    .replace(/\b(?:संपादकीय समीक्षा|तथ्य जांच|Fact-Check|Editorial Review)[^\n]*\n*/gi, '')
    .replace(/###?\s*(?:संशोधित|अंतिम|प्रकाशन|Revised)[^\n]*\n*/gi, '')
    .trim();
}

// Strip HTML tags to clean plain text
export function stripHtmlTags(str: string): string {
  if (!str) return '';
  return str
    .replace(/<\/?p[^>]*>/gi, '\n\n')
    .replace(/&lt;\/?p[^&]*&gt;/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&lt;br\s*\/?&gt;/gi, '\n')
    .replace(/<\/?mark[^>]*>/gi, '')
    .replace(/&lt;\/?mark[^&]*&gt;/gi, '')
    .replace(/<\/?b>/gi, '')
    .replace(/&lt;\/?b&gt;/gi, '')
    .replace(/<\/?strong>/gi, '')
    .replace(/&lt;\/?strong&gt;/gi, '')
    .replace(/<\/?span[^>]*>/gi, '')
    .replace(/&lt;\/?span[^&]*&gt;/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;[^&]*&gt;/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean)
    .join('\n\n')
    .trim();
}

export function parseEditorialNewsResponse(rawText: string, activeSlot: any = null): { reviewCritique: string; parsedNews: ParsedNewsPayload | null } {
  if (!rawText) return { reviewCritique: '', parsedNews: null };

  let critique = '';
  let newsSection = rawText;

  const hasReviewCritique = /(?:तथ्य एवं भाषा समीक्षा|संपादकीय समीक्षा|Fact-?Check|Review|समीक्षा)/i.test(rawText);
  if (hasReviewCritique) {
    const splitMatch = rawText.match(/(?:###?\s*(?:संशोधित|अंतिम|प्रकाशन|Revised)[\s\S]*?(?:\n|$)|(?:\*{0,3}शीर्षक[\s\S]*?\*{0,3}\s*[:：\-]))/i);
    if (splitMatch && typeof splitMatch.index === 'number' && splitMatch.index > 0) {
      const splitIdx = splitMatch.index;
      critique = rawText.substring(0, splitIdx).trim();
      newsSection = rawText.substring(splitIdx).trim();
    }
  }

  newsSection = newsSection.replace(/^###?\s*(?:संशोधित|अंतिम|प्रकाशन|Revised)[^\n]*\n+/i, '').trim();

  let headline = '';
  let subHeadline = '';
  let content = '';

  const sections = newsSection.split(/\n+(?=\*{0,3}(?:शीर्षक|उप-?शीर्षक|सामग्री|विवरण|Headline|Sub-?headline|Body|Content)\*{0,3}[:：\-])/i);

  for (const sec of sections) {
    const trimmed = sec.trim();
    if (/^\*{0,3}(?:शीर्षक|Headline)\*{0,3}[:：\-]/i.test(trimmed)) {
      headline = cleanDatelineBrackets(stripMarkdown(trimmed.replace(/^\*{0,3}(?:शीर्षक|Headline)\*{0,3}[:：\-]?/i, '')));
    } else if (/^\*{0,3}(?:उप-?शीर्षक|Sub-?headline)\*{0,3}[:：\-]/i.test(trimmed)) {
      subHeadline = cleanDatelineBrackets(stripMarkdown(trimmed.replace(/^\*{0,3}(?:उप-?शीर्षक|Sub-?headline)\*{0,3}[:：\-]?/i, '')));
    } else if (/^\*{0,3}(?:सामग्री|विवरण|Body|Content)\*{0,3}[:：\-]/i.test(trimmed)) {
      content = cleanDatelineBrackets(stripMarkdown(stripHtmlTags(trimmed.replace(/^\*{0,3}(?:सामग्री|विवरण|Body|Content)\*{0,3}[:：\-]?/i, ''))));
    } else if (!headline && trimmed.length > 0 && trimmed.length < 150) {
      headline = cleanDatelineBrackets(stripMarkdown(trimmed));
    } else if (headline && !content) {
      content = cleanDatelineBrackets(stripMarkdown(stripHtmlTags(trimmed)));
    }
  }

  if (!headline && !content) {
    return { reviewCritique: critique || rawText, parsedNews: null };
  }

  const category = activeSlot?.categoryBadge || 'संपादित';
  const resolvedImg = getEditorialStoryImage({
    topic: category,
    headline: headline || activeSlot?.headline || '',
    category,
    rawImageUrl: activeSlot?.imageUrl || ''
  });

  return {
    reviewCritique: critique,
    parsedNews: {
      actionType: 'UPDATE_SLOT',
      categoryBadge: category,
      headline: headline || activeSlot?.headline || '',
      subHeadline: subHeadline || activeSlot?.subHeadline || '',
      content: content || activeSlot?.summary || '',
      imageUrl: resolvedImg,
      imageAlignment: activeSlot?.imageAlignment || 'Right',
      imageVertAlign: activeSlot?.imageVertAlign || 'top',
      imageWidth: activeSlot?.imageWidth || 180,
      imageHeight: activeSlot?.imageHeight || 140,
      columnsCount: activeSlot?.columnsCount || 2
    }
  };
}

export interface ParsedNewsPayload {
  actionType?: 'UPDATE_SLOT' | 'CREATE_NEW_SLOT';
  categoryBadge?: string;
  headline?: string;
  subHeadline?: string;
  content?: string;
  imageUrl?: string;
  imageAlignment?: 'Left' | 'Center' | 'Right';
  imageVertAlign?: 'top' | 'middle' | 'bottom';
  imageWidth?: number;
  imageHeight?: number;
  imageWrapMode?: 'auto' | 'top-span';
  columnsCount?: number;
  recommendedHeight?: number | null;
  language?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  parsedNews?: ParsedNewsPayload | null;
  timestamp: string;
}

interface AIAgentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeSlot: any | null;
  onApplyToSlot: (news: ParsedNewsPayload) => void;
  date?: string;
  editionCity?: string;
}

export const AIAgentDrawer: React.FC<AIAgentDrawerProps> = ({
  isOpen,
  onClose,
  activeSlot,
  onApplyToSlot,
  date,
  editionCity
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [appliedToast, setAppliedToast] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Restore API key from localStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('gemini_api_key') || '';
      if (storedKey) {
        setApiKey(storedKey);
      }
    }
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);



  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || prompt).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!customText) setPrompt('');
    setIsLoading(true);

    try {
      // Pass previous history for context
      const historyPayload = messages.slice(-6).map(m => ({
        sender: m.sender,
        text: m.text
      }));

      // Detect if user asked for full slot width photo / top banner / columns below
      const isTopSpanRequested = /barabar|slot.*width|width.*slot|full.*width|banner|top-span|photo.*upar|upar.*photo|niche.*(?:column|कॉलम)|image.*barabar|photo.*barabar/i.test(textToSend);
      const colRequestedMatch = textToSend.match(/([1-4])\s*(?:कॉलम|column)/i);
      const requestedCols = colRequestedMatch ? parseInt(colRequestedMatch[1], 10) : (activeSlot?.columnsCount && activeSlot.columnsCount > 1 ? activeSlot.columnsCount : 2);

      // Detect specific scope requested by user to prevent overwriting unrelated slot fields
      const isHeadlineOnly = /(?:heading|title|शीर्षक|हेडिंग)\b/i.test(textToSend) && !/(?:content|body|image|photo|full|puri news|complete|sab|sare|sabkuch)/i.test(textToSend);
      const isSubHeadlineOnly = /(?:subheading|sub-heading|उपशीर्षक|सबहेडिंग)\b/i.test(textToSend) && !/(?:content|body|image|photo|full|puri news|complete|sab|sare|sabkuch)/i.test(textToSend);
      const isContentOnly = /(?:content|body|text|vivaran|विवरण|katha)\b/i.test(textToSend) && !/(?:heading|title|image|photo|full|puri news|complete|sab|sare|sabkuch)/i.test(textToSend);
      const isImageOnly = /(?:image|photo|pic|tasveer|तस्वीर|चित्र)\b/i.test(textToSend) && !/(?:heading|title|content|body|text|news|article)/i.test(textToSend);
      const isProofreadOnly = /(?:gltiya|mistakes|dikkat|error|galat|galti|check|proofread|review|वर्तनी|व्याकरण)\b/i.test(textToSend) && !/(?:thik|fix|apply|change|rewrite|banao|likho)/i.test(textToSend);

      let effectivePrompt = textToSend;
      if (isProofreadOnly) {
        effectivePrompt += `\n[EDITORIAL DIRECTIVE: The user wants to check/correct errors in the news. Briefly explain the corrections in your chat reply AND ALWAYS provide the 100% corrected, polished, ready-to-publish news story inside the JSON block with "hasNewsContent": true so the user can click "Apply to Slot" to update their slot!]`;
      } else if (isHeadlineOnly) {
        effectivePrompt += `\n[STRICT SCOPE DIRECTIVE: The user ONLY asked to write/check the HEADLINE. Return ONLY "headline" in the JSON block with "hasNewsContent": true. Leave subHeadline, content, and imageUrl empty/null so other slot fields are preserved!]`;
      } else if (isSubHeadlineOnly) {
        effectivePrompt += `\n[STRICT SCOPE DIRECTIVE: The user ONLY asked to write/check the SUBHEADLINE. Return ONLY "subHeadline" in the JSON block with "hasNewsContent": true. Leave headline, content, and imageUrl empty/null so other slot fields are preserved!]`;
      } else if (isContentOnly) {
        effectivePrompt += `\n[STRICT SCOPE DIRECTIVE: The user ONLY asked to write/check the BODY CONTENT. Return ONLY "content" in the JSON block with "hasNewsContent": true. Leave headline, subHeadline, and imageUrl empty/null so other slot fields are preserved!]`;
      } else if (isImageOnly) {
        effectivePrompt += `\n[STRICT SCOPE DIRECTIVE: The user ONLY asked for an IMAGE. Return ONLY "imageUrl" (and image parameters) in the JSON block with "hasNewsContent": true. Leave headline, subHeadline, and content empty/null so text fields are preserved!]`;
      }

      if (isTopSpanRequested) {
        const slotW = activeSlot?.width ? activeSlot.width - 24 : 600;
        effectivePrompt += `\n[LAYOUT DIRECTIVE: The user explicitly requires a Top Banner Photo spanning the FULL WIDTH of the slot (imageWrapMode: 'top-span', imageWidth: ${slotW}, imageAlignment: 'Center', imageVertAlign: 'top'). Below this photo, format the content into ${requestedCols} columns. Set "imageWrapMode": "top-span", "columnsCount": ${requestedCols}, "imageAlignment": "Center", "imageVertAlign": "top", "imageWidth": ${slotW}.]`;
      }

      // Detect word count directive (e.g., 1000 words, 1200 shabd, etc.)
      const wordMatch = textToSend.match(/(\d{3,4})\s*(?:words?|शब्द|shabd|शब्‍द|varn)/i);
      let targetWordCount = 0;
      if (wordMatch) {
        targetWordCount = parseInt(wordMatch[1], 10);
      } else {
        const numMatch = textToSend.match(/\b(1500|1400|1200|1000|800|700|600|500)\b/);
        if (numMatch && /(?:words?|शब्द|shabd|likho|likh|bana|article|news|kahani|report|vishesh|bada)/i.test(textToSend)) {
          targetWordCount = parseInt(numMatch[1], 10);
        }
      }

      if (targetWordCount >= 300) {
        effectivePrompt += `\n[MANDATORY WORD COUNT DIRECTIVE: The user explicitly requires a comprehensive, detailed story of at least ${targetWordCount} words. You MUST write a full-length, in-depth broadsheet journalistic article with at least ${targetWordCount} words across multiple rich paragraphs (<p>), deep analysis, and quotes. Do NOT summarize or shorten! In the JSON block, set "columnsCount": ${targetWordCount >= 800 ? 3 : 2} and "recommendedHeight": ${Math.min(2200, Math.round(targetWordCount * 1.1 + 320))}. Put the entire detailed article in the JSON content field.]`;
      }

      const aiResponse = await callAIAgent({
        prompt: effectivePrompt,
        activeSlot: activeSlot ? {
          id: activeSlot.id,
          slotNumber: activeSlot.slotNumber,
          headline: activeSlot.headline,
          subHeadline: activeSlot.subHeadline,
          summary: activeSlot.summary,
          columnsCount: activeSlot.columnsCount || 1,
          width: activeSlot.width,
          height: activeSlot.height
        } : null,
        history: historyPayload,
        apiKey: apiKey || undefined,
        targetDate: date,
        editionCity: editionCity
      });

      if (!aiResponse) {
        throw new Error('AI सर्वर से प्रतिक्रिया प्राप्त नहीं हुई। कृपया पुनः प्रयास करें।');
      }

      let resolvedNews = aiResponse.parsedNews || null;
      let replyText = aiResponse.reply || aiResponse.fullText || 'Response generated.';

      // If backend did not parse structured news or if JSON was absent, parse from text
      if (!resolvedNews) {
        const parsedFromText = parseEditorialNewsResponse(replyText, activeSlot);
        if (parsedFromText.parsedNews) {
          resolvedNews = parsedFromText.parsedNews;
          if (parsedFromText.reviewCritique) {
            replyText = parsedFromText.reviewCritique;
          }
        }
      }

      // Always sanitize resolvedNews
      if (resolvedNews) {
        resolvedNews.actionType = 'UPDATE_SLOT';
        resolvedNews.headline = cleanDatelineBrackets(stripMarkdown(resolvedNews.headline || ''));
        resolvedNews.subHeadline = cleanDatelineBrackets(stripMarkdown(resolvedNews.subHeadline || ''));
        resolvedNews.content = cleanDatelineBrackets(stripMarkdown(stripHtmlTags(resolvedNews.content || '')));
        resolvedNews.imageUrl = getEditorialStoryImage({
          topic: resolvedNews.categoryBadge,
          headline: resolvedNews.headline,
          rawImageUrl: resolvedNews.imageUrl
        });

        if (isTopSpanRequested) {
          resolvedNews.imageWrapMode = 'top-span';
          resolvedNews.imageAlignment = 'Center';
          resolvedNews.imageVertAlign = 'top';
          resolvedNews.columnsCount = requestedCols;
          if (activeSlot?.width) {
            resolvedNews.imageWidth = Math.max(100, activeSlot.width - 24);
          }
        }

        // Dynamically calibrate recommendedHeight based on actual generated content
        const rawContent = (resolvedNews.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const wordCount = rawContent.split(/\s+/).filter(Boolean).length;
        if (wordCount > 250) {
          const minEstH = Math.min(2200, Math.round(wordCount * 1.05 + 320));
          resolvedNews.recommendedHeight = Math.max(resolvedNews.recommendedHeight || 0, minEstH);
        } else if (wordCount > 0 && wordCount < 180) {
          resolvedNews.recommendedHeight = Math.min(resolvedNews.recommendedHeight || 300, 320);
        }
      }

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        parsedNews: resolvedNews,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `⚠️ **त्रुटि (Error):** ${err.message || 'AI सर्वर से संपर्क नहीं हो सका।'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLoadCurrentSlotText = () => {
    if (!activeSlot) return;
    const cleanHeadline = (activeSlot.headline || '').replace(/<[^>]*>/g, '');
    const cleanSub = (activeSlot.subHeadline || '').replace(/<[^>]*>/g, '');
    const cleanContent = (activeSlot.summary || '').replace(/<[^>]*>/g, '');

    const loadedPrompt = `कृपया Slot #${activeSlot.slotNumber} के इस समाचार की वर्तनी, व्याकरण और तथ्य जांचें:\n\nशीर्षक: ${cleanHeadline}\nउप-शीर्षक: ${cleanSub}\nसामग्री: ${cleanContent}`;
    setPrompt(loadedPrompt);
    textareaRef.current?.focus();
  };

  const handleApplyNews = (news: ParsedNewsPayload) => {
    onApplyToSlot(news);
    setAppliedToast(true);
    setTimeout(() => setAppliedToast(false), 2500);
  };

  const handleApplyRawTextToSlot = (rawText: string) => {
    if (!rawText || !activeSlot) return;
    const { parsedNews } = parseEditorialNewsResponse(rawText, activeSlot);
    if (parsedNews) {
      handleApplyNews(parsedNews);
    } else {
      const cleanContent = cleanDatelineBrackets(stripMarkdown(stripHtmlTags(rawText)));
      handleApplyNews({
        actionType: 'UPDATE_SLOT',
        headline: activeSlot.headline || '',
        subHeadline: activeSlot.subHeadline || '',
        content: cleanContent,
        categoryBadge: activeSlot.categoryBadge || 'संपादित'
      });
    }
  };

  const handleCopyText = (id: string, text: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Semi-transparent Backdrop for mobile/smaller screens */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-50 md:hidden"
      />

      {/* RIGHT SLIDE-OUT DRAWER (Same width as right panel: w-80 / 320px) */}
      <aside
        className="fixed top-0 right-0 bottom-0 w-full sm:w-80 md:w-80 bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col font-sans select-none animate-in slide-in-from-right duration-250 ease-out"
      >
        {/* 1. DRAWER TOP HEADER */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-md shadow-red-600/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  AI Editor
                </h3>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[9.5px] font-bold border border-emerald-300">
                  AI Assistant
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Bilingual Newsroom Editor & Fact-Checker
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <a
              href="/admin/ai-settings"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
              title="Configure AI Models & Keys"
            >
              <Settings className="w-4 h-4 text-slate-600 hover:text-red-600" />
            </a>
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to clear chat history?')) {
                  setMessages([]);
                }
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors cursor-pointer"
              title="Reset Chat"
            >
              <RotateCcw className="w-4 h-4 text-slate-600" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer ml-1"
              title="Close Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. ACTIVE SLOT TARGET BAR */}
        <div className={`px-3.5 py-2 border-b text-xs shrink-0 transition-colors ${
          activeSlot ? 'bg-red-50/70 border-red-200/80' : 'bg-amber-50 border-amber-200'
        }`}>
          {activeSlot ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full shrink-0 bg-red-600 animate-pulse"></span>
                  <span className="font-bold text-red-800 text-xs truncate">
                    Active: Slot #{activeSlot.slotNumber}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleLoadCurrentSlotText}
                  className="text-[10.5px] font-bold text-red-700 hover:text-red-900 bg-white hover:bg-red-100/70 px-2 py-0.5 rounded-lg border border-red-300 shadow-xs flex items-center space-x-1 transition-all cursor-pointer shrink-0"
                  title="Load current slot text into chat"
                >
                  <FileText className="w-3 h-3 text-red-600 shrink-0" />
                  <span>Load Content</span>
                </button>
              </div>

              <div className="text-[10px] text-slate-500 font-mono pl-3.5 flex items-center space-x-1.5">
                <span>{activeSlot.width}×{activeSlot.height}px</span>
                <span>•</span>
                <span>{activeSlot.columnsCount || 1} {activeSlot.columnsCount === 1 ? 'Col' : 'Cols'}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 text-amber-800 font-medium text-[11px]">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
              <span className="truncate">⚠️ No slot selected (Select a slot on canvas)</span>
            </div>
          )}
        </div>

        {/* SUCCESS TOAST ALERT */}
        {appliedToast && (
          <div className="mx-4 mt-2 p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl flex items-center space-x-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>News successfully applied to slot!</span>
          </div>
        )}

        {/* 3. SCROLLABLE CHAT MESSAGES FEED */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#fbfcfd] select-text">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2 select-none">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">
                Hi! I am your AI Agent
              </p>
              <p className="text-xs text-slate-500">
                How may I help you today?
              </p>
            </div>
          )}
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
              >
                {/* Sender badge & timestamp */}
                <div className="flex items-center space-x-1.5 text-[10px] text-slate-600 px-1">
                  <span className="font-bold">
                    {isUser ? 'You (Editor)' : '🤖 AI'}
                  </span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Message Bubble Card */}
                <div
                  className={`max-w-[90%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-red-50 text-slate-900 border border-red-200 font-medium rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs space-y-2.5'
                  }`}
                >
                  {/* Clean text representation with basic markdown rendering */}
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.text}
                  </div>

                  {/* STRUCTURED NEWS PREVIEW CARD (When AI generates or edits news) */}
                  {msg.parsedNews && (
                    <div className="mt-3 p-3.5 bg-amber-50/70 rounded-2xl border border-amber-300/80 space-y-2.5 shadow-xs">
                      {/* Card Header & Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-amber-200/80 pb-2">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-black uppercase text-amber-950 flex items-center space-x-1">
                            <FileText className="w-3.5 h-3.5 text-amber-700" />
                            <span>
                              {activeSlot ? `Ready for Slot #${activeSlot.slotNumber}` : 'Slot Content Ready'}
                            </span>
                          </span>
                          {msg.parsedNews.categoryBadge && (
                            <span className="text-[9px] font-black uppercase bg-red-600 text-white px-2 py-0.5 rounded shadow-2xs">
                              {msg.parsedNews.categoryBadge}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-1 text-[9.5px] font-mono font-bold text-amber-900">
                          {msg.parsedNews.columnsCount && (
                            <span className="bg-amber-200/90 px-1.5 py-0.5 rounded border border-amber-300/60">
                              {msg.parsedNews.columnsCount} Col
                            </span>
                          )}
                          <span className="bg-amber-200/90 px-1.5 py-0.5 rounded border border-amber-300/60">
                            {msg.parsedNews.language === 'en' ? 'EN' : 'HI'}
                          </span>
                        </div>
                      </div>

                      {/* Photo Thumbnail Preview (If Generated) */}
                      {msg.parsedNews.imageUrl && (
                        <div className="relative rounded-xl overflow-hidden border border-amber-300/80 bg-slate-900 max-h-36 group/aiimg">
                          <img
                            src={msg.parsedNews.imageUrl}
                            alt="AI Generated Story Photo"
                            className="w-full h-36 object-cover block"
                            onError={(e) => {
                              // Hide broken image preview
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div className="absolute top-1.5 left-1.5 bg-black/75 backdrop-blur-xs text-amber-300 text-[8px] font-mono font-bold px-2 py-0.5 rounded shadow">
                            AI Photo • {msg.parsedNews.imageAlignment || 'Right'}
                          </div>
                        </div>
                      )}

                      {/* Headline */}
                      {msg.parsedNews.headline && (
                        <div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase block">Headline:</span>
                          <h4 className="text-sm font-black text-slate-950 font-serif leading-snug">
                            {msg.parsedNews.headline}
                          </h4>
                        </div>
                      )}

                      {/* Sub-headline */}
                      {msg.parsedNews.subHeadline && (
                        <div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase block">Sub-Headline:</span>
                          <p className="text-xs font-bold text-red-700 font-serif leading-tight">
                            {msg.parsedNews.subHeadline}
                          </p>
                        </div>
                      )}

                      {/* Content summary with bold & highlights */}
                      {msg.parsedNews.content && (
                        <div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase block">Story Body:</span>
                          <div
                            className="text-[11px] text-slate-800 font-serif line-clamp-5 leading-normal bg-white/80 p-2.5 rounded-xl border border-amber-200/60"
                            dangerouslySetInnerHTML={{ __html: msg.parsedNews.content }}
                          />
                        </div>
                      )}

                      {/* Action Buttons: 1-Click Apply to Selected Slot */}
                      <div className="pt-1.5 flex items-center space-x-2">
                        <button
                          type="button"
                          disabled={!activeSlot}
                          onClick={() => handleApplyNews(msg.parsedNews!)}
                          className={`flex-1 py-2.5 px-3.5 ${
                            activeSlot
                              ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md shadow-red-600/20 cursor-pointer hover:scale-[1.01]'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                          } font-black text-xs rounded-xl flex items-center justify-center space-x-2 transition-all transform`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>
                            {activeSlot
                              ? `🚀 Apply to Slot #${activeSlot.slotNumber}`
                              : '⚠️ Select a slot on canvas first'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyText(msg.id, `${msg.parsedNews?.headline || ''}\n${msg.parsedNews?.subHeadline || ''}\n\n${msg.parsedNews?.content || ''}`)}
                          className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl cursor-pointer"
                          title="Copy Text"
                        >
                          {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-700" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Fallback Action Buttons for pure text AI responses (ALWAYS show Apply to Slot!) */}
                  {!isUser && !msg.parsedNews && msg.text && msg.text.trim().length > 15 && (
                    <div className="pt-2 flex items-center space-x-2 border-t border-slate-100">
                      <button
                        type="button"
                        disabled={!activeSlot}
                        onClick={() => handleApplyRawTextToSlot(msg.text)}
                        className={`flex-1 py-2.5 px-3.5 ${
                          activeSlot
                            ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md shadow-red-600/20 cursor-pointer hover:scale-[1.01]'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                        } font-black text-xs rounded-xl flex items-center justify-center space-x-2 transition-all transform`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>
                          {activeSlot
                            ? `🚀 Apply to Slot #${activeSlot.slotNumber}`
                            : '⚠️ Select a slot on canvas first'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl cursor-pointer"
                        title="Copy Text"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-700" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing / Loading Spinner */}
          {isLoading && (
            <div className="flex items-center space-x-2 text-xs text-slate-600 p-2 bg-white rounded-xl border border-slate-200 w-max shadow-xs">
              <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
              <span>AI is preparing news...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 4. BOTTOM INPUT BOX */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0 space-y-2">

          <div className="relative flex items-end bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-2.5 focus-within:border-red-500 focus-within:bg-white focus-within:ring-3 focus-within:ring-red-500/10 shadow-xs transition-all">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask AI Editor anything..."
              rows={2}
              className="w-full bg-transparent resize-none border-none outline-none focus:outline-none focus:ring-0 text-xs text-slate-800 placeholder:text-slate-400 leading-relaxed font-sans"
            />

            <button
              type="button"
              disabled={!prompt.trim() || isLoading}
              onClick={() => handleSendMessage()}
              className="ml-2 p-2 bg-red-600 hover:bg-red-500 disabled:bg-slate-300 text-white rounded-xl shadow-md transition-all cursor-pointer shrink-0 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
              title="Send (Enter)"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-600 px-1">
            <span>Shift + Enter for new line • Enter to send</span>
          </div>
        </div>
      </aside>
    </>
  );
};
