'use client';

import { useState, useEffect } from 'react';

interface CreditWindowProps {
  windowId: string;
}

const creditSections = [
  {
    type: 'title',
    content: 'Credit'
  },
  {
    type: 'credit',
    content: '작사, 작곡, 편곡, 녹음: 김지혜'
  },
  {
    type: 'credit',
    content: '믹싱, 마스터링: 황경하 (@스튜디오 놀)'
  },
  {
    type: 'credit', 
    content: '디자인: 김한샘 (@오와오와 스튜디오)'
  },
  {
    type: 'credit',
    content: '뮤직비디오: 송창식, 신명'
  },
  {
    type: 'copyright',
    content: '© & ℗ Harusali Project, 2025. All rights of the producer and of the owner of the work reproduced reserved. Unauthorised copying, hiring, lending, public performance and broadcasting of this recording prohibited.'
  }
];

export default function CreditWindow({ windowId: _ }: CreditWindowProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [displayedSections, setDisplayedSections] = useState<Array<{ type: string; content: string }>>([]);
  const [showCommand, setShowCommand] = useState(false);

  const isComplete = currentSectionIndex >= creditSections.length;

  // Simulate command typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCommand(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isComplete) return;

    const currentSection = creditSections[currentSectionIndex];
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

  const currentSection = !isComplete ? creditSections[currentSectionIndex] : null;
  const currentDisplayText = currentSection ? currentSection.content.substring(0, currentCharIndex) : '';

  const renderSection = (section: { type: string; content: string }, isTyping = false, displayText?: string) => {
    const text = isTyping ? displayText : section.content;
    
    if (section.type === 'title') {
      return (
        <h2 className="text-lg font-bold mb-6 text-green-300">
          {text}
          {isTyping && !isComplete && <span className="animate-pulse text-green-400">█</span>}
        </h2>
      );
    } else if (section.type === 'credit') {
      // Parse content to handle links
      if (section.content.includes('@스튜디오 놀')) {
        const parts = text?.split('(@스튜디오 놀)') || [''];
        return (
          <div className="text-green-400 break-words">
            <strong className="text-green-300">믹싱, 마스터링:</strong> 황경하 (
            {parts[0]?.includes('황경하') && (
              <a 
                href="https://studionol.co.kr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-200 underline hover:text-green-100 hover:no-underline transition-colors cursor-pointer"
              >
                @스튜디오 놀
              </a>
            )}
            {!parts[0]?.includes('황경하') && text}
            )
            {isTyping && !isComplete && <span className="animate-pulse text-green-400">█</span>}
          </div>
        );
      } else if (section.content.includes('@오와오와 스튜디오')) {
        const parts = text?.split('(@오와오와 스튜디오)') || [''];
        return (
          <div className="text-green-400 break-words">
            <strong className="text-green-300">디자인:</strong> 김한샘 (
            {parts[0]?.includes('김한샘') && (
              <a 
                href="https://www.instagram.com/owaowa_studio" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-200 underline hover:text-green-100 hover:no-underline transition-colors cursor-pointer"
              >
                @오와오와 스튜디오
              </a>
            )}
            {!parts[0]?.includes('김한샘') && text}
            )
            {isTyping && !isComplete && <span className="animate-pulse text-green-400">█</span>}
          </div>
        );
      } else {
        // Split at colon for bold formatting
        const colonIndex = text?.indexOf(':') || -1;
        if (colonIndex > -1) {
          const beforeColon = text?.substring(0, colonIndex + 1);
          const afterColon = text?.substring(colonIndex + 1);
          return (
            <div className="text-green-400 break-words">
              <strong className="text-green-300">{beforeColon}</strong>{afterColon}
              {isTyping && !isComplete && <span className="animate-pulse text-green-400">█</span>}
            </div>
          );
        } else {
          return (
            <div className="text-green-400 break-words">
              {text}
              {isTyping && !isComplete && <span className="animate-pulse text-green-400">█</span>}
            </div>
          );
        }
      }
    } else if (section.type === 'copyright') {
      return (
        <div className="mt-8 pt-4 border-t border-green-700 text-xs opacity-80 text-green-400">
          {text}
          {isTyping && !isComplete && <span className="animate-pulse text-green-400">█</span>}
        </div>
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
            <span className="text-white">cat credit.txt</span>
          ) : (
            <span className="animate-pulse text-green-400">█</span>
          )}
        </div>
      </div>
      
      <div className="h-full overflow-auto p-4 text-sm leading-relaxed break-words" 
           style={{ 
             textShadow: '0 0 5px rgba(34, 197, 94, 0.5)',
             scrollbarColor: '#22c55e #000'
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