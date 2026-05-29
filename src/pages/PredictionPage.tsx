import { Layout } from '../components/Layout';
import { KoreaPredictionForm } from '../games/KoreaPredictionForm';

export function PredictionPage() {
  return (
    <Layout title="대한민국 경기 예측">
      <div className="prediction-page">
        <KoreaPredictionForm />
      </div>
    </Layout>
  );
}
