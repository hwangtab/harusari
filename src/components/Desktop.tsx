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

  // 반응형 아이콘 위치 계산 (모바일 최적화)
  const getResponsiveIconPositions = useCallback(() => {
    // 화면 크기별 설정
    const isMobile = screenWidth < 768;
    const isTablet = screenWidth >= 768 && screenWidth < 1024;
    
    // 모바일 전용 로직
    if (isMobile) {
      // 모바일 전용 아이콘 배치
      const iconSize = 60;
      const basePadding = 35;
      const topPadding = 50;
      const bottomPadding = 120;
      
      const availableWidth = screenWidth - (basePadding * 2);
      const availableHeight = screenHeight - topPadding - bottomPadding;
      
      const cols = screenWidth < 400 ? 2 : 3;
      const positions: Record<string, { x: number; y: number }> = {};
      
      const getSeededRandom = (str: string, salt: number = 0) => {
        let hash = salt;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        return Math.abs(hash % 10000) / 10000;
      };
      
      const iconsPerColumn = Math.ceil(desktopIconsData.length / cols);
      const columnWidth = availableWidth / cols;
      const verticalSpacing = Math.min(availableHeight / iconsPerColumn, 120);
      
      const priorityOrder = ['music-player', 'images', 'albuminfo', 'quiz', 'sketchbook'];
      const sortedIcons = [...desktopIconsData].sort((a, b) => {
        const aPriority = priorityOrder.indexOf(a.id);
        const bPriority = priorityOrder.indexOf(b.id);
        if (aPriority === -1 && bPriority === -1) return 0;
        if (aPriority === -1) return 1;
        if (bPriority === -1) return -1;
        return aPriority - bPriority;
      });
      
      sortedIcons.forEach((iconData, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        
        const baseX = basePadding + (col * columnWidth) + (columnWidth / 2);
        const baseY = topPadding + (row * verticalSpacing) + 30;
        
        const offsetRange = Math.min(columnWidth * 0.3, 40);
        const offsetX = (getSeededRandom(iconData.id, 1) - 0.5) * offsetRange;
        const offsetY = (getSeededRandom(iconData.id, 2) - 0.5) * 30;
        
        const finalX = Math.max(basePadding, Math.min(
          screenWidth - iconSize - basePadding,
          baseX + offsetX - (iconSize / 2)
        ));
        const finalY = Math.max(topPadding, Math.min(
          screenHeight - bottomPadding - iconSize,
          baseY + offsetY
        ));
        
        positions[iconData.id] = { x: Math.round(finalX), y: Math.round(finalY) };
      });
      
      return positions;
    }
    
    // 태블릿/데스크탑용 동적 아이콘 크기 및 간격 계산
    const iconSize = 80;
    const basePadding = isTablet ? 25 : 35;
    const minDistance = isTablet ? 65 : 85;
    const taskbarHeight = 80;
    const extraBottomPadding = 50;
    const extraTopPadding = 20;
    
    // 아이콘 배치 가능한 영역 (상단 여백 적용)
    const availableWidth = screenWidth - (basePadding * 2);
    const availableHeight = screenHeight - taskbarHeight - extraBottomPadding - extraTopPadding - (basePadding * 2);
    
    // 더 세분화된 격자 시스템 계산
    const iconsCount = desktopIconsData.length;
    
    // 기본 격자 크기를 더 작게 설정 (더 많은 격자 셀 생성)
    const baseGridSize = isTablet ? 70 : 80;
    const gridCols = Math.floor(availableWidth / baseGridSize);
    const gridRows = Math.floor(availableHeight / baseGridSize);
    const totalGridCells = gridCols * gridRows;
    
    // 격자 셀 크기 계산
    const cellWidth = availableWidth / gridCols;
    const cellHeight = availableHeight / gridRows;
    
    // 격자 기반 배치 가능성 체크 (더 관대한 조건)
    const useGridSystem = totalGridCells >= iconsCount && cellWidth >= 40 && cellHeight >= 40;
    
    // 사용 가능한 격자 셀 목록 생성
    const createAvailableCells = () => {
      const cells = [];
      for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
          cells.push({ col, row, occupied: false });
        }
      }
      return cells;
    };
    
    const positions: Record<string, { x: number; y: number }> = {};
    
    // 시드 기반 랜덤 함수
    const getSeededRandom = (str: string, salt: number = 0) => {
      let hash = salt;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash % 10000) / 10000;
    };
    
    if (useGridSystem) {
      // 향상된 랜덤 격자 시스템
      const availableCells = createAvailableCells();
      
      // 아이콘별 랜덤 강도 설정
      const getRandomIntensity = (iconId: string) => {
        const importantIcons = ['music-player', 'images', 'albuminfo'];
        return importantIcons.includes(iconId) ? 0.4 : 0.7; // 중요한 아이콘은 덜 랜덤하게
      };
      
      // 아이콘별 우선순위 설정
      const priorityOrder = ['music-player', 'images', 'albuminfo', 'quiz', 'sketchbook'];
      const sortedIcons = [...desktopIconsData].sort((a, b) => {
        const aPriority = priorityOrder.indexOf(a.id);
        const bPriority = priorityOrder.indexOf(b.id);
        if (aPriority === -1 && bPriority === -1) return 0;
        if (aPriority === -1) return 1;
        if (bPriority === -1) return -1;
        return aPriority - bPriority;
      });
      
      sortedIcons.forEach((iconData) => {
        // 랜덤하게 격자 셀 선택
        let selectedCell;
        let attempts = 0;
        const maxAttempts = 20;
        
        do {
          const randomIndex = Math.floor(getSeededRandom(iconData.id, attempts) * availableCells.length);
          selectedCell = availableCells[randomIndex];
          attempts++;
        } while (selectedCell.occupied && attempts < maxAttempts);
        
        // 사용 가능한 셀을 찾지 못한 경우 첫 번째 빈 셀 사용
        if (selectedCell.occupied) {
          selectedCell = availableCells.find(cell => !cell.occupied) || availableCells[0];
        }
        
        selectedCell.occupied = true;
        
        // 선택된 격자 셀의 중심 위치
        const gridCenterX = basePadding + (selectedCell.col * cellWidth) + (cellWidth / 2);
        const gridCenterY = basePadding + extraTopPadding + (selectedCell.row * cellHeight) + (cellHeight / 2);
        
        // 향상된 랜덤 오프셋 (더 큰 범위)
        const randomIntensity = getRandomIntensity(iconData.id);
        const maxOffsetX = cellWidth * randomIntensity;
        const maxOffsetY = cellHeight * randomIntensity;
        
        const offsetX = (getSeededRandom(iconData.id, 1) - 0.5) * maxOffsetX;
        const offsetY = (getSeededRandom(iconData.id, 2) - 0.5) * maxOffsetY;
        
        // 추가 랜덤성: 인접 셀로 위치 이동 허용
        const crossCellOffset = isMobile ? 15 : 25;
        const additionalOffsetX = (getSeededRandom(iconData.id, 3) - 0.5) * crossCellOffset;
        const additionalOffsetY = (getSeededRandom(iconData.id, 4) - 0.5) * crossCellOffset;
        
        // 최종 위치 계산 (경계 체크)
        const finalX = Math.max(basePadding, Math.min(
          screenWidth - iconSize - basePadding,
          gridCenterX + offsetX + additionalOffsetX - (iconSize / 2)
        ));
        const finalY = Math.max(basePadding + extraTopPadding, Math.min(
          screenHeight - taskbarHeight - extraBottomPadding - iconSize - basePadding,
          gridCenterY + offsetY + additionalOffsetY - (iconSize / 2)
        ));
        
        positions[iconData.id] = { x: Math.round(finalX), y: Math.round(finalY) };
      });
    } else {
      // 폴백: 더 자연스러운 산발적 배치
      const placedPositions: { x: number; y: number }[] = [];
      
      const getDistance = (pos1: {x: number, y: number}, pos2: {x: number, y: number}) => {
        return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
      };
      
      const isValidPosition = (newPos: {x: number, y: number}) => {
        return placedPositions.every(existingPos => 
          getDistance(newPos, existingPos) >= minDistance * 0.8 // 폴백에서는 더 촘촘하게 허용
        );
      };
      
      // 아이콘별 우선순위 설정
      const priorityOrder = ['music-player', 'images', 'albuminfo', 'quiz', 'sketchbook'];
      const sortedIcons = [...desktopIconsData].sort((a, b) => {
        const aPriority = priorityOrder.indexOf(a.id);
        const bPriority = priorityOrder.indexOf(b.id);
        if (aPriority === -1 && bPriority === -1) return 0;
        if (aPriority === -1) return 1;
        if (bPriority === -1) return -1;
        return aPriority - bPriority;
      });
      
      sortedIcons.forEach((iconData, index) => {
        let attempts = 0;
        let position = { x: 0, y: 0 };
        const maxAttempts = 150; // 더 많은 시도
        
        // 더 많은 영역으로 세분화하여 자연스러운 분포
        const topY = basePadding + extraTopPadding;
        const bottomY = screenHeight - taskbarHeight - extraBottomPadding - iconSize - basePadding;
        const midX = screenWidth / 2;
        const midY = (topY + bottomY) / 2;
        
        // 9개 구역으로 세분화
        const zones = [
          { minX: basePadding, maxX: midX - 50, minY: topY, maxY: midY - 30 },
          { minX: midX - 50, maxX: midX + 50, minY: topY, maxY: midY - 30 },
          { minX: midX + 50, maxX: screenWidth - iconSize - basePadding, minY: topY, maxY: midY - 30 },
          { minX: basePadding, maxX: midX - 50, minY: midY - 30, maxY: midY + 30 },
          { minX: midX - 50, maxX: midX + 50, minY: midY - 30, maxY: midY + 30 },
          { minX: midX + 50, maxX: screenWidth - iconSize - basePadding, minY: midY - 30, maxY: midY + 30 },
          { minX: basePadding, maxX: midX - 50, minY: midY + 30, maxY: bottomY },
          { minX: midX - 50, maxX: midX + 50, minY: midY + 30, maxY: bottomY },
          { minX: midX + 50, maxX: screenWidth - iconSize - basePadding, minY: midY + 30, maxY: bottomY }
        ];
        
        // 랜덤하게 구역 순서 섞기
        const shuffledZones = [...zones].sort(() => getSeededRandom(iconData.id, attempts) - 0.5);
        
        for (let zoneIndex = 0; zoneIndex < shuffledZones.length && attempts < maxAttempts; zoneIndex++) {
          const zone = shuffledZones[zoneIndex];
          
          for (let i = 0; i < 17 && attempts < maxAttempts; i++) {
            const seedX = getSeededRandom(iconData.id, attempts * 2);
            const seedY = getSeededRandom(iconData.id, attempts * 2 + 1);
            
            // 더 자연스러운 분포를 위한 가중치 적용
            const weightedX = Math.pow(seedX, 0.7); // 가장자리로 조금 더 몰리게
            const weightedY = Math.pow(seedY, 0.8);
            
            position = {
              x: zone.minX + weightedX * (zone.maxX - zone.minX),
              y: zone.minY + weightedY * (zone.maxY - zone.minY)
            };
            
            attempts++;
            
            if (isValidPosition(position)) {
              break;
            }
          }
          
          if (isValidPosition(position)) {
            break;
          }
        }
        
        // 여전히 위치를 찾지 못한 경우 유연한 격자 배치
        if (!isValidPosition(position)) {
          const flexCols = Math.max(2, Math.floor(availableWidth / 70));
          const col = index % flexCols;
          const row = Math.floor(index / flexCols);
          
          // 격자에 랜덤 오프셋 추가
          const gridOffsetX = (getSeededRandom(iconData.id, 10) - 0.5) * 40;
          const gridOffsetY = (getSeededRandom(iconData.id, 11) - 0.5) * 30;
          
          position = {
            x: basePadding + (col * 70) + gridOffsetX,
            y: basePadding + extraTopPadding + (row * 70) + gridOffsetY
          };
          
          // 경계 체크
          position.x = Math.max(basePadding, Math.min(position.x, screenWidth - iconSize - basePadding));
          position.y = Math.max(basePadding + extraTopPadding, Math.min(position.y, screenHeight - taskbarHeight - extraBottomPadding - iconSize - basePadding));
        }
        
        positions[iconData.id] = { x: Math.round(position.x), y: Math.round(position.y) };
        placedPositions.push(position);
      });
    }
    
    return positions;
  }, [screenWidth, screenHeight]);

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
        
        const isMobile = screenWidth < 768;
        const isTablet = screenWidth >= 768 && screenWidth < 1024;
        const dynamicIconSize = isMobile ? 24 : isTablet ? 30 : 32;
        
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