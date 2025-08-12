'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AlbuminfoWindowProps {
  windowId: string;
}

const albumInfoSections = [
  {
    type: 'subtitle',
    content: '"완벽하지 않은 균열 속에서 피어나는 예술적 가치"'
  },
  {
    type: 'paragraph',
    content: '하루살이 프로젝트의 데뷔 앨범 \'알 수 없는 느낌\'은 현대 음악의 규범과 형식을 해체하고 재구성한 실험적 걸작이다. 개러지밴드라는 디지털 도구로 탄생한 13개의 트랙은 로파이(Lo-fi) 미학과 DIY 정신의 절묘한 조화를 보여준다. 기존 음악의 문법에서 벗어나 자신만의 독특한 사운드스케이프를 구축하는 이 앨범은, 한국 인디 씬에 신선한 충격을 안겨줄 것이다.'
  },
  {
    type: 'paragraph', 
    content: '앨범의 핵심은 \'의도된 불완전함\'이라는 미학적 전략이다. 박자가 어긋나고 화음이 맞지 않는 순간들은 역설적으로 음악에 생명력을 불어넣는다. 특히 \'집을 나선 고양이\'에서 들리는 즉흥적인 야옹소리는 이 앨범의 정체성을 상징적으로 보여준다. 계산된 실수와 즉흥성이 만들어내는 독특한 질감은 청자에게 새로운 청각적 경험을 선사한다. 이는 마치 현대 미술에서 보이는 우연성의 미학을 음악으로 옮겨놓은 듯한 인상을 준다.'
  },
  {
    type: 'paragraph',
    content: '감정선의 폭도 인상적이다. \'괴로워\'는 기계음과 날것의 보컬이 충돌하며 현대인의 고립감을 표현하고, \'지 않았다\'는 세계악기와 전자음의 충돌로 실존적 고민을 드러낸다. \'아침밥 먹은 날에 더 배고파\'는 일상의 소소한 관찰을 유머러스하게 승화시키며, 현대인의 일상을 섬세하게 포착한다. 각 트랙은 마치 일기장의 한 페이지처럼 진솔하면서도, 실험적인 사운드로 감정을 증폭시킨다.'
  },
  {
    type: 'paragraph',
    content: '음악적 실험성은 이 앨범의 또 다른 매력이다. 인스트루멘탈 트랙 \'새우까주는 사람\'은 베이스 솔로를 중심으로 한 밴드 사운드를 혁신적으로 재해석하며, \'사람생각\'은 다양한 세계악기 사운드를 실험적으로 조합해 독특한 음향적 풍경을 그려낸다. 특히 인도 전통 타악기와 현대적 일렉트로닉 사운드의 결합은 동서양의 경계를 자유롭게 넘나든다.'
  },
  {
    type: 'paragraph',
    content: '제작 방식에서도 주목할 만한 혁신성이 돋보인다. 개러지밴드라는 디지털 워크스테이션을 자신만의 악기이자 스튜디오로 재해석한 점이 인상적이다. 특히 전자음향과 아날로그 사운드의 충돌, 샘플링과 라이브 연주의 유기적 결합은 현대 음악 제작의 새로운 가능성을 제시한다. 하루살이 프로젝트는 이를 통해 홈 레코딩의 한계를 뛰어넘어, 오히려 그 제약을 독창적 사운드로 승화시키는데 성공했다.'
  },
  {
    type: 'paragraph',
    content: '이 앨범은 2000년대 초반 곤충스님 윤키의 \'관광수월래\'가 보여준 실험정신을 현대적으로 계승하면서도, Z세대의 감성으로 재해석했다는 평가를 받는다. 특히 주목할 만한 점은, 윤키가 보여준 아방가르드한 실험성을 보다 친근하고 대중적인 방식으로 풀어냈다는 것이다. 음악적 완벽무결함보다는 표현의 자유로움을 추구하는 이 작품은, 현대 음악계에 도발적인 질문을 던진다.'
  },
  {
    type: 'paragraph',
    content: '"더 잘나기만을 원하고 더 똑똑해지려고 하는 사회에서 조금 구리고, 완성도 없어 보이는 화음도 잘 맞지 않은 노래들도 있을 수 있지 않은가?"라는 아티스트의 물음은, 현대 음악계의 과도한 완벽주의와 상업주의에 대한 의미 있는 도전장이다. 이는 단순한 반항이 아닌, 음악의 본질에 대한 깊은 성찰을 담고 있다.'
  },
  {
    type: 'paragraph',
    content: '앨범 전반에 흐르는 \'불완전한 완전함\'은 우리 시대의 모순을 정확하게 짚어낸다. 완벽해 보이지만 어딘가 공허한 현대 음악계에, 투박하지만 진정성 있는 새로운 대안을 제시하는 것이다. 이는 마치 키치(Kitsch) 예술이 기존 예술의 권위에 도전장을 내밀었던 것처럼, 음악의 새로운 가능성을 모색하는 시도로 읽힌다.'
  },
  {
    type: 'paragraph',
    content: '이 앨범은 \'음악이란 무엇인가\'라는 본질적 질문을 던지며, 그 답은 아마도 \'알 수 없는 느낌\' 그 자체일 것이다. 정형화된 음악의 틀을 벗어나 자유로운 표현을 추구하는 이들에게, 이 앨범은 새로운 이정표가 될 것이다. 하루살이 프로젝트가 앞으로 보여줄 음악적 여정이 더욱 기대되는 이유다. 완벽하지 않기에 더욱 매력적인, 그래서 더욱 인간적인 이 음악은 우리 시대가 잃어버린 예술의 본질을 다시 한번 일깨워준다.'
  }
];

export default function AlbuminfoWindow({ windowId }: AlbuminfoWindowProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [displayedSections, setDisplayedSections] = useState<Array<{ type: string; content: string }>>([]);
  const [showCommand, setShowCommand] = useState(false);

  const isComplete = currentSectionIndex >= albumInfoSections.length;

  // Simulate command typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCommand(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isComplete) return;

    const currentSection = albumInfoSections[currentSectionIndex];
    const timer = setTimeout(() => {
      if (currentCharIndex < currentSection.content.length) {
        setCurrentCharIndex(currentCharIndex + 1);
      } else {
        // Section complete, move to next
        setDisplayedSections(prev => [...prev, currentSection]);
        setCurrentSectionIndex(currentSectionIndex + 1);
        setCurrentCharIndex(0);
      }
    }, 20);

    return () => clearTimeout(timer);
  }, [currentSectionIndex, currentCharIndex, isComplete]);

  const currentSection = !isComplete ? albumInfoSections[currentSectionIndex] : null;
  const currentDisplayText = currentSection ? currentSection.content.substring(0, currentCharIndex) : '';

  return (
    <div className="h-full bg-black text-green-400 font-mono relative overflow-hidden flex flex-col">
      {/* Terminal scanline effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-full w-full opacity-10 bg-gradient-to-b from-transparent via-green-400 to-transparent animate-pulse" 
             style={{
               backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34, 197, 94, 0.1) 2px, rgba(34, 197, 94, 0.1) 4px)',
               animation: 'scanline 2s linear infinite'
             }}></div>
      </div>
      
      {/* Terminal header */}
      <div className="bg-gray-900 text-green-300 px-4 py-2 text-xs border-b border-green-700 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-green-400">user@harusari-desktop:~$</span>
          {showCommand ? (
            <span className="text-white">cat albuminfo.txt</span>
          ) : (
            <span className="animate-pulse text-green-400">█</span>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 pb-6 text-sm leading-relaxed break-words" 
           style={{ 
             textShadow: '0 0 5px rgba(34, 197, 94, 0.5)',
             scrollbarColor: '#22c55e #000',
             wordBreak: 'keep-all',
             overflowWrap: 'anywhere'
           }}>
        <div className="space-y-4">
          {/* Completed sections */}
          {displayedSections.map((section, index) => (
            <div key={index}>
              {section.type === 'subtitle' ? (
                <h2 className="font-bold text-base mb-3 text-center text-green-300 break-words">
                  {section.content}
                </h2>
              ) : (
                <p className="leading-relaxed text-green-400 break-words">
                  {section.content}
                </p>
              )}
            </div>
          ))}
          
          {/* Current section being typed */}
          {currentSection && (
            <div>
              {currentSection.type === 'subtitle' ? (
                <h2 className="font-bold text-base mb-3 text-center text-green-300 break-words">
                  {currentDisplayText}
                  {!isComplete && <span className="animate-pulse text-green-400">█</span>}
                </h2>
              ) : (
                <p className="leading-relaxed text-green-400 break-words">
                  {currentDisplayText}
                  {!isComplete && <span className="animate-pulse text-green-300">█</span>}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}