import { campaignConfig } from '../config/campaignConfig';

export function CampaignHero() {
  return (
    <div className="hero">
      <div className="hero__icon">⚽</div>
      <h1 className="hero__title">{campaignConfig.title}</h1>
      <p className="hero__subtitle">{campaignConfig.subtitle}</p>
      <div className="hero__period-badge">
        📅 {campaignConfig.period}
      </div>
      <p className="hero__desc">{campaignConfig.description}</p>
    </div>
  );
}
