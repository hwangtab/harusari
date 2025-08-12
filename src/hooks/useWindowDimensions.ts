'use client';

import { useState, useEffect } from 'react';

interface WindowDimensions {
  width: number;
  height: number;
}

export function useWindowDimensions(): WindowDimensions {
  // SSR-safe initial values
  const [windowDimensions, setWindowDimensions] = useState<WindowDimensions>({
    width: 1200,
    height: 800,
  });

  useEffect(() => {
    function handleResize() {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Set initial dimensions
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}