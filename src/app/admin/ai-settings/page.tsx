'use client';

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import {
  aiSettingsService,
  AiSettingsData,
  AiTokenUsageData,
  ModelOption,
  TestConnectionResult,
  ProviderStatus
} from '@/services/aiSettingsService';
import {
  Zap, CheckCircle2, AlertTriangle, RefreshCw,
  Eye, EyeOff, Save, ChevronDown, Check, Sparkles, Server,
  Activity, Clock, BarChart3
} from 'lucide-react';

const PROVIDERS = [
  { id: 'gemini', name: 'Google Gemini', tag: 'Fast & Reliable' },
  { id: 'groq', name: 'Groq (GroqCloud)', tag: 'Ultra-Fast LPU Engine' },
  { id: 'openai', name: 'OpenAI (ChatGPT)', tag: 'Flagship GPT-4o' },
  { id: 'deepseek', name: 'DeepSeek', tag: 'V3 Chat & R1 Reasoning' },
  { id: 'claude', name: 'Anthropic Claude', tag: 'Journalistic Excellence' }
];

interface ProviderFormState {
  hasApiKey: boolean;
  maskedKey: string;
  inputKey: string;
  selectedModel: string;
  models: ModelOption[];
  isVerified: boolean;
  lastTestedAt: string | null;
  lastLatencyMs: number | null;
  hasUnsavedChanges: boolean;
}

export default function AiSettingsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Global settings
  const [enabled, setEnabled] = useState(true);
  const [activeProvider, setActiveProvider] = useState<string>('gemini');

  // Active view in UI
  const [viewProvider, setViewProvider] = useState<string>('gemini');

  // Per-provider state dictionary
  const [providerStates, setProviderStates] = useState<Record<string, ProviderFormState>>({
    gemini: { hasApiKey: false, maskedKey: '', inputKey: '', selectedModel: '', models: [], isVerified: false, lastTestedAt: null, lastLatencyMs: null, hasUnsavedChanges: false },
    groq: { hasApiKey: false, maskedKey: '', inputKey: '', selectedModel: '', models: [], isVerified: false, lastTestedAt: null, lastLatencyMs: null, hasUnsavedChanges: false },
    openai: { hasApiKey: false, maskedKey: '', inputKey: '', selectedModel: '', models: [], isVerified: false, lastTestedAt: null, lastLatencyMs: null, hasUnsavedChanges: false },
    claude: { hasApiKey: false, maskedKey: '', inputKey: '', selectedModel: '', models: [], isVerified: false, lastTestedAt: null, lastLatencyMs: null, hasUnsavedChanges: false },
    deepseek: { hasApiKey: false, maskedKey: '', inputKey: '', selectedModel: '', models: [], isVerified: false, lastTestedAt: null, lastLatencyMs: null, hasUnsavedChanges: false }
  });

  // Key revelation state
  const [showKey, setShowKey] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, string>>({});
  const [loadingReveal, setLoadingReveal] = useState(false);

  // Connection testing state
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<TestConnectionResult | null>(null);

  // Live Token Usage analytics state
  const [usageData, setUsageData] = useState<AiTokenUsageData | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [usageProvider, setUsageProvider] = useState<string>('groq');

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadUsage(prov?: string) {
    try {
      setLoadingUsage(true);
      const target = prov || usageProvider || activeProvider || 'groq';
      const stats = await aiSettingsService.getUsageStats(target);
      setUsageData(stats);
      setUsageProvider(target);
    } catch (err: any) {
      console.warn('Failed to load token usage stats:', err);
    } finally {
      setLoadingUsage(false);
    }
  }

  async function loadSettings() {
    try {
      setLoading(true);
      setErrorBanner(null);
      const data: AiSettingsData = await aiSettingsService.getSettings();

      setEnabled(data.enabled ?? true);
      const activeP = data.activeProvider || 'gemini';
      setActiveProvider(activeP);
      setViewProvider(activeP);
      setUsageProvider(activeP);

      const newStates: Record<string, ProviderFormState> = {};
      for (const p of PROVIDERS) {
        const provData: ProviderStatus = data.providers?.[p.id] || {
          hasApiKey: false,
          maskedKey: '',
          selectedModel: '',
          cachedModels: [],
          isVerified: false
        };

        newStates[p.id] = {
          hasApiKey: provData.hasApiKey,
          maskedKey: provData.maskedKey || '',
          inputKey: '',
          selectedModel: provData.selectedModel || provData.cachedModels?.[0]?.id || '',
          models: provData.cachedModels || [],
          isVerified: provData.isVerified || false,
          lastTestedAt: provData.lastTestedAt || null,
          lastLatencyMs: provData.lastLatencyMs || null,
          hasUnsavedChanges: false
        };
      }

      setProviderStates(newStates);
      await loadUsage(activeP);
    } catch (err: any) {
      console.error('Failed to load AI settings:', err);
      setErrorBanner(err.message || 'Failed to connect to AI settings service.');
    } finally {
      setLoading(false);
    }
  }

  function handleSelectViewProvider(newP: string) {
    setViewProvider(newP);
    setTestResult(null);
    setShowKey(false);
    loadUsage(newP);
  }

  const currentProviderState = providerStates[viewProvider] || {
    hasApiKey: false,
    maskedKey: '',
    inputKey: '',
    selectedModel: '',
    models: [],
    isVerified: false,
    lastTestedAt: null,
    lastLatencyMs: null,
    hasUnsavedChanges: false
  };

  const selectedProviderObj = PROVIDERS.find(p => p.id === viewProvider) || PROVIDERS[0];

  // Toggle API Key visibility & reveal from backend if saved
  async function toggleEye() {
    if (showKey) {
      setShowKey(false);
      return;
    }

    if (currentProviderState.inputKey) {
      setShowKey(true);
      return;
    }

    if (currentProviderState.hasApiKey) {
      if (revealedKeys[viewProvider]) {
        setShowKey(true);
        return;
      }

      try {
        setLoadingReveal(true);
        const plainKey = await aiSettingsService.revealKey(viewProvider);
        if (plainKey) {
          setRevealedKeys(prev => ({ ...prev, [viewProvider]: plainKey }));
          setShowKey(true);
        }
      } catch (err: any) {
        setErrorBanner(`Failed to reveal key: ${err.message}`);
      } finally {
        setLoadingReveal(false);
      }
    }
  }

  // Dynamic Live Model Fetching
  async function handleFetchModels() {
    try {
      setFetchingModels(true);
      setErrorBanner(null);
      setTestResult(null);

      const effectiveKey = currentProviderState.inputKey.trim();
      const models = await aiSettingsService.fetchModels(viewProvider, effectiveKey || undefined);

      setProviderStates(prev => {
        const cur = prev[viewProvider];
        const newSelected = models.some(m => m.id === cur.selectedModel)
          ? cur.selectedModel
          : (models[0]?.id || cur.selectedModel);

        return {
          ...prev,
          [viewProvider]: {
            ...cur,
            models,
            selectedModel: newSelected,
            hasUnsavedChanges: true
          }
        };
      });
    } catch (err: any) {
      setErrorBanner(`Failed to fetch models for ${selectedProviderObj.name}: ${err.message}`);
    } finally {
      setFetchingModels(false);
    }
  }

  // Live Test Connection Probe
  async function handleTestConnection() {
    try {
      setTestingConnection(true);
      setTestResult(null);
      setErrorBanner(null);

      const effectiveKey = currentProviderState.inputKey.trim();
      const result = await aiSettingsService.testConnection({
        provider: viewProvider,
        model: currentProviderState.selectedModel,
        apiKey: effectiveKey || undefined
      });

      setTestResult(result);

      if (result.success) {
        setProviderStates(prev => ({
          ...prev,
          [viewProvider]: {
            ...prev[viewProvider],
            isVerified: true,
            lastTestedAt: new Date().toISOString(),
            lastLatencyMs: result.latencyMs || null
          }
        }));
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        provider: viewProvider,
        model: currentProviderState.selectedModel,
        message: err.message || 'Connection test failed',
        error: err.message
      });
    } finally {
      setTestingConnection(false);
    }
  }

  // Save Settings permanently to MySQL
  async function handleSaveSettings() {
    try {
      setSaving(true);
      setErrorBanner(null);
      setSaveSuccess(false);

      if (currentProviderState.inputKey.trim() && !currentProviderState.isVerified) {
        const testRes = await aiSettingsService.testConnection({
          provider: viewProvider,
          model: currentProviderState.selectedModel,
          apiKey: currentProviderState.inputKey.trim()
        });

        if (!testRes.success) {
          setErrorBanner(`Cannot save settings: Connection test failed (${testRes.message || testRes.error}). Existing configuration was preserved.`);
          setSaving(false);
          return;
        }
      }

      const providerUpdates: Record<string, any> = {};
      for (const [p, state] of Object.entries(providerStates)) {
        const item: any = {
          selectedModel: state.selectedModel,
          cachedModels: state.models
        };
        if (state.inputKey.trim()) {
          item.apiKey = state.inputKey.trim();
        }
        providerUpdates[p] = item;
      }

      await aiSettingsService.updateSettings({
        activeProvider,
        enabled,
        providerUpdates
      });

      await loadSettings();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      setErrorBanner(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  }

  // Determine input field display value and type
  const isRevealedSavedKey = showKey && !currentProviderState.inputKey && Boolean(revealedKeys[viewProvider]);
  const displayValue = currentProviderState.inputKey
    ? currentProviderState.inputKey
    : isRevealedSavedKey
      ? revealedKeys[viewProvider]
      : '';

  const inputType = (showKey || isRevealedSavedKey) ? 'text' : 'password';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans select-none">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader title="AI Agent Settings" />

        <div className="flex-1 flex items-start justify-center p-4 sm:p-8 lg:p-10">
          <div className="w-full max-w-6xl space-y-6">

            {/* Header Card with AI Active Toggle */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs flex items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 tracking-tight">
                  AI Agent & API Key Settings
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Manage AI providers, models, encrypted API keys, and real-time token quotas.
                </p>
              </div>

              <div className="flex items-center space-x-2.5 bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200 shrink-0">
                <span className="text-xs font-semibold text-slate-700">AI Active</span>
                <button
                  type="button"
                  onClick={() => setEnabled(!enabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    enabled ? 'bg-red-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Success Alert */}
            {saveSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2.5 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>AI Provider, Model, and Encrypted API Keys saved successfully.</span>
              </div>
            )}

            {/* Error Alert */}
            {errorBanner && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorBanner}</span>
                </div>
                <button
                  onClick={() => setErrorBanner(null)}
                  className="text-red-700 hover:text-red-900 text-xs font-bold underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* 2-Column Responsive Side-by-Side Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              {/* LEFT COLUMN: Agent Configuration & Keys (7 cols) */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">

                {/* Row 1: Provider and Model on the SAME LINE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Left: Select AI Provider */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Select AI Agent
                      </label>
                      {viewProvider === activeProvider ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>Active</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveProvider(viewProvider);
                            setErrorBanner(null);
                          }}
                          className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline flex items-center space-x-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>Set Active</span>
                        </button>
                      )}
                    </div>

                    <div className="relative">
                      <select
                        value={viewProvider}
                        onChange={(e) => handleSelectViewProvider(e.target.value)}
                        className="w-full appearance-none bg-slate-50 hover:bg-slate-100/70 border border-slate-300 rounded-2xl px-4 py-3 pr-10 text-sm font-bold text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-all cursor-pointer shadow-xs"
                      >
                        {PROVIDERS.map((p) => {
                          const isAct = activeProvider === p.id;
                          const pState = providerStates[p.id];
                          const hasKey = pState?.hasApiKey || Boolean(pState?.inputKey);
                          const tag = isAct ? '★ Active' : (hasKey ? 'Configured' : '');
                          return (
                            <option key={p.id} value={p.id} className="text-slate-900 bg-white font-medium">
                              {p.name} {tag ? `(${tag})` : ''}
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Right: Select Model */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Select Model
                      </label>
                      <button
                        type="button"
                        onClick={handleFetchModels}
                        disabled={fetchingModels || (!currentProviderState.hasApiKey && !currentProviderState.inputKey.trim())}
                        className="text-[11px] font-bold text-slate-600 hover:text-red-600 flex items-center space-x-1 cursor-pointer disabled:opacity-40"
                        title="Fetch available models from official API"
                      >
                        <RefreshCw className={`w-3 h-3 ${fetchingModels ? 'animate-spin text-red-600' : 'text-slate-500'}`} />
                        <span>{fetchingModels ? 'Fetching...' : 'Fetch Models'}</span>
                      </button>
                    </div>

                    <div className="relative">
                      <select
                        value={currentProviderState.selectedModel}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProviderStates(prev => ({
                            ...prev,
                            [viewProvider]: {
                              ...prev[viewProvider],
                              selectedModel: val,
                              isVerified: false,
                              hasUnsavedChanges: true
                            }
                          }));
                          setTestResult(null);
                        }}
                        className="w-full appearance-none bg-slate-50 hover:bg-slate-100/70 border border-slate-300 rounded-2xl px-4 py-3 pr-10 text-sm font-semibold text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-all cursor-pointer shadow-xs"
                      >
                        {currentProviderState.models.length > 0 ? (
                          currentProviderState.models.map((m) => (
                            <option key={m.id} value={m.id} className="text-slate-900 bg-white font-medium">
                              {m.name || m.id} {m.context ? `(${m.context})` : ''}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled className="text-slate-400">
                            Click 'Fetch Models' to load available models
                          </option>
                        )}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                </div>

                {/* Row 2: API Key Input with Eye Toggle & Test Connection */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      {selectedProviderObj.name} API Key
                    </label>
                    <div className="flex items-center space-x-2">
                      {currentProviderState.hasApiKey && !currentProviderState.inputKey && (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center space-x-1.5 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>Connected</span>
                        </span>
                      )}
                      {currentProviderState.isVerified && (
                        <span className="text-[10px] text-blue-700 font-bold bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center space-x-1.5 shadow-xs">
                          <Check className="w-3 h-3 text-blue-600" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                      <input
                        type={inputType}
                        value={displayValue}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProviderStates(prev => ({
                            ...prev,
                            [viewProvider]: {
                              ...prev[viewProvider],
                              inputKey: val,
                              isVerified: false,
                              hasUnsavedChanges: true
                            }
                          }));
                          setTestResult(null);
                        }}
                        placeholder={
                          currentProviderState.hasApiKey
                            ? '••••••••••••••••••••••••'
                            : `Enter ${selectedProviderObj.name} API Key`
                        }
                        className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 pr-10 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:bg-white transition-all shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={toggleEye}
                        disabled={loadingReveal}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer transition-colors"
                        title={showKey ? 'Hide API key' : 'Reveal API key'}
                      >
                        {loadingReveal ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                        ) : showKey ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Test Connection Button */}
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={
                        testingConnection ||
                        (!currentProviderState.hasApiKey && !currentProviderState.inputKey.trim()) ||
                        !currentProviderState.selectedModel
                      }
                      className="px-5 py-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-xs font-bold text-amber-900 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 shrink-0 shadow-xs"
                    >
                      {testingConnection ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                          <span>Testing...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 text-amber-600" />
                          <span>Test Connection</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Test Connection Feedback */}
                  {testResult && (
                    <div className="pt-1">
                      {testResult.success ? (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-xs">
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{testResult.message || 'Connection verified successfully.'}</span>
                          </div>
                          {testResult.latencyMs && (
                            <span className="font-mono font-bold bg-emerald-100 px-2 py-0.5 rounded text-[11px] text-emerald-800 border border-emerald-300">
                              {testResult.latencyMs}ms
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center space-x-2 shadow-xs">
                          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                          <span className="font-mono text-[11px]">{testResult.error || testResult.message}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Row 3: Footer Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 flex items-center space-x-1.5">
                    <Server className="w-3.5 h-3.5 text-slate-400" />
                    <span>Encrypted with AES-256-GCM in MySQL</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={loadSettings}
                      disabled={loading || saving}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      Reset
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      disabled={loading || saving}
                      className="px-7 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-xs font-bold text-white flex items-center space-x-2 shadow-md shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Live Token & Daily Quota Meter (Paired with Selected Agent) (5 cols) */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5 lg:sticky lg:top-20">

                {/* Header row with provider badge and refresh button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold font-serif text-slate-900 tracking-tight">
                        Live Token & Quota Meter
                      </h2>
                      <span className="text-[10px] text-slate-500 block">
                        Today: {usageData?.date || 'Today'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => loadUsage(viewProvider)}
                    disabled={loadingUsage}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
                    title="Refresh live token statistics"
                  >
                    <RefreshCw className={`w-3 h-3 ${loadingUsage ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {/* Selected Agent Identity Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Selected AI Agent
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {selectedProviderObj.name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {viewProvider === activeProvider ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                          ★ Active Agent
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveProvider(viewProvider);
                            setErrorBanner(null);
                          }}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-300 transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-2.5 h-2.5 text-amber-500 mr-1" />
                          Click to Activate
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Primary Tokens Number */}
                  <div className="pt-2 border-t border-slate-200/60">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
                        {(usageData?.today?.tokensUsed || 0).toLocaleString()}
                      </span>
                      {usageData?.today?.percentageUsed !== null && usageData?.today?.percentageUsed !== undefined && (
                        <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg border ${
                          usageData.today.percentageUsed > 80
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : usageData.today.percentageUsed > 50
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {usageData.today.percentageUsed}% used
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                      {usageData?.today?.quotaLimit
                        ? `out of ${(usageData.today.quotaLimit).toLocaleString()} free tokens today`
                        : `tokens tracked today (${usageData?.quotaSpec?.billingType || 'Prepaid Wallet'})`}
                    </span>
                  </div>

                  {/* Progress bar */}
                  {usageData?.today?.quotaLimit && (
                    <div className="space-y-1 pt-1">
                      <div className="w-full h-2.5 bg-slate-200/90 rounded-full overflow-hidden p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            (usageData.today.percentageUsed || 0) > 80
                              ? 'bg-rose-500'
                              : (usageData.today.percentageUsed || 0) > 50
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.max(2, Math.min(100, usageData.today.percentageUsed || 0))}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="font-semibold">{((usageData.today.remainingTokens || 0)).toLocaleString()} tokens left</span>
                        <span className="text-[10px] text-slate-400">Resets daily 5:30 AM</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3 Detail KPI Mini-Cards */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Stories
                    </span>
                    <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">
                      {usageData?.today?.requestCount || 0}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Prompt
                    </span>
                    <span className="text-xs font-bold text-slate-900 font-mono mt-1 block">
                      {(usageData?.today?.promptTokens || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Output
                    </span>
                    <span className="text-xs font-bold text-slate-900 font-mono mt-1 block">
                      {(usageData?.today?.completionTokens || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
