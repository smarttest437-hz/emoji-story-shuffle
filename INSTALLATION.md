# 🚀 Installation & Running Instructions

## Prerequisites

- Node.js 18+ and npm installed on your system
- A modern web browser (Chrome 90+, Edge 90+, Firefox 88+, or Safari 14+)

## Installation

Navigate to the project directory and install dependencies:

```bash
cd emoji-story-shuffle
npm install
```

This will install all required dependencies including:
- React 18
- TypeScript
- Vite
- Vitest
- Canvas Confetti
- All necessary dev dependencies

## Running the Development Server

Start the development server with hot module replacement:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or another port if 5173 is in use).

The terminal will display the exact URL:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Open your browser and navigate to the displayed URL.

## Building for Production

Create an optimized production build:

```bash
npm run build
```

The build artifacts will be generated in the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

## Running Tests

Run the unit test suite:

```bash
npm test
```

For a single test run (non-watch mode):

```bash
npm test run
```

The tests cover:
- Word counting functionality
- Time formatting
- Seeded random number generation
- Emoji selection and locking

## Deployment

### Static Hosting

Since this is a client-only app with no backend, you can deploy the `dist/` folder to any static hosting service:

- **Netlify**: Drag and drop the `dist/` folder
- **Vercel**: Connect your git repository or use Vercel CLI
- **GitHub Pages**: Push `dist/` to `gh-pages` branch
- **AWS S3**: Upload `dist/` contents to an S3 bucket with static website hosting
- **Cloudflare Pages**: Connect repository or use direct upload

### Example: Deploy to Netlify

```bash
# Build the project
npm run build

# Install Netlify CLI (if not already installed)
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Example: Deploy to GitHub Pages

```bash
# Build the project
npm run build

# Deploy to gh-pages branch
npx gh-pages -d dist
```

## Troubleshooting

### Port Already in Use

If port 5173 is already in use:

```bash
# Specify a different port
npm run dev -- --port 3000
```

### TypeScript Errors

If you encounter TypeScript errors, ensure all type definitions are installed:

```bash
npm install --save-dev @types/react @types/react-dom @types/node @types/canvas-confetti
```

### Build Fails

Clear the cache and rebuild:

```bash
rm -rf node_modules dist
npm install
npm run build
```

### Tests Not Running

Ensure jsdom is installed:

```bash
npm install --save-dev jsdom
```

## Development Tips

### Hot Module Replacement

Changes to source files automatically refresh the browser during development.

### URL Seed Parameter

Use URL query parameters for reproducible emoji sets:

```
http://localhost:5173/?seed=12345
```

This allows teams to share the same emoji set for synchronized sessions.

### Dark Mode

Toggle dark mode using the sun/moon icon in the header. The preference is saved to localStorage.

### Browser DevTools

- Open DevTools (F12) to inspect state
- Check localStorage for saved session data
- Use React DevTools extension for component inspection

## Production Checklist

Before deploying to production:

- ✅ Run tests: `npm test run`
- ✅ Build successfully: `npm run build`
- ✅ Test production build: `npm run preview`
- ✅ Verify all features work in production build
- ✅ Test on multiple browsers
- ✅ Test responsive layout on mobile devices

## Performance

The production build is optimized with:
- Code splitting
- Tree shaking
- Minification
- Gzip compression

Typical bundle size:
- HTML: ~0.75 KB
- CSS: ~9.65 KB (~2.52 KB gzipped)
- JS: ~170 KB (~57 KB gzipped)

## System Requirements

### Minimum

- 2 GB RAM
- Any modern browser (last 2 versions)
- Internet connection for initial load (afterwards works offline)

### Recommended

- 4 GB RAM
- Chrome/Edge 100+ for best performance
- 1920x1080 display for optimal layout (but responsive down to 320px width)

## Support

For issues or questions:
1. Check the [README.md](README.md) for feature documentation
2. Review the browser console for error messages
3. Ensure you're using a supported browser version
4. Clear browser cache and localStorage if experiencing issues

## Quick Command Reference

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview

# Clean install
rm -rf node_modules dist && npm install
```

---

**Happy Coding! 🎉**
