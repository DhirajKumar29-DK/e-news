import { apiRequest } from './api';
import {
  CricketMatch,
  LiveCreaseData,
  ScorecardData,
  CommentaryItem,
  MatchInfoData
} from '@/types/cricket';

export const cricketService = {
  async getMatches(
    type: 'all' | 'live' | 'upcoming' | 'recent' = 'all',
    category: 'all' | 'international' | 'domestic' | 'women' | 'league' = 'all',
    scope: string = ''
  ): Promise<CricketMatch[]> {
    try {
      const scopeParam = scope ? `&scope=${scope}` : '';
      const res = await apiRequest<{ success: boolean; data: CricketMatch[] }>(
        `/cricket/matches?type=${type}&category=${category}${scopeParam}`
      );
      return res.data || [];
    } catch (err) {
      console.error('Failed to get matches:', err);
      return [];
    }
  },

  async getLiveMatch(matchId: string): Promise<LiveCreaseData | null> {
    try {
      const res = await apiRequest<{ success: boolean; data: LiveCreaseData }>(`/cricket/match/${matchId}/live`);
      return res.data || null;
    } catch (err) {
      console.error('Failed to get live match data:', err);
      return null;
    }
  },

  async getScorecard(matchId: string): Promise<ScorecardData | null> {
    try {
      const res = await apiRequest<{ success: boolean; data: ScorecardData }>(`/cricket/match/${matchId}/scorecard`);
      return res.data || null;
    } catch (err) {
      console.error('Failed to get scorecard:', err);
      return null;
    }
  },

  async getCommentary(matchId: string): Promise<CommentaryItem[]> {
    try {
      const res = await apiRequest<{ success: boolean; data: CommentaryItem[] }>(`/cricket/match/${matchId}/commentary`);
      return res.data || [];
    } catch (err) {
      console.error('Failed to get commentary:', err);
      return [];
    }
  },

  async getMatchInfo(matchId: string): Promise<MatchInfoData | null> {
    try {
      const res = await apiRequest<{ success: boolean; data: MatchInfoData }>(`/cricket/match/${matchId}/info`);
      return res.data || null;
    } catch (err) {
      console.error('Failed to get match info:', err);
      return null;
    }
  },

  async getRankings(format: 't20' | 'odi' | 'test' = 't20', category: 'teams' | 'batting' | 'bowling' | 'allRounder' = 'teams'): Promise<any[]> {
    try {
      const res = await apiRequest<{ success: boolean; data: any[] }>(`/cricket/rankings?format=${format}&category=${category}`);
      return res.data || [];
    } catch (err) {
      console.error('Failed to get rankings:', err);
      return [];
    }
  }
};
