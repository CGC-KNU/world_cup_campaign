import { campaignConfig } from '../config/campaignConfig';

/**
 * 플랫폼을 감지해 딥링크 시도 후 스토어로 폴백합니다.
 * - 앱 설치 시: wouldulike:// 로 앱 실행
 * - 미설치 시: iOS → App Store, Android → Play Store
 */
export function openApp(): void {
  const ua = navigator.userAgent;
  const isIOS     = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);

  const { ios, android, deepLink } = campaignConfig.appLinks;
  const storeUrl = isIOS ? ios : isAndroid ? android : ios;

  const start = Date.now();

  // 딥링크 실패(앱 미설치) 시 1.5초 후 스토어로 이동
  // 앱이 열리면 브라우저 JS 실행이 멈춰 타이머가 늦게 실행되므로 조건으로 구분
  const timer = setTimeout(() => {
    if (Date.now() - start < 2000) {
      window.location.href = storeUrl;
    }
  }, 1500);

  // 페이지가 숨겨지면(앱 전환) 타이머 취소
  const onVisibilityChange = () => {
    if (document.hidden) {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  window.location.href = deepLink;
}
