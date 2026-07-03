// Pen-speed line drawing: ~600px/s, floor 150ms, cap 1.2s. Lines never fade.
import { gsap, ScrollTrigger } from './scroll.js'
import { motionOK } from './env.js'

export function penDuration(px) {
  return gsap.utils.clamp(0.15, 1.2, px / 600)
}

// Draw a horizontal rule when it enters the viewport (scaleX 0 → 1).
export function drawRuleOnEnter(el, opts = {}) {
  if (!motionOK) return
  gsap.set(el, { scaleX: 0 })
  gsap.to(el, {
    scaleX: 1,
    duration: penDuration(el.offsetWidth || window.innerWidth * 0.5),
    ease: 'power2.inOut',
    scrollTrigger: {
      trigger: opts.trigger || el,
      start: opts.start || 'top 85%',
      once: true,
    },
    delay: opts.delay || 0,
  })
}

// Rise a set of elements out of their masks (SplitText lines or plain blocks).
export function riseOnEnter(targets, opts = {}) {
  if (!motionOK) return
  gsap.set(targets, { yPercent: 110 })
  gsap.to(targets, {
    yPercent: 0,
    duration: opts.duration || 0.9,
    ease: 'expo.out',
    stagger: opts.stagger ?? 0.06,
    scrollTrigger: {
      trigger: opts.trigger || targets[0] || targets,
      start: opts.start || 'top 85%',
      once: true,
    },
    delay: opts.delay || 0,
  })
}

export { gsap, ScrollTrigger }
