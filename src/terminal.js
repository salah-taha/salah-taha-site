// A pretend MQTT client. Topics hold retained messages about Salah.

const TOPICS = {
  'salah/now': [
    'Senior Software Engineer at POSBANK ME, Cairo.',
    'Leading POPs Management (Flutter) and the real-time layer between POS terminals and the cloud (.NET, AWS).',
    'Always up for a conversation about real-time systems, Flutter or .NET.',
  ],
  'salah/awards': [
    'Google Solution Challenge 2021: Top 10 in MENA (7th of 100+ projects) with Pharmaline.',
    'Google Developer Student Club, Helwan University: Flutter instructor, 2019-2020.',
  ],
  'salah/education': [
    'B.Sc. Computer Science & Artificial Intelligence, Helwan University, 2019-2023.',
    'Coursework: distributed computing, operating systems, networks, machine learning, databases.',
  ],
  'salah/principles': [
    'Polling is a confession. Push the event.',
    'Offline is a state, not an error.',
    'If it is not monitored, it is not in production. It is just running.',
    'Own it end to end: architecture, delivery, the 3 a.m. alert.',
    'Teach what you know. It is the fastest way to find out what you do not.',
  ],
  'salah/offline': [
    'Languages: Arabic (native), English (professional).',
    'Taught 200+ students to ship their first Flutter app.',
    'Wrote an MQTT broker in Dart mostly because nobody else had.',
  ],
  'salah/contact': [
    'mail      salah.abuhemaid@gmail.com',
    'linkedin  linkedin.com/in/salah-taha',
    'github    github.com/salah-taha',
  ],
}

const HELP = [
  'sub <topic>        subscribe, wildcards ok: salah/#',
  'unsub <topic>      unsubscribe',
  'pub <topic> <msg>  publish something',
  'topics             list topics',
  'ping               PINGREQ',
  'clear              clear the log',
]

const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
const stamp = () => new Date().toTimeString().slice(0, 8)

export function initTerminal(root, onEvent) {
  const log = root.querySelector('[data-log]')
  const form = root.querySelector('[data-form]')
  const input = form.querySelector('input')
  const chips = [...root.querySelectorAll('[data-sub]')]
  const subs = new Set()
  let queue = Promise.resolve()

  function line(html, delay = 0) {
    queue = queue.then(() => new Promise((res) => setTimeout(() => {
      const p = document.createElement('p')
      p.innerHTML = `<span class="t">${stamp()}</span> ${html}`
      log.append(p)
      log.scrollTop = log.scrollHeight
      res()
    }, delay)))
  }

  function match(filter) {
    if (filter.endsWith('#')) {
      const base = filter.slice(0, -1)
      return Object.keys(TOPICS).filter((t) => t.startsWith(base))
    }
    return TOPICS[filter] ? [filter] : []
  }

  function sub(filter) {
    const hits = match(filter)
    if (!hits.length) return line(`<span class="k">SUBACK</span> rc=0x80 no such topic. try <span class="tp">topics</span>`)
    subs.add(filter)
    chips.forEach((c) => c.classList.toggle('is-on', subs.has(c.dataset.sub)))
    line(`<span class="k">SUBACK</span> <span class="tp">${esc(filter)}</span> qos=1`)
    for (const t of hits) for (const m of TOPICS[t]) line(`<span class="tp">${t}</span> ${esc(m)}`, 110)
    onEvent?.('SUBSCRIBE', filter)
  }

  function run(raw) {
    const text = raw.trim()
    if (!text) return
    line(`<span class="me">› ${esc(text)}</span>`)
    const [cmd, topic, ...rest] = text.split(/\s+/)
    switch (cmd.toLowerCase()) {
      case 'sub': case 'subscribe': return sub(topic || 'salah/#')
      case 'unsub':
        subs.delete(topic)
        chips.forEach((c) => c.classList.toggle('is-on', subs.has(c.dataset.sub)))
        return line(`<span class="k">UNSUBACK</span> ${esc(topic || '')}`)
      case 'pub': case 'publish': {
        if (!topic) return line('usage: pub &lt;topic&gt; &lt;message&gt;')
        const msg = rest.join(' ')
        line(`<span class="k">PUBACK</span> <span class="tp">${esc(topic)}</span> ${esc(msg)}`)
        onEvent?.('PUBLISH', topic)
        if (topic.startsWith('salah/')) {
          line(`<span class="tp">salah/reply</span> This broker is pretend, so that went nowhere. The real inbox: <a href="mailto:salah.abuhemaid@gmail.com?body=${encodeURIComponent(msg)}" style="color:var(--signal)">salah.abuhemaid@gmail.com</a>`, 500)
        }
        return
      }
      case 'topics': case 'ls': return Object.keys(TOPICS).forEach((t) => line(`<span class="tp">${t}</span>`, 40))
      case 'ping': return line(`<span class="k">PINGRESP</span> ${(4 + Math.random() * 9).toFixed(1)} ms`, 120)
      case 'clear': queue = queue.then(() => { log.innerHTML = '' }); return
      case 'help': case '?': return HELP.forEach((h) => line(esc(h), 30))
      case 'sudo': return line('nice try.')
      default: return line(`unknown packet type "${esc(cmd)}". try <span class="tp">help</span>`)
    }
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); run(input.value); input.value = '' })
  chips.forEach((c) => c.addEventListener('click', () => run(`sub ${c.dataset.sub}`)))
  root.querySelector('.term__win').addEventListener('click', (e) => { if (!e.target.closest('a')) input.focus({ preventScroll: true }) })

  line(`<span class="k">CONNACK</span> rc=0 session_present=0`)
  line(`welcome. type <span class="tp">help</span> or pick a topic on the left.`)
}
