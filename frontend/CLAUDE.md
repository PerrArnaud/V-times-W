# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

V-Time's is a French luxury watch customization and e-commerce platform. This is the frontend repository built with React and Vite.

## Commands

```bash
npm run dev       # Start Vite dev server (proxies /api to PHP backend)
npm run build     # Production build
npm run lint      # ESLint check
npm run preview   # Preview production build
```

## Tech Stack

- **Framework**: React 18.3 with React Router DOM 7.12
- **Build**: Vite 7.3
- **3D Graphics**: Three.js 0.182 (interactive clock visualization)
- **Styling**: CSS with custom properties (no preprocessor)

## Architecture

### Routing (`src/App.jsx`)
React Router with layout wrapper pattern:
- `Navbar` and `Bottombar` persist across all routes
- Routes: `/` (Home), `/products`, `/canva` (customizer), `/about`

### Component Patterns

**Layout Components**: `Section`, `Header`, `Navbar`, `Bottombar`
- `Section` supports multiple size variants (`S`, `M`, `M-alt`, `L`) with different layouts
- Uses `context` prop to auto-configure navigation (maps to `PAGES` config)

**3D Component** (`Clock3D.jsx`):
- Three.js scene with interactive dragging
- Uses refs for animation loop state management
- "Exploded view" mode separates clock layers
- Auto-resets to default position after 3s idle

### API Integration
Vite proxy configured in `vite.config.js`:
```javascript
'/api': { target: 'https://php', changeOrigin: true, secure: false }
```

### Design System (`src/App.css`)
CSS custom properties for theming:
- Primary: `#335348` (dark green)
- Secondary: `#CA9110` (gold)
- Background: `#F8F6F0`
- Typography: Roboto (body), Playfair Display (headings)

Responsive breakpoints: 768px (mobile), 1024px (tablet)

## Language

UI content is in French. Code comments and variable names use a mix of French and English.
