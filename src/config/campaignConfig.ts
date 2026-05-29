import type { KoreaMatch } from '../types/campaign';

export const campaignConfig = {
  title: '우주라이크 월드컵 캠페인',
  subtitle: '응원하고, 예측하고, 한정쿠폰까지 받아가세요!',
  description: '캠페인 기간 동안 축구 테마 웹게임에 참여하고 우주라이크 한정 혜택을 확인할 수 있습니다.',
  period: '6월 8일 ~ 6월 21일',

  appLinks: {
    ios:      'https://apps.apple.com/kr/app/wouldulike/id6740640251',
    android:  'https://play.google.com/store/apps/details?id=com.coggiri.new1&pcampaignid=web_share&utm_source=ig&utm_medium=social&utm_content=link_in_bio',
    deepLink: 'wouldulike://',
  },

  // ─── 승부차기 ───────────────────────────────────────────────────────────────
  penalty: {
    maxAttempts: 5,
    requiredGoals: 3,
    dailyResetHour: 11,
  },

  // 날짜(YYYY-MM-DD)별 쿠폰 코드 — 오전 11시 리셋 기준 활성 날짜와 매핑
  penaltyCoupons: {
    '2026-06-22': 'QFJXKRA',
    '2026-06-23': 'LMPZVNE',
    '2026-06-24': 'TBGHSDY',
    '2026-06-25': 'WRCNQOP',
    '2026-06-26': 'XAZMPLK',
    '2026-06-27': 'VYTRBHE',
    '2026-06-28': 'DOKJQWS',
    '2026-06-29': 'NFCXGTA',
    '2026-06-30': 'HPVZLUR',
    '2026-07-01': 'KSEYMBQ',
    '2026-07-02': 'JRAWPTN',
    '2026-07-03': 'UZQCFDX',
    '2026-07-04': 'GMLVYKO',
    '2026-07-05': 'BTHXENP',
    '2026-07-06': 'PZDKSJA',
    '2026-07-07': 'YQNWRLC',
  } as Record<string, string>,

  // ─── 대한민국 경기 예측 ────────────────────────────────────────────────────
  prediction: {
    korFlag: '🇰🇷',
    matches: [
      { id: 'match-1', label: '대한민국 1차전', opponent: '체코',    opponentFlag: '🇨🇿', date: '6월 12일 오전 11:00' },
      { id: 'match-2', label: '대한민국 2차전', opponent: '멕시코',  opponentFlag: '🇲🇽', date: '6월 19일 오전 10:00' },
      { id: 'match-3', label: '대한민국 3차전', opponent: '남아공',  opponentFlag: '🇿🇦', date: '6월 25일 오전 10:00' },
    ] as KoreaMatch[],

    choices: [
      { value: 'win',  label: '승' },
      { value: 'draw', label: '무' },
      { value: 'lose', label: '패' },
    ] as { value: 'win' | 'draw' | 'lose'; label: string }[],

    // TODO: 보상 내용 운영 상황에 따라 수정
    rewards: [
      { count: 1, description: '기본 쿠폰' },
      { count: 2, description: '추가 쿠폰' },
      { count: 3, description: '특별 쿠폰팩' },
    ],
  },

  // ─── 트래핑 리더보드 ───────────────────────────────────────────────────────
  trapping: {
    leaderboardDisplayCount: 5,
    leaderboardStorageMax: 50,
  },

  // ─── localStorage 키 ──────────────────────────────────────────────────────
  storageKeys: {
    predictionSubmission: 'wouldulike_worldcup_prediction_submission',
    penaltyAttempt:       'wouldulike_worldcup_penalty_attempt',
    trappingLeaderboard:  'wouldulike_worldcup_trapping_leaderboard',
    trappingHighScore:    'wouldulike_worldcup_trapping_high_score',
  },
};

// ─── 한정쿠폰 발급 매장 목록 ──────────────────────────────────────────────────
export interface CouponShop {
  name: string;
  category: string;
  note?: string;
}

export const COUPON_SHOPS: CouponShop[] = [
  { name: '정든밥',                  category: '술집',          note: '소주 1병 증정' },
  { name: '구구포차 본점',            category: '술집',          note: '치킨/통닭 랜덤 제공 (8인 이하, 중복이벤트 불가, 리뷰이벤트 참여시)' },
  { name: '포차1번지먹새통 경북대점',  category: '술집',          note: '프리미엄 메뉴 주문시 피카슈 돈가스 2마리 제공 (주류 주문 필수)' },
  { name: '닭동가리 경북대점',         category: '술집',          note: '팥빙수 or 파인샤베트 택1' },
  { name: '북성로우동불고기',           category: '술집',          note: '사이드 메뉴 택1' },
  { name: '난탄 경대북문점',           category: '술집',          note: '생맥주 1+1' },
  { name: '사랑과평화 경북대점',        category: '술집',          note: '뻥튀기 아이스크림 제공' },
  { name: '부리또익스프레스',           category: '기타(멕시칸)',   note: '감자튀김 제공' },
  { name: '해밥 경북대점',             category: '한식',          note: '닭밥(단품) 주문시 미니우동 제공' },
];
