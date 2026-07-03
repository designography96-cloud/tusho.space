// Preloader — just the O and the line beneath it. The O floats above its bar
// while the site loads; when it's done, it lands once and the camera zooms
// straight through the counter. Skippable by click or scroll.
import { gsap } from '../core/scroll.js'
import { motionOK } from '../core/env.js'

// O center (134.58, 27.31) within viewBox "104 -10 58 82"
const O_ORIGIN = '52.7% 45.5%'

export function playPreloader() {
  const el = document.querySelector('.preloader')
  if (!el) return Promise.resolve()
  const mark = el.querySelector('.pre-mark')
  const o = el.querySelector('.pre-o')

  const reveal = () => window.dispatchEvent(new Event('tusho:reveal'))

  if (!motionOK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        el.remove()
        reveal()
        resolve()
      }, 400)
    })
  }

  return new Promise((resolve) => {
    const float = gsap.to(o, {
      y: -9,
      duration: 0.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })

    let done = false
    const finish = () => {
      if (done) return
      done = true
      float.kill()
      gsap
        .timeline({
          onComplete: () => {
            el.remove()
            reveal()
            resolve()
          },
        })
        .to(o, { y: 0, duration: 0.28, ease: 'power2.in' })
        .set(mark, { transformOrigin: O_ORIGIN })
        .to(mark, { scale: 26, duration: 0.85, ease: 'expo.inOut' }, 'zoom')
        .to(el, { autoAlpha: 0, duration: 0.3, ease: 'none' }, 'zoom+=0.5')
    }

    const timer = setTimeout(finish, 1600)
    const skip = () => {
      clearTimeout(timer)
      finish()
    }
    el.addEventListener('click', skip, { once: true })
    window.addEventListener('wheel', skip, { once: true, passive: true })
    window.addEventListener('touchmove', skip, { once: true, passive: true })
  })
}
