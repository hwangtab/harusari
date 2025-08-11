# Code Style & Conventions

## TypeScript Configuration
- **Strict mode enabled** with comprehensive type checking
- **Path mapping**: `@/*` points to `./src/*`
- **Target**: ES2017 with modern DOM APIs
- **JSX**: Preserve (handled by Next.js)

## Code Formatting (Prettier)
```json
{
  "semi": true,           // Always use semicolons
  "trailingComma": "es5", // Trailing commas where valid in ES5
  "singleQuote": true,    // Use single quotes for strings
  "printWidth": 80,       // Line wrap at 80 characters
  "tabWidth": 2,          // 2-space indentation
  "useTabs": false        // Use spaces, not tabs
}
```

## Naming Conventions
- **Components**: PascalCase (e.g., `MusicPlayerWindow.tsx`)
- **Files**: PascalCase for components, camelCase for utilities
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE for global constants
- **Types/Interfaces**: PascalCase (e.g., `WindowProps`, `StoreState`)

## Project Structure
```
src/
├── app/           # Next.js App Router files
├── components/    # Reusable React components
│   └── windows/   # Specific window components
├── store/         # Zustand state management
└── utils/         # Utility functions

public/
├── images/        # Static images (album art, icons)
├── audio/         # MP3 audio files
└── data/          # JSON data files
```

## Component Patterns
- **Functional components** with TypeScript interfaces
- **Client components** marked with `'use client'` directive
- **Props interfaces** defined inline or as separate types
- **State management** through Zustand store
- **Styling** via Tailwind classes with custom design tokens