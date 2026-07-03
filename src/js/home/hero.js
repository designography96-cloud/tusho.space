// Hero — pinned scene. Statement one rises, the spine's rule draws beneath;
// scrubbing inks the words (karaoke snap), strikes statement one through,
// and rises statement two. Mobile / low tier: entrance only, both statements stacked.
import { gsap, ScrollTrigger, SplitText } from '../core/scroll.js'
import { motionOK, heavy } from '../core/env.js'

function wrapWords(el) {
  const words = el.textContent.trim().split(/\s+/)
  el.innerHTML = words.map((w) => `<span class="kw">${w}</span>`).join(' ')
  return [...el.querySelectorAll('.kw')]
}

export function initHero(afterPreloader) {
  const hero = document.querySelector('.s-hero')
  if (!hero) return

  const st1 = hero.querySelector('[data-statement="1"]')
  const st2 = hero.querySelector('[data-statement="2"]')
  const note = hero.querySelector('.hero-note')
  const hint = hero.querySelector('.hero-scroll-hint')

  const words1 = wrapWords(st1)
  const words2 = wrapWords(st2)
  // statement one lands confident — fully inked; the karaoke proof runs on statement two
  words1.forEach((w) => w.classList.add('inked'))

  if (!motionOK) {
    words1.forEach((w) => w.classList.add('inked'))
    st2.querySelectorAll('.kw').forEach((w) => w.classList.add('inked'))
    return
  }

  // ——— entrance (runs after the preloader resolves) ———
  const split1 = SplitText.create(st1, { type: 'lines', mask: 'lines' })
  gsap.set(split1.lines, { yPercent: 110 })
  gsap.set([note, hint], { autoAlpha: 0, y: 24 })

  afterPreloader.then(() => {
    gsap
      .timeline()
      .to(split1.lines, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08 })
      .to(note, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
      .to(hint, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.5')
  })

  if (!heavy) {
    // no pin: show statement two statically below, fully inked
    hero.querySelector('.hero-statements').style.display = 'block'
    st2.querySelectorAll('.kw').forEach((w) => w.classList.add('inked'))
    words1.forEach((w) => w.classList.add('inked'))
    return
  }

  // ——— pinned scrub scene ———
  const split2 = SplitText.create(st2, { type: 'lines', mask: 'lines' })
  gsap.set(split2.lines, { yPercent: 110 })

  const strike = document.createElement('span')
  strike.className = 'rule rule--stroke hero-strike'
  strike.style.cssText =
    'position:absolute;left:0;top:52%;width:100%;transform:scaleX(0);pointer-events:none;'
  st1.style.position = 'relative'
  st1.appendChild(strike)

  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: '+=160%',
    pin: true,
    scrub: 0.5,
    onUpdate(self) {
      const p = self.progress
      // phase 1 (.15 → .35): the pen strikes statement one through
      gsap.set(strike, {
        scaleX: gsap.utils.clamp(0, 1, (p - 0.15) / 0.2),
        transformOrigin: 'left center',
      })
      // phase 2 (.35 → .55): statement one rises out
      const out = gsap.utils.clamp(0, 1, (p - 0.35) / 0.2)
      gsap.set(split1.lines, { yPercent: -110 * out })
      gsap.set(strike, { autoAlpha: out < 1 ? 1 : 0 })
      // phase 3 (.45 → .7): statement two rises in, muted
      const inn = gsap.utils.clamp(0, 1, (p - 0.45) / 0.25)
      gsap.set(split2.lines, { yPercent: 110 - 110 * inn })
      // phase 4 (.7 → .95): karaoke — the pen inks statement two word by word
      const inked = Math.floor(gsap.utils.clamp(0, 1, (p - 0.7) / 0.25) * words2.length)
      words2.forEach((w, i) => w.classList.toggle('inked', i < inked))
    },
  })
}
