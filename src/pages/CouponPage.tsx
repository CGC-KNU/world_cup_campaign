import { Layout } from '../components/Layout';
import { COUPON_SHOPS } from '../config/campaignConfig';

export function CouponPage() {
  return (
    <Layout title="월드컵 한정쿠폰">
      <div className="coupon-list-page">
        <div className="coupon-list-header">
          <div className="coupon-list-header__title">🎟 참여 매장 목록</div>
          <div className="coupon-list-header__sub">
            캠페인 기간(6월 8일 ~ 6월 21일) 동안 사용 가능
          </div>
        </div>

        <div className="coupon-list-grid">
          {COUPON_SHOPS.map((shop, i) => (
            <div key={i} className="coupon-shop-card">
              <div className="coupon-shop-card__left">
                <div className="coupon-shop-card__name">{shop.name}</div>
                <div className="coupon-shop-card__category">{shop.category}</div>
                {shop.note && (
                  <div className="coupon-shop-card__note">📌 {shop.note}</div>
                )}
              </div>
              <div className="coupon-shop-card__badge">한정쿠폰</div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
