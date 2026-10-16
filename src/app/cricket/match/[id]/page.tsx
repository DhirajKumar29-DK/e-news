'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header, Footer, SearchModal, MobileBottomNav } from '@/components/common';
import {
  MatchHeroBanner,
  CreaseWidget,
  MatchScorecard,
  LiveCommentary,
  MatchSquads,
  MatchInfo
} from '@/components/cricket';
import { cricketService } from '@/services/cricketService';
import {
  CricketMatch,
  LiveCreaseData,
  ScorecardData,
  CommentaryItem,
  MatchInfoData
} from '@/types/cricket';

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
    }
  }, [matchId]);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 8000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  const handleSelectCategory = (slug: string) => {
    if (slug === 'all') router.push('/');
    else if (slug === 'cricket') router.push('/cricket');
    else router.push(`/${slug}`);
  };

  if (loading && !scorecard && !liveData) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-full bg-red-600 animate-ping" />
          <span className="text-sm font-semibold text-slate-700">Loading live scorecard...</span>
        </div>
      </div>
    );
  }

  const inn1 = scorecard?.innings?.[0];
  const inn2 = scorecard?.innings?.[1];

  const statusTextLower = (scorecard?.statusText || liveData?.match?.statusText || '').toLowerCase();
  const isUpcoming = statusTextLower.includes('begins') || statusTextLower.includes('starts') || statusTextLower.includes('upcoming');
  const isCompleted = statusTextLower.includes('won') || statusTextLower.includes('beat') || statusTextLower.includes('tied') || statusTextLower.includes('drawn') || statusTextLower.includes('result');

  const resolvedStatus: 'LIVE' | 'UPCOMING' | 'COMPLETED' = liveData?.match?.status || (isUpcoming ? 'UPCOMING' : (isCompleted ? 'COMPLETED' : 'LIVE'));

  const match: CricketMatch = liveData?.match || {
    id: matchId,
    series: scorecard?.series || matchInfo?.series || 'Cricket Match',
    matchTitle: scorecard?.matchTitle || matchInfo?.matchTitle || 'Match',
    matchType: 'Cricket',
    status: resolvedStatus,
    statusText: scorecard?.statusText || (isUpcoming ? 'Match begins soon' : 'Match in progress'),
    venue: scorecard?.venue || matchInfo?.venue || 'Stadium',
    startTime: matchInfo?.dateTime || 'Today',
    isLive: resolvedStatus === 'LIVE',
    team1: {
      name: inn1?.teamName || matchInfo?.teams?.team1?.name || 'Team 1',
      shortName: inn1?.teamShort || matchInfo?.teams?.team1?.shortName || 'T1',
      score: inn1?.totalScore || '-',
      overs: inn1?.overs || '',
      wickets: 0,
      runs: 0,
      logo: inn1?.teamLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(matchInfo?.teams?.team1?.name || 'Team 1')}&background=0284c7&color=ffffff&bold=true&size=128`,
      isBatting: false
    },
    team2: {
      name: inn2?.teamName || matchInfo?.teams?.team2?.name || (inn1 ? 'Opposition' : 'Team 2'),
      shortName: inn2?.teamShort || matchInfo?.teams?.team2?.shortName || 'T2',
      score: inn2?.totalScore || (resolvedStatus === 'UPCOMING' ? '-' : 'Yet to bat'),
      overs: inn2?.overs || '',
      wickets: 0,
      runs: 0,
      logo: inn2?.teamLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(matchInfo?.teams?.team2?.name || 'Team 2')}&background=0284c7&color=ffffff&bold=true&size=128`,
      isBatting: false
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        activeCategory="cricket"
        onSelectCategory={handleSelectCategory}
      />

      <div className="max-w-[1320px] mx-auto px-3 sm:px-4 py-3 sm:py-5 w-full space-y-3 sm:space-y-5 flex-1">
        {/* Match Navigation Tabs (Exact Image 1 Style: Clean Red-Underline Tab Bar) */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 sm:px-6 gap-6 sm:gap-8 overflow-x-auto no-scrollbar rounded-xl shadow-xs">
          {[
            { id: 'scorecard', label: 'Full Scorecard' },
            { id: 'commentary', label: 'Commentary' },
            { id: 'squads', label: 'Playing XI' },
            { id: 'info', label: 'Match Info' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 text-xs sm:text-sm font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Hero Scoreboard Banner */}
        <MatchHeroBanner match={match} />

        {/* Crease Widget (Only for ongoing LIVE matches with active batters on crease) */}
        {match.status === 'LIVE' && liveData && liveData.currentBatters && liveData.currentBatters.length > 0 && (
          <CreaseWidget liveData={liveData} />
        )}

        {/* Tab Content Rendering */}
        <div>
          {activeTab === 'scorecard' && scorecard && (
            scorecard.innings.length > 0 ? (
              <MatchScorecard scorecard={scorecard} />
            ) : (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl text-center text-slate-500 dark:text-slate-400 text-sm border border-slate-200 dark:border-slate-800 shadow-xs">
                Match has not started yet. Scorecard will be live once the toss and first innings begin.
              </div>
            )
          )}
          {activeTab === 'commentary' && <LiveCommentary commentary={commentary} />}
          {activeTab === 'squads' && matchInfo && <MatchSquads info={matchInfo} />}
          {activeTab === 'info' && matchInfo && <MatchInfo info={matchInfo} />}
        </div>
      </div>

      <Footer />
      {isSearchOpen && <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />}
    </main>
  );
}
