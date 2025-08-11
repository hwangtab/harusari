# Technology Stack

## Core Framework
- **Next.js 15.4.6** with App Router
- **React 19.1.0** with TypeScript 5
- **Node.js** on Darwin (macOS) system

## Styling & UI
- **Tailwind CSS v4** with custom design tokens
- **Framer Motion 12.23.12** for animations and draggable interactions
- Custom CSS filters and effects for glitch aesthetics

## State Management
- **Zustand 5.0.7** for global state management
  - Window system (positions, z-index, minimize/maximize states)
  - Music player state (tracks, playback, volume)
  - Desktop state (hidden files, loading states)

## Development Tools
- **TypeScript** with strict configuration
- **ESLint** with Next.js and TypeScript configs
- **Prettier** for code formatting
- **Husky + lint-staged** for pre-commit hooks

## Key Dependencies
```json
{
  "framer-motion": "^12.23.12",  // Drag & drop, animations
  "zustand": "^5.0.7",          // State management
  "next": "15.4.6",             // React framework
  "tailwindcss": "^4"           // Styling
}
```

## Build System
- **Turbopack** for fast development builds
- **PostCSS** for CSS processing
- **ESLint** for linting
- No testing framework currently configured