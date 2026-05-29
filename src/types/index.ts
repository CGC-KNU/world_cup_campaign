export interface Team {
  code: string;
  name: string;
  emoji: string;
}

export interface MatchResult {
  team1Goals: number;
  team2Goals: number;
  penaltyTeam1?: number;
  penaltyTeam2?: number;
}

export interface Match {
  id: string;
  round: string;
  team1: Team;
  team2: Team;
  scheduledAt: string; // ISO string
  displayDate: string;
  canDraw: boolean; // 무승부 가능 여부 (조별리그: true, 결선: false)
  result: MatchResult | null; // null = 미종료
}

export type PredictionChoice = 'team1' | 'draw' | 'team2';

export interface PenaltyKick {
  userZone: 'left' | 'center' | 'right';
  gkZone: 'left' | 'center' | 'right';
  isGoal: boolean;
}

export interface PenaltyShootoutResult {
  kicks: PenaltyKick[];
  userGoals: number;
  total: number;
  success: boolean;
}

export interface Prediction {
  matchId: string;
  choice: PredictionChoice;
  penaltyShootout?: PenaltyShootoutResult;
  predictedAt: string; // ISO string
}

export type PredictionsMap = Record<string, Prediction>;
