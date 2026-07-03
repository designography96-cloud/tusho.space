#!/bin/bash
# Placeholder media prep — pulls from local Behance portfolio folder, compresses
# for web, drops into assets/work/*/px-* subfolders. px- prefix = placeholder,
# to be replaced by real project folders later.
set -e
FF="$(node -e "console.log(require('ffmpeg-static'))")"
B="/Users/m.h.tusher/Google Drive Sync/Incognito/My Designing World/Behance Project portfolio"
W="$(cd "$(dirname "$0")/.." && pwd)/assets/work"

vid() { # src, destdir  → loop.mp4 (8s 720p muted) + poster.webp
  mkdir -p "$2"
  "$FF" -i "$1" -t 8 -an -vf "scale=1280:-2" -c:v libx264 -crf 26 -preset veryfast \
    -movflags +faststart "$2/loop.mp4" -y -loglevel error
  "$FF" -ss 1 -i "$1" -frames:v 1 -vf "scale=1280:-2" -c:v libwebp -q:v 80 "$2/poster.webp" -y -loglevel error
}
img() { # src, dest.webp  → max 1600w webp
  mkdir -p "$(dirname "$2")"
  "$FF" -i "$1" -vf "scale='min(1600,iw)':-2" -c:v libwebp -q:v 82 "$2" -y -loglevel error
}

# ---- motion works (6 video + 2 image-only) ----
vid "$B/REDX active coverage campaign/glitch- REDX dynamic ad - Merchant campaign may 2024_1.mp4" "$W/motion/px-01-redx-glitch"
vid "$B/19. Tahmid chowdhury dynamic intro av/smaller size REDX - Tahmid Dynamic v2_1_1.mp4"      "$W/motion/px-02-tahmid-intro"
vid "$B/21. Khelowar chess competition dynamic /Khelowar Dynamic  Chess - 2022.mp4"               "$W/motion/px-03-khelowar-chess"
vid "$B/22. Mokam achor av dynamic/smaller.mp4"                                                   "$W/motion/px-04-mokam-anchor"
vid "$B/23. ShopUp code zero 0 av/Code zero AV_2_1_1.mp4"                                         "$W/motion/px-05-code-zero"
vid "$B/20. ShopUp intro AV/smaller size ShopUp intro Av - Startup awards dynamic - 2023_7_1.mp4" "$W/motion/px-06-shopup-intro"
img "$B/11. MOTION GRAPHICS LAND ROVER DEFENDER/COVER-01.jpg"                                     "$W/motion/px-07-land-rover/poster.webp"
img "$B/14. motion graphics - pagani/Untitled-1-01.jpg"                                           "$W/motion/px-08-pagani/poster.webp"

# ---- brand works ----
i=0; for f in "Full-Color Logo MockUp.jpg" "Hanging Wall Sign MockUp 5.jpg" "I Love 3D logo Mock-Up 2.jpg" "Office Retro Modern Mockup Logo by GraphicsFamily.jpg"; do
  i=$((i+1)); img "$B/15. Bumble bee logo/$f" "$W/brand-identity/px-01-bumble-bee/0$i.webp"; done
i=0; for f in "10_Flyer_Mockup.jpg" "instagram template.jpg" "Clay-18@3x.jpg" "Inno 64 tofu.jpg" "WeChat Image_20211031141154.jpg"; do
  i=$((i+1)); img "$B/16. Nilambala/$f" "$W/brand-identity/px-02-nilambala/0$i.webp"; done
i=0; for f in "NEW-03.png" "TITLE-03.png"; do
  i=$((i+1)); img "$B/5. Abrar Trading Logo/$f" "$W/brand-identity/px-03-abrar-trading/0$i.webp"; done
i=0; for n in 01 02 03 05 08 09; do
  i=$((i+1)); img "$B/17. giftorita recent works/giftorita recent work-$n.jpg" "$W/brand-identity/px-04-giftorita/0$i.webp"; done

# ---- case studies ----
img "$B/20. ShopUp intro AV/smaller size ShopUp intro Av - Startup awards dynamic - 2023_7_1.mp4" "$W/case-studies/px-01-signals/cover.webp" || true
"$FF" -ss 2 -i "$B/20. ShopUp intro AV/smaller size ShopUp intro Av - Startup awards dynamic - 2023_7_1.mp4" -frames:v 1 -vf "scale=1280:-2" -c:v libwebp -q:v 80 "$W/case-studies/px-01-signals/cover.webp" -y -loglevel error
mkdir -p "$W/case-studies/px-02-redx-coverage"
"$FF" -ss 2 -i "$B/REDX active coverage campaign/glitch- REDX dynamic ad - Merchant campaign may 2024_1.mp4" -frames:v 1 -vf "scale=1280:-2" -c:v libwebp -q:v 80 "$W/case-studies/px-02-redx-coverage/cover.webp" -y -loglevel error

# ---- web projects (placeholder covers) ----
img "$B/Web Banner/Untitled-3-01.jpg"        "$W/web/px-01/cover.webp"
img "$B/18. After effects clips/COVER-01.jpg" "$W/web/px-02/cover.webp"
img "$B/Covers x/logo animation cover.png"    "$W/web/px-03/cover.webp"

echo "DONE"; find "$W" -type f | sort
