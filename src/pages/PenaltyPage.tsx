import { Layout } from '../components/Layout';
import { PenaltyShootoutGame } from '../games/PenaltyShootoutGame';

export function PenaltyPage() {
  return (
    <Layout title="승부차기 챌린지">
      <div className="penalty-page">
        <PenaltyShootoutGame />
      </div>
    </Layout>
  );
}
