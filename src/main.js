import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { initNet } from './net.js'
import { initTerminal } from './terminal.js'
import { initArt } from './art.js'

gsap.registerPlugin(ScrollTrigger)

const $ = (s, el = document) => el.querySelector(s)
const $$ = (s, el = document) => [...el.querySelectorAll(s)]
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
const fine = matchMedia('(pointer: fine)').matches
const clientId = 'visitor-' + Math.random().toString(16).slice(2, 6)

// ---------- HUD: every interaction is a packet ----------
const hud = $('[data-hud]')
function emit(type, topic, payload = '') {
  hud.textContent = `${type} ${topic}${payload ? ` "${payload}"` : ''}`
  gsap.fromTo(hud, { opacity: 0.2 }, { opacity: 1, duration: 0.4 })
}

// ---------- smooth scroll ----------
const lenis = new Lenis({ lerp: 0.11 })
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((t) => lenis.raf(t * 1000))
gsap.ticker.lagSmoothing(0)
lenis.stop()
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  e.preventDefault()
  lenis.scrollTo(a.getAttribute('href'), { duration: 1.4 })
}))

// ---------- static bits ----------
$('[data-client-id]').textContent = clientId
$('[data-year]').textContent = new Date().getFullYear()
const clock = $('[data-clock]')
const tick = () => { clock.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Cairo' }) }
tick(); setInterval(tick, 1000)

$('.theme').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = next
  try { localStorage.setItem('theme', next) } catch {}
  emit('PUBLISH', 'visitor/theme', next)
})

// ticker content, doubled for a seamless loop
const feed = [
  ['pos/terminal-07/order', 'created'], ['kitchen/display/3', 'ack'], ['salah/status', 'shipping'],
  ['inventory/branch-2/stock', 'delta -4'], ['ws/gateway/conn', '+1'], ['salah/coffee', 'qos 2'],
  ['reports/daily', 'ready'], ['flutter/build', 'ok 41s'], ['alerts/latency', 'nominal'], ['mqtt/$SYS/clients', '128'],
].map(([t, m]) => `<span><b>PUBLISH</b> ${t} → ${m}</span>`).join('')
$('[data-ticker]').innerHTML = feed + feed

// ---------- split helpers ----------
$$('[data-letters]').forEach((el) => {
  el.innerHTML = [...el.textContent].map((c) => `<span class="ch">${c}</span>`).join('')
})
$$('[data-words]').forEach((el) => {
  const wrap = (node) => {
    ;[...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment()
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part.trim()) return frag.append(part ? ' ' : '')
          const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.append(s)
        })
        n.replaceWith(frag)
      } else wrap(n)
    })
  }
  wrap(el)
})

initArt()
initNet($('.hero__net'), (topic, msg) => emit('PUBLISH', topic, msg))
initTerminal($('.term'), (type, topic) => emit(type, topic))

// ---------- preloader: the MQTT handshake ----------
const steps = [
  `> CONNECT mqtt://salah:1883`,
  `> client_id=${clientId} keepalive=60 clean_session=1`,
  `> TLS handshake ........ ok`,
  `> <b>CONNACK rc=0</b> · welcome`,
]
function boot() {
  const log = $('.loader__log'), num = $('.loader__count span')
  const tl = gsap.timeline({ onComplete: enter })
  const counter = { v: 0 }
  tl.to(counter, { v: 100, duration: reduced ? 0.3 : 1.7, ease: 'power2.inOut', onUpdate: () => { num.textContent = Math.round(counter.v) } }, 0)
  steps.forEach((s, i) => tl.call(() => { log.innerHTML += s + '\n' }, null, reduced ? 0 : 0.15 + i * 0.4))
  tl.to('.loader', { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '+=0.25')
  tl.add(() => heroTl.play(), '-=0.5')
}
function enter() {
  $('.loader').remove()
  document.body.classList.remove('is-loading')
  lenis.start()
  heroTl.play()
  ScrollTrigger.refresh()
  emit('CONNACK', 'rc=0', clientId)
}
gsap.set('.hero .ch', { yPercent: 110 })
gsap.set(['.hero__foot > *', '.bar', '.hero__hint', '.hero__mark'], { opacity: 0, y: 20 })
const heroTl = gsap.timeline({ paused: true })
heroTl
  .to('.hero .ch', { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.05 })
  .to(['.hero__mark', '.hero__foot > *', '.bar', '.hero__hint'], { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08 }, '-=0.6')
document.fonts.ready.then(boot)

// ---------- hero letters thin out near the pointer (variable font) ----------
if (fine && !reduced) {
  const letters = $$('.hero .ch').map((el) => ({ el, w: 800 }))
  let mx = -9999, my = -9999
  addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY })
  gsap.ticker.add(() => {
    if (scrollY > innerHeight) return
    for (const l of letters) {
      const r = l.el.getBoundingClientRect()
      const d = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2))
      const target = 800 - 600 * Math.max(0, 1 - d / (innerWidth * 0.22))
      l.w += (target - l.w) * 0.12
      l.el.style.fontVariationSettings = `'wght' ${l.w.toFixed(0)}`
    }
  })
}

// ---------- scroll choreography ----------
gsap.to('.hero__name', { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })

if (!reduced) {
  gsap.to('.about__text .w', {
    opacity: 1, stagger: 0.1, ease: 'none',
    scrollTrigger: { trigger: '.about__text', start: 'top 78%', end: 'bottom 45%', scrub: true },
  })
}

$$('[data-count]').forEach((el) => {
  const o = { v: 0 }, end = +el.dataset.count
  const fmt = () => { el.textContent = (el.dataset.prefix || '') + Math.round(o.v) + (el.dataset.suffix || '') }
  fmt()
  gsap.to(o, { v: end, duration: 1.6, ease: 'power3.out', onUpdate: fmt, scrollTrigger: { trigger: el, start: 'top 88%' } })
})

$$('.display, .row, .contact__pre, .term__win').forEach((el) => {
  gsap.from(el, { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } })
})

$$('[data-topic]').forEach((sec) => {
  ScrollTrigger.create({
    trigger: sec, start: 'top 55%', end: 'bottom 55%',
    onEnter: () => emit('SUBSCRIBE', sec.dataset.topic),
    onEnterBack: () => emit('SUBSCRIBE', sec.dataset.topic),
  })
})

// accordion
$$('.row').forEach((row) => {
  const head = $('.row__head', row)
  head.addEventListener('click', () => {
    const open = row.classList.toggle('is-open')
    head.setAttribute('aria-expanded', open)
    emit(open ? 'SUBSCRIBE' : 'UNSUBSCRIBE', 'salah/work' + $('.row__idx', row).textContent)
    setTimeout(() => ScrollTrigger.refresh(), 650)
  })
})

// horizontal projects (desktop only)
ScrollTrigger.matchMedia({
  '(min-width: 801px)': () => {
    const track = $('.projects__track')
    const dist = () => Math.max(0, track.scrollWidth - innerWidth + parseFloat(getComputedStyle(track.parentElement).paddingLeft))
    gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: '.projects__pin', pin: true, scrub: 0.6, end: () => '+=' + dist(), invalidateOnRefresh: true },
    })
  },
})

// marquees: drift on their own, pushed around by scroll velocity
const mqs = $$('.mq').map((el) => {
  const track = $('.mq__track', el)
  track.innerHTML += track.innerHTML
  return { track, dir: +el.dataset.dir, x: 0 }
})
gsap.ticker.add(() => {
  const v = lenis.velocity || 0
  for (const m of mqs) {
    const half = m.track.scrollWidth / 2
    if (!half) continue
    m.x -= m.dir * ((reduced ? 0 : 0.7) + v * 0.35)
    m.x = ((m.x % half) - half) % half
    m.track.style.transform = `translate3d(${m.x}px,0,0)`
  }
})

// ---------- cursor + magnets ----------
if (fine) {
  const cur = $('.cursor'), label = $('.cursor__label')
  const xTo = gsap.quickTo(cur, 'x', { duration: 0.25, ease: 'power3' })
  const yTo = gsap.quickTo(cur, 'y', { duration: 0.25, ease: 'power3' })
  addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY) })
  addEventListener('pointerdown', () => cur.classList.add('is-down'))
  addEventListener('pointerup', () => cur.classList.remove('is-down'))
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest?.('[data-cursor]')
    cur.classList.toggle('is-active', !!t)
    if (t) label.textContent = t.dataset.cursor
  })

  $$('[data-magnet]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect()
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.06, y: (e.clientY - r.top - r.height / 2) * 0.12, duration: 0.6, ease: 'power3.out' })
    })
    el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1,0.4)' }))
  })
}

// copy email
$$('[data-copy]').forEach((btn) => btn.addEventListener('click', async () => {
  const small = $('small', btn)
  try { await navigator.clipboard.writeText(btn.dataset.copy); small.textContent = 'PUBACK · copied' } catch { small.textContent = btn.dataset.copy }
  emit('PUBLISH', 'visitor/clipboard', 'email')
  setTimeout(() => { small.textContent = 'click to copy' }, 2000)
}))

console.log('%c● CONNECTED %c curious? github.com/salah-taha', 'color:#ff4d17', 'color:inherit')
