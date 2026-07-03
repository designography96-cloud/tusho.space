import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'
import { motionOK } from './env.js'

gsap.registerPlugin(ScrollTrigger, SplitText)

export let lenis = null

if (motionOK) {
  lenis = new Lenis({ smoothWheel: true, lerp: 0.1 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
  // Pins grow the page after Lenis has measured it — without this, Lenis keeps a
  // stale scroll limit and walls scrolling partway down the page.
  ScrollTrigger.addEventListener('refresh', () => lenis.resize())
  window.__lenis = lenis // dev handle for driving scroll in tests
  window.__ST = ScrollTrigger // dev handle
}

// Pause offscreen videos + tweens are handled per-section with IntersectionObserver.
export { gsap, ScrollTrigger, SplitText }
