'use client';

import { useState, useEffect } from 'react';

interface SpecialThanksWindowProps {
  windowId: string;
}

const thanksSections = [
  {
    type: 'title',
    content: 'Special Thanks To'
  },
  {
    type: 'subtitle',
    content: '하루살이 프로젝트 2: 알 수 없는 느낌'
  },
  {
    type: 'separator',
    content: '────────────'
  },
  {
    type: 'header',
    content: '특별히 감사드립니다:'
  },
  {
    type: 'person',
    content: '명이'
  },
  {
    type: 'person',
    content: '염정우'
  },
  {
    type: 'person',
    content: '양상아'
  },
  {
    type: 'person',
    content: '박은숙'
  },
  {
    type: 'person',
    content: '봄날의 햇살'
  },
  {
    type: 'person',
    content: '뚱키'
  },
  {
    type: 'person',
    content: '김지현'
  },
  {
    type: 'person',
    content: '한받'
  },
  {
    type: 'person',
    content: '풀꽃'
  },
  {
    type: 'message',
    content: '이 프로젝트는 여러분들의 도움과 지지가 있었기에 완성될 수 있었습니다.'
  },
  {
    type: 'message',
    content: '진심으로 감사드립니다.'
  },
  {
    type: 'footer',
    content: 'Harusali Project 2025'
  }
];

export default function SpecialThanksWindow({ windowId: _ }: SpecialThanksWindowProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [displayedSections, setDisplayedSections] = useState<Array<{ type: string; content: string }>>([]);
  const [showCommand, setShowCommand] = useState(false);

  const isComplete = currentSectionIndex >= thanksSections.length;

  // Simulate command typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCommand(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isComplete) return;

    const currentSection = thanksSections[currentSectionIndex];
    const timer = setTimeout(() => {
      if (currentCharIndex < currentSection.content.length) {
        setCurrentCharIndex(currentCharIndex + 1);
      } else {
        // Section complete, move to next
        setDisplayedSections(prev => [...prev, currentSection]);
        setCurrentSectionIndex(currentSectionIndex + 1);
        setCurrentCharIndex(0);
      }
    }, 30);

    return () => clearTimeout(timer);
  }, [currentSectionIndex, currentCharIndex, isComplete]);

  const currentSection = !isComplete ? thanksSections[currentSectionIndex] : null;
  const currentDisplayText = currentSection ? currentSection.content.substring(0, currentCharIndex) : '';

  const renderSection = (section: { type: string; content: string }, isTyping = false, displayText?: string) => {
    const text = isTyping ? displayText : section.content;
    
    if (section.type === 'title') {
      return (
        <h1 className="text-xl font-bold mb-4 text-white break-words text-center" style={{ textShadow: '0 0 15px currentColor' }}>
          {text}
          {isTyping && !isComplete && <span className="animate-pulse text-green-300">█</span>}
        </h1>
      );
    } else if (section.type === 'subtitle') {
      return (
        <h2 className="text-lg mb-6 text-green-300 break-words text-center">
          {text}
          {isTyping && !isComplete && <span className="animate-pulse text-green-300">█</span>}
        </h2>
      );
    } else if (section.type === 'separator') {
      return (
        <div className="text-green-700 mb-4 text-center">
          {text}
          {isTyping && !isComplete && <span className="animate-pulse text-green-300">█</span>}
        </div>
      );
    } else if (section.type === 'header') {
      return (
        <div className="text-green-300 mb-4 font-semibold">
          {text}
          {isTyping && !isComplete && <span className="animate-pulse text-green-300">█</span>}
        </div>
      );
    } else if (section.type === 'person') {
      return (
        <div className="text-green-300 mb-2 ml-4">
          • {text}
          {isTyping && !isComplete && <span className="animate-pulse text-green-300">█</span>}
        </div>
      );
    } else if (section.type === 'message') {
      return (
        <div className="text-green-300 mb-3 mt-6 break-words">
          {text}
          {isTyping && !isComplete && <span className="animate-pulse text-green-300">█</span>}
        </div>
      );
    } else if (section.type === 'footer') {
      return (
        <div className="mt-8 pt-4 border-t border-green-700 text-green-300 text-center font-semibold">
          {text}
          {isTyping && !isComplete && <span className="animate-pulse text-green-300">█</span>}
        </div>
      );
    }
  };

  return (
    <div className="h-full bg-black text-green-300 font-mono relative overflow-hidden flex flex-col" style={{ textShadow: '0 0 10px currentColor' }}>
      {/* Terminal scanline effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-full w-full opacity-10 bg-gradient-to-b from-transparent via-green-300 to-transparent animate-pulse" 
             style={{
               backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(134, 239, 172, 0.1) 2px, rgba(134, 239, 172, 0.1) 4px)',
               animation: 'scanline 2s linear infinite'
             }}></div>
      </div>
      
      {/* Terminal header */}
      <div className="bg-gray-900 text-green-300 px-4 py-2 text-xs border-b border-green-700 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-green-300">user@harusali-desktop:~$</span>
          {showCommand ? (
            <span className="text-white">cat specialthanks.txt</span>
          ) : (
            <span className="animate-pulse text-green-300">█</span>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 pb-6 text-sm leading-relaxed break-words" 
           style={{ 
             scrollbarColor: '#86efac #000',
             wordBreak: 'keep-all',
             overflowWrap: 'anywhere'
           }}>
        <div className="space-y-2">
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