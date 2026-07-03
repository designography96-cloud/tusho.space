// Theme is set pre-paint by the inline script in <head>; this module only toggles.
const KEY = 'tusho-theme'

export function currentTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

export function toggleTheme() {
  const next = currentTheme() === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = next
  try {
    localStorage.setItem(KEY, next)
  } catch {
    /* private mode */
  }
  window.dispatchEvent(new Event('tusho:theme'))
}
