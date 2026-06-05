import { campaignConfig } from '../config/campaignConfig';

/**
 * 딥링크 페이지로 이동합니다.
 * https://CGC-KNU.github.io/wouldulike_deeplink/ 가 앱 실행 및 스토어 폴백을 담당합니다.
 */
export function openApp(): void {
  window.location.href = campaignConfig.appLinks.deepLink;
}
