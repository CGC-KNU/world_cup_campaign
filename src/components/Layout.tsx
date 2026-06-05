import { useNavigate } from 'react-router-dom';
import { FieldBackground } from './FieldBackground';

interface Props {
  title: string;
  children: React.ReactNode;
}

export function Layout({ title, children }: Props) {
  const navigate = useNavigate();

  return (
    <div className="app">
      <FieldBackground />
      <div className="page">
        <header className="sub-header">
          <button
            className="back-btn"
            onClick={() => navigate('/')}
            aria-label="뒤로 가기"
          >
            ‹ 뒤로
          </button>
          <h1 className="sub-header__title">{title}</h1>
        </header>
        {children}
      </div>
    </div>
  );
}
