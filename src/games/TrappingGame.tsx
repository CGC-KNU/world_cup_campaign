import { useState, useRef, useCallback, useEffect } from 'react';
import { addLeaderboardEntry, getTopLeaderboard, type LeaderboardEntry } from '../utils/storage';
import { fetchLeaderboard, submitScore } from '../utils/api';
import { campaignConfig } from '../config/campaignConfig';
import { shareKakao } from '../utils/share';

/** 서버 응답(created_at)을 로컬 LeaderboardEntry 포맷으로 변환 */
function fromServer(entries: { nickname: string; score: number; created_at: string }[]): LeaderboardEntry[] {
  return entries.map(e => ({ nickname: e.nickname, score: e.score, date: e.created_at }));
}

// ─── 물리 상수 ────────────────────────────────────────────────────────────────
const GRAVITY        = 0.4;   // px/프레임²
const KICK_VEL       = -10;   // px/프레임 (음수 = 위로)
const HORIZ_SPEED    = 4.5;   // 수평 킥 최대 속도
const AIR_FRICTION   = 0.985; // 공기 저항 (수평 감속)
const FALLBACK_H     = 380;   // 필드 높이 초기값 — startGame에서 실측값으로 교체
const FALLBACK_W     = 330;   // 필드 너비 초기값 — startGame에서 실측값으로 교체
const BALL_SIZE      = 58;    // 공 이모지 크기 (px)
const GROUND_LINE_H  = 4;     // 바닥 경계선 두께 (px) — 공 밑이 이 선에 닿으면 종료
const HIT_RADIUS     = BALL_SIZE * 1.1; // 터치 인식 반경
const LAND_DELAY_MS  = 500;   // 착지 후 결과 화면 전환 딜레이

/** 실제 필드 높이로 GROUND_Y(공의 top 좌표 최댓값)를 계산 */
const calcGroundY = (h: number) => h - BALL_SIZE - GROUND_LINE_H;

const { leaderboardDisplayCount } = campaignConfig.trapping;

type Phase = 'idle' | 'playing' | 'landing' | 'result';

const RANK_CLASS: Record<number, string> = {
  0: 'leaderboard__rank--gold',
  1: 'leaderboard__rank--silver',
  2: 'leaderboard__rank--bronze',
};
const RANK_EMOJI: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' };

export function TrappingGame() {
  const [phase,       setPhase]      = useState<Phase>('idle');
  const [ballY,       setBallY]      = useState(calcGroundY(FALLBACK_H));
  const [ballX,       setBallX]      = useState(FALLBACK_W / 2 - BALL_SIZE / 2);
  const [count,       setCount]      = useState(0);
  const [finalCount,  setFinalCount] = useState(0);
  const [leaderboard,         setLeaderboard]        = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading,  setLeaderboardLoading] = useState(true);
  const [scoreSubmitting,     setScoreSubmitting]    = useState(false);
  const [nickname,    setNickname]   = useState('');
  const [submitted,   setSubmitted]  = useState(false);
  const [showMiss,    setShowMiss]   = useState(false);
  const [myEntry,     setMyEntry]    = useState<LeaderboardEntry | null>(null);

  const phaseRef        = useRef<Phase>('idle');
  const ballYRef        = useRef(calcGroundY(FALLBACK_H));
  const ballXRef        = useRef(FALLBACK_W / 2 - BALL_SIZE / 2);
  const velYRef         = useRef(0);
  const velXRef         = useRef(0);
  const countRef        = useRef(0);
  const frameRef        = useRef<number | null>(null);
  const landingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fieldRef        = useRef<HTMLDivElement>(null);
  const fieldWidthRef   = useRef(FALLBACK_W);
  const groundYRef      = useRef(calcGroundY(FALLBACK_H)); // 매 게임 시작 시 실측값으로 갱신

  const stopLoop = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const endGame = useCallback(() => {
    stopLoop();
    const final = countRef.current;
    phaseRef.current = 'result';
    setPhase('result');
    setFinalCount(final);
    setSubmitted(false);
    setNickname('');
    setMyEntry(null);
    setBallY(groundYRef.current);
    setBallX(fieldWidthRef.current / 2 - BALL_SIZE / 2);
  }, [stopLoop]);

  const tick = useCallback(() => {
    velYRef.current += GRAVITY;
    let ny = ballYRef.current + velYRef.current;

    velXRef.current *= AIR_FRICTION;
    const fw = fieldWidthRef.current;
    let nx = ballXRef.current + velXRef.current;

    // 좌우 벽 반사
    if (nx < 0)              { nx = 0;             velXRef.current *= -0.7; }
    if (nx > fw - BALL_SIZE) { nx = fw - BALL_SIZE; velXRef.current *= -0.7; }

    // 바닥 경계선 도달 — 공의 bottom(ny + BALL_SIZE)이 바닥선에 닿는 순간 종료
    if (ny >= groundYRef.current) {
      ny = groundYRef.current;
      ballYRef.current = ny;
      ballXRef.current = nx;
      setBallY(ny);
      setBallX(nx);
      if (phaseRef.current === 'playing') {
        phaseRef.current = 'landing';
        setPhase('landing');
        landingTimerRef.current = setTimeout(() => endGame(), LAND_DELAY_MS);
      }
      return;
    }

    ballYRef.current = ny;
    ballXRef.current = nx;
    setBallY(ny);
    setBallX(nx);
    frameRef.current = requestAnimationFrame(tick);
  }, [endGame]);

  const kickBall = useCallback(() => {
    velYRef.current  = KICK_VEL;
    velXRef.current  = (Math.random() - 0.5) * HORIZ_SPEED * 2;
    countRef.current += 1;
    setCount(countRef.current);
  }, []);

  const startGame = useCallback(() => {
    if (landingTimerRef.current !== null) {
      clearTimeout(landingTimerRef.current);
      landingTimerRef.current = null;
    }
    stopLoop();

    // 실제 필드 크기 측정 — 화면 크기에 맞게 경계 좌표 갱신
    if (fieldRef.current) {
      fieldWidthRef.current = fieldRef.current.clientWidth;
      groundYRef.current    = calcGroundY(fieldRef.current.clientHeight);
    }

    const gy = groundYRef.current;
    const cx = fieldWidthRef.current / 2 - BALL_SIZE / 2;

    ballYRef.current = gy;
    ballXRef.current = cx;
    velYRef.current  = 0;
    velXRef.current  = 0;
    countRef.current = 0;
    phaseRef.current = 'playing';

    setPhase('playing');
    setCount(0);
    setFinalCount(0);
    setBallY(gy);
    setBallX(cx);

    kickBall();
    frameRef.current = requestAnimationFrame(tick);
  }, [stopLoop, tick, kickBall]);

  // idle 상태에서만 필드 탭으로 시작, result는 버튼으로만 재시작
  const handleFieldEvent = useCallback((clientX: number, clientY: number) => {
    const field = fieldRef.current;
    if (!field) return;

    if (phaseRef.current === 'idle') {
      startGame();
      return;
    }

    if (phaseRef.current !== 'playing') return;

    const rect = field.getBoundingClientRect();
    const tapX = clientX - rect.left;
    const tapY = clientY - rect.top;

    const ballCX = ballXRef.current + BALL_SIZE / 2;
    const ballCY = ballYRef.current + BALL_SIZE / 2;
    const dist = Math.sqrt((tapX - ballCX) ** 2 + (tapY - ballCY) ** 2);

    if (dist <= HIT_RADIUS + 8) {
      kickBall();
    } else {
      setShowMiss(true);
      setTimeout(() => setShowMiss(false), 280);
    }
  }, [startGame, kickBall]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    handleFieldEvent(e.clientX, e.clientY);
  }, [handleFieldEvent]);

  const handleTouch = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      handleFieldEvent(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [handleFieldEvent]);

  const handleSubmitScore = async () => {
    if (!nickname.trim() || finalCount === 0 || scoreSubmitting) return;
    const entry: LeaderboardEntry = { nickname: nickname.trim(), score: finalCount, date: new Date().toISOString() };
    setScoreSubmitting(true);
    try {
      await submitScore(entry.nickname, entry.score);
      const updated = fromServer(await fetchLeaderboard());
      setLeaderboard(updated.slice(0, leaderboardDisplayCount));
    } catch {
      // 서버 실패 시 로컬 리더보드로 폴백
      setLeaderboard(addLeaderboardEntry(entry).slice(0, leaderboardDisplayCount));
    } finally {
      setScoreSubmitting(false);
    }
    setMyEntry(entry);
    setSubmitted(true);
  };

  // 마운트 시 서버 리더보드 로드
  useEffect(() => {
    fetchLeaderboard()
      .then(data => setLeaderboard(fromServer(data).slice(0, leaderboardDisplayCount)))
      .catch(() => setLeaderboard(getTopLeaderboard()))
      .finally(() => setLeaderboardLoading(false));
  }, []);

  useEffect(() => () => {
    stopLoop();
    if (landingTimerRef.current !== null) clearTimeout(landingTimerRef.current);
  }, [stopLoop]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* Stats */}
      <div className="trapping-stats">
        <div className="trapping-stat">
          <div className="trapping-stat__label">현재 기록</div>
          <div className="trapping-stat__value">
            {phase === 'result' ? finalCount : count}
          </div>
        </div>
        <div className="trapping-stat__divider" />
        <div className="trapping-stat">
          <div className="trapping-stat__label">1위 기록</div>
          <div className="trapping-stat__value">
            {leaderboard[0]?.score ?? 0}
          </div>
        </div>
      </div>

      {/* Play field */}
      <div
        ref={fieldRef}
        className="trapping-field"
        onClick={handleClick}
        onTouchStart={handleTouch}
        role={phase === 'idle' || phase === 'playing' ? 'button' : undefined}
        aria-label={phase === 'idle' || phase === 'playing' ? '공 차기' : undefined}
        tabIndex={phase === 'idle' ? 0 : undefined}
        onKeyDown={e => e.key === ' ' && phase === 'idle' && startGame()}
        style={{
          cursor: phase === 'playing' ? 'crosshair' : phase === 'idle' ? 'pointer' : 'default',
        }}
      >
        {/* 바닥 경계선 */}
        <div className="trapping-field__ground" />

        {/* Ball */}
        <div
          className={`trapping-ball${phase === 'landing' ? ' trapping-ball--landed' : ''}`}
          style={{ left: ballX, top: ballY }}
          aria-hidden="true"
        >
          ⚽
        </div>

        {/* Idle hint */}
        {phase === 'idle' && (
          <div className="trapping-hint">
            <div className="trapping-hint__icon">👆</div>
            <div className="trapping-hint__text">공을 터치해서{'\n'}시작하세요!</div>
          </div>
        )}

        {/* 결과 오버레이 — 공이 착지한 뒤 필드 위에 표시 */}
        {phase === 'result' && (
          <div className="trapping-result-overlay">
            <div className="trapping-result-overlay__score">{finalCount}회</div>
            <button className="trapping-retry-btn" onClick={startGame}>
              🔄 다시 도전하기
            </button>
          </div>
        )}

        {/* Miss flash */}
        {showMiss && <div className="miss-flash" />}
      </div>

      {/* 리더보드 카드 */}
      {phase === 'result' && (
        <div className="glass-card trapping-result">
          <div className="trapping-result__label">최종 기록</div>
          <div className="trapping-result__score">{finalCount}</div>
          <div className="trapping-result__unit">회</div>

          <button
            className="btn-kakao-share"
            onClick={() => shareKakao({
              title: `⚽ 트래핑 챌린지 ${finalCount}회 달성!`,
              description: '우주라이크 월드컵 캠페인, 너는 몇 번이나 공을 튀길 수 있어?',
              buttonLabel: '나도 도전하기',
            })}
          >
            💬 카카오톡 공유
          </button>

          {finalCount > 0 && !submitted && (
            <div className="leaderboard-submit">
              <div className="leaderboard-submit__title">🏅 순위에 기록하기</div>
              <div className="leaderboard-submit__row">
                <input
                  className="leaderboard-submit__input"
                  placeholder="닉네임 입력"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  maxLength={12}
                />
                <button
                  className="leaderboard-submit__btn"
                  onClick={handleSubmitScore}
                  disabled={!nickname.trim() || scoreSubmitting}
                >
                  {scoreSubmitting ? '등록 중...' : '등록'}
                </button>
              </div>
            </div>
          )}

          {submitted && myEntry && (
            <p style={{ fontSize: 13, color: 'var(--c-text-sub)', marginBottom: 12, textAlign: 'center' }}>
              ✅ {myEntry.nickname}님의 기록이 등록되었습니다!
            </p>
          )}

          <div className="leaderboard">
            <div className="leaderboard__header">
              🏆 트래핑 챌린지 상위 {leaderboardDisplayCount}명
            </div>
            {leaderboardLoading ? (
              <div className="leaderboard__empty">불러오는 중...</div>
            ) : leaderboard.length === 0 ? (
              <div className="leaderboard__empty">아직 기록이 없습니다</div>
            ) : (
              leaderboard.slice(0, leaderboardDisplayCount).map((entry, i) => (
                <div
                  key={`${entry.nickname}-${i}`}
                  className={`leaderboard__row ${
                    myEntry && entry.nickname === myEntry.nickname && entry.score === myEntry.score
                      ? 'leaderboard__row--highlight'
                      : ''
                  }`}
                >
                  <div className={`leaderboard__rank ${RANK_CLASS[i] ?? ''}`}>
                    {RANK_EMOJI[i] ?? `${i + 1}`}
                  </div>
                  <div className="leaderboard__nickname">{entry.nickname}</div>
                  <div className="leaderboard__score">{entry.score}회</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
