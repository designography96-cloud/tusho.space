// Home entry — render everything from the API-shaped JSON while the preloader
// covers, then hand off to the choreography.
import { injectChrome } from './js/core/chrome.js'
import { api } from './js/core/data.js'
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

  // hero copy
  document.querySelector('[data-statement="1"]').textContent = sections.hero.statement_1
  document.querySelector('[data-statement="2"]').textContent = sections.hero.statement_2
  document.querySelector('.hero-note').textContent = sections.hero.note

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
