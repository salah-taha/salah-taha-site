import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initField } from './field.js'
import { initArt } from './art.js'
import { initTerm, uptime } from './term.js'
import { initPalette } from './palette.js'

gsap.registerPlugin(ScrollTrigger)

const $ = (s, el = document) => el.querySelector(s)
const $$ = (s, el = document) => [...el.querySelectorAll(s)]
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
const fine = matchMedia('(pointer: fine)').matches
const EMAIL = 'contact@salah-taha.com'

const go = (hash) => {
  const el = hash === '#top' ? document.body : $(hash)
  el?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  history.replaceState(null, '', hash === '#top' ? location.pathname : hash)
}

function toggleTheme(want) {
  const cur = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
  const next = want === 'light' || want === 'dark' ? want : cur === 'light' ? 'dark' : 'light'
  document.documentElement.dataset.theme = next
  $('meta[name="theme-color"]').content = next === 'light' ? '#f6f5f2' : '#09090b'
  try { localStorage.setItem('theme', next) } catch {}
  return next
}
$('.theme').addEventListener('click', () => toggleTheme())
if (document.documentElement.dataset.theme === 'light') $('meta[name="theme-color"]').content = '#f6f5f2'

let toastT
function toast(msg) {
  $('.toast')?.remove()
  const t = document.createElement('div')
  t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg
  document.body.appendChild(t)
  clearTimeout(toastT); toastT = setTimeout(() => t.remove(), 1800)
}
async function copyEmail() {
  try { await navigator.clipboard.writeText(EMAIL); toast('email copied ✓') } catch { toast(EMAIL) }
}

// ---------- live details ----------
$('[data-year]').textContent = new Date().getFullYear()
function tick() {
  const t = new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit' })
  $$('[data-clock]').forEach((el) => { el.textContent = t })
  $('[data-uptime]').textContent = uptime()
}
tick(); setInterval(tick, 15000)
$$('[data-mod]').forEach((k) => { if (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) k.textContent = '⌘' })

initField($('.field'))
initArt()
const term = initTerm($('[data-term]'), { go, toggleTheme })

// ---------- command palette ----------
const PROJECTS = $$('.card').map((c) => ({ id: '#' + c.id, name: $('h3', c).childNodes[0].textContent.trim(), meta: $('.card__meta', c).lastChild.textContent.trim() }))
const ext = (u) => () => window.open(u, '_blank', 'noopener')
initPalette($('[data-pal]'), [
  ...[['Home', '#top', '~'], ['About', '#about', '01'], ['Work', '#work', '02'], ['Experience', '#experience', '03'], ['Stack', '#stack', '04'], ['Contact', '#contact', '05']]
    .map(([label, id, hint]) => ({ group: 'Go to', icon: '#', label, hint, run: () => go(id) })),
  ...PROJECTS.map((p) => ({ group: 'Projects', icon: '◆', label: p.name, hint: p.meta, run: () => go(p.id) })),
  { group: 'Actions', icon: '@', label: 'Copy email address', hint: EMAIL, keys: 'mail contact', run: copyEmail },
  { group: 'Actions', icon: '✉', label: 'Write me an email', keys: 'mail contact hire', run: () => { location.href = 'mailto:' + EMAIL } },
  { group: 'Actions', icon: '◐', label: 'Toggle light / dark theme', keys: 'theme dark light mode', run: () => toggleTheme() },
  { group: 'Actions', icon: '$', label: 'Open the terminal', keys: 'shell cli console', run: () => { go('#top'); setTimeout(() => term.focus(), 500) } },
  { group: 'Links', icon: '↗', label: 'LinkedIn', hint: 'in/salah-taha', run: ext('https://www.linkedin.com/in/salah-taha/') },
  { group: 'Links', icon: '↗', label: 'GitHub', hint: 'salah-taha', run: ext('https://github.com/salah-taha') },
  { group: 'Links', icon: '↗', label: 'mqtt_server on pub.dev', run: ext('https://pub.dev/packages/mqtt_server') },
  { group: 'Links', icon: '↗', label: 'batalfit.com', run: ext('https://batalfit.com') },
])

// ---------- top bar + section spy ----------
const bar = $('.bar')
const onScroll = () => bar.classList.toggle('is-stuck', scrollY > 20)
addEventListener('scroll', onScroll, { passive: true }); onScroll()

const spyLinks = $$('.dock a, .bar__nav a')
const mark = (id) => spyLinks.forEach((a) => a.classList.toggle('is-on', a.getAttribute('href') === '#' + id))
const spyIds = new Map([[$('.hero'), 'top'], [$('#stats'), 'top'], [$('#about'), 'top'], [$('#work'), 'work'], [$('#experience'), 'experience'], [$('#stack'), 'stack'], [$('#contact'), 'contact']])
const spy = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) mark(spyIds.get(e.target))
}, { rootMargin: '-45% 0px -50% 0px' })
spyIds.forEach((_, el) => spy.observe(el))
// the contact block is short, so it may never reach the middle band
addEventListener('scroll', () => { if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) mark('contact') }, { passive: true })

// ---------- stack filter ----------
const stack = $('.stack')
$$('[data-filter]').forEach((btn) => btn.addEventListener('click', () => {
  $$('[data-filter]').forEach((b) => { b.classList.toggle('is-on', b === btn); b.setAttribute('aria-pressed', b === btn) })
  const key = btn.dataset.filter
  stack.classList.toggle('is-filtered', key !== 'all')
  $$('dd span', stack).forEach((s) => s.classList.toggle('is-hit', (s.dataset.in || '').split(' ').includes(key)))
}))

$$('[data-copy]').forEach((btn) => btn.addEventListener('click', copyEmail))

// ---------- cards: a light that follows the pointer ----------
if (fine) {
  $$('.card').forEach((card) => card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect()
    card.style.setProperty('--mx', `${e.clientX - r.left}px`)
    card.style.setProperty('--my', `${e.clientY - r.top}px`)
  }))
}

// ---------- motion ----------
if (!reduced) {
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from('.pill', { opacity: 0, y: 12, duration: 0.8 })
    .from('.hero__title > span', { opacity: 0, yPercent: 40, duration: 1.1, stagger: 0.08 }, '-=0.6')
    .from(['.hero__sub', '.hero__cta'], { opacity: 0, y: 16, duration: 0.9, stagger: 0.08 }, '-=0.8')
    .from('.term', { opacity: 0, y: 30, scale: 0.97, duration: 1.2 }, '-=1')
    .from('.bar', { opacity: 0, y: -10, duration: 0.8 }, '-=1.1')

  // reveals: short fade-ups, so nothing stays hidden for long
  $$('.stats, .label, .lede, .about__text, .about__grid > *, .card, .commit, .filters, .stack > div, .contact__box').forEach((el) => {
    gsap.from(el, { y: 32, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } })
  })

  $$('[data-count]').forEach((el) => {
    const o = { v: 0 }, end = +el.dataset.count
    const fmt = () => { el.textContent = (el.dataset.prefix || '') + Math.round(o.v) + (el.dataset.suffix || '') }
    gsap.to(o, { v: end, duration: 1.6, ease: 'power3.out', onUpdate: fmt, scrollTrigger: { trigger: el, start: 'top 94%', once: true } })
  })

  gsap.to('.log__rail i', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.log', start: 'top 65%', end: 'bottom 65%', scrub: true } })

  // Batal phones fan out as the card comes in
  const phones = { trigger: '.card__vis--phones', start: 'top 85%', end: 'top 35%', scrub: 0.6 }
  gsap.from('.phone--l', { xPercent: 45, rotate: 0, scrollTrigger: phones })
  gsap.from('.phone--r', { xPercent: -45, rotate: 0, scrollTrigger: phones })
  gsap.from('.browser', { y: 30, scale: 0.94, scrollTrigger: phones })

  // the terminal leans back a touch as you scroll past it
  if (fine) gsap.to('.term', { y: -40, rotateX: 6, transformPerspective: 1200, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
}
