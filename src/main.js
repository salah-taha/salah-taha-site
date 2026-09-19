import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initNet } from './net.js'
import { initArt } from './art.js'

gsap.registerPlugin(ScrollTrigger)

const $ = (s, el = document) => el.querySelector(s)
const $$ = (s, el = document) => [...el.querySelectorAll(s)]
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
const fine = matchMedia('(pointer: fine)').matches
const pad = (n) => String(n).padStart(2, '0')

// ---------- small live details ----------
$('[data-year]').textContent = new Date().getFullYear()
const clock = $('[data-clock]')
const uptime = $('[data-uptime]')
const START = new Date(2020, 0, 1)
function tick() {
  const now = new Date()
  clock.textContent = now.toLocaleTimeString('en-GB', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit' })
  let y = now.getFullYear() - START.getFullYear(), m = now.getMonth(), d = now.getDate() - 1
  uptime.textContent = `${y}y ${m}m ${d}d ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}
tick(); setInterval(tick, 1000)

$('.theme').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = next
  try { localStorage.setItem('theme', next) } catch {}
})

$$('[data-letters]').forEach((el) => {
  el.innerHTML = [...el.textContent].map((c) => `<span class="ch">${c}</span>`).join('')
})

initArt()
initNet($('.hero__net'), (hash) => $(hash)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }))

// ---------- rotating phrase in the hero ----------
const phrases = ['mobile apps', 'real-time backends', 'desktop software', 'offline-first systems', 'open-source tools']
const swap = $('[data-swap]')
if (!reduced) {
  let i = 0
  setInterval(() => {
    i = (i + 1) % phrases.length
    gsap.timeline()
      .to(swap, { yPercent: -110, duration: 0.4, ease: 'power3.in' })
      .call(() => { swap.textContent = phrases[i] })
      .fromTo(swap, { yPercent: 110 }, { yPercent: 0, duration: 0.55, ease: 'power3.out' })
  }, 2300)
}

// ---------- section spy for the top nav and the phone dock ----------
const spyLinks = $$('.dock a, .bar__nav a')
const spy = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue
    const id = e.target.id === 'about' ? 'top' : e.target.id
    spyLinks.forEach((a) => a.classList.toggle('is-on', a.getAttribute('href') === '#' + e.target.id || a.dataset.spy === id))
  }
}, { rootMargin: '-45% 0px -50% 0px' })
;['top', 'about', 'work', 'experience', 'stack', 'contact'].forEach((id) => spy.observe(document.getElementById(id)))

// ---------- stack filter: what does each product run on ----------
const stack = $('.stack')
$$('[data-filter]').forEach((btn) => btn.addEventListener('click', () => {
  $$('[data-filter]').forEach((b) => b.classList.toggle('is-on', b === btn))
  const key = btn.dataset.filter
  stack.classList.toggle('is-filtered', key !== 'all')
  $$('dd span', stack).forEach((s) => s.classList.toggle('is-hit', (s.dataset.in || '').split(' ').includes(key)))
}))

// ---------- copy email ----------
$$('[data-copy]').forEach((btn) => btn.addEventListener('click', async () => {
  const small = $('small', btn)
  try { await navigator.clipboard.writeText(btn.dataset.copy); small.textContent = 'copied ✓' } catch { small.textContent = 'press ctrl+c' }
  setTimeout(() => { small.textContent = 'tap to copy' }, 2000)
}))

// ---------- marquee: drifts, and scroll speed pushes it ----------
const mqs = $$('.mq').map((el) => {
  const track = $('.mq__track', el)
  track.innerHTML += track.innerHTML + track.innerHTML
  return { track, dir: +el.dataset.dir, x: 0 }
})
let lastY = scrollY, vel = 0
gsap.ticker.add(() => {
  vel += (scrollY - lastY - vel) * 0.2; lastY = scrollY
  for (const m of mqs) {
    const third = m.track.scrollWidth / 3
    if (!third) continue
    m.x -= m.dir * ((reduced ? 0 : 0.8) + vel * 0.4)
    m.x = ((m.x % third) - third) % third
    m.track.style.transform = `translate3d(${m.x}px,0,0)`
  }
})

if (!reduced) {
  // hero intro, timed to the curtain lifting
  gsap.timeline({ delay: 0.75 })
    .from('.hero .ch', { yPercent: 115, duration: 1, ease: 'expo.out', stagger: 0.04 })
    .from(['.hero__tag', '.hero__side', '.hero__hint'], { opacity: 0, y: 24, duration: 0.7, ease: 'power3.out', stagger: 0.08 }, '-=0.6')

  // the name drifts up a little slower than the page
  gsap.to('.hero__name', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })

  // hero letters thin out near the pointer (variable font)
  if (fine) {
    const letters = $$('.hero__line:first-child .ch').map((el) => ({ el, w: 800 }))
    let mx = -9999, my = -9999
    addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY })
    gsap.ticker.add(() => {
      if (scrollY > innerHeight) return
      for (const l of letters) {
        const r = l.el.getBoundingClientRect()
        const d = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2))
        l.w += (800 - 550 * Math.max(0, 1 - d / (innerWidth * 0.2)) - l.w) * 0.12
        l.el.style.fontVariationSettings = `'wght' ${l.w.toFixed(0)}`
      }
    })
  }

  // reveals: quick, and only ever a fade-up, so nothing stays hidden
  $$('.label, .about__text, .about__cols, .work__lede, .job, .stack > div, .filters, .contact__pre, .contact__big, .contact__grid').forEach((el) => {
    gsap.from(el, { y: 36, opacity: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 94%' } })
  })

  $$('[data-count]').forEach((el) => {
    const o = { v: 0 }, end = +el.dataset.count
    const fmt = () => { el.textContent = (el.dataset.prefix || '') + Math.round(o.v) + (el.dataset.suffix || '') }
    gsap.to(o, { v: end, duration: 1.4, ease: 'power3.out', onUpdate: fmt, scrollTrigger: { trigger: el, start: 'top 94%' } })
  })

  // timeline rail fills as you read
  gsap.to('.timeline__rail i', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 60%', end: 'bottom 60%', scrub: true } })

  // Batal phones spread apart as the card comes in
  gsap.from('.phone--l', { xPercent: 45, rotate: 0, scrollTrigger: { trigger: '.proj__vis--phones', start: 'top 80%', end: 'top 35%', scrub: 0.5 } })
  gsap.from('.phone--r', { xPercent: -45, rotate: 0, scrollTrigger: { trigger: '.proj__vis--phones', start: 'top 80%', end: 'top 35%', scrub: 0.5 } })

  // stacked project cards: the one underneath shrinks back as the next slides over it
  ScrollTrigger.matchMedia({
    '(min-width: 861px) and (min-height: 700px)': () => {
      const cards = $$('.proj')
      cards.forEach((card, i) => {
        const next = cards[i + 1]
        if (!next) return
        gsap.to(card, {
          scale: 0.94, filter: 'brightness(0.8)', ease: 'none',
          scrollTrigger: { trigger: next, start: 'top 55%', end: 'top 120px', scrub: true },
        })
      })
    },
    '(max-width: 860px)': () => {
      $$('.proj').forEach((card) => gsap.from(card, { y: 50, opacity: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 94%' } }))
    },
  })
}

// ---------- cursor + magnetic button (desktop only) ----------
if (fine) {
  const cur = $('.cursor')
  const xTo = gsap.quickTo(cur, 'x', { duration: 0.2, ease: 'power3' })
  const yTo = gsap.quickTo(cur, 'y', { duration: 0.2, ease: 'power3' })
  addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY) })
  document.addEventListener('pointerover', (e) => cur.classList.toggle('is-big', !!e.target.closest?.('a, button')))
  $$('[data-magnet]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect()
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.5, ease: 'power3.out' })
    })
    el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1,0.4)' }))
  })
}
