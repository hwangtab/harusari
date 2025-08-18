'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';

interface MusicPlayerWindowProps {
  windowId: string;
}

export default function MusicPlayerWindow({ windowId }: MusicPlayerWindowProps) {
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    tracks,
    setCurrentTrack,
    setIsPlaying,
    setVolume,
    setCurrentTime,
    setDuration,
    setTracks,
    nextTrack,
    previousTrack,
    openWindow,
    focusWindow
  } = useStore();

  const audioRef = useRef<HTMLAudioElement>(null);
  const [visualization, setVisualization] = useState<string[]>([]);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Initialize tracks from album.json
  useEffect(() => {
    const loadAlbumData = async () => {
      try {
        const response = await fetch('/data/album.json');
        const albumData = await response.json();
        const albumTracks = albumData.tracks;
        
        setTracks(albumTracks);
        if (currentTrack === null && albumTracks.length > 0) {
          setCurrentTrack(albumTracks[0].id);
        }
      } catch (error) {
        console.error('Failed to load album data:', error);
        // Fallback to hardcoded data
        const fallbackTracks = [
          { id: 1, title: "괴로워!", duration: "1:32", file: "1.mp3" },
          { id: 2, title: "사람생각", duration: "2:24", file: "2.mp3" },
          { id: 3, title: "아침밥 먹은 날에 더 배고파", duration: "1:30", file: "3.mp3" },
          { id: 4, title: "새우 까주는 사람", duration: "1:38", file: "4.mp3" },
          { id: 5, title: "집을 나선 고양이", duration: "3:04", file: "5.mp3" },
          { id: 6, title: "알수없느낌", duration: "2:28", file: "6.mp3" },
          { id: 7, title: "지 않았다", duration: "1:41", file: "7.mp3" },
          { id: 8, title: "예술가는술담배마약커피없이못사나요", duration: "2:07", file: "8.mp3" },
          { id: 9, title: "다 니맘때로", duration: "1:29", file: "9.mp3" },
          { id: 10, title: "말 필요 없는 노래", duration: "1:54", file: "10.mp3" },
          { id: 11, title: "Do you want a feeling", duration: "3:03", file: "11.mp3" },
          { id: 12, title: "그림을 그려", duration: "1:48", file: "12.mp3" },
          { id: 13, title: "집중 두 시간", duration: "3:52", file: "13.mp3" }
        ];
        setTracks(fallbackTracks);
        if (currentTrack === null && fallbackTracks.length > 0) {
          setCurrentTrack(fallbackTracks[0].id);
        }
      }
    };

    if (tracks.length === 0) {
      loadAlbumData();
    }
  }, [currentTrack, setCurrentTrack, setTracks, tracks.length]);

  // Visualization effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      const visualElements = ['▋', '▌', '▍', '▎', '▏', '█', '▓', '▒', '░'];
      // Dynamic visualization count based on screen size
      const visualCount = screenWidth < 768 ? 10 : 15; // Mobile: 10, Desktop: 15
      interval = setInterval(() => {
        const newVisualization = Array.from({ length: visualCount }, () =>
          visualElements[Math.floor(Math.random() * visualElements.length)]
        );
        setVisualization(newVisualization);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);


  // Audio time update and volume control
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => nextTrack();

    audio.volume = volume;
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, volume, nextTrack, setCurrentTime, setDuration]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const handleTrackSelect = (trackId: number) => {
    setCurrentTrack(trackId);
    setIsPlaying(false);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentTrackData = tracks.find(t => t.id === currentTrack);
  // Calculate real-time progress
  const displayProgress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleLyricsClick = () => {
    if (currentTrackData) {
      const lyricsWindowWidth = 400;
      const lyricsWindowHeight = 500;
      const isMobile = screenWidth < 768;
      
      let x, y;
      
      if (isMobile) {
        // Mobile: Center the lyrics window on screen for better visibility
        x = Math.max(10, (screenWidth - lyricsWindowWidth) / 2);
        y = Math.max(10, (screenHeight - lyricsWindowHeight) / 2);
        
        // Ensure window stays within mobile screen bounds
        x = Math.min(x, screenWidth - lyricsWindowWidth - 10);
        y = Math.min(y, screenHeight - lyricsWindowHeight - 60);
      } else {
        // Desktop: Position next to music player as before
        const windowElement = document.getElementById(windowId);
        const rect = windowElement?.getBoundingClientRect();
        const currentWindowX = rect?.left || 100;
        const currentWindowY = rect?.top || 100;
        const currentWindowWidth = rect?.width || 400;
        
        if (currentWindowX + currentWindowWidth + lyricsWindowWidth < screenWidth - 20) {
          // Open to the right if there's space
          x = currentWindowX + currentWindowWidth + 10;
        } else {
          // Open to the left if not enough space on right
          x = Math.max(10, currentWindowX - lyricsWindowWidth - 10);
        }
        
        y = currentWindowY;
        
        // Ensure window stays within screen bounds
        y = Math.max(10, Math.min(y, screenHeight - lyricsWindowHeight - 60));
      }
      
      const lyricsWindowId = `lyrics-${currentTrack}-${Date.now()}`;
      
      const lyricsWindowId = `lyrics-${currentTrack}-${Date.now()}`;
      
      openWindow({
        id: lyricsWindowId,
        title: `${currentTrackData.title} - 가사`,
        component: 'LyricsWindow',
        x,
        y,
        width: lyricsWindowWidth,
        height: lyricsWindowHeight,
        isMinimized: false,
        isMaximized: false
      });
      
      // Ensure the lyrics window is focused and on top, especially on mobile
      setTimeout(() => {
        focusWindow(lyricsWindowId);
      }, 100);
    }
  };

  return (
    <div className="h-full bg-album-purple text-white font-system overflow-y-auto">
      {/* Hidden audio element */}
      {currentTrackData && (
        <audio
          ref={audioRef}
          src={`/audio/${currentTrackData.file}`}
        />
      )}
      
      {/* Player Header */}
      <div className="bg-retro-black p-2 text-center text-xs">
        <div className="text-album-orange">하루살이 Player v1.0</div>
      </div>

      {/* Main Display */}
      <div className="p-3">
        {/* Current Track Info */}
        <div className="bg-retro-black p-2 mb-3 border border-cream">
          <div className="text-album-orange text-sm break-words">
            {currentTrackData ? `${currentTrackData.id}. ${currentTrackData.title}` : '곡을 선택하세요'}
          </div>
          <div className="text-xs text-cream mt-1">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Visualization */}
        <div className="bg-retro-black p-2 mb-3 h-12 flex items-end justify-center space-x-0.5 overflow-x-hidden">
          {isPlaying ? (
            visualization.map((char, index) => (
              <motion.span
                key={index}
                className="text-album-orange"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5] 
                }}
                transition={{ 
                  duration: 0.5,
                  delay: index * 0.05,
                  repeat: Infinity 
                }}
              >
                {char}
              </motion.span>
            ))
          ) : (
            <div className="text-cream text-xs">■ ■ ■ ■ ■</div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="bg-retro-black border border-cream h-3 relative">
            <div 
              className="bg-album-orange h-full transition-all duration-100"
              style={{ width: `${displayProgress}%` }}
            />
            {/* Debug info - remove later */}
            <div className="absolute -bottom-4 left-0 text-xs opacity-50">
              {displayProgress.toFixed(1)}%
            </div>
          </div>
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full mt-1 opacity-0 absolute"
            style={{ height: '8px', marginTop: '-8px' }}
          />
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-2 mb-3">
          <button
            onClick={previousTrack}
            className="bg-retro-black text-cream px-3 py-1 border border-cream hover:bg-cream hover:text-retro-black"
          >
            ⏮
          </button>
          <button
            onClick={handlePlayPause}
            className="bg-album-orange text-retro-black px-4 py-1 border border-retro-black hover:bg-album-orange/80"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            onClick={nextTrack}
            className="bg-retro-black text-cream px-3 py-1 border border-cream hover:bg-cream hover:text-retro-black"
          >
            ⏭
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center space-x-2 mb-3 text-xs">
          <span>🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="flex-1"
          />
          <span>{Math.round(volume * 100)}%</span>
        </div>

        {/* Track List - All Tracks Visible */}
        <div className="bg-retro-black border border-cream p-2 text-xs">
          <div className="text-album-orange mb-2">Track List:</div>
          {tracks.map((track) => (
            <motion.div
              key={track.id}
              className={`cursor-pointer p-1 hover:bg-album-purple break-words ${
                currentTrack === track.id ? 'bg-album-orange text-retro-black' : 'text-cream'
              }`}
              onClick={() => handleTrackSelect(track.id)}
              whileHover={{ x: 2 }}
            >
              {track.id}. {track.title} ({track.duration})
            </motion.div>
          ))}
        </div>

        {/* Lyrics Button */}
        <button
          onClick={handleLyricsClick}
          className="w-full mt-2 bg-album-blue text-retro-black py-2 text-xs border border-retro-black hover:bg-album-blue/80"
          disabled={!currentTrackData}
        >
          가사 보기
        </button>
      </div>
    </div>
  );
}