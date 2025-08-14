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
    title: 'albuminfo',
    icon: '/images/icons/readme.svg',
    windowComponent: 'AlbuminfoWindow'
  },
  {
    id: 'credit',
    title: 'credit',
    icon: '/images/icons/readme.svg',
    windowComponent: 'CreditWindow'
  },
  {
    id: 'critic',
    title: 'critic',
    icon: '/images/icons/readme.svg',
    windowComponent: 'CriticWindow'
  },
  {
    id: 'specialthanks',
    title: 'specialthanks',
    icon: '/images/icons/readme.svg',
    windowComponent: 'SpecialThanksWindow'
  },
  {
    id: 'sketchbook',
    title: 'sketchbook',
    icon: '/images/icons/sketchbook.svg',
    windowComponent: 'SketchbookWindow'
  },
  {
    id: 'quiz',
    title: 'quiz',
    icon: '/images/icons/quiz.svg',
    windowComponent: 'QuizWindow'
  },
  {
    id: 'music-player',
    title: 'Music Player',
    icon: '/images/icons/music-player.svg',
    windowComponent: 'MusicPlayerWindow'
  },
  {
    id: 'images',
    title: 'images',
    icon: '/images/icons/folder.svg',
    windowComponent: 'ImageViewerWindow'
  },
  {
    id: 'trash',
    title: 'trashcan',
    icon: '/images/icons/trash.svg',
    windowComponent: null // No window opens, just plays sound
  },
  {
    id: 'instagram',
    title: 'instagram',
    icon: '/images/icons/instagram.svg',
    windowComponent: null // External link, no window
  }
];

export default function Desktop() {
  const { openWindow } = useStore();
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
  // Calculate optimal height for QuizWindow based on content
  const calculateQuizWindowHeight = () => {
    // 실제 QuizWindow 구조 기반 정확한 높이 계산
    const mainPadding = 32;           // p-4 = 16px * 2 (메인 컨테이너)
    const headerHeight = 100;         // 제목 + 진행상황 텍스트 + p-4 패딩
    const progressBarHeight = 30;     // 진행바 영역 + px-4 py-2 패딩
    const questionAreaPadding = 48;   // p-6 = 24px * 2 (질문 영역 패딩)
    const questionTextHeight = 80;    // text-lg font-bold + leading-relaxed + mb-4
    const feedbackAreaHeight = 64;    // h-12 (48px) + mb-4 (16px) = 고정 피드백 영역
    const questionBottomMargin = 24;  // mb-6 = 질문 섹션 하단 여백
    const answerButtonHeight = 70;    // p-4 패딩 + 텍스트 + border + 한국어 텍스트 높이
    const answerButtonsCount = 4;     // 답변 선택지 4개
    const answerButtonsGap = 48;      // gap-4 = 16px, 3개 간격 = 48px
    const nextButtonArea = 80;        // mt-6 + py-4 + 버튼 텍스트 + 하단 여백
    
    return mainPadding + headerHeight + progressBarHeight + 
           questionAreaPadding + questionTextHeight + feedbackAreaHeight + 
           questionBottomMargin + (answerButtonHeight * answerButtonsCount) + 
           answerButtonsGap + nextButtonArea;
  };;

  // Get optimal window size based on component type
  const getOptimalWindowSize = (component: string) => {
    
    // 화면 크기에 따른 적응형 최대 크기 설정
    const isMobile = screenWidth < 768;
    const isTablet = screenWidth >= 768 && screenWidth < 1024;
    
    let maxWidthRatio, maxHeightRatio;
    
    if (isMobile) {
      // 모바일: 화면의 95% 이하로 제한 (더 보수적)
      maxWidthRatio = 0.95;
      maxHeightRatio = 0.85; // 태스크바와 상태바 고려
    } else if (isTablet) {
      // 태블릿: 화면의 90% 이하로 제한
      maxWidthRatio = 0.9;
      maxHeightRatio = 0.9;
    } else {
      // 데스크톱: 기존대로 90%
      maxWidthRatio = 0.9;
      maxHeightRatio = 0.9;
    }
    
    const maxWidth = Math.floor(screenWidth * maxWidthRatio);
    const maxHeight = Math.floor(screenHeight * maxHeightRatio);
    
    switch(component) {
      case 'MusicPlayerWindow': 
        const optimalHeight = calculateMusicPlayerHeight();
        return { 
          width: Math.min(isMobile ? 350 : 400, maxWidth), 
          height: Math.min(optimalHeight, maxHeight) 
        };
      case 'ImageViewerWindow': 
        return { 
          width: Math.min(isMobile ? 350 : 580, maxWidth), 
          height: Math.min(isMobile ? 500 : 720, maxHeight) 
        };
      case 'SketchbookWindow':
        return { 
          width: Math.min(isMobile ? 350 : 900, maxWidth), 
          height: Math.min(isMobile ? 500 : 700, maxHeight) 
        };
      case 'QuizWindow':
        const optimalQuizHeight = calculateQuizWindowHeight();
        // 화면 크기별 추가 여유공간 (모바일은 더 넉넉하게)
        const quizHeightBuffer = isMobile ? 50 : isTablet ? 30 : 40;
        return { 
          width: Math.min(isMobile ? 350 : 600, maxWidth), 
          height: Math.min(optimalQuizHeight + quizHeightBuffer, maxHeight) 
        };
      case 'AlbuminfoWindow':
      case 'CreditWindow': 
      case 'CriticWindow':
      case 'SpecialThanksWindow':
        return { 
          width: Math.min(isMobile ? 340 : 550, maxWidth), 
          height: Math.min(isMobile ? 450 : 520, maxHeight) 
        };
      case 'ReadmeWindow': 
        return { 
          width: Math.min(isMobile ? 340 : 550, maxWidth), 
          height: Math.min(isMobile ? 450 : 520, maxHeight) 
        };
      case 'LyricsWindow': 
        return { 
          width: Math.min(isMobile ? 320 : 400, maxWidth), 
          height: Math.min(isMobile ? 400 : 500, maxHeight) 
        };
      default: 
        return { 
          width: Math.min(isMobile ? 320 : 400, maxWidth), 
          height: Math.min(isMobile ? 300 : 300, maxHeight) 
        };
    }
  };;

  // Get window position based on icon location and screen dimensions
  const getWindowPosition = (iconX: number, iconY: number, windowWidth: number, windowHeight: number) => {
    // 화면 크기에 따른 적응형 위치 계산
    const isMobile = screenWidth < 768;
    const isTablet = screenWidth >= 768 && screenWidth < 1024;
    
    if (isMobile) {
      // 모바일: 창이 화면 중앙 근처에서만 생성되도록 제한
      const padding = 10;
      const centerX = screenWidth / 2;
      const centerY = (screenHeight - 80) / 2; // 태스크바 고려
      
      // 모바일에서는 창이 화면을 벗어나지 않도록 매우 보수적으로 배치
      const maxOffsetX = Math.min(100, (screenWidth - windowWidth) / 4);
      const maxOffsetY = Math.min(80, (screenHeight - windowHeight - 80) / 4);
      
      const x = Math.max(padding, Math.min(
        screenWidth - windowWidth - padding,
        centerX - windowWidth/2 + (Math.random() - 0.5) * maxOffsetX
      ));
      
      const y = Math.max(padding, Math.min(
        screenHeight - windowHeight - 80,
        centerY - windowHeight/2 + (Math.random() - 0.5) * maxOffsetY
      ));
      
      return { 
        x: Math.round(x), 
        y: Math.round(y) 
      };
    } else if (isTablet) {
      // 태블릿: 중간 정도의 제한
      const padding = 20;
      const minX = padding;
      const maxX = Math.max(minX + 50, screenWidth - windowWidth - padding);
      const minY = padding;
      const maxY = Math.max(minY + 50, screenHeight - windowHeight - 80);
      
      const x = minX + Math.random() * (maxX - minX);
      const y = minY + Math.random() * (maxY - minY);
      
      return { 
        x: Math.round(x), 
        y: Math.round(y) 
      };
    } else {
      // 데스크톱: 기존 로직 유지 (더 자유로운 배치)
      const minX = 20;
      const maxX = Math.max(100, screenWidth - windowWidth - 20);
      const minY = 20;
      const maxY = Math.max(100, screenHeight - windowHeight - 80);
      
      const x = minX + Math.random() * (maxX - minX);
      const y = minY + Math.random() * (maxY - minY);
      
      return { 
        x: Math.round(x), 
        y: Math.round(y) 
      };
    }
  };;;

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



  return (
    <div 
      className="relative w-full h-screen overflow-hidden cursor-retro"
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
      
      {/* Window Manager */}
      <WindowManager />
      
      {/* Taskbar */}
      <Taskbar />
    </div>
  );
}