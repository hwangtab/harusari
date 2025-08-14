# 알 수 없는 느낌 - 하루살이 프로젝트

Interactive album archive website for the Harusari Project's debut album featuring a retro "broken GUI" aesthetic.

## 🎨 Project Concept

This website embodies the album's core philosophy of "imperfection aesthetics" and "raw sensibility" through an interactive desktop environment reminiscent of 90s/2000s personal computers. Users explore the album content by clicking files, dragging windows, and discovering hidden content through digital archaeology.

## 🚀 Features

### Core Experience
- **DOS-style boot sequence** with authentic terminal loading animation
- **Desktop metaphor** with draggable file icons and interactive elements
- **Window management system** with retro GUI styling
- **Glitch effects** and intentional "broken" UI elements
- **Hidden content discovery** through user interaction

### Interactive Components
- **Music Player**: Winamp-inspired interface with visualization effects
- **Image Viewer**: Classic image browser with progressive loading
- **Text Viewer**: Notepad-style windows for album information
- **Secret Files**: Easter eggs discoverable through exploration
- **Taskbar**: Windows 98-style navigation and window management

### Design System
- **Color Palette**: Cream backgrounds, purple, orange, and light blue from album artwork
- **Typography**: Intentionally dated system fonts (MS Gothic, Gulim) and handwriting styles
- **Effects**: Analog textures, noise overlays, and glitch animations
- **Cursors**: Custom retro-style cursor interactions

## 🛠️ Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: Zustand for global state
- **Animations**: Framer Motion for smooth interactions
- **Build Tools**: ESLint, Prettier, Husky

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🎮 User Experience

### Getting Started
1. **Boot Sequence**: Watch the DOS-style loading animation
2. **Desktop Exploration**: Click on desktop icons to open windows
3. **Music Player**: Play tracks and view album information
4. **Image Gallery**: Browse album artwork and hidden content
5. **Secret Discovery**: Click on empty desktop areas to reveal hidden files

### Interaction Features
- **Drag & Drop**: Move windows around the desktop
- **Window Management**: Minimize, maximize, and close windows via taskbar
- **Glitch Effects**: Interactive elements trigger visual distortions
- **Audio Integration**: Music player with custom visualizations
- **Progressive Loading**: Retro-style image loading effects

### Hidden Content
- **Secret Files**: Click 5 times on empty desktop space to reveal `secret_memo.txt`
- **Hidden Images**: Double-click images to discover hidden messages
- **Easter Eggs**: Various interactive elements contain surprise content

## 🎵 Album Integration

- **Track Listing**: Complete album with 13 tracks
- **Streaming Links**: Integration with Spotify, Apple Music, Bandcamp, YouTube
- **Artwork Display**: High-resolution album art and liner notes
- **Lyrics Viewer**: Handwritten lyrics in separate windows

## 🎯 Performance

- **Optimized Images**: WebP format with Next.js Image optimization
- **Code Splitting**: Lazy loading for heavy components
- **Core Web Vitals**: Designed for good Lighthouse scores
- **Cross-Browser**: Compatible with modern Chrome, Safari, Firefox

## 📱 Responsive Design

- **Desktop-First**: Optimized for desktop experience
- **Mobile Adaptation**: Responsive layout with stacked windows
- **Touch-Friendly**: Mobile-optimized interactions

## 🔧 Development

### Project Structure
```
src/
├── app/
│   ├── globals.css       # Global styles and design tokens
│   └── page.tsx          # Main application entry
├── components/
│   ├── Desktop.tsx       # Main desktop environment
│   ├── Window.tsx        # Draggable window component
│   ├── WindowManager.tsx # Window system management
│   ├── Taskbar.tsx       # Bottom taskbar
│   ├── LoadingScreen.tsx # Boot sequence animation
│   └── windows/          # Individual window components
└── store/
    └── useStore.ts       # Zustand state management

public/
├── images/
│   ├── album/           # Album artwork
│   └── icons/           # Desktop icons
├── audio/              # Music files
└── data/              # JSON data files
```

## 🎨 Design Philosophy

The website intentionally breaks conventional UX patterns to create an artistic experience that reflects the album's themes:

- **Imperfection as Beauty**: Glitch effects and "broken" elements
- **Nostalgia**: 90s/2000s computer interface aesthetics  
- **Discovery**: Hidden content rewards exploration
- **Tactility**: Draggable elements and interactive feedback

## 🚀 Deployment

The project is optimized for deployment on Vercel, Netlify, or any static hosting service.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 📄 License

© 2025 하루살이 프로젝트 (Harusari Project). All rights reserved.

**Credits:**
- 작사, 작곡, 편곡, 녹음: 김지혜
- 믹싱, 마스터링: 황경하 (@스튜디오 놀)
- 디자인: 김한샘 (@오와오와 스튜디오)
- 뮤직비디오: 송창식, 신명

---

*This website is itself a completed interactive digital art piece that embodies the album's artistic vision.*

**Auto-deploy test commit** - Testing correct harusali.vercel.app deployment
