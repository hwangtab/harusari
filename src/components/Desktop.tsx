'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import DesktopIcon from './DesktopIcon';
import WindowManager from './WindowManager';
import Taskbar from './Taskbar';
import { 
  playTrashSound, 
  playMelodySound, 
  playScratchSound, 
  playQuizSound, 
  playShutterSound, 
  playPageFlipSound, 
  playStrumSound, 
  playMailboxSound, 
  playFlashSound,
  playCatMeow 
} from '@/utils/audioUtils';

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
  },
  {
    id: 'email',
    title: 'email',
    icon: '/images/icons/email.svg',
    windowComponent: null // External mailto link, no window
  },
  {
    id: 'tuner',
    title: 'tuner',
    icon: '/images/icons/tuner.svg',
    windowComponent: 'TunerWindow'
  },
  {
    id: 'metronome',
    title: 'metronome',
    icon: '/images/icons/metronome.svg',
    windowComponent: 'MetronomeWindow'
  }
];

export default function Desktop() {
  const { openWindow } = useStore();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // 아이콘별 텍스트 너비 매핑 (text-xs 기준, 안전 마진 포함)
  const getIconTextWidth = useCallback((iconTitle: string) => {
    const textWidthMap: Record<string, number> = {
      'albuminfo': 82,      // 72 + 10px 안전마진
      'credit': 55,         // 45 + 10px
      'critic': 55,         // 45 + 10px  
      'specialthanks': 130, // 115 + 15px (가장 긴 텍스트라 더 큰 마진)
      'sketchbook': 88,     // 78 + 10px
      'quiz': 42,           // 32 + 10px
      'Music Player': 105,  // 90 + 15px (공백 포함 긴 텍스트)
      'images': 58,         // 48 + 10px
      'trashcan': 72,       // 62 + 10px
      'instagram': 100,     // 88 + 12px (자주 겹치는 텍스트)
      'email': 52,          // 42 + 10px
      'tuner': 52,          // 42 + 10px
      'metronome': 85       // 75 + 10px
    };
    
    return textWidthMap[iconTitle] || 75; // 기본값도 증가: 65px → 75px
  }, []);

  // 개별 아이콘별 전체 영역 계산
  const getIconAreaForTitle = useCallback((iconTitle: string) => {
    const isMobile = screenWidth < 768;
    const isTablet = screenWidth >= 768 && screenWidth < 1024;
    
    const iconSize = isMobile ? 24 : isTablet ? 30 : 32;
    const textWidth = getIconTextWidth(iconTitle);
    const textHeight = 12; // text-xs
    const iconTextGap = 4;  // mb-1
    const textPadding = 4;  // py-0.5 * 2
    const horizontalPadding = 8; // px-1 * 2
    
    const totalHeight = iconSize + iconTextGap + textHeight + textPadding;
    const totalWidth = Math.max(iconSize, textWidth) + horizontalPadding;
    
    // 실제 필요 영역 (직사각형)
    return {
      width: totalWidth,
      height: totalHeight,
      // 충돌 검사용 정사각형 영역 (더 큰 값 사용)
      area: Math.max(totalWidth, totalHeight)
    };
  }, [screenWidth, getIconTextWidth]);

  // 해상도별 동적 아이콘 영역 크기 및 최소 거리 계산 (텍스트 포함)
  const getDynamicIconSettings = useCallback(() => {
    const isMobile = screenWidth < 768;
    const isTablet = screenWidth >= 768 && screenWidth < 1024;
    
    const iconSize = isMobile ? 24 : isTablet ? 30 : 32;
    const baseSpacing = isMobile ? 35 : isTablet ? 20 : 25; // 모바일 간격 대폭 증가
    
    // 텍스트 라벨을 포함한 전체 높이 계산
    const textHeight = 12; // text-xs
    const iconTextGap = 4;  // mb-1
    const textPadding = 4;  // py-0.5 * 2
    const totalHeight = iconSize + iconTextGap + textHeight + textPadding;
    
    // 최대 텍스트 너비 고려 (가장 긴 텍스트 기준)
    const maxTextWidth = 90; // "specialthanks", "Music Player" 등
    const totalWidth = Math.max(iconSize, maxTextWidth) + 8; // px-1 * 2
    
    // 전체 영역 크기 (정사각형으로 단순화)
    const totalIconArea = Math.max(totalWidth, totalHeight);
    const minDistance = totalIconArea + baseSpacing;
    
    return { 
      isMobile, 
      isTablet, 
      iconSize, 
      totalIconArea, 
      totalWidth, 
      totalHeight, 
      minDistance 
    };
  }, [screenWidth]);

  // 개선된 겹침 검증 함수 (개별 아이콘 크기 고려)
  const isValidIconPosition = useCallback((
    newPos: { x: number; y: number }, 
    existingPositions: { x: number; y: number; title: string }[], 
    newIconTitle: string,
    baseMinDistance: number
  ) => {
    const newIconArea = getIconAreaForTitle(newIconTitle);
    
    // 화면 경계 검사 (개별 아이콘 크기 고려)
    const padding = 10;
    if (newPos.x < padding || 
        newPos.y < padding || 
        newPos.x + newIconArea.width > screenWidth - padding || 
        newPos.y + newIconArea.height > screenHeight - 80 - padding) {
      return false;
    }
    
    // 다른 아이콘들과의 거리 검사 (개별 크기 고려)
    return existingPositions.every(existingPos => {
      const existingIconArea = getIconAreaForTitle(existingPos.title);
      
      // 두 아이콘 간의 동적 최소 거리 계산
      const combinedArea = Math.max(newIconArea.area, existingIconArea.area);
      const dynamicMinDistance = baseMinDistance + (combinedArea * 0.3); // 크기에 비례한 추가 거리
      
      const dx = Math.abs(newPos.x - existingPos.x);
      const dy = Math.abs(newPos.y - existingPos.y);
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 정밀한 경계 박스 겹침 검사 (실제 너비/높이 사용)
      const boxOverlap = !(newPos.x + newIconArea.width < existingPos.x || 
                           existingPos.x + existingIconArea.width < newPos.x || 
                           newPos.y + newIconArea.height < existingPos.y || 
                           existingPos.y + existingIconArea.height < newPos.y);
      
      return distance >= dynamicMinDistance && !boxOverlap;
    });
  }, [screenWidth, screenHeight, getIconAreaForTitle]);

  // 반응형 아이콘 위치 계산 (간단한 랜덤 배치 + 충돌 방지)
  const getResponsiveIconPositions = useCallback(() => {
    const { isMobile, isTablet, minDistance } = getDynamicIconSettings();
    
    // 기본 패딩 설정
    const basePadding = isMobile ? 20 : isTablet ? 25 : 35;
    const taskbarHeight = 80;
    const topPadding = isMobile ? 40 : 20;
    const bottomPadding = isMobile ? 60 : 50;
    
    // 아이콘 배치 가능한 영역 계산
    const availableWidth = screenWidth - (basePadding * 2);
    const availableHeight = screenHeight - taskbarHeight - topPadding - bottomPadding;
    
    const positions: Record<string, { x: number; y: number }> = {};
    const placedPositions: { x: number; y: number; title: string }[] = [];
    
    // 시드 기반 랜덤 함수 (일관된 결과를 위해)
    const getSeededRandom = (str: string, salt: number = 0) => {
      let hash = salt;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash % 10000) / 10000;
    };
    
    // 각 아이콘을 순차적으로 배치
    desktopIconsData.forEach((iconData) => {
      let position = { x: 0, y: 0 };
      let validPosition = false;
      let attempts = 0;
      const maxAttempts = 100;
      
      // 유효한 위치를 찾을 때까지 시도
      while (!validPosition && attempts < maxAttempts) {
        // 완전 랜덤한 위치 생성 (전체 데스크탑 영역에서)
        const randomX = getSeededRandom(iconData.id, attempts * 2);
        const randomY = getSeededRandom(iconData.id, attempts * 2 + 1);
        
        // 전체 가능한 영역에서 랜덤 위치 계산
        const candidateX = basePadding + (randomX * availableWidth);
        const candidateY = basePadding + topPadding + (randomY * availableHeight);
        
        // 개별 아이콘 크기 고려한 경계 조정
        const iconArea = getIconAreaForTitle(iconData.title);
        const adjustedX = Math.max(basePadding, Math.min(
          screenWidth - iconArea.width - basePadding,
          candidateX - iconArea.width / 2
        ));
        const adjustedY = Math.max(basePadding + topPadding, Math.min(
          screenHeight - taskbarHeight - bottomPadding - iconArea.height,
          candidateY - iconArea.height / 2
        ));
        
        position = { x: adjustedX, y: adjustedY };
        
        // 간단한 충돌 검사
        validPosition = isValidIconPosition(position, placedPositions, iconData.title, minDistance);
        attempts++;
      }
      
      // 유효한 위치를 찾지 못한 경우 강제 배치 (겹침 최소화)
      if (!validPosition) {
        // 기존 아이콘들과 최대한 멀리 떨어진 위치 찾기
        let bestPosition = position;
        let maxMinDistance = 0;
        
        for (let i = 0; i < 20; i++) {
          const randomX = getSeededRandom(iconData.id, attempts + i * 3);
          const randomY = getSeededRandom(iconData.id, attempts + i * 3 + 1);
          
          const candidateX = basePadding + (randomX * availableWidth);
          const candidateY = basePadding + topPadding + (randomY * availableHeight);
          
          const iconArea = getIconAreaForTitle(iconData.title);
          const testX = Math.max(basePadding, Math.min(
            screenWidth - iconArea.width - basePadding,
            candidateX - iconArea.width / 2
          ));
          const testY = Math.max(basePadding + topPadding, Math.min(
            screenHeight - taskbarHeight - bottomPadding - iconArea.height,
            candidateY - iconArea.height / 2
          ));
          
          // 기존 아이콘들과의 최소 거리 계산
          const minDistanceToOthers = placedPositions.reduce((min, existingPos) => {
            const dx = Math.abs(testX - existingPos.x);
            const dy = Math.abs(testY - existingPos.y);
            const distance = Math.sqrt(dx * dx + dy * dy);
            return Math.min(min, distance);
          }, Infinity);
          
          if (minDistanceToOthers > maxMinDistance) {
            maxMinDistance = minDistanceToOthers;
            bestPosition = { x: testX, y: testY };
          }
        }
        
        position = bestPosition;
      }
      
      positions[iconData.id] = { x: Math.round(position.x), y: Math.round(position.y) };
      placedPositions.push({ x: position.x, y: position.y, title: iconData.title });
    });
    
    return positions;
  }, [screenWidth, screenHeight, getDynamicIconSettings, isValidIconPosition, getIconAreaForTitle]);

  const [iconPositions, setIconPositions] = useState(getResponsiveIconPositions());

  // 화면 크기 변경 시 아이콘 위치 재계산
  useEffect(() => {
    setIconPositions(getResponsiveIconPositions());
  }, [screenWidth, screenHeight, getResponsiveIconPositions]);

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
      // 데스크톱: 튜너 윈도우는 더 관대한 높이 허용
      maxWidthRatio = 0.9;
      maxHeightRatio = component === 'TunerWindow' ? 0.95 : 0.9;
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
          width: Math.min(isMobile ? Math.floor(screenWidth * 0.95) : 900, maxWidth), 
          height: Math.min(isMobile ? Math.floor(screenHeight * 0.90) : 700, maxHeight) 
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
      case 'TunerWindow':
        // 튜너 윈도우 컴팩트 디자인 기반 높이 계산
        const tunerHeaderHeight = 60;       // 헤더 영역 (p-3 + 축소된 텍스트)
        const tunerDisplayHeight = 80;      // 디지털 디스플레이 (축소된 패딩+여백)
        const tunerStringHeight = 300;      // 6개 기타 줄 (28px * 6 + space-y-3 간격)
        const tunerVolumeHeight = 60;       // 볼륨 컨트롤 (축소된 패딩)
        const tunerFooterHeight = 36;       // 하단 정보 (p-2 + 텍스트)
        const tunerMainPadding = isMobile ? 24 : 32; // 메인 컨테이너 패딩 (축소)
        const tunerBufferSpace = 12;        // 여유 공간
        
        const optimalTunerHeight = tunerHeaderHeight + tunerDisplayHeight + 
                                 tunerStringHeight + tunerVolumeHeight + 
                                 tunerFooterHeight + tunerMainPadding + 
                                 tunerBufferSpace; // 총 ~568px
                                 
        return { 
          width: Math.min(isMobile ? 350 : 480, maxWidth), 
          height: Math.min(optimalTunerHeight, maxHeight) 
        };
      case 'MetronomeWindow':
        // 메트로놈 윈도우 최적 크기 계산
        const metronomeHeaderHeight = 60;    // 헤더 (제목)
        const catCharacterHeight = 120;      // 고양이 캐릭터 영역
        const beatIndicatorHeight = 40;      // 박자 인디케이터
        const statusHeight = 60;             // 현재 상태 표시
        const playButtonHeight = 60;         // 재생/정지 버튼
        const bpmControlHeight = 80;         // BPM 조절 슬라이더
        const settingsHeight = 120;          // 박자 및 고양이 목소리 설정
        const additionalControlsHeight = 50; // 추가 컨트롤
        const statusBarHeight = 40;          // 하단 상태바
        const metronomeMainPadding = isMobile ? 16 : 32; // 메인 패딩
        const metronomeSpacing = 32;         // 간격들의 합
        
        const optimalMetronomeHeight = metronomeHeaderHeight + catCharacterHeight + 
                                     beatIndicatorHeight + statusHeight + playButtonHeight + 
                                     bpmControlHeight + settingsHeight + additionalControlsHeight + 
                                     statusBarHeight + metronomeMainPadding + metronomeSpacing;
                                     
        return { 
          width: Math.min(isMobile ? 350 : 420, maxWidth), 
          height: Math.min(optimalMetronomeHeight, maxHeight) 
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

  // Icon sound mapping for type safety and maintainability
  const iconSounds = {
    'music-player': playMelodySound,
    'sketchbook': playScratchSound,
    'quiz': playQuizSound,
    'images': playShutterSound,
    'albuminfo': playPageFlipSound,
    'credit': playPageFlipSound,
    'critic': playPageFlipSound,
    'specialthanks': playPageFlipSound,
    'tuner': playStrumSound,
    'email': playMailboxSound,
    'instagram': playFlashSound,
    'trash': playTrashSound,
    'metronome': () => playCatMeow('adult'),
  } as const;

  // Icon action mapping for special behaviors
  const iconActions = {
    'instagram': () => window.open('https://www.instagram.com/9.17.p.m/', '_blank'),
    'email': () => window.open('mailto:homeoutgimo@karts.ac.kr', '_self'),
  } as const;

  const handleIconClick = (icon: typeof desktopIconsData[0] & { x: number; y: number }) => {
    // Play appropriate sound for the icon
    const soundFunction = iconSounds[icon.id as keyof typeof iconSounds];
    if (soundFunction) {
      soundFunction();
    }

    // Handle window opening for components
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
    }

    // Handle special icon actions (external links, etc.)
    const actionFunction = iconActions[icon.id as keyof typeof iconActions];
    if (actionFunction) {
      actionFunction();
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
        
        const { iconSize: dynamicIconSize } = getDynamicIconSettings();
        
        return (
          <DesktopIcon
            key={iconData.id}
            icon={iconData.icon}
            title={iconData.title}
            x={position.x}
            y={position.y}
            size={dynamicIconSize}
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