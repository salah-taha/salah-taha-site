// Hero canvas: a broker in the middle, clients around it, packets on the wire.
// The visitor's pointer is a client too; clicking publishes a burst.

const CLIENTS = [
  'pos-terminal-01', 'kitchen-display', 'flutter-app', 'aws-lambda', 'redis',
  'postgres', 'signalr-hub', 'edge-device', 'ci-runner', 'grafana',
]

export function initNet(canvas, onPublish) {
  const ctx = canvas.getContext('2d')
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  let w = 0, h = 0, dpr = 1, ink = '#000', signal = '#ff4d17'
  let nodes = [], packets = [], broker, you
  const pointer = { x: -999, y: -999, active: false }

  function colors() {
    const cs = getComputedStyle(document.documentElement)
    ink = cs.getPropertyValue('--ink').trim()
    signal = cs.getPropertyValue('--signal').trim()
  }

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2)
    w = canvas.clientWidth; h = canvas.clientHeight
    canvas.width = w * dpr; canvas.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const mobile = w < 800
    broker = { x: w * (mobile ? 0.5 : 0.66), y: h * (mobile ? 0.26 : 0.36) }
    const count = mobile ? 6 : CLIENTS.length
    nodes = CLIENTS.slice(0, count).map((name, i) => {
      const a = (i / count) * Math.PI * 2 + 0.4
      const r = Math.min(w, h) * (mobile ? 0.3 : 0.34) * (0.7 + ((i * 37) % 10) / 16)
      return { name, a, r, speed: 0.00006 * (i % 2 ? 1 : -1) * (1 + (i % 3)), x: 0, y: 0, hit: 0 }
    })
    you = { name: 'you', x: broker.x, y: broker.y, hit: 0 }
  }

  function send(from, to, hot) {
    packets.push({ from, to, t: 0, v: 0.008 + Math.random() * 0.01, hot })
  }

  // publish from one node: goes to the broker, which fans out to a few subscribers
  function publish(from, hot) {
    send(from, broker, hot)
    const subs = nodes.filter((n) => n !== from && Math.random() < 0.35)
    setTimeout(() => subs.forEach((s) => send(broker, s, hot)), 700)
  }

  function frame(time) {
    ctx.clearRect(0, 0, w, h)
    for (const n of nodes) {
      const a = n.a + time * n.speed
      n.x = broker.x + Math.cos(a) * n.r * 1.35
      n.y = broker.y + Math.sin(a) * n.r * 0.8
    }
    if (pointer.active) { you.x += (pointer.x - you.x) * 0.12; you.y += (pointer.y - you.y) * 0.12 }

    const all = pointer.active ? [...nodes, you] : nodes
    ctx.lineWidth = 1
    ctx.strokeStyle = ink
    ctx.globalAlpha = 0.22
    ctx.setLineDash([2, 5])
    for (const n of all) {
      ctx.beginPath(); ctx.moveTo(broker.x, broker.y); ctx.lineTo(n.x, n.y); ctx.stroke()
    }
    ctx.setLineDash([])

    // broker
    ctx.globalAlpha = 1
    const pulse = 18 + Math.sin(time * 0.003) * 3
    ctx.beginPath(); ctx.arc(broker.x, broker.y, pulse, 0, 7); ctx.stroke()
    ctx.fillStyle = signal
    ctx.beginPath(); ctx.arc(broker.x, broker.y, 7, 0, 7); ctx.fill()
    ctx.fillStyle = ink
    ctx.font = '500 10px "JetBrains Mono", monospace'
    ctx.fillText('BROKER :1883', broker.x + 28, broker.y + 3)

    for (const n of all) {
      n.hit *= 0.93
      const s = 5 + n.hit * 6
      ctx.fillStyle = n === you ? signal : ink
      ctx.fillRect(n.x - s / 2, n.y - s / 2, s, s)
      ctx.globalAlpha = 0.6
      ctx.fillStyle = ink
      ctx.fillText(n.name, n.x + 10, n.y + 3)
      ctx.globalAlpha = 1
    }

    packets = packets.filter((p) => {
      p.t += p.v
      if (p.t >= 1) { p.to.hit = 1; return false }
      const e = p.t * p.t * (3 - 2 * p.t)
      const x = p.from.x + (p.to.x - p.from.x) * e
      const y = p.from.y + (p.to.y - p.from.y) * e
      ctx.fillStyle = p.hot ? signal : ink
      ctx.fillRect(x - 3, y - 3, 6, 6)
      return true
    })

    if (!reduced) requestAnimationFrame(frame)
  }

  const hero = canvas.parentElement
  hero.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect()
    pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.active = true
  })
  hero.addEventListener('pointerleave', () => { pointer.active = false })
  hero.addEventListener('click', () => {
    if (!pointer.active) return
    for (let i = 0; i < 4; i++) setTimeout(() => publish(you, true), i * 90)
    onPublish?.('visitor/click', 'hello broker')
  })

  // ambient traffic
  setInterval(() => {
    if (document.hidden || !nodes.length) return
    publish(nodes[(Math.random() * nodes.length) | 0], Math.random() < 0.3)
  }, 650)

  new ResizeObserver(resize).observe(canvas)
  new MutationObserver(colors).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  colors(); resize(); requestAnimationFrame(frame)
}
