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
  $('.s-web .web-arc').innerHTML = items
    .filter((it) => it.status !== 'soon')
    .map(
      (it) => `
      <div class="web-card" data-href="work.html?type=web&slug=${it.slug}" tabindex="0" role="link" aria-label="View ${it.title} project details">
        <div class="web-card-media">
          <img src="${it.cover}" alt="${it.title}" loading="lazy" />
        </div>
        <div class="web-card-info t-label">
          <span class="web-card-title">${it.title}</span>
          ${
            it.url && it.url !== '#'
              ? `<a class="web-card-live" href="${it.url}" target="_blank" rel="noreferrer">Live ↗</a>`
              : `<span class="muted">Soon</span>`
          }
        </div>
      </div>`
    )
    .join('')

  $('.s-web .web-arc')
    .querySelectorAll('.web-card')
    .forEach((card) => {
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
      let lastX = -1
      let lastY = -1
      document.addEventListener('pointermove', (e) => {
        lastX = e.clientX
        lastY = e.clientY
        moveX(lastX)
        moveY(lastY)
      })

      // the preview box adopts each item's real aspect ratio before it shows,
      // so nothing gets cropped to a one-size-fits-all frame
      let shown = false
      const reveal = () => {
        shown = true
        gsap.to(preview, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'power3.out' })
        startPoll()
      }
      let token = 0

      const forceHide = () => {
        if (!shown) return
        shown = false
        token++
        motionRows.forEach((r) => r.classList.remove('is-blurred'))
        gsap.set(preview, { autoAlpha: 0, scale: 0.9 })
        video.pause()
      }

      // pointerleave alone isn't enough: scrolling with a stationary mouse
      // moves the section out from under the cursor without firing any
      // pointer event — and confirmed live, Chrome actually keeps
      // re-hit-testing during scroll and fires pointerenter on whatever row
      // passes under the still cursor, which kept re-arming the preview the
      // whole way up. A scroll-event-based check still isn't enough on its
      // own: once scrolling actually stops (hits the top, momentum decays to
      // zero), no more 'scroll' events fire at all — so if the very last
      // thing that happened was one of those scroll-induced pointerenters,
      // there's nothing left to trigger a cleanup check, and it's stuck
      // forever. Poll on every animation frame instead, for as long as the
      // preview is shown — this doesn't depend on any particular event
      // firing, just continuously checks whether the last known cursor
      // position still falls inside the section's current rect.
      const motionSection = $('.s-motion')
      let pollId = null
      const poll = () => {
        if (!shown) {
          pollId = null
          return
        }
        const r = motionSection.getBoundingClientRect()
        const inside = lastX >= r.left && lastX <= r.right && lastY >= r.top && lastY <= r.bottom
        if (!inside) {
          forceHide()
          pollId = null
          return
        }
        pollId = requestAnimationFrame(poll)
      }
      const startPoll = () => {
        if (pollId == null) pollId = requestAnimationFrame(poll)
      }

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
        shown = false
        token++
        motionRows.forEach((r) => r.classList.remove('is-blurred'))
        gsap.to(preview, { autoAlpha: 0, scale: 0.9, duration: 0.3, ease: 'power2.in' })
        video.pause()
      })
    }
  }

  // brand entries — the visual drifts in like a cloud, from a different
  // side/bottom angle each time rather than the same wipe every time;
  // details rise beside it; once settled, hovering washes the duotone into
  // color from wherever the cursor sits
  const CLOUD_ORIGINS = [
    { x: -70, y: 50, rot: -4 },
    { x: 80, y: 65, rot: 3 },
    { x: -50, y: 75, rot: 3 },
    { x: 60, y: 40, rot: -3 },
  ]
  document.querySelectorAll('.s-brand .brand-entry').forEach((entry, i) => {
    const visual = entry.querySelector('.brand-visual')
    const origin = CLOUD_ORIGINS[i % CLOUD_ORIGINS.length]
    gsap.set(visual, { x: origin.x, y: origin.y, rotate: origin.rot, scale: 0.94, autoAlpha: 0 })
    gsap.to(visual, {
      x: 0, y: 0, rotate: 0, scale: 1, autoAlpha: 1, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: entry, start: 'top 80%', once: true },
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

  // web projects — Trionn's arc conveyor: the cards fly in from the left along
  // a curved path that wraps up and around the centred title, then peel off
  // and settle into a scattered grid (the section pins while this plays). The
  // images keep a gentle water-like float once landed. Cards stay clickable
  // the whole time. Mobile / reduced-motion: a plain stacked fade-in.
  const webStage = $('.s-web .web-stage')
  const webArc = $('.s-web .web-arc')
  const webCards = webArc ? gsap.utils.toArray('.web-card', webArc) : []
  if (webCards.length) {
    if (heavy && window.innerWidth >= 1080) {
      webArc.classList.add('is-arc') // absolute-positions the cards for the path

      const build = () => {
        const vw = window.innerWidth
        const vh = window.innerHeight
        // scattered resting grid (screenshot 2), offsets from stage centre
        const slots = [
          { x: -0.30 * vw, y: -0.15 * vh },
          { x: 0.30 * vw, y: -0.19 * vh },
          { x: -0.33 * vw, y: 0.17 * vh },
          { x: 0.28 * vw, y: 0.15 * vh },
        ]
        // the flight path: just off-screen lower-left → peak up over the title
        const start = { x: -0.72 * vw, y: 0.34 * vh }
        const peak = { x: -0.04 * vw, y: -0.42 * vh }
        return { slots, start, peak }
      }

      let geo = build()
      const startRot = [-16, -12, -18, -14]

      const place = () => {
        webCards.forEach((c, i) => {
          gsap.set(c, {
            xPercent: -50,
            yPercent: -50,
            x: geo.start.x,
            y: geo.start.y,
            rotation: startRot[i % 4],
            autoAlpha: 0,
          })
        })
      }
      place()

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: webStage,
          start: 'top top',
          end: '+=200%',
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onRefresh: () => {
            geo = build()
            place()
          },
        },
      })

      webCards.forEach((c, i) => {
        const at = i * 0.16 // each card follows the one before it along the arc
        const slot = geo.slots[i % geo.slots.length]
        tl.to(c, { autoAlpha: 1, duration: 0.1, ease: 'none' }, at)
        tl.to(
          c,
          {
            motionPath: { path: [geo.start, geo.peak, slot], curviness: 1.4 },
            ease: 'none',
            duration: 1,
          },
          at
        )
        // tilt along the flight, then settle upright as it reaches its slot
        tl.to(c, { rotation: 0, duration: 1, ease: 'power2.out' }, at)
      })
    } else {
      // fallback: simple stacked fade-in grid
      webArc.classList.add('is-stack')
      webCards.forEach((card, i) => {
        gsap.set(card, { y: 50, autoAlpha: 0 })
        gsap.to(card, {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          ease: 'power3.out',
          delay: (i % 2) * 0.08,
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
      // "center center" would center against the FULL viewport, but the fixed
      // header covers the top of it — the real visual middle is the center
      // of the space below the header, which is half a header-height lower
      const headerH = () => document.querySelector('.site-header')?.offsetHeight || 0
      ScrollTrigger.create({
        trigger: '.s-case .case-slider',
        start: () => `center center+=${headerH() / 2}`,
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

    // whole-card 3D tilt + a light float, both driven by the mouse — GSAP
    // owns rotationX/rotationY/x/y on the same element as the entrance
    // y-tween, composing them into one matrix, so nothing fights.
    // (the venom/glow hover effect has been pulled for now — revisit later.)
    if (matchMedia('(pointer: fine)').matches) {
      thinkCards.forEach((card) => {
        const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' })
        const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' })
        const fx = gsap.quickTo(card, 'x', { duration: 0.6, ease: 'power3.out' })
        const fy = gsap.quickTo(card, 'y', { duration: 0.6, ease: 'power3.out' })

        card.addEventListener('pointermove', (e) => {
          const r = card.getBoundingClientRect()
          const nx = (e.clientX - r.left) / r.width - 0.5
          const ny = (e.clientY - r.top) / r.height - 0.5
          rx(ny * -22)
          ry(nx * 22)
          fx(nx * 16)
          fy(ny * 16)
        })
        card.addEventListener('pointerleave', () => {
          rx(0)
          ry(0)
          fx(0)
          fy(0)
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
