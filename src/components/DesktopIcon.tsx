'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';

interface DesktopIconProps {
  icon: string;
  title: string;
  x: number;
  y: number;
  onClick: () => void;
  onDoubleClick?: () => void;
  className?: string;
  onPositionChange?: (x: number, y: number) => void;
}

export default function DesktopIcon({ 
  icon, 
  title, 
  x, 
  y, 
  onClick, 
  onDoubleClick,
  className = '',
  onPositionChange
}: DesktopIconProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Trigger glitch effect
    setGlitchActive(true);
    setTimeout(() => setGlitchActive(false), 300);
    
    onClick();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (onDoubleClick) {
      // Trigger glitch effect
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 300);
      
      onDoubleClick();
    }
  };

  return (
    <motion.div
      className={`desktop-icon absolute cursor-hand ${className}`}
      style={{ left: x, top: y }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      drag
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{
        left: -50,
        right: screenWidth - 100,
        top: -50,
        bottom: screenHeight - 150
      }}
      onDragEnd={(event, info) => {
        if (onPositionChange) {
          const newX = Math.max(0, x + info.offset.x);
          const newY = Math.max(0, y + info.offset.y);
          onPositionChange(newX, newY);
        }
      }}
    >
      <motion.div
        className="relative"
        animate={glitchActive ? {
          x: [0, -2, 2, -2, 2, 0],
          y: [0, 2, -2, 2, -2, 0],
        } : {}}
        transition={{ duration: 0.3 }}
      >
        <Image
          src={icon}
          alt={title}
          width={32}
          height={32}
          className="block mx-auto mb-1"
          draggable={false}
        />
        
        {/* Glitch overlay */}
        {glitchActive && (
          <motion.div
            className="absolute inset-0 mix-blend-difference"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 1, 0, 1, 0],
              backgroundColor: ['#E85D9A', '#5DBCE8', '#E85D9A']
            }}
            transition={{ duration: 0.3 }}
          />
        )}
      </motion.div>
      
      <motion.span
        className={`block text-xs text-center px-1 py-0.5 rounded select-none break-words ${
          isHovered ? 'bg-album-purple bg-opacity-30' : ''
        }`}
        animate={glitchActive ? {
          color: ['#2C2C2C', '#E85D9A', '#5DBCE8', '#2C2C2C']
        } : {}}
        transition={{ duration: 0.3 }}
      >
        {title}
      </motion.span>
    </motion.div>
  );
}