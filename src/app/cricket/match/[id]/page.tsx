'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header, Footer, SearchModal, MobileBottomNav } from '@/components/common';
import {
  MatchHeroBanner,
  CreaseWidget,
  MatchScorecard,
  LiveCommentary,
  MatchSquads,
  MatchInfo,
  CricketNewsSection
} from '@/components/cricket';
import { cricketService } from '@/services/cricketService';
import {
  CricketMatch,
  LiveCreaseData,
  ScorecardData,
  CommentaryItem,
  MatchInfoData
} from '@/types/cricket';
import { FileText, Users, Info, ArrowLeft, RefreshCw, Radio } from 'lucide-react';

export default function MatchCenterPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = String(params?.id || '');

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'scorecard' | 'commentary' | 'squads' | 'info'>('scorecard');

  const [liveData, setLiveData] = useState<LiveCreaseData | null>(null);
  const [scorecard, setScorecard] = useState<ScorecardData | null>(null);
  const [commentary, setCommentary] = useState<CommentaryItem[]>([]);
  const [matchInfo, setMatchInfo] = useState<MatchInfoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllData = useCallback(async () => {
    if (!matchId) return;
    try {
      const [liveRes, scRes, commRes, infoRes] = await Promise.all([
        cricketService.getLiveMatch(matchId),
        cricketService.getScorecard(matchId),
        cricketService.getCommentary(matchId),
        cricketService.getMatchInfo(matchId)
      ]);
      setLiveData(liveRes);
      setScorecard(scRes);
      setCommentary(commRes);
      setMatchInfo(infoRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [matchId]);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 8000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  const handleSelectCategory = (slug: string) => {
    if (slug === 'all') router.push('/');
    else if (slug === 'cricket') router.push('/cricket');
    else router.push(`/${slug}`);
  };

  if (loading && !scorecard && !liveData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-full bg-red-600 animate-ping" />
          <span className="text-sm font-semibold">Loading live scorecard...</span>
        </div>
      </div>
    );
  }

  const inn1 = scorecard?.innings?.[0];
  const inn2 = scorecard?.innings?.[1];

  const match: CricketMatch = liveData?.match || {
    id: matchId,
    series: scorecard?.series || 'Cricket Match',
    matchTitle: scorecard?.matchTitle || 'Match',
    matchType: 'Cricket',
    status: 'LIVE',
    statusText: scorecard?.statusText || 'Match in progress',
    venue: scorecard?.venue || 'Stadium',
    startTime: 'Today',
    isLive: true,
    team1: {
      name: inn1?.teamName || 'Team 1',
      shortName: inn1?.teamShort || 'T1',
      score: inn1?.totalScore || '-',
      overs: inn1?.overs || '',
      wickets: 0,
      runs: 0,
      logo: inn1?.teamLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(inn1?.teamName || 'Team 1')}&background=1e293b&color=ffffff&bold=true&size=128`,
      isBatting: false
    },
    team2: {
      name: inn2?.teamName || (inn1 ? 'Opposition' : 'Team 2'),
      shortName: inn2?.teamShort || 'T2',
      score: inn2?.totalScore || 'Yet to bat',
      overs: inn2?.overs || '',
      wickets: 0,
      runs: 0,
      logo: inn2?.teamLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(inn2?.teamName || 'Team 2')}&background=1e293b&color=ffffff&bold=true&size=128`,
      isBatting: true
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        activeCategory="cricket"
        onSelectCategory={handleSelectCategory}
      />

      <div className="max-w-[1320px] mx-auto px-4 py-5 w-full space-y-6 flex-1">
        {/* Back Link & Refresh */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <Link href="/cricket" className="hover:text-white flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Cricket Hub
          </Link>

          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-red-500' : ''}`} />
            <span>{refreshing ? 'Updating...' : 'Live Refresh'}</span>
          </button>
        </div>

        {/* Hero Scoreboard Banner */}
        <MatchHeroBanner match={match} />

        {/* Crease Widget (If ongoing) */}
        {liveData && <CreaseWidget liveData={liveData} />}

        {/* Match Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/90 p-1.5 rounded-2xl gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'scorecard', label: 'Scorecard', icon: FileText },
            { id: 'commentary', label: 'Live Commentary', icon: Radio },
            { id: 'squads', label: 'Playing XI', icon: Users },
            { id: 'info', label: 'Match Info', icon: Info }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Rendering */}
        <div>
          {activeTab === 'scorecard' && scorecard && (
            scorecard.innings.length > 0 ? (
              <MatchScorecard scorecard={scorecard} />
            ) : (
              <div className="bg-slate-900 p-8 rounded-2xl text-center text-slate-400 text-sm border border-slate-800">
                Match has not started yet. Scorecard will be live once the toss and first innings begin.
              </div>
            )
          )}
          {activeTab === 'commentary' && <LiveCommentary commentary={commentary} />}
          {activeTab === 'squads' && matchInfo && <MatchSquads info={matchInfo} />}
          {activeTab === 'info' && matchInfo && <MatchInfo info={matchInfo} />}
        </div>

        {/* Match Related News */}
        <CricketNewsSection />
      </div>

      <Footer />
      <MobileBottomNav />
      {isSearchOpen && <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />}
    </main>
  );
}
