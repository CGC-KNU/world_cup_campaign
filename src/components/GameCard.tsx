import { useNavigate } from 'react-router-dom';

interface Props {
  icon: string;
  title: string;
  description: string;
  buttonLabel: string;
  to: string;
}

export function GameCard({ icon, title, description, buttonLabel, to }: Props) {
  const navigate = useNavigate();

  return (
    <div className="game-card">
      <div className="game-card__icon" aria-hidden="true">{icon}</div>
      <div className="game-card__body">
        <div className="game-card__title">{title}</div>
        <div className="game-card__desc">{description}</div>
      </div>
      <button
        className="game-card__btn"
        onClick={() => navigate(to)}
        aria-label={`${title} 게임 시작`}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
