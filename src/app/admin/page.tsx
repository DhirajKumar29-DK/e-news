'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';

function AdminRootInner() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAdminAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/admin/dashboard');
      } else {
        router.push('/admin/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-sans">
      <div className="flex items-center space-x-3 text-sm font-semibold">
        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Redirecting to Admin Portal...</span>
      </div>
    </div>
  );
}

export default function AdminRootPage() {
  return (
    <AdminAuthProvider>
      <AdminRootInner />
    </AdminAuthProvider>
  );
}
