// Small generative SVG motifs for the project cards. viewBox is 250 x 170.

const svg = (body) => `<svg viewBox="0 0 250 170" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${body}</svg>`
const rnd = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647)

const ART = {
  // receipt feeding out of a printer + barcode
  pos() {
    const r = rnd(7)
    let rows = ''
    for (let i = 0; i < 16; i++) {
      const y = 20 + i * 11
      rows += `<rect class="art-f" x="134" y="${y}" width="${18 + r() * 34}" height="2.5"/><rect class="art-f" x="188" y="${y}" width="${6 + r() * 10}" height="2.5"/>`
    }
    let bars = ''
    for (let i = 0, x = 18; i < 18; i++) { const bw = 1 + r() * 3; bars += `<rect class="art-f" x="${x}" y="112" width="${bw}" height="34"/>`; x += bw + 1.5 }
    return svg(`
      <g style="animation:feed 6s linear infinite">${rows}${rows.replace(/y="(\d+)"/g, (_, y) => `y="${+y + 176}"`)}</g>
      <rect class="art-s" x="124" y="-2" width="88" height="200"/>
      <text class="art-t" x="18" y="28">ORDER #4821</text><text class="art-t" x="18" y="42">TABLE 12 · 3 ITEMS</text>
      <rect class="art-x" x="18" y="54" width="46" height="16"/><text class="art-t" x="23" y="65" style="fill:#0e0e0c">SYNCED</text>
      ${bars}
      <circle class="art-x" cx="230" cy="24" r="4"><animate attributeName="opacity" values="1;.2;1" dur="1.4s" repeatCount="indefinite"/></circle>
      <text class="art-t" x="18" y="88">MULTI-BRANCH · LIVE</text>`)
  },
  // desktop window: sidebar, ledger table, offline badge
  desk() {
    const r = rnd(11)
    let rows = ''
    for (let i = 0; i < 7; i++) {
      const y = 62 + i * 13
      rows += `<rect class="art-f" x="78" y="${y}" width="${30 + r() * 40}" height="2.5" opacity=".8"/><rect class="art-f" x="168" y="${y}" width="${10 + r() * 14}" height="2.5"/><rect class="${i === 2 ? 'art-x' : 'art-f'}" x="206" y="${y}" width="${10 + r() * 14}" height="2.5"/><path class="art-s" d="M72 ${y + 8} H236" opacity=".3"/>`
    }
    let side = ''
    for (let i = 0; i < 6; i++) side += `<rect class="${i === 1 ? 'art-x' : 'art-f'}" x="22" y="${48 + i * 14}" width="${i === 1 ? 38 : 24 + r() * 14}" height="${i === 1 ? 8 : 3}" opacity="${i === 1 ? 1 : 0.6}"/>`
    return svg(`
      <rect class="art-s" x="12" y="14" width="230" height="142" rx="4"/>
      <path class="art-s" d="M12 32 H242 M66 32 V156"/>
      <circle class="art-s" cx="22" cy="23" r="2.5"/><circle class="art-s" cx="31" cy="23" r="2.5"/><circle class="art-s" cx="40" cy="23" r="2.5"/>
      <text class="art-t" x="78" y="26">MOTORYA — LEDGER</text>
      ${side}
      <text class="art-t" x="78" y="50">ACCOUNT</text><text class="art-t" x="168" y="50">IN</text><text class="art-t" x="206" y="50">OUT</text>
      ${rows}
      <g style="animation:float 3.5s ease-in-out infinite"><rect class="art-x" x="176" y="134" width="60" height="15"/><text class="art-t" x="181" y="144.5" style="fill:#0e0e0c">OFFLINE ✓</text></g>`)
  },
  // packet header bytes + expanding rings
  mqtt() {
    const bytes = ['10', '0C', '00', '04', '4D', '51', '54', '54', '04', '02', '00', '3C']
    const cells = bytes.map((b, i) => `<g transform="translate(${16 + (i % 6) * 22} ${112 + ((i / 6) | 0) * 22})"><rect class="${i < 2 ? 'art-x' : 'art-s'}" width="20" height="20"/><text class="art-t" x="4.5" y="13.5" ${i < 2 ? 'style="fill:#0e0e0c"' : ''}>${b}</text></g>`).join('')
    const rings = [0, 1, 2].map((i) => `<circle class="art-s" cx="178" cy="66" r="6"><animate attributeName="r" from="6" to="120" dur="3.6s" begin="${i * 1.2}s" repeatCount="indefinite"/><animate attributeName="opacity" from="1" to="0" dur="3.6s" begin="${i * 1.2}s" repeatCount="indefinite"/></circle>`).join('')
    return svg(`${rings}<circle class="art-x" cx="178" cy="66" r="7"/>
      <text class="art-t" x="16" y="28">CONNECT</text><text class="art-t" x="16" y="42">PROTOCOL MQTT 3.1.1</text><text class="art-t" x="16" y="56">KEEPALIVE 60</text>
      <text class="art-t" x="16" y="102">FIXED HEADER →</text>${cells}`)
  },
  // live-session equaliser + play mark
  learn() {
    let bars = ''
    for (let i = 0; i < 26; i++) {
      const hgt = 20 + ((i * 53) % 70)
      bars += `<rect class="${i % 7 === 3 ? 'art-x' : 'art-f'}" x="${16 + i * 8.5}" y="${150 - hgt}" width="5" height="${hgt}" style="transform-origin:0 150px;transform-box:view-box;animation:bar ${1 + ((i * 7) % 10) / 8}s ${i * 0.07}s ease-in-out infinite"/>`
    }
    return svg(`${bars}<text class="art-t" x="16" y="28">LIVE SESSION</text><text class="art-t" x="16" y="42">10K+ LEARNERS</text>
      <circle class="art-s" cx="214" cy="34" r="16"/><path class="art-x" d="M209 25 L224 34 L209 43Z"/>`)
  },
  // ECG trace
  med() {
    const beat = 'l14 0 l5 -8 l6 16 l6 -52 l8 74 l6 -38 l6 8 l19 0'
    const d = `M-10 92 ${beat} ${beat} ${beat} ${beat}`
    return svg(`
      <path class="art-s" d="${d}" opacity=".25"/>
      <path class="art-xs" d="${d}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" style="animation:dash 3.2s linear infinite"/>
      <text class="art-t" x="16" y="28">E2E ENCRYPTED</text><text class="art-t" x="16" y="42">SIGNALLING &lt; 100 MS</text>
      <text class="art-t" x="16" y="150">WEBRTC · SIGNALR</text>
      <g transform="translate(206 20)"><rect class="art-s" width="28" height="22" y="10"/><path class="art-s" d="M6 10 v-5 a8 8 0 0 1 16 0 v5"/></g>`)
  },
  // stack of phones
  apps() {
    const phones = [0, 1, 2, 3].map((i) => `
      <g transform="translate(${30 + i * 50} ${28 + (i % 2) * 14})"><g style="animation:float ${3 + i * 0.4}s ${i * 0.3}s ease-in-out infinite">
        <rect class="art-s" width="40" height="84" rx="5"/>
        <rect class="${i === 1 ? 'art-x' : 'art-f'}" x="5" y="10" width="30" height="${16 + i * 5}"/>
        <rect class="art-f" x="5" y="${34 + i * 5}" width="22" height="2.5"/><rect class="art-f" x="5" y="${41 + i * 5}" width="28" height="2.5"/>
        <circle class="art-s" cx="20" cy="76" r="3"/>
      </g></g>`).join('')
    return svg(`${phones}<text class="art-t" x="16" y="156">STORE · ESTATE · SOCIAL · PRESS</text>`)
  },
}

export function initArt() {
  document.querySelectorAll('[data-art]').forEach((card) => {
    const make = ART[card.dataset.art]
    if (make) card.innerHTML = make()
  })
}
