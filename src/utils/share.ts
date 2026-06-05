declare global {
  interface Window {
    Kakao?: {
      isInitialized(): boolean;
      init(key: string): void;
      Share: {
        sendDefault(params: object): void;
      };
    };
  }
}

const KAKAO_JS_KEY = (import.meta as { env: Record<string, string> }).env.VITE_KAKAO_JS_KEY as string | undefined;

function initKakao(): boolean {
  if (!KAKAO_JS_KEY || !window.Kakao) return false;
  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(KAKAO_JS_KEY);
  }
  return window.Kakao.isInitialized();
}

export interface KakaoShareParams {
  title: string;
  description: string;
  buttonLabel?: string;
}

export function shareKakao({ title, description, buttonLabel = '나도 도전하기' }: KakaoShareParams): void {
  const url = window.location.href;

  if (initKakao()) {
    window.Kakao!.Share.sendDefault({
      objectType: 'feed',
      content: {
        title,
        description,
        link: { mobileWebUrl: url, webUrl: url },
      },
      buttons: [
        { title: buttonLabel, link: { mobileWebUrl: url, webUrl: url } },
      ],
    });
    return;
  }

  // Fallback: Web Share API (모바일 기본 공유)
  if (navigator.share) {
    navigator.share({ title, text: description, url }).catch(() => {});
    return;
  }

  // Fallback: 클립보드 복사
  navigator.clipboard
    .writeText(`${title}\n${description}\n${url}`)
    .then(() => alert('링크가 복사되었습니다!'))
    .catch(() => alert('공유 링크: ' + url));
}
