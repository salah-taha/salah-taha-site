// Hero canvas: the things Salah shipped, orbiting a core and passing packets around.
// Each node is a real project; tapping one jumps to it.

const PRODUCTS = [
  { name: 'Batal', tag: 'fitness · mobile + api', to: '#p-batal' },
  { name: 'POPs', tag: 'point of sale · cloud', to: '#p-pops' },
  { name: 'Motorya', tag: 'showrooms · desktop', to: '#p-motorya' },
  { name: 'mqtt_server', tag: 'open source', to: '#p-mqtt' },
  { name: 'Pharmaline', tag: 'e-learning', to: '#p-pharmaline' },
  { name: 'Medical Comms', tag: 'real-time video', to: '#p-medical' },
  { name: 'Client apps', tag: '10+ shipped', to: '#p-clients' },
]

export function initNet(canvas, onPick) {
  const ctx = canvas.getContext('2d')
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  let w = 0, h = 0, ink = '#000', signal = '#ff4d17', mobile = false
  let nodes = [], packets = [], core, hover = null
  const pointer = { x: -999, y: -999 }

  function colors() {
    const cs = getComputedStyle(document.documentElement)
    ink = cs.getPropertyValue('--ink').trim()
    signal = cs.getPropertyValue('--signal').trim()
  }

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2)
    w = canvas.clientWidth; h = canvas.clientHeight
    canvas.width = w * dpr; canvas.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    mobile = w < 860
    core = mobile ? { x: w * 0.5, y: h * 0.47 } : { x: w * 0.69, y: h * 0.46 }
    const rx = mobile ? w * 0.34 : Math.min(w * 0.19, 330)
    const ry = mobile ? h * 0.34 : Math.min(h * 0.3, 270)
    nodes = PRODUCTS.map((p, i) => ({
      ...p, a: (i / PRODUCTS.length) * Math.PI * 2 - 1.2,
      rx: rx * (0.78 + ((i * 37) % 10) / 22), ry: ry * (0.78 + ((i * 53) % 10) / 22),
      x: 0, y: 0, hit: 0,
    }))
  }

  const send = (from, to, hot) => packets.push({ from, to, t: 0, v: 0.009 + Math.random() * 0.01, hot })
  function publish(from, hot) {
    send(from, core, hot)
    const subs = nodes.filter((n) => n !== from && Math.random() < 0.3)
    setTimeout(() => subs.forEach((s) => send(core, s, hot)), 650)
  }

  function frame(time) {
    ctx.clearRect(0, 0, w, h)
    hover = null
    for (const n of nodes) {
      const a = n.a + time * 0.00005
      n.x = core.x + Math.cos(a) * n.rx
      n.y = core.y + Math.sin(a) * n.ry
      if (Math.hypot(pointer.x - n.x, pointer.y - n.y) < 34) hover = n
    }
    canvas.style.cursor = hover ? 'pointer' : ''

    ctx.lineWidth = 1
    ctx.strokeStyle = ink
    ctx.setLineDash([2, 5])
    for (const n of nodes) {
      ctx.globalAlpha = n === hover ? 0.7 : 0.22
      ctx.beginPath(); ctx.moveTo(core.x, core.y); ctx.lineTo(n.x, n.y); ctx.stroke()
    }
    ctx.setLineDash([])
    ctx.globalAlpha = 1

    ctx.beginPath(); ctx.arc(core.x, core.y, 17 + Math.sin(time * 0.003) * 3, 0, 7); ctx.stroke()
    ctx.fillStyle = signal
    ctx.beginPath(); ctx.arc(core.x, core.y, 7, 0, 7); ctx.fill()

    for (const n of nodes) {
      n.hit *= 0.93
      const on = n === hover
      const s = (on ? 12 : 7) + n.hit * 6
      ctx.fillStyle = on ? signal : ink
      ctx.fillRect(n.x - s / 2, n.y - s / 2, s, s)
      const left = n.x < core.x
      ctx.textAlign = mobile ? 'center' : left ? 'right' : 'left'
      const tx = mobile ? Math.max(48, Math.min(w - 48, n.x)) : n.x + (left ? -12 : 12)
      const ty = mobile ? n.y + (n.y < core.y ? -12 : 22) : n.y + 1
      ctx.fillStyle = on ? signal : ink
      ctx.font = `800 ${mobile ? 13 : 16}px "Bricolage Grotesque", sans-serif`
      ctx.fillText(n.name.toUpperCase(), tx, ty)
      if (!mobile) {
        ctx.globalAlpha = 0.6
        ctx.fillStyle = ink
        ctx.font = '400 10px "JetBrains Mono", monospace'
        ctx.fillText(n.tag, tx, n.y + 15)
        ctx.globalAlpha = 1
      }
    }

    packets = packets.filter((p) => {
      p.t += p.v
      if (p.t >= 1) { p.to.hit = 1; return false }
      const e = p.t * p.t * (3 - 2 * p.t)
      ctx.fillStyle = p.hot ? signal : ink
      ctx.fillRect(p.from.x + (p.to.x - p.from.x) * e - 3, p.from.y + (p.to.y - p.from.y) * e - 3, 6, 6)
      return true
    })

    if (!reduced) requestAnimationFrame(frame)
  }

  const at = (e) => { const r = canvas.getBoundingClientRect(); pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top }
  canvas.addEventListener('pointermove', at)
  canvas.addEventListener('pointerleave', () => { pointer.x = pointer.y = -999 })
  canvas.addEventListener('click', (e) => {
    at(e)
    const n = nodes.find((n) => Math.hypot(pointer.x - n.x, pointer.y - n.y) < 40)
    if (n) { publish(n, true); onPick?.(n.to) }
  })

  setInterval(() => {
    if (document.hidden || !nodes.length) return
    publish(nodes[(Math.random() * nodes.length) | 0], Math.random() < 0.35)
  }, 700)

  new ResizeObserver(resize).observe(canvas)
  new MutationObserver(colors).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  colors(); resize()
  document.fonts.ready.then(() => requestAnimationFrame(frame))
}
