// Shared site chrome: header, spine progress rule, page-transition wipe.
import { gsap, ScrollTrigger } from './scroll.js'
import { motionOK } from './env.js'
import { toggleTheme } from './theme.js'
import { wordmark } from './mark.js'
import { initObject } from './object3d.js'
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

  // day/night state lives inside the O of the logo
  const markWithFill = wordmark.replace(
    '</svg>',
    '<circle class="o-fill" cx="134.58" cy="27.31" r="0"/></svg>'
  )

  const header = document.createElement('header')
  header.className = 'site-header'
  header.innerHTML = `
    <nav class="site-nav site-nav--left t-label" aria-label="Work">${navHTML(NAV_LEFT, page)}</nav>
    <span class="brand-mark">
      <a class="brand-home" href="./" aria-label="Tusho — home">${markWithFill}</a>
      <button class="o-toggle" type="button" aria-label="Switch between dark and light mode"></button>
    </span>
    <nav class="site-nav site-nav--right t-label" aria-label="Pages">${navHTML(NAV_RIGHT, page)}</nav>`
  document.body.prepend(header)
  header.querySelector('.o-toggle').addEventListener('click', (e) => {
    e.preventDefault()
    toggleTheme()
  })

  if (page === 'home') initObject()
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
