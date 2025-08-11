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
          }, currentLine === bootSequence.length - 1 ? 500 : 75);
        }
      }, currentLine === bootSequence.length - 3 ? 30 : 15); // Slower typing for title
      
      return () => clearInterval(typeInterval);
    } else {
      // Boot sequence complete, wait then fade out
      setTimeout(() => {
        onComplete();
      }, 250);
    }
  }, [currentLine, onComplete]);

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    
    return () => clearInterval(cursorInterval);
  }, []);

  // Handle any key press to skip
  useEffect(() => {
    const handleKeyPress = () => {
      if (currentLine >= bootSequence.length - 1) {
        onComplete();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentLine, onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black text-green-400 font-mono text-sm flex flex-col justify-center items-start p-8 z-50"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="w-full max-w-2xl">
          {/* Display previous lines */}
          {bootSequence.slice(0, currentLine).map((line, index) => (
            <div key={index} className="mb-1">
              {line === '하루살이 프로젝트 2: 알 수 없는 느낌' ? (
                <div className="text-yellow-300 font-bold text-lg my-4">
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
                <div className="text-yellow-300 font-bold text-lg my-4">
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