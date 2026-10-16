'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { MobileBottomNav } from './MobileBottomNav';
import { SearchModal } from './SearchModal';

export const GlobalMobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Never render mobile bottom nav on Admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <MobileBottomNav onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
