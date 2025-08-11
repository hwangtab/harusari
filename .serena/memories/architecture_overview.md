# Architecture Overview

## Component Hierarchy
```
Desktop (main container)
├── LoadingScreen (DOS-style boot sequence)
├── DesktopIcon (clickable file icons)
├── WindowManager (renders all open windows)
│   ├── Window (draggable container with titlebar)
│   └── Individual window components:
│       ├── ReadmeWindow (album info)
│       ├── MusicPlayerWindow (Winamp-style player)
│       ├── ImageViewerWindow (gallery)
│       ├── LyricsWindow (handwritten lyrics SVGs)
│       └── SecretWindow (hidden easter egg)
└── Taskbar (bottom taskbar with window list)
```

## State Management (Zustand)
Located in `src/store/useStore.ts`:

### Window System
- **Window positions**: x, y coordinates
- **Window dimensions**: width, height
- **Z-index management**: focus and layering
- **Window states**: minimized, maximized
- **Active windows**: open window list

### Music Player
- **Audio state**: current track, playing status, volume
- **Track progression**: playlist management
- **Audio controls**: play/pause, seek, next/previous

### Desktop State  
- **Hidden files**: secret content revelation
- **Loading states**: boot sequence progression
- **Click tracking**: easter egg triggers

## Data Flow
1. **Desktop icons** → Window creation → Zustand store
2. **WindowManager** reads store → Renders appropriate windows
3. **User interactions** → Store updates → UI re-renders
4. **Audio files** stored in `/public/audio/` as MP3s
5. **Album metadata** in `/public/data/album.json`

## Key Design Patterns
- **Window System**: Each window managed through unique IDs
- **Component Mapping**: Dynamic component resolution in WindowManager
- **Progressive Enhancement**: Hidden content revealed through interaction
- **Desktop Metaphor**: Absolute positioning with drag-and-drop