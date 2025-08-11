# Essential Development Commands

## Development Workflow
```bash
# Start development server with Turbopack (fast builds)
npm run dev

# Build for production
npm run build

# Start production server (after build)
npm start

# Run ESLint to check code quality
npm run lint
```

## Code Quality & Formatting
```bash
# Format code with Prettier (manual - no npm script configured)
npx prettier --write .

# Check TypeScript compilation
npx tsc --noEmit

# Run ESLint with auto-fix
npx eslint . --fix
```

## Git Workflow
```bash
# Pre-commit hooks are configured via Husky + lint-staged
git add .
git commit -m "commit message"  # Automatically runs linting/formatting

# Check git status
git status

# View recent commits
git log --oneline -10
```

## System Utilities (Darwin/macOS)
```bash
# File operations
ls -la          # List files with details
find . -name    # Find files by name
grep -r         # Search in files recursively
cd              # Change directory

# Development server typically runs on:
# http://localhost:3000 (default)
# http://localhost:3001 (if 3000 is occupied)
```

## Project-Specific Notes
- **No testing framework** currently configured
- **Husky hooks** automatically run on commit
- **Development server** uses Turbopack for fast rebuilds
- **Production builds** optimized for Vercel deployment