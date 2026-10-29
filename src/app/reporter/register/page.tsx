'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReporterRegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/reporter/login?mode=signup');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
