// Cover — full-bleed mouse-reactive aurora with content in the four corners
// (tagline TL, logo TR, socials BL, actions BR). No logo morph, no image
// sequence: on scroll the aurora fades and the page hands over to the dark
// intro section below, where the portrait sits centred and the statement
// copy sits deliberately off-balance around it.
import { gsap, ScrollTrigger } from '../core/scroll.js'
import { motionOK } from '../core/env.js'

export function initHero() {
  const cover = document.querySelector('.s-cover')
  if (!cover) return

  const corners = gsap.utils.toArray('.cover-tagline, .cover-logo, .cover-socials, .cover-actions', cover)
  const header = document.querySelector('.site-header')
  const aurora = document.querySelector('.gradient-bg')

  if (!motionOK) {
    gsap.set(header, { autoAlpha: 1 })
    return
  }

  // header hidden while the cover owns the screen; the cover has its own logo
  gsap.set(header, { autoAlpha: 0 })

  // ——— entrance: the four corners settle in, staggered ———
  gsap.set(corners, { autoAlpha: 0, y: 16 })
  gsap.to(corners, {
    autoAlpha: 1,
    y: 0,
    duration: 0.9,
    ease: 'power3.out',
    stagger: 0.08,
    delay: 0.15,
  })

  const intro = document.querySelector('.s-intro')

  // ——— the hand-off: as the cover scrolls out it recedes into soft focus
  // (blur + drift), the aurora sinks away into the same near-black the intro
  // section is built on (--aurora-black), so the seam is a clean dissolve to
  // black rather than a hard cut or a stray coloured glow ———
  ScrollTrigger.create({
    trigger: cover,
    start: 'top top',
    end: 'bottom top',
    scrub: 0.5,
    onUpdate(self) {
      const p = self.progress
      if (aurora) gsap.set(aurora, { autoAlpha: 1 - p, scale: 1 + p * 0.1 })
      // corners recede: blur out, drift up, dissolve — depth as the cover
      // leaves. Guarded at the very top so the load-in entrance owns autoAlpha.
      if (p > 0) {
        gsap.set(corners, {
          filter: `blur(${p * 9}px)`,
          autoAlpha: 1 - gsap.utils.clamp(0, 1, p * 1.5),
          y: -p * 46,
        })
      } else {
        gsap.set(corners, { filter: 'blur(0px)', y: 0 })
      }
    },
  })

  // reveal the nav header only once the cover has essentially left, so its
  // centred logo never overlaps the cover's own top-right logo mid-handoff
  ScrollTrigger.create({
    trigger: intro || cover,
    start: intro ? 'top 60%' : 'bottom top',
    onEnter: () => gsap.to(header, { autoAlpha: 1, duration: 0.5 }),
    onLeaveBack: () => gsap.to(header, { autoAlpha: 0, duration: 0.4 }),
  })

  // ——— the dark intro section: portrait reveals, statement resolves word by
  // word out of blur (Luke pattern), the sub + button rise after ———
  if (!intro) return

  const photo = intro.querySelector('.intro-photo')
  const statement = intro.querySelector('.intro-text')
  const sub = intro.querySelector('.intro-sub')
  const btn = intro.querySelector('.intro-btn')
  const btnLink = btn?.querySelector('.btn-line')

  // the statement, the sub, and the button all resolve word-by-word out of
  // blur — the same reveal, just staggered by where they sit on the page
  wrapWords(statement)
  if (sub) wrapWords(sub)
  if (btnLink) wrapWords(btnLink)
  const statementWords = gsap.utils.toArray('.word', statement)
  const laterWords = gsap.utils.toArray('.intro-sub .word, .intro-btn .word', intro)

  gsap.set(photo, { autoAlpha: 0, filter: 'blur(16px)' })

  // the statement resolves as it scrolls through the middle of the viewport
  statementWords.forEach((word) => {
    gsap.to(word, {
      opacity: 1,
      filter: 'blur(0px)',
      ease: 'none',
      scrollTrigger: { trigger: word, start: 'top 82%', end: 'top 58%', scrub: true },
    })
  })

  // the sub + button sit lower on the page (off-balance, pushed down-right) —
  // brought in a little sooner so they don't lag behind the statement
  laterWords.forEach((word) => {
    gsap.to(word, {
      opacity: 1,
      filter: 'blur(0px)',
      ease: 'none',
      scrollTrigger: { trigger: word, start: 'top 95%', end: 'top 72%', scrub: true },
    })
  })

  ScrollTrigger.create({
    trigger: intro,
    start: 'top 72%',
    once: true,
    onEnter: () => gsap.to(photo, { autoAlpha: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out' }),
  })
}

// wrap every word of an element in a <span class="word"> for per-word motion,
// preserving inline accent spans and whitespace (Luke's approach)
function wrapWords(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  const textNodes = []
  while (walker.nextNode()) textNodes.push(walker.currentNode)
  textNodes.forEach((node) => {
    const parts = node.textContent.split(/(\s+)/)
    const frag = document.createDocumentFragment()
    parts.forEach((w) => {
      if (/^\s+$/.test(w)) {
        frag.appendChild(document.createTextNode(w))
      } else if (w) {
        const span = document.createElement('span')
        span.className = 'word'
        span.textContent = w
        frag.appendChild(span)
      }
    })
    node.parentNode.replaceChild(frag, node)
  })
}
