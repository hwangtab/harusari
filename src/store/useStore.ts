import { create } from 'zustand';

export interface Window {
  id: string;
  title: string;
  component: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
}

export interface Track {
  id: number;
  title: string;
  duration: string;
  file: string;
}

interface StoreState {
  // Loading state
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  
  // Window management
  windows: Window[];
  maxZIndex: number;
  openWindow: (windowConfig: Omit<Window, 'zIndex'>) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, width: number, height: number) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  
  // Music player state
  currentTrack: number | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  tracks: Track[];
  
  // Music player actions
  setCurrentTrack: (trackId: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setTracks: (tracks: Track[]) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  
  // Desktop state
  hiddenFileRevealed: boolean;
  revealHiddenFile: () => void;
  

}

export const useStore = create<StoreState>((set, get) => ({
  // Loading state
  isLoading: true,
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  
  // Window management
  windows: [],
  maxZIndex: 100,
  
  openWindow: (windowConfig) => {
    const state = get();
    const newZIndex = state.maxZIndex + 1;
    const newWindow: Window = {
      ...windowConfig,
      zIndex: newZIndex
    };
    
    set({
      windows: [...state.windows, newWindow],
      maxZIndex: newZIndex
    });
  },
  
  closeWindow: (id: string) => {
    set((state) => ({
      windows: state.windows.filter(w => w.id !== id)
    }));
  },
  
  focusWindow: (id: string) => {
    const state = get();
    const newZIndex = state.maxZIndex + 1;
    
    set({
      windows: state.windows.map(w =>
        w.id === id ? { ...w, zIndex: newZIndex } : w
      ),
      maxZIndex: newZIndex
    });
  },
  
  moveWindow: (id: string, x: number, y: number) => {
    set((state) => ({
      windows: state.windows.map(w =>
        w.id === id ? { ...w, x, y } : w
      )
    }));
  },
  
  resizeWindow: (id: string, width: number, height: number) => {
    set((state) => ({
      windows: state.windows.map(w =>
        w.id === id ? { ...w, width, height } : w
      )
    }));
  },
  
  minimizeWindow: (id: string) => {
    set((state) => ({
      windows: state.windows.map(w =>
        w.id === id ? { ...w, isMinimized: !w.isMinimized } : w
      )
    }));
  },
  
  maximizeWindow: (id: string) => {
    set((state) => ({
      windows: state.windows.map(w =>
        w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
      )
    }));
  },
  
  // Music player state
  currentTrack: null,
  isPlaying: false,
  volume: 0.7,
  currentTime: 0,
  duration: 0,
  tracks: [],
  
  // Music player actions
  setCurrentTrack: (trackId: number) => {
    const tracks = get().tracks;
    if (tracks.find(t => t.id === trackId)) {
      set({ currentTrack: trackId, currentTime: 0 });
    }
  },
  
  setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),
  setVolume: (volume: number) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  setCurrentTime: (time: number) => set({ currentTime: time }),
  setDuration: (duration: number) => set({ duration }),
  setTracks: (tracks: Track[]) => set({ tracks }),
  
  nextTrack: () => {
    const { currentTrack, tracks } = get();
    if (currentTrack !== null && tracks.length > 0) {
      const currentIndex = tracks.findIndex(t => t.id === currentTrack);
      const nextIndex = (currentIndex + 1) % tracks.length;
      set({ currentTrack: tracks[nextIndex].id, currentTime: 0 });
    }
  },
  
  previousTrack: () => {
    const { currentTrack, tracks } = get();
    if (currentTrack !== null && tracks.length > 0) {
      const currentIndex = tracks.findIndex(t => t.id === currentTrack);
      const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
      set({ currentTrack: tracks[prevIndex].id, currentTime: 0 });
    }
  },
  
  // Desktop state
  hiddenFileRevealed: false,
  revealHiddenFile: () => set({ hiddenFileRevealed: true }),
  

}));