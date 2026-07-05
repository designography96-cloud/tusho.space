// Shared site chrome: header, spine progress rule, page-transition wipe.
import { gsap, ScrollTrigger } from './scroll.js'
import { motionOK } from './env.js'
import { toggleTheme } from './theme.js'
import { wordmarkWithFill } from './mark.js'
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

// wires the O-toggle button (theme flip) — shared by the header logo and the
// hero's big logo, since both are clickable instances of the same wordmark.
export function wireOToggle(toggleEl) {
  if (!toggleEl) return
  toggleEl.addEventListener('click', (e) => {
    e.preventDefault()
    toggleTheme()
  })
}

// a one-time "← click me" hint, blinked in near the O and dismissed on its
// own — points first-time visitors at the theme toggle without lingering.
export function showClickHint(toggleEl) {
  if (!toggleEl || toggleEl.dataset.hintShown) return
  toggleEl.dataset.hintShown = '1'
  if (!motionOK) return

  const hint = document.createElement('span')
  hint.className = 'o-hint'
  hint.setAttribute('aria-hidden', 'true')
  hint.textContent = '← click me'
  toggleEl.parentElement.appendChild(hint)

  gsap.set(hint, { autoAlpha: 0, scale: 0.8 })
  gsap
    .timeline({ onComplete: () => hint.remove() })
    .to(hint, { autoAlpha: 1, scale: 1, duration: 0.25, ease: 'back.out(3)' })
    .to(hint, { autoAlpha: 0, duration: 0.3, ease: 'power1.in' }, '+=1.4')
}

export function injectChrome() {
  const page = document.body.dataset.page || 'home'

  const header = document.createElement('header')
  header.className = 'site-header'
  header.dataset.fbname = 'Header'
  header.innerHTML = `
    <nav class="site-nav site-nav--left t-label" aria-label="Work">${navHTML(NAV_LEFT, page)}</nav>
    <span class="brand-mark">
      <a class="brand-home" href="./" aria-label="Tusho — home">${wordmarkWithFill}</a>
      <button class="o-toggle" type="button" aria-label="Switch between dark and light mode"></button>
    </span>
    <nav class="site-nav site-nav--right t-label" aria-label="Pages">${navHTML(NAV_RIGHT, page)}</nav>`
  document.body.prepend(header)
  wireOToggle(header.querySelector('.o-toggle'))

  if (page === 'home') initGradientBackground()
  initFeedback()

  // spine progress — the drawn length of the page
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

export { ScrollTrigger }
