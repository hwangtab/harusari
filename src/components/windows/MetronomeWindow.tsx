'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playCatMeow as playOldCatMeow, playAccentCatMeow as playOldAccentCatMeow, playMiyamiya, playPurring, playSniffing, type CatEmotion } from '@/utils/audioUtils';
import { playCatMeow, playAccentCatMeow, playSecondaryCatMeow, preloadCatAudio, type CatPitchType, type BeatStrength as CatBeatStrength } from '@/utils/catAudioManager';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';

interface MetronomeWindowProps {
  windowId: string;
}

type ExtendedTimeSignature = '2/4' | '3/4' | '4/4' | '5/4' | '6/8' | '7/8' | '9/8' | '12/8';
type BeatStrength = 'primary' | 'secondary' | 'regular';
type RhythmMode = 'classic' | 'jazz' | 'latin' | 'world';
type CatPitch = CatPitchType;
type CuteSoundMode = 'normal' | 'miyamiya' | 'emotional' | 'mixed';

// Beat pattern definition for complex rhythms
interface BeatPattern {
  beatsPerMeasure: number;
  beatStrengths: BeatStrength[];
  subdivision: number; // 4 for quarter notes, 8 for eighth notes
  grouping?: number[]; // Beat grouping (e.g., [3,3] for 6/8)
  name: string;
  description: string;
}

// Beat patterns for different time signatures and rhythm modes
const BEAT_PATTERNS: Record<ExtendedTimeSignature, Record<RhythmMode, BeatPattern>> = {
  '2/4': {
    classic: {
      beatsPerMeasure: 2,
      beatStrengths: ['primary', 'regular'],
      subdivision: 4,
      name: '2/4 클래식',
      description: '강-약'
    },
    jazz: {
      beatsPerMeasure: 2,
      beatStrengths: ['primary', 'secondary'],
      subdivision: 4,
      name: '2/4 재즈',
      description: '강-중강'
    },
    latin: {
      beatsPerMeasure: 2,
      beatStrengths: ['primary', 'regular'],
      subdivision: 4,
      name: '2/4 라틴',
      description: '강-약'
    },
    world: {
      beatsPerMeasure: 2,
      beatStrengths: ['primary', 'regular'],
      subdivision: 4,
      name: '2/4 월드',
      description: '강-약'
    }
  },
  '3/4': {
    classic: {
      beatsPerMeasure: 3,
      beatStrengths: ['primary', 'regular', 'regular'],
      subdivision: 4,
      name: '3/4 왈츠',
      description: '강-약-약'
    },
    jazz: {
      beatsPerMeasure: 3,
      beatStrengths: ['primary', 'secondary', 'regular'],
      subdivision: 4,
      name: '3/4 재즈왈츠',
      description: '강-중강-약'
    },
    latin: {
      beatsPerMeasure: 3,
      beatStrengths: ['primary', 'regular', 'secondary'],
      subdivision: 4,
      name: '3/4 라틴',
      description: '강-약-중강'
    },
    world: {
      beatsPerMeasure: 3,
      beatStrengths: ['primary', 'regular', 'regular'],
      subdivision: 4,
      name: '3/4 포크',
      description: '강-약-약'
    }
  },
  '4/4': {
    classic: {
      beatsPerMeasure: 4,
      beatStrengths: ['primary', 'regular', 'secondary', 'regular'],
      subdivision: 4,
      name: '4/4 클래식',
      description: '강-약-중강-약'
    },
    jazz: {
      beatsPerMeasure: 4,
      beatStrengths: ['primary', 'secondary', 'regular', 'secondary'],
      subdivision: 4,
      name: '4/4 스윙',
      description: '강-중강-약-중강'
    },
    latin: {
      beatsPerMeasure: 4,
      beatStrengths: ['primary', 'regular', 'secondary', 'secondary'],
      subdivision: 4,
      name: '4/4 살사',
      description: '강-약-중강-중강'
    },
    world: {
      beatsPerMeasure: 4,
      beatStrengths: ['primary', 'regular', 'regular', 'regular'],
      subdivision: 4,
      name: '4/4 포크',
      description: '강-약-약-약'
    }
  },
  '5/4': {
    classic: {
      beatsPerMeasure: 5,
      beatStrengths: ['primary', 'regular', 'secondary', 'regular', 'regular'],
      subdivision: 4,
      name: '5/4 클래식',
      description: '강-약-중강-약-약'
    },
    jazz: {
      beatsPerMeasure: 5,
      beatStrengths: ['primary', 'secondary', 'regular', 'secondary', 'regular'],
      subdivision: 4,
      name: '5/4 재즈',
      description: '강-중강-약-중강-약'
    },
    latin: {
      beatsPerMeasure: 5,
      beatStrengths: ['primary', 'regular', 'secondary', 'regular', 'secondary'],
      subdivision: 4,
      name: '5/4 라틴',
      description: '강-약-중강-약-중강'
    },
    world: {
      beatsPerMeasure: 5,
      beatStrengths: ['primary', 'regular', 'regular', 'secondary', 'regular'],
      subdivision: 4,
      grouping: [3, 2],
      name: '5/4 불가리아',
      description: '강-약-약|중강-약'
    }
  },
  '6/8': {
    classic: {
      beatsPerMeasure: 6,
      beatStrengths: ['primary', 'regular', 'regular', 'secondary', 'regular', 'regular'],
      subdivision: 8,
      grouping: [3, 3],
      name: '6/8 컴파운드',
      description: '강-약-약|중강-약-약'
    },
    jazz: {
      beatsPerMeasure: 6,
      beatStrengths: ['primary', 'secondary', 'regular', 'secondary', 'secondary', 'regular'],
      subdivision: 8,
      grouping: [3, 3],
      name: '6/8 재즈',
      description: '강-중강-약|중강-중강-약'
    },
    latin: {
      beatsPerMeasure: 6,
      beatStrengths: ['primary', 'regular', 'secondary', 'secondary', 'regular', 'secondary'],
      subdivision: 8,
      grouping: [3, 3],
      name: '6/8 라틴',
      description: '강-약-중강|중강-약-중강'
    },
    world: {
      beatsPerMeasure: 6,
      beatStrengths: ['primary', 'regular', 'regular', 'secondary', 'regular', 'regular'],
      subdivision: 8,
      grouping: [3, 3],
      name: '6/8 켈틱',
      description: '강-약-약|중강-약-약'
    }
  },
  '7/8': {
    classic: {
      beatsPerMeasure: 7,
      beatStrengths: ['primary', 'regular', 'secondary', 'regular', 'regular', 'secondary', 'regular'],
      subdivision: 8,
      grouping: [3, 2, 2],
      name: '7/8 클래식',
      description: '강-약-중강|약-약|중강-약'
    },
    jazz: {
      beatsPerMeasure: 7,
      beatStrengths: ['primary', 'secondary', 'regular', 'secondary', 'regular', 'secondary', 'regular'],
      subdivision: 8,
      grouping: [3, 2, 2],
      name: '7/8 재즈',
      description: '강-중강-약|중강-약|중강-약'
    },
    latin: {
      beatsPerMeasure: 7,
      beatStrengths: ['primary', 'regular', 'secondary', 'regular', 'secondary', 'regular', 'secondary'],
      subdivision: 8,
      grouping: [2, 3, 2],
      name: '7/8 라틴',
      description: '강-약|중강-약-중강|약-중강'
    },
    world: {
      beatsPerMeasure: 7,
      beatStrengths: ['primary', 'regular', 'regular', 'secondary', 'regular', 'secondary', 'regular'],
      subdivision: 8,
      grouping: [3, 2, 2],
      name: '7/8 발칸',
      description: '강-약-약|중강-약|중강-약'
    }
  },
  '9/8': {
    classic: {
      beatsPerMeasure: 9,
      beatStrengths: ['primary', 'regular', 'regular', 'secondary', 'regular', 'regular', 'secondary', 'regular', 'regular'],
      subdivision: 8,
      grouping: [3, 3, 3],
      name: '9/8 컴파운드',
      description: '강-약-약|중강-약-약|중강-약-약'
    },
    jazz: {
      beatsPerMeasure: 9,
      beatStrengths: ['primary', 'secondary', 'regular', 'secondary', 'secondary', 'regular', 'secondary', 'secondary', 'regular'],
      subdivision: 8,
      grouping: [3, 3, 3],
      name: '9/8 재즈',
      description: '강-중강-약|중강-중강-약|중강-중강-약'
    },
    latin: {
      beatsPerMeasure: 9,
      beatStrengths: ['primary', 'regular', 'secondary', 'secondary', 'regular', 'secondary', 'secondary', 'regular', 'secondary'],
      subdivision: 8,
      grouping: [3, 3, 3],
      name: '9/8 라틴',
      description: '강-약-중강|중강-약-중강|중강-약-중강'
    },
    world: {
      beatsPerMeasure: 9,
      beatStrengths: ['primary', 'regular', 'regular', 'secondary', 'regular', 'regular', 'secondary', 'regular', 'regular'],
      subdivision: 8,
      grouping: [3, 3, 3],
      name: '9/8 터키',
      description: '강-약-약|중강-약-약|중강-약-약'
    }
  },
  '12/8': {
    classic: {
      beatsPerMeasure: 12,
      beatStrengths: ['primary', 'regular', 'regular', 'secondary', 'regular', 'regular', 'secondary', 'regular', 'regular', 'secondary', 'regular', 'regular'],
      subdivision: 8,
      grouping: [3, 3, 3, 3],
      name: '12/8 컴파운드',
      description: '강-약-약|중강-약-약|중강-약-약|중강-약-약'
    },
    jazz: {
      beatsPerMeasure: 12,
      beatStrengths: ['primary', 'secondary', 'regular', 'secondary', 'secondary', 'regular', 'secondary', 'secondary', 'regular', 'secondary', 'secondary', 'regular'],
      subdivision: 8,
      grouping: [3, 3, 3, 3],
      name: '12/8 셔플',
      description: '강-중강-약|중강-중강-약|중강-중강-약|중강-중강-약'
    },
    latin: {
      beatsPerMeasure: 12,
      beatStrengths: ['primary', 'regular', 'secondary', 'secondary', 'regular', 'secondary', 'secondary', 'regular', 'secondary', 'secondary', 'regular', 'secondary'],
      subdivision: 8,
      grouping: [3, 3, 3, 3],
      name: '12/8 아프로큐반',
      description: '강-약-중강|중강-약-중강|중강-약-중강|중강-약-중강'
    },
    world: {
      beatsPerMeasure: 12,
      beatStrengths: ['primary', 'regular', 'regular', 'secondary', 'regular', 'regular', 'secondary', 'regular', 'regular', 'secondary', 'regular', 'regular'],
      subdivision: 8,
      grouping: [3, 3, 3, 3],
      name: '12/8 블루스',
      description: '강-약-약|중강-약-약|중강-약-약|중강-약-약'
    }
  }
} as const;

// Constants for better maintainability
const CONSTANTS = {
  TIMER_INTERVAL_MS: 10, // High frequency for precise timing
  MOBILE_BREAKPOINT: 768,
  BPM: {
    MIN: 60,
    MAX: 200,
    DEFAULT: 120
  },
  VOLUME_DEFAULT: 0.7,
  PRESETS: [80, 120, 160] as const,
  STORAGE_KEY: 'harusari-metronome-settings'
} as const;

// Audio Context type guard
const createAudioContext = (): AudioContext | null => {
  try {
    const AudioContextClass = window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    return AudioContextClass ? new AudioContextClass() : null;
  } catch (error) {
    console.warn('AudioContext creation failed:', error);
    return null;
  }
};

// BPM validation utility
const validateBpm = (value: number): number => {
  return Math.max(CONSTANTS.BPM.MIN, Math.min(CONSTANTS.BPM.MAX, value));
};

// Settings interface
interface MetronomeSettings {
  bpm: number;
  timeSignature: ExtendedTimeSignature;
  rhythmMode: RhythmMode;
  catPitch: CatPitch;
  volume: number;
  isVisualOnly: boolean;
  cuteSoundMode: CuteSoundMode;
  catEmotion: CatEmotion;
}

// Load settings from localStorage
const loadSettings = (): Partial<MetronomeSettings> => {
  try {
    const saved = localStorage.getItem(CONSTANTS.STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

// Save settings to localStorage
const saveSettings = (settings: MetronomeSettings): void => {
  try {
    localStorage.setItem(CONSTANTS.STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('설정 저장 실패:', error);
  }
};

export default function MetronomeWindow({ windowId }: MetronomeWindowProps) {
  // Initialize state with saved settings
  const savedSettings = loadSettings();
  const [bpm, setBpm] = useState<number>(savedSettings.bpm ?? CONSTANTS.BPM.DEFAULT);
  const [timeSignature, setTimeSignature] = useState<ExtendedTimeSignature>(savedSettings.timeSignature ?? '4/4');
  const [rhythmMode, setRhythmMode] = useState<RhythmMode>(savedSettings.rhythmMode ?? 'classic');
  const [catPitch, setCatPitch] = useState<CatPitch>(savedSettings.catPitch ?? 'adult');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const [volume, setVolume] = useState<number>(savedSettings.volume ?? CONSTANTS.VOLUME_DEFAULT);
  const [isVisualOnly, setIsVisualOnly] = useState<boolean>(savedSettings.isVisualOnly ?? false);
  const [cuteSoundMode, setCuteSoundMode] = useState<CuteSoundMode>(savedSettings.cuteSoundMode ?? 'normal');
  const [catEmotion, setCatEmotion] = useState<CatEmotion>(savedSettings.catEmotion ?? 'neutral');
  const [audioError, setAudioError] = useState<string | null>(null);
  
  // Refs for precise timing
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const nextBeatTimeRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Initialize real cat audio on component mount
  useEffect(() => {
    // Preload cat audio files for better performance
    preloadCatAudio().catch(error => {
      console.warn('Failed to preload cat audio:', error);
      setAudioError('고양이 오디오 로딩 실패 - 합성 사운드로 대체됩니다.');
    });
  }, []);

  // Save settings when they change
  useEffect(() => {
    const settings: MetronomeSettings = {
      bpm,
      timeSignature,
      rhythmMode,
      catPitch,
      volume,
      isVisualOnly,
      cuteSoundMode,
      catEmotion
    };
    saveSettings(settings);
  }, [bpm, timeSignature, rhythmMode, catPitch, volume, isVisualOnly, cuteSoundMode, catEmotion]);
  
  const { width: screenWidth } = useWindowDimensions();
  const isMobile = screenWidth < CONSTANTS.MOBILE_BREAKPOINT;
  
  // Get current beat pattern based on time signature and rhythm mode
  const currentBeatPattern = useMemo((): BeatPattern => {
    return BEAT_PATTERNS[timeSignature][rhythmMode];
  }, [timeSignature, rhythmMode]);

  // Memoized beats per measure from pattern
  const beatsPerMeasure = useMemo((): number => {
    return currentBeatPattern.beatsPerMeasure;
  }, [currentBeatPattern]);

  // Get beat strength for current beat
  const getCurrentBeatStrength = useCallback((beatIndex: number): BeatStrength => {
    return currentBeatPattern.beatStrengths[beatIndex % currentBeatPattern.beatStrengths.length];
  }, [currentBeatPattern]);

  // Calculate interval in milliseconds
  const getBeatInterval = (): number => {
    return (60 / bpm) * 1000;
  };

  // Play cute cat sounds based on mode and beat strength
  const playCuteCatSound = useCallback(async (beatStrength: CatBeatStrength) => {
    try {
      const isFirstBeat = beatStrength === 'primary';
      
      switch (cuteSoundMode) {
        case 'miyamiya':
          if (isFirstBeat) {
            // Use old miyamiya for special effect on primary beats
            playMiyamiya(catPitch);
          } else {
            await playCatMeow(catPitch, catEmotion, bpm, beatStrength);
          }
          break;
        
        case 'emotional':
          // Use the full 3-tier system for emotional mode
          if (beatStrength === 'primary') {
            await playAccentCatMeow(catPitch, catEmotion, bpm);
          } else if (beatStrength === 'secondary') {
            await playSecondaryCatMeow(catPitch, catEmotion, bpm);
          } else {
            await playCatMeow(catPitch, catEmotion, bpm, beatStrength);
          }
          break;
        
        case 'mixed':
          const randomChoice = Math.random();
          if (beatStrength === 'primary') {
            if (randomChoice < 0.1) {
              playPurring();
            } else if (randomChoice < 0.3) {
              playMiyamiya(catPitch);
            } else {
              await playAccentCatMeow(catPitch, catEmotion, bpm);
            }
          } else if (beatStrength === 'secondary') {
            if (randomChoice < 0.15) {
              playSniffing();
            } else {
              await playSecondaryCatMeow(catPitch, catEmotion, bpm);
            }
          } else {
            if (randomChoice < 0.1) {
              playSniffing();
            } else if (randomChoice < 0.2) {
              playPurring();
            } else {
              await playCatMeow(catPitch, catEmotion, bpm, beatStrength);
            }
          }
          break;
        
        default: // 'normal'
          // Use full 3-tier system for normal mode
          if (beatStrength === 'primary') {
            await playAccentCatMeow(catPitch, catEmotion, bpm);
          } else if (beatStrength === 'secondary') {
            await playSecondaryCatMeow(catPitch, catEmotion, bpm);
          } else {
            await playCatMeow(catPitch, catEmotion, bpm, beatStrength);
          }
          break;
      }
    } catch (error) {
      console.warn('실제 오디오 재생 실패, 합성 사운드로 대체:', error);
      // Fallback to synthetic sounds
      try {
        const isFirstBeat = beatStrength === 'primary';
        if (isFirstBeat) {
          playOldAccentCatMeow(catPitch, catEmotion);
        } else {
          playOldCatMeow(catPitch, catEmotion);
        }
      } catch (fallbackError) {
        console.warn('합성 사운드도 실패:', fallbackError);
        setAudioError('오디오 재생에 실패했습니다.');
      }
    }
  }, [catPitch, cuteSoundMode, catEmotion, bpm]);

  // Stop metronome
  const stopMetronome = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCurrentBeat(0);
  }, []);

  // Start metronome with precise timing and error handling
  const startMetronome = useCallback(() => {
    if (intervalRef.current) return;
    
    // Initialize Web Audio Context with error handling
    if (!audioContextRef.current) {
      audioContextRef.current = createAudioContext();
      if (!audioContextRef.current) {
        setAudioError('오디오 컨텍스트를 생성할 수 없습니다. 시각적 모드로 전환됩니다.');
        setIsVisualOnly(true);
      }
    }

    let beatCount = 0;
    const interval = getBeatInterval();
    
    // Set next beat time
    nextBeatTimeRef.current = Date.now() + interval;
    
    const tick = () => {
      const now = Date.now();
      
      // Check if it's time for the next beat
      if (now >= nextBeatTimeRef.current) {
        const isFirstBeat = beatCount % beatsPerMeasure === 0;
        
        // Update visual beat indicator
        setCurrentBeat(beatCount % beatsPerMeasure);
        
        // Play sound if not in visual-only mode and audio is available
        if (!isVisualOnly && audioContextRef.current) {
          const currentBeatIndex = beatCount % beatsPerMeasure;
          const beatStrength = getCurrentBeatStrength(currentBeatIndex);
          playCuteCatSound(beatStrength);
        }
        
        // Calculate next beat time
        beatCount++;
        nextBeatTimeRef.current += interval;
        
        // Adjust for any drift
        if (nextBeatTimeRef.current < now) {
          nextBeatTimeRef.current = now + interval;
        }
      }
    };
    
    // Use a higher frequency timer for better precision
    intervalRef.current = setInterval(tick, CONSTANTS.TIMER_INTERVAL_MS);
  }, [bpm, beatsPerMeasure, isVisualOnly, playCuteCatSound]);

  // Toggle play/stop
  const toggleMetronome = useCallback(() => {
    if (isPlaying) {
      stopMetronome();
    } else {
      startMetronome();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, startMetronome, stopMetronome]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement) return; // Skip if user is typing in input
    
    switch (e.code) {
      case 'Space':
        e.preventDefault();
        toggleMetronome();
        break;
      case 'ArrowUp':
        e.preventDefault();
        setBpm(validateBpm(bpm + 1));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setBpm(validateBpm(bpm - 1));
        break;
      case 'KeyM':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          setIsVisualOnly(!isVisualOnly);
        }
        break;
    }
  }, [bpm, toggleMetronome, isVisualOnly]);
  
  // Add keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Update metronome when BPM changes during playback
  useEffect(() => {
    if (isPlaying) {
      stopMetronome();
      startMetronome();
    }
  }, [bpm, beatsPerMeasure, isPlaying, startMetronome, stopMetronome]);

  // Cat character animation variants
  const catVariants = {
    idle: { 
      scale: 1,
      rotate: 0,
      transition: { duration: 0.5 }
    },
    beat: { 
      scale: 1.1,
      rotate: [0, -2, 2, 0],
      transition: { duration: 0.2 }
    },
    accent: { 
      scale: 1.2,
      rotate: [0, -5, 5, 0],
      transition: { duration: 0.3 }
    }
  };

  // Memoized current animation state
  const currentAnimation = useMemo(() => {
    if (!isPlaying) return 'idle';
    return currentBeat === 0 ? 'accent' : 'beat';
  }, [isPlaying, currentBeat]);

  // Memoized beat indicators with strength-based styling
  const beatIndicators = useMemo(() => {
    const indicators = [];
    
    for (let i = 0; i < beatsPerMeasure; i++) {
      const beatStrength = getCurrentBeatStrength(i);
      
      // Define styling based on beat strength
      const getStyleForStrength = (strength: BeatStrength, isActive: boolean) => {
        const baseClasses = 'rounded-full border-2 flex items-center justify-center font-bold transition-all';
        
        switch (strength) {
          case 'primary':
            return {
              className: `${baseClasses} w-8 h-8 text-sm border-album-orange bg-album-orange text-retro-black`,
              scale: isActive ? 1.4 : 1,
              backgroundColor: isActive ? '#E5A45C' : '#E5A45C'
            };
          case 'secondary':
            return {
              className: `${baseClasses} w-7 h-7 text-xs border-album-blue bg-album-blue text-cream`,
              scale: isActive ? 1.3 : 1,
              backgroundColor: isActive ? '#A8C5D1' : '#A8C5D1'
            };
          case 'regular':
          default:
            return {
              className: `${baseClasses} w-6 h-6 text-xs border-album-purple bg-album-purple text-cream`,
              scale: isActive ? 1.2 : 1,
              backgroundColor: isActive ? '#8B7AAE' : '#8B7AAE'
            };
        }
      };
      
      const isActive = currentBeat === i && isPlaying;
      const styling = getStyleForStrength(beatStrength, isActive);
      
      indicators.push(
        <motion.div
          key={i}
          className={styling.className}
          animate={{
            scale: styling.scale,
            backgroundColor: styling.backgroundColor,
          }}
          transition={{ duration: 0.1 }}
          title={`${i + 1}박 (${beatStrength === 'primary' ? '강박' : beatStrength === 'secondary' ? '중강박' : '약박'})`}
        >
          {i + 1}
        </motion.div>
      );
    }
    
    return indicators;
  }, [beatsPerMeasure, currentBeat, isPlaying, getCurrentBeatStrength]);

  return (
    <div 
      className="h-full bg-cream text-retro-black font-system flex flex-col" 
      role="application"
      aria-label="고양이 메트로놈"
    >
      {/* 커스텀 스크롤바 스타일 */}
      <style jsx>{`
        .metronome-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .metronome-scroll::-webkit-scrollbar-track {
          background: #F5F3E7;
          border-radius: 4px;
        }
        .metronome-scroll::-webkit-scrollbar-thumb {
          background: #8B7AAE;
          border-radius: 4px;
          border: 1px solid #2C2C2C;
        }
        .metronome-scroll::-webkit-scrollbar-thumb:hover {
          background: #A394C7;
        }
      `}</style>

      {/* Header - 고정 */}
      <div className="bg-album-purple text-cream p-3 text-center flex-shrink-0">
        <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold flex items-center justify-center gap-2`}>
          🐱 고양이 메트로놈 🐱
        </h1>
      </div>

      {/* Main Content - 스크롤 가능 */}
      <div 
        className={`flex-1 overflow-y-auto metronome-scroll p-${isMobile ? '2' : '4'} space-y-${isMobile ? '3' : '4'}`}
        style={{
          // Firefox 스크롤바 스타일
          scrollbarWidth: 'thin',
          scrollbarColor: '#8B7AAE #F5F3E7'
        }}
      >
        {/* Cat Character */}
        <div className="flex justify-center">
          <motion.div
            className="text-8xl select-none"
            variants={catVariants}
            animate={currentAnimation}
            key={currentBeat}
          >
            {catPitch === 'kitten' ? '🐱' : catPitch === 'adult' ? '🐈' : '🦁'}
          </motion.div>
        </div>

        {/* Beat Indicators */}
        <div className="flex justify-center gap-3" role="group" aria-label="박자 표시기">
          {beatIndicators}
        </div>

        {/* Current Status */}
        <div className="text-center" aria-live="polite" aria-label="현재 상태">
          <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-album-purple`}>
            {bpm} BPM
          </div>
          <div className="text-sm text-retro-black opacity-70">
            {currentBeatPattern.name} • {catPitch === 'kitten' ? '새끼 고양이' : catPitch === 'adult' ? '성묘' : '큰 고양이'}
          </div>
          <div className="text-xs text-retro-black opacity-60">
            {currentBeatPattern.description}
          </div>
        </div>

        {/* Main Controls */}
        <div className="space-y-4">
          {/* Play/Stop Button */}
          <div className="flex justify-center">
            <button
              onClick={toggleMetronome}
              className={`px-6 py-3 rounded-lg font-bold text-lg border-2 transition-all ${
                isPlaying
                  ? 'bg-glitch-magenta text-cream border-retro-black hover:bg-glitch-magenta/80'
                  : 'bg-album-orange text-retro-black border-retro-black hover:bg-album-orange/80'
              }`}
              aria-label={isPlaying ? '메트로놈 정지 (스페이스바)' : '메트로놈 시작 (스페이스바)'}
            >
              {isPlaying ? '⏹️ 정지' : '▶️ 시작'}
            </button>
          </div>

          {/* BPM Control */}
          <div className="bg-white border-2 border-retro-black rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <label className="text-sm font-semibold min-w-fit">템포 (BPM):</label>
              <input
                type="range"
                min={CONSTANTS.BPM.MIN}
                max={CONSTANTS.BPM.MAX}
                value={bpm}
                onChange={(e) => setBpm(validateBpm(Number(e.target.value)))}
                className="flex-1"
                disabled={isPlaying}
                aria-label="템포 조절 (위/아래 화살표키)"
              />
              <div className="flex gap-1">
                <button
                  onClick={() => setBpm(validateBpm(bpm - 1))}
                  className="px-2 py-1 bg-album-blue text-retro-black border border-retro-black rounded text-xs"
                  disabled={isPlaying}
                >
                  -
                </button>
                <input
                  type="number"
                  min={CONSTANTS.BPM.MIN}
                  max={CONSTANTS.BPM.MAX}
                  value={bpm}
                  onChange={(e) => setBpm(validateBpm(Number(e.target.value) || CONSTANTS.BPM.DEFAULT))}
                  className="w-16 px-2 py-1 border border-retro-black rounded text-center text-xs"
                  disabled={isPlaying}
                  aria-label="BPM 직접 입력"
                />
                <button
                  onClick={() => setBpm(validateBpm(bpm + 1))}
                  className="px-2 py-1 bg-album-blue text-retro-black border border-retro-black rounded text-xs"
                  disabled={isPlaying}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 gap-3">
            {/* Time Signature */}
            <div className="bg-white border-2 border-retro-black rounded-lg p-3">
              <label className="block text-sm font-semibold mb-2">박자:</label>
              <div className="grid grid-cols-4 gap-1 mb-2">
                {(['2/4', '3/4', '4/4', '5/4'] as ExtendedTimeSignature[]).map((sig) => (
                  <button
                    key={sig}
                    onClick={() => setTimeSignature(sig)}
                    className={`px-2 py-1 rounded border text-xs font-medium transition-all ${
                      timeSignature === sig
                        ? 'bg-album-purple text-cream border-retro-black'
                        : 'bg-cream text-retro-black border-retro-black hover:bg-album-purple/20'
                    }`}
                    disabled={isPlaying}
                  >
                    {sig}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-1">
                {(['6/8', '7/8', '9/8', '12/8'] as ExtendedTimeSignature[]).map((sig) => (
                  <button
                    key={sig}
                    onClick={() => setTimeSignature(sig)}
                    className={`px-2 py-1 rounded border text-xs font-medium transition-all ${
                      timeSignature === sig
                        ? 'bg-album-purple text-cream border-retro-black'
                        : 'bg-cream text-retro-black border-retro-black hover:bg-album-purple/20'
                    }`}
                    disabled={isPlaying}
                  >
                    {sig}
                  </button>
                ))}
              </div>
            </div>

            {/* Rhythm Mode */}
            <div className="bg-white border-2 border-retro-black rounded-lg p-3">
              <label className="block text-sm font-semibold mb-2">리듬 모드:</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { key: 'classic', label: '🎼 클래식', desc: '전통적 강약' },
                  { key: 'jazz', label: '🎷 재즈', desc: '신코페이션' },
                  { key: 'latin', label: '💃 라틴', desc: '클라베 리듬' },
                  { key: 'world', label: '🌍 월드', desc: '민족 리듬' }
                ] as const).map(({ key, label, desc }) => (
                  <button
                    key={key}
                    onClick={() => setRhythmMode(key)}
                    className={`px-2 py-2 rounded border-2 text-xs font-medium transition-all ${
                      rhythmMode === key
                        ? 'bg-album-blue text-retro-black border-retro-black'
                        : 'bg-cream text-retro-black border-retro-black hover:bg-album-blue/20'
                    }`}
                    disabled={isPlaying}
                    title={desc}
                  >
                    {isMobile ? key === 'classic' ? '🎼' : key === 'jazz' ? '🎷' : key === 'latin' ? '💃' : '🌍' : label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cat Voice */}
            <div className="bg-white border-2 border-retro-black rounded-lg p-3">
              <label className="block text-sm font-semibold mb-2">고양이 목소리:</label>
              <div className="flex gap-2">
                {([
                  { key: 'kitten', label: '🐱 새끼', emoji: '🐱' },
                  { key: 'adult', label: '🐈 성묘', emoji: '🐈' },
                  { key: 'large', label: '🦁 큰고양이', emoji: '🦁' }
                ] as const).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setCatPitch(key)}
                    className={`px-3 py-2 rounded border-2 text-sm font-medium transition-all flex-1 ${
                      catPitch === key
                        ? 'bg-album-orange text-retro-black border-retro-black'
                        : 'bg-cream text-retro-black border-retro-black hover:bg-album-orange/20'
                    }`}
                  >
                    {isMobile ? key === 'kitten' ? '🐱' : key === 'adult' ? '🐈' : '🦁' : label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cute Sound Mode */}
            <div className="bg-white border-2 border-retro-black rounded-lg p-3">
              <label className="block text-sm font-semibold mb-2">귀여움 모드:</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { key: 'normal', label: '🐈 기본', desc: '일반 야옹' },
                  { key: 'miyamiya', label: '🐱 미야미야', desc: '연속 야옹' },
                  { key: 'emotional', label: '😻 감정표현', desc: '기분 야옹' },
                  { key: 'mixed', label: '🎭 랜덤믹스', desc: '깜짝 효과' }
                ] as const).map(({ key, label, desc }) => (
                  <button
                    key={key}
                    onClick={() => setCuteSoundMode(key)}
                    className={`px-2 py-2 rounded border-2 text-xs font-medium transition-all ${
                      cuteSoundMode === key
                        ? 'bg-album-orange text-retro-black border-retro-black'
                        : 'bg-cream text-retro-black border-retro-black hover:bg-album-orange/20'
                    }`}
                    disabled={isPlaying}
                    title={desc}
                  >
                    {isMobile ? key === 'normal' ? '🐈' : key === 'miyamiya' ? '🐱' : key === 'emotional' ? '😻' : '🎭' : label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cat Emotion (only visible when emotional mode is selected) */}
            {cuteSoundMode === 'emotional' && (
              <div className="bg-white border-2 border-retro-black rounded-lg p-3">
                <label className="block text-sm font-semibold mb-2">고양이 기분:</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { key: 'neutral', label: '😐 평범', emoji: '😐' },
                    { key: 'happy', label: '😸 행복', emoji: '😸' },
                    { key: 'sleepy', label: '😴 졸림', emoji: '😴' },
                    { key: 'playful', label: '😹 장난', emoji: '😹' },
                    { key: 'affectionate', label: '😻 애정', emoji: '😻' }
                  ] as const).map(({ key, label, emoji }) => (
                    <button
                      key={key}
                      onClick={() => setCatEmotion(key)}
                      className={`px-2 py-2 rounded border-2 text-xs font-medium transition-all ${
                        catEmotion === key
                          ? 'bg-album-blue text-retro-black border-retro-black'
                          : 'bg-cream text-retro-black border-retro-black hover:bg-album-blue/20'
                      }`}
                      disabled={isPlaying}
                    >
                      {isMobile ? emoji : label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Additional Controls */}
          <div className="flex gap-2 text-sm">
            <label className="flex items-center gap-2 bg-white border border-retro-black rounded px-3 py-2">
              <input
                type="checkbox"
                checked={isVisualOnly}
                onChange={(e) => setIsVisualOnly(e.target.checked)}
                className="rounded"
              />
              <span>무음 모드</span>
            </label>
            
            {/* Quick BPM presets */}
            <div className="flex gap-1">
              {CONSTANTS.PRESETS.map((presetBpm) => (
                <button
                  key={presetBpm}
                  onClick={() => setBpm(presetBpm)}
                  className="px-2 py-2 bg-album-blue text-retro-black border border-retro-black rounded text-xs hover:bg-album-blue/80"
                  disabled={isPlaying}
                >
                  {presetBpm}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-album-purple text-cream p-2 rounded text-xs text-center" aria-live="polite" role="status">
          {audioError ? (
            <div className="text-album-orange font-semibold">⚠️ {audioError}</div>
          ) : isPlaying ? (
            `🎵 연주 중 • ${currentBeatPattern.name} • 박자 ${currentBeat + 1}/${beatsPerMeasure} (${getCurrentBeatStrength(currentBeat) === 'primary' ? '강박' : getCurrentBeatStrength(currentBeat) === 'secondary' ? '중강박' : '약박'}) • ${
              cuteSoundMode === 'normal' ? '기본 야옹' : 
              cuteSoundMode === 'miyamiya' ? '미야미야 모드' :
              cuteSoundMode === 'emotional' ? `감정표현 (${catEmotion})` :
              '랜덤믹스 모드'
            }`
          ) : (
            `🐱 다중 박자 메트로놈 준비됨 • ${currentBeatPattern.name} • ${
              cuteSoundMode === 'normal' ? '기본' : 
              cuteSoundMode === 'miyamiya' ? '미야미야' :
              cuteSoundMode === 'emotional' ? '감정표현' :
              '랜덤믹스'
            } 모드 • 스페이스바: 시작/정지, 화살표: BPM조절, Ctrl+M: 무음모드`
          )}
        </div>
      </div>
    </div>
  );
}