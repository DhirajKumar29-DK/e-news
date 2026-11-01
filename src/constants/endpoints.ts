/**
 * API Endpoints — Single source of truth
 * Sabhi API paths yahan define hain.
 * Components ya services mein directly string mat likho.
 */

export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
  },

  epaper: {
    // Public (frontend)
    statesWithEditions: '/epaper/states-with-editions',
    archiveDates: (editionSlug: string) =>
      `/epaper/archive-dates?edition=${editionSlug}`,
    issue: (editionSlug: string, date: string) =>
      `/epaper/issue?edition=${editionSlug}&date=${date}`,

    // Admin
    editions: '/epaper/editions',
    saveSlot: '/epaper/admin/save-slot',
    savePagesBulk: '/epaper/admin/save-pages-bulk',
    publish: '/epaper/admin/publish',
    publishIssue: '/epaper/admin/publish-issue',
    generatePdf: '/epaper/generate-pdf',
    aiAgent: '/epaper/ai-agent',
    autoGeneratePage: '/epaper/admin/auto-generate-page',
    tts: (text: string) => `/epaper/tts?text=${encodeURIComponent(text)}`,
  },

  aiSettings: {
    get: '/ai-settings',
    usage: (provider?: string) => provider ? `/ai-settings/usage?provider=${encodeURIComponent(provider)}` : '/ai-settings/usage',
    update: '/ai-settings',
    models: '/ai-settings/models',
    testConnection: '/ai-settings/test-connection',
    revealKey: '/ai-settings/reveal-key',
    providers: '/ai-settings/providers'
  },
} as const;
