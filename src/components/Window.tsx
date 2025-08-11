'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useStore, type Window as WindowType } from '@/store/useStore';

interface WindowProps {
  window: WindowType;
  children: React.ReactNode;
}

export default function Window({ window, children }: WindowProps) {
  const { closeWindow, focusWindow, moveWindow, resizeWindow, minimizeWindow, maximizeWindow } = useStore();
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

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
      drag={!window.isMaximized}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{
        left: -window.width + 50,
        right: (typeof globalThis !== 'undefined' ? globalThis.innerWidth : 1200) - 50,
        top: -window.height + 50,
        bottom: (typeof globalThis !== 'undefined' ? globalThis.innerHeight : 800) - 50
      }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(event, info) => {
        setIsDragging(false);
        // Use offset calculation - simple and reliable method
        moveWindow(window.id, window.x + info.offset.x, window.y + info.offset.y);
      }}
    >
      {/* Title Bar */}
      <div 
        ref={dragRef}
        className="window-titlebar flex justify-between items-center"
      >
        <span className="text-retro-black font-bold">{window.title}</span>
        <div className="flex space-x-1">
          <button
            className="w-4 h-4 bg-album-orange hover:bg-album-orange/80 text-xs font-bold text-white border border-retro-black"
            onClick={handleMinimize}
            title="Minimize"
          >
            _
          </button>
          <button
            className="w-4 h-4 bg-album-blue hover:bg-album-blue/80 text-xs font-bold text-white border border-retro-black"
            onClick={handleMaximize}
            title="Maximize"
          >
            □
          </button>
          <button
            className="w-4 h-4 bg-glitch-magenta hover:bg-glitch-magenta/80 text-xs font-bold text-white border border-retro-black"
            onClick={handleClose}
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