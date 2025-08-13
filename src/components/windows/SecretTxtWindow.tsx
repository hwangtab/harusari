'use client';

import { useState, useEffect } from 'react';

interface SecretTxtWindowProps {
  windowId: string;
}

export default function SecretTxtWindow({ windowId: _ }: SecretTxtWindowProps) {
  const [content, setContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCommand, setShowCommand] = useState(false);

  const secretContent = `========================================================
                              🎉 축하합니다! 🎉
========================================================

                    하루살이 프로젝트 2: 알 수 없는 느낌
                        앨범 퀴즈를 모두 맞추셨네요!

--------------------------------------------------------

정말 대단합니다! 앨범에 대해 깊이 알고 계시는군요.
이 곡들이 여러분의 마음에 닿았다면, 그것만으로도 충분히 기쁩니다.

🎵 음원 다운로드 링크:

https://drive.google.com/drive/folders/18JuRA2luy8AWM69_e3j2JVdGZ6KKrIc3?usp=sharing

위 링크에서 모든 트랙을 고품질로 다운로드하실 수 있습니다.
개인적인 용도로만 사용해 주시고, 
음악을 사랑해 주셔서 진심으로 감사드립니다.


💝 특별 감사 인사:

이 앨범을 끝까지 들어주시고, 
웹사이트의 구석구석까지 탐험해 주신 여러분께 
진심으로 감사드립니다.

음악이 삶에 작은 위로가 되기를 바라며,
여러분의 하루하루가 따뜻하고 알 수 없는 느낌들로 
가득하기를 바랍니다.


--------------------------------------------------------
                         사랑을 담아, 김지혜 올림
                         Harusari Project 2025
========================================================`;

  const isComplete = currentIndex >= secretContent.length;

  // Simulate command typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCommand(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isComplete) return;

    const timer = setTimeout(() => {
      setContent(secretContent.substring(0, currentIndex + 1));
      setCurrentIndex(currentIndex + 1);
    }, 20);

    return () => clearTimeout(timer);
  }, [currentIndex, isComplete]);

  // Extract and make download link clickable
  const renderContentWithLink = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Check if line contains Google Drive link
      if (line.includes('https://drive.google.com')) {
        const linkMatch = line.match(/(https:\/\/drive\.google\.com[^\s]+)/);
        if (linkMatch) {
          const beforeLink = line.substring(0, line.indexOf(linkMatch[0]));
          const afterLink = line.substring(line.indexOf(linkMatch[0]) + linkMatch[0].length);
          
          return (
            <div key={index} className="text-green-400 break-words">
              {beforeLink}
              <a 
                href={linkMatch[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-200 underline hover:text-green-100 hover:no-underline transition-colors cursor-pointer font-bold"
              >
                {linkMatch[0]}
              </a>
              {afterLink}
            </div>
          );
        }
      }
      
      // Regular line formatting
      if (line.includes('🎉') || line.includes('💝')) {
        return (
          <div key={index} className="text-yellow-300 font-bold text-center break-words">
            {line}
          </div>
        );
      } else if (line.includes('=') || line.includes('-')) {
        return (
          <div key={index} className="text-green-700 text-center">
            {line}
          </div>
        );
      } else if (line.includes('하루살이 프로젝트') || line.includes('Harusari Project')) {
        return (
          <div key={index} className="text-green-300 font-bold text-center break-words">
            {line}
          </div>
        );
      } else if (line.includes('🎵') || line.includes('음원 다운로드')) {
        return (
          <div key={index} className="text-cyan-300 font-bold break-words">
            {line}
          </div>
        );
      } else if (line.trim() === '') {
        return <div key={index} className="h-2"></div>;
      } else {
        return (
          <div key={index} className="text-green-400 break-words">
            {line}
          </div>
        );
      }
    });
  };

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
            <span className="text-white">cat secret.txt</span>
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
        <div className="space-y-1">
          {renderContentWithLink(content)}
          
          {/* Cursor */}
          {!isComplete && (
            <span className="animate-pulse text-green-400">█</span>
          )}
        </div>
        
        {/* Completion celebration */}
        {isComplete && (
          <div className="mt-8 text-center">
            <div className="text-2xl animate-bounce">🎊</div>
            <div className="text-green-300 mt-2 animate-pulse">
              퀴즈 완료 보상을 획득하셨습니다!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}