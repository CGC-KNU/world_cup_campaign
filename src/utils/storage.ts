/**
 * localStorage 기반 임시 저장 유틸리티
 *
 * ⚠️ 주의: localStorage는 클라이언트 측 저장소로,
 *   부정 참여 방지나 보안 목적으로 사용할 수 없습니다.
 * TODO: 실제 배포/운영 단계에서는 서버/API/DB 저장으로 교체 필요
 */

import { campaignConfig } from '../config/campaignConfig';
import type { PredictionSubmission } from '../types/campaign';

const { storageKeys, penalty, trapping } = campaignConfig;

// ─── 경기 예측 제출 ───────────────────────────────────────────────────────────

export function loadPredictionSubmission(): PredictionSubmission | null {
  try {
    const raw = localStorage.getItem(storageKeys.predictionSubmission);
    return raw ? (JSON.parse(raw) as PredictionSubmission) : null;
  } catch { return null; }
}

export function savePredictionSubmission(data: PredictionSubmission): void {
  try { localStorage.setItem(storageKeys.predictionSubmission, JSON.stringify(data)); }
  catch { /* storage quota */ }
}

// ─── 승부차기 하루 1회 제한 ────────────────────────────────────────────────────

export interface PenaltyAttemptRecord {
  resetDate: string;     // 'YYYY-MM-DD', 11시 기준으로 계산된 "활성 날짜"
  goals: number;
  isSuccess: boolean;
  couponCode?: string;   // 성공 시 생성된 쿠폰 코드
}

/** 매일 오전 11시를 기준으로 "활성 날짜(YYYY-MM-DD)"를 반환. */
export function getPenaltyResetDate(): string {
  const now = new Date();
  if (now.getHours() < penalty.dailyResetHour) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }
  return now.toISOString().split('T')[0];
}

export function loadPenaltyAttempt(): PenaltyAttemptRecord | null {
  try {
    const raw = localStorage.getItem(storageKeys.penaltyAttempt);
    return raw ? (JSON.parse(raw) as PenaltyAttemptRecord) : null;
  } catch { return null; }
}

export function savePenaltyAttempt(record: PenaltyAttemptRecord): void {
  try { localStorage.setItem(storageKeys.penaltyAttempt, JSON.stringify(record)); }
  catch { /* storage quota */ }
}

/** 오늘(11시 리셋 기준) 이미 시도했는지 확인. */
export function hasPenaltyAttemptedToday(): boolean {
  const attempt = loadPenaltyAttempt();
  return attempt?.resetDate === getPenaltyResetDate();
}

/** 오늘(11시 리셋 기준) 날짜에 해당하는 쿠폰 코드를 반환. 해당 날짜가 없으면 undefined. */
export function getCouponCodeForToday(): string | undefined {
  return campaignConfig.penaltyCoupons[getPenaltyResetDate()];
}

// ─── 트래핑 리더보드 ──────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  nickname: string;
  score: number;
  date: string; // ISO string
}

export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(storageKeys.trappingLeaderboard);
    return raw ? (JSON.parse(raw) as LeaderboardEntry[]) : [];
  } catch { return []; }
}

function saveLeaderboard(entries: LeaderboardEntry[]): void {
  try { localStorage.setItem(storageKeys.trappingLeaderboard, JSON.stringify(entries)); }
  catch { /* storage quota */ }
}

/**
 * 새 기록을 추가하고 업데이트된 상위 N개 리더보드를 반환.
 * 동점은 더 오래된 기록이 우선.
 */
export function addLeaderboardEntry(entry: LeaderboardEntry): LeaderboardEntry[] {
  const existing = loadLeaderboard();
  const merged = [...existing, entry];
  merged.sort((a, b) =>
    b.score !== a.score
      ? b.score - a.score
      : new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const trimmed = merged.slice(0, trapping.leaderboardStorageMax);
  saveLeaderboard(trimmed);
  return trimmed.slice(0, trapping.leaderboardDisplayCount);
}

export function getTopLeaderboard(): LeaderboardEntry[] {
  return loadLeaderboard().slice(0, trapping.leaderboardDisplayCount);
}
