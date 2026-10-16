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
