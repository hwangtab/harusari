# Task Completion Guidelines

## When Tasks Are Complete
After making code changes, always perform these verification steps:

### 1. Code Quality Checks
```bash
# Run ESLint to catch code issues
npm run lint

# Format code with Prettier
npx prettier --write .

# Check TypeScript compilation
npx tsc --noEmit
```

### 2. Build Verification
```bash
# Ensure production build works
npm run build

# If build succeeds, test production mode
npm start
```

### 3. Development Testing
```bash
# Start dev server to test changes
npm run dev
# Visit http://localhost:3000 (or next available port)
```

## Important Notes

### No Testing Framework
- **No automated tests** are currently configured
- Manual testing required for all changes
- Focus on visual/functional verification in browser

### Pre-commit Hooks
- **Husky + lint-staged** run automatically on `git commit`
- Code will be automatically linted and formatted
- Commit will fail if linting errors exist

### Design Philosophy Adherence
When making changes, ensure they maintain:
- **Retro aesthetic**: 90s/2000s computer interface feel
- **Intentional imperfection**: Glitch effects and "broken" UI elements
- **Interactive experience**: Draggable windows, clickable elements
- **Performance**: Optimized images, code splitting, good Core Web Vitals

### Browser Testing
Test changes in:
- **Chrome** (primary target)
- **Safari** (macOS compatibility)
- **Firefox** (cross-browser verification)
- **Mobile devices** (responsive design)

## Never Skip
- ESLint checks (`npm run lint`)
- Build verification (`npm run build`)
- Manual browser testing
- Code formatting consistency