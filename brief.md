# TUSHO — Motion Designer Portfolio — Project Brief

## Identity
- Brand: **Tusho** (personal portfolio, not sales-driven)
- Who: Motion designer with brand design capabilities, also directs/builds website projects
- Vibe: **minimal, but interaction-rich**. Must NOT look like an AI/template site. No purple gradients, no Inter font, no default shadcn look.
- Reference: aircenter.space (screen recording `reference/aircenter.mp4` in project folder — extract frames with ffmpeg, study scroll choreography, pinning, reveals)
- Language: English only
- Theme: **dark/light toggle**

## Tech Stack
- Frontend: **Vite + vanilla JS** (no React)
- Animation: GSAP 3.13+ (ScrollTrigger, SplitText, Flip) + Lenis smooth scroll
- Backend (Phase 2): **PHP 8 + SQLite** — must run locally via `php -S localhost:8000` AND deploy unchanged to Hostinger shared hosting. No Node on server. No third-party services.
- Fonts: provided by owner as woff2 in `/assets/fonts/` — do not substitute Google defaults
- Contact: footer email + note box → PHP `mail()` endpoint

## Site Structure

### Home (single scroll page)
1. **Preloader** — Lottie animation (owner provides JSON in /assets/lottie/): bouncing circle; on load complete, circle jumps, zooms huge, site reveals from circle center. Play Lottie via lottie-web, handoff to GSAP for zoom/reveal.
2. **Hero** — pinned scroll intro, loop animation instead of showreel (aircenter-style), big type, SplitText reveal
3. **What I do** — three lines: Motion Design / Brand Design / Digital Experiences (confirmed naming)
4. **Motion works** — 6–8 project cards → "See all" button → Motion index page
5. **Brand design works** — 4–5 cards (brand identities + guidelines) → "See all" → Brand index page
6. **Website projects** — 5–6 slots (3 live now) → "See all" → Web index page
7. **Case studies** — project-management stories (e.g. ShopUp Signals podcast launch — planned + managed end to end). Cards → separate case study pages.
8. **How I think** — replaces "process": Listen (first and most important) → Research → Plan → Execute. Scroll-choreographed reveal.
9. **About (short)** — photo + short career text, what he's building lately. Button → full About page. Placeholder copy: classy, confident, concise — owner replaces later.
10. **Hobbies strip** — motorcycle riding, football, drums. Small texts + social/YouTube links.
11. **Footer** — socials, email + note input + send button, "All rights reserved — Tusho" line.

### Sub-pages
- Motion index, Brand index, Web index (simple grids, all projects)
- Individual project page per card (motion, brand, web) — cover glimpse animates from home card
- Individual case study pages
- Full About page

## Animation Language
- Lenis smooth scroll, GSAP ScrollTrigger scrub + pins
- SplitText heading reveals
- Section-by-section choreography per aircenter reference
- **Horizontal-ish works section**: NOT a standard horizontal scroll — cards fly in from different alignments, staggered, loose "cloudy" drift feel
- Page transitions: standard smooth transitions between pages
- Sound toggle for videos (muted by default)
- Custom cursor: OFF by default (performance concern) — optional flag, easy to enable
- `prefers-reduced-motion` fallback
- Mobile: simplified animations, no heavy pins

## Performance
- Preloader covers initial asset load (site allowed to be heavy)
- Videos: webm/mp4 + poster frames, lazy-loaded; ffmpeg compression script in `/scripts/`
- Images: webp

## Backend (Phase 2 — only after frontend approved)
Folder structure:
```
/public        built frontend
/api           PHP endpoints: projects, motion works, brand works, web projects,
               case studies, section texts, about, contact (mail)
/admin         password-protected panel: edit all section texts, edit about,
               upload motion videos / images, CRUD projects + case studies
/uploads       media storage
/data/site.sqlite
```
Frontend Phase 1 uses placeholder JSON shaped exactly like future API responses.

## Assets Owner Provides
- Logo/wordmark SVG
- Fonts (woff2)
- Preloader Lottie JSON
- aircenter.space screen recording
- Motion work videos, brand design images, web project screenshots/links
- Photo for About
- Final copy (later — placeholders first)

## Choreography Notes (from reference/aircenter.mp4)
- Dark canvas, oversized display type filling viewport width, tight leading
- Scattered floating image cards at mixed alignments/sizes drifting on scroll — use this for "cloudy" works section
- Pinned full-viewport text scenes that scrub through statements
- Image containers mask/expand on scroll
- Stat numbers count up on reveal
- Generous section spacing; one idea per viewport

## Rules
- Ask for assets before designing. Do not invent real project content.
- Invoke frontend-design skill before any UI code.
- No authorship/branding lines added to anything unless asked.
