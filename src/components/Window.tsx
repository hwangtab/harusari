'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore, type Window as WindowType } from '@/store/useStore';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';

interface WindowProps {
  window: WindowType;
  children: React.ReactNode;
}

export default function Window({ window, children }: WindowProps) {
  const { closeWindow, focusWindow, moveWindow, resizeWindow, minimizeWindow, maximizeWindow } = useStore();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const handleClose = () => {
    closeWindow(window.id);
  };

  const handleMinimize = () => {
    minimizeWindow(window.id);
  };

  const handleMaximize = () => {
    maximizeWindow(window.id);
  };

  const handleWindowClick = () => {
    focusWindow(window.id);
  };

  const handleTitleBarMouseDown = (e: React.MouseEvent) => {
    if (window.isMaximized) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - window.x,
      y: e.clientY - window.y
    });
  };

  // titlebar ref for event listeners
  const titlebarRef = useRef<HTMLDivElement>(null);

  const handleTitleBarTouchStart = (e: TouchEvent) => {
    if (window.isMaximized) return;
    
    // 버튼 영역 터치인지 확인
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return; // 버튼 영역에서는 드래그 시작하지 않음
    }
    
    e.preventDefault(); // 이제 passive: false로 작동함
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - window.x,
      y: touch.clientY - window.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    // 화면 크기에 따른 적응형 경계 제한
    const isMobile = screenWidth < 768;
    const isTablet = screenWidth >= 768 && screenWidth < 1024;
    
    let minVisibleWidth, minVisibleHeight;
    
    if (isMobile) {
      // 모바일: 창의 80% 이상이 화면 안에 보이도록
      minVisibleWidth = Math.min(window.width * 0.8, window.width - 20);
      minVisibleHeight = Math.min(window.height * 0.8, window.height - 20);
    } else if (isTablet) {
      // 태블릿: 창의 60% 이상이 화면 안에 보이도록
      minVisibleWidth = Math.min(window.width * 0.6, window.width - 50);
      minVisibleHeight = Math.min(window.height * 0.6, window.height - 50);
    } else {
      // 데스크톱: 기존 로직 (100px 정도만 보이면 됨)
      minVisibleWidth = 100;
      minVisibleHeight = 50;
    }
    
    const newX = Math.max(
      -window.width + minVisibleWidth,
      Math.min(screenWidth - minVisibleWidth, e.clientX - dragStart.x)
    );
    const newY = Math.max(
      0, // 제목표시줄이 화면 위로 올라가지 않도록
      Math.min(screenHeight - minVisibleHeight, e.clientY - dragStart.y)
    );
    
    moveWindow(window.id, newX, newY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    
    // 마우스 드래그와 동일한 적응형 경계 제한 적용
    const isMobile = screenWidth < 768;
    const isTablet = screenWidth >= 768 && screenWidth < 1024;
    
    let minVisibleWidth, minVisibleHeight;
    
    if (isMobile) {
      // 모바일: 창의 80% 이상이 화면 안에 보이도록
      minVisibleWidth = Math.min(window.width * 0.8, window.width - 20);
      minVisibleHeight = Math.min(window.height * 0.8, window.height - 20);
    } else if (isTablet) {
      // 태블릿: 창의 60% 이상이 화면 안에 보이도록
      minVisibleWidth = Math.min(window.width * 0.6, window.width - 50);
      minVisibleHeight = Math.min(window.height * 0.6, window.height - 50);
    } else {
      // 데스크톱: 기존 로직 (100px 정도만 보이면 됨)
      minVisibleWidth = 100;
      minVisibleHeight = 50;
    }
    
    const newX = Math.max(
      -window.width + minVisibleWidth,
      Math.min(screenWidth - minVisibleWidth, touch.clientX - dragStart.x)
    );
    const newY = Math.max(
      0, // 제목표시줄이 화면 위로 올라가지 않도록
      Math.min(screenHeight - minVisibleHeight, touch.clientY - dragStart.y)
    );
    
    moveWindow(window.id, newX, newY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // titlebar 터치 이벤트 리스너 (passive: false)
  useEffect(() => {
    const titlebar = titlebarRef.current;
    if (!titlebar) return;

    titlebar.addEventListener('touchstart', handleTitleBarTouchStart, { passive: false });
    return () => titlebar.removeEventListener('touchstart', handleTitleBarTouchStart);
  }, [window.isMaximized]);

  // 전역 마우스 및 터치 이벤트 리스너
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, dragStart, window.x, window.y]);

  if (window.isMinimized) {
    return null; // Window is minimized, don't render
  }

  return (
    <motion.div
      className="window"
      style={{
        width: window.isMaximized ? '100vw' : window.width,
        height: window.isMaximized ? 'calc(100vh - 40px)' : window.height,
        zIndex: window.zIndex,
      }}
      onClick={handleWindowClick}
      initial={{ scale: 0.8, opacity: 0, x: window.x, y: window.y }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        x: window.isMaximized ? 0 : window.x,
        y: window.isMaximized ? 0 : window.y
      }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Title Bar */}
      <div 
        ref={titlebarRef}
        className={`window-titlebar flex justify-between items-center ${isDragging ? 'cursor-move' : 'cursor-default'}`}
        onMouseDown={handleTitleBarMouseDown}
      >
        <span className="text-retro-black font-bold">{window.title}</span>
        <div className="flex space-x-1">
          <button
            className={`${screenWidth < 768 ? 'w-8 h-8 text-sm p-1' : 'w-5 h-5 text-xs'} bg-album-orange hover:bg-album-orange/80 active:bg-album-orange/60 font-bold text-white border border-retro-black flex items-center justify-center transition-colors touch-manipulation`}
            onClick={handleMinimize}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            title="Minimize"
          >
            _
          </button>
          <button
            className={`${screenWidth < 768 ? 'w-8 h-8 text-sm p-1' : 'w-5 h-5 text-xs'} bg-album-blue hover:bg-album-blue/80 active:bg-album-blue/60 font-bold text-white border border-retro-black flex items-center justify-center transition-colors touch-manipulation`}
            onClick={handleMaximize}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            title="Maximize"
          >
            □
          </button>
          <button
            className={`${screenWidth < 768 ? 'w-8 h-8 text-sm p-1' : 'w-5 h-5 text-xs'} bg-glitch-magenta hover:bg-glitch-magenta/80 active:bg-glitch-magenta/60 font-bold text-white border border-retro-black flex items-center justify-center transition-colors touch-manipulation`}
            onClick={handleClose}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="window-content" style={{ height: screenWidth < 768 ? 'calc(100% - 62px)' : 'calc(100% - 36px)' }}>
        {children}
      </div>

      {/* Resize Handle */}
      {!window.isMaximized && (
        <div 
          className="absolute bottom-0 right-0 w-4 h-4 bg-retro-black cursor-se-resize"
          onMouseDown={(e) => {
            e.preventDefault();
            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = window.width;
            const startHeight = window.height;

            const handleMouseMove = (e: MouseEvent) => {
              const newWidth = Math.max(200, startWidth + (e.clientX - startX));
              const newHeight = Math.max(150, startHeight + (e.clientY - startY));
              resizeWindow(window.id, newWidth, newHeight);
            };

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        />
      )}
    </motion.div>
  );
}