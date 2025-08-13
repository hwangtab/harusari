'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import DesktopIcon from './DesktopIcon';
import WindowManager from './WindowManager';
import Taskbar from './Taskbar';
import { playTrashSound } from '@/utils/audioUtils';

// 기본 아이콘 정보 (위치는 동적으로 계산됨)
const desktopIconsData = [
  {
    id: 'albuminfo',
    title: 'albuminfo.txt',
    icon: '/images/icons/readme.svg',
    windowComponent: 'AlbuminfoWindow'
  },
  {
    id: 'credit',
    title: 'credit.txt',
    icon: '/images/icons/readme.svg',
    windowComponent: 'CreditWindow'
  },
  {
    id: 'critic',
    title: 'critic.txt',
    icon: '/images/icons/readme.svg',
    windowComponent: 'CriticWindow'
  },
  {
    id: 'specialthanks',
    title: 'specialthanks.txt',
    icon: '/images/icons/readme.svg',
    windowComponent: 'SpecialThanksWindow'
  },
  {
    id: 'music-player',
    title: 'Music Player.exe',
    icon: '/images/icons/music-player.svg',
    windowComponent: 'MusicPlayerWindow'
  },
  {
    id: 'images',
    title: 'images/',
    icon: '/images/icons/folder.svg',
    windowComponent: 'ImageViewerWindow'
  },
  {
    id: 'trash',
    title: 'trashcan.ico',
    icon: '/images/icons/trash.svg',
    windowComponent: null // No window opens, just plays sound
  },
  {
    id: 'instagram',
    title: 'instagram.html',
    icon: '/images/icons/instagram.svg',
    windowComponent: null // External link, no window
  }
];

export default function Desktop() {
  const { openWindow, hiddenFileRevealed, revealHiddenFile } = useStore();
  const [clickCount, setClickCount] = useState(0);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // 반응형 아이콘 위치 계산
  const getResponsiveIconPositions = () => {
    const iconSize = 80; // 아이콘 + 텍스트 충돌 영역
    const padding = 30;
    const minDistance = screenWidth < 600 ? 60 : 80; // 작은 화면에서는 더 촘촘하게
    
    // 아이콘 배치 가능한 영역
    const minX = padding;
    const maxX = screenWidth - iconSize - padding;
    const minY = padding;
    const maxY = screenHeight - iconSize - 120; // 태스크바 + 여유 공간
    
    const positions: Record<string, { x: number; y: number }> = {};
    const placedPositions: { x: number; y: number }[] = [];
    
    // 시드 기반 랜덤 함수 (개선된 버전)
    const getSeededRandom = (str: string, salt: number = 0) => {
      let hash = salt;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 32비트 정수로 변환
      }
      return Math.abs(hash % 10000) / 10000; // 0-1 사이 값 반환
    };
    
    // 두 점 간 거리 계산
    const getDistance = (pos1: {x: number, y: number}, pos2: {x: number, y: number}) => {
      return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
    };
    
    // 충돌 체크
    const isValidPosition = (newPos: {x: number, y: number}) => {
      return placedPositions.every(existingPos => 
        getDistance(newPos, existingPos) >= minDistance
      );
    };
    
    // 각 아이콘을 완전 랜덤하게 배치
    desktopIconsData.forEach((iconData, index) => {
      let attempts = 0;
      let position = { x: 0, y: 0 };
      
      // 최대 50번 시도하여 충돌하지 않는 위치 찾기
      do {
        const seedX = getSeededRandom(iconData.id, attempts * 2);
        const seedY = getSeededRandom(iconData.id, attempts * 2 + 1);
        
        position = {
          x: minX + seedX * (maxX - minX),
          y: minY + seedY * (maxY - minY)
        };
        
        attempts++;
      } while (!isValidPosition(position) && attempts < 50);
      
      // 50번 시도해도 안 되면 강제 배치 (폴백)
      if (attempts >= 50) {
        position = {
          x: minX + (index * 100) % (maxX - minX),
          y: minY + Math.floor(index * 100 / (maxX - minX)) * 100
        };
      }
      
      positions[iconData.id] = position;
      placedPositions.push(position);
    });
    
    return positions;
  };;;

  const [iconPositions, setIconPositions] = useState(getResponsiveIconPositions());

  // 화면 크기 변경 시 아이콘 위치 재계산
  useEffect(() => {
    setIconPositions(getResponsiveIconPositions());
  }, [screenWidth, screenHeight]);

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
      case 'AlbuminfoWindow':
      case 'CreditWindow': 
      case 'CriticWindow':
      case 'SpecialThanksWindow':
        return { 
          width: Math.min(550, maxWidth), 
          height: Math.min(520, maxHeight) 
        };
      case 'ReadmeWindow': 
        return { 
          width: Math.min(550, maxWidth), 
          height: Math.min(520, maxHeight) 
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

  // Get window position based on icon location and screen dimensions
  const getWindowPosition = (iconX: number, iconY: number, windowWidth: number, windowHeight: number) => {
    // 화면에서 유효한 위치 범위 계산 (아이콘 위치 완전 무시)
    const minX = 20;
    const maxX = Math.max(100, screenWidth - windowWidth - 20);
    const minY = 20;
    const maxY = Math.max(100, screenHeight - windowHeight - 80); // 태스크바 고려
    
    // 화면 전체에서 완전 랜덤 위치 생성
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    
    return { 
      x: Math.round(x), 
      y: Math.round(y) 
    };
  };;

  const handleIconClick = (icon: typeof desktopIconsData[0] & { x: number; y: number }) => {
    if (icon.windowComponent) {
      const optimalSize = getOptimalWindowSize(icon.windowComponent);
      const position = getWindowPosition(
        icon.x,
        icon.y,
        optimalSize.width,
        optimalSize.height
      );
      
      openWindow({
        id: `window-${icon.id}-${Date.now()}`,
        title: icon.title,
        component: icon.windowComponent,
        x: position.x,
        y: position.y,
        width: optimalSize.width,
        height: optimalSize.height,
        isMinimized: false,
        isMaximized: false
      });
    } else if (icon.id === 'trash') {
      // Play noise sound
      playTrashSound();
    } else if (icon.id === 'instagram') {
      // Open Instagram link in new tab
      window.open('https://www.instagram.com/9.17.p.m/', '_blank');
    }
  };

  const handleIconDoubleClick = (icon: typeof desktopIconsData[0] & { x: number; y: number }) => {
    if (icon.id === 'images' && icon.windowComponent) {
      const optimalSize = getOptimalWindowSize(icon.windowComponent);
      const position = getWindowPosition(
        icon.x,
        icon.y,
        optimalSize.width,
        optimalSize.height
      );
      
      openWindow({
        id: `window-${icon.id}-${Date.now()}`,
        title: icon.title,
        component: icon.windowComponent,
        x: position.x,
        y: position.y,
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
    x: Math.random() * (screenWidth - 100) || 200,
    y: Math.random() * (screenHeight - 200) || 150,
    windowComponent: 'SecretWindow'
  };

  return (
    <div 
      className="relative w-full h-screen overflow-hidden cursor-retro"
      onClick={handleDesktopClick}
    >
      {/* Desktop Icons */}
      {desktopIconsData.map((iconData) => {
        const position = iconPositions[iconData.id];
        if (!position) return null;
        
        return (
          <DesktopIcon
            key={iconData.id}
            icon={iconData.icon}
            title={iconData.title}
            x={position.x}
            y={position.y}
            onClick={() => handleIconClick({ ...iconData, x: position.x, y: position.y })}
            onDoubleClick={() => handleIconDoubleClick({ ...iconData, x: position.x, y: position.y })}
            onPositionChange={(x, y) => handlePositionChange(iconData.id, x, y)}
          />
        );
      })}
      
      {/* Hidden File Icon */}
      {hiddenFileRevealed && (
        <DesktopIcon
          key={hiddenFileIcon.id}
          icon={hiddenFileIcon.icon}
          title={hiddenFileIcon.title}
          x={hiddenFileIcon.x}
          y={hiddenFileIcon.y}
          onClick={() => {
            if (hiddenFileIcon.windowComponent) {
              const optimalSize = getOptimalWindowSize(hiddenFileIcon.windowComponent);
              const position = getWindowPosition(
                hiddenFileIcon.x,
                hiddenFileIcon.y,
                optimalSize.width,
                optimalSize.height
              );
              
              openWindow({
                id: `window-${hiddenFileIcon.id}-${Date.now()}`,
                title: hiddenFileIcon.title,
                component: hiddenFileIcon.windowComponent,
                x: position.x,
                y: position.y,
                width: optimalSize.width,
                height: optimalSize.height,
                isMinimized: false,
                isMaximized: false
              });
            }
          }}
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