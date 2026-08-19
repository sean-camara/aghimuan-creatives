# Aghimuan Creatives

Portfolio website for Shawn James N. Camara — a multimedia creative working across photography, videography, film production, graphic art, editing, and creative direction.

The site presents a visual archive of portrait, nightlife, event, fashion, brand, and narrative-film work through a dark editorial interface with motion-led interactions.

## Highlights

- Two routes: `/` for the studio homepage and `/projects` for the complete project archive
- Responsive layouts designed for desktop, tablet, and touch devices
- Scroll-driven visual chapters and lightweight requestAnimationFrame motion
- Swipeable project rails and snap scrolling on mobile
- Grayscale imagery that reveals color on hover where appropriate
- Transparent, optimized WebP hero and logo assets
- Reduced-motion support and touch-device fallbacks
- Tailwind CSS v4 utility-first styling with a small global stylesheet for browser behavior and keyframes

## Tech stack

- React
- TypeScript 7
- Vite
- React Router
- Tailwind CSS v4
- Lucide React

## Local development

Requirements: Node.js 18+ and npm.

```bash
npm install
npm run dev
```

Open the local URL shown by Vite, usually `http://localhost:5173`.

## Production build

```bash
npm run build
```

The optimized output is generated in `dist/`.

## Project structure

```text
src/
├── App.tsx                     # Routes and page composition
├── components/MediaViewers.tsx # Accessible image and video overlays
├── config/design.ts            # Shared layout and visual tokens
├── data/portfolio.ts           # Typed portfolio content and asset references
├── hooks/useModalLayer.ts      # Focus, scroll-lock, and inert-layer behavior
├── hooks/useRouteScroll.ts     # Route/hash scroll restoration
└── styles.css                  # Tailwind entry plus browser-level motion rules
public/assets/              # Local photography, logo, and CV assets
```

## Contact

Shawn James N. Camara

- Email: camarashawnjames@gmail.com
- Email: aghimuanfilms@gmail.com
- Location: Quezon City, Philippines
