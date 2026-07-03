// Sub-pages entry — dispatches on <body data-page>.
import { injectChrome } from './js/core/chrome.js'
import { api } from './js/core/data.js'
import { gsap, ScrollTrigger, SplitText } from './js/core/scroll.js'
import { motionOK } from './js/core/env.js'
import { riseOnEnter, drawRuleOnEnter } from './js/core/draw.js'

const $ = (sel, root = document) => root.querySelector(sel)
const params = new URLSearchParams(location.search)

const TYPE_META = {
  motion: { api: 'motion', label: 'Motion works', intro: 'Brand films, idents and dynamic stories. Placeholder reels for now.' },
  brand: { api: 'brand', label: 'Brand design', intro: 'Identities and guidelines built to hold. Placeholder images for now.' },
  web: { api: 'web', label: 'Website projects', intro: 'Directed and built, from brief to deploy.' },
}

function pageEnter() {
  if (!motionOK) return
  const title = $('.page-title')
  if (title) {
    const split = SplitText.create(title, { type: 'lines', mask: 'lines' })
    gsap.set(split.lines, { yPercent: 110 })
    gsap.to(split.lines, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08, delay: 0.2 })
  }
  document.querySelectorAll('.page-hero .rule').forEach((r) => drawRuleOnEnter(r, { start: 'top 100%' }))
}

function cardHTML(item, type) {
  const media = item.video
    ? `<video muted loop playsinline preload="metadata" poster="${item.cover}" src="${item.video}"></video>`
    : `<img src="${item.cover}" alt="${item.title}" loading="lazy" />`
  return `
    <a class="work-card" href="/work.html?type=${type}&slug=${item.slug}">
      <div class="frame frame--natural">${media}</div>
      <div class="card-meta">
        <span class="card-title t-h3">${item.title}</span>
        <span class="t-label">${item.client || ''} ${item.year ? '· ' + item.year : ''}</span>
      </div>
    </a>`
}

async function initListing(type) {
  const meta = TYPE_META[type]
  const items = await api(meta.api)
  $('.page-title').textContent = meta.label
  $('.page-intro').textContent = meta.intro
  document.title = `${meta.label} — Tusho`

  if (type === 'web') {
    $('.listing-mount').innerHTML = `<div class="listing-rows">${items
      .filter((it) => it.status !== 'soon')
      .map(
        (it) => `<div class="index-row">
          <a href="/work.html?type=web&slug=${it.slug}"><span class="row-title">${it.title}</span></a>
          <span class="row-meta t-label">${it.stack} · ${it.year}</span>
          ${
            it.url && it.url !== '#'
              ? `<a class="row-live t-label" href="${it.url}" target="_blank" rel="noreferrer">Live ↗</a>`
              : `<span class="row-live t-label muted">Link soon</span>`
          }
        </div>`
      )
      .join('')}</div>`
  } else {
    $('.listing-mount').innerHTML = `<div class="listing-grid">${items
      .map((it) => cardHTML(it, type))
      .join('')}</div>`
  }
  pageEnter()
  if (motionOK) {
    const cards = gsap.utils.toArray('.work-card, .index-row')
    gsap.set(cards, { autoAlpha: 0, y: 40 })
    ScrollTrigger.batch(cards, {
      start: 'top 92%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06 }),
    })
  }
  document.querySelectorAll('video').forEach((v) => v.play().catch(() => {}))
}

async function initWork() {
  const type = params.get('type') || 'motion'
  const slug = params.get('slug')
  const items = await api(TYPE_META[type].api)
  const item = items.find((i) => i.slug === slug) || items[0]
  document.title = `${item.title} — Tusho`

  $('.page-eyebrow').textContent = `${TYPE_META[type].label}${item.client ? ' · ' + item.client : ''}${item.year ? ' · ' + item.year : ''}`
  $('.page-title').textContent = item.title

  const media = item.video
    ? `<video muted loop autoplay playsinline poster="${item.cover}" src="${item.video}"></video>`
    : item.cover
      ? `<img src="${item.cover}" alt="${item.title}" />`
      : ''
  $('.detail-cover').innerHTML = media ? `<div class="frame">${media}</div>` : ''

  $('.detail-meta').innerHTML = [
    ['Client', item.client || '—'],
    ['Year', item.year || '—'],
    [item.tags ? 'Scope' : 'Stack', item.tags ? item.tags.join(', ') : item.stack || '—'],
    ['Status', item.status === 'live' && item.url && item.url !== '#' ? `<a href="${item.url}" target="_blank" rel="noreferrer">Visit live ↗</a>` : 'Placeholder'],
  ]
    .map(([k, v]) => `<div class="meta-item"><span class="t-label">${k}</span><span>${v}</span></div>`)
    .join('')

  $('.prose').innerHTML = [item.summary, ...(item.body || [])].filter(Boolean).map((p) => `<p>${p}</p>`).join('')

  if (item.images?.length) {
    $('.detail-gallery').innerHTML = item.images
      .map((src) => `<div class="frame"><img src="${src}" alt="" loading="lazy" /></div>`)
      .join('')
  }

  const next = items[(items.indexOf(item) + 1) % items.length]
  $('.next-link').href = `/work.html?type=${type}&slug=${next.slug}`
  $('.next-link .next-title').textContent = next.title

  pageEnter()
}

async function initCase() {
  const slug = params.get('slug')
  const items = await api('cases')
  const cs = items.find((i) => i.slug === slug) || items[0]
  document.title = `${cs.title} — Tusho`

  $('.page-eyebrow').textContent = `Case study · ${cs.role} · ${cs.year}`
  $('.page-title').textContent = cs.title
  $('.detail-cover').innerHTML = `<div class="frame"><img src="${cs.cover}" alt="${cs.title}" /></div>`
  $('.case-stats-band').innerHTML = cs.stats
    .map(
      (s) => `<div class="stat">
        <span class="t-stat">${s.value}${s.suffix}</span>
        <span class="t-label">${s.label}</span>
      </div>`
    )
    .join('')
  $('.prose').innerHTML = [cs.summary, ...(cs.body || [])].map((p) => `<p>${p}</p>`).join('')

  const next = items[(items.indexOf(cs) + 1) % items.length]
  $('.next-link').href = `/case-study.html?slug=${next.slug}`
  $('.next-link .next-title').textContent = next.title

  pageEnter()
}

async function initAbout() {
  const about = await api('about')
  document.title = 'About — Tusho'
  $('.page-title').textContent = about.heading
  $('.about-portrait .frame').innerHTML = `<img src="${about.photo}" alt="Portrait of Tusho" />`
  $('.prose').innerHTML = [about.intro, ...about.body].map((p) => `<p>${p}</p>`).join('')
  $('.values-grid').innerHTML = about.values
    .map((v) => `<div><h3 class="t-h3">${v.title}</h3><p>${v.description}</p></div>`)
    .join('')
  pageEnter()
  if (motionOK) riseOnEnter(gsap.utils.toArray('.values-grid > div'), { trigger: '.values-grid', stagger: 0.08 })
}

async function boot() {
  injectChrome()
  const page = document.body.dataset.page
  if (page === 'motion' || page === 'brand' || page === 'web') await initListing(page)
  else if (page === 'work') await initWork()
  else if (page === 'case') await initCase()
  else if (page === 'about') await initAbout()
}

boot()
