import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 4173;

app.use(express.json());

// ─── Supabase 클라이언트 ──────────────────────────────────────────────────────
// 키는 환경변수로만 주입 (코드에 절대 포함하지 않음)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

function requireSupabase(res) {
  if (!supabase) {
    res.status(503).json({ error: 'Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY.' });
    return false;
  }
  return true;
}

// ─── 트래핑 리더보드 API ──────────────────────────────────────────────────────

/** GET /api/trapping/leaderboard — 상위 50개 기록 반환 */
app.get('/api/trapping/leaderboard', async (_req, res) => {
  if (!requireSupabase(res)) return;
  const { data, error } = await supabase
    .from('trapping_scores')
    .select('nickname, score, created_at')
    .order('score', { ascending: false })
    .limit(50);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

/** POST /api/trapping/score — 기록 등록 */
app.post('/api/trapping/score', async (req, res) => {
  if (!requireSupabase(res)) return;
  const { nickname, score } = req.body;
  if (!nickname || typeof score !== 'number' || score <= 0) {
    return res.status(400).json({ error: 'nickname과 양수 score가 필요합니다.' });
  }
  const { data, error } = await supabase
    .from('trapping_scores')
    .insert({ nickname: String(nickname).slice(0, 12), score: Math.floor(score) })
    .select('nickname, score, created_at')
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ─── 경기 예측 API ────────────────────────────────────────────────────────────

/** POST /api/prediction/submit — 예측 제출 */
app.post('/api/prediction/submit', async (req, res) => {
  if (!requireSupabase(res)) return;
  const { woojurakeId, predictions } = req.body;
  if (!woojurakeId || !predictions || typeof predictions !== 'object') {
    return res.status(400).json({ error: 'woojurakeId와 predictions가 필요합니다.' });
  }
  const { error } = await supabase
    .from('prediction_submissions')
    .insert({
      woojurake_id: String(woojurakeId).slice(0, 50),
      predictions,
    });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ─── 정적 파일 서빙 (프로덕션) ────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (!supabase) {
    console.warn('[!] Supabase not configured — API endpoints will return 503');
  }
});
