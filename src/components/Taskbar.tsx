'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

export default function Taskbar() {
  const { windows, minimizeWindow, focusWindow } = useStore();
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [streamingLinks, setStreamingLinks] = useState([
    { name: 'Spotify', url: 'https://open.spotify.com/artist/harusari', color: 'bg-green-500' },
    { name: 'Apple Music', url: 'https://music.apple.com/artist/harusari', color: 'bg-gray-800' },
    { name: 'Bandcamp', url: 'https://harusari.bandcamp.com', color: 'bg-blue-400' },
    { name: 'YouTube', url: 'https://youtube.com/@harusari', color: 'bg-red-500' }
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
          { name: 'Bandcamp', url: albumData.streamingLinks.bandcamp, color: 'bg-blue-400' },
          { name: 'YouTube', url: 'https://youtube.com/@harusari', color: 'bg-red-500' }
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
                    className={`block w-full text-left px-2 py-1 text-xs text-white mb-1 ${link.color} hover:opacity-80`}
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
      <div className="flex-1 flex space-x-1 ml-2">
        {windows.map((window) => (
          <motion.button
            key={window.id}
            className={`px-3 py-1 text-xs border border-retro-black max-w-32 truncate ${
              window.isMinimized 
                ? 'bg-album-blue text-retro-black' 
                : 'bg-cream text-retro-black hover:bg-album-orange'
            }`}
            onClick={() => handleWindowClick(window)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title={window.title}
          >
            {window.title}
          </motion.button>
        ))}
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