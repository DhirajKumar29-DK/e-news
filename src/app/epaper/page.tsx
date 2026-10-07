'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Client-only dynamic import to prevent SSR hydration mismatch on canvas / URL parameters
const EPaperModal = dynamic(
  () => import('@/components/common/EPaperModal').then(mod => mod.EPaperModal),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 bg-[#f8fafc] flex flex-col items-center justify-center text-slate-800 space-y-4">
        <div className="w-10 h-10 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium tracking-wide text-slate-600">डिजिटल ई-पेपर लोड हो रहा है...</p>
      </div>
    )
  }
);

export default function EPaperPageRoute() {
  const router = useRouter();
  
  return (
    <EPaperModal
      isOpen={true}
      onClose={() => router.push('/')}
    />
  );
}
