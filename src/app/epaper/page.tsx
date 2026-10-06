'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { EPaperModal } from '@/components/common/EPaperModal';

export default function EPaperPageRoute() {
  const router = useRouter();
  
  return (
    <EPaperModal
      isOpen={true}
      onClose={() => router.push('/')}
    />
  );
}
