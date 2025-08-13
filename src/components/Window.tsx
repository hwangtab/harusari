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

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = Math.max(
      -window.width + 50,
      Math.min(screenWidth - 50, e.clientX - dragStart.x)
    );
    const newY = Math.max(
      -window.height + 50,
      Math.min(screenHeight - 50, e.clientY - dragStart.y)
    );
    
    moveWindow(window.id, newX, newY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 전역 마우스 이벤트 리스너
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
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
        ref={dragRef}
        className={`window-titlebar flex justify-between items-center ${isDragging ? 'cursor-move' : 'cursor-default'}`}
        onMouseDown={handleTitleBarMouseDown}
      >
        <span className="text-retro-black font-bold">{window.title}</span>
        <div className="flex space-x-1">
          <button
            className="w-4 h-4 bg-album-orange hover:bg-album-orange/80 text-xs font-bold text-white border border-retro-black flex items-center justify-center"
            onClick={handleMinimize}
            onMouseDown={(e) => e.stopPropagation()}
            title="Minimize"
          >
            _
          </button>
          <button
            className="w-4 h-4 bg-album-blue hover:bg-album-blue/80 text-xs font-bold text-white border border-retro-black"
            onClick={handleMaximize}
            onMouseDown={(e) => e.stopPropagation()}
            title="Maximize"
          >
            □
          </button>
          <button
            className="w-4 h-4 bg-glitch-magenta hover:bg-glitch-magenta/80 text-xs font-bold text-white border border-retro-black"
            onClick={handleClose}
            onMouseDown={(e) => e.stopPropagation()}
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="window-content overflow-auto" style={{ height: 'calc(100% - 28px)' }}>
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