# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive album archive website for "하루살이 프로젝트 2: 알 수 없는 느낌" (Harusari Project 2: Unknown Feeling). This is a digital art piece disguised as a 90s/2000s-era desktop computer interface, featuring draggable windows, retro GUI elements, and hidden easter eggs.

## Tech Stack

- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom design tokens
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
The entire application state is managed through a single Zustand store (`src/store/useStore.ts`):
- **Window System**: Manages draggable windows with z-index, position, and minimize/maximize states
- **Music Player**: Controls audio playbook, track selection, volume, and progress
- **Desktop State**: Handles hidden file revelation and loading states

### Component Hierarchy
```
Desktop (main container)
├── DesktopIcon (clickable file icons with drag support)
├── WindowManager (renders all open windows)
│   ├── Window (draggable container with titlebar controls)
│   └── Individual window components:
│       ├── AlbuminfoWindow, CreditWindow, CriticWindow, SpecialThanksWindow
│       ├── MusicPlayerWindow (Winamp-style player with visualizations)
│       ├── ImageViewerWindow (progressive loading gallery)
│       ├── SketchbookWindow (HTML5 Canvas drawing tool)
│       ├── QuizWindow (interactive album quiz with reward system)
│       ├── SecretWindow, SecretTxtWindow (easter eggs)
│       └── LyricsWindow (handwritten lyrics display)
├── Taskbar (Windows 98-style taskbar with streaming links)
└── LoadingScreen (DOS-style boot sequence)
```

### Key Design Patterns

1. **Window System**: Each window is managed through Zustand store with unique IDs, allowing multiple instances of the same window type
2. **Dynamic Component Mapping**: WindowManager uses a component registry to dynamically render different window types based on the `component` property
3. **Desktop Metaphor**: Icons are positioned absolutely on desktop using seeded random placement, triggering window creation on click
4. **Progressive Enhancement**: Hidden content (secret files) revealed through user interaction patterns
5. **Audio Integration**: Custom HTML5 Audio wrapper with visualization and playlist management

### Data Flow
- Desktop icons → Window creation → Zustand store → WindowManager → Rendered windows
- Audio files stored in `/public/audio/` as MP3s with track metadata
- Album metadata in `/public/data/album.json`
- Images organized in `/public/images/` with subfolders for album art and icons

## Styling Conventions

### Color Palette (defined in globals.css)
Custom CSS variables based on album artwork:
- `--color-cream`: #F5F3E7 (primary background)
- `--color-album-purple`: #8B7AAE (headers, accents)
- `--color-album-orange`: #E5A45C (interactive elements)
- `--color-album-blue`: #A8C5D1 (secondary accents)
- `--color-retro-black`: #2C2C2C (primary text)
- `--color-glitch-magenta`, `--color-glitch-cyan`: High contrast glitch effects

### Typography
- **System Fonts**: GmarketSans as primary, with MS Gothic/Gulim fallbacks for authentic retro feel
- **Handwriting**: YoonChildfundkoreaManSeh for album artwork-inspired headings
- **Monospace**: For terminal/DOS-style interfaces

### Animation Philosophy
- **Intentional "broken" animations**: Stuttering progress bars, glitch effects
- **Framer Motion**: Smooth window operations (drag, minimize/maximize, focus)
- **Retro Loading Effects**: Progressive JPEG-style image loading simulation
- **Audio Visualizations**: Custom waveform displays using album artwork

## Key Features to Maintain

### Easter Eggs and Interactions
- Click empty desktop 5 times to reveal `secret_memo.txt`
- Double-click images to reveal hidden content layers
- Trash can icon plays procedural noise sound via Web Audio API
- Album quiz game with 5 questions that unlocks `secret.txt` with music download links

### Audio Integration
- HTML5 Audio with custom controls and visualizations
- Track progression through album playlist with metadata display
- Volume controls with retro-style sliders
- Lyrics window integration with current track

### Window Behavior
- Fully draggable windows with collision detection and screen boundaries
- Z-index management for proper window focus and layering
- Minimize/maximize with taskbar integration and window state persistence
- Responsive window sizing based on content and screen dimensions

## Development Notes

### Performance Considerations
- Images optimized as WebP with Next.js Image component
- Code splitting implemented for heavy window components
- Lazy loading for audio files with preload strategies
- Custom hooks for window dimension management (`useWindowDimensions`)

### Browser Compatibility
- Modern Chrome, Safari, Firefox support (ES2020+)
- No IE support due to CSS Grid and modern JavaScript features
- Mobile responsive with stacked window layout for touch devices
- Custom cursor support for desktop environments

### Asset Organization
```
public/
├── images/
│   ├── album/ (album artwork, CD labels, liner notes)
│   └── icons/ (desktop file icons in SVG format)
├── audio/ (MP3 track files with consistent naming)
├── data/ (JSON metadata for tracks and album info)
└── fonts/ (local font files for offline support)
```

### Common Patterns for New Window Components
1. Create component in `src/components/windows/`
2. Add TypeScript interface with `windowId: string` prop
3. Register in `WindowManager.tsx` component registry
4. Add to desktop icons in `Desktop.tsx` if needed
5. Define optimal window size in `getOptimalWindowSize()` function
6. Use consistent styling with `bg-cream`, `text-retro-black`, `border-retro-black`

### Debugging Window System
- Use React DevTools to inspect Zustand store state
- Window positions are calculated dynamically - check `getWindowPosition()` for placement logic
- Z-index issues can be debugged through the `focusWindow()` store action
- Audio playback state is separate from window state for performance

When working on this project, maintain the aesthetic of intentional imperfection and "broken GUI" elements while ensuring the underlying code quality remains high. The contrast between polished technical implementation and deliberately rough visual design is core to the artistic concept.