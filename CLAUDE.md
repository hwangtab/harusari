# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive album archive website for "하루살이 프로젝트 2: 알 수 없는 느낌" (Harusari Project 2: Unknown Feeling). This is a digital art piece disguised as a 90s/2000s-era desktop computer interface, featuring draggable windows, retro GUI elements, and hidden easter eggs.

## Tech Stack

- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Audio**: HTML5 Audio API
- **Deployment**: Vercel

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint

# Format code with Prettier (manual)
npx prettier --write .
```

## Architecture Overview

### State Management (Zustand Store)
- **Window System**: Manages draggable windows with z-index, position, and minimize/maximize states
- **Music Player**: Controls audio playback, track selection, volume, and progress
- **Desktop State**: Handles hidden file revelation and loading states
- **Location**: `src/store/useStore.ts`

### Component Hierarchy
```
Desktop (main container)
├── DesktopIcon (clickable file icons)
├── WindowManager (renders all open windows)
│   ├── Window (draggable container with titlebar)
│   └── Individual window components:
│       ├── ReadmeWindow (album info)
│       ├── MusicPlayerWindow (Winamp-style player)
│       ├── ImageViewerWindow (gallery)
│       └── SecretWindow (hidden easter egg)
├── Taskbar (bottom taskbar with window list)
└── LoadingScreen (DOS-style boot sequence)
```

### Key Design Patterns

1. **Window System**: Each window is managed through Zustand store with unique IDs, allowing multiple instances
2. **Component Mapping**: WindowManager uses dynamic component resolution to render different window types
3. **Desktop Metaphor**: Icons are positioned absolutely on desktop, triggering window creation on click
4. **Progressive Enhancement**: Hidden content (secret files) revealed through user interaction

### Data Flow
- Desktop icons → Window creation → Zustand store → WindowManager → Rendered windows
- Audio files stored in `/public/audio/` as MP3s
- Album metadata in `/public/data/album.json`
- Images organized in `/public/images/` with subfolders for different content types

## Styling Conventions

### Color Palette (from album artwork)
- Cream/off-white backgrounds
- Purple, orange, light blue accents
- Glitch effects use high-contrast colors (magenta, cyan)

### Typography
- System fonts (Gulim, MS Gothic) for authentic retro feel
- Handwriting fonts from album artwork for headings
- Intentionally dated bitmap fonts for system messages

### Animation Philosophy
- Intentional "broken" animations (stuttering progress bars)
- Glitch effects on text and images
- Smooth Framer Motion for window operations
- Retro loading effects (progressive JPEG simulation)

## Key Features to Maintain

### Easter Eggs
- Click empty desktop 5 times to reveal `secret_memo.txt`
- Double-click images to reveal hidden content
- Trash can icon plays noise sound

### Audio Integration
- HTML5 Audio with custom controls
- Track progression and playlist management
- Visualization area shows album artwork/noise instead of typical waveforms

### Window Behavior
- Fully draggable and resizable windows
- Z-index management for window focus
- Minimize/maximize with taskbar integration
- Each window type has specific default dimensions

## Development Notes

### Performance Considerations
- Images optimized as WebP with Next.js Image component
- Code splitting for heavy window components
- Lazy loading for audio files
- Target Lighthouse Performance score >80

### Browser Compatibility
- Modern Chrome, Safari, Firefox support
- No IE support
- Mobile responsive with stacked window layout

### Asset Organization
```
public/
├── images/
│   ├── album/ (album artwork, CD labels)
│   └── icons/ (desktop file icons)
├── audio/ (MP3 track files)
└── data/ (JSON metadata)
```

When working on this project, maintain the aesthetic of intentional imperfection and "broken GUI" elements while ensuring the underlying code quality remains high. The contrast between polished technical implementation and deliberately rough visual design is core to the artistic concept.