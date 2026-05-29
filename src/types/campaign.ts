export interface KoreaMatch {
  id: string;
  label: string;
  opponent: string;
  opponentFlag: string; // 상대팀 국기 이모지
  date: string;
}

export type KickDirection = 'left' | 'center' | 'right';

export interface KickResult {
  userDir: KickDirection;
  gkDir: KickDirection;
  isGoal: boolean;
}

export type PredictionValue = 'win' | 'draw' | 'lose';

export interface PredictionSubmission {
  woojurakeId: string;
  predictions: Record<string, PredictionValue>;
  submittedAt: string;
}

export type TrappingPhase = 'idle' | 'playing' | 'result';
