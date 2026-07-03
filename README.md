# tusho.space

Portfolio site for Tusho — motion designer / creative problem solver.
Full spec: [brief.md](brief.md) · Art direction: [ART-DIRECTION.md](ART-DIRECTION.md) · Brand: [assets/brand/brand-tokens.md](assets/brand/brand-tokens.md)

## Stack
- Vite + vanilla JS (no React)
- GSAP 3.15 (ScrollTrigger, SplitText, Flip) + Lenis smooth scroll + lottie-web
- Phase 1: frontend only, placeholder JSON in `/data/` shaped like future PHP API responses
- Phase 2 (later): PHP 8 + SQLite, deploys unchanged to Hostinger shared hosting

## Run
```bash
npm install
npm run dev
```

## Folders
```
assets/        fonts, logo, brand tokens, lottie, work media (see assets/README.md)
data/          placeholder JSON (API-shaped)
reference/     aircenter.mp4 screen recording (animation quality bar)
scripts/       ffmpeg compression scripts for work videos
src/           site source
```
