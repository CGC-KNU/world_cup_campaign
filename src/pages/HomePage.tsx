import { useNavigate } from 'react-router-dom';
import { GameCard } from '../components/GameCard';
import { FieldBackground } from '../components/FieldBackground';
import { campaignConfig } from '../config/campaignConfig';
import { openApp } from '../utils/appLink';

const BALLS = [
  { top: '8%',  left: '6%',  size: 18, dur: '7s',  delay: '0s'   },
  { top: '15%', left: '88%', size: 22, dur: '9s',  delay: '1.2s' },
  { top: '38%', left: '12%', size: 15, dur: '8s',  delay: '3.1s' },
  { top: '52%', left: '82%', size: 20, dur: '11s', delay: '0.7s' },
  { top: '72%', left: '25%', size: 16, dur: '7.5s',delay: '2s'   },
  { top: '82%', left: '70%', size: 19, dur: '10s', delay: '1.8s' },
  { top: '25%', left: '50%', size: 13, dur: '6.5s',delay: '4s'   },
];

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="app">
      <FieldBackground />
      {/* Floating balls background */}
      <div className="floating-balls" aria-hidden="true">
        {BALLS.map((b, i) => (
          <span
            key={i}
            className="fb"
            style={{
              top: b.top,
              left: b.left,
              fontSize: b.size,
              '--dur': b.dur,
              '--delay': b.delay,
            } as React.CSSProperties}
          >
            ⚽
          </span>
        ))}
      </div>

      <div className="page">
        {/* Hero */}
        <div className="hero">
          <div className="hero__badge">⚽ 2026 월드컵 캠페인</div>
          <h1 className="hero__title">{campaignConfig.title}</h1>
          <p className="hero__subtitle">{campaignConfig.subtitle}</p>
          <div className="hero__period">📅 {campaignConfig.period}</div>
        </div>

        {/* Game cards */}
        <div className="game-cards">
          <GameCard
            icon="⚽"
            title="승부차기 챌린지"
            description="5번의 기회 안에 골을 넣고 한정쿠폰을 받아보세요."
            buttonLabel="도전하기"
            to="/penalty"
          />
          <GameCard
            icon="🏆"
            title="대한민국 경기 예측"
            description="대한민국 경기 결과를 승/무/패로 예측하고, 적중 개수에 따라 보상을 받아보세요."
            buttonLabel="예측하기"
            to="/prediction"
          />
          <GameCard
            icon="🤸"
            title="트래핑 챌린지"
            description="공을 떨어뜨리지 않고 몇 번까지 튀길 수 있을까요? 기록에 도전해보세요."
            buttonLabel="기록 세우기"
            to="/trapping"
          />
        </div>

        {/* Coupon section */}
        <div className="coupon-section">
          <div className="coupon-section__title">🎟 월드컵 한정쿠폰</div>
          <p className="coupon-section__desc">
            캠페인 기간 동안만 사용할 수 있는<br />
            우주라이크 한정쿠폰을 확인해보세요.
          </p>
          <button className="coupon-btn" onClick={() => navigate('/coupons')}>
            한정쿠폰 보러가기
          </button>
        </div>

        {/* App link */}
        <button className="app-link-btn" onClick={openApp}>
          🚀 우주라이크 앱 바로가기
        </button>
      </div>
    </div>
  );
}
