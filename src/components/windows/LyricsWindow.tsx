'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';

interface LyricsWindowProps {
  windowId: string;
}

// 가사 데이터 - 손글씨 폰트로 표시 (docs/Lyrics.md 기준)
const lyricsData: Record<number, string> = {
  1: `괴로워!

날이 가면 갈수록 없어지는 말들이

날이 가면 갈수록 없어지는 웃음이

무서워 무서워

걷다 보면 보이는 모든 것들에게 무슨 말을 할까 고민해 보지만

두려워 두려워 두려워

날이 가면 갈수록 없어지는 말들이

날이 가면 갈수록 없어지는 웃음이

괴로워 괴로워 괴로워`,

  2: `사람생각

사람들이 살아 사랑하는 이유

사람들이 사랑하는 이유

사람들이 살아가는 이유`,

  3: `아침밥 먹은 날에 더 배고파

아침밥 먹은 날에

아침밥 먹은 날에

더 배고파`,

  4: `새우 까주는 사람

(이 곡은 가사가 없습니다)`,

  5: `집을 나선 고양이

집을 나선 고양이

집을 나선 고양이

어 엄마 어 어디야? 아 그래? 아 괜찮으신가 아 그래? 응 어 먹었어 엄마 나 집 다와가서 끊을게 어 엄마도 응

집이 나선 고양이

집을 나선 고양이

집을 나선 고양이

집이 낯선 고양이

집이 낯선 고양이

집이 낯선 고양이

고양이

집이 낯선 고양이`,

  6: `알수없느낌

가 나 다 마

가 나 마 바사

가 나 알 수 없는 느낌

알 수없는

가 나 밥니다

알 수 없는 느낌

가 나입니다

알 수 없는 느낌

알 수 없는 느낌

가나입니다

알 수 없는 느낌입니다

알 수 없는 느낌입니다

가 나 알수없느낌입니다`,

  7: `지 않았다

자꾸 눈물이 날뻔했다. 그런데 미련은 남지 않았다. 무척 마음 아프도록 슬플 뿐이었다.

뭔가를 잃었다. 나는 질투했고 미워했고 나에게 중요한 건 그 경험을 통해 얻었던 추억이다.

날뻔했다. 지 않았다. 추억이다.

자꾸 눈물이 날뻔했다. 그런데 미련은 남지 않았다. 무척 마음 아프도록 슬플 뿐이었다.

뭔가를 잃었다. 나는 질투했고 미워했고 나에게 중요한 건 그 경험을 통해 얻었던 추억이다.`,

  8: `예술가는술담배마약커피없이못사나요

(이 곡은 가사가 없습니다)`,

  9: `다 니맘때로

마 사람이 그러면 안 된다.

어? 마 마이 쉐끼야

아따 이 마 새끼 안 되겠네

니 미쳤나

사람이 그러면 안 되지

다 알고 있잖아

도대체 왜 그래

마 사람들한테 부끄럽지도 않아?

아따 이 새끼 미친놈이네 이거

그래서 우얄라꼬

어케 살라고

그래그래 니 맘대로 해

다 니맘대로해!`,

  10: `말 필요 없는 노래

안녕하십니까

잘 부탁드립니다

안녕하십니까

잘 부탁드립니다

안녕하십니까

잘 부탁드립니다

안녕하십니까

잘 부탁드립니다

안녕히 계세요`,

  11: `Do You Want A Feeling

두유 워너 필링

두유워너 필링 투 나잇 투 나잇

두 유 워너 필링 두유를 먹고 느껴봐요

두 유 워너 필링 두유를 먹고 느껴 필링

열이 나요

열이 나요

열이 나요

두 유 워너 필링

두 유 워너 필링 필링

두유를 먹고 느껴 느껴

두유를 먹고 느껴봐요

열이 나요

두유 먹고 필링 느껴봐요

느껴봐요

필링

두유워너 필링`,

  12: `그림을 그려

꽃아 꽃아 너 지금 무슨 생각 하니?

그림을 그려

꽃아 꽃아 너 지금 무슨 생각 하니?

그림을 그려

그림을 그려

그림을 그려

꽃아 꽃아 그림을 그려 그려`,

  13: `집중 두 시간

(이 곡은 가사가 없습니다)`
};

export default function LyricsWindow({ windowId }: LyricsWindowProps) {
  const { currentTrack } = useStore();
  const [textLoaded, setTextLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [glitchActive, setGlitchActive] = useState(false);

  const lyricsText = currentTrack ? lyricsData[currentTrack] : null;
  const hasLyrics = currentTrack && lyricsData[currentTrack];

  // Reset when track changes
  useEffect(() => {
    setTextLoaded(false);
    setLoadingProgress(0);
  }, [currentTrack]);

  // Simulate progressive text loading (like old dial-up days)
  useEffect(() => {
    if (hasLyrics && !textLoaded) {
      const loadingInterval = setInterval(() => {
        setLoadingProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          if (newProgress >= 100) {
            clearInterval(loadingInterval);
            setTextLoaded(true);
            return 100;
          }
          return newProgress;
        });
      }, 150);

      return () => clearInterval(loadingInterval);
    }
  }, [hasLyrics, textLoaded]);

  // Random glitch effect
  useEffect(() => {
    if (textLoaded) {
      const glitchInterval = setInterval(() => {
        if (Math.random() < 0.02) {
          setGlitchActive(true);
          setTimeout(() => setGlitchActive(false), 200);
        }
      }, 1000);

      return () => clearInterval(glitchInterval);
    }
  }, [textLoaded]);

  return (
    <div className="h-full bg-cream text-retro-black font-system relative overflow-hidden">
      {/* Header */}
      <div className="bg-album-purple text-white p-2 text-xs border-b-2 border-retro-black">
        <div className="flex justify-between items-center">
          <span>📄 가사장 - {currentTrack ? `Track ${currentTrack}` : '준비중'}</span>
          <span className="text-cream">
            {hasLyrics ? (textLoaded ? '완료' : '로딩중...') : '가사 없음'}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative"
           style={{ height: 'calc(100% - 60px)' }}>
        {!hasLyrics ? (
          // No lyrics available
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-album-purple text-sm mb-2">💿</div>
              <div className="text-retro-black text-sm">곡을 선택하면 가사를 볼 수 있습니다</div>
            </div>
          </div>
        ) : !textLoaded ? (
          // Loading state with progress bar
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center w-full max-w-md">
              <div className="text-sm mb-4">손글씨 가사를 로딩중...</div>
              <div className="bg-retro-black border border-cream h-3 relative mb-2">
                <motion.div
                  className="bg-album-orange h-full"
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <div className="text-xs">{Math.round(loadingProgress)}%</div>
            </div>
          </div>
        ) : (
          // Show handwritten lyrics text
          <div className="flex-1 lyrics-scroll p-6 relative">
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                animate={glitchActive ? {
                  x: [0, -2, 2, -1, 1, 0],
                  y: [0, 1, -1, 2, -2, 0],
                  filter: [
                    'none',
                    'hue-rotate(90deg) saturate(2)',
                    'hue-rotate(180deg) saturate(0.5)',
                    'none'
                  ]
                } : {}}
                transition={{ duration: 0.2 }}
                className="min-h-full"
              >
                <div 
                  className="font-handwriting text-lg leading-relaxed whitespace-pre-wrap text-retro-black break-words"
                  style={{
                    fontFamily: "'YoonChildfundkoreaManSeh', 'Comic Sans MS', cursive",
                    fontSize: '18px',
                    lineHeight: '1.8'
                  }}
                >
                  {lyricsText}
                </div>
              </motion.div>
            
              {/* Glitch overlay */}
              {glitchActive && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `repeating-linear-gradient(
                      0deg,
                      transparent,
                      transparent 1px,
                      rgba(232, 93, 154, 0.2) 1px,
                      rgba(232, 93, 154, 0.2) 2px
                    )`
                  }}
                  animate={{
                    opacity: [0, 1, 0, 1, 0],
                    x: [0, -1, 1, -1, 0]
                  }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="bg-album-blue p-1 text-xs border-t-2 border-retro-black text-retro-black">
        {!hasLyrics 
          ? '곡을 선택하면 가사를 볼 수 있습니다'
          : textLoaded 
            ? `손글씨 가사 - Track ${currentTrack} 준비완료`
            : `손글씨 가사 로딩중... ${Math.round(loadingProgress)}%`
        }
      </div>
    </div>
  );
}