/**
 * EPaper related TypeScript interfaces
 */

export interface EpaperEdition {
  id: number;
  slug: string;
  name: string;
  state?: string;
  language?: string;
}

export interface EpaperState {
  state: string;
  editions: EpaperEdition[];
}

export interface EpaperIssue {
  id: number;
  edition_slug: string;
  date: string;
  pdf_url?: string;
  pages?: EpaperPage[];
  is_published?: boolean;
}

export interface EpaperPage {
  page_number: number;
  image_url?: string;
  pdf_url?: string;
  slots?: EpaperSlot[];
}

export interface EpaperSlot {
  slot_id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'article' | 'ad' | 'image' | 'empty';
  content?: {
    headline?: string;
    body?: string;
    imageUrl?: string;
  };
}

export interface EpaperArchiveDate {
  date: string;
  label?: string;
}

export interface GeneratePdfPayload {
  edition_slug: string;
  date: string;
  pages: EpaperPage[];
}

export interface SaveSlotPayload {
  issue_id: number;
  page_number: number;
  slot: EpaperSlot;
}

export interface SavePagesBulkPayload {
  issue_id?: number;
  edition_slug?: string;
  editionSlug?: string;
  date?: string;
  publish_date?: string;
  pages: any[];
}

export interface PublishPayload {
  issue_id: number;
  edition_slug: string;
  date: string;
}

export interface AIAgentSlotContext {
  id?: string | number;
  slotNumber?: number;
  headline?: string;
  subHeadline?: string;
  summary?: string;
  columnsCount?: number;
  width?: number;
  height?: number;
}

export interface AIAgentPayload {
  prompt: string;
  activeSlot?: AIAgentSlotContext | null;
  history?: Array<{ sender: 'user' | 'agent' | string; text: string }>;
  apiKey?: string;
}
