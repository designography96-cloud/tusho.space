// Phase 1: placeholder JSON shaped exactly like the future PHP API.
// Phase 2 swap: change ENDPOINTS values to /api/*.php — nothing else changes.
const ENDPOINTS = {
  sections: '/data/section-texts.json',
  motion: '/data/motion-works.json',
  brand: '/data/brand-works.json',
  web: '/data/web-projects.json',
  cases: '/data/case-studies.json',
  about: '/data/about.json',
}

const cache = new Map()

export async function api(name) {
  if (cache.has(name)) return cache.get(name)
  const res = await fetch(ENDPOINTS[name])
  if (!res.ok) throw new Error(`API ${name} failed: ${res.status}`)
  const json = await res.json()
  cache.set(name, json.data)
  return json.data
}
