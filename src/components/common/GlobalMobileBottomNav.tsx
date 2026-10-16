'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { MobileBottomNav } from './MobileBottomNav';
import { SearchModal } from './SearchModal';

export const GlobalMobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Never render mobile bottom nav on Admin pages or ePaper viewer
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/epaper')) {
    return null;
  }

  return (
    <>
      <MobileBottomNav onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
