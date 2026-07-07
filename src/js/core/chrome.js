// Shared site chrome: header, spine progress rule, page-transition wipe.
import { gsap, ScrollTrigger } from './scroll.js'
import { motionOK } from './env.js'
import { wordmark } from './mark.js'
// object3d.js (the 3D sculpture) is kept in the codebase but not wired in —
// swapped for the gradient field below. Re-import { initObject } and swap the
// call in injectChrome() to bring the sculpture back.
import { initGradientBackground } from './gradient-bg.js'
import { initFeedback } from './feedback.js'

const NAV_LEFT = [
  { href: 'motion.html', label: 'Motion', page: 'motion' },
  { href: 'brand.html', label: 'Brand', page: 'brand' },
]
const NAV_RIGHT = [
  { href: 'web.html', label: 'Web', page: 'web' },
  { href: 'about.html', label: 'About', page: 'about' },
]

const navHTML = (items, page) =>
  items
    .map(
      (n) => `<a href="${n.href}" ${page === n.page ? 'aria-current="page"' : ''}>${n.label}</a>`
    )
    .join('')

export function injectChrome() {
  const page = document.body.dataset.page || 'home'

  const header = document.createElement('header')
  header.className = 'site-header'
  header.dataset.fbname = 'Header'
  header.innerHTML = `
    <nav class="site-nav site-nav--left t-label" aria-label="Work">${navHTML(NAV_LEFT, page)}</nav>
    <span class="brand-mark">
      <a class="brand-home" href="./" aria-label="Tusho — home">${wordmark}</a>
    </span>
    <nav class="site-nav site-nav--right t-label" aria-label="Pages">${navHTML(NAV_RIGHT, page)}</nav>`
  document.body.prepend(header)

  if (page === 'home') initGradientBackground()
  initFeedback()

  // right-edge scroll indicator: the home page gets the segmented section
  // timeline (Luke pattern) — one segment per section, a moving label naming
  // the current section, and a page-percent counter on the left. Inner pages
  // keep the simple drawn spine line.
  if (page === 'home' && motionOK) {
    initSectionTimeline()
  } else {
    const progress = document.createElement('div')
    progress.className = 'spine-progress'
    progress.setAttribute('aria-hidden', 'true')
    document.body.appendChild(progress)
    if (motionOK) {
      gsap.to(progress, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.5 },
      })
    } else {
      progress.style.display = 'none'
    }
  }

  // page transition wipe
  const wipe = document.createElement('div')
  wipe.className = 'page-wipe'
  wipe.setAttribute('aria-hidden', 'true')
  document.body.appendChild(wipe)

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]')
    if (!a || a.target || a.hasAttribute('download')) return
    const url = new URL(a.href, location.href)
    if (url.origin !== location.origin) return
    if (url.pathname === location.pathname && url.hash) return
    e.preventDefault()
    if (!motionOK) {
      location.href = url.href
      return
    }
    gsap.set(wipe, { transformOrigin: 'bottom center' })
    gsap.to(wipe, {
      scaleY: 1,
      duration: 0.45,
      ease: 'power3.inOut',
      onComplete: () => (location.href = url.href),
    })
  })

  // wipe out on arrival (also covers bfcache restores)
  window.addEventListener('pageshow', () => {
    if (!motionOK) return
    gsap.set(wipe, { transformOrigin: 'top center', scaleY: 1 })
    gsap.to(wipe, { scaleY: 0, duration: 0.5, ease: 'power3.inOut', delay: 0.05 })
  })

  return { header, wipe }
}

// ————— right-side section timeline (Luke's scroll-timeline, our sections) —————
// A fixed segmented bar on the right: one segment per section sized to its
// share of the scroll, each filling as you pass through it, with a label that
// names the current section and follows the progress down. A "(NN)" page-
// percent counter sits on the left. Both fade in only mid-scroll.
const TIMELINE_SECTIONS = [
  { sel: '.s-intro', name: 'About' },
  { sel: '.s-whatido', name: 'What I do' },
  { sel: '.s-motion', name: 'Motion' },
  { sel: '.s-brand', name: 'Brand' },
  { sel: '.s-web', name: 'Web' },
  { sel: '.s-case', name: 'Case studies' },
  { sel: '.s-think', name: 'How I think' },
  { sel: '.s-hobbies', name: 'Hobbies' },
]

function initSectionTimeline() {
  const secs = TIMELINE_SECTIONS.map((s) => ({ ...s, el: document.querySelector(s.sel) })).filter(
    (s) => s.el
  )
  if (secs.length < 2) return

  const timeline = document.createElement('div')
  timeline.className = 'scroll-timeline'
  timeline.setAttribute('aria-hidden', 'true')
  const bar = document.createElement('div')
  bar.className = 'st-bar'
  const label = document.createElement('span')
  label.className = 'st-label'
  timeline.appendChild(bar)
  timeline.appendChild(label)

  const pct = document.createElement('div')
  pct.className = 'scroll-pct'
  pct.setAttribute('aria-hidden', 'true')

  document.body.appendChild(timeline)
  document.body.appendChild(pct)

  const build = () => {
    const scrollY0 = window.scrollY
    const zoneTop = secs[0].el.getBoundingClientRect().top + scrollY0
    const lastEl = secs[secs.length - 1].el
    const zoneBottom = lastEl.getBoundingClientRect().top + lastEl.offsetHeight + scrollY0
    const zoneH = zoneBottom - zoneTop || 1

    bar.innerHTML = ''
    const segEls = []
    secs.forEach((sec) => {
      sec.ratio = sec.el.offsetHeight / zoneH
      const seg = document.createElement('div')
      seg.className = 'st-seg'
      seg.style.flex = sec.ratio.toFixed(4)
      seg.title = sec.name
      const fill = document.createElement('div')
      fill.className = 'st-seg-fill'
      seg.appendChild(fill)
      seg.addEventListener('click', () =>
        sec.el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      )
      bar.appendChild(seg)
      segEls.push(fill)
    })
    return segEls
  }

  let segEls = build()

  ScrollTrigger.create({
    trigger: secs[0].el,
    start: 'top bottom',
    endTrigger: secs[secs.length - 1].el,
    end: 'bottom bottom',
    onRefresh: () => {
      segEls = build()
    },
    onUpdate(self) {
      const progress = self.progress
      const docH = document.documentElement.scrollHeight - window.innerHeight
      const pageP = docH > 0 ? Math.round((window.scrollY / docH) * 100) : 0
      pct.textContent = '(' + String(pageP).padStart(2, '0') + ')'

      if (progress <= 0.001 || progress >= 0.9) {
        timeline.classList.remove('visible')
        pct.classList.remove('visible')
        return
      }
      timeline.classList.add('visible')
      pct.classList.add('visible')

      let activeIdx = 0
      let cumul = 0
      for (let i = 0; i < secs.length; i++) {
        const segEnd = cumul + secs[i].ratio
        if (progress < segEnd) {
          const inner = (progress - cumul) / secs[i].ratio
          segEls[i].style.height = (Math.min(1, Math.max(0, inner)) * 100).toFixed(1) + '%'
          activeIdx = i
          for (let j = i + 1; j < secs.length; j++) segEls[j].style.height = '0%'
          break
        }
        segEls[i].style.height = '100%'
        cumul = segEnd
      }

      label.textContent = secs[activeIdx].name
      label.style.top = (progress * 100).toFixed(1) + '%'
    },
  })
}

export { ScrollTrigger }
