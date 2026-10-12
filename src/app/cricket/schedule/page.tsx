'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header, Footer, SearchModal, MobileBottomNav } from '@/components/common';
import { LiveScoreStrip, CricketNewsSection } from '@/components/cricket';
import { cricketService } from '@/services/cricketService';
import { CricketMatch } from '@/types/cricket';
import { Calendar, ArrowLeft, MapPin, Clock, ShieldCheck } from 'lucide-react';

export default function SchedulePage() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch ONLY pure upcoming schedule filtered for Team India (1 month) and marquee tournaments
    cricketService.getMatches('upcoming', 'all', 'schedule').then((data) => {
      setMatches(data);
      setLoading(false);
    });
  }, []);

  const handleSelectCategory = (slug: string) => {
    if (slug === 'all') router.push('/');
    else if (slug === 'cricket') router.push('/cricket');
    else router.push(`/${slug}`);
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        activeCategory="cricket"
        onSelectCategory={handleSelectCategory}
      />

      <LiveScoreStrip />

      <div className="max-w-7xl mx-auto px-4 py-6 w-full space-y-6 flex-1">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <Link href="/cricket" className="hover:text-white flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Cricket Center
          </Link>
          <span className="flex items-center gap-1.5 text-[11px] text-amber-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> Official BCCI & ICC Schedule
          </span>
        </div>

        {/* Section Header */}
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Calendar className="w-6 h-6 text-red-500" />
            Cricket Schedule & Upcoming Fixtures
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1.5">
            Upcoming Team India matches (Next 1 Month), IPL, T20 World Cup, 50-50 World Cup & ICC Marquee Events (Men & Women)
          </p>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400 animate-pulse space-y-2">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Loading upcoming schedule...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Upcoming Fixtures Right Now</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Upcoming Team India matches and major tournaments (IPL, World Cup) will automatically appear here once scheduled.
            </p>
          </div>
        ) : (
          /* Matches Grid - Pure Schedule Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {matches.map((m) => (
              <Link
                key={m.id}
                href={`/cricket/match/${m.id}`}
                className="group bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-red-500/50 rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between shadow-lg space-y-4"
              >
                <div className="space-y-3">
                  {/* Series & Scheduled Badge */}
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                    <span className="font-semibold text-slate-200 truncate max-w-[200px]">{m.series}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      UPCOMING
                    </span>
                  </div>

                  {/* Match Date & Time */}
                  <div className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5 bg-slate-800/50 px-2.5 py-1 rounded-lg w-fit border border-slate-700/50">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>{m.startTime}</span>
                  </div>

                  {/* Team 1 */}
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                      <img
                        src={m.team1.logo}
                        alt={m.team1.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-700 shadow-sm"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://flagcdn.com/w40/in.png';
                        }}
                      />
                      <span className="font-bold text-sm text-white group-hover:text-red-400 transition-colors">
                        {m.team1.name}
                      </span>
                    </div>
                  </div>

                  {/* VS divider */}
                  <div className="text-center text-[10px] font-black uppercase text-slate-500 tracking-widest -my-1">
                    VS
                  </div>

                  {/* Team 2 */}
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                      <img
                        src={m.team2.logo}
                        alt={m.team2.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-700 shadow-sm"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://flagcdn.com/w40/in.png';
                        }}
                      />
                      <span className="font-bold text-sm text-white group-hover:text-red-400 transition-colors">
                        {m.team2.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer: Status Text & Venue */}
                <div className="space-y-1.5 pt-3 border-t border-slate-800 text-xs">
                  <div className="font-semibold text-amber-300 text-[11px]">
                    {m.statusText}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{m.venue}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <CricketNewsSection />
      </div>

      <Footer />
      <MobileBottomNav />
      {isSearchOpen && <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />}
    </main>
  );
}
