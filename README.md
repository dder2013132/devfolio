# DEVFOLIO

A personal developer portfolio built with React, TypeScript, and Vite, combining high-contrast editorial design with interactive 3D graphics.

**Live site:** [dev.hexha.org](https://dev.hexha.org) · **Status:** Deployed (November 19, 2026)

## Highlights

- Procedural Three.js orbital sculpture with metallic rings, a colored core, translucent panels, and HDR reflections.
- Scroll-driven CSS 3D project wheel using GSAP ScrollTrigger, with snapping, depth-based opacity, a card counter, and segmented progress.
- Terminal-inspired About section, sticky navigation with Scroll Spy, and Contact section.
- Responsive layouts, reduced-motion alternatives, keyboard interaction restrictions for inactive cards, and a WebGL initialization fallback.
- Self-hosted fonts, compressed WebP screenshots, visibility-aware rendering, and time-based animation.
- Git-integrated deployment to Cloudflare Pages with a custom HTTPS domain.

## Technology stack

| Area | Technology |
| --- | --- |
| UI | React 19, TypeScript 7 |
| Tooling | Vite 8, Oxlint |
| Graphics | Three.js, WebGL, CSS 3D transforms |
| Animation | GSAP, ScrollTrigger, @gsap/react |
| Styling | CSS Modules, CSS custom properties |
| Typography | Fontsource, Space Grotesk Variable, IBM Plex Mono |
| Hosting | Cloudflare Pages, GitHub integration |

Major versions reflect the supplied dependency declarations.

## Featured projects

| Project | Description | Source |
| --- | --- | --- |
| PacketScope | C / Win32 network packet capture and analysis | [GitHub](https://github.com/dder2013132/PacketScope) |
| PlayPort | Java Servlet/JSP e-commerce application with JDBC and PostgreSQL | [GitHub](https://github.com/dder2013132/gamestore) |
| Kimbap | Supply chain management: procurement, inventory, and logistics | [GitHub](https://github.com/wnsl1364/Kimbap) |
| NoodleMES | Manufacturing execution and production management | [GitHub](https://github.com/greenstar-gyul/NoodleMES) |

This repository contains the portfolio frontend, not the featured applications. Project details are maintained in `src/data/projects.ts`.

## Getting started

Use Node.js 22.23.4 and npm 10.9.9 to match the successful Cloudflare build environment reported during deployment, or compatible versions.

```bash
git clone https://github.com/dder2013132/devfolio.git
cd devfolio
npm ci
npm run dev
```

```bash
npm run lint     # Oxlint
npm run build    # TypeScript check and production bundle
npm run preview  # Preview dist locally
```

## Project structure

```text
devfolio/
├── public/                   # favicon.svg, robots.txt, office-small.hdr
├── src/
│   ├── assets/screenshots/   # WebP project screenshots
│   ├── component/
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── HeroGraphic.tsx
│   │   ├── About.tsx
│   │   ├── Projects.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── Contact.tsx
│   │   └── Footer.tsx
│   ├── css/                  # CSS Modules and tokens.css
│   ├── data/projects.ts
│   ├── types/project.ts
│   ├── utils/scroll.ts
│   ├── App.tsx
│   └── main.tsx
├── docs/LEARNING_NOTES_KO.md
├── index.html
└── package.json
```

## Implementation

### Orbital system

`HeroGraphic` constructs rings using `LatheGeometry`, a spherical core, and six transparent box panels. An HDR environment supplies reflections. `requestAnimationFrame` drives rotation and pointer interpolation using elapsed time; an IntersectionObserver stops the loop when the canvas leaves the viewport. DPR is capped at 1.5 and elapsed frame time at 0.1 seconds. ResizeObserver updates the camera projection and renderer. Cleanup disconnects observers, cancels frames, removes listeners, and disposes shared GPU resources. Renderer construction failures display a fallback message.

### Project archive

Cards are spaced by `360 / projects.length` degrees around the X-axis. ScrollTrigger drives the wheel while inverse rotation keeps the cards readable. Cosine-based depth controls opacity and interactivity; `inert` also prevents keyboard interaction with inactive cards. Near-stop snapping and a short end-of-timeline hold support controlled transitions. Reduced-motion CSS replaces the wheel with a vertical list, while GSAP MatchMedia reverts the animation.

### Navigation and accessibility

Header tracks the section intersecting the viewport center. Shared scrolling utilities choose smooth or instant movement according to motion preference. CSS provides reduced-motion overrides for decorative animations, responsive breakpoints, visible link focus styles, and a high-contrast palette. The Hero also renders a static frame when animation starts with reduced motion enabled.

### Performance

The four supplied WebP screenshots total 80,190 bytes (about 78.3 KiB), down from approximately 1,880.6 KiB during development (95.8% reduction). The HDR asset is also reduced in resolution. Fonts are bundled locally rather than loaded from an external font CDN. A previous Lighthouse development measurement reported Performance 95; this is not a fresh audit of the deployed site.

## Deployment

| Cloudflare Pages setting | Value |
| --- | --- |
| Production branch | `main` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Custom domain | `dev.hexha.org` |

Push changes to `main` to trigger a new deployment. Asset import paths must match filename casing exactly on the Linux build server. The existing R2 image-protection rule is scoped to its own hostname to avoid blocking the portfolio subdomain.

## Maintenance

- Run lint and build before pushing; verify the deployed site after each release.
- Check mobile layouts, keyboard navigation, and reduced-motion behavior.
- Recheck Lighthouse after substantial changes and keep project metadata current.
- Review asset attribution and licenses before redistribution.

See [Korean learning notes](docs/LEARNING_NOTES_KO.md) for implementation history, troubleshooting, and review exercises.
