# 우주라이크 월드컵 캠페인

응원하고, 예측하고, 한정쿠폰까지 받아가세요!  
우주라이크 월드컵 캠페인 웹게임 페이지입니다.

## 게임 구성

| 게임 | 경로 | 설명 |
|------|------|------|
| 승부차기 챌린지 | `/penalty` | 5번 슛, 골 1개 이상 → 쿠폰 |
| 대한민국 경기 예측 | `/prediction` | 3경기 승/무/패 예측 이벤트 |
| 트래핑 챌린지 | `/trapping` | 공 튀기기 기록 게임 |

## 기술 스택

- **React 18** + **TypeScript**
- **Vite 5** (빌드 도구)
- **React Router v6** (클라이언트 사이드 라우팅)
- **Express** (정적 서버, Koyeb 배포용)
- **localStorage** (임시 데이터 저장)
- 별도 백엔드/DB 없음

---

## 로컬 실행

```bash
npm install
npm run dev
# http://localhost:5173
```

## 빌드

```bash
npm run build
# dist/ 폴더 생성
```

로컬 빌드 미리보기:

```bash
npm run preview
# http://localhost:4173
```

## 프로덕션 서버 (Koyeb)

```bash
npm run build
npm run start   # Express로 dist/ 서빙 (PORT 환경변수 사용)
```

---

## Koyeb 배포 방법

1. GitHub 저장소에 푸시
2. Koyeb → **New App → GitHub**
3. 아래 설정 입력:

| 항목 | 값 |
|------|-----|
| Build command | `npm run build` |
| Start command | `npm run start` |
| Port | `4173` (Koyeb이 자동으로 `PORT` 환경변수 주입) |
| Node version | 18+ |

> `server.js`는 `process.env.PORT`를 읽어 사용합니다.

---

## 실제 운영 전 수정할 항목

모두 `src/config/campaignConfig.ts`에서 수정:

```typescript
export const campaignConfig = {
  period: '6월 8일 ~ 6월 21일',    // ← 캠페인 기간 수정
  couponUrl: '#',                   // ← 실제 쿠폰 URL로 교체 (TODO)

  penalty: {
    maxAttempts: 5,                 // 슛 횟수
    requiredGoals: 1,               // 성공 기준
  },

  prediction: {
    matches: [                      // ← 경기 상대/일정 확정 후 업데이트
      { id: 'match-1', label: '대한민국 1차전', opponent: '상대 미정', date: '일정 미정' },
      ...
    ],
    rewards: [                      // ← 보상 내용 수정
      { count: 1, description: '기본 쿠폰' },
      ...
    ],
  },

  storageKeys: { ... },             // localStorage 키 (충돌 방지 위해 고유값 권장)
};
```

### 경기 결과 확정 후

경기 목록에서 `opponent`와 `date`를 실제 값으로 교체:

```typescript
matches: [
  { id: 'match-1', label: '대한민국 1차전', opponent: '이라크', date: '6월 13일 18:00' },
  ...
],
```

---

## 프로젝트 구조

```
src/
├── config/
│   └── campaignConfig.ts    # 모든 설정값 (기간, 쿠폰URL, 게임 파라미터)
├── types/
│   └── campaign.ts          # TypeScript 타입 정의
├── utils/
│   └── storage.ts           # localStorage 추상화
├── components/
│   ├── Layout.tsx            # 서브페이지 공통 레이아웃 (뒤로가기 버튼)
│   ├── CampaignHero.tsx      # 메인 히어로 영역
│   └── GameCard.tsx          # 게임 진입 카드
├── games/
│   ├── PenaltyShootoutGame.tsx  # 승부차기 게임 로직 + UI
│   ├── KoreaPredictionForm.tsx  # 경기 예측 폼
│   └── TrappingGame.tsx         # 트래핑 게임 (requestAnimationFrame)
├── pages/
│   ├── HomePage.tsx          # 메인 캠페인 페이지 (/)
│   ├── PenaltyPage.tsx       # /penalty
│   ├── PredictionPage.tsx    # /prediction
│   └── TrappingPage.tsx      # /trapping
├── App.tsx                   # 라우팅 설정
├── main.tsx                  # 진입점
└── styles.css                # 전체 스타일
server.js                     # Express 정적 서버 (배포용)
```

---

## 주의사항

- `localStorage`는 동일 브라우저 기준 중복 제출 방지에만 사용됩니다.  
  실제 보안/무결성이 필요하면 서버 측 저장소로 교체가 필요합니다.
- FIFA 공식 로고·트로피·엠블럼 이미지는 사용하지 않았습니다.
- 모바일 퍼스트 (max-width 430px 기준 최적화) 레이아웃입니다.
