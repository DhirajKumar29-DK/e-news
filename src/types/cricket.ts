export interface MatchTeam {
  name: string;
  shortName: string;
  score: string;
  overs: string;
  wickets: number;
  runs: number;
  logo: string;
  isBatting: boolean;
}

export interface CricketMatch {
  id: string;
  series: string;
  matchTitle: string;
  matchType: string;
  category?: 'international' | 'women' | 'domestic' | 'league';
  categoryLabel?: string;
  categoryPriority?: number;
  status: 'LIVE' | 'UPCOMING' | 'COMPLETED';
  statusText: string;
  venue: string;
  startTime: string;
  isLive: boolean;
  team1: MatchTeam;
  team2: MatchTeam;
  target?: number;
  crr?: string;
  rrr?: string;
  toss?: string;
  playerOfTheMatch?: string;
}

export interface BatterLive {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: string;
  isStriker: boolean;
}

export interface BowlerLive {
  name: string;
  overs: string;
  maidens: number;
  runs: number;
  wickets: number;
  economy: string;
}

export interface LiveCreaseData {
  match: CricketMatch;
  currentBatters: BatterLive[];
  currentBowler: BowlerLive;
  thisOverBalls: string[];
  partnership: {
    runs: number;
    balls: number;
    runRate: string;
  };
  lastWicket: string;
  equation: string;
  crr: string;
  rrr: string;
}

export interface BatterScorecard {
  name: string;
  dismissal: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: string;
}

export interface BowlerScorecard {
  name: string;
  overs: string;
  maidens: number;
  runs: number;
  wickets: number;
  economy: string;
  dots: number;
}

export interface FallOfWicket {
  score: string;
  batter: string;
  over: string;
}

export interface InningScorecard {
  teamName: string;
  teamShort: string;
  teamLogo: string;
  totalScore: string;
  overs: string;
  runRate: string;
  batting: BatterScorecard[];
  extras: string;
  total: string;
  didNotBat: string[];
  fallOfWickets: FallOfWicket[];
  bowling: BowlerScorecard[];
}

export interface ScorecardData {
  matchId: string;
  series: string;
  matchTitle: string;
  venue: string;
  statusText: string;
  innings: InningScorecard[];
}

export interface CommentaryItem {
  id?: string;
  over?: string;
  ball?: number;
  runs?: number;
  isBoundary?: boolean;
  isSix?: boolean;
  isWicket?: boolean;
  badge?: string;
  bowler?: string;
  batsman?: string;
  text?: string;
  speed?: string;
  score?: string;
  isOverEnd?: boolean;
  overNumber?: number;
  overSummary?: string;
  isPreMatch?: boolean;
  type?: 'ball' | 'over' | 'prematch' | 'milestone';
}

export interface MatchPlayer {
  name: string;
  role: string;
}

export interface SupportStaff {
  headCoach?: string;
  battingCoach?: string;
  bowlingCoach?: string;
}

export interface MatchInfoData {
  matchId: string;
  series: string;
  matchTitle: string;
  venue: string;
  dateTime: string;
  toss: string;
  weather?: string;
  pitchReport?: string;
  umpires: string[];
  thirdUmpire?: string;
  matchReferee: string[];
  teams: {
    team1: {
      name: string;
      shortName: string;
      playingXI: MatchPlayer[];
      bench: string[];
      supportStaff?: SupportStaff;
    };
    team2: {
      name: string;
      shortName: string;
      playingXI: MatchPlayer[];
      bench: string[];
      supportStaff?: SupportStaff;
    };
  };
}

export interface RankingTeam {
  rank: number;
  team: string;
  matches: number;
  points: number;
  rating: number;
  logo: string;
}

export interface RankingPlayer {
  rank: number;
  player: string;
  country: string;
  rating: number;
  flag: string;
}
