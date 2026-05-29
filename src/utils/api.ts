import type { PredictionValue } from '../types/campaign';

export interface ServerScore {
  nickname: string;
  score: number;
  created_at: string;
}

/** 트래핑 리더보드 조회 */
export async function fetchLeaderboard(): Promise<ServerScore[]> {
  const res = await fetch('/api/trapping/leaderboard');
  if (!res.ok) throw new Error(`leaderboard fetch failed: ${res.status}`);
  return res.json();
}

/** 트래핑 점수 등록 */
export async function submitScore(nickname: string, score: number): Promise<ServerScore> {
  const res = await fetch('/api/trapping/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname, score }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `score submit failed: ${res.status}`);
  }
  return res.json();
}

/** 경기 예측 제출 */
export async function submitPrediction(
  woojurakeId: string,
  predictions: Record<string, PredictionValue>,
): Promise<void> {
  const res = await fetch('/api/prediction/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ woojurakeId, predictions }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `prediction submit failed: ${res.status}`);
  }
}
