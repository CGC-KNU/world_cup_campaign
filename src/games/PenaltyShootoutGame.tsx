import { useState, useEffect, useRef } from 'react';
import { campaignConfig } from '../config/campaignConfig';
import { openApp } from '../utils/appLink';
import {
  hasPenaltyAttemptedToday,
  loadPenaltyAttempt,
  savePenaltyAttempt,
  getPenaltyResetDate,
  getCouponCodeForToday,
} from '../utils/storage';
import type { KickDirection, KickResult } from '../types/campaign';

const { maxAttempts, requiredGoals, dailyResetHour } = campaignConfig.penalty;

const DIRS: { value: KickDirection; label: string; arrow: string }[] = [
  { value: 'left',   label: '왼쪽',  arrow: '←' },
  { value: 'center', label: '가운데', arrow: '↑' },
  { value: 'right',  label: '오른쪽', arrow: '→' },
];

// GK CSS class by direction
const GK_CLASS: Record<KickDirection, string> = {
  left:   'gk-figure--left',
  center: 'gk-figure--center',
  right:  'gk-figure--right',
};

// Ball animation CSS variable values by direction
const BALL_X: Record<KickDirection, string> = {
  left:   'calc(-50% - 48px)',
  center: '-50%',
  right:  'calc(-50% + 48px)',
};

type GamePhase = 'idle' | 'blocked' | 'choosing' | 'animating' | 'result';

function randomDir(): KickDirection {
  return DIRS[Math.floor(Math.random() * 3)].value;
}

function getNextResetText(): string {
  const now = new Date();
  const resetHour = dailyResetHour;
  const tomorrow = new Date(now);
  // If before reset hour, reset is today at resetHour; else tomorrow at resetHour
  if (now.getHours() < resetHour) {
    tomorrow.setHours(resetHour, 0, 0, 0);
  } else {
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(resetHour, 0, 0, 0);
  }
  const diff = tomorrow.getTime() - now.getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}시간 ${m}분 후`;
}

export function PenaltyShootoutGame() {
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [kicks, setKicks] = useState<KickResult[]>([]);
  const [goals, setGoals] = useState(0);
  const [lastKick, setLastKick] = useState<KickResult | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [showRipple, setShowRipple] = useState(false);
  const [gkDir, setGkDir] = useState<KickDirection>('center');
  const [ballDir, setBallDir] = useState<KickDirection | null>(null);
  const [showResult, setShowResult] = useState(false);
  const ballKeyRef = useRef(0);

  // Check daily limit on mount
  useEffect(() => {
    if (hasPenaltyAttemptedToday()) {
      const prev = loadPenaltyAttempt();
      if (prev?.couponCode) setCouponCode(prev.couponCode);
      setPhase('blocked');
    }
  }, []);

  const start = () => {
    setPhase('choosing');
    setKicks([]);
    setGoals(0);
    setLastKick(null);
    setBallDir(null);
    setGkDir('center');
    setShowResult(false);
    setShowRipple(false);
  };

  const handleKick = (userDir: KickDirection) => {
    if (phase !== 'choosing') return;

    const gk = randomDir();
    const isGoal = userDir !== gk;
    const kick: KickResult = { userDir, gkDir: gk, isGoal };
    const newKicks = [...kicks, kick];
    const newGoals = goals + (isGoal ? 1 : 0);

    setKicks(newKicks);
    setGoals(newGoals);
    setLastKick(kick);
    setGkDir(gk);
    setBallDir(userDir);
    ballKeyRef.current += 1;
    setPhase('animating');

    // After ball animation (550ms), show result overlay
    setTimeout(() => {
      setShowResult(true);
      if (isGoal) setShowRipple(true);
    }, 550);

    setTimeout(() => {
      setShowRipple(false);
      setShowResult(false);
      setBallDir(null);

      if (newKicks.length >= maxAttempts) {
        // Game over: save attempt and show result
        const success = newGoals >= requiredGoals;
        const code = success ? getCouponCodeForToday() : undefined;
        if (code) setCouponCode(code);

        savePenaltyAttempt({
          resetDate: getPenaltyResetDate(),
          goals: newGoals,
          isSuccess: success,
          couponCode: code,
        });

        setPhase('result');
      } else {
        setGkDir('center');
        setPhase('choosing');
      }
    }, 1800);
  };

  const isSuccess = goals >= requiredGoals;

  // ── Idle ─────────────────────────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <div className="glass-card penalty-intro">
        <div className="penalty-intro__ball">⚽</div>
        <h2 className="penalty-intro__title">승부차기 챌린지</h2>
        <ul className="penalty-intro__rules">
          <li>총 {maxAttempts}번의 슛 기회가 있습니다.</li>
          <li>왼쪽 / 가운데 / 오른쪽 방향을 선택해 슛하세요.</li>
          <li>골키퍼와 방향이 다르면 골 성공!</li>
          <li>{requiredGoals}골 이상 넣으면 한정쿠폰 코드를 받을 수 있습니다.</li>
          <li>하루에 한 번만 도전할 수 있습니다 (오전 {dailyResetHour}시 리셋).</li>
        </ul>
        <button className="btn-primary" onClick={start}>시작하기</button>
      </div>
    );
  }

  // ── Blocked ───────────────────────────────────────────────────────────────
  if (phase === 'blocked') {
    return (
      <div className="glass-card penalty-blocked">
        <div className="penalty-blocked__icon">⏰</div>
        <h2 className="penalty-blocked__title">오늘은 이미 도전했어요!</h2>
        <p className="penalty-blocked__desc">
          승부차기는 하루에 한 번만 도전할 수 있습니다.<br />
          오전 {dailyResetHour}시에 다시 도전할 수 있어요.
        </p>
        <p className="penalty-blocked__reset">⏳ 다음 도전까지 {getNextResetText()}</p>
        {couponCode && (
          <div className="previous-coupon">
            <div className="previous-coupon__label">🎟 오늘 받은 쿠폰 코드</div>
            <div className="previous-coupon__code">{couponCode}</div>
          </div>
        )}
        <button className="btn-success" onClick={openApp}>
          우주라이크 앱 바로가기
        </button>
      </div>
    );
  }

  // ── Result ────────────────────────────────────────────────────────────────
  if (phase === 'result') {
    return (
      <div className="glass-card penalty-result">
        <div className="penalty-result__icon">{isSuccess ? '🏆' : '😢'}</div>
        <h2 className="penalty-result__title">
          {isSuccess ? 'GOAL! 쿠폰이 열렸습니다 ⚽' : '아쉽지만 이번 승부차기는 실패했습니다'}
        </h2>
        <p className="penalty-result__desc">
          {isSuccess ? '월드컵 한정쿠폰 코드를 확인하세요!' : '다시 도전해서 한정쿠폰을 노려보세요.'}
        </p>
        <p className="penalty-result__score">{maxAttempts}번 중 {goals}골 성공</p>

        {isSuccess && couponCode && (
          <div className="coupon-box">
            <div className="coupon-box__label">🎟 한정쿠폰 코드</div>
            <div className="coupon-box__code">{couponCode}</div>
            <div className="coupon-box__sub">우주라이크 앱에서 코드를 입력하세요</div>
          </div>
        )}

        <div className="penalty-result__btns">
          {isSuccess && (
            <button className="btn-success" onClick={openApp}>
              우주라이크 앱 바로가기
            </button>
          )}
          <button className="btn-outline" onClick={() => setPhase('blocked')}>
            닫기
          </button>
        </div>
      </div>
    );
  }

  // ── Playing / Animating ───────────────────────────────────────────────────
  return (
    <>
      {/* Scoreboard */}
      <div className="penalty-scoreboard">
        <div className="penalty-scoreboard__item">
          <div className="penalty-scoreboard__label">시도</div>
          <div className="penalty-scoreboard__value">
            {Math.min(kicks.length + 1, maxAttempts)}/{maxAttempts}
          </div>
        </div>
        <div className="penalty-scoreboard__divider" />
        <div className="penalty-scoreboard__item">
          <div className="penalty-scoreboard__label">⚽ 골</div>
          <div className="penalty-scoreboard__value">{goals}</div>
        </div>
        <div className="penalty-scoreboard__divider" />
        <div className="penalty-scoreboard__item">
          <div className="penalty-scoreboard__label">목표</div>
          <div className="penalty-scoreboard__value">{requiredGoals}골</div>
        </div>
      </div>

      {/* Kick history */}
      <div className="kick-history">
        {Array.from({ length: maxAttempts }, (_, i) => {
          const k = kicks[i];
          return (
            <div
              key={i}
              className={`kick-dot ${!k ? '' : k.isGoal ? 'kick-dot--goal' : 'kick-dot--saved'}`}
            >
              {k ? (k.isGoal ? '⚽' : '🧤') : i + 1}
            </div>
          );
        })}
      </div>

      {/* Goal visualization */}
      <div className="goal-frame">
        {/* GK */}
        <div className={`gk-figure ${GK_CLASS[gkDir]}`}>🧤</div>

        {/* Animated ball */}
        {ballDir && (
          <div
            key={ballKeyRef.current}
            className="penalty-ball penalty-ball--flying"
            style={{
              '--ball-from-x': '-50%',
              '--ball-end-x': BALL_X[ballDir],
              '--ball-end-y': '20px',
            } as React.CSSProperties}
          >
            ⚽
          </div>
        )}

        {/* Net ripple on goal */}
        {showRipple && <div className="goal-ripple" />}

        {/* Result text */}
        {showResult && lastKick && (
          <div className={`kick-result-text ${lastKick.isGoal ? 'kick-result-text--goal' : 'kick-result-text--saved'}`}>
            {lastKick.isGoal ? '⚽ GOAL!' : '🧤 막혔습니다!'}
          </div>
        )}
      </div>

      {/* Direction buttons */}
      {phase === 'choosing' ? (
        <>
          <p className="direction-label">어디로 차시겠어요?</p>
          <div className="direction-btns">
            {DIRS.map(({ value, label, arrow }) => (
              <button key={value} className="direction-btn" onClick={() => handleKick(value)}>
                <span className="direction-btn__arrow">{arrow}</span>
                {label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="direction-label">
          {lastKick?.isGoal ? '🎉 골 성공!' : lastKick ? '아쉽게도 막혔어요...' : ''}
        </p>
      )}
    </>
  );
}
