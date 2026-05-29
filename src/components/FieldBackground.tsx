/** 축구 경기장 잔디 마킹 배경 (SVG) */
export function FieldBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      <svg
        viewBox="0 0 430 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        {/* ── 외곽 경계선 ── */}
        <rect x="22" y="30" width="386" height="840" fill="none"
              stroke="rgba(255,255,255,0.13)" strokeWidth="2"/>

        {/* ── 하프라인 ── */}
        <line x1="22" y1="450" x2="408" y2="450"
              stroke="rgba(255,255,255,0.13)" strokeWidth="1.5"/>

        {/* ── 센터 서클 ── */}
        <circle cx="215" cy="450" r="90"
                fill="none" stroke="rgba(255,255,255,0.11)" strokeWidth="1.5"/>

        {/* ── 센터 스팟 ── */}
        <circle cx="215" cy="450" r="4" fill="rgba(255,255,255,0.18)"/>

        {/* ── 위쪽 페널티 에어리어 ── */}
        <rect x="108" y="30" width="214" height="112"
              fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>
        {/* 골 에어리어 */}
        <rect x="158" y="30" width="114" height="48"
              fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5"/>
        {/* 페널티 아크 */}
        <path d="M 152 142 A 82 82 0 0 0 278 142"
              fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5"/>
        {/* 페널티 스팟 */}
        <circle cx="215" cy="116" r="3" fill="rgba(255,255,255,0.14)"/>

        {/* ── 아래쪽 페널티 에어리어 ── */}
        <rect x="108" y="758" width="214" height="112"
              fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>
        {/* 골 에어리어 */}
        <rect x="158" y="822" width="114" height="48"
              fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5"/>
        {/* 페널티 아크 */}
        <path d="M 152 758 A 82 82 0 0 1 278 758"
              fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5"/>
        {/* 페널티 스팟 */}
        <circle cx="215" cy="784" r="3" fill="rgba(255,255,255,0.14)"/>

        {/* ── 코너 아크 4개 ── */}
        <path d="M 22 52 A 22 22 0 0 1 44 30"
              fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>
        <path d="M 386 30 A 22 22 0 0 1 408 52"
              fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>
        <path d="M 22 848 A 22 22 0 0 0 44 870"
              fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>
        <path d="M 386 870 A 22 22 0 0 0 408 848"
              fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>
      </svg>
    </div>
  );
}
