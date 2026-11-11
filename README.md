# DEVFOLIO

A personal developer portfolio built with **React, TypeScript, and Vite**. DEVFOLIO presents selected software projects in a high-contrast, editorial-style interface.

> **Status:** Work in progress. The portfolio layout and project cards are implemented; project screenshots, navigation, and the final footer are not yet complete.

## Overview

DEVFOLIO is a single-page portfolio focused on clear typography and project presentation. Its hero introduces the theme **“CODE. CREATE. EVOLVE.”** A light, warm background transitions into a dark project showcase.

### Current features

- Reusable `Header`, `Hero`, `Projects`, `ProjectCard`, and `Footer` React components.
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
├── src/
│   ├── component/
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── Projects.tsx
│   │   ├── ProjectCard.tsx
│   │   └── Footer.tsx
│   ├── css/
│   │   ├── tokens.css
│   │   ├── Header.module.css
│   │   ├── Hero.module.css
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
- **Content max width:** `1200px`

The hero uses large, animated typography; the project section uses a full-width dark background with a constrained inner content area. Each project card currently includes a **21:9 image placeholder**, text information, technology tags, and an optional source link.

## Development Status & Roadmap

### Implemented

- [x] Basic one-page component structure
- [x] Typed project data and reusable project cards
- [x] Conditional empty-state rendering
- [x] Hero entrance animation
- [x] High-contrast design tokens and sections
- [x] Project technology badges and external source links
- [x] Reduced-motion styles for hero and card movement

### Planned / incomplete

- [ ] Add real project screenshots to the existing image placeholders
- [ ] Turn the Header's `MENU` label into functional navigation
- [ ] Replace the temporary Footer text with actual contact links
- [ ] Add an About section
- [ ] Finish responsive layouts and perform cross-device QA
- [ ] Add a finished portfolio screenshot to this README
- [ ] Review accessibility and usability across the completed site

## Notes

The current project records are defined locally in `src/App.tsx`; there is no backend or content-management integration in this portfolio snapshot. Project descriptions and repository links should be updated as the featured applications evolve.

For a Korean-language walkthrough of the implementation and lessons learned, see [Learning Notes (KO)](docs/LEARNING_NOTES_KO.md).
