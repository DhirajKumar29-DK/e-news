/**
 * Video helper utilities for URL normalization, YouTube ID extraction,
 * high-res thumbnail resolution, and embed player URLs across mobile and desktop.
 */

export function getYouTubeId(urlOrId?: string | null): string | null {
  if (!urlOrId) return null;
  const str = String(urlOrId).trim();
  
  // If already an 11-char YouTube ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }

  // Regex matching standard YouTube URL variations (shorts, watch, embed, youtu.be, live)
  const match = str.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([a-zA-Z0-9_-]{11})/
  );

  return match && match[1] ? match[1] : null;
}

export function getVideoThumbnail(
  video: {
    thumbnailUrl?: string | null;
    youtubeId?: string | null;
    videoUrl?: string | null;
  },
  quality: 'max' | 'mq' = 'max'
): string {
  if (video.thumbnailUrl && video.thumbnailUrl.trim()) {
    return video.thumbnailUrl;
  }
  const ytId = video.youtubeId || getYouTubeId(video.videoUrl);
  if (ytId) {
    return quality === 'max'
      ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`
      : `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;
  }
  return 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80';
}

export function buildVideoEmbedUrl(
  video: {
    youtubeId?: string | null;
    videoUrl?: string | null;
    videoType?: string | null;
  },
  options: {
    autoplay?: boolean;
    mute?: boolean;
    controls?: boolean;
  } = {}
): string {
  const ytId = video.youtubeId || getYouTubeId(video.videoUrl);

  if (ytId) {
    const params = new URLSearchParams();
    params.set('rel', '0');
    params.set('playsinline', '1'); // Essential for iOS and mobile browsers to play inline
    params.set('modestbranding', '1');
    params.set('enablejsapi', '1');

    if (typeof window !== 'undefined' && window.location.origin) {
      params.set('origin', window.location.origin);
    }

    if (options.autoplay) {
      params.set('autoplay', '1');
    }
    if (options.mute) {
      params.set('mute', '1');
    }
    if (options.controls === false) {
      params.set('controls', '0');
    }

    return `https://www.youtube.com/embed/${ytId}?${params.toString()}`;
  }

  return video.videoUrl || '';
}

/**
 * Strictly check if a video item is a YouTube Short / Vertical Reel
 */
export function isShortVideo(video?: {
  title?: string | null;
  videoUrl?: string | null;
  badge?: string | null;
  category?: string | null;
  subCategory?: string | null;
  tags?: string | null;
  duration?: string | null;
  durationSeconds?: number | null;
} | null): boolean {
  if (!video) return false;

  // 1. Explicit badge or categories
  if (video.badge && /^(SHORTS?|REELS?)$/i.test(video.badge.trim())) return true;
  if (video.category && /^shorts?$/i.test(video.category.trim())) return true;
  if (video.subCategory && /^shorts?$/i.test(video.subCategory.trim())) return true;

  // 2. URL containing /shorts/
  if (video.videoUrl && video.videoUrl.includes('/shorts/')) return true;

  // 3. Hashtags or keywords in title or tags
  if (video.title && (/#shorts?|#reels?/i.test(video.title) || /\bshorts?\b|\breels?\b/i.test(video.title))) return true;
  if (video.tags && /#?shorts?|#?reels?/i.test(video.tags)) return true;

  // 4. Duration under 65 seconds (via durationSeconds or mm:ss string)
  if (typeof video.durationSeconds === 'number' && video.durationSeconds > 0 && video.durationSeconds <= 65) {
    return true;
  }
  if (video.duration && typeof video.duration === 'string') {
    const parts = video.duration.trim().split(':').map(p => parseInt(p, 10));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const totalSec = parts[0] * 60 + parts[1];
      if (totalSec > 0 && totalSec <= 65) return true;
    }
  }

  return false;
}

/**
 * Strictly check if a video item is a regular long/horizontal news video
 */
export function isRegularVideo(video?: any): boolean {
  if (!video) return false;
  return !isShortVideo(video);
}
