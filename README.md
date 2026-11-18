# DEVFOLIO

A personal developer portfolio built with **React, TypeScript, and Vite**. DEVFOLIO presents selected software projects in a high-contrast, editorial-style interface.

> **Status (2026-11-18):** Work in progress. The interactive hero, About section, scroll-driven project showcase, and section navigation are implemented. Contact, final responsive testing, and performance tuning remain outstanding.

## Overview

DEVFOLIO is a single-page portfolio focused on clear typography and project presentation. Its hero introduces the theme **“CODE. CREATE. EVOLVE.”** A light, warm background transitions into a dark project showcase.

### Current features

- Reusable `Header`, `Hero`, `HeroGraphic`, `About`, `Projects`, `ProjectCard`, and `Footer` React components.
- Procedural 3D orbital sculpture with metallic rings, a colored core, six translucent glass panels, HDR environment reflections, and pointer-driven motion.
- Scroll-driven 3D project wheel using GSAP and ScrollTrigger, with depth-based opacity and pointer interaction.
- About profile with an animated terminal-style panel and categorized technology stack.
- Sticky navigation with numbered links, smooth section navigation, and a proposed center-based Scroll Spy (verification pending).
- Technical figure caption and typography tokens shared across the hero and navigation.
- TypeScript-based `Project` interface and typed component props.
- Project data rendered with `Array.map()` and stable React keys.
- Empty-state message when no projects are provided.
- Responsive hero typography with CSS `clamp()`.
- Design tokens defined as CSS custom properties.
- Component-scoped styles with CSS Modules.
- High-contrast dark project section with centered content.
- Project categories, descriptions, and technology badges.
- Optional GitHub links displayed as **View Source**; links open in a new tab.
- Card hover feedback, visible keyboard focus for links, and reduced-motion handling for the existing animations.

## Tech Stack

| Area | Technology |
| --- | --- |
| UI | React 19 |
| Language | TypeScript 7 |
| Build / development | Vite 8 |
| Styling | CSS, CSS Modules, CSS custom properties |
| 3D graphics | Three.js / WebGL |
| Motion | GSAP, ScrollTrigger, @gsap/react |
| Linting | Oxlint |

Versions are based on the dependency declarations in the supplied `package.json` and may resolve to compatible versions after installation.

## Featured Projects

### PacketScope

A real-time network packet capture and analysis tool built with C and the Win32 API.

**Category:** Network / Desktop Application  
**Technologies:** C, Win32 API, Npcap, Multithreading  
**Source:** [PacketScope on GitHub](https://github.com/dder2013132/PacketScope)

### PlayPort

A Java-based e-commerce web application featuring game browsing, shopping carts, and order processing.

**Category:** Web / E-Commerce  
**Technologies:** Java, Servlet, JSP, JDBC, PostgreSQL, Maven  
**Source:** [PlayPort on GitHub](https://github.com/dder2013132/gamestore)

These descriptions are the project metadata displayed in DEVFOLIO; this repository contains the portfolio frontend, not the source code of the two featured applications.

## Getting Started

### Requirements

- Node.js and npm, with a Node.js version compatible with Vite 8 (check [Vite's current requirements](https://vite.dev/guide/)).

### Installation

```bash
git clone <YOUR-DEVFOLIO-REPOSITORY-URL>
cd devfolio
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal.

The 3D component expects an HDR environment asset at `public/office.hdr`. Keep the asset available at `/office.hdr` when running or deploying the portfolio; review its license before redistribution.

### Available scripts

```bash
npm run dev      # Start the development server
npm run build    # Run TypeScript project build and bundle for production
npm run preview  # Preview the production build locally
npm run lint     # Run Oxlint
```

## Project Structure

```text
devfolio/
├── public/
│   └── office.hdr
├── src/
│   ├── component/
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── HeroGraphic.tsx
│   │   ├── About.tsx
│   │   ├── Projects.tsx
│   │   ├── ProjectCard.tsx
│   │   └── Footer.tsx
│   ├── css/
│   │   ├── tokens.css
│   │   ├── Header.module.css
│   │   ├── Hero.module.css
│   │   ├── HeroGraphic.module.css
│   │   ├── About.module.css
│   │   ├── Projects.module.css
│   │   ├── ProjectCard.module.css
│   │   └── Footer.module.css
│   ├── types/
│   │   └── project.ts
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
└── vite.config.ts
```

## Design Concept

**High Contrast / Creative Editorial**

- **Warm background:** `#F5F1E8`
- **Primary text and dark-section background:** `#171717`
- **Accent:** `#FF5934`
- **Muted tone:** `#C9C1B3`
- **Content max width:** `1000px` (latest supplied token snapshot)

The hero balances large animated typography with a procedural orbital sculpture and editorial figure caption. The About panel uses a dark technical interface with neon accents. The project showcase uses a full-width dark background and a rotating 3D arrangement of project cards.

## Interaction Architecture

- **HeroGraphic:** React mounts a Three.js renderer inside a referenced container. An animation loop updates ring rotations and interpolates pointer-driven movement. ResizeObserver updates the aspect ratio; cleanup releases shared geometries, materials, the texture, event listeners, and renderer.
- **About:** IntersectionObserver controls entrance visibility, allowing the animation to replay when returning from above.
- **Projects:** Cards are distributed around an X-axis wheel. ScrollTrigger maps page scroll to wheel rotation; counter-rotation keeps cards readable. A small downward entry snap aligns the showcase near its start.
- **Header:** Anchor navigation and centered About navigation preserve normal wheel scrolling. A center-based active-section indicator has been proposed; confirm it in the latest local build.

## Development Status & Roadmap

### Implemented

- [x] Basic one-page component structure
- [x] Typed project data and reusable project cards
- [x] Conditional empty-state rendering
- [x] Hero entrance animation
- [x] High-contrast design tokens and sections
- [x] Project technology badges and external source links
- [x] Reduced-motion styles for hero and card movement
- [x] About section and categorized skills
- [x] Three.js orbital system and glass enclosure
- [x] GSAP-driven project wheel and entry alignment
- [x] Sticky numbered navigation with About and Projects links
- [x] Editorial figure caption and unified Hero typography

### Planned / incomplete

- [ ] Add real project screenshots to the existing image placeholders
- [ ] Replace the temporary Footer text with actual contact links
- [ ] Implement Contact and connect its navigation link
- [ ] Verify Scroll Spy and mobile menu behavior
- [ ] Pause off-screen WebGL rendering and review time-based motion
- [ ] Validate wheel behavior with different project counts and keyboard navigation
- [ ] Finish responsive layouts and perform cross-device QA
- [ ] Add a finished portfolio screenshot to this README
- [ ] Review accessibility and usability across the completed site

## Notes

The current project records are defined locally in `src/App.tsx`; there is no backend or content-management integration in this portfolio snapshot. Project descriptions and repository links should be updated as the featured applications evolve.

This update combines the November 11 baseline with the November 17–18 component snapshots and development discussion. It is not a fresh full-repository build verification; check the final local dependency versions, assets, and pending changes before publishing.

For a Korean-language walkthrough of the implementation and lessons learned, see [Learning Notes (KO)](docs/LEARNING_NOTES_KO.md).
