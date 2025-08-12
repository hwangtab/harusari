'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';

interface SecretWindowProps {
  windowId: string;
}

const secretMessage = `secret_memo.txt
===============

당신이 이 파일을 찾아냈다는 것은...
정말 놀라운 일이에요.

이 앨범을 만들면서 가장 중요하게 생각한 것은
'완벽하지 않아도 괜찮다'는 메시지였어요.

우리는 모두 깨져있고, 불완전하고, 
때로는 제대로 작동하지 않죠.

하지만 그런 우리의 모습이 
가장 아름다울 수도 있다고 생각해요.

왜냐하면...
우리의 삶도 그렇잖아요?

항상 예상대로 되지 않고,
가끔은 엉뚱한 일들이 일어나고,
계획했던 것과는 전혀 다른 결과가 나와요.

하지만 그런 예측불가능함 속에서
진짜 아름다운 순간들이 태어나는 것 같아요.

이 앨범을 들으시는 분들도
자신의 '깨진' 모습을 사랑해주셨으면 좋겠어요.

완벽하지 않은 우리도
충분히 아름답고 소중하니까요.

P.S. 이 메시지를 찾으신 당신에게
특별한 선물이 있어요... [여기를 클릭하세요]
`;

export default function SecretWindow({ windowId }: SecretWindowProps) {
  const { } = useStore();
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [glitchChars, setGlitchChars] = useState<Set<number>>(new Set());
  const [heartAnimation, setHeartAnimation] = useState(false);

  useEffect(() => {
    if (currentIndex < secretMessage.length) {
      const timer = setTimeout(() => {
        setDisplayText(secretMessage.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
        
        // Random glitch effect
        if (Math.random() < 0.015) {
          const newGlitchChars = new Set(glitchChars);
          newGlitchChars.add(currentIndex);
          setGlitchChars(newGlitchChars);
          
          setTimeout(() => {
            setGlitchChars(prev => {
              const updated = new Set(prev);
              updated.delete(currentIndex);
              return updated;
            });
          }, 200);
        }
      }, 30);
      
      return () => clearTimeout(timer);
    } else {
      // Message completed, show heart animation
      setTimeout(() => {
        setHeartAnimation(true);
      }, 1000);
    }
  }, [currentIndex, glitchChars]);

  // Generate glitched version of character
  const getGlitchChar = (char: string, index: number) => {
    if (!glitchChars.has(index)) return char;
    
    const glitchSymbols = ['█', '▓', '▒', '░', '▋', '▌', '▍', '▎', '▏', '╳', '※', '◆', '◇'];
    return glitchSymbols[Math.floor(Math.random() * glitchSymbols.length)];
  };

  return (
    <div className="h-full bg-retro-black text-cream font-system relative overflow-hidden">
      {/* Matrix-style background effect */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-album-purple text-xs"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, 20, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            {Math.random() > 0.5 ? '0' : '1'}
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 p-4 h-full overflow-auto">
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {(() => {
            // Split text before and after the link
            const linkText = '[여기를 클릭하세요]';
            const linkIndex = displayText.indexOf(linkText);
            
            if (linkIndex === -1) {
              // No link found, render normally
              return displayText.split('').map((char, index) => {
                const isGlitched = glitchChars.has(index);
                return (
                  <motion.span
                    key={index}
                    className={isGlitched ? 'text-glitch-magenta' : ''}
                    animate={isGlitched ? {
                      scale: [1, 1.2, 1],
                      color: ['var(--color-glitch-magenta)', 'var(--color-glitch-cyan)', 'var(--color-glitch-magenta)']
                    } : {}}
                    transition={{ duration: 0.2 }}
                  >
                    {getGlitchChar(char, index)}
                  </motion.span>
                );
              });
            } else {
              // Link found, render with clickable link
              const beforeLink = displayText.substring(0, linkIndex);
              const afterLink = displayText.substring(linkIndex + linkText.length);
              
              return (
                <>
                  {beforeLink.split('').map((char, index) => {
                    const isGlitched = glitchChars.has(index);
                    return (
                      <motion.span
                        key={`before-${index}`}
                        className={isGlitched ? 'text-glitch-magenta' : ''}
                        animate={isGlitched ? {
                          scale: [1, 1.2, 1],
                          color: ['var(--color-glitch-magenta)', 'var(--color-glitch-cyan)', 'var(--color-glitch-magenta)']
                        } : {}}
                        transition={{ duration: 0.2 }}
                      >
                        {getGlitchChar(char, index)}
                      </motion.span>
                    );
                  })}
                  <motion.span
                    className="text-album-purple underline cursor-pointer hover:text-glitch-cyan"
                    onClick={() => window.open('https://drive.google.com/drive/folders/18JuRA2luy8AWM69_e3j2JVdGZ6KKrIc3?usp=sharing', '_blank')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {linkText}
                  </motion.span>
                  {afterLink.split('').map((char, index) => {
                    const adjustedIndex = linkIndex + linkText.length + index;
                    const isGlitched = glitchChars.has(adjustedIndex);
                    return (
                      <motion.span
                        key={`after-${index}`}
                        className={isGlitched ? 'text-glitch-magenta' : ''}
                        animate={isGlitched ? {
                          scale: [1, 1.2, 1],
                          color: ['var(--color-glitch-magenta)', 'var(--color-glitch-cyan)', 'var(--color-glitch-magenta)']
                        } : {}}
                        transition={{ duration: 0.2 }}
                      >
                        {getGlitchChar(char, adjustedIndex)}
                      </motion.span>
                    );
                  })}
                </>
              );
            }
          })()}
          
          {currentIndex < secretMessage.length && (
            <motion.span
              className="text-album-orange"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              ▋
            </motion.span>
          )}
        </div>

        {/* Heart animation after message completion */}
        {heartAnimation && (
          <motion.div
            className="absolute bottom-8 right-8 text-6xl"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: [0, 1.5, 1], 
              rotate: [180, 0, 360],
              color: ['var(--color-glitch-magenta)', 'var(--color-album-orange)', 'var(--color-album-purple)', 'var(--color-glitch-magenta)']
            }}
            transition={{ 
              duration: 2,
              ease: "easeInOut"
            }}
          >
            💜
          </motion.div>
        )}

        {/* Floating particles */}
        {heartAnimation && Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-album-purple text-xs"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              y: [0, -50, -100],
              x: [0, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200],
            }}
            transition={{
              duration: 3,
              delay: i * 0.2,
              ease: "easeOut"
            }}
          >
            ✨
          </motion.div>
        ))}

        {/* Special gift hint */}
        {heartAnimation && (
          <motion.div
            className="absolute bottom-4 left-4 text-xs text-album-orange"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.7] }}
            transition={{ delay: 3, duration: 2 }}
          >
            💝 비밀 메모를 발견했습니다!
          </motion.div>
        )}
      </div>
    </div>
  );
}