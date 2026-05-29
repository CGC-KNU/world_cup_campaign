import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage }       from './pages/HomePage';
import { PenaltyPage }    from './pages/PenaltyPage';
import { PredictionPage } from './pages/PredictionPage';
import { TrappingPage }   from './pages/TrappingPage';
import { CouponPage }     from './pages/CouponPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<HomePage />} />
        <Route path="/penalty"    element={<PenaltyPage />} />
        <Route path="/prediction" element={<PredictionPage />} />
        <Route path="/trapping"   element={<TrappingPage />} />
        <Route path="/coupons"    element={<CouponPage />} />
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
