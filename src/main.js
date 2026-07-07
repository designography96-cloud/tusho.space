// Home entry — render everything from the API-shaped JSON, then hand off to
// the choreography.
import { injectChrome } from './js/core/chrome.js'
import { api } from './js/core/data.js'
import { wordmark } from './js/core/mark.js'
import { playPreloader } from './js/home/preloader.js'
import { initHero } from './js/home/hero.js'
import {
  renderWhatIDo,
  renderMotion,
  renderBrand,
  renderWeb,
  renderCases,
  renderThink,
  renderAbout,
  renderHobbies,
  renderFooter,
  initSections,
} from './js/home/sections.js'

async function boot() {
  injectChrome()
  const preloaderDone = playPreloader()

  const [sections, motion, brand, web, cases] = await Promise.all([
    api('sections'),
    api('motion'),
    api('brand'),
    api('web'),
    api('cases'),
  ])

  document.title = sections.meta.title

  // cover — the wordmark logo (top-right) + socials (bottom-left)
  document.querySelector('.cover-logo').innerHTML = wordmark
  const socials = sections.footer?.socials || []
  document.querySelector('.cover-socials').innerHTML = socials
    .map((s) => `<a href="${s.url}" target="_blank" rel="noreferrer">${s.label}</a>`)
    .join('')

  renderWhatIDo(sections.what_i_do)
  renderMotion(motion)
  renderBrand(brand)
  renderWeb(web)
  renderCases(cases)
  renderThink(sections.how_i_think)
  renderAbout(sections.about_short)
  renderHobbies(sections.hobbies)
  renderFooter(sections.footer)

  initHero(preloaderDone)
  initSections()
}

boot()
