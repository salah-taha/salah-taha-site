// Background: the CSS dot grid stays static; this canvas lights the dots near the
// pointer and sends a few packets routing along the grid lines.

const GAP = 28

export function initField(canvas) {
  const ctx = canvas.getContext('2d')
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const fine = matchMedia('(pointer: fine)').matches
  let w = 0, h = 0, fg = '#fff', acc = '#ff6a2b'
  let packets = []
  const pointer = { x: -999, y: -999, a: 0 }

  function colors() {
    const cs = getComputedStyle(document.documentElement)
    fg = cs.getPropertyValue('--fg').trim()
    acc = cs.getPropertyValue('--acc').trim()
  }

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2)
    w = innerWidth; h = innerHeight
    canvas.width = w * dpr; canvas.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  function spawn() {
    const [dx, dy] = DIRS[(Math.random() * 4) | 0]
    packets.push({
      x: Math.round((Math.random() * w) / GAP) * GAP,
      y: Math.round((Math.random() * h * 0.8) / GAP) * GAP,
      dx, dy, left: 6 + ((Math.random() * 14) | 0), moved: 0,
      v: 1.2 + Math.random() * 1.4, hot: Math.random() < 0.45, trail: [], life: 1,
    })
  }

  function frame() {
    ctx.clearRect(0, 0, w, h)

    // spotlight on the dot grid
    pointer.a += ((pointer.x > -999 ? 1 : 0) - pointer.a) * 0.08
    if (pointer.a > 0.01) {
      const R = 170
      ctx.fillStyle = fg
      for (let gx = Math.floor((pointer.x - R) / GAP) * GAP; gx <= pointer.x + R; gx += GAP) {
        for (let gy = Math.floor((pointer.y - R) / GAP) * GAP; gy <= pointer.y + R; gy += GAP) {
          const d = Math.hypot(gx - pointer.x, gy - pointer.y)
          if (d > R) continue
          const f = (1 - d / R) ** 2
          ctx.globalAlpha = f * 0.55 * pointer.a
          const s = 1.2 + f * 1.8
          ctx.fillRect(gx - s / 2, gy - s / 2, s, s)
        }
      }
    }

    // packets
    const want = Math.min(14, Math.max(5, Math.round((w * h) / 110000)))
    if (packets.length < want && Math.random() < 0.05) spawn()
    ctx.lineWidth = 1.2
    packets = packets.filter((p) => {
      if (p.left > 0) {
        p.x += p.dx * p.v; p.y += p.dy * p.v; p.moved += p.v
        if (p.moved >= GAP) {
          p.x = Math.round(p.x / GAP) * GAP; p.y = Math.round(p.y / GAP) * GAP
          p.moved = 0; p.left--
          if (Math.random() < 0.28) {
            const turn = p.dx ? [[0, 1], [0, -1]] : [[1, 0], [-1, 0]]
            ;[p.dx, p.dy] = turn[(Math.random() * 2) | 0]
          }
        }
        p.trail.push(p.x, p.y)
        if (p.trail.length > 90) p.trail.splice(0, 2)
      } else {
        p.life -= 0.03
        p.trail.splice(0, 4)
      }
      const col = p.hot ? acc : fg
      const n = p.trail.length / 2
      for (let i = 1; i < n; i++) {
        ctx.globalAlpha = (i / n) * (p.hot ? 0.55 : 0.22) * Math.max(p.life, 0)
        ctx.strokeStyle = col
        ctx.beginPath()
        ctx.moveTo(p.trail[i * 2 - 2], p.trail[i * 2 - 1])
        ctx.lineTo(p.trail[i * 2], p.trail[i * 2 + 1])
        ctx.stroke()
      }
      ctx.globalAlpha = Math.max(p.life, 0) * (p.hot ? 1 : 0.5)
      ctx.fillStyle = col
      ctx.fillRect(p.x - 1.75, p.y - 1.75, 3.5, 3.5)
      return p.life > 0 && n > 0
    })
    ctx.globalAlpha = 1
    requestAnimationFrame(frame)
  }

  if (fine) {
    addEventListener('pointermove', (e) => { pointer.x = e.clientX; pointer.y = e.clientY })
    document.documentElement.addEventListener('pointerleave', () => { pointer.x = pointer.y = -999 })
  }
  addEventListener('resize', resize)
  new MutationObserver(colors).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  colors(); resize()
  if (!reduced) requestAnimationFrame(frame)
}
