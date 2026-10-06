export type Language = 'hi' | 'en';
export type Edition = 'national' | 'delhi' | 'mumbai' | 'lucknow';

export interface LocalizedString {
  hi?: string;
  en?: string;
  bn?: string;
  or?: string;
  mr?: string;
  ta?: string;
  te?: string;
  gu?: string;
  pa?: string;
  kn?: string;
  ml?: string;
  ur?: string;
  [key: string]: string | undefined;
}

export interface NewsArticle {
  id: string;
  title: LocalizedString;
  summary: LocalizedString;
  content?: {
    hi?: string[];
    en: string[];
  };
  category: string; // e.g. 'national', 'world', 'tech', 'sports', 'entertainment', 'opinion'
  imageUrl: string;
  imageCaption?: LocalizedString;
  publishedAt: string; // ISO or human readable timestamp
  timeAgo: LocalizedString;
  readTime: LocalizedString;
  author?: {
    name: LocalizedString;
    role: LocalizedString;
    avatar: string;
  };
  isLead?: boolean;
  isSubLead?: boolean;
  isTrending?: boolean;
  trendingRank?: number;
  isVideo?: boolean;
  videoDuration?: string;
  location?: LocalizedString;
  tags?: string[];
  viewsCount?: number;
  likesCount?: number;
}

export interface WebStory {
  id: string;
  title: LocalizedString;
  imageUrl: string;
  slidesCount: number;
  category: string;
}

export interface FastUpdate {
  id: string;
  timestamp: string;
  headline: LocalizedString;
  category: string;
  isUrgent?: boolean;
  tag?: string;
  articleId?: string;
}

export interface BreakingTickerItem {
  id: string;
  headline: LocalizedString;
  category: string;
  articleId?: string;
  isLive?: boolean;
}

export interface CategoryTab {
  id: string;
  label: LocalizedString;
  slug: string;
}

export interface TrendingTag {
  id: string;
  name: LocalizedString;
  tag: string;
}

export interface WeatherInfo {
  city: LocalizedString;
  temp: string;
  condition: LocalizedString;
  iconName: string;
}
