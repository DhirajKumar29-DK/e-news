'use client';

import React, { useState, useEffect, useRef } from 'react';
import { adService, AdvertisementData, AdSlotType } from '@/services/adService';
import { getFullMediaUrl } from '@/config/env';
import { Phone, MessageCircle, X, CheckCircle2, Send, Sparkles } from 'lucide-react';

interface AdSlotProps {
  slot: AdSlotType;
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ slot, className = '' }) => {
  const [ad, setAd] = useState<AdvertisementData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const scriptContainerRef = useRef<HTMLDivElement>(null);

  // Lead Form Inquiry Modal State (for readers on the public site)
  const [isLeadInquiryOpen, setIsLeadInquiryOpen] = useState(false);
  const [leadAnswers, setLeadAnswers] = useState<Record<string, string>>({});
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    adService.getPublicAd(slot)
      .then((data) => {
        if (isMounted) {
          setAd(data);
          setIsLoaded(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAd(null);
          setIsLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slot]);

  // Execute custom AdSense / script code safely in DOM
  useEffect(() => {
    if (!ad || ad.type !== 'SCRIPT' || !ad.scriptCode || !scriptContainerRef.current) return;

    const container = scriptContainerRef.current;
    container.innerHTML = '';

    const range = document.createRange();
    range.selectNode(container);
    const documentFragment = range.createContextualFragment(ad.scriptCode);
    container.appendChild(documentFragment);

    try {
      const w = window as any;
      if (w.adsbygoogle && Array.isArray(w.adsbygoogle)) {
        w.adsbygoogle.push({});
      }
    } catch {}
  }, [ad]);

  if (!isLoaded || !ad) {
    return null;
  }

  const handleAdClick = (e: React.MouseEvent) => {
    if (ad.id) {
      adService.recordClick(ad.id);
    }

    // If ad is configured with LEAD_FORM, intercept and open lead modal
    if (ad.actionType === 'LEAD_FORM') {
      e.preventDefault();
      setIsLeadInquiryOpen(true);
      setLeadSubmitted(false);
      setLeadError(null);
    }
  };

  // Parse lead form configuration if present
  let leadConfig: {
    questions: Array<{ id: string; label: string; type: string; required: boolean }>;
    afterSubmit: 'WHATSAPP' | 'THANK_YOU';
    whatsappNumber?: string;
  } | null = null;

  if (ad.leadFormConfig) {
    try {
      leadConfig = typeof ad.leadFormConfig === 'string' ? JSON.parse(ad.leadFormConfig) : ad.leadFormConfig;
    } catch {
      leadConfig = null;
    }
  }

  // Handle Reader Lead Form Submission
  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLeadError(null);

    const questions = leadConfig?.questions || [];
    for (const q of questions) {
      if (q.required && (!leadAnswers[q.id] || !leadAnswers[q.id].trim())) {
        setLeadError(`कृपया "${q.label}" का उत्तर भरें।`);
        return;
      }
    }

    if (leadConfig?.afterSubmit === 'WHATSAPP') {
      const waNum = (leadConfig.whatsappNumber || ad.advertiserPhone || '').replace(/\D/g, '');
      const answersText = questions
        .map(q => `• ${q.label}: ${leadAnswers[q.id] || 'N/A'}`)
        .join('\n');
      
      const message = `नमस्ते! मैंने e-News पर आपका विज्ञापन "${ad.title}" देखा और यह पूछताछ भेजी है:\n\n${answersText}`;
      const waUrl = `https://wa.me/91${waNum}?text=${encodeURIComponent(message)}`;
      
      window.open(waUrl, '_blank');
      setLeadSubmitted(true);
    } else {
      setLeadSubmitted(true);
    }
  };

  // 1. Direct Image Banner Ad
  if (ad.type === 'IMAGE' && ad.imageUrl) {
    const fullImageUrl = getFullMediaUrl(ad.imageUrl);

    return (
      <>
        <div className={`w-full flex flex-col items-center justify-center my-3 select-none ${className}`}>
          {/* Micro sponsored label */}
          <div className="w-full max-w-4xl flex items-center justify-between px-1 mb-1 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
            <span>Advertisement</span>
            <span className="text-[8px] font-medium text-slate-300 dark:text-slate-600">Sponsored</span>
          </div>

          <div className="w-full max-w-4xl rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-transform hover:opacity-95 relative group">
            <a
              href={ad.targetUrl || '#'}
              target={ad.actionType === 'LEAD_FORM' ? '_self' : '_blank'}
              rel="noopener noreferrer sponsored"
              onClick={handleAdClick}
              className="block w-full cursor-pointer overflow-hidden"
              title={ad.title}
            >
              <img
                src={fullImageUrl}
                alt={ad.title || 'Sponsored Advertisement'}
                className="w-full h-auto max-h-[200px] md:max-h-[240px] object-contain mx-auto"
                loading="lazy"
              />
            </a>

            {/* Direct Call Button (if allowCall is enabled) */}
            {ad.allowCall && ad.advertiserPhone && (
              <a
                href={`tel:${ad.advertiserPhone.replace(/\D/g, '')}`}
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center space-x-1.5 cursor-pointer z-10"
                title="Direct Phone Call"
              >
                <Phone className="w-3.5 h-3.5 fill-white text-white" />
                <span>Call Now</span>
              </a>
            )}
          </div>
        </div>

        {/* Public Reader Lead Inquiry Modal */}
        {isLeadInquiryOpen && (
          <div
            onClick={() => setIsLeadInquiryOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          >
            <div
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 text-xs text-slate-800"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">
                    {ad.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    पूछताछ विवरण दर्ज करें (Inquiry Form)
                  </p>
                </div>
                <button
                  onClick={() => setIsLeadInquiryOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {leadSubmitted ? (
                <div className="py-6 text-center space-y-3">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    धन्यवाद! आपकी जानकारी प्राप्त हो गई है
                  </h4>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                    आपकी पूछताछ विज्ञापनदाता <strong>{ad.advertiserName || ad.title}</strong> को भेज दी गई है। वे आपसे जल्द ही संपर्क करेंगे।
                  </p>
                  <button
                    onClick={() => setIsLeadInquiryOpen(false)}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs hover:bg-slate-800 transition-colors"
                  >
                    बंद करें
                  </button>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  {leadError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold text-xs">
                      {leadError}
                    </div>
                  )}

                  <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                    {(leadConfig?.questions && leadConfig.questions.length > 0
                      ? leadConfig.questions
                      : [
                          { id: 'name', label: 'आपका नाम (Full Name)', type: 'SHORT_TEXT', required: true },
                          { id: 'phone', label: 'मोबाइल नंबर (Phone Number)', type: 'PHONE', required: true }
                        ]
                    ).map((q) => (
                      <div key={q.id} className="space-y-1">
                        <label className="text-xs font-bold text-slate-800">
                          {q.label} {q.required && <span className="text-red-600">*</span>}
                        </label>
                        {q.type === 'LONG_TEXT' ? (
                          <textarea
                            rows={3}
                            required={q.required}
                            placeholder="अपना संदेश लिखें..."
                            value={leadAnswers[q.id] || ''}
                            onChange={e => setLeadAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-red-600"
                          />
                        ) : (
                          <input
                            type={q.type === 'PHONE' ? 'tel' : 'text'}
                            required={q.required}
                            placeholder={q.type === 'PHONE' ? '10-अंकों का मोबाइल नंबर' : 'अपना उत्तर लिखें...'}
                            value={leadAnswers[q.id] || ''}
                            onChange={e => setLeadAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-red-600"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsLeadInquiryOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs"
                    >
                      रद्द करें
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>पूछताछ भेजें</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  // 2. Google AdSense / Custom Script Ad
  if (ad.type === 'SCRIPT' && ad.scriptCode) {
    return (
      <div className={`w-full flex flex-col items-center justify-center my-3 select-none ${className}`}>
        <div className="w-full max-w-4xl flex items-center justify-between px-1 mb-1 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
          <span>Advertisement</span>
          <span className="text-[8px] font-medium text-slate-300 dark:text-slate-600">Sponsored</span>
        </div>

        <div
          ref={scriptContainerRef}
          className="w-full max-w-4xl min-h-[90px] flex items-center justify-center rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-center"
        />
      </div>
    );
  }

  return null;
};
