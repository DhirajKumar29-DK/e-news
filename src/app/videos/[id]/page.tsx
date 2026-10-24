'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idOrSlug = typeof params?.id === 'string' ? params.id : '';

  useEffect(() => {
    if (idOrSlug) {
      router.replace(`/videos?v=${encodeURIComponent(idOrSlug)}`);
    } else {
      router.replace('/videos');
    }
  }, [idOrSlug, router]);

  return (
    <div className="min-h-screen bg-[#070b13] flex flex-col items-center justify-center text-white space-y-3">
      <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-mono text-slate-400">Loading video...</span>
    </div>
  );
}
