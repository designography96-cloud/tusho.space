// Preloader — removed per feedback (felt like unnecessary friction/"buzz").
// The function is kept as a no-op so main.js/hero.js's afterPreloader
// handoff doesn't need restructuring: the hero entrance now just starts
// immediately on page load.
export function playPreloader() {
  const el = document.querySelector('.preloader')
  if (el) el.remove()
  window.dispatchEvent(new Event('tusho:reveal'))
  return Promise.resolve()
}
