import type { Match } from '../types';

// ─── 캠페인 기본 설정 ─────────────────────────────────────────────────────────
export const CAMPAIGN = {
  title: '우주라이크\n월드컵 예측 챌린지',
  subtitle: '경기 결과를 예측하고',
  subtitleHighlight: '경북대 인근 식당 쿠폰',
  subtitleSuffix: '을 받으세요!',
  detailLink: 'https://woojurake.com/event/worldcup2026',

  // 캠페인 기간 (필요 시 수정)
  period: {
    start: '2026-06-01',
    end: '2026-06-30',
    display: '2026. 6. 1 — 6. 30',
  },

  // 앱 링크
  appLink: 'https://woojurake.com',

  // 공유 URL (배포 후 실제 URL로 교체)
  shareUrl: 'https://woojurake-worldcup.koyeb.app',
  shareTitle: '우주라이크 월드컵 예측 챌린지',
  shareText: '경기 결과를 예측하고 경북대 인근 식당 쿠폰을 받으세요!',
} as const;

// ─── 쿠폰 설정 ────────────────────────────────────────────────────────────────
export const COUPON = {
  link: 'https://woojurake.com/coupon/worldcup2026', // 배포 전 실제 쿠폰 링크로 교체
  text: '경북대 인근 식당 할인 쿠폰',
  description: '3경기 이상 + 승부차기 성공 시 쿠폰 발급!',
  minCorrectPredictions: 3, // 최소 정답 예측 수
} as const;

// ─── 승부차기 미니게임 설정 ───────────────────────────────────────────────────
export const PENALTY = {
  totalKicks: 5,         // 킥 횟수
  successGoals: 3,       // 쿠폰 획득을 위한 최소 골 수
  goalProbability: 0.65, // 킥당 골 확률 (0~1)
} as const;

// ─── localStorage 키 설정 ─────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  predictions: 'woojurake_wc2026_predictions',
  penaltyResult: 'woojurake_wc2026_penalty_result',
} as const;

// ─── 경기 목록 (결과 발표 후 result 값 입력) ───────────────────────────────────
// result 필드:
//   null     → 경기 미종료
//   { team1Goals: N, team2Goals: M }  → 정규 시간 결과
//   + penaltyTeam1/2 → 연장/승부차기 포함 결과
export const MATCHES: Match[] = [
  {
    id: 'kor-group-1',
    round: '조별리그',
    team1: { code: 'KOR', name: '대한민국', emoji: '🇰🇷' },
    team2: { code: 'AUS', name: '호주', emoji: '🇦🇺' },
    scheduledAt: '2026-06-13T10:00:00.000Z',
    displayDate: '6월 13일 (토) 오후 7시',
    canDraw: true,
    result: null,
  },
  {
    id: 'kor-group-2',
    round: '조별리그',
    team1: { code: 'KOR', name: '대한민국', emoji: '🇰🇷' },
    team2: { code: 'SAU', name: '사우디아라비아', emoji: '🇸🇦' },
    scheduledAt: '2026-06-17T10:00:00.000Z',
    displayDate: '6월 17일 (수) 오후 7시',
    canDraw: true,
    result: null,
  },
  {
    id: 'kor-group-3',
    round: '조별리그',
    team1: { code: 'KOR', name: '대한민국', emoji: '🇰🇷' },
    team2: { code: 'POL', name: '폴란드', emoji: '🇵🇱' },
    scheduledAt: '2026-06-21T10:00:00.000Z',
    displayDate: '6월 21일 (일) 오후 7시',
    canDraw: true,
    result: null,
  },
  {
    id: 'global-qf',
    round: '8강',
    team1: { code: 'BRA', name: '브라질', emoji: '🇧🇷' },
    team2: { code: 'ARG', name: '아르헨티나', emoji: '🇦🇷' },
    scheduledAt: '2026-07-04T02:00:00.000Z',
    displayDate: '7월 4일 (토) 오전 11시',
    canDraw: false,
    result: null,
  },
  {
    id: 'global-sf',
    round: '4강',
    team1: { code: 'ENG', name: '잉글랜드', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    team2: { code: 'FRA', name: '프랑스', emoji: '🇫🇷' },
    scheduledAt: '2026-07-08T02:00:00.000Z',
    displayDate: '7월 8일 (수) 오전 11시',
    canDraw: false,
    result: null,
  },
  {
    id: 'final',
    round: '결승',
    team1: { code: 'BRA', name: '브라질', emoji: '🇧🇷' },
    team2: { code: 'FRA', name: '프랑스', emoji: '🇫🇷' },
    scheduledAt: '2026-07-19T02:00:00.000Z',
    displayDate: '7월 19일 (일) 오전 11시',
    canDraw: false,
    result: null,
  },
];
