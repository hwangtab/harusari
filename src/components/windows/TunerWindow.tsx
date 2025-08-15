'use client';

import { useState } from 'react';
import { guitarStrings, playGuitarString } from '@/utils/audioUtils';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';

interface TunerWindowProps {
  windowId: string;
}

export default function TunerWindow({ windowId: _ }: TunerWindowProps) {
  const [volume, setVolume] = useState(0.3);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const { width: screenWidth } = useWindowDimensions();
  
  // 반응형 패딩 계산 (컴팩트 디자인)
  const isMobile = screenWidth < 768;
  const mainPadding = isMobile ? 'p-3' : 'p-4';

  // 기타 줄 정보를 순서대로 정렬 (1번줄부터 6번줄까지)
  const orderedStrings = [
    { key: 'E1', ...guitarStrings.E1, thickness: 1 },
    { key: 'B2', ...guitarStrings.B2, thickness: 1.2 },
    { key: 'G3', ...guitarStrings.G3, thickness: 1.5 },
    { key: 'D4', ...guitarStrings.D4, thickness: 1.8 },
    { key: 'A5', ...guitarStrings.A5, thickness: 2.1 },
    { key: 'E6', ...guitarStrings.E6, thickness: 2.5 }
  ];

  const handleStringClick = (stringKey: keyof typeof guitarStrings) => {
    setCurrentlyPlaying(stringKey);
    playGuitarString(stringKey, volume);
    
    // 2.5초 후에 재생 상태 초기화
    setTimeout(() => {
      setCurrentlyPlaying(null);
    }, 2500);
  };

  const getStringColor = (stringKey: string) => {
    if (currentlyPlaying === stringKey) return '#E5A45C'; // 재생 중일 때 오렌지
    return '#8B7AAE'; // 기본 보라색
  };

  return (
    <div className="h-full bg-cream flex flex-col">
      {/* 커스텀 스크롤바 스타일 */}
      <style jsx>{`
        .tuner-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .tuner-scroll::-webkit-scrollbar-track {
          background: #F5F3E7;
          border-radius: 4px;
        }
        .tuner-scroll::-webkit-scrollbar-thumb {
          background: #8B7AAE;
          border-radius: 4px;
          border: 1px solid #2C2C2C;
        }
        .tuner-scroll::-webkit-scrollbar-thumb:hover {
          background: #A394C7;
        }
      `}</style>
      {/* 헤더 */}
      <div className="bg-album-purple bg-opacity-20 border-b-2 border-retro-black p-3">
        <h2 className="text-lg font-bold text-retro-black text-center mb-1">
          🎸 Guitar Tuner
        </h2>
        <p className="text-xs text-retro-black text-center opacity-80">
          클릭하여 기타 표준 음정을 듣기
        </p>
      </div>

      {/* 메인 튜너 영역 */}
      <div 
        className={`flex-1 ${mainPadding} overflow-y-auto tuner-scroll`}
        style={{
          // Firefox 스크롤바 스타일
          scrollbarWidth: 'thin',
          scrollbarColor: '#8B7AAE #F5F3E7'
        }}
      >
        
        {/* 디지털 디스플레이 */}
        <div className="bg-retro-black rounded-lg p-3 mb-4 border-2 border-album-blue">
          <div className="bg-album-blue bg-opacity-20 rounded p-2 text-center">
            <div className="text-xs text-cream mb-1">STANDARD TUNING</div>
            <div className="text-lg font-mono text-cream">
              {currentlyPlaying ? 
                `${guitarStrings[currentlyPlaying as keyof typeof guitarStrings].note} - ${guitarStrings[currentlyPlaying as keyof typeof guitarStrings].frequency.toFixed(2)} Hz` : 
                'E A D G B E'
              }
            </div>
            {currentlyPlaying && (
              <div className="text-xs text-album-orange mt-1">
                {guitarStrings[currentlyPlaying as keyof typeof guitarStrings].string}번줄 재생 중...
              </div>
            )}
          </div>
        </div>

        {/* 기타 줄 표현 및 컨트롤 */}
        <div className="space-y-3 mb-4">
          {orderedStrings.map(({ key, note, frequency, string, thickness }) => (
            <div key={key} className="flex items-center gap-3">
              {/* 줄 번호 */}
              <div className="w-7 text-center">
                <div className="text-sm font-bold text-retro-black">{string}</div>
                <div className="text-xs text-retro-black opacity-60">번줄</div>
              </div>
              
              {/* 기타 줄 시각화 */}
              <div className="flex-1 relative h-7 bg-album-blue bg-opacity-10 rounded-lg border border-retro-black flex items-center">
                <div 
                  className="w-full mx-2 rounded-full transition-all duration-300"
                  style={{ 
                    height: `${thickness * 2}px`,
                    backgroundColor: getStringColor(key),
                    boxShadow: currentlyPlaying === key ? '0 0 6px rgba(229, 164, 92, 0.6)' : 'none'
                  }}
                />
              </div>
              
              {/* 음정 및 주파수 정보 */}
              <div className="w-14 text-center">
                <div className="text-base font-bold text-retro-black">{note}</div>
                <div className="text-xs text-retro-black opacity-60">
                  {frequency.toFixed(1)}Hz
                </div>
              </div>
              
              {/* 재생 버튼 */}
              <button
                onClick={() => handleStringClick(key as keyof typeof guitarStrings)}
                disabled={currentlyPlaying !== null}
                className={`w-14 h-7 rounded-lg font-medium text-sm border-2 transition-all ${
                  currentlyPlaying === key
                    ? 'bg-album-orange text-retro-black border-album-orange animate-pulse'
                    : currentlyPlaying !== null
                    ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
                    : 'bg-album-purple text-cream border-album-purple hover:bg-opacity-80 hover:scale-105'
                }`}
              >
                {currentlyPlaying === key ? '재생중' : '♪'}
              </button>
            </div>
          ))}
        </div>

        {/* 볼륨 컨트롤 */}
        <div className="bg-album-blue bg-opacity-10 rounded-lg p-3 border border-retro-black">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-retro-black w-16">볼륨:</div>
            <div className="flex-1">
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-2 bg-album-purple bg-opacity-30 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #8B7AAE 0%, #8B7AAE ${(volume / 0.8) * 100}%, #E8E8E8 ${(volume / 0.8) * 100}%, #E8E8E8 100%)`
                }}
              />
            </div>
            <div className="text-sm text-retro-black w-12 text-right">
              {Math.round(volume * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* 하단 정보 */}
      <div className="bg-album-purple bg-opacity-20 border-t-2 border-retro-black p-2 flex-shrink-0">
        <div className="text-xs text-retro-black text-center opacity-80">
          표준 튜닝 (E-A-D-G-B-E) • 각 음은 2.5초간 재생됩니다
        </div>
      </div>
    </div>
  );
}