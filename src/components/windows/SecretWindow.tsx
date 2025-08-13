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
  
  // Enhanced cyberpunk glitch states
  const [rgbGlitchChars, setRgbGlitchChars] = useState<Set<number>>(new Set());
  const [corruptedChars, setCorruptedChars] = useState<Set<number>>(new Set());
  const [flickerChars, setFlickerChars] = useState<Set<number>>(new Set());
  const [waveEffect, setWaveEffect] = useState(false);
  const [systemGlitch, setSystemGlitch] = useState(false);
  const [scanlinePosition, setScanlinePosition] = useState(-100);

  useEffect(() => {
    if (currentIndex < secretMessage.length) {
      const timer = setTimeout(() => {
        setDisplayText(secretMessage.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
        
        // Enhanced random glitch effects
        const glitchRoll = Math.random();
        
        // Basic glitch (existing)
        if (glitchRoll < 0.02) {
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
        
        // RGB separation glitch
        else if (glitchRoll < 0.035) {
          const newRgbChars = new Set(rgbGlitchChars);
          newRgbChars.add(currentIndex);
          setRgbGlitchChars(newRgbChars);
          
          setTimeout(() => {
            setRgbGlitchChars(prev => {
              const updated = new Set(prev);
              updated.delete(currentIndex);
              return updated;
            });
          }, 400);
        }
        
        // Data corruption
        else if (glitchRoll < 0.045) {
          const newCorruptedChars = new Set(corruptedChars);
          newCorruptedChars.add(currentIndex);
          setCorruptedChars(newCorruptedChars);
          
          setTimeout(() => {
            setCorruptedChars(prev => {
              const updated = new Set(prev);
              updated.delete(currentIndex);
              return updated;
            });
          }, 300);
        }
        
        // Flicker effect
        else if (glitchRoll < 0.055) {
          const newFlickerChars = new Set(flickerChars);
          newFlickerChars.add(currentIndex);
          setFlickerChars(newFlickerChars);
          
          setTimeout(() => {
            setFlickerChars(prev => {
              const updated = new Set(prev);
              updated.delete(currentIndex);
              return updated;
            });
          }, 600);
        }
      }, 30);
      
      return () => clearTimeout(timer);
    } else {
      // Message completed, show heart animation
      setTimeout(() => {
        setHeartAnimation(true);
      }, 1000);
    }
  }, [currentIndex, glitchChars, rgbGlitchChars, corruptedChars, flickerChars]);

  // System-wide glitch effects
  useEffect(() => {
    const systemEffectsInterval = setInterval(() => {
      const effectRoll = Math.random();
      
      // Wave distortion effect
      if (effectRoll < 0.03) {
        setWaveEffect(true);
        setTimeout(() => setWaveEffect(false), 1000);
      }
      
      // System-wide voltage glitch
      else if (effectRoll < 0.06) {
        setSystemGlitch(true);
        setTimeout(() => setSystemGlitch(false), 200);
      }
      
      // Scanline sweep effect
      else if (effectRoll < 0.08) {
        setScanlinePosition(-100);
        const scanlineTimer = setInterval(() => {
          setScanlinePosition(prev => {
            if (prev >= window.innerHeight + 100) {
              clearInterval(scanlineTimer);
              return -100;
            }
            return prev + 10;
          });
        }, 50);
      }
    }, 2000);

    return () => clearInterval(systemEffectsInterval);
  }, []);

  // Enhanced glitch character generator
  const getGlitchChar = (char: string, index: number) => {
    // Data corruption takes priority - use different symbols based on original character
    if (corruptedChars.has(index)) {
      if (char === ' ') return '░'; // Space becomes light shade
      if (/[a-zA-Z가-힣]/.test(char)) {
        // Letters become geometric symbols
        const letterCorruption = ['◊', '◈', '⧫', '◇', '◆', '⬟', '⟐', '⚹', '◎', '○', '●', '◉'];
        return letterCorruption[Math.floor(Math.random() * letterCorruption.length)];
      }
      if (/[0-9]/.test(char)) {
        // Numbers become different numbers or symbols
        const numberCorruption = ['※', '⧨', '⟐', '◆', '▲', '▼', '◀', '▶'];
        return numberCorruption[Math.floor(Math.random() * numberCorruption.length)];
      }
      // Punctuation becomes corrupted punctuation
      const punctCorruption = ['⁂', '※', '⚹', '✦', '✧', '⋆', '★', '☆'];
      return punctCorruption[Math.floor(Math.random() * punctCorruption.length)];
    }
    
    // Basic glitch - more varied based on character type
    if (glitchChars.has(index)) {
      if (char === ' ') return '▒'; // Space becomes medium shade
      if (/[a-zA-Z가-힣]/.test(char)) {
        // Letters become block characters
        const letterGlitch = ['█', '▓', '▒', '░', '▋', '▌', '▍', '▎', '▏', '╳'];
        return letterGlitch[Math.floor(Math.random() * letterGlitch.length)];
      }
      if (/[0-9]/.test(char)) {
        // Numbers become other numbers with random chance
        const numberGlitch = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '█', '▓'];
        return numberGlitch[Math.floor(Math.random() * numberGlitch.length)];
      }
      // Punctuation becomes random symbols
      const punctGlitch = ['◆', '◇', '※', '╳', '▲', '▼', '●', '○'];
      return punctGlitch[Math.floor(Math.random() * punctGlitch.length)];
    }
    
    return char;
  };

  // Get character inline styles for glitch effects
  const getCharacterStyles = (index: number) => {
    const styles: React.CSSProperties = {
      display: 'inline-block',
      transformOrigin: 'center',
    };
    
    if (rgbGlitchChars.has(index)) {
      styles.textShadow = '0.4px 0 0 #ff00c1, -0.4px 0 0 #00fff9';
      styles.animation = 'rgb-shift 0.4s ease-in-out';
    }
    
    if (corruptedChars.has(index)) {
      styles.color = '#f87171'; // text-red-400
      styles.filter = 'brightness(2) contrast(2)';
      styles.animation = 'data-corruption 0.3s ease-in-out';
    }
    
    if (flickerChars.has(index)) {
      styles.filter = 'brightness(1.2) contrast(1.1)';
      styles.textShadow = '0 0 10px rgba(255, 255, 255, 0.8)';
      styles.animation = 'voltage-flicker 0.6s ease-in-out';
    }
    
    if (glitchChars.has(index)) {
      styles.color = 'var(--color-glitch-magenta)';
    }
    
    if (waveEffect) {
      styles.transform = 'translateY(-2px) rotateX(5deg)';
      styles.animation = 'text-wave 1s ease-in-out';
    }
    
    return styles;
  };

  // Render text with line breaks preserved
  const renderTextWithGlitches = (text: string, startIndex: number = 0) => {
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => (
      <div key={lineIndex} className="leading-relaxed">
        {line.split('').map((char, charIndex) => {
          const globalIndex = startIndex + lines.slice(0, lineIndex).join('\n').length + (lineIndex > 0 ? lineIndex : 0) + charIndex;
          const hasAnyGlitch = rgbGlitchChars.has(globalIndex) || corruptedChars.has(globalIndex) || flickerChars.has(globalIndex) || glitchChars.has(globalIndex);
          
          return (
            <motion.span
              key={`${lineIndex}-${charIndex}`}
              style={getCharacterStyles(globalIndex)}
              animate={hasAnyGlitch ? {
                scale: [1, 1.1, 1],
              } : {}}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {getGlitchChar(char, globalIndex)}
            </motion.span>
          );
        })}
        {lineIndex < lines.length - 1 && <br />}
      </div>
    ));
  };

  return (
    <div className={`h-full bg-retro-black text-cream font-system relative overflow-hidden ${
      systemGlitch ? 'animate-[voltage-flicker_0.2s_ease-in-out] brightness-125' : ''
    }`}>
      {/* Scanline effect */}
      {scanlinePosition > -100 && scanlinePosition < window.innerHeight + 100 && (
        <div 
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 z-20 animate-[scanline-noise_0.1s_ease-in-out]"
          style={{ top: `${scanlinePosition}px` }}
        />
      )}

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
              return renderTextWithGlitches(displayText);
            } else {
              // Link found, render with clickable link
              const beforeLink = displayText.substring(0, linkIndex);
              const afterLink = displayText.substring(linkIndex + linkText.length);
              
              return (
                <div>
                  {renderTextWithGlitches(beforeLink, 0)}
                  <motion.span
                    className="text-album-purple underline cursor-pointer hover:text-glitch-cyan"
                    onClick={() => window.open('https://drive.google.com/drive/folders/18JuRA2luy8AWM69_e3j2JVdGZ6KKrIc3?usp=sharing', '_blank')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ display: 'inline-block' }}
                  >
                    {linkText}
                  </motion.span>
                  {renderTextWithGlitches(afterLink, linkIndex + linkText.length)}
                </div>
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