'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface ImageViewerWindowProps {
  windowId: string;
}

const albumImages = [
  {
    id: 1,
    title: "Album Art",
    src: "/images/album/album_art.png",
    description: "메인 앨범 아트워크"
  },
  {
    id: 2,
    title: "Album Front",
    src: "/images/album/album_front.png", 
    description: "앨범 앞표지"
  },
  {
    id: 3,
    title: "Album Back",
    src: "/images/album/album_back.png",
    description: "앨범 뒷표지"
  },
  {
    id: 4,
    title: "CD Label",
    src: "/images/album/cd.png",
    description: "CD 라벨 디자인"
  },
  {
    id: 5,
    title: "Profile",
    src: "/images/album/profile.png",
    description: "아티스트 프로필"
  },
  {
    id: 6,
    title: "Harusali Logo",
    src: "/images/album/harusali.png",
    description: "하루살이 프로젝트 로고"
  }
];

export default function ImageViewerWindow({ windowId }: ImageViewerWindowProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [glitchActive, setGlitchActive] = useState(false);


  const currentImage = albumImages[currentImageIndex];

  // Progressive loading effect
  useEffect(() => {
    setIsLoading(true);
    setLoadingProgress(0);
    
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsLoading(false);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [currentImageIndex]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % albumImages.length);
    
    // Random glitch effect on transition
    if (Math.random() < 0.3) {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => prev === 0 ? albumImages.length - 1 : prev - 1);
    
    // Random glitch effect on transition
    if (Math.random() < 0.3) {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }
  };



  return (
    <div className="h-full flex flex-col bg-cream text-retro-black font-system">
      {/* Toolbar */}
      <div className="flex-shrink-0 bg-album-blue p-2 flex justify-between items-center text-xs border-b-2 border-retro-black">
        <div className="flex space-x-2">
          <button
            onClick={previousImage}
            className="bg-cream px-2 py-1 border border-retro-black hover:bg-album-orange"
          >
            ◀ Prev
          </button>
          <button
            onClick={nextImage}
            className="bg-cream px-2 py-1 border border-retro-black hover:bg-album-orange"
          >
            Next ▶
          </button>
        </div>
        <div className="text-retro-black">
          {currentImageIndex + 1} / {albumImages.length}
        </div>
      </div>

      {/* Image Container */}
      <div className="flex-1 p-8 overflow-hidden relative flex items-center justify-center">
        {isLoading ? (
          <div className="text-center">
            <div className="mb-2">Loading image...</div>
            <div className="w-48 h-2 bg-retro-black border border-retro-black mb-2">
              <div
                className="h-full bg-album-blue transition-all duration-75"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <div className="text-xs">{Math.round(loadingProgress)}%</div>
          </div>
        ) : (
          <div className="relative max-w-full max-h-full">
            <img
              key={currentImage.id}
              src={currentImage.src}
              alt={currentImage.title}
              className={`max-w-full max-h-full object-contain border-2 border-retro-black ${
                glitchActive ? 'animate-pulse filter contrast-150 hue-rotate-180' : ''
              }`}

            />
            

          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex-shrink-0 bg-cream p-1 text-xs border-t border-retro-black">
        <span>{currentImage.title}</span>
      </div>
    </div>
  );
}