// Hero — full-bleed logo intro. No title copy: the wordmark itself is the
// opening statement. On scroll, the logo shrinks and rises to land exactly in
// the header's logo slot (measured, not guessed), the header fades in behind
// it, and the nav links arrive last. Mobile / reduced motion: skip the morph,
// just reveal the header once scrolling begins.
import { gsap, ScrollTrigger } from '../core/scroll.js'
import { motionOK, heavy } from '../core/env.js'
import { showClickHint } from '../core/chrome.js'

export function initHero(afterPreloader) {
  const hero = document.querySelector('.s-hero')
  if (!hero) return

  const logo = hero.querySelector('.hero-logo')
  const tagline = hero.querySelector('.hero-tagline')
  const cue = hero.querySelector('.hero-cue')
  const header = document.querySelector('.site-header')
  const headerLogo = header.querySelector('.brand-mark')
  const navLeft = header.querySelector('.site-nav--left')
  const navRight = header.querySelector('.site-nav--right')
  let headerHintShown = false
  const revealHeaderHint = () => {
    if (headerHintShown) return
    headerHintShown = true
    showClickHint(headerLogo.querySelector('.o-toggle'))
  }

  gsap.set(header, { autoAlpha: 0 })
  gsap.set([navLeft, navRight, headerLogo], { autoAlpha: 0 })

  if (!motionOK) {
    gsap.set(header, { autoAlpha: 1 })
    gsap.set([navLeft, navRight, headerLogo], { autoAlpha: 1 })
    return
  }

  gsap.set(logo, { autoAlpha: 0, y: 20 })
  gsap.set(tagline, { autoAlpha: 0, y: 14, filter: 'blur(10px)' })
  gsap.set(cue, { autoAlpha: 0, y: 14 })

  const entrance = afterPreloader.then(
    () =>
      new Promise((resolve) => {
        gsap
          .timeline({ onComplete: resolve })
          .to(logo, { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out' })
          .to(tagline, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' }, '-=0.55')
          .to(cue, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.45')
      })
  )

  entrance.then(() => showClickHint(logo.querySelector('.o-toggle')))

  if (!heavy) {
    // no morph on mobile/low-tier: reveal the header as soon as any scroll happens
    ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: '+=10',
      onEnter: () => {
        gsap.to([header, navLeft, navRight, headerLogo], { autoAlpha: 1, duration: 0.4 })
        revealHeaderHint()
      },
      onLeaveBack: () => gsap.to([header, navLeft, navRight, headerLogo], { autoAlpha: 0, duration: 0.3 }),
    })
    return
  }

  // ——— the morph: measured against the real header logo, not guessed ———
  entrance.then(() => {
    let startRect, endRect

    function measure() {
      const wasFixed = logo.style.position === 'fixed'
      if (wasFixed) {
        gsap.set(logo, { clearProps: 'position,left,top,width,margin,x,y,scale' })
        gsap.set(tagline, { clearProps: 'position,left,top,width,margin' })
      }
      // the logo is the only other flex child besides the tagline (the cue
      // is already absolutely positioned) — freeze the tagline's rect too
      // before pulling the logo out of flow, or it re-centers into the gap
      const taglineRect = tagline.getBoundingClientRect()
      startRect = logo.getBoundingClientRect()
      endRect = headerLogo.getBoundingClientRect()
      gsap.set(tagline, {
        position: 'fixed',
        left: taglineRect.left,
        top: taglineRect.top,
        width: taglineRect.width,
        margin: 0,
      })
      gsap.set(logo, {
        position: 'fixed',
        left: startRect.left,
        top: startRect.top,
        width: startRect.width,
        margin: 0,
        zIndex: 45,
      })
    }
    measure()

    gsap.set(header, { autoAlpha: 1 })

    ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: '+=100%',
      scrub: 0.6,
      invalidateOnRefresh: true,
      onRefresh: measure,
      onUpdate(self) {
        const p = self.progress
        const startCx = startRect.left + startRect.width / 2
        const startCy = startRect.top + startRect.height / 2
        const endCx = endRect.left + endRect.width / 2
        const endCy = endRect.top + endRect.height / 2
        const scale = gsap.utils.interpolate(1, endRect.width / startRect.width, p)
        gsap.set(logo, {
          x: gsap.utils.interpolate(0, endCx - startCx, p),
          y: gsap.utils.interpolate(0, endCy - startCy, p),
          scale,
          transformOrigin: '50% 50%',
        })

        const fadeOut = 1 - gsap.utils.clamp(0, 1, p / 0.3)
        gsap.set(tagline, { autoAlpha: fadeOut, filter: `blur(${(1 - fadeOut) * 10}px)` })
        gsap.set(cue, { autoAlpha: fadeOut })

        const navP = gsap.utils.clamp(0, 1, (p - 0.55) / 0.4)
        gsap.set([navLeft, navRight], { autoAlpha: navP })

        // crossfade the flying logo for the real header logo right at the finish
        const landed = p > 0.985
        gsap.set(logo, { autoAlpha: landed ? 0 : 1 })
        gsap.set(headerLogo, { autoAlpha: landed ? 1 : 0 })
        if (landed) revealHeaderHint()
      },
    })
  })
}
