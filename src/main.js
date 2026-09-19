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

$('[data-year]').textContent = new Date().getFullYear()
const clock = $('[data-clock]')
const tick = () => { clock.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit' }) }
tick(); setInterval(tick, 20000)

$('.theme').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = next
  try { localStorage.setItem('theme', next) } catch {}
})

$$('[data-letters]').forEach((el) => {
  el.innerHTML = [...el.textContent].map((c) => `<span class="ch">${c}</span>`).join('')
})

initArt()
initNet($('.hero__net'))

if (!reduced) {
  // hero intro
  gsap.timeline({ delay: 0.15 })
    .from('.hero .ch', { yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.04 })
    .from(['.hero__role', '.hero__tag', '.hero__cta'], { opacity: 0, y: 20, duration: 0.7, ease: 'power3.out', stagger: 0.08 }, '-=0.6')

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
        const target = 800 - 550 * Math.max(0, 1 - d / (innerWidth * 0.2))
        l.w += (target - l.w) * 0.12
        l.el.style.fontVariationSettings = `'wght' ${l.w.toFixed(0)}`
      }
    })
  }

  // gentle reveals; content is never hidden for long
  $$('.label, .about__grid, .job, .card, .skills > div, .edu > div, .contact__pre, .contact__big').forEach((el) => {
    gsap.from(el, { y: 32, opacity: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%' } })
  })

  $$('[data-count]').forEach((el) => {
    const o = { v: 0 }, end = +el.dataset.count
    const fmt = () => { el.textContent = (el.dataset.prefix || '') + Math.round(o.v) + (el.dataset.suffix || '') }
    gsap.to(o, { v: end, duration: 1.4, ease: 'power3.out', onUpdate: fmt, scrollTrigger: { trigger: el, start: 'top 92%' } })
  })
}

$$('[data-copy]').forEach((btn) => btn.addEventListener('click', async () => {
  const small = $('small', btn)
  try { await navigator.clipboard.writeText(btn.dataset.copy); small.textContent = 'copied' } catch { small.textContent = 'press ctrl+c' }
  setTimeout(() => { small.textContent = 'click to copy' }, 2000)
}))
