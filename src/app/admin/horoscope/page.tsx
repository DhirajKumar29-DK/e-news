'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { horoscopeService, HoroscopeData } from '@/services/horoscopeService';
import {
  Sparkles, Save, RefreshCw, ExternalLink, CheckCircle, AlertCircle, Compass,
  Calendar, Heart, Shield, HelpCircle
} from 'lucide-react';

const ZODIAC_SIGNS = [
  { id: 'aries', name: 'Aries', hindi: 'मेष', dates: 'MAR 21 - APR 19', icon: '♈' },
  { id: 'taurus', name: 'Taurus', hindi: 'वृषभ', dates: 'APR 20 - MAY 20', icon: '♉' },
  { id: 'gemini', name: 'Gemini', hindi: 'मिथुन', dates: 'MAY 21 - JUN 21', icon: '♊' },
  { id: 'cancer', name: 'Cancer', hindi: 'कर्क', dates: 'JUN 21 - JUL 22', icon: '♋' },
  { id: 'leo', name: 'Leo', hindi: 'सिंह', dates: 'JUL 23 - AUG 22', icon: '♌' },
  { id: 'virgo', name: 'Virgo', hindi: 'कन्या', dates: 'AUG 23 - SEP 22', icon: '♍' },
  { id: 'libra', name: 'Libra', hindi: 'तुला', dates: 'SEP 23 - OCT 22', icon: '♎' },
  { id: 'scorpio', name: 'Scorpio', hindi: 'वृश्चिक', dates: 'OCT 23 - NOV 21', icon: '♏' },
  { id: 'sagittarius', name: 'Sagittarius', hindi: 'धनु', dates: 'NOV 22 - DEC 21', icon: '♐' },
  { id: 'capricorn', name: 'Capricorn', hindi: 'मकर', dates: 'DEC 22 - JAN 19', icon: '♑' },
  { id: 'aquarius', name: 'Aquarius', hindi: 'कुंभ', dates: 'JAN 20 - FEB 18', icon: '♒' },
  { id: 'pisces', name: 'Pisces', hindi: 'मीन', dates: 'FEB 19 - MAR 20', icon: '♓' },
];

const PERIOD_TABS: Array<{ id: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'LOVE'; label: string }> = [
  { id: 'DAILY', label: 'Daily (दैनिक)' },
  { id: 'WEEKLY', label: 'Weekly (साप्ताहिक)' },
  { id: 'MONTHLY', label: 'Monthly (मासिक)' },
  { id: 'YEARLY', label: 'Yearly (वार्षिक)' },
  { id: 'LOVE', label: 'Love (प्रेम राशिफल)' },
];

function HoroscopeStudioContent() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAdminAuth();

  const [activeSign, setActiveSign] = useState('taurus');
  const [activePeriod, setActivePeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'LOVE'>('DAILY');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<HoroscopeData>>({
    sign: 'taurus',
    signName: 'Taurus',
    hindiName: 'वृषभ',
    dateRange: 'APR 20 - MAY 20',
    period: 'DAILY',
    luckyColour: '',
    luckyGemstone: '',
    luckyDay: '',
    luckyNumber: '',
    rulingPlanet: '',
    compatibleSign: '',
    prediction: '',
    remedy: ''
  });

  const selectedSignMeta = ZODIAC_SIGNS.find(s => s.id === activeSign) || ZODIAC_SIGNS[1];

  const fetchSignData = async (sign: string, period: string) => {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await horoscopeService.getHoroscope(sign, period);
      setFormData(data);
    } catch (err: any) {
      console.error('Failed to load horoscope:', err);
      setErrorMsg('Failed to load astrological data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchSignData(activeSign, activePeriod);
    }
  }, [user, activeSign, activePeriod]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      const updated = await horoscopeService.updateHoroscope({
        ...formData,
        sign: activeSign,
        period: activePeriod,
        signName: selectedSignMeta.name,
        hindiName: selectedSignMeta.hindi,
        dateRange: selectedSignMeta.dates
      });

      setFormData(updated);
      setSuccessMsg(`✓ ${selectedSignMeta.name} (${activePeriod}) updated successfully in MySQL!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update horoscope');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex font-sans select-none overflow-hidden">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <AdminHeader title="Horoscope & Rashifal Studio" />

        {/* Pinned Action Banner */}
        <div className="shrink-0 bg-slate-50 border-b border-slate-200/80 px-6 sm:px-8 pt-4 pb-3 max-w-7xl w-full mx-auto space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full mb-1">
                <Sparkles className="w-3.5 h-3.5 text-red-600" />
                <span>Astrology & Vedic CMS</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black font-serif text-slate-900 tracking-tight flex items-center space-x-2">
                <span>{selectedSignMeta.name} ({selectedSignMeta.hindi}) Horoscope</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono font-medium">
                  {selectedSignMeta.dates}
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage 12 Rashi lucky gemstones, numbers, ruling planets, remedies, and 5-timeframe predictions.
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <a
                href="/horoscope"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                title="Preview Live Horoscope Page"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Live Site</span>
              </a>

              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-red-600/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving to DB...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Horoscope</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 12 Zodiac Sign Selection Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs overflow-x-auto no-scrollbar flex items-center space-x-2">
            {ZODIAC_SIGNS.map((sign) => {
              const isSelected = sign.id === activeSign;
              return (
                <button
                  key={sign.id}
                  onClick={() => setActiveSign(sign.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                  }`}
                >
                  <span className="text-sm">{sign.icon}</span>
                  <span>{sign.name}</span>
                  <span className={`text-[10px] font-normal ${isSelected ? 'text-red-100' : 'text-slate-400'}`}>
                    ({sign.hindi})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Period Tabs */}
          <div className="flex items-center space-x-2">
            {PERIOD_TABS.map((tab) => {
              const isTabActive = tab.id === activePeriod;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActivePeriod(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    isTabActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Form Content Area */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-4 max-w-7xl w-full mx-auto">
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <RefreshCw className="w-7 h-7 animate-spin text-red-600" />
              <p className="text-xs font-semibold">Loading Astrological Data from MySQL...</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              {/* Top Grid: 6 Astrological Attributes (Lucky Boxes) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {selectedSignMeta.name} Lucky Attributes (शुभ घटक)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      These values populate the 6 soft-pink cards on the live horoscope page.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                    6 Attributes
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* 1. Lucky Colour */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Lucky Colour (शुभ रंग)
                    </label>
                    <input
                      type="text"
                      value={formData.luckyColour || ''}
                      onChange={(e) => setFormData({ ...formData, luckyColour: e.target.value })}
                      placeholder="e.g. White and Green"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                    />
                  </div>

                  {/* 2. Lucky Gemstone */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Lucky Gemstone (शुभ रत्न)
                    </label>
                    <input
                      type="text"
                      value={formData.luckyGemstone || ''}
                      onChange={(e) => setFormData({ ...formData, luckyGemstone: e.target.value })}
                      placeholder="e.g. Diamond, Coral, Emerald"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                    />
                  </div>

                  {/* 3. Lucky Day */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Lucky Day (शुभ दिन)
                    </label>
                    <input
                      type="text"
                      value={formData.luckyDay || ''}
                      onChange={(e) => setFormData({ ...formData, luckyDay: e.target.value })}
                      placeholder="e.g. Mondays, Fridays, Saturdays"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                    />
                  </div>

                  {/* 4. Lucky Number */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Lucky Number (शुभ अंक)
                    </label>
                    <input
                      type="text"
                      value={formData.luckyNumber || ''}
                      onChange={(e) => setFormData({ ...formData, luckyNumber: e.target.value })}
                      placeholder="e.g. 1, 9"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                    />
                  </div>

                  {/* 5. Ruling Planet */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Ruling Planet (स्वामी ग्रह)
                    </label>
                    <input
                      type="text"
                      value={formData.rulingPlanet || ''}
                      onChange={(e) => setFormData({ ...formData, rulingPlanet: e.target.value })}
                      placeholder="e.g. Venus (शुक्र)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                    />
                  </div>

                  {/* 6. Compatible Zodiac Sign */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Compatible Sign (अनुकूल राशियाँ)
                    </label>
                    <input
                      type="text"
                      value={formData.compatibleSign || ''}
                      onChange={(e) => setFormData({ ...formData, compatibleSign: e.target.value })}
                      placeholder="e.g. Scorpio, Virgo"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Card: Prediction Text & Remedy */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {selectedSignMeta.name} {activePeriod} Prediction & Remedy
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      The core forecast text and spiritual remedy shown when user selects the &quot;{activePeriod}&quot; tab.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    Tab: {activePeriod}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Prediction Description (राशिफल विवरण)
                  </label>
                  <textarea
                    rows={7}
                    value={formData.prediction || ''}
                    onChange={(e) => setFormData({ ...formData, prediction: e.target.value })}
                    placeholder="Write detailed astrological prediction..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 leading-relaxed focus:outline-none focus:border-red-500 focus:bg-white transition-colors font-sans"
                  />
                  <div className="text-[11px] text-slate-400 text-right mt-1 font-mono">
                    {(formData.prediction || '').length} characters
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Remedy (आज का उपाय)
                  </label>
                  <input
                    type="text"
                    value={formData.remedy || ''}
                    onChange={(e) => setFormData({ ...formData, remedy: e.target.value })}
                    placeholder="e.g. Donate white items such as milk, rice, or sugar to someone in need."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Displayed at the bottom of the prediction as: <span className="font-semibold text-slate-600">&quot;Remedy: [Your Text]&quot;</span>
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => fetchSignData(activeSign, activePeriod)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Reset Changes
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Horoscope'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminHoroscopePage() {
  return (
    <AdminAuthProvider>
      <HoroscopeStudioContent />
    </AdminAuthProvider>
  );
}
