'use client';

import { useParams } from 'next/navigation';
import VideosPage from '../page';

export default function VideoDetailPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';

  return <VideosPage initialVideoId={id} />;
}
