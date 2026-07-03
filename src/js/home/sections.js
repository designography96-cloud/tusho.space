// Home sections — render from API-shaped JSON, then choreograph per ART-DIRECTION.md.
import { gsap, ScrollTrigger, SplitText } from '../core/scroll.js'
import { motionOK, heavy } from '../core/env.js'
import { drawRuleOnEnter, riseOnEnter, penDuration } from '../core/draw.js'

const $ = (sel, root = document) => root.querySelector(sel)

/* ————————————————— renderers ————————————————— */

const WID_LINKS = ['/motion.html', '/brand.html', '/web.html']

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

function cardHTML(item, type) {
  const media = item.video
    ? `<video muted loop playsinline preload="metadata" poster="${item.cover}" src="${item.video}"></video>`
    : `<img src="${item.cover}" alt="${item.title}" loading="lazy" />`
  return `
    <a class="work-card" href="/work.html?type=${type}&slug=${item.slug}" data-speed="${0.85 + Math.abs((item.order * 7) % 7) * 0.05}">
      <div class="frame frame--natural">${media}</div>
      <div class="card-meta">
        <span class="card-title t-h3">${item.title}</span>
        <span class="t-label">${item.client || ''} ${item.year ? '· ' + item.year : ''}</span>
      </div>
    </a>`
}

export function renderMotion(items) {
  $('.s-motion .cloud').innerHTML =
    items.map((it) => cardHTML(it, 'motion')).join('') +
    `<a class="mo-more btn-line t-label" href="/motion.html"><span class="btn-rule"></span>See all motion</a>`
}

export function renderBrand(items) {
  $('.s-brand .brand-list').innerHTML = items
    .map(
      (it) => `
      <div class="brand-entry">
        <a class="work-card" href="/work.html?type=brand&slug=${it.slug}">
          <div class="frame frame--natural"><img src="${it.cover}" alt="${it.title}" loading="lazy" /></div>
        </a>
        <aside class="brand-notes">
          <span class="t-label muted">${it.client} · ${it.year}</span>
          <h3 class="t-h3">${it.title}</h3>
          <p class="t-body">${it.summary}</p>
          <div class="brand-tags">${(it.tags || []).map((t) => `<span class="t-label">${t}</span>`).join('')}</div>
          <a class="btn-line t-label" href="/work.html?type=brand&slug=${it.slug}"><span class="btn-rule"></span>View project</a>
        </aside>
      </div>`
    )
    .join('')
}

export function webRowHTML(it) {
  const live =
    it.url && it.url !== '#'
      ? `<a class="row-live t-label" href="${it.url}" target="_blank" rel="noreferrer">Live ↗</a>`
      : `<span class="row-live t-label muted">Link soon</span>`
  return `<div class="index-row">
    <a href="/work.html?type=web&slug=${it.slug}"><span class="row-title">${it.title}</span></a>
    <span class="row-meta t-label">${it.stack} · ${it.year}</span>
    ${live}
    ${it.cover ? `<span class="row-thumb frame"><img src="${it.cover}" alt="" loading="lazy" /></span>` : ''}
  </div>`
}

export function renderWeb(items) {
  // only shipped work is listed — no "in production" rows; new entries appear
  // here automatically once the backend has them
  $('.s-web .index-list').innerHTML = items
    .filter((it) => it.status !== 'soon')
    .map(webRowHTML)
    .join('')
}

export function renderCases(items) {
  $('.s-case .case-list').innerHTML = items
    .map(
      (cs) => `
      <div class="case-entry">
        <a class="case-media" href="/case-study.html?slug=${cs.slug}">
          <div class="frame"><img src="${cs.cover}" alt="${cs.title}" loading="lazy" /></div>
        </a>
        <div class="case-body">
          <span class="t-label muted">${cs.role} · ${cs.year}</span>
          <h3 class="t-h3" style="margin-block:12px 8px">${cs.title}</h3>
          <p class="t-body muted">${cs.summary}</p>
          <div class="case-stats">
            ${cs.stats
              .map(
                (s) => `
              <div class="stat">
                <span class="t-stat" data-count="${s.value}">0</span><span class="t-stat">${s.suffix}</span>
                <div class="rule rule--stroke stat-rule" data-ratio="${s.value}"></div>
                <span class="t-label">${s.label}</span>
              </div>`
              )
              .join('')}
          </div>
          <a class="btn-line t-label" href="/case-study.html?slug=${cs.slug}" style="margin-top:24px">
            <span class="btn-rule"></span>Read the story
          </a>
        </div>
      </div>`
    )
    .join('')
}

export function renderThink(think) {
  $('.s-think .think-words').innerHTML = think.steps
    .map((s, i) => `<span class="think-word" data-step="${i}"><span class="tw-inner">${s.title}</span></span>`)
    .join('')
  $('.s-think .think-stations').innerHTML = think.steps
    .map(
      (s, i) => `
      <div class="station" data-step="${i}">
        <span class="t-label">${String(i + 1).padStart(2, '0')} · ${s.title}</span>
        <p class="t-body">${s.description}</p>
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
  `<svg class="glyph" viewBox="0 0 56 40"><circle cx="12" cy="28" r="8"/><circle cx="44" cy="28" r="8"/><path d="M12 28 L22 14 L38 14 L44 28 M22 14 L18 8 M30 14 L30 28"/></svg>`,
  // football — circle with seam lines
  `<svg class="glyph" viewBox="0 0 56 40"><circle cx="28" cy="20" r="14"/><path d="M28 6 L28 14 M28 14 L17 22 M28 14 L39 22 M17 22 L21 34 M39 22 L35 34 M21 34 L35 34"/></svg>`,
  // drums — a drum and two sticks
  `<svg class="glyph" viewBox="0 0 56 40"><path d="M14 20 h28 v12 a14 6 0 0 1 -28 0 z"/><path d="M14 20 a14 6 0 0 0 28 0 a14 6 0 0 0 -28 0"/><line x1="20" y1="16" x2="8" y2="4"/><line x1="36" y1="16" x2="48" y2="4"/></svg>`,
]

export function renderHobbies(hobbies) {
  $('.s-hobbies .hobby-heading').textContent = hobbies.heading
  $('.s-hobbies .hobby-grid').innerHTML = hobbies.items
    .map(
      (h, i) => `
      <div class="hobby">
        <div class="hobby-media frame"><img src="${h.image}" alt="${h.title}" loading="lazy" /></div>
        <div class="hobby-head">${GLYPHS[i] || ''}<h3 class="t-h3">${h.title}</h3></div>
        <p>${h.description}</p>
      </div>`
    )
    .join('')
}

export function renderFooter(footer) {
  $('.s-footer .footer-heading').textContent = footer.heading
  const email = $('.s-footer .footer-email')
  email.href = `mailto:${footer.email}`
  $('.s-footer .footer-email .email-text').textContent = footer.email
  $('.s-footer .footer-socials').innerHTML = footer.socials
    .map((s) => `<a class="t-label" href="${s.url}" target="_blank" rel="noreferrer">${s.label}</a>`)
    .join('')
  $('.s-footer .rights-text').textContent = footer.rights
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

  // motion works — the stop-scroller: section pins, the reel of work scrubs sideways
  const cloud = $('.s-motion .cloud')
  if (cloud && heavy && window.innerWidth >= 1080) {
    const section = $('.s-motion')
    const distance = () => {
      const pad = parseFloat(getComputedStyle(section).paddingLeft) || 0
      return Math.max(0, cloud.scrollWidth - (section.clientWidth - pad * 2))
    }
    gsap.to(cloud, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => '+=' + distance(),
        pin: true,
        scrub: 0.5,
        invalidateOnRefresh: true,
      },
    })
  } else if (cloud) {
    gsap.utils.toArray('.s-motion .work-card').forEach((card, i) => {
      gsap.set(card, { y: 60, autoAlpha: 0 })
      gsap.to(card, {
        y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out', delay: (i % 2) * 0.08,
        scrollTrigger: { trigger: card, start: 'top 90%', once: true },
      })
    })
  }

  // autoplay loops only while on screen
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        const v = en.target
        if (en.isIntersecting) v.play().catch(() => {})
        else v.pause()
      }),
    { rootMargin: '10% 0px' }
  )
  document.querySelectorAll('.s-motion video').forEach((v) => io.observe(v))

  // brand entries — image wipes in from the notes' side, details rise beside it
  document.querySelectorAll('.s-brand .brand-entry').forEach((entry, i) => {
    const img = entry.querySelector('img')
    const side = i % 2 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)'
    gsap.set(img, { clipPath: side })
    gsap.to(img, {
      clipPath: 'inset(0 0% 0 0%)', duration: 1, ease: 'power3.inOut',
      scrollTrigger: { trigger: entry, start: 'top 78%', once: true },
    })
    const notes = gsap.utils.toArray(entry.querySelectorAll('.brand-notes > *'))
    gsap.set(notes, { autoAlpha: 0, y: 24 })
    gsap.to(notes, {
      autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.07, delay: 0.25,
      scrollTrigger: { trigger: entry, start: 'top 78%', once: true },
    })
  })

  // web index rows rise in sequence
  const rows = gsap.utils.toArray('.s-web .index-row')
  gsap.set(rows, { autoAlpha: 0, y: 32 })
  ScrollTrigger.batch(rows, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08 }),
  })

  // case studies — stats count up, rules extend proportional to value
  document.querySelectorAll('.s-case .case-entry').forEach((entry) => {
    const nums = entry.querySelectorAll('[data-count]')
    const rules = entry.querySelectorAll('.stat-rule')
    const maxVal = Math.max(...[...rules].map((r) => +r.dataset.ratio))
    rules.forEach((r) => gsap.set(r, { scaleX: 0 }))
    ScrollTrigger.create({
      trigger: entry,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        nums.forEach((n) => {
          const target = +n.dataset.count
          gsap.fromTo(
            n,
            { innerText: 0 },
            { innerText: target, duration: 0.9, ease: 'power1.out', snap: { innerText: 1 } }
          )
        })
        rules.forEach((r) =>
          gsap.to(r, {
            scaleX: +r.dataset.ratio / maxVal,
            duration: 0.9,
            ease: 'power2.inOut',
          })
        )
      },
    })
    riseOnEnter([entry.querySelector('.case-body')], { trigger: entry, start: 'top 80%' })
    const img = entry.querySelector('.case-media img')
    gsap.set(img, { clipPath: 'inset(0 0 100% 0)' })
    gsap.to(img, {
      clipPath: 'inset(0 0 0% 0)', duration: 1, ease: 'power3.inOut',
      scrollTrigger: { trigger: entry, start: 'top 80%', once: true },
    })
  })

  // how i think — the four moves reveal as the section scrolls through, the track
  // drawing beneath them. Scrub-based, NOT pinned: state follows scroll position at
  // all times, so it can never freeze on top of a neighbouring section.
  const think = $('.s-think')
  if (think) {
    const wordEls = gsap.utils.toArray('.think-word', think)
    const fill = $('.track-fill', think)
    const stations = gsap.utils.toArray('.station', think)

    const show = (idx) => {
      wordEls.forEach((w, i) => gsap.set(w, { autoAlpha: i === idx ? 1 : 0 }))
      stations.forEach((s, i) => s.classList.toggle('active', i <= idx))
    }

    if (!motionOK) {
      gsap.set(fill, { scaleX: 1 })
      show(wordEls.length - 1)
    } else {
      gsap.set(fill, { scaleX: 0 })
      show(0)
      ScrollTrigger.create({
        trigger: think,
        start: 'top 80%',
        end: 'bottom 55%',
        scrub: 0.6,
        onUpdate(self) {
          const p = self.progress
          gsap.set(fill, { scaleX: p })
          show(Math.min(wordEls.length - 1, Math.floor(p * wordEls.length)))
        },
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

  // hobbies — photos wipe up, pictograms draw beside the titles
  document.querySelectorAll('.s-hobbies .hobby').forEach((hobby, i) => {
    const img = hobby.querySelector('.hobby-media img')
    if (img) {
      gsap.set(img, { clipPath: 'inset(100% 0 0 0)' })
      gsap.to(img, {
        clipPath: 'inset(0% 0 0 0)', duration: 0.9, ease: 'power3.inOut', delay: i * 0.12,
        scrollTrigger: { trigger: '.s-hobbies', start: 'top 78%', once: true },
      })
    }
    const strokes = hobby.querySelectorAll('.glyph path, .glyph circle, .glyph line')
    strokes.forEach((s) => {
      const len = s.getTotalLength ? s.getTotalLength() : 100
      s.style.strokeDasharray = len
      s.style.strokeDashoffset = len
    })
    gsap.to(strokes, {
      strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut', stagger: 0.1, delay: 0.3 + i * 0.12,
      scrollTrigger: { trigger: '.s-hobbies', start: 'top 78%', once: true },
    })
  })

  // footer — the closing statement rises, the email underline draws
  const footHeading = $('.s-footer .footer-heading')
  if (footHeading) {
    const split = SplitText.create(footHeading, { type: 'lines', mask: 'lines' })
    riseOnEnter(split.lines, { trigger: '.s-footer', start: 'top 75%' })
  }
  const emailRule = $('.s-footer .email-rule')
  if (emailRule) drawRuleOnEnter(emailRule, { trigger: '.s-footer .footer-email', start: 'top 90%' })

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
