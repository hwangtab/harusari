'use client';

import { useState, useEffect } from 'react';

interface CriticWindowProps {
  windowId: string;
}

const criticSections = [
  {
    type: 'main-title',
    content: '잔해의 연금술, 감각의 부조리극 \'하루살이 프로젝트\'가 제시한 청취의 새로운 지평'
  },
  {
    type: 'subtitle',
    content: '완벽의 표면 아래, 균열을 통해 응시하는 세계'
  },
  {
    type: 'paragraph',
    content: '어떤 음악은 듣는 것이 아니라, 차라리 \'경험한다\'고 말해야 옳다. \'하루살이 프로젝트\'의 두 번째 앨범 『하루살이 프로젝트 2: 알 수 없는 느낌』은, 디지털 시대의 매끈한 표면에 발생한 하나의 균열과도 같다. 그 틈새로 우리는 익숙한 소리의 잔해와 잊혔던 감각의 파편, 그리고 완벽함이라는 현대적 신화가 붕괴된 자리를 목도하게 된다. 이것은 스트리밍 플랫폼의 플레이리스트와 청취의 효율성을 지배하는 알고리즘의 폭정에 대한 근본적인 회의이자, 의도적으로 오염된 데이터와 실패한 사운드 속에서 가장 진솔한 \'실재\'를 길어 올리려는, 위험하고도 매혹적인 예술적 탐사이기도 하다.'
  },
  {
    type: 'subtitle',
    content: '소음의 고고학과 키치의 전복적 미학'
  },
  {
    type: 'paragraph',
    content: '이 프로젝트에서 아티스트는 전통적인 의미의 작곡가나 연주자를 넘어, 소리의 고고학자이자 음향적 부조리극을 연출하는 감독으로 기능한다. 그의 사운드 팔레트는 최첨단 가상악기의 광택 대신, 우리 주변의 디지털 폐허 속에 잊힌 소리들과 쇄설물들로 채워져 있다. 2번 \'사람생각\'에서 질주하는, 마치 고장 나기 일보 직전의 앰프에서 터져 나오는 듯 건조하고 값싼 퍼즈 기타 톤, 12번 \'그림을 그려\'의 8비트 게임기를 연상시키는 리드 신시사이저는 그 자체로 기술적 한계를 노골적으로 드러낸다. 그러나 이것은 미숙함의 증거가 아닌 것으로 보인다. 오히려 이 \'티 나는 가짜\'의 질감을 숨기지 않고 전면에 내세움으로써, 아티스트는 원본과 복제, 진짜와 가짜의 경계가 무의미해진 디지털 시대의 리얼리즘을 역설적으로 구현한다.'
  },
  {
    type: 'paragraph',
    content: '이러한 \'발견된 소리\'의 미학은 4번 \'새우 까주는 사람\'과 9번 \'다 니맘때로\'에서 구체 음악 - 뮈지크 콩크레트의 현대적 계승으로 이어진다. 정제되지 않은 현장음과 사적인 대화 샘플들은 단순한 효과음을 넘어, 앨범 전체에 다큐멘터리적 질감을 부여하며 청자를 아티스트의 지극히 사적인 시공간으로 초대한다. 여기서 미니멀한 베이스라인과 리듬은 주인공이 아니라, 파편화된 대화들이 흩어지지 않도록 잡아주는 희미한 무대장치에 가깝다. 이는 완벽하게 통제된 스튜디오의 인공성에 반기를 들고, 삶의 예측 불가능하고 불완전한 단면이야말로 예술의 가장 진실한 원천임을 웅변한다. 즉, 이 앨범은 \'만드는\' 음악이 아니라, 이미 존재하는 소리를 \'발견\'하고 그 의미를 \'재구성\'하는 음악이다.'
  },
  {
    type: 'subtitle',
    content: '몽타주로 조립된 감정의 파편들, 그리고 언어의 실패'
  },
  {
    type: 'paragraph',
    content: '본 작의 진정한 성취는 개별 사운드의 실험을 넘어, 그것들을 엮어 한 편의 서사를 완성하는 연출력에 있다. 10번 트랙 \'말 필요없는 노래\'는 이러한 연출력의 정수를 보여준다. 인물의 격정적인 내면을 대변하는 듯한 웅장하고 키치한 오페라풍 신시사이저(효과음)가 겹쳐지고, 그 위로 "안녕하십니까", "잘 부탁드립니다" 같은 감정이 거세된 사회적 언어들이 유령처럼 떠다닌다. 이 기이한 풍경은, 우리의 내면에서 소용돌이치는 거대한 감정의 파도를 정작 우리의 \'언어\'는 얼마나 제대로 담아내지 못하는가에 대한 통렬한 비판이다. 노래에 \'말\'이 필요 없는 이유는, 이미 소리가 모든 것을 말하고 있으며, 동시에 우리의 일상적 언어는 아무것도 말하지 못하고 있기 때문이다.'
  },
  {
    type: 'paragraph',
    content: '8번 트랙 \'예술가는술담배마약커피없이못사나요\' 역시 마찬가지다. 성스러운 합창으로 시작해 제목의 거창한 클리셰를 비웃듯 유치하고 직선적인 펑크 록으로 돌변하는 구성은, 예술가에 대한 낭만화된 통념을 \'커피 중독\'이라는 지극히 세속적인 차원으로 끌어내려와 조롱하는 고도의 풍자다. "당신들이 상상하는 위대한 예술가의 영감이라는 것이, 내가 커피 한 잔 못 마셔 안달하는 것과 본질적으로 무엇이 다른가?"라고 되묻는 듯한 이 전복적인 유머는, 사운드의 극단적인 병치만으로 얼마나 날카로운 사회적 비평이 가능한지를 증명한다. 이처럼 서로 다른 맥락의 소리를 충돌시켜 제3의 의미를 창조하는 방식은, 앨범 전체를 하나의 거대한 몽타주 시퀀스로 기능하게 한다.'
  },
  {
    type: 'paragraph',
    content: '이러한 언어에 대한 불신과 해체는 트랙 제목의 표기 방식에서 가장 영리하게 완성된다. \'알수없느낌\'(없는→없느)과 \'다 니맘때로\'(대로→때로)의 의도적인 오기는, 사전적 의미와 문법적 정확성이라는 \'규칙의 폭력\'에 대한 반란이다. 이는 감정을 제대로 \'발음\'조차 할 수 없는 원초적 상태를 시각적으로 구현한 것이며, 이 앨범이 사운드를 넘어 언어라는 기호 체계 자체에 균열을 내고 있음을 보여준다.'
  },
  {
    type: 'subtitle',
    content: '가장 완벽한 \'불완전함\''
  },
  {
    type: 'paragraph',
    content: '이 모든 실험과 부조리, 유머와 비판은 앨범의 마지막을 장식하는 13번 트랙 \'집중 두 시간\'에서 가장 순수하고 극단적인 형태로 귀결된다. 이 곡에는 기계의 저주파 험 노이즈와 신경을 긁는 고주파음가 오래도록 지속된다. 모든 감정과 서사의 소용돌이를 거친 앨범이 마침내 아무것도 남지 않은 듯한, 창작하는 정신의 배경 소음과도 같은 진공상태로 끝을 맺는 이 파격적인 구성은, 화려한 피날레를 기대하는 청취의 관성을 배반하는 가장 대담한 마침표다.'
  },
  {
    type: 'paragraph',
    content: '『하루살이 프로젝트 2: 알 수 없는 느낌』은 당신의 귀에 익숙한 모든 것을 의심하게 하고, 아름다움의 기준에 대해 질문을 던지며, 소음과 음악의 경계를 위태롭게 넘나든다. 그러나 바로 그 균열과 소음, 서투름과 조악함 속에서 우리는 동시대의 그 어떤 매끈한 사운드보다 더 진실하고 강렬한 \'느낌\'과 마주하게 된다. 이것은 음악을 소비하는 것을 넘어 사유하기를 원하는 이들을 위한, 2025년 한국 대중음악 씬이 기록해야 할 가장 중요한 \'아름다운 실패\'이자 눈부신 성취다. 이 앨범은 잊고 있던 감각의 폐허를 탐사하고 그 속에서 누구도 알려주지 않은 보물을 발견하는, 지독하게 흥미로운 \'공간\'이다.'
  }
];

export default function CriticWindow({ windowId: _ }: CriticWindowProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [displayedSections, setDisplayedSections] = useState<Array<{ type: string; content: string }>>([]);
  const [showCommand, setShowCommand] = useState(false);

  const isComplete = currentSectionIndex >= criticSections.length;

  // Simulate command typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCommand(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isComplete) return;

    const currentSection = criticSections[currentSectionIndex];
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

  const currentSection = !isComplete ? criticSections[currentSectionIndex] : null;
  const currentDisplayText = currentSection ? currentSection.content.substring(0, currentCharIndex) : '';

  const renderSection = (section: { type: string; content: string }, isTyping = false, displayText?: string) => {
    const text = isTyping ? displayText : section.content;
    
    if (section.type === 'main-title') {
      return (
        <h1 className="font-bold text-lg mb-4 text-green-300 break-words">
          {text}
          {isTyping && !isComplete && <span className="animate-pulse text-green-400">█</span>}
        </h1>
      );
    } else if (section.type === 'subtitle') {
      return (
        <h3 className="font-bold text-base mb-2 mt-6 text-green-300 break-words">
          {text}
          {isTyping && !isComplete && <span className="animate-pulse text-green-400">█</span>}
        </h3>
      );
    } else if (section.type === 'paragraph') {
      return (
        <p className="leading-relaxed text-green-400 break-words">
          {text}
          {isTyping && !isComplete && <span className="animate-pulse text-green-300">█</span>}
        </p>
      );
    }
  };

  return (
    <div className="h-full bg-black text-green-400 font-mono relative overflow-hidden">
      {/* Terminal scanline effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-full w-full opacity-10 bg-gradient-to-b from-transparent via-green-400 to-transparent animate-pulse" 
             style={{
               backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34, 197, 94, 0.1) 2px, rgba(34, 197, 94, 0.1) 4px)',
               animation: 'scanline 2s linear infinite'
             }}></div>
      </div>
      
      {/* Terminal header */}
      <div className="bg-gray-900 text-green-300 px-4 py-2 text-xs border-b border-green-700">
        <div className="flex items-center space-x-2">
          <span className="text-green-400">user@harusari-desktop:~$</span>
          {showCommand ? (
            <span className="text-white">cat critic.txt</span>
          ) : (
            <span className="animate-pulse text-green-400">█</span>
          )}
        </div>
      </div>
      
      <div className="h-full overflow-auto p-4 text-sm leading-relaxed break-words" 
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
              {renderSection(section)}
            </div>
          ))}
          
          {/* Current section being typed */}
          {currentSection && (
            <div>
              {renderSection(currentSection, true, currentDisplayText)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}