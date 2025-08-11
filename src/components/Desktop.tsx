'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import DesktopIcon from './DesktopIcon';
import WindowManager from './WindowManager';
import Taskbar from './Taskbar';
import { playTrashSound } from '@/utils/audioUtils';

const desktopIcons = [
  {
    id: 'albuminfo',
    title: 'albuminfo.txt',
    icon: '/images/icons/readme.svg',
    x: 50,
    y: 50,
    windowComponent: 'AlbuminfoWindow'
  },
  {
    id: 'credit',
    title: 'credit.txt',
    icon: '/images/icons/readme.svg',
    x: 50,
    y: 150,
    windowComponent: 'CreditWindow'
  },
  {
    id: 'music-player',
    title: 'Music Player.exe',
    icon: '/images/icons/music-player.svg',
    x: 150,
    y: 50,
    windowComponent: 'MusicPlayerWindow'
  },
  {
    id: 'images',
    title: 'images/',
    icon: '/images/icons/folder.svg',
    x: 250,
    y: 50,
    windowComponent: 'ImageViewerWindow'
  },
  {
    id: 'trash',
    title: 'trashcan.ico',
    icon: '/images/icons/trash.svg',
    x: 350,
    y: 50,
    windowComponent: null // No window opens, just plays sound
  }
];

export default function Desktop() {
  const { openWindow, hiddenFileRevealed, revealHiddenFile } = useStore();
  const [clickCount, setClickCount] = useState(0);
  const [iconPositions, setIconPositions] = useState(
    desktopIcons.reduce((acc, icon) => {
      acc[icon.id] = { x: icon.x, y: icon.y };
      return acc;
    }, {} as Record<string, { x: number; y: number }>)
  );

  // Calculate optimal height for MusicPlayer based on content
  const calculateMusicPlayerHeight = () => {
    const headerHeight = 30;      // Player header
    const trackInfoHeight = 60;   // Current track info
    const visualHeight = 48;      // Visualization area  
    const progressHeight = 40;    // Progress bar
    const controlsHeight = 50;    // Control buttons
    const volumeHeight = 40;      // Volume slider
    const trackListHeader = 30;   // "Track List:" header
    const trackItemHeight = 25;   // Height per track
    const lyricsButtonHeight = 45; // Lyrics button
    const padding = 48;           // Top/bottom padding (24px * 2)
    const tracksCount = 13;       // Number of tracks
    
    return headerHeight + trackInfoHeight + visualHeight + 
           progressHeight + controlsHeight + volumeHeight + 
           trackListHeader + (tracksCount * trackItemHeight) + 
           lyricsButtonHeight + padding;
  };

  // Get optimal window size based on component type
  const getOptimalWindowSize = (component: string) => {
    const screenWidth = typeof globalThis !== 'undefined' ? globalThis.innerWidth : 1200;
    const screenHeight = typeof globalThis !== 'undefined' ? globalThis.innerHeight : 800;
    
    const maxWidth = Math.floor(screenWidth * 0.9);
    const maxHeight = Math.floor(screenHeight * 0.9);
    
    switch(component) {
      case 'MusicPlayerWindow': 
        const optimalHeight = calculateMusicPlayerHeight();
        return { 
          width: Math.min(400, maxWidth), 
          height: Math.min(optimalHeight, maxHeight) 
        };
      case 'ImageViewerWindow': 
        return { 
          width: Math.min(580, maxWidth), 
          height: Math.min(720, maxHeight) 
        };
      case 'ReadmeWindow': 
        return { 
          width: Math.min(500, maxWidth), 
          height: Math.min(400, maxHeight) 
        };
      case 'LyricsWindow': 
        return { 
          width: Math.min(400, maxWidth), 
          height: Math.min(500, maxHeight) 
        };
      case 'SecretWindow': 
        return { 
          width: Math.min(350, maxWidth), 
          height: Math.min(250, maxHeight) 
        };
      default: 
        return { 
          width: Math.min(400, maxWidth), 
          height: Math.min(300, maxHeight) 
        };
    }
  };

  const handleIconClick = (icon: typeof desktopIcons[0]) => {
    if (icon.windowComponent) {
      const optimalSize = getOptimalWindowSize(icon.windowComponent);
      
      openWindow({
        id: `window-${icon.id}-${Date.now()}`,
        title: icon.title,
        component: icon.windowComponent,
        x: icon.x + 100,
        y: icon.y + 100,
        width: optimalSize.width,
        height: optimalSize.height,
        isMinimized: false,
        isMaximized: false
      });
    } else if (icon.id === 'trash') {
      // Play noise sound
      playTrashSound();
    }
  };

  const handleIconDoubleClick = (icon: typeof desktopIcons[0]) => {
    if (icon.id === 'images' && icon.windowComponent) {
      const optimalSize = getOptimalWindowSize(icon.windowComponent);
      
      openWindow({
        id: `window-${icon.id}-${Date.now()}`,
        title: icon.title,
        component: icon.windowComponent,
        x: icon.x + 100,
        y: icon.y + 100,
        width: optimalSize.width,
        height: optimalSize.height,
        isMinimized: false,
        isMaximized: false
      });
    }
  };

  const handlePositionChange = (iconId: string, x: number, y: number) => {
    setIconPositions(prev => ({
      ...prev,
      [iconId]: { x, y }
    }));
  };

  const handleDesktopClick = (e: React.MouseEvent) => {
    // Check if clicking on empty desktop area
    if (e.target === e.currentTarget) {
      setClickCount(prev => prev + 1);
      
      // Reveal hidden file after 5 clicks on empty space
      if (clickCount >= 4 && !hiddenFileRevealed) {
        revealHiddenFile();
        setClickCount(0); // Reset click count after revealing
      }
    }
  };

  const hiddenFileIcon = {
    id: 'secret',
    title: 'secret_memo.txt',
    icon: '/images/icons/readme.svg',
    x: Math.random() * (typeof globalThis !== 'undefined' ? globalThis.innerWidth - 100 : 800) || 200,
    y: Math.random() * (typeof globalThis !== 'undefined' ? globalThis.innerHeight - 200 : 600) || 150,
    windowComponent: 'SecretWindow'
  };

  return (
    <div 
      className="relative w-full h-screen overflow-hidden cursor-retro"
      onClick={handleDesktopClick}
    >
      {/* Desktop Icons */}
      {desktopIcons.map((icon) => (
        <DesktopIcon
          key={icon.id}
          icon={icon.icon}
          title={icon.title}
          x={iconPositions[icon.id]?.x || icon.x}
          y={iconPositions[icon.id]?.y || icon.y}
          onClick={() => handleIconClick(icon)}
          onDoubleClick={() => handleIconDoubleClick(icon)}
          onPositionChange={(x, y) => handlePositionChange(icon.id, x, y)}
        />
      ))}
      
      {/* Hidden File Icon */}
      {hiddenFileRevealed && (
        <DesktopIcon
          key={hiddenFileIcon.id}
          icon={hiddenFileIcon.icon}
          title={hiddenFileIcon.title}
          x={hiddenFileIcon.x}
          y={hiddenFileIcon.y}
          onClick={() => handleIconClick(hiddenFileIcon)}
          className="animate-pulse"
        />
      )}
      
      {/* Window Manager */}
      <WindowManager />
      
      {/* Taskbar */}
      <Taskbar />
    </div>
  );
}