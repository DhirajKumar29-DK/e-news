export interface LocalizedTimeAgo {
  en: string;
  hi: string;
}

/**
 * Calculates human-readable relative time (e.g. "Just now", "2 mins ago", "1 hour ago", "1 day ago")
 * dynamically based on publishedAt timestamp.
 */
export function formatTimeAgo(dateInput?: string | Date | null): LocalizedTimeAgo {
  if (!dateInput) {
    return { en: 'Just now', hi: 'Just now' };
  }
  
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const timestamp = date.getTime();
  
  if (isNaN(timestamp)) {
    return { en: 'Just now', hi: 'Just now' };
  }

  const now = Date.now();
  const diffMs = Math.max(0, now - timestamp);
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) {
    return { en: 'Just now', hi: 'Just now' };
  }
  if (diffMins === 1) {
    return { en: '1 min ago', hi: '1 min ago' };
  }
  if (diffMins < 60) {
    return { en: `${diffMins} mins ago`, hi: `${diffMins} mins ago` };
  }
  if (diffHours === 1) {
    return { en: '1 hour ago', hi: '1 hour ago' };
  }
  if (diffHours < 24) {
    return { en: `${diffHours} hours ago`, hi: `${diffHours} hours ago` };
  }
  if (diffDays === 1) {
    return { en: '1 day ago', hi: '1 day ago' };
  }
  if (diffDays < 7) {
    return { en: `${diffDays} days ago`, hi: `${diffDays} days ago` };
  }
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    const label = weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    return {
      en: label,
      hi: label
    };
  }
  const months = Math.floor(diffDays / 30);
  const monthLabel = months <= 1 ? '1 month ago' : `${months} months ago`;
  return {
    en: monthLabel,
    hi: monthLabel
  };
}

export function formatTimeAgoString(dateInput?: string | Date | null): string {
  return formatTimeAgo(dateInput).en;
}
