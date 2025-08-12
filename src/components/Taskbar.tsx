'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';

export default function Taskbar() {
  const { windows, minimizeWindow, focusWindow, openWindow } = useStore();
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [streamingLinks, setStreamingLinks] = useState([
    { name: 'Spotify', url: 'https://open.spotify.com/album/28GJo72pSM7tHJ9l7fLwzV', color: 'bg-green-500' },
    { name: 'Apple Music', url: 'https://music.apple.com/kr/album/harusali-project2-unknown-feeling/1824108606', color: 'bg-gray-800' },
    { name: 'YouTube Music', url: 'https://api.ffm.to/sl/e/c/ymn3qx1?cd=eyJ1YSI6eyJ1YSI6Ik1vemlsbGEvNS4wIChNYWNpbnRvc2g7IEludGVsIE1hYyBPUyBYIDEwXzE1XzcpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS8xMzkuMC4wLjAgU2FmYXJpLzUzNy4zNiIsImJyb3dzZXIiOnsibmFtZSI6IkNocm9tZSIsInZlcnNpb24iOiIxMzkuMC4wLjAiLCJtYWpvciI6IjEzOSJ9LCJjcHUiOnt9LCJkZXZpY2UiOnsibW9kZWwiOiJNYWNpbnRvc2giLCJ2ZW5kb3IiOiJBcHBsZSJ9LCJlbmdpbmUiOnsibmFtZSI6IkJsaW5rIiwidmVyc2lvbiI6IjEzOS4wLjAuMCJ9LCJvcyI6eyJuYW1lIjoibWFjT1MiLCJ2ZXJzaW9uIjoiMTAuMTUuNyJ9fSwiY2xpZW50Ijp7InJpZCI6IjU1NDI2N2I1LTE5YjktNDNkOC1hNjY0LTdiZTA0ZmNjODY3ZiIsInNpZCI6IjE1MDA0ZDYxLWEyYjItNDhmNy05OGFiLWMxZGZjNTI4YTVhMSIsImlwIjoiMjIwLjg2LjU1LjE4NyIsInJlZiI6IiIsImhvc3QiOiJvcmNkLmNvIiwibGFuZyI6ImtvIiwiaXBDb3VudHJ5IjoiS1IifSwiaXNXZWJwU3VwcG9ydGVkIjp0cnVlLCJnZHByRW5mb3JjZSI6ZmFsc2UsImNvdW50cnlDb2RlIjoiS1IiLCJpc0JvdCI6ZmFsc2UsInVzZUFmZiI6Im9yaWdpbiIsInZpZCI6IjEzZWMyNWI2LWI3NjUtNGU5OC04M2YyLWNiZTIyOTU1MmRmMCIsImlkIjoiNjg3ZWZlZTg0ODAwMDAwYjAwZWM5MzZmIiwicHJ2Ijp0cnVlLCJpc1ByZVIiOmZhbHNlLCJ0em8iOi01NDAsImNoIjpudWxsLCJhbiI6bnVsbCwiZGVzdFVybCI6Imh0dHBzOi8vbXVzaWMueW91dHViZS5jb20vcGxheWxpc3Q_bGlzdD1PTEFLNXV5X25YTWhyU1NYakFGaUtUeUVlSjJqWEI0Q1BXSDhaQ0VWWSZzcmM9RkZNJmxpZD0wMDAwMDAwMC02ODdlLWZlZTgtNDgwMC0wMDBiMDBlYzkzNmYmY2lkPWVlZjI2N2Y2LTNmNTEtNWQ0Ni1hNzE3LTcxMWFjMTJiY2Y3NiIsInNydmMiOiJ5b3V0dWJlbXVzaWMiLCJwcm9kdWN0Ijoic21hcnRsaW5rIiwic2hvcnRJZCI6InltbjNxeDEiLCJpc0F1dGhvcml6YXRpb25SZXF1aXJlZCI6ZmFsc2UsIm93bmVyIjoiNjcxMDdlNzMyOTAwMDBhODIxNTljYWQyIiwidGVuYW50IjoiNWJkOWUzNDA3OGY0ZjAzZmE3MmE5ZmIxIiwiYXIiOiI2ODY0Yjc5ZjI2MDAwMDBiMDA1Njk1OTkiLCJpc1Nob3J0TGluayI6ZmFsc2UsIm5hdGl2ZSI6ZmFsc2V9&_gl=1*1htoqjt*_gcl_au*MTM4MTM0NDg3MS4xNzQ4NTkwMDU1', color: 'bg-red-500' },
    { name: 'Amazon Music', url: 'https://music.amazon.com/albums/B0FGCRWTVL?ref=dm_ff_amazonmusic_3p&tag=featurefm-20', color: 'bg-blue-600' },
    { name: 'Tidal', url: 'https://tidal.com/album/445573254', color: 'bg-gray-800' },
    { name: 'Bugs!', url: 'https://music.bugs.co.kr/album/38275340?wl_ref=list_ab_03', color: 'bg-orange-500' },
    { name: 'FLO', url: 'https://www.music-flo.com/detail/album/440277705/albumtrack', color: 'bg-purple-500' },
    { name: 'Melon', url: 'https://www.melon.com/album/detail.htm?albumId=11902523', color: 'bg-green-600' },
    { name: 'Vibe', url: 'https://vibe.naver.com/album/34653151', color: 'bg-indigo-500' },
    { name: 'Genie', url: 'https://www.genie.co.kr/detail/albumInfo?axnm=86516805', color: 'bg-pink-500' }
  ]);

  // Load streaming links from album.json
  useEffect(() => {
    const loadStreamingLinks = async () => {
      try {
        const response = await fetch('/data/album.json');
        const albumData = await response.json();
        const links = [
          { name: 'Spotify', url: albumData.streamingLinks.spotify, color: 'bg-green-500' },
          { name: 'Apple Music', url: albumData.streamingLinks.appleMusic, color: 'bg-gray-800' },
          { name: 'YouTube Music', url: albumData.streamingLinks.youtubeMusic, color: 'bg-red-500' },
          { name: 'Amazon Music', url: albumData.streamingLinks.amazonMusic, color: 'bg-blue-600' },
          { name: 'Tidal', url: albumData.streamingLinks.tidal, color: 'bg-gray-800' },
          { name: 'Bugs!', url: albumData.streamingLinks.bugs, color: 'bg-orange-500' },
          { name: 'FLO', url: albumData.streamingLinks.flo, color: 'bg-purple-500' },
          { name: 'Melon', url: albumData.streamingLinks.melon, color: 'bg-green-600' },
          { name: 'Vibe', url: albumData.streamingLinks.vibe, color: 'bg-indigo-500' },
          { name: 'Genie', url: albumData.streamingLinks.genie, color: 'bg-pink-500' }
        ];
        setStreamingLinks(links);
      } catch (error) {
        console.error('Failed to load streaming links:', error);
        // Keep fallback links
      }
    };
    
    loadStreamingLinks();
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };


  const handleWindowClick = (window: { id: string; isMinimized: boolean }) => {
    if (window.isMinimized) {
      minimizeWindow(window.id); // This will un-minimize it
    }
    focusWindow(window.id);
  };

  // 반응형 윈도우 버튼 계산
  const getResponsiveWindowButtons = () => {
    const startButtonWidth = 80; // 시작 버튼 대략 너비
    const systemTrayWidth = 120; // 시스템 트레이 영역 대략 너비
    const availableWidth = screenWidth - startButtonWidth - systemTrayWidth - 20; // 여유 공간
    
    const isSmallScreen = screenWidth < 600;
    const buttonMaxWidth = isSmallScreen ? 60 : 128; // 작은 화면에서는 더 좁게
    const estimatedButtonWidth = isSmallScreen ? 70 : 140; // padding 포함
    
    const maxVisibleButtons = Math.floor(availableWidth / estimatedButtonWidth);
    const visibleWindows = windows.slice(0, maxVisibleButtons);
    const hiddenWindows = windows.slice(maxVisibleButtons);
    
    return { 
      visibleWindows, 
      hiddenWindows, 
      buttonMaxWidth, 
      isSmallScreen,
      hasHiddenWindows: hiddenWindows.length > 0 
    };
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-album-purple border-t-2 border-retro-black h-10 flex items-center px-2 z-50">
      {/* Start Button */}
      <div className="relative">
        <motion.button
          className="bg-cream text-retro-black px-3 py-1 text-xs font-bold border-2 border-retro-black hover:bg-album-orange flex items-center space-x-1"
          onClick={() => setStartMenuOpen(!startMenuOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>🎵</span>
          <span>시작</span>
        </motion.button>

        {/* Start Menu */}
        <AnimatePresence>
          {startMenuOpen && (
            <motion.div
              className="absolute bottom-full left-0 mb-1 bg-cream border-2 border-retro-black shadow-lg w-48"
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              {/* Menu Header */}
              <div className="bg-album-purple text-white p-2 text-xs font-bold">
                하루살이 프로젝트 2
              </div>
              
              {/* Streaming Links */}
              <div className="p-2">
                <div className="text-xs font-bold mb-2 text-retro-black">스트리밍:</div>
                {streamingLinks.map((link) => (
                  <motion.a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full text-left px-2 py-1 text-xs text-retro-black mb-1 ${link.color} hover:opacity-80`}
                    whileHover={{ x: 2 }}
                    onClick={() => setStartMenuOpen(false)}
                  >
                    {link.name}
                  </motion.a>
                ))}
                
                {/* Separator */}
                <div className="border-t border-gray-300 my-2"></div>
                
                {/* About */}
                <motion.div
                  className="px-2 py-1 text-xs text-retro-black hover:bg-album-blue cursor-pointer"
                  whileHover={{ x: 2 }}
                  onClick={() => {
                    openWindow({
                      id: `window-about-${Date.now()}`,
                      title: 'About',
                      component: 'AboutWindow',
                      x: Math.round((screenWidth - 320) / 2),
                      y: Math.round((screenHeight - 580 - 40) / 2),
                      width: 320,
                      height: 580,
                      isMinimized: false,
                      isMaximized: false
                    });
                    setStartMenuOpen(false);
                  }}
                >
                  About
                </motion.div>
                
                {/* Exit */}
                <motion.div
                  className="px-2 py-1 text-xs text-retro-black hover:bg-red-200 cursor-pointer"
                  whileHover={{ x: 2 }}
                  onClick={() => {
                    if (confirm('정말로 나가시겠습니까?')) {
                      window.close();
                    }
                    setStartMenuOpen(false);
                  }}
                >
                  나가기
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Window Buttons */}
      <div className="flex-1 flex space-x-1 ml-2 overflow-hidden">
        {(() => {
          const { visibleWindows, hiddenWindows, buttonMaxWidth, isSmallScreen, hasHiddenWindows } = getResponsiveWindowButtons();
          
          return (
            <>
              {visibleWindows.map((window) => (
                <motion.button
                  key={window.id}
                  className={`px-2 py-1 text-xs border border-retro-black truncate ${
                    window.isMinimized 
                      ? 'bg-album-blue text-retro-black' 
                      : 'bg-cream text-retro-black hover:bg-album-orange'
                  }`}
                  style={{ maxWidth: `${buttonMaxWidth}px` }}
                  onClick={() => handleWindowClick(window)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title={window.title}
                >
                  {isSmallScreen ? window.title.substring(0, 6) + (window.title.length > 6 ? '...' : '') : window.title}
                </motion.button>
              ))}
              
              {hasHiddenWindows && (
                <motion.button
                  className="px-2 py-1 text-xs border border-retro-black bg-album-orange text-retro-black hover:bg-album-orange/80"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title={`${hiddenWindows.length}개 더 보기`}
                  style={{ minWidth: '40px' }}
                >
                  +{hiddenWindows.length}
                </motion.button>
              )}
            </>
          );
        })()}
      </div>

      {/* System Tray */}
      <div className="flex items-center space-x-2 text-xs">
        {/* Volume Icon */}
        <div className="text-cream cursor-pointer hover:text-album-orange" title="볼륨">
          🔊
        </div>
        
        {/* Network Icon */}
        <div className="text-cream cursor-pointer hover:text-album-orange" title="네트워크">
          📶
        </div>
        
        {/* Clock */}
        <div className="bg-cream text-retro-black px-2 py-1 border border-retro-black font-mono">
          {formatTime(currentTime)}
        </div>
      </div>
    </div>
  );
}