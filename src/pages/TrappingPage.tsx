import { Layout } from '../components/Layout';
import { TrappingGame } from '../games/TrappingGame';

export function TrappingPage() {
  return (
    <Layout title="트래핑 챌린지">
      <div className="trapping-page">
        <TrappingGame />
      </div>
    </Layout>
  );
}
