// Feedback mode — press F to open. Click any section to tag it, type your notes,
// then "Copy prompt" to get a ready-to-paste brief (tagged sections + your text).
// A private authoring aid for the owner; leaves no trace in the page output.

const PAGE_LABEL = {
  home: 'home page',
  motion: 'Motion index',
  brand: 'Brand index',
  web: 'Web index',
  work: 'project detail page',
  case: 'case study page',
  about: 'About page',
}

function sectionName(el) {
  if (el.dataset.fbname) return el.dataset.fbname
  const h = el.querySelector('.t-h2, .t-display, .page-title, .footer-heading, h1, h2, h3')
  if (h && h.textContent.trim()) return h.textContent.trim().split('\n')[0].slice(0, 40)
  return el.className.split(' ')[0] || 'section'
}

export function initFeedback() {
  const targets = () => [...document.querySelectorAll('main section, main > *[class^="s-"], footer')]

  let open = false
  let selected = null // { el, name } — exactly one section at a time

  // ——— UI ———
  const hi = document.createElement('div')
  hi.className = 'fb-highlight'
  hi.setAttribute('aria-hidden', 'true')

  const hint = document.createElement('div')
  hint.className = 'fb-cue'
  hint.textContent = 'Click a section to give feedback · Esc to cancel'

  const panel = document.createElement('div')
  panel.className = 'fb-panel'
  panel.setAttribute('data-lenis-prevent', '') // let the textarea scroll natively
  panel.innerHTML = `
    <div class="fb-head">
      <span class="fb-title">Feedback</span>
      <button class="fb-x" type="button" aria-label="Close">esc</button>
    </div>
    <p class="fb-hint">Click one section to tag it — one at a time.</p>
    <div class="fb-chips"></div>
    <textarea class="fb-text" rows="5" placeholder="Describe the change or idea…"></textarea>
    <div class="fb-actions">
      <button class="fb-copy" type="button">Copy prompt</button>
      <button class="fb-clear" type="button">Clear</button>
    </div>`

  const chipsEl = panel.querySelector('.fb-chips')
  const textEl = panel.querySelector('.fb-text')
  const copyBtn = panel.querySelector('.fb-copy')

  function clearSelection() {
    if (selected) selected.el.classList.remove('fb-picked')
    selected = null
  }

  function renderChips() {
    if (!selected) {
      chipsEl.innerHTML = '<span class="fb-empty">No section tagged — whole-page note.</span>'
      return
    }
    chipsEl.innerHTML = ''
    const chip = document.createElement('button')
    chip.type = 'button'
    chip.className = 'fb-chip'
    chip.innerHTML = `${selected.name}<span class="fb-chip-x">×</span>`
    chip.addEventListener('click', () => {
      clearSelection()
      renderChips()
    })
    chipsEl.appendChild(chip)
  }

  function buildPrompt() {
    const page = PAGE_LABEL[document.body.dataset.page] || document.title
    const mode =
      document.documentElement.dataset.theme === 'light'
        ? 'Day (light) mode'
        : 'Night (dark) mode'
    const lines = [
      'Feedback for tusho.space',
      `Page: ${page}`,
      `Mode: ${mode}`,
      `Section: ${selected ? selected.name : '(whole page / general)'}`,
      '',
      textEl.value.trim() || '(describe the change)',
      '',
      'Please apply this to the site.',
    ]
    return lines.join('\n')
  }

  async function copyPrompt() {
    const text = buildPrompt()
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const t = document.createElement('textarea')
      t.value = text
      document.body.appendChild(t)
      t.select()
      document.execCommand('copy')
      t.remove()
    }
    copyBtn.textContent = 'Copied ✓'
    setTimeout(() => (copyBtn.textContent = 'Copy prompt'), 1400)
  }

  // F arms picking mode (hover-highlight + click-to-tag). The panel itself stays
  // hidden until a section is actually clicked.
  function setArmed(v) {
    open = v
    document.body.classList.toggle('fb-on', v)
    if (!panel.isConnected) document.body.append(hi, hint, panel)
    hi.style.opacity = '0'
    panel.style.display = 'none' // panel only shows via openPanel()
    if (v) {
      hint.style.display = 'block'
    } else {
      hint.style.display = 'none'
      panel.style.display = 'none'
      if (document.activeElement && panel.contains(document.activeElement)) {
        document.activeElement.blur()
      }
    }
  }

  function openPanel() {
    hint.style.display = 'none'
    panel.style.display = 'grid'
    renderChips()
    setTimeout(() => textEl.focus(), 50)
  }

  // ——— section picking ———
  function closestTarget(node) {
    const el = node.closest && node.closest('main section, main > [class^="s-"], footer')
    return el && el.closest('.fb-panel') ? null : el
  }

  document.addEventListener(
    'pointermove',
    (e) => {
      if (!open) return
      if (e.target.closest('.fb-panel')) {
        hi.style.opacity = '0'
        return
      }
      const el = closestTarget(e.target)
      if (!el) {
        hi.style.opacity = '0'
        return
      }
      const r = el.getBoundingClientRect()
      hi.style.cssText = `opacity:1;top:${r.top}px;left:${r.left}px;width:${r.width}px;height:${r.height}px`
      hi.dataset.name = sectionName(el)
    },
    { passive: true }
  )

  document.addEventListener(
    'click',
    (e) => {
      if (!open) return
      if (e.target.closest('.fb-panel')) return
      const el = closestTarget(e.target)
      if (!el) return
      e.preventDefault()
      e.stopPropagation()
      if (selected && selected.el === el) {
        clearSelection()
      } else {
        clearSelection()
        selected = { el, name: sectionName(el) }
        el.classList.add('fb-picked')
      }
      openPanel() // panel appears only once a section is clicked
    },
    true
  )

  // ——— triggers ———
  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '')
    if (e.key === 'Escape' && open) {
      setArmed(false)
      return
    }
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return
    if (e.key === 'f' || e.key === 'F') {
      e.preventDefault()
      setArmed(!open)
    }
  })

  panel.querySelector('.fb-x').addEventListener('click', () => setArmed(false))
  copyBtn.addEventListener('click', copyPrompt)
  panel.querySelector('.fb-clear').addEventListener('click', () => {
    clearSelection()
    textEl.value = ''
    renderChips()
  })
}
