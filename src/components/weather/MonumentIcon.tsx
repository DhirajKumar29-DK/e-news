'use client';

import React from 'react';

interface MonumentIconProps {
  type?: string;
  className?: string;
}

export const MonumentIcon: React.FC<MonumentIconProps> = ({ type = 'arch', className = 'w-12 h-10 text-slate-800' }) => {
  const t = (type || '').toLowerCase();

  // 1. Mumbai: Gateway of India
  if (t === 'gateway-of-india' || t.includes('mumbai') || t === 'gateway') {
    return (
      <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="6" y1="64" x2="94" y2="64" strokeWidth="2.8" />
        <rect x="16" y="26" width="15" height="38" />
        <path d="M16 26 L23.5 15 L31 26 Z" />
        <line x1="23.5" y1="15" x2="23.5" y2="9" />
        <circle cx="23.5" cy="8" r="1.5" fill="currentColor" />
        <rect x="69" y="26" width="15" height="38" />
        <path d="M69 26 L76.5 15 L84 26 Z" />
        <line x1="76.5" y1="15" x2="76.5" y2="9" />
        <circle cx="76.5" cy="8" r="1.5" fill="currentColor" />
        <line x1="31" y1="26" x2="69" y2="26" strokeWidth="2.5" />
        <path d="M38 64 V38 C38 27 62 27 62 38 V64" />
        <path d="M42 26 C42 16 58 16 58 26" />
        <circle cx="50" cy="11" r="2" fill="currentColor" />
      </svg>
    );
  }

  // 2. Hyderabad: Charminar
  if (t === 'charminar' || t.includes('hyderabad')) {
    return (
      <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="8" y1="64" x2="92" y2="64" strokeWidth="2.8" />
        {/* Minarets */}
        <rect x="14" y="14" width="7" height="50" />
        <circle cx="17.5" cy="9" r="3" />
        <line x1="17.5" y1="6" x2="17.5" y2="3" />
        <rect x="79" y="14" width="7" height="50" />
        <circle cx="82.5" cy="9" r="3" />
        <line x1="82.5" y1="6" x2="82.5" y2="3" />
        {/* Center Main Arch */}
        <rect x="21" y="24" width="58" height="40" />
        <path d="M34 64 V40 C34 26 66 26 66 40 V64" strokeWidth="2.4" />
        <line x1="21" y1="30" x2="79" y2="30" />
        <circle cx="50" cy="18" r="4.5" />
      </svg>
    );
  }

  // 3. Chennai: Ripon Building / Central Station Clock Tower
  if (t === 'central-station' || t.includes('chennai') || t === 'ripon') {
    return (
      <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="8" y1="64" x2="92" y2="64" strokeWidth="2.8" />
        {/* Wings */}
        <rect x="14" y="38" width="28" height="26" />
        <rect x="58" y="38" width="28" height="26" />
        <line x1="20" y1="48" x2="20" y2="58" />
        <line x1="28" y1="48" x2="28" y2="58" />
        <line x1="36" y1="48" x2="36" y2="58" />
        <line x1="64" y1="48" x2="64" y2="58" />
        <line x1="72" y1="48" x2="72" y2="58" />
        <line x1="80" y1="48" x2="80" y2="58" />
        {/* Central Clock Tower */}
        <rect x="42" y="18" width="16" height="46" />
        <circle cx="50" cy="28" r="4" />
        <line x1="50" y1="28" x2="52" y2="28" strokeWidth="1.5" />
        <path d="M42 18 L50 8 L58 18 Z" />
        <circle cx="50" cy="6" r="1.5" fill="currentColor" />
      </svg>
    );
  }

  // 4. Lucknow: Rumi Darwaza
  if (t === 'rumi-darwaza' || t.includes('lucknow')) {
    return (
      <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="8" y1="64" x2="92" y2="64" strokeWidth="2.8" />
        {/* Grand Mughal Arch */}
        <path d="M18 64 C18 30 32 12 50 12 C68 12 82 30 82 64" strokeWidth="2.4" />
        <path d="M30 64 C30 40 40 24 50 24 C60 24 70 40 70 64" />
        {/* Chhatri finial */}
        <path d="M46 12 L50 4 L54 12" />
        <circle cx="50" cy="3" r="1.5" fill="currentColor" />
        {/* Octagonal Side Bastions */}
        <rect x="14" y="32" width="8" height="32" />
        <rect x="78" y="32" width="8" height="32" />
      </svg>
    );
  }

  // 5. Jaipur: Hawa Mahal
  if (t === 'hawa-mahal' || t.includes('jaipur')) {
    return (
      <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="8" y1="64" x2="92" y2="64" strokeWidth="2.8" />
        {/* Pyramidal stepped structure */}
        <path d="M16 64 L24 20 L50 8 L76 20 L84 64 Z" />
        {/* Jharokhas / Windows */}
        <path d="M46 16 C46 12 54 12 54 16 V22 H46 Z" />
        <path d="M36 28 C36 24 44 24 44 28 V34 H36 Z" />
        <path d="M56 28 C56 24 64 24 64 28 V34 H56 Z" />
        <path d="M28 42 C28 38 36 38 36 42 V48 H28 Z" />
        <path d="M46 42 C46 38 54 38 54 42 V48 H46 Z" />
        <path d="M64 42 C64 38 72 38 72 42 V48 H64 Z" />
        <line x1="20" y1="52" x2="80" y2="52" />
      </svg>
    );
  }

  // 6. Indore: Rajwada Palace
  if (t === 'rajwada' || t.includes('indore')) {
    return (
      <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="8" y1="64" x2="92" y2="64" strokeWidth="2.8" />
        {/* Multi-story Maratha / Mughal facade */}
        <rect x="20" y="16" width="60" height="48" />
        <line x1="20" y1="28" x2="80" y2="28" />
        <line x1="20" y1="40" x2="80" y2="40" />
        <line x1="20" y1="52" x2="80" y2="52" />
        {/* Balconies & Windows */}
        <rect x="42" y="20" width="16" height="8" />
        <rect x="30" y="32" width="12" height="8" />
        <rect x="58" y="32" width="12" height="8" />
        <path d="M44 64 V52 C44 48 56 48 56 52 V64" />
        {/* Rooftop chhatris */}
        <path d="M22 16 L28 10 L34 16" />
        <path d="M66 16 L72 10 L78 16" />
        <circle cx="50" cy="12" r="3" />
      </svg>
    );
  }

  // 7. Kolkata: Howrah Bridge
  if (t === 'howrah-bridge' || t.includes('kolkata')) {
    return (
      <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="6" y1="58" x2="94" y2="58" strokeWidth="2.8" />
        <path d="M10 65 Q 25 62 40 65 T 70 65 T 90 65" strokeWidth="1.4" />
        {/* Cantilever Pylons */}
        <path d="M22 58 L29 16 L36 58" />
        <line x1="24" y1="42" x2="34" y2="42" />
        <path d="M64 58 L71 16 L78 58" />
        <line x1="66" y1="42" x2="76" y2="42" />
        {/* Truss cables */}
        <path d="M6 50 Q 29 16 50 38 Q 71 16 94 50" strokeWidth="2.2" />
        <line x1="29" y1="16" x2="50" y2="38" strokeDasharray="3 2" />
        <line x1="71" y1="16" x2="50" y2="38" strokeDasharray="3 2" />
      </svg>
    );
  }

  // 8. Pune: Shaniwar Wada
  if (t === 'shaniwar-wada' || t.includes('pune')) {
    return (
      <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="8" y1="64" x2="92" y2="64" strokeWidth="2.8" />
        {/* Massive Stone Fort Walls */}
        <rect x="14" y="28" width="72" height="36" />
        {/* Crenellations / Battlement tops */}
        <path d="M14 28 V24 H22 V28 H30 V24 H38 V28 H46 V24 H54 V28 H62 V24 H70 V28 H78 V24 H86 V28" />
        {/* Dilli Darwaza Arch */}
        <path d="M40 64 V42 C40 32 60 32 60 42 V64" strokeWidth="2.5" />
        {/* Side Bastions */}
        <circle cx="20" cy="46" r="3" />
        <circle cx="80" cy="46" r="3" />
      </svg>
    );
  }

  // 9. Agra: Taj Mahal
  if (t === 'taj-mahal' || t.includes('agra')) {
    return (
      <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="6" y1="64" x2="94" y2="64" strokeWidth="2.8" />
        {/* Outer 2 Minarets */}
        <line x1="12" y1="20" x2="12" y2="64" strokeWidth="2.2" />
        <circle cx="12" cy="18" r="2.5" />
        <line x1="88" y1="20" x2="88" y2="64" strokeWidth="2.2" />
        <circle cx="88" cy="18" r="2.5" />
        {/* Central Mausoleum */}
        <rect x="24" y="32" width="52" height="32" />
        {/* Grand Onion Dome */}
        <path d="M38 32 C38 14 50 10 50 8 C50 10 62 14 62 32" strokeWidth="2.2" />
        <line x1="50" y1="8" x2="50" y2="4" />
        {/* Side Domes */}
        <path d="M28 32 C28 24 34 24 34 32" />
        <path d="M66 32 C66 24 72 24 72 32" />
        {/* Grand Arch (Iwan) */}
        <path d="M42 64 V44 C42 36 58 36 58 44 V64" strokeWidth="2.2" />
      </svg>
    );
  }

  // 10. Ahmedabad: Sidi Saiyyed / Teen Darwaza
  if (t === 'teen-darwaza' || t.includes('ahmedabad')) {
    return (
      <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="8" y1="64" x2="92" y2="64" strokeWidth="2.8" />
        {/* 3 Arches (Teen Darwaza) */}
        <rect x="14" y="24" width="72" height="40" />
        {/* Left Arch */}
        <path d="M20 64 V44 C20 36 34 36 34 44 V64" />
        {/* Center Arch (Grand) */}
        <path d="M40 64 V38 C40 28 60 28 60 38 V64" strokeWidth="2.4" />
        {/* Right Arch */}
        <path d="M66 64 V44 C66 36 80 36 80 44 V64" />
        {/* Roof Cornice */}
        <line x1="12" y1="24" x2="88" y2="24" strokeWidth="2.5" />
        <circle cx="50" cy="18" r="3" />
      </svg>
    );
  }

  // 11. Surat: Surat Castle / Port & Diamond
  if (t === 'castle' || t.includes('surat')) {
    return (
      <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="8" y1="64" x2="92" y2="64" strokeWidth="2.8" />
        {/* Fortress Towers */}
        <rect x="18" y="26" width="16" height="38" />
        <rect x="66" y="26" width="16" height="38" />
        {/* Connecting Rampart */}
        <rect x="34" y="38" width="32" height="26" />
        <path d="M42 64 V50 C42 44 58 44 58 50 V64" />
        {/* Battlements */}
        <path d="M18 26 V22 H24 V26 H30 V22 H34 V26" />
        <path d="M66 26 V22 H72 V26 H78 V22 H82 V26" />
        <circle cx="50" cy="24" r="5" />
      </svg>
    );
  }

  // 12. Srinagar: Shikara Boat & Mountains
  if (t === 'shikara' || t.includes('srinagar')) {
    return (
      <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        {/* Mountains background */}
        <path d="M8 38 L28 16 L48 36 L70 12 L92 40" strokeDasharray="3 2" />
        <line x1="6" y1="63" x2="94" y2="63" strokeWidth="2.8" />
        {/* Shikara boat hull */}
        <path d="M14 55 Q 32 60 50 60 Q 76 60 88 50 L82 45 L24 47 Z" />
        {/* Canopy / Roof */}
        <path d="M34 47 L38 32 L66 32 L70 47" />
        <line x1="42" y1="32" x2="42" y2="47" />
        <line x1="62" y1="32" x2="62" y2="47" />
        <line x1="72" y1="36" x2="86" y2="63" />
      </svg>
    );
  }

  // 13. Guwahati: Tea Gardens & Kamakhya Temple
  if (t === 'tea-cup' || t.includes('guwahati') || t === 'kamakhya') {
    return (
      <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="8" y1="64" x2="92" y2="64" strokeWidth="2.8" />
        {/* Tea Cup & Aroma steam */}
        <path d="M30 30 H64 V48 C64 58 56 62 47 62 C38 62 30 58 30 48 Z" />
        <path d="M64 36 C72 36 74 44 64 48" />
        {/* Hot steam waves */}
        <path d="M38 24 Q 40 18 38 12" />
        <path d="M47 24 Q 49 16 47 10" />
        <path d="M56 24 Q 58 18 56 12" />
        {/* Green leaf */}
        <path d="M22 64 C22 52 32 50 32 50 C32 50 30 62 22 64" strokeWidth="1.8" />
      </svg>
    );
  }

  // 14. New Delhi: India Gate
  if (t === 'india-gate' || t.includes('delhi')) {
    return (
      <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="8" y1="64" x2="92" y2="64" strokeWidth="2.8" />
        <line x1="14" y1="60" x2="86" y2="60" />
        {/* Columns */}
        <rect x="22" y="24" width="14" height="36" />
        <rect x="64" y="24" width="14" height="36" />
        {/* Main Arch */}
        <path d="M36 60 V38 C36 26 64 26 64 38 V60" />
        {/* Attic & Cornice */}
        <rect x="18" y="14" width="64" height="6" />
        <rect x="24" y="8" width="52" height="6" />
        <ellipse cx="50" cy="7" rx="6" ry="1.5" />
      </svg>
    );
  }

  // 15. Noida: Modern High-rise Skyline & Tech Towers
  if (t === 'noida' || t.includes('noida') || t === 'towers') {
    return (
      <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="8" y1="64" x2="92" y2="64" strokeWidth="2.8" />
        {/* Left Skyscraper */}
        <rect x="18" y="26" width="18" height="38" />
        <line x1="24" y1="32" x2="24" y2="58" strokeDasharray="3 3" />
        <line x1="30" y1="32" x2="30" y2="58" strokeDasharray="3 3" />
        {/* Tall Center Spire Tower */}
        <rect x="42" y="14" width="20" height="50" />
        <line x1="52" y1="14" x2="52" y2="6" strokeWidth="2.2" />
        <line x1="48" y1="22" x2="48" y2="58" strokeDasharray="3 3" />
        <line x1="56" y1="22" x2="56" y2="58" strokeDasharray="3 3" />
        {/* Right Modern Tower */}
        <rect x="68" y="32" width="16" height="32" />
        <line x1="76" y1="38" x2="76" y2="58" strokeDasharray="3 3" />
      </svg>
    );
  }

  // 16. Bengaluru: Vidhana Soudha / Palace
  if (t === 'palace' || t.includes('bengaluru') || t.includes('bangalore')) {
    return (
      <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="8" y1="64" x2="92" y2="64" strokeWidth="2.8" />
        <rect x="16" y="34" width="68" height="30" />
        {/* Central Dome */}
        <path d="M40 34 C40 18 60 18 60 34" strokeWidth="2.2" />
        <line x1="50" y1="18" x2="50" y2="10" />
        <circle cx="50" cy="8" r="2" fill="currentColor" />
        {/* Pillars */}
        <line x1="32" y1="44" x2="32" y2="64" />
        <line x1="44" y1="44" x2="44" y2="64" />
        <line x1="56" y1="44" x2="56" y2="64" />
        <line x1="68" y1="44" x2="68" y2="64" />
      </svg>
    );
  }

  // Default Fallback Arch
  return (
    <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="8" y1="64" x2="92" y2="64" strokeWidth="2.8" />
      <rect x="18" y="24" width="64" height="40" />
      <path d="M34 64 V40 C34 28 50 20 50 20 C50 20 66 28 66 40 V64" strokeWidth="2.4" />
      <circle cx="50" cy="10" r="2" fill="currentColor" />
    </svg>
  );
};
