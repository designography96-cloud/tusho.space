// Home sections — render from API-shaped JSON, then choreograph per ART-DIRECTION.md.
import { gsap, ScrollTrigger, SplitText } from '../core/scroll.js'
import { motionOK, heavy } from '../core/env.js'
import { drawRuleOnEnter, riseOnEnter, penDuration } from '../core/draw.js'

const $ = (sel, root = document) => root.querySelector(sel)

/* ————————————————— renderers ————————————————— */

const WID_LINKS = ['motion.html', 'brand.html', 'web.html']

export function renderWhatIDo(items) {
  $('.s-whatido .wid-rows').innerHTML = items
    .map(
      (it, i) => `
      <a class="wid-row" href="${WID_LINKS[i] || '#'}">
        <div class="rule" aria-hidden="true"></div>
        <h3 class="wid-title">${it.title}</h3>
        <p class="wid-desc">${it.description}</p>
        <span class="wid-arrow" aria-hidden="true">→</span>
      </a>`
    )
    .join('')
}

// a titled list, each row hover-blurring its siblings while a cursor-following
// preview (video if we have one, else the cover still) shows the work itself —
// the "portfolio hover effect" pattern, not a static grid.
export function renderMotion(items) {
  $('.s-motion .motion-list').innerHTML = items
    .map(
      (it, i) => `
      <a class="motion-row" href="work.html?type=motion&slug=${it.slug}" data-cover="${it.cover}" data-video="${it.video || ''}">
        <div class="rule" aria-hidden="true"></div>
        <span class="motion-row-index t-label">${String(i + 1).padStart(2, '0')}</span>
        <h3 class="motion-row-title">${it.title}</h3>
        <span class="motion-row-meta t-label">${it.client || ''} ${it.year ? '· ' + it.year : ''}</span>
      </a>`
    )
    .join('')
}

// the visual rests in duotone (grayscale) and washes into full color from
// wherever the cursor sits — a deliberate reveal, not a static photo.
export function renderBrand(items) {
  $('.s-brand .brand-list').innerHTML = items
    .map(
      (it) => `
      <div class="brand-entry">
        <a class="work-card" href="work.html?type=brand&slug=${it.slug}">
          <div class="frame frame--natural brand-visual">
            <img class="brand-visual-color" src="${it.cover}" alt="${it.title}" loading="lazy" />
            <img class="brand-visual-mono" src="${it.cover}" alt="" aria-hidden="true" loading="lazy" />
          </div>
        </a>
        <aside class="brand-notes glass">
          <span class="t-label muted">${it.client} · ${it.year}</span>
          <h3 class="t-h3">${it.title}</h3>
          <p class="t-body">${it.summary}</p>
          <div class="brand-tags">${(it.tags || []).map((t) => `<span class="t-label">${t}</span>`).join('')}</div>
          <a class="btn-line t-label" href="work.html?type=brand&slug=${it.slug}"><span class="btn-rule"></span>View project</a>
        </aside>
      </div>`
    )
    .join('')
}

// home teaser: a pinned "cloud" stop-scroller — cards fly up from below with
// staggered left/mid/right origins and settle into an offset shelf (echoes
// the Motion-works cloud). Each card opens the project detail page; a
// separate live-view link skips straight to the real site. Only shipped
// work; new entries appear here automatically once added.
export function renderWeb(items) {
  $('.s-web .web-cloud').innerHTML = items
    .filter((it) => it.status !== 'soon')
    .map(
      (it) => `
      <div class="web-card" data-href="work.html?type=web&slug=${it.slug}" tabindex="0" role="link" aria-label="View ${it.title} project details">
        <div class="web-card-media frame frame--natural">
          <img src="${it.cover}" alt="${it.title}" loading="lazy" />
        </div>
        <div class="web-card-info">
          <h3 class="web-card-title t-h3">${it.title}</h3>
          <div class="web-card-meta t-label">
            <span>${it.stack} · ${it.year}</span>
            ${
              it.url && it.url !== '#'
                ? `<a class="web-card-live" href="${it.url}" target="_blank" rel="noreferrer">Live view ↗</a>`
                : `<span class="muted">Link soon</span>`
            }
          </div>
        </div>
      </div>`
    )
    .join('')

  $('.s-web .web-cloud').querySelectorAll('.web-card').forEach((card) => {
    const go = () => (location.href = card.dataset.href)
    card.addEventListener('click', (e) => {
      if (e.target.closest('.web-card-live')) return
      go()
    })
    card.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('.web-card-live')) {
        e.preventDefault()
        go()
      }
    })
  })
}

// Pinned stop-scroll gallery (aircenter pattern) — every case study is a
// full slide (image + glass panel), absolutely stacked; scroll crossfades
// between them and fills each slide's progress bar. Scales to any number of
// case studies with no layout change — mobile falls back to plain stacking.
const progressSegs = (count) =>
  Array.from({ length: count }, () => `<div class="seg"><div class="seg-fill"></div></div>`).join('')

export function renderCases(items) {
  $('.s-case .case-slider-inner').innerHTML = items
    .map(
      (cs, i) => `
      <div class="case-slide" data-index="${i}">
        <div class="case-slide-media">
          <img class="case-slide-img" src="${cs.cover}" alt="${cs.title}" loading="${i === 0 ? 'eager' : 'lazy'}" />
        </div>
        <div class="case-slider-panel glass">
          <div class="case-progress">${progressSegs(items.length)}</div>
          <p class="case-counter">
            <span class="case-counter-current t-stat">${i + 1}</span>
            <span class="case-counter-total muted">/ ${items.length}</span>
          </p>
          <div class="case-text">
            <span class="t-label">${cs.role} · ${cs.year}</span>
            <h3 class="t-h3">${cs.title}</h3>
            <p class="t-body">${cs.summary}</p>
            <a class="btn-line t-label" href="case-study.html?slug=${cs.slug}">
              <span class="btn-rule"></span>Learn more
            </a>
          </div>
        </div>
      </div>`
    )
    .join('')
}

export function renderThink(think) {
  $('.s-think .think-cards').innerHTML = think.steps
    .map(
      (s, i) => `
      <div class="think-card glass">
        <div class="think-card-face">
          <span class="think-card-number">${String(i + 1).padStart(2, '0')}</span>
          <p class="think-card-desc">${s.description}</p>
          <span class="think-card-title">${s.title}</span>
        </div>
      </div>`
    )
    .join('')
}

export function renderAbout(aboutShort) {
  $('.s-about .about-text .t-h2').textContent = aboutShort.heading
  $('.s-about .about-text .t-body').textContent = aboutShort.body
  $('.s-about .about-cta span:last-child').textContent = aboutShort.cta
}

const GLYPHS = [
  // riding — two wheels and a line of road
  `<svg class="hobby-glyph" viewBox="0 0 56 40" fill="none"><circle cx="12" cy="28" r="8"/><circle cx="44" cy="28" r="8"/><path d="M12 28 L22 14 L38 14 L44 28 M22 14 L18 8 M30 14 L30 28"/></svg>`,
  // football — circle with seam lines
  `<svg class="hobby-glyph" viewBox="0 0 56 40" fill="none"><circle cx="28" cy="20" r="14"/><path d="M28 6 L28 14 M28 14 L17 22 M28 14 L39 22 M17 22 L21 34 M39 22 L35 34 M21 34 L35 34"/></svg>`,
  // drums — a drum and two sticks
  `<svg class="hobby-glyph" viewBox="0 0 56 40" fill="none"><path d="M14 20 h28 v12 a14 6 0 0 1 -28 0 z"/><path d="M14 20 a14 6 0 0 0 28 0 a14 6 0 0 0 -28 0"/><line x1="20" y1="16" x2="8" y2="4"/><line x1="36" y1="16" x2="48" y2="4"/></svg>`,
]

// An accordion of photo panes: hover (or tap, on touch) opens one at a time,
// its photo warming from muted to full colour and its description sliding in.
export function renderHobbies(hobbies) {
  $('.s-hobbies .hobby-heading').textContent = hobbies.heading
  $('.s-hobbies .hobby-panes').innerHTML = hobbies.items
    .map(
      (h, i) => `
      <div class="hobby-pane${i === 0 ? ' is-active' : ''}" data-index="${i}">
        <div class="hobby-media"><img src="${h.image}" alt="${h.title}" loading="lazy" /></div>
        <div class="hobby-scrim" aria-hidden="true"></div>
        <div class="hobby-info">
          ${GLYPHS[i] || ''}
          <h3 class="hobby-title">${h.title}</h3>
          <div class="hobby-desc-wrap"><p class="hobby-desc">${h.description}</p></div>
        </div>
      </div>`
    )
    .join('')
}

export function renderFooter(footer) {
  const email = $('.s-footer .footer-email')
  email.href = `mailto:${footer.email}`
  $('.s-footer .footer-email .email-text').textContent = footer.email
  $('.s-footer .footer-socials').innerHTML = footer.socials
    .map((s) => `<a class="t-label" href="${s.url}" target="_blank" rel="noreferrer">${s.label}</a>`)
    .join('')
  $('.s-footer .rights-text').textContent = footer.rights

  // Phase 1: no backend yet — compose a mailto with the visitor's note.
  // Phase 2 swap: POST to api/contact.php instead, form markup unchanged.
  const form = $('.s-footer .footer-form')
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const from = form.querySelector('.footer-form-email').value.trim()
    const note = form.querySelector('.footer-form-message').value.trim()
    const body = `${note}\n\n— ${from}`
    location.href = `mailto:${footer.email}?subject=${encodeURIComponent('Inquiry from tusho.space')}&body=${encodeURIComponent(body)}`
  })
}

/* ————————————————— choreography ————————————————— */

export function initSections() {
  if (!motionOK) return

  // section heads: label + rule
  document.querySelectorAll('.section-head').forEach((head) => {
    const rule = head.querySelector('.rule')
    if (rule) drawRuleOnEnter(rule, { trigger: head })
    const title = head.querySelector('.t-h2')
    if (title) {
      const split = SplitText.create(title, { type: 'lines', mask: 'lines' })
      riseOnEnter(split.lines, { trigger: head })
    }
  })

  // what i do — one consistent reveal: rule extends, title rises from its mask
  document.querySelectorAll('.s-whatido .wid-row').forEach((row) => {
    const rule = row.querySelector('.rule')
    const title = row.querySelector('.wid-title')
    const desc = row.querySelector('.wid-desc')
    drawRuleOnEnter(rule, { trigger: row })
    const split = SplitText.create(title, { type: 'lines', mask: 'lines' })
    riseOnEnter(split.lines, { trigger: row, start: 'top 80%' })
    gsap.set(desc, { autoAlpha: 0, y: 16 })
    gsap.to(desc, {
      autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.3,
      scrollTrigger: { trigger: row, start: 'top 80%', once: true },
    })
  })

  // motion works — titled list; hovering a row blurs its siblings and a
  // single shared preview (video if we have one, else the cover) follows
  // the cursor to show the work itself
  const motionRows = gsap.utils.toArray('.s-motion .motion-row')
  if (motionRows.length) {
    riseOnEnter(motionRows, { trigger: '.s-motion .motion-list', start: 'top 85%', stagger: 0.06 })

    const preview = $('.s-motion .motion-preview')
    if (preview && matchMedia('(pointer: fine)').matches && heavy) {
      const video = preview.querySelector('video')
      const img = preview.querySelector('img')
      const moveX = gsap.quickTo(preview, 'x', { duration: 0.5, ease: 'power3.out' })
      const moveY = gsap.quickTo(preview, 'y', { duration: 0.5, ease: 'power3.out' })

      gsap.set(preview, { autoAlpha: 0, scale: 0.9 })
      document.addEventListener('pointermove', (e) => {
        moveX(e.clientX)
        moveY(e.clientY)
      })

      // the preview box adopts each item's real aspect ratio before it shows,
      // so nothing gets cropped to a one-size-fits-all frame
      const reveal = () => gsap.to(preview, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'power3.out' })
      let token = 0

      motionRows.forEach((row) => {
        row.addEventListener('pointerenter', () => {
          motionRows.forEach((r) => r.classList.toggle('is-blurred', r !== row))
          const myToken = ++token
          const src = row.dataset.video
          if (src) {
            img.style.display = 'none'
            video.style.display = ''
            if (video.currentSrc !== src) video.src = src
            video.play().catch(() => {})
            const applyAndReveal = () => {
              if (myToken !== token) return
              preview.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`
              reveal()
            }
            if (video.readyState >= 1) applyAndReveal()
            else video.addEventListener('loadedmetadata', applyAndReveal, { once: true })
          } else {
            video.style.display = 'none'
            img.style.display = ''
            img.src = row.dataset.cover
            const applyAndReveal = () => {
              if (myToken !== token) return
              preview.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`
              reveal()
            }
            if (img.complete && img.naturalWidth) applyAndReveal()
            else img.addEventListener('load', applyAndReveal, { once: true })
          }
        })
        row.addEventListener('pointerleave', () => {
          row.classList.remove('is-blurred')
        })
      })

      $('.s-motion .motion-list').addEventListener('pointerleave', () => {
        motionRows.forEach((r) => r.classList.remove('is-blurred'))
        gsap.to(preview, { autoAlpha: 0, scale: 0.9, duration: 0.3, ease: 'power2.in' })
        video.pause()
      })
    }
  }

  // brand entries — the visual wipes in from the notes' side, details rise
  // beside it; once settled, hovering washes the duotone into color from
  // wherever the cursor sits
  document.querySelectorAll('.s-brand .brand-entry').forEach((entry, i) => {
    const visual = entry.querySelector('.brand-visual')
    const side = i % 2 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)'
    gsap.set(visual, { clipPath: side })
    gsap.to(visual, {
      clipPath: 'inset(0 0% 0 0%)', duration: 1, ease: 'power3.inOut',
      scrollTrigger: { trigger: entry, start: 'top 78%', once: true },
    })

    if (matchMedia('(pointer: fine)').matches) {
      const mono = visual.querySelector('.brand-visual-mono')
      visual.addEventListener('pointerenter', () => mono.style.setProperty('--reveal-r', '260px'))
      visual.addEventListener('pointermove', (e) => {
        const r = visual.getBoundingClientRect()
        mono.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
        mono.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
      })
      visual.addEventListener('pointerleave', () => mono.style.setProperty('--reveal-r', '0px'))
    }

    const notes = gsap.utils.toArray(entry.querySelectorAll('.brand-notes > *'))
    gsap.set(notes, { autoAlpha: 0, y: 24 })
    gsap.to(notes, {
      autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.07, delay: 0.25,
      scrollTrigger: { trigger: entry, start: 'top 78%', once: true },
    })
  })

  // web projects — pinned "cloud" stop-scroller: cards fly up from below with
  // staggered left/mid/right origins, converging on their resting shelf
  // position as the section scrubs, then release.
  const webCloud = $('.s-web .web-cloud')
  const webCards = webCloud ? gsap.utils.toArray('.web-card', webCloud) : []
  if (webCards.length) {
    if (heavy && window.innerWidth >= 1080) {
      const ORIGINS = [
        { x: -40, rot: -3 },
        { x: 20, rot: 2 },
        { x: -20, rot: -2 },
        { x: 40, rot: 3 },
      ]
      gsap.set(webCards, {
        y: (i) => (i % 2 ? '70vh' : '55vh'),
        x: (i) => ORIGINS[i % ORIGINS.length].x,
        rotate: (i) => ORIGINS[i % ORIGINS.length].rot,
        autoAlpha: 0,
      })

      const n = webCards.length
      const pinDistance = window.innerHeight * 1.15
      const bg = $('.gradient-bg')
      ScrollTrigger.create({
        trigger: '.s-web',
        start: 'top top',
        end: () => '+=' + pinDistance,
        pin: true,
        scrub: 0.5,
        invalidateOnRefresh: true,
        onLeave: () => bg && gsap.set(bg, { y: 0 }),
        onLeaveBack: () => bg && gsap.set(bg, { y: 0 }),
        onUpdate(self) {
          webCards.forEach((card, i) => {
            // staggered, overlapping windows so cards arrive one after another
            const windowStart = (i / n) * 0.7
            const windowEnd = windowStart + 0.45
            const p = gsap.utils.clamp(0, 1, (self.progress - windowStart) / (windowEnd - windowStart))
            const eased = gsap.parseEase('power3.out')(p)
            gsap.set(card, {
              y: (i % 2 ? 70 : 55) * (1 - eased) + 'vh',
              x: ORIGINS[i % ORIGINS.length].x * (1 - eased),
              rotate: ORIGINS[i % ORIGINS.length].rot * (1 - eased),
              autoAlpha: eased,
            })
          })
          // the background drifts at ~10% of the section's own scroll speed —
          // never fully stopped, even while the cards are pinned in place
          if (bg) gsap.set(bg, { y: self.progress * pinDistance * 0.1 })
        },
      })
    } else {
      webCards.forEach((card, i) => {
        gsap.set(card, { y: 40, autoAlpha: 0 })
        gsap.to(card, {
          y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', delay: (i % 2) * 0.08,
          scrollTrigger: { trigger: card, start: 'top 90%', once: true },
        })
      })
    }
  }

  // case studies — pinned stop-scroll gallery. Desktop: pin the wrapper for
  // N*90vh of scroll, crossfade between slides, fill each slide's progress
  // bar. Mobile/reduced-motion: plain stacked reveal, no pin.
  const caseSlider = $('.s-case .case-slider-inner')
  const caseSlides = caseSlider ? gsap.utils.toArray('.case-slide', caseSlider) : []
  if (caseSlides.length) {
    if (heavy) {
      const n = caseSlides.length
      const segFills = caseSlides.map((s) => gsap.utils.toArray('.seg-fill', s))

      const CROSSFADE = 0.35 // fraction of one slide's dwell spent blending into the next
      ScrollTrigger.create({
        trigger: '.s-case .case-slider',
        start: 'center center',
        end: () => '+=' + n * window.innerHeight * 0.9,
        pin: true,
        scrub: 0.5,
        invalidateOnRefresh: true,
        onUpdate(self) {
          const raw = self.progress * n
          const active = Math.min(n - 1, Math.floor(raw))
          const withinItem = raw - active
          const fadeT = gsap.utils.clamp(0, 1, (withinItem - (1 - CROSSFADE)) / CROSSFADE)

          caseSlides.forEach((slide, i) => {
            let alpha = 0
            if (i === active) alpha = 1 - fadeT
            else if (i === active + 1) alpha = fadeT
            gsap.set(slide, { autoAlpha: alpha, filter: `blur(${(1 - alpha) * 14}px)` })
          })

          // every slide's progress bar reflects the same overall position
          segFills.forEach((fills) => {
            fills.forEach((fill, i) => {
              const ratio = i < active ? 1 : i === active ? withinItem : 0
              gsap.set(fill, { scaleX: ratio })
            })
          })
        },
      })
    } else {
      caseSlides.forEach((slide) => {
        const img = slide.querySelector('.case-slide-img')
        gsap.set(img, { clipPath: 'inset(0 0 100% 0)' })
        gsap.to(img, {
          clipPath: 'inset(0 0 0% 0)', duration: 1, ease: 'power3.inOut',
          scrollTrigger: { trigger: slide, start: 'top 80%', once: true },
        })
        riseOnEnter([slide.querySelector('.case-text')], { trigger: slide, start: 'top 80%' })
        // one slide's progress bar is enough on mobile; fill it fully as it enters
        gsap.set(gsap.utils.toArray('.seg-fill', slide), { scaleX: 1 })
      })
    }
  }

  // how i think — the four glass cards rise in with a stagger as the section enters
  const thinkCards = gsap.utils.toArray('.s-think .think-card')
  if (thinkCards.length) {
    gsap.set(thinkCards, { autoAlpha: 0, y: 32 })
    ScrollTrigger.create({
      trigger: '.s-think',
      start: 'top 78%',
      once: true,
      onEnter: () =>
        gsap.to(thinkCards, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1 }),
    })

    // whole-card 3D tilt (GSAP owns rotationX/rotationY on the same element
    // as the entrance y-tween — it composes them into one matrix, no fight)
    // plus a "venom" hover effect: three blurred blobs trailing the cursor
    // at different speeds for a lava-tendril feel, blended by difference so
    // the color always reads as the inverse of the card — no new hue needed
    // — topped with a tight, near-lagless shine hotspot.
    if (matchMedia('(pointer: fine)').matches) {
      thinkCards.forEach((card) => {
        const face = card.querySelector('.think-card-face')
        const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' })
        const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' })
        const b1x = gsap.quickTo(face, '--b1x', { duration: 0.5, ease: 'power2.out' })
        const b1y = gsap.quickTo(face, '--b1y', { duration: 0.5, ease: 'power2.out' })
        const b2x = gsap.quickTo(face, '--b2x', { duration: 0.85, ease: 'power2.out' })
        const b2y = gsap.quickTo(face, '--b2y', { duration: 0.85, ease: 'power2.out' })
        const b3x = gsap.quickTo(face, '--b3x', { duration: 1.2, ease: 'power2.out' })
        const b3y = gsap.quickTo(face, '--b3y', { duration: 1.2, ease: 'power2.out' })
        const sx = gsap.quickTo(face, '--sx', { duration: 0.12, ease: 'power2.out' })
        const sy = gsap.quickTo(face, '--sy', { duration: 0.12, ease: 'power2.out' })

        card.addEventListener('pointermove', (e) => {
          const r = card.getBoundingClientRect()
          const px = e.clientX - r.left
          const py = e.clientY - r.top
          const nx = px / r.width - 0.5
          const ny = py / r.height - 0.5
          rx(ny * -22)
          ry(nx * 22)
          b1x(px + 'px'); b1y(py + 'px')
          b2x(px + 'px'); b2y(py + 'px')
          b3x(px + 'px'); b3y(py + 'px')
          sx(px + 'px'); sy(py + 'px')
          face.style.setProperty('--glow-o', '1')
        })
        card.addEventListener('pointerleave', () => {
          rx(0)
          ry(0)
          face.style.setProperty('--glow-o', '0')
        })
      })
    }
  }

  // about — the circle opens on the portrait, text rises
  const aboutImg = $('.s-about .about-photo img')
  if (aboutImg) {
    gsap.set(aboutImg, { clipPath: 'circle(0% at 50% 50%)' })
    gsap.to(aboutImg, {
      clipPath: 'circle(71% at 50% 50%)', duration: 1, ease: 'power3.inOut',
      scrollTrigger: { trigger: '.s-about', start: 'top 75%', once: true },
    })
    riseOnEnter(gsap.utils.toArray('.s-about .about-text > *'), {
      trigger: '.s-about',
      start: 'top 75%',
      stagger: 0.08,
    })
  }

  // hobbies — panes rise in on scroll, then hover (or tap) opens one at a time
  const hobbyPanes = gsap.utils.toArray('.s-hobbies .hobby-pane')
  if (hobbyPanes.length) {
    gsap.set(hobbyPanes, { autoAlpha: 0, y: 30 })
    ScrollTrigger.create({
      trigger: '.s-hobbies',
      start: 'top 78%',
      once: true,
      onEnter: () =>
        gsap.to(hobbyPanes, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1 }),
    })

    hobbyPanes.forEach((pane) => {
      const strokes = pane.querySelectorAll('.hobby-glyph path, .hobby-glyph circle, .hobby-glyph line')
      strokes.forEach((s) => {
        const len = s.getTotalLength ? s.getTotalLength() : 100
        s.style.strokeDasharray = len
        s.style.strokeDashoffset = len
      })
      gsap.to(strokes, {
        strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut', stagger: 0.08,
        scrollTrigger: { trigger: '.s-hobbies', start: 'top 78%', once: true },
      })
    })

    // fine-pointer devices get hover; touch devices get tap-to-open
    if (matchMedia('(pointer: fine)').matches) {
      hobbyPanes.forEach((pane) => {
        pane.addEventListener('pointerenter', () => {
          hobbyPanes.forEach((p) => p.classList.toggle('is-active', p === pane))
        })
      })
    } else {
      hobbyPanes.forEach((pane) => {
        pane.addEventListener('click', () => {
          hobbyPanes.forEach((p) => p.classList.toggle('is-active', p === pane))
        })
      })
    }
  }

  // footer — email + socials rise in, the underline draws, form fades up beside it
  riseOnEnter(gsap.utils.toArray('.s-footer .footer-contact > *'), {
    trigger: '.s-footer',
    start: 'top 80%',
    stagger: 0.1,
  })
  const emailRule = $('.s-footer .email-rule')
  if (emailRule) drawRuleOnEnter(emailRule, { trigger: '.s-footer .footer-email', start: 'top 90%' })
  const footerForm = $('.s-footer .footer-form')
  if (footerForm) {
    gsap.set(footerForm, { autoAlpha: 0, y: 24 })
    ScrollTrigger.create({
      trigger: '.s-footer',
      start: 'top 75%',
      once: true,
      onEnter: () =>
        gsap.to(footerForm, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }),
    })
  }

  // pins (esp. the horizontal motion scroller) measure distances up front — but
  // videos and webfonts land late and shift layout. Recompute after they settle.
  const refresh = () => ScrollTrigger.refresh()
  window.addEventListener('load', refresh)
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh)
  document.querySelectorAll('.s-motion video, .s-motion img').forEach((m) => {
    m.addEventListener('loadedmetadata', refresh, { once: true })
    m.addEventListener('load', refresh, { once: true })
  })
  setTimeout(refresh, 1200)
}
