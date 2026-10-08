'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { mockHoroscopeSigns } from '@/data/mockNewsData';
import { ArrowRight, Heart, Briefcase, Activity, X } from 'lucide-react';

export const HoroscopeSection: React.FC = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const [selectedSign, setSelectedSign] = useState<typeof mockHoroscopeSigns[0] | null>(null);

  // High quality vector SVG illustrations matching the reference screenshot colors & style
  const renderZodiacIcon = (name: string) => {
    switch (name) {
      case 'ARIES':
        return (
          <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none">
            {/* Ram face */}
            <path d="M40 58C48 58 54 48 54 38C54 30 48 26 40 26C32 26 26 30 26 38C26 48 32 58 40 58Z" fill="#E07A48" stroke="#1E293B" strokeWidth="2.5" />
            <path d="M40 48C43 48 45 44 45 42H35C35 44 37 48 40 48Z" fill="#1E293B" />
            {/* Curved Blue Horns */}
            <path d="M28 30C22 24 16 26 14 34C12 42 18 48 24 44C28 41 28 34 24 34C20 34 18 38 20 40" stroke="#4A65B9" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M52 30C58 24 64 26 66 34C68 42 62 48 56 44C52 41 52 34 56 34C60 34 62 38 60 40" stroke="#4A65B9" strokeWidth="4.5" strokeLinecap="round" />
            {/* Eyes & Nose */}
            <circle cx="34" cy="36" r="2.5" fill="#1E293B" />
            <circle cx="46" cy="36" r="2.5" fill="#1E293B" />
            <ellipse cx="40" cy="42" rx="3" ry="2" fill="#1E293B" />
          </svg>
        );
      case 'TAURUS':
        return (
          <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none">
            {/* Bull face */}
            <path d="M40 60C49 60 56 50 56 38C56 28 49 26 40 26C31 26 24 28 24 38C24 50 31 60 40 60Z" fill="#818CF8" stroke="#1E293B" strokeWidth="2.5" />
            {/* White Horns */}
            <path d="M25 30C20 20 22 10 28 14C34 18 30 26 26 28" fill="#F8FAFC" stroke="#1E293B" strokeWidth="2.5" />
            <path d="M55 30C60 20 58 10 52 14C46 18 50 26 54 28" fill="#F8FAFC" stroke="#1E293B" strokeWidth="2.5" />
            {/* Pink Ears */}
            <ellipse cx="18" cy="38" rx="6" ry="3" fill="#F472B6" stroke="#1E293B" strokeWidth="2" transform="rotate(-15 18 38)" />
            <ellipse cx="62" cy="38" rx="6" ry="3" fill="#F472B6" stroke="#1E293B" strokeWidth="2" transform="rotate(15 62 38)" />
            {/* Face features */}
            <circle cx="34" cy="36" r="2.5" fill="#1E293B" />
            <circle cx="46" cy="36" r="2.5" fill="#1E293B" />
            <ellipse cx="40" cy="46" rx="7" ry="4" fill="#6366F1" stroke="#1E293B" strokeWidth="2" />
            <circle cx="37" cy="46" r="1.5" fill="#1E293B" />
            <circle cx="43" cy="46" r="1.5" fill="#1E293B" />
          </svg>
        );
      case 'GEMINI':
        return (
          <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none">
            {/* Left Twin (Teal/Blue) */}
            <path d="M26 24C20 24 16 32 18 42C20 52 28 58 36 56C36 46 34 38 28 32C32 30 30 24 26 24Z" fill="#2DD4BF" stroke="#1E293B" strokeWidth="2.5" />
            {/* Right Twin (Purple/Pink) */}
            <path d="M50 24C56 24 60 32 58 42C56 52 48 58 40 56C40 46 42 38 48 32C44 30 46 24 50 24Z" fill="#F472B6" stroke="#1E293B" strokeWidth="2.5" />
          </svg>
        );
      case 'CANCER':
        return (
          <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none">
            {/* Crab Body */}
            <ellipse cx="40" cy="44" rx="16" ry="11" fill="#F87171" stroke="#1E293B" strokeWidth="2.5" />
            {/* Claws */}
            <path d="M26 38C18 30 16 18 28 22C32 26 28 34 26 38Z" fill="#EF4444" stroke="#1E293B" strokeWidth="2.5" />
            <path d="M54 38C62 30 64 18 52 22C48 26 52 34 54 38Z" fill="#EF4444" stroke="#1E293B" strokeWidth="2.5" />
            {/* Eyes */}
            <circle cx="34" cy="40" r="2.5" fill="#1E293B" />
            <circle cx="46" cy="40" r="2.5" fill="#1E293B" />
            {/* Legs */}
            <path d="M24 46L16 48M25 50L18 54M56 46L64 48M55 50L62 54" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );
      case 'LEO':
        return (
          <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none">
            {/* Mane */}
            <circle cx="40" cy="40" r="24" fill="#F59E0B" stroke="#1E293B" strokeWidth="2.5" />
            {/* Face */}
            <circle cx="40" cy="42" r="15" fill="#FBBF24" stroke="#1E293B" strokeWidth="2" />
            {/* Nose & Eyes */}
            <circle cx="34" cy="38" r="2.5" fill="#1E293B" />
            <circle cx="46" cy="38" r="2.5" fill="#1E293B" />
            <path d="M37 44L43 44L40 48Z" fill="#D97706" stroke="#1E293B" strokeWidth="1.5" />
          </svg>
        );
      case 'VIRGO':
        return (
          <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none">
            {/* Blue Hair & Girl Face */}
            <path d="M24 40C24 24 32 18 40 18C48 18 56 24 56 40C56 50 50 60 40 60C30 60 24 50 24 40Z" fill="#38BDF8" stroke="#1E293B" strokeWidth="2.5" />
            <circle cx="40" cy="38" r="11" fill="#FED7AA" stroke="#1E293B" strokeWidth="2" />
            {/* Sleeping eyes */}
            <path d="M34 38C35 40 37 40 38 38M42 38C43 40 45 40 46 38" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
            <path d="M36 44C38 46 42 46 44 44" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'LIBRA':
        return (
          <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none">
            {/* Stand */}
            <path d="M20 58H60" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M40 22V58" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M22 30L40 22L58 30" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
            {/* Scale Pans */}
            <path d="M22 30L16 42H28L22 30Z" fill="#F59E0B" stroke="#1E293B" strokeWidth="2" />
            <path d="M58 30L52 42H64L58 30Z" fill="#F59E0B" stroke="#1E293B" strokeWidth="2" />
          </svg>
        );
      case 'SCORPIO':
        return (
          <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none">
            {/* Body */}
            <path d="M36 56C36 62 44 62 48 58C52 54 52 46 44 42L40 38" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
            {/* Stinger */}
            <path d="M48 58L54 62L52 54Z" fill="#B91C1C" stroke="#1E293B" strokeWidth="1.5" />
            {/* Pincers */}
            <path d="M28 32C20 26 24 16 34 22C36 28 30 34 28 32Z" fill="#F87171" stroke="#1E293B" strokeWidth="2" />
            <path d="M52 32C60 26 56 16 46 22C44 28 50 34 52 32Z" fill="#F87171" stroke="#1E293B" strokeWidth="2" />
          </svg>
        );
      case 'SAGITTARIUS':
        return (
          <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none">
            {/* Bow & Arrow */}
            <path d="M22 58L58 22" stroke="#F97316" strokeWidth="4" strokeLinecap="round" />
            <path d="M42 22H58V38" stroke="#F97316" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M26 34C36 34 46 44 46 54" stroke="#8B5CF6" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </svg>
        );
      case 'CAPRICORN':
        return (
          <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none">
            {/* Goat Head */}
            <path d="M40 58C48 58 54 48 54 38C54 30 48 26 40 26C32 26 26 30 26 38C26 48 32 58 40 58Z" fill="#60A5FA" stroke="#1E293B" strokeWidth="2.5" />
            {/* Long Horns */}
            <path d="M30 28C26 14 34 12 36 24" stroke="#1D4ED8" strokeWidth="4" strokeLinecap="round" />
            <path d="M50 28C54 14 46 12 44 24" stroke="#1D4ED8" strokeWidth="4" strokeLinecap="round" />
            <circle cx="34" cy="36" r="2.5" fill="#1E293B" />
            <circle cx="46" cy="36" r="2.5" fill="#1E293B" />
          </svg>
        );
      case 'AQUARIUS':
        return (
          <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none">
            {/* Jug */}
            <path d="M44 20L32 30V40" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
            <path d="M26 26C20 20 38 16 42 28L36 38" fill="#FBBF24" stroke="#1E293B" strokeWidth="2" />
            {/* Water Waves */}
            <path d="M20 48C28 44 32 52 40 48C48 44 52 52 60 48" stroke="#0EA5E9" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M20 56C28 52 32 60 40 56C48 52 52 60 60 56" stroke="#0EA5E9" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        );
      case 'PISCES':
        return (
          <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none">
            {/* Two Fish */}
            <path d="M22 28C34 28 36 42 22 54C38 50 38 32 22 28Z" fill="#3B82F6" stroke="#1E293B" strokeWidth="2" />
            <path d="M58 28C46 28 44 42 58 54C42 50 42 32 58 28Z" fill="#60A5FA" stroke="#1E293B" strokeWidth="2" />
            <path d="M18 41H62" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getPrediction = (name: string) => {
    const predictions: Record<string, { love: string; career: string; health: string; luckyNo: string; color: string }> = {
      ARIES: {
        love: 'Strong emotional bonds flourish today. Open communication strengthens ties.',
        career: 'A breakthrough opportunity at work requires quick, decisive action.',
        health: 'Energy levels are high; ideal day for outdoor workouts.',
        luckyNo: '7',
        color: 'Crimson Red'
      },
      TAURUS: {
        love: 'Patience and warmth will resolve any minor misunderstandings.',
        career: 'Financial gains are indicated through long-term investments.',
        health: 'Maintain a balanced diet and stay well hydrated.',
        luckyNo: '4',
        color: 'Emerald Green'
      },
      GEMINI: {
        love: 'Charm and wit attract exciting new social connections.',
        career: 'Creative ideas presented in meetings will receive applause.',
        health: 'Incorporate mindfulness or meditation to calm busy thoughts.',
        luckyNo: '5',
        color: 'Golden Yellow'
      },
      CANCER: {
        love: 'Deep intuitive feelings guide heart-centered conversations.',
        career: 'Focus on teamwork to accomplish major project milestones.',
        health: 'Rest and adequate sleep will revitalize your energy.',
        luckyNo: '2',
        color: 'Silver White'
      },
      LEO: {
        love: 'Your natural charisma shines bright, drawing admiration.',
        career: 'Leadership qualities are recognized by senior management.',
        health: 'Vigorous physical activity keeps your stamina prime.',
        luckyNo: '1',
        color: 'Royal Gold'
      },
      VIRGO: {
        love: 'Thoughtful gestures bring unexpected joy to your loved ones.',
        career: 'Attention to detail prevents potential project errors.',
        health: 'Light stretching relieves neck and shoulder tension.',
        luckyNo: '6',
        color: 'Navy Blue'
      },
      LIBRA: {
        love: 'Harmony and balance reign in all personal relationships.',
        career: 'Negotiations yield favorable outcomes for new business deals.',
        health: 'Maintain inner calm with yoga or nature walks.',
        luckyNo: '8',
        color: 'Rose Pink'
      },
      SCORPIO: {
        love: 'Passionate moments create unforgettable memories today.',
        career: 'Strategic focus reveals hidden insights in complex tasks.',
        health: 'Detoxifying herbal tea will boost digestion.',
        luckyNo: '9',
        color: 'Deep Maroon'
      },
      SAGITTARIUS: {
        love: 'An adventurous spirit inspires romantic road trips or outings.',
        career: 'New learning opportunities expand your career horizons.',
        health: 'Fresh air and brisk walking enhance vitality.',
        luckyNo: '3',
        color: 'Purple'
      },
      CAPRICORN: {
        love: 'Stability and mutual respect build lasting harmony.',
        career: 'Disciplined effort leads to a significant career milestone.',
        health: 'Joint mobility exercises enhance physical strength.',
        luckyNo: '10',
        color: 'Charcoal Grey'
      },
      AQUARIUS: {
        love: 'Original thoughts and spontaneous plans excite your partner.',
        career: 'Tech innovation or brainstorming yields brilliant solutions.',
        health: 'Hydration and eye rest from screens is essential.',
        luckyNo: '11',
        color: 'Electric Blue'
      },
      PISCES: {
        love: 'Empathy and deep understanding create a soothing bond.',
        career: 'Intuitive instincts guide successful creative endeavors.',
        health: 'Calming music and warm baths rejuvenate your spirit.',
        luckyNo: '12',
        color: 'Seafoam Green'
      }
    };

    return predictions[name] || predictions.ARIES;
  };

  return (
    <section 
      className="w-full bg-[#E43854] dark:bg-slate-900 py-10 my-8 relative overflow-hidden border-y border-red-600/30"
      style={{
        backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(0, 0, 0, 0.05) 18px, rgba(0, 0, 0, 0.05) 36px)'
      }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 text-white relative z-10 space-y-6">
        
        {/* Top Header: HOROSCOPE title with embedded Zodiac Wheel icon & right circle arrow */}
        <div className="flex items-center justify-between border-b border-white/20 pb-5">
          <div className="flex items-center space-x-2">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-serif uppercase tracking-wider text-white flex items-center">
              <span>HOROSC</span>
              {/* Zodiac Wheel Emblem inside the 'O' */}
              <span className="inline-flex items-center justify-center mx-1">
                <svg className="w-9 h-9 sm:w-11 sm:h-11" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="18" fill="#D92645" stroke="#FFFFFF" strokeWidth="3" />
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
            className="w-11 h-11 rounded-full bg-white text-[#E43854] hover:bg-white/90 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            title="Explore Daily Horoscope"
          >
            <ArrowRight className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* 6x2 Grid = 12 Zodiac Sign Cards (Stretched 1440px Layout) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5 lg:gap-6 w-full">
          {mockHoroscopeSigns.map((sign) => (
            <div
              key={sign.name}
              onClick={() => setSelectedSign(sign)}
              title={`Rashi ${sign.name.charAt(0) + sign.name.slice(1).toLowerCase()}`}
              className="bg-white rounded-2xl p-5 text-center transition-all duration-200 hover:-translate-y-1.5 cursor-pointer flex flex-col items-center justify-center group min-h-[160px]"
            >
              {/* Vector Icon */}
              <div className="mb-2.5 group-hover:scale-110 transition-transform duration-200">
                {renderZodiacIcon(sign.name)}
              </div>
              
              {/* Title */}
              <h3 className="text-base sm:text-lg font-black font-serif tracking-wide text-slate-900 uppercase">
                {sign.name}
              </h3>
              
              {/* Date */}
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-tight mt-1">
                {sign.date}
              </p>
            </div>
          ))}
        </div>

      </div>

      {/* Interactive Daily Prediction Modal */}
      {selectedSign && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 text-slate-900 dark:text-white space-y-6">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedSign(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-white hover:bg-[#E43854] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center space-x-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                {renderZodiacIcon(selectedSign.name)}
              </div>
              <div>
                <span className="text-xs font-mono text-[#E43854] block font-bold">{selectedSign.date}</span>
                <h3 className="text-2xl font-black font-serif text-slate-900 dark:text-white uppercase tracking-wide">
                  {selectedSign.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Daily Astrological Forecast</p>
              </div>
            </div>

            {/* Reading Details */}
            {(() => {
              const pred = getPrediction(selectedSign.name);
              return (
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="flex items-center space-x-2 text-rose-600 font-bold">
                      <Heart className="w-4 h-4 fill-rose-600" />
                      <span>Love & Relationships</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{pred.love}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="flex items-center space-x-2 text-amber-600 font-bold">
                      <Briefcase className="w-4 h-4 fill-amber-600" />
                      <span>Career & Finance</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{pred.career}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-800 space-y-1">
                    <div className="flex items-center space-x-2 text-emerald-600 font-bold">
                      <Activity className="w-4 h-4" />
                      <span>Health & Vitality</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{pred.health}</p>
                  </div>

                  {/* Lucky Attributes */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-500">Lucky Number: </span>
                      <span className="font-mono font-bold text-[#E43854]">{pred.luckyNo}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Lucky Color: </span>
                      <span className="font-semibold text-[#E43854]">{pred.color}</span>
                    </div>
                  </div>

                  {/* Read Full Article Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setSelectedSign(null);
                        router.push('/article/horoscope-1');
                      }}
                      className="w-full py-3 bg-[#E43854] hover:bg-[#c92540] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <span>Read Today's Full Horoscope Article</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })()}

          </div>
        </div>
      )}

    </section>
  );
};
