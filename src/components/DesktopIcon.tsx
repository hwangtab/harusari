'use client';

import { useState, useEffect } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging || hasDragged) return; // 드래그 중이거나 드래그 직후에는 클릭 무시
    e.stopPropagation();
    
    // Trigger glitch effect
    setGlitchActive(true);
    setTimeout(() => setGlitchActive(false), 300);
    
    onClick();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isDragging || hasDragged) return; // 드래그 중이거나 드래그 직후에는 더블클릭 무시
    e.stopPropagation();
    
    if (onDoubleClick) {
      // Trigger glitch effect
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 300);
      
      onDoubleClick();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setHasDragged(false); // 드래그 시작 시 리셋
    setDragStart({
      x: e.clientX - x,
      y: e.clientY - y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && onPositionChange) {
      const newX = Math.max(0, Math.min(screenWidth - 100, e.clientX - dragStart.x));
      const newY = Math.max(0, Math.min(screenHeight - 100, e.clientY - dragStart.y));
      
      // 최소 이동 거리(5px) 이상일 때만 드래그로 인식
      const dragDistance = Math.sqrt(Math.pow(newX - x, 2) + Math.pow(newY - y, 2));
      if (dragDistance > 5) {
        setHasDragged(true);
      }
      
      onPositionChange(newX, newY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    
    // 드래그가 발생했다면 잠시 후 클릭 허용
    if (hasDragged) {
      setTimeout(() => setHasDragged(false), 100);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, onPositionChange, x, y]);

  return (
    <motion.div
      className={`desktop-icon absolute ${isDragging ? 'cursor-move' : 'cursor-hand'} ${className}`}
      style={{ left: x, top: y }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={!isDragging ? { scale: 1.05 } : {}}
      whileTap={!isDragging ? { scale: 0.95 } : {}}
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