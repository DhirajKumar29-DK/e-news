'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockHoroscopeSigns } from '@/data/mockNewsData';
import { horoscopeService, HoroscopeData } from '@/services/horoscopeService';
import { ArrowRight } from 'lucide-react';

export const HoroscopeSection: React.FC = () => {
  const router = useRouter();
  const [allSignsMap, setAllSignsMap] = useState<Record<string, HoroscopeData>>({});

  // Fetch all signs from backend to get dynamic images and updates
  useEffect(() => {
    let isMounted = true;
    async function loadAllSigns() {
      try {
        const data = await horoscopeService.getAllHoroscopes('DAILY');
        if (isMounted && Array.isArray(data)) {
          const map: Record<string, HoroscopeData> = {};
          data.forEach((item) => {
            if (item.sign) {
              map[item.sign.toLowerCase()] = item;
            }
          });
          setAllSignsMap(map);
        }
      } catch (err) {
        console.error('Error fetching dynamic horoscopes on homepage:', err);
      }
    }
    loadAllSigns();
    return () => { isMounted = false; };
  }, []);

  const isValidImageUrl = (url?: string | null) => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') || url.startsWith('data:');
  };

  const getSignImage = (signKey: string) => {
    const s = signKey.toLowerCase();
    const signData = allSignsMap[s];
    if (signData) {
      const dynamicUrl = signData.iconUrl || (signData as any).image || (isValidImageUrl(signData.hindiName) ? signData.hindiName : null);
      if (dynamicUrl && isValidImageUrl(dynamicUrl)) return dynamicUrl;
    }
    return `/images/zodiac/${s}.jpg`;
  };

  const handleSignClick = (signName: string) => {
    // Navigate directly to the sign's forecast page without popup modal
    router.push(`/horoscope?sign=${signName.toLowerCase()}`);
  };

  return (
    <section 
      className="w-full bg-gradient-to-r from-[#5C0E1A] via-[#6B111E] to-[#4A0A12] dark:bg-slate-900 py-10 my-8 relative overflow-hidden border-y border-red-950/40 shadow-xl"
    >
      {/* Subtle Constellation Dot Grid Pattern */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 text-white relative z-10 space-y-6">
        
        {/* Top Header: HOROSCOPE title with embedded Zodiac Wheel icon & right circle arrow */}
        <div className="flex items-center justify-between border-b border-white/20 pb-5">
          <div className="flex items-center space-x-2">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-serif uppercase tracking-wider text-white flex items-center">
              <span>HOROSC</span>
              {/* Zodiac Wheel Emblem inside the 'O' */}
              <span className="inline-flex items-center justify-center mx-1">
                <svg className="w-9 h-9 sm:w-11 sm:h-11" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="18" fill="#8E192B" stroke="#FFFFFF" strokeWidth="3" />
                  <circle cx="20" cy="20" r="12" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="2 2" />
                  <path d="M20 5V35M5 20H35M9 9L31 31M9 31L31 9" stroke="#FFFFFF" strokeWidth="1.5" />
                  <circle cx="20" cy="20" r="4" fill="#FFFFFF" />
                </svg>
              </span>
              <span>PE</span>
            </h2>
          </div>

          {/* Right White Circle Arrow Button */}
          <button
            onClick={() => router.push('/horoscope')}
            className="w-11 h-11 rounded-full bg-white text-[#8E192B] hover:bg-white/90 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md cursor-pointer"
            title="Explore Daily Horoscope"
          >
            <ArrowRight className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* 6x2 Grid = 12 Zodiac Sign Cards - Direct Navigation to Sign Forecast (NO POPUP) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5 lg:gap-6 w-full">
          {mockHoroscopeSigns.map((sign) => {
            const signKey = sign.name.toLowerCase();
            const imgSrc = getSignImage(signKey);
            return (
              <div
                key={sign.name}
                onClick={() => handleSignClick(sign.name)}
                title={`Read ${sign.name} Daily Horoscope`}
                className="bg-white rounded-2xl p-4 sm:p-5 text-center transition-all duration-200 hover:-translate-y-1.5 cursor-pointer flex flex-col items-center justify-center group min-h-[160px] shadow-md hover:shadow-2xl hover:border-amber-400 border border-transparent"
              >
                {/* Circular Medallion Avatar with Dynamic Backend Image / 3D Medallion */}
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 border-amber-400/50 p-0.5 bg-[#FFF5F7] group-hover:scale-110 group-hover:ring-2 group-hover:ring-amber-400 transition-all mb-2.5 overflow-hidden shadow-sm flex items-center justify-center">
                  <img
                    src={imgSrc}
                    alt={sign.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                
                {/* Title */}
                <h3 className="text-sm sm:text-base font-black font-serif tracking-wide text-slate-900 uppercase group-hover:text-[#8E192B] transition-colors">
                  {sign.name}
                </h3>
                
                {/* Date */}
                <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-tight mt-0.5">
                  {sign.date}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
