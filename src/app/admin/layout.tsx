'use client';

import React from 'react';
import { AdminAuthProvider } from '@/context/AdminAuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <div translate="no" className="notranslate w-full h-full min-h-screen">
        {children}
      </div>
    </AdminAuthProvider>
  );
}
