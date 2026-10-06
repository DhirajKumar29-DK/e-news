'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CategoryPage from '@/app/category/[slug]/page';

export default function HoroscopePageRoute() {
  return <CategoryPage />;
}
