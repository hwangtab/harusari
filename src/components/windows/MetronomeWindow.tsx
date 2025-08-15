'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playCatMeow, playAccentCatMeow } from '@/utils/audioUtils';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';

interface MetronomeWindowProps {
  windowId: string;
}

type TimeSignature = '2/4' | '3/4' | '4/4';
type CatPitch = 'kitten' | 'adult' | 'large';

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
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
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
  timeSignature: TimeSignature;
  catPitch: CatPitch;
  volume: number;
  isVisualOnly: boolean;
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

export default function MetronomeWindow({ windowId: _ }: MetronomeWindowProps) {
  // Initialize state with saved settings
  const savedSettings = loadSettings();
  const [bpm, setBpm] = useState<number>(savedSettings.bpm ?? CONSTANTS.BPM.DEFAULT);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>(savedSettings.timeSignature ?? '4/4');
  const [catPitch, setCatPitch] = useState<CatPitch>(savedSettings.catPitch ?? 'adult');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const [volume, setVolume] = useState<number>(savedSettings.volume ?? CONSTANTS.VOLUME_DEFAULT);
  const [isVisualOnly, setIsVisualOnly] = useState<boolean>(savedSettings.isVisualOnly ?? false);
  const [audioError, setAudioError] = useState<string | null>(null);
  
  // Refs for precise timing
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const nextBeatTimeRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Save settings when they change
  useEffect(() => {
    const settings: MetronomeSettings = {
      bpm,
      timeSignature,
      catPitch,
      volume,
      isVisualOnly
    };
    saveSettings(settings);
  }, [bpm, timeSignature, catPitch, volume, isVisualOnly]);
  
  const { width: screenWidth } = useWindowDimensions();
  const isMobile = screenWidth < CONSTANTS.MOBILE_BREAKPOINT;
  
  // Memoized beats per measure calculation
  const beatsPerMeasure = useMemo((): number => {
    switch (timeSignature) {
      case '2/4': return 2;
      case '3/4': return 3;
      case '4/4': return 4;
      default: return 4;
    }
  }, [timeSignature]);

  // Calculate interval in milliseconds
  const getBeatInterval = (): number => {
    return (60 / bpm) * 1000;
  };

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
          try {
            if (isFirstBeat) {
              playAccentCatMeow(catPitch);
            } else {
              playCatMeow(catPitch);
            }
          } catch (error) {
            console.warn('오디오 재생 실패:', error);
            setAudioError('오디오 재생에 실패했습니다.');
          }
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
  }, [bpm, beatsPerMeasure, catPitch, isVisualOnly]);

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

  // Memoized beat indicators for performance
  const beatIndicators = useMemo(() => {
    const indicators = [];
    
    for (let i = 0; i < beatsPerMeasure; i++) {
      indicators.push(
        <motion.div
          key={i}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
            i === 0 
              ? 'border-album-orange bg-album-orange text-retro-black' // First beat (accent)
              : 'border-album-purple bg-album-purple text-cream'
          }`}
          animate={{
            scale: currentBeat === i && isPlaying ? 1.3 : 1,
            backgroundColor: currentBeat === i && isPlaying 
              ? (i === 0 ? '#E5A45C' : '#8B7AAE') 
              : (i === 0 ? '#E5A45C' : '#8B7AAE'),
          }}
          transition={{ duration: 0.1 }}
        >
          {i + 1}
        </motion.div>
      );
    }
    
    return indicators;
  }, [beatsPerMeasure, currentBeat, isPlaying]);

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
            {timeSignature} • {catPitch === 'kitten' ? '새끼 고양이' : catPitch === 'adult' ? '성묘' : '큰 고양이'}
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
              <div className="flex gap-2">
                {(['2/4', '3/4', '4/4'] as TimeSignature[]).map((sig) => (
                  <button
                    key={sig}
                    onClick={() => setTimeSignature(sig)}
                    className={`px-3 py-2 rounded border-2 text-sm font-medium transition-all ${
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
            `연주 중 • ${timeSignature} • 박자 ${currentBeat + 1}/${beatsPerMeasure}`
          ) : (
            '준비됨 • 스페이스바: 시작/정지, 화살표: BPM조절, Ctrl+M: 무음모드'
          )}
        </div>
      </div>
    </div>
  );
}