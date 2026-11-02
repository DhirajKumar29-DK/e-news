'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import {
  epaperAutomationService,
  AutomationConfig,
  PageBlueprint,
  ScheduleJobLog
} from '@/services/epaperAutomationService';
import { fetchAdminEditions } from '@/services/epaperService';
import {
  CalendarClock, Clock, Sparkles, CheckCircle2, AlertTriangle,
  RefreshCw, Play, Save, Plus, Trash2, ArrowUp, ArrowDown,
  Layers, ExternalLink, ShieldCheck, Newspaper, Settings,
  Eye, Check, X, FileText, ChevronRight
} from 'lucide-react';

const DEFAULT_STARTER_BLUEPRINTS: PageBlueprint[] = [
  { pageNumber: 1, pageTitle: 'Main Headlines & Front Page', headerType: 'grand', targetTopic: 'top breaking news in india', slotCount: 7, order: 1, isActive: true },
  { pageNumber: 2, pageTitle: 'Patna City & Local News', headerType: 'folio', targetTopic: 'patna top news and breaking news', slotCount: 7, order: 2, isActive: true },
  { pageNumber: 3, pageTitle: 'Bihar State & Regional Affairs', headerType: 'folio', targetTopic: 'bihar state development and governance', slotCount: 6, order: 3, isActive: true },
  { pageNumber: 4, pageTitle: 'National Politics & Governance', headerType: 'folio', targetTopic: 'national politics and policy', slotCount: 6, order: 4, isActive: true },
  { pageNumber: 5, pageTitle: 'Business, Markets & Economy', headerType: 'folio', targetTopic: 'share market economy business', slotCount: 6, order: 5, isActive: true },
  { pageNumber: 6, pageTitle: 'Sports & Cricket Arena', headerType: 'folio', targetTopic: 'cricket sports news and matches', slotCount: 6, order: 6, isActive: true },
  { pageNumber: 7, pageTitle: 'Entertainment & Cinema', headerType: 'folio', targetTopic: 'bollywood cinema and entertainment', slotCount: 6, order: 7, isActive: true },
  { pageNumber: 8, pageTitle: 'World News & Global Wire', headerType: 'folio', targetTopic: 'world breaking international news', slotCount: 6, order: 8, isActive: true },
];

function AutomationDashboardContent() {
  const router = useRouter();
  const [selectedEdition, setSelectedEdition] = useState<string>('patna-main');
  const [editionsList, setEditionsList] = useState<Array<{ slug: string; name: string; city: string }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isTriggering, setIsTriggering] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Automation Config State
  const [config, setConfig] = useState<AutomationConfig | null>(null);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [scheduleTime, setScheduleTime] = useState<string>('05:00');
  const [targetCity, setTargetCity] = useState<string>('पटना');
  const [autoPublish, setAutoPublish] = useState<boolean>(false);
  const [blueprints, setBlueprints] = useState<PageBlueprint[]>(DEFAULT_STARTER_BLUEPRINTS);

  // Manual Trigger State
  const [triggerDate, setTriggerDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [triggerSuccessJob, setTriggerSuccessJob] = useState<{ id?: number; date: string } | null>(null);

  // Job History
  const [history, setHistory] = useState<ScheduleJobLog[]>([]);
  const [selectedJobLog, setSelectedJobLog] = useState<ScheduleJobLog | null>(null);

  // Load Editions
  useEffect(() => {
    async function loadEditions() {
      try {
        const eds = await fetchAdminEditions();
        if (Array.isArray(eds) && eds.length > 0) {
          setEditionsList(eds.map(e => ({ slug: e.slug, name: e.name || e.title, city: e.city || 'पटना' })));
        }
      } catch (err) {
        console.warn('Failed loading editions list:', err);
      }
    }
    loadEditions();
  }, []);

  // Load Config & History for selected edition
  const loadData = useCallback(async (editionSlug: string) => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const [cfg, hist] = await Promise.all([
        epaperAutomationService.getConfig(editionSlug),
        epaperAutomationService.getHistory(editionSlug, 10)
      ]);

      setConfig(cfg);
      setIsEnabled(Boolean(cfg.isEnabled));
      setScheduleTime(cfg.scheduleTime || '05:00');
      setTargetCity(cfg.targetCity || 'पटना');
      setAutoPublish(Boolean(cfg.autoPublish));

      if (Array.isArray(cfg.blueprints) && cfg.blueprints.length > 0) {
        setBlueprints(cfg.blueprints.map((b, idx) => ({
          ...b,
          pageNumber: idx + 1,
          order: idx + 1
        })));
      } else {
        setBlueprints(DEFAULT_STARTER_BLUEPRINTS);
      }

      setHistory(hist);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed loading automation data' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(selectedEdition);
  }, [selectedEdition, loadData]);

  // Handle Save Configuration
  const handleSaveConfig = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const updated = await epaperAutomationService.updateConfig({
        editionSlug: selectedEdition,
        isEnabled,
        scheduleTime,
        targetCity,
        autoPublish,
        blueprints: blueprints.map((bp, idx) => ({
          ...bp,
          pageNumber: idx + 1,
          order: idx + 1
        }))
      });

      setConfig(updated);
      setFeedback({ type: 'success', message: 'Automation configuration & page blueprints saved successfully!' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save configuration' });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Manual Trigger
  const handleTriggerNow = async () => {
    if (isTriggering) return;
    setIsTriggering(true);
    setFeedback(null);
    setTriggerSuccessJob(null);
    try {
      const res = await epaperAutomationService.triggerGeneration(selectedEdition, triggerDate);
      setTriggerSuccessJob({ id: res?.jobId, date: triggerDate });
      setFeedback({
        type: 'info',
        message: `Generation started for ${triggerDate}! The AI engine is assembling all ${blueprints.length} pages in the background.`
      });

      // Poll history after 4s
      setTimeout(async () => {
        try {
          const hist = await epaperAutomationService.getHistory(selectedEdition, 10);
          setHistory(hist);
        } catch { }
      }, 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to trigger generation' });
    } finally {
      setIsTriggering(false);
    }
  };

    const [deletingJobId, setDeletingJobId] = useState<string | number | null>(null);

  const handleDeleteJob = async (jobId: string | number, targetDate: string) => {
    if (!window.confirm(`Kya aap is run (${targetDate}) ko delete karna chahte hain? Isse iska draft issue bhi clear ho jayega taaki aap fresh test kar sakein.`)) {
      return;
    }
    setDeletingJobId(jobId);
    try {
      await epaperAutomationService.deleteHistory(jobId, true);
      setHistory(prev => prev.filter(j => j.id !== jobId));
      setFeedback({ type: 'success', message: `Run (${targetDate}) safalta-purvak delete ho gaya!` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete job log' });
    } finally {
      setDeletingJobId(null);
    }
  };

  // Blueprint Helpers
  const handleUpdateBlueprint = (index: number, patch: Partial<PageBlueprint>) => {
    setBlueprints(prev => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const handleAddPage = () => {
    setBlueprints(prev => {
      const nextNum = prev.length + 1;
      return [
        ...prev,
        {
          pageNumber: nextNum,
          pageTitle: `Page ${nextNum} Special`,
          headerType: 'folio',
          targetTopic: 'latest breaking news',
          slotCount: 6,
          order: nextNum,
          isActive: true
        }
      ];
    });
  };

  const handleDeletePage = (index: number) => {
    if (blueprints.length <= 1) {
      alert('At least 1 page blueprint is required.');
      return;
    }
    setBlueprints(prev => {
      const next = prev.filter((_, idx) => idx !== index);
      return next.map((b, idx) => ({ ...b, pageNumber: idx + 1, order: idx + 1 }));
    });
  };

  const handleMovePage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blueprints.length - 1) return;

    setBlueprints(prev => {
      const next = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next.map((b, idx) => ({ ...b, pageNumber: idx + 1, order: idx + 1 }));
    });
  };

  const handleResetBlueprints = () => {
    if (confirm('Reset to standard 8-page newspaper blueprint template?')) {
      setBlueprints(DEFAULT_STARTER_BLUEPRINTS);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AWAITING_APPROVAL':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
            Awaiting Review
          </span>
        );
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
            Published Live
          </span>
        );
      case 'GENERATING':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 animate-pulse">
            <RefreshCw className="w-3 h-3 mr-1 text-blue-600 animate-spin" />
            Generating...
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <AlertTriangle className="w-3 h-3 mr-1 text-red-600" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader />

        <main className="p-6 max-w-7xl w-full mx-auto space-y-6 pb-20">
          {/* TOP BREADCRUMB & HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
                <Link href="/admin/epaper" className="hover:text-red-600 transition-colors">
                  E-Paper Studio
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-900 font-bold">Automatic Scheduler</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 font-serif flex items-center space-x-2">
                <CalendarClock className="w-7 h-7 text-red-600" />
                <span>AI E-Paper Auto-Scheduler Studio</span>
              </h1>
              <p className="text-xs text-slate-500">
                Configure your daily automated newspaper publishing engine: custom schedules, dynamic page blueprints, and human editorial review.
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              {/* EDITION SELECTOR */}
              <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-600">Edition:</span>
                <select
                  value={selectedEdition}
                  onChange={e => setSelectedEdition(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                >
                  {editionsList.length > 0 ? (
                    editionsList.map(ed => (
                      <option key={ed.slug} value={ed.slug}>
                        {ed.name} ({ed.city})
                      </option>
                    ))
                  ) : (
                    <option value="patna-main">Patna Main Edition</option>
                  )}
                </select>
              </div>

              {/* OPEN IN CANVAS BUTTON */}
              <Link
                href={`/admin/epaper?edition=${selectedEdition}`}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs flex items-center space-x-1.5 transition-all"
                title="Open current edition in broadsheet visual editor"
              >
                <Newspaper className="w-4 h-4 text-slate-600" />
                <span>Canvas Editor</span>
              </Link>

              {/* SAVE BUTTON */}
              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={isSaving || isLoading}
                className="px-5 py-2 text-xs font-black text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl shadow-md shadow-red-600/20 flex items-center space-x-2 transition-all cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Blueprint</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* NOTIFICATION FEEDBACK BANNER */}
          {feedback && (
            <div
              className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : feedback.type === 'error'
                  ? 'bg-red-50 text-red-900 border border-red-200'
                  : 'bg-blue-50 text-blue-900 border border-blue-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                {feedback.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                {feedback.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
                {feedback.type === 'info' && <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />}
                <span>{feedback.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* MASTER CONTROLS & MANUAL TRIGGER GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CARD 1: MASTER SCHEDULER SETTINGS (2 COLS) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Daily Automated Schedule</h2>
                    <p className="text-xs text-slate-500">
                      When enabled, the background worker awakens daily to generate today&apos;s full edition.
                    </p>
                  </div>
                </div>

                {/* ON / OFF TOGGLE SWITCH */}
                <button
                  type="button"
                  onClick={() => setIsEnabled(!isEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* INPUT CONTROLS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Schedule Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Generation Time (Asia/Kolkata)
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={e => setScheduleTime(e.target.value)}
                      className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 block">Recommended: 04:30 AM to 05:30 AM</span>
                </div>

                {/* 2. Target City */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Edition City Anchor
                  </label>
                  <input
                    type="text"
                    value={targetCity}
                    onChange={e => setTargetCity(e.target.value)}
                    placeholder="e.g. पटना, गया, भागलपुर"
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                  />
                  <span className="text-[11px] text-slate-500 block">Local breaking news priority anchor</span>
                </div>

                {/* 3. Automation Mode */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Publishing Workflow
                  </label>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoPublish}
                        onChange={e => setAutoPublish(e.target.checked)}
                        className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5"
                      />
                      <span>Direct Auto-Publish</span>
                    </label>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      {autoPublish ? '⚠️ Publishes live immediately.' : '🛡️ Hybrid Mode: Awaits Admin final approval (Recommended).'}
                    </p>
                  </div>
                </div>
              </div>

              {/* SUMMARY FOOTER */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Status: <b>{isEnabled ? `Active daily at ${scheduleTime} AM IST` : 'Automation Paused'}</b> • Total <b>{blueprints.length} Pages</b> configured
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Target Timezone: Asia/Kolkata (IST)
                </span>
              </div>
            </div>

            {/* CARD 2: MANUAL TRIGGER NOW (1 COL) */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-lg shadow-slate-900/10 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-amber-400">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-wider">Manual Trigger Engine</span>
                </div>
                <h3 className="text-base font-bold font-serif">Generate Edition Now</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Need today&apos;s paper right now? Trigger the multi-page engine immediately for any edition date.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">Target Edition Date:</label>
                  <input
                    type="date"
                    value={triggerDate}
                    onChange={e => setTriggerDate(e.target.value)}
                    className="w-full text-xs font-mono font-bold bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleTriggerNow}
                  disabled={isTriggering}
                  className="w-full py-3 px-4 rounded-xl text-xs font-black bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/30 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isTriggering ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating Full Edition ({blueprints.length} Pages)...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Generate {blueprints.length}-Page Edition Now</span>
                    </>
                  )}
                </button>

                {triggerSuccessJob && (
                  <Link
                    href={`/admin/epaper?edition=${selectedEdition}&date=${triggerSuccessJob.date}`}
                    className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Open {triggerSuccessJob.date} in E-Paper Canvas</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* PAGE BLUEPRINTS MANAGER (THE EDITORIAL STRUCTURE) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-red-600" />
                  <h2 className="text-base font-black text-slate-900 font-serif">
                    Newspaper Page Blueprints & Editorial Structure
                  </h2>
                </div>
                <p className="text-xs text-slate-500">
                  Define what topic, category, header style, and number of news stories each newspaper page will have.
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={handleResetBlueprints}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg shadow-xs transition-colors cursor-pointer"
                  title="Reset to 8 standard pages"
                >
                  Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={handleAddPage}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Page</span>
                </button>
              </div>
            </div>

            {/* BLUEPRINTS LIST */}
            <div className="divide-y divide-slate-100">
              {blueprints.map((bp, idx) => (
                <div
                  key={idx}
                  className={`p-4 transition-colors hover:bg-slate-50/80 ${
                    !bp.isActive ? 'opacity-60 bg-slate-50/40' : ''
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* LEFT: Page Number Badge & Active Toggle */}
                    <div className="flex items-center space-x-3 shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                        P{idx + 1}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-slate-900">
                            Page {idx + 1}
                          </span>
                          {idx === 0 && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Front Page
                            </span>
                          )}
                        </div>
                        <label className="flex items-center space-x-1.5 text-[11px] text-slate-500 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={bp.isActive}
                            onChange={e => handleUpdateBlueprint(idx, { isActive: e.target.checked })}
                            className="rounded text-red-600 focus:ring-red-500 w-3 h-3"
                          />
                          <span>{bp.isActive ? 'Active' : 'Disabled'}</span>
                        </label>
                      </div>
                    </div>

                    {/* MIDDLE: Editable Properties Form */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 flex-1 min-w-0">
                      {/* 1. Page Title */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                          Page Title / Section
                        </label>
                        <input
                          type="text"
                          value={bp.pageTitle}
                          onChange={e => handleUpdateBlueprint(idx, { pageTitle: e.target.value })}
                          placeholder="e.g. Main Headlines"
                          className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-red-500"
                        />
                      </div>

                      {/* 2. Header Style */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                          Header Style
                        </label>
                        <select
                          value={bp.headerType}
                          onChange={e => handleUpdateBlueprint(idx, { headerType: e.target.value as 'grand' | 'folio' })}
                          className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-red-500 cursor-pointer"
                        >
                          <option value="grand">Grand Masthead (Main Logo)</option>
                          <option value="folio">Folio Bar (Standard Top)</option>
                        </select>
                      </div>

                      {/* 3. Slot Count */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                          Stories / Slots Count
                        </label>
                        <select
                          value={bp.slotCount}
                          onChange={e => handleUpdateBlueprint(idx, { slotCount: Number(e.target.value) })}
                          className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-red-500 cursor-pointer"
                        >
                          {[3, 4, 5, 6, 7, 8, 9, 10].map(cnt => (
                            <option key={cnt} value={cnt}>
                              {cnt} Stories ({cnt} Slots)
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 4. Topic Directive */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                          News Topic Directive
                        </label>
                        <input
                          type="text"
                          value={bp.targetTopic}
                          onChange={e => handleUpdateBlueprint(idx, { targetTopic: e.target.value })}
                          placeholder="e.g. patna city breaking news"
                          className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>
                    </div>

                    {/* RIGHT: Ordering & Delete Actions */}
                    <div className="flex items-center space-x-1 shrink-0 self-end lg:self-center">
                      <button
                        type="button"
                        onClick={() => handleMovePage(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Move Page Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMovePage(idx, 'down')}
                        disabled={idx === blueprints.length - 1}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Move Page Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePage(idx)}
                        disabled={blueprints.length <= 1}
                        className="p-1.5 text-red-500 hover:text-red-700 disabled:opacity-20 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Page"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* BLUEPRINT FOOTER */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
              <span>
                Total <b>{blueprints.filter(b => b.isActive).length} active pages</b> will be typeset on every scheduled generation.
              </span>
              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors self-end sm:self-auto cursor-pointer"
              >
                {isSaving ? 'Saving Changes...' : 'Save Page Blueprints'}
              </button>
            </div>
          </div>

          {/* GENERATION JOB HISTORY & AUDIT LOGS */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 font-serif">
                  Automated Generation History & Logs
                </h3>
                <p className="text-xs text-slate-500">
                  Track every run, inspect execution timing, and review draft editions before publishing.
                </p>
              </div>

              <button
                type="button"
                onClick={() => loadData(selectedEdition)}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Refresh history"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {history.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                <CalendarClock className="w-8 h-8 text-slate-300 mx-auto" />
                <p>No automated generation jobs recorded yet for {selectedEdition}.</p>
                <p className="text-[11px] text-slate-400">
                  Use the &quot;Generate Edition Now&quot; button above to create your first automated edition!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Target Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Pages Generated</th>
                      <th className="py-3 px-4">Started At</th>
                      <th className="py-3 px-4">Completed At</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {history.map(job => (
                      <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {job.targetDate}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(job.status)}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          <span className="font-bold text-slate-900">{job.pagesGenerated}</span> of {job.totalPages} Pages
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {new Date(job.startedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {job.completedAt ? new Date(job.completedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {job.executionLog && (
                            <button
                              type="button"
                              onClick={() => setSelectedJobLog(job)}
                              className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                            >
                              Log Details
                            </button>
                          )}
                          <Link
                            href={`/admin/epaper?edition=${job.editionSlug || selectedEdition}&date=${job.targetDate}`}
                            className="inline-flex items-center space-x-1 px-3 py-1 text-[11px] font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
                          >
                            <span>Open Canvas</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                          <button
                            type="button"
                            disabled={deletingJobId === job.id}
                            onClick={() => handleDeleteJob(job.id, job.targetDate)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-bold text-red-600 hover:text-white hover:bg-red-600 bg-red-50 border border-red-200 rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                            title="Delete this run and clear draft"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>{deletingJobId === job.id ? 'Deleting...' : 'Delete'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        {/* LOG DETAILS MODAL */}
        {selectedJobLog && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-sm text-slate-900">
                    Execution Log: {selectedJobLog.targetDate} ({selectedJobLog.editionSlug})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Started: {new Date(selectedJobLog.startedAt).toLocaleString('en-IN')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedJobLog(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-3 font-mono text-xs bg-slate-950 text-emerald-400">
                <pre className="whitespace-pre-wrap leading-relaxed text-[11px]">
                  {typeof selectedJobLog.executionLog === 'string'
                    ? selectedJobLog.executionLog
                    : JSON.stringify(selectedJobLog.executionLog, null, 2)}
                </pre>
              </div>

              <div className="p-3 border-t border-slate-200 bg-slate-50 text-right">
                <button
                  type="button"
                  onClick={() => setSelectedJobLog(null)}
                  className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AutomationDashboardPage() {
  return (
    <AdminAuthProvider>
      <AutomationDashboardContent />
    </AdminAuthProvider>
  );
}
