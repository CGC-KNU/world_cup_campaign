import { useState, useEffect } from 'react';
import { campaignConfig } from '../config/campaignConfig';
import { loadPredictionSubmission, savePredictionSubmission } from '../utils/storage';
import { submitPrediction } from '../utils/api';
import { shareKakao } from '../utils/share';
import type { PredictionValue, PredictionSubmission } from '../types/campaign';

const { prediction } = campaignConfig;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const CHOICE_LABEL: Record<PredictionValue, string> = {
  win: '승', draw: '무', lose: '패',
};

export function KoreaPredictionForm() {
  const [woojurakeId,  setWoojurakeId]  = useState('');
  const [predictions,  setPredictions]  = useState<Record<string, PredictionValue>>({});
  const [submitted,    setSubmitted]    = useState<PredictionSubmission | null>(null);
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState('');
  const [showConfirm,  setShowConfirm]  = useState(false);

  // 이미 제출한 경우 localStorage에서 복원 (중복 제출 방지용 로컬 표시)
  useEffect(() => {
    setSubmitted(loadPredictionSubmission());
  }, []);

  const allSelected = prediction.matches.every(m => predictions[m.id]);
  const canSubmit   = woojurakeId.trim().length > 0 && allSelected;

  const selectChoice = (matchId: string, value: PredictionValue) => {
    setPredictions(prev => ({ ...prev, [matchId]: value }));
  };

  const handleSubmitClick = () => {
    if (!canSubmit) return;
    setError('');
    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    setError('');

    const data: PredictionSubmission = {
      woojurakeId: woojurakeId.trim(),
      predictions,
      submittedAt: new Date().toISOString(),
    };

    try {
      await submitPrediction(data.woojurakeId, predictions);
      // 서버 저장 성공 → 로컬에도 저장해서 재방문 시 폼 대신 결과 표시
      savePredictionSubmission(data);
      setSubmitted(data);
    } catch (e) {
      setError('제출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── 이미 제출한 경우 ─────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="prediction-done-card">
        <div className="prediction-done-card__icon">✅</div>
        <h2 className="prediction-done-card__title">예측 완료!</h2>
        <p className="prediction-done-card__desc">
          대한민국 경기 결과를 기다려주세요.<br />
          적중 개수에 따라 캠페인 종료 후 보상이 지급됩니다.
        </p>

        <div className="submission-info">
          <div className="submission-info__nickname">🙋 {submitted.woojurakeId}</div>
          <div className="submission-info__time">{formatDate(submitted.submittedAt)}</div>
          {prediction.matches.map(match => (
            <div key={match.id} className="submission-info__row">
              <span>{match.label}</span>
              <span className="submission-info__choice">
                {CHOICE_LABEL[submitted.predictions[match.id]]}
              </span>
            </div>
          ))}
        </div>

        <div className="rewards-info">
          <div className="rewards-info__title">🎁 보상 안내</div>
          {prediction.rewards.map(r => (
            <div key={r.count} className="rewards-info__row">
              <span>{r.count}개 적중 →</span> <span>{r.description}</span>
            </div>
          ))}
        </div>

        <button
          className="btn-kakao-share"
          style={{ marginTop: 16 }}
          onClick={() => shareKakao({
            title: '🇰🇷 대한민국 경기 예측 완료!',
            description: '우주라이크 월드컵 캠페인에서 대한민국의 승리를 예측했어. 같이 응원해요!',
            buttonLabel: '나도 예측하기',
          })}
        >
          💬 카카오톡 공유
        </button>

        <p style={{ fontSize: 12, color: '#8AA0BC', marginTop: 12 }}>
          이미 승부예측에 참여했습니다.
        </p>
      </div>
    );
  }

  // ── 예측 폼 ──────────────────────────────────────────────────────────────
  return (
    <>
      <div className="prediction-form-card">
        {/* 우주라이크 ID 입력 */}
        <div className="form-group">
          <label htmlFor="woojurakeId" className="form-label">우주라이크 ID</label>
          <input
            id="woojurakeId"
            type="text"
            className="form-input"
            placeholder="우주라이크 앱 ID를 입력해주세요"
            value={woojurakeId}
            onChange={e => setWoojurakeId(e.target.value)}
            maxLength={50}
          />
        </div>

        {/* 경기별 예측 선택 */}
        <div className="form-group">
          <div className="form-label">경기 예측</div>
          {prediction.matches.map(match => (
            <div key={match.id} className="match-predict-row">
              <div className="match-predict-row__info">
                <div className="match-predict-row__flags">
                  <span>{prediction.korFlag}</span>
                  <span className="match-predict-row__vs">vs</span>
                  <span>{match.opponentFlag}</span>
                </div>
                <div className="match-predict-row__label">
                  대한민국 vs {match.opponent}
                </div>
                <div className="match-predict-row__meta">
                  {match.label} · {match.date}
                </div>
              </div>
              <div className="choice-btns">
                {prediction.choices.map(({ value, label }) => (
                  <button
                    key={value}
                    className={`choice-btn ${
                      predictions[match.id] === value ? 'choice-btn--selected' : ''
                    }`}
                    onClick={() => selectChoice(match.id, value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 보상 안내 */}
        <div className="rewards-info">
          <div className="rewards-info__title">🎁 보상 안내</div>
          {prediction.rewards.map(r => (
            <div key={r.count} className="rewards-info__row">
              <span>{r.count}개 적중 →</span> <span>{r.description}</span>
            </div>
          ))}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <p style={{ fontSize: 13, color: 'var(--c-error)', marginBottom: 8, textAlign: 'center' }}>
            {error}
          </p>
        )}

        {/* 제출 버튼 */}
        <div className="submit-btn-wrap">
          <button
            className="btn-primary"
            onClick={handleSubmitClick}
            disabled={!canSubmit || submitting}
            style={{ opacity: canSubmit && !submitting ? 1 : 0.5 }}
          >
            {submitting ? '제출 중...' : '예측 제출하기'}
          </button>
        </div>
      </div>

      {/* 확인 다이얼로그 */}
      {showConfirm && (
        <div className="dialog-overlay" onClick={() => setShowConfirm(false)}>
          <div className="dialog" onClick={e => e.stopPropagation()}>
            <div className="dialog__title">예측을 제출할까요?</div>
            <p className="dialog__desc">
              제출 후에는 수정이 어려울 수 있습니다.<br />
              이대로 제출하시겠습니까?
            </p>
            <div className="dialog__btns">
              <button className="btn-primary" onClick={confirmSubmit}>
                제출하기
              </button>
              <button className="btn-secondary" onClick={() => setShowConfirm(false)}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
