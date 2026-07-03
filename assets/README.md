# Asset drop map — where to put your files

| Folder | What goes here | Status |
|--------|----------------|--------|
| `fonts/` | Circular Std woff2 (all weights) | ✅ done |
| `logo/` | Wordmark SVGs (ink + paper versions) | ✅ done |
| `brand/` | Color/type tokens, voice notes | ✅ done |
| `lottie/` | Preloader Lottie JSON (bouncing circle) | ⏳ pending — interim logo preloader in place |
| `work/motion/` | Motion videos + stills (one subfolder per project) | 🟡 `px-*` placeholders from Behance folder — replace with real project folders |
| `work/brand-identity/` | Brand identity images (one subfolder per project) | 🟡 `px-*` placeholders |
| `work/web/` | Website project screenshots + live links | 🟡 `px-*` placeholder covers |
| `work/case-studies/` | Case study images/files (e.g. ShopUp Signals) | 🟡 `px-*` placeholder covers |
| `about/` | About photo (`portrait.webp` used by the site) | ✅ done |
| `icons/` | UI/social icons | built as needed |
| `favicons/` | Favicon set | wordmark SVG used for now |
| `../reference/` | aircenter.mp4 screen recording | ✅ done |

When you replace a `px-*` folder with a real project, update the matching entry in
`/data/*.json` (paths, title, writeup) — the site renders everything from those files.
Compression helper: `scripts/prep-placeholders.sh` shows the ffmpeg settings
(720p mp4 CRF 26 + webp posters); ffmpeg binary comes from `node_modules/ffmpeg-static`.

Tip: for work projects, name subfolders like `work/motion/01-project-name/` —
the order prefix controls display order on the site.
