'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const bootSequence = [
  'HARUSARI_OS loading...',
  'Checking memory... OK',
  'Initializing sound system... OK',
  'Loading album data... OK',
  'Mounting /dev/unknown_feeling...',
  'Starting desktop environment...',
  'Loading broken GUI components...',
  '',
  '하루살이 프로젝트 2: 알 수 없는 느낌',
  '',
  'Press any key to continue...'
];

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [currentLine, setCurrentLine] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);
  
  // 모바일 최적화를 위한 속도 설정
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const typingSpeed = isMobile ? 8 : 15;  // 모바일에서 더 빠른 타이핑
  const lineDelay = isMobile ? 40 : 75;   // 라인 간 대기시간 단축
  const finalDelay = isMobile ? 200 : 500; // 마지막 대기시간 단축
  const titleTypingSpeed = isMobile ? 15 : 30; // 제목 타이핑 속도

  useEffect(() => {
    if (currentLine < bootSequence.length) {
      const text = bootSequence[currentLine];
      let charIndex = 0;
      
      const typeInterval = setInterval(() => {
        if (charIndex < text.length) {
          setDisplayedText(text.substring(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
          
          // Wait before moving to next line
          setTimeout(() => {
            setCurrentLine(prev => prev + 1);
            setDisplayedText('');
            setIsTyping(true);
          }, currentLine === bootSequence.length - 1 ? finalDelay : lineDelay);
        }
      }, currentLine === bootSequence.length - 3 ? titleTypingSpeed : typingSpeed); // 모바일 최적화된 속도
      
      return () => clearInterval(typeInterval);
    } else {
      // Boot sequence complete, wait then fade out
      setTimeout(() => {
        onComplete();
      }, isMobile ? 150 : 250); // 모바일에서 더 빠른 완료
    }
  }, [currentLine, onComplete]);

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    
    return () => clearInterval(cursorInterval);
  }, []);

  // Handle any key press or touch to skip
  useEffect(() => {
    const handleSkip = () => {
      if (currentLine >= bootSequence.length - 1) {
        onComplete();
      }
    };

    const handleTouch = () => {
      // 모바일에서 터치 시 즉시 스킵
      if (isMobile) {
        onComplete();
      }
    };

    window.addEventListener('keydown', handleSkip);
    window.addEventListener('touchstart', handleTouch);
    
    return () => {
      window.removeEventListener('keydown', handleSkip);
      window.removeEventListener('touchstart', handleTouch);
    };
  }, [currentLine, onComplete, isMobile]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black text-green-300 font-mono text-sm flex flex-col justify-center items-start p-8 z-50"
        style={{ textShadow: '0 0 10px currentColor' }} // CRT 글로우 효과
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="w-full max-w-2xl">
          {/* Display previous lines */}
          {bootSequence.slice(0, currentLine).map((line, index) => (
            <div key={index} className="mb-1">
{line === '하루살이 프로젝트 2: 알 수 없는 느낌' ? (
                <div className="text-white font-bold text-lg my-4" style={{ textShadow: '0 0 15px currentColor' }}>
                  {line}
                </div>
              ) : (
                <div>{line}</div>
              )}
            </div>
          ))}
          
          {/* Current typing line */}
          {currentLine < bootSequence.length && (
            <div className="mb-1">
{bootSequence[currentLine] === '하루살이 프로젝트 2: 알 수 없는 느낌' ? (
                <div className="text-white font-bold text-lg my-4" style={{ textShadow: '0 0 15px currentColor' }}>
                  {displayedText}
                  {showCursor && isTyping && <span className="animate-pulse">|</span>}
                </div>
              ) : (
                <div>
                  {displayedText}
                  {showCursor && isTyping && <span className="animate-pulse">|</span>}
                </div>
              )}
            </div>
          )}
          
          {/* Blinking cursor for "Press any key" */}
          {currentLine >= bootSequence.length - 1 && (
            <motion.div
              className="text-white mt-4"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ▋
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}