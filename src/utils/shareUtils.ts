export const SHARE_MESSAGE = `'하루살이 프로젝트'는 음악의 규범을 해체하고 재구성한 실험적이고 흥미로운 음악을 만듭니다. 기술적으로 완벽하지 않은 날것의 소리, 촌스럽지만 그래서 더 솔직하게 다가오는 키치, 그리고 우리의 일상에서 무심코 수집된 소음의 파편들이 가득합니다.

앨범에 수록된 13곡의 사운드를 드래그 가능한 윈도우, 터미널 인터페이스, Winamp 스타일 플레이어로 경험할 수 있습니다. 데스크톱 아이콘을 클릭해 앨범 정보, 가사, 크레딧을 확인하고, 숨겨진 이스터에그를 발견해보세요. 캔버스 드로잉 도구로 직접 그림을 그리거나, 앨범 퀴즈를 통해 특별한 보상을 얻을 수 있습니다.

아티스트가 세상 속에서 겪는 괴리감과 호오와 같은 혼란스러운 감각들이 음악의 문법으로 재탄생 되었습니다. 음악 속 불완전함과 즉흥성이 만들어내는 독특한 질감은 청자에게 신선한 청각적 경험을 선사할 것입니다.

https://harusali.vercel.app

#하루살이프로젝트 #인디음악 #로파이`;

export const WEBSITE_URL = 'https://harusali.vercel.app';

// Share to X (Twitter)
export const shareToTwitter = () => {
  const text = encodeURIComponent(SHARE_MESSAGE);
  const url = `https://twitter.com/intent/tweet?text=${text}`;
  window.open(url, '_blank');
};

// Share to Threads
export const shareToThreads = () => {
  const text = encodeURIComponent(SHARE_MESSAGE);
  const url = `https://threads.net/intent/post?text=${text}`;
  window.open(url, '_blank');
};

// Share to Facebook
export const shareToFacebook = () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Mobile: Try to open Facebook app first
    const text = encodeURIComponent(SHARE_MESSAGE);
    const fbAppUrl = `fb://sharer/?href=${encodeURIComponent(WEBSITE_URL)}&quote=${text}`;
    
    // Try to open Facebook app
    const link = document.createElement('a');
    link.href = fbAppUrl;
    link.click();
    
    // Fallback to web sharer after delay if app doesn't open
    setTimeout(() => {
      const quote = encodeURIComponent(SHARE_MESSAGE);
      const webUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(WEBSITE_URL)}&quote=${quote}`;
      window.open(webUrl, '_blank');
    }, 1000);
  } else {
    // Desktop: Use web sharer
    const quote = encodeURIComponent(SHARE_MESSAGE);
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(WEBSITE_URL)}&quote=${quote}`;
    window.open(url, '_blank');
  }
};

// Share to KakaoTalk
export const shareToKakaoTalk = () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Mobile: Try to open KakaoTalk app
    const msg = encodeURIComponent(SHARE_MESSAGE);
    const kakaoUrl = `kakaotalk://sendurl?msg=${msg}&url=${encodeURIComponent(WEBSITE_URL)}`;
    
    // Try to open KakaoTalk, fallback to copy link
    const link = document.createElement('a');
    link.href = kakaoUrl;
    link.click();
    
    // Fallback: copy to clipboard after a delay
    setTimeout(() => {
      copyToClipboard();
    }, 1000);
  } else {
    // Desktop: Copy to clipboard
    copyToClipboard();
    alert('카카오톡 공유용 링크가 복사되었습니다!\n카카오톡에서 붙여넣기 해주세요.');
  }
};

// Copy link to clipboard
export const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(WEBSITE_URL);
    alert('링크가 복사되었습니다!');
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = WEBSITE_URL;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('링크가 복사되었습니다!');
  }
};

export const shareActions = {
  twitter: shareToTwitter,
  threads: shareToThreads,
  facebook: shareToFacebook,
  kakao: shareToKakaoTalk,
  copy: copyToClipboard,
} as const;