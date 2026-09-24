// ⌘K / Ctrl+K command palette: jump to any section or project, or run an action.

export function initPalette(root, items) {
  const input = root.querySelector('[data-pal-input]')
  const list = root.querySelector('[data-pal-list]')
  let shown = [], at = 0, lastFocus = null

  // subsequence match, rewarding hits at word starts and runs
  function score(q, text) {
    if (!q) return 1
    text = text.toLowerCase()
    let s = 0, j = 0, run = 0
    for (const ch of q) {
      const k = text.indexOf(ch, j)
      if (k < 0) return 0
      run = k === j ? run + 1 : 0
      s += 1 + run * 2 + (k === 0 || text[k - 1] === ' ' ? 3 : 0)
      j = k + 1
    }
    return s
  }

  function render() {
    const q = input.value.trim().toLowerCase()
    shown = items
      .map((it) => ({ it, s: score(q, `${it.label} ${it.group} ${it.keys || ''}`) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => (q ? b.s - a.s : 0))
      .map((x) => x.it)
    at = Math.min(at, Math.max(0, shown.length - 1))
    if (!shown.length) { list.innerHTML = '<li class="pal__empty">No matches. Try "work" or "email".</li>'; return }
    let html = '', group = ''
    shown.forEach((it, i) => {
      if (!q && it.group !== group) { group = it.group; html += `<li class="pal__group" role="presentation">${group}</li>` }
      html += `<li class="pal__item${i === at ? ' is-on' : ''}" role="option" aria-selected="${i === at}" data-i="${i}"><i>${it.icon}</i>${it.label}${it.hint ? `<small>${it.hint}</small>` : ''}</li>`
    })
    list.innerHTML = html
    list.querySelector('.is-on')?.scrollIntoView({ block: 'nearest' })
  }

  function open() {
    if (!root.hidden) return
    lastFocus = document.activeElement
    root.hidden = false
    input.value = ''; at = 0
    render()
    input.focus()
    document.documentElement.style.overflow = 'hidden'
  }
  function close() {
    if (root.hidden) return
    root.hidden = true
    document.documentElement.style.overflow = ''
    lastFocus?.focus?.({ preventScroll: true })
  }
  function pick(i) {
    const it = shown[i]
    if (!it) return
    close()
    it.run()
  }

  input.addEventListener('input', () => { at = 0; render() })
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { at = (at + 1) % shown.length; render(); e.preventDefault() }
    else if (e.key === 'ArrowUp') { at = (at - 1 + shown.length) % shown.length; render(); e.preventDefault() }
    else if (e.key === 'Enter') { pick(at); e.preventDefault() }
    else if (e.key === 'Tab') e.preventDefault()
  })
  list.addEventListener('pointermove', (e) => {
    const li = e.target.closest('[data-i]')
    if (li && +li.dataset.i !== at) { at = +li.dataset.i; render() }
  })
  list.addEventListener('click', (e) => { const li = e.target.closest('[data-i]'); if (li) pick(+li.dataset.i) })
  root.querySelectorAll('[data-pal-close]').forEach((el) => el.addEventListener('click', close))

  addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); root.hidden ? open() : close() }
    else if (e.key === 'Escape') close()
    else if (e.key === '/' && root.hidden && !e.target.closest?.('input, textarea')) { e.preventDefault(); open() }
  })
  document.querySelectorAll('[data-palette]').forEach((b) => b.addEventListener('click', open))

  return { open, close }
}
