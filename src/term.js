// The hero terminal: plays a short boot session, then takes real commands.

const EMAIL = 'contact@salah-taha.com'
const START = new Date(2020, 0, 1)

const PROJECTS = [
  ['batal', '#p-batal', 'fitness app + gym platform', 'Flutter · NestJS'],
  ['pops', '#p-pops', 'cloud POS for restaurants', 'Flutter · .NET 8'],
  ['motorya', '#p-motorya', 'offline-first dealer ERP', 'Flutter desktop'],
  ['mqtt_server', '#p-mqtt', 'pure-Dart MQTT broker', 'Dart · OSS'],
  ['pharmaline', '#p-pharmaline', 'e-learning, 10K+ learners', 'Flutter · Node'],
  ['medical', '#p-medical', 'E2E encrypted calls', 'WebRTC · SignalR'],
  ['clients', '#p-clients', '10+ client apps', 'Flutter · .NET'],
]
const SECTIONS = ['about', 'work', 'experience', 'stack', 'contact']

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const pad = (s, n) => s + ' '.repeat(Math.max(1, n - s.length))

export function uptime(now = new Date()) {
  let y = now.getFullYear() - START.getFullYear()
  let m = now.getMonth() - START.getMonth()
  let d = now.getDate() - START.getDate()
  if (d < 0) { m--; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate() }
  if (m < 0) { y--; m += 12 }
  return `${y}y ${m}m ${d}d`
}

export function initTerm(root, { go, toggleTheme }) {
  const body = root.querySelector('[data-term-body]')
  const form = root.querySelector('[data-term-form]')
  const input = form.querySelector('input')
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const history = []
  let hi = 0, booting = true, skip = false

  const print = (html, cls = '') => {
    const p = document.createElement('p')
    if (cls) p.className = cls
    p.innerHTML = html
    body.appendChild(p)
    body.scrollTop = body.scrollHeight
    return p
  }
  const wait = (ms) => new Promise((r) => setTimeout(r, skip ? 0 : ms))

  async function type(cmd) {
    const p = print('', 'c')
    if (reduced || skip) { p.textContent = cmd; return }
    const cur = '<span class="blk"></span>'
    for (let i = 1; i <= cmd.length; i++) {
      p.innerHTML = esc(cmd.slice(0, i)) + cur
      await wait(38 + Math.random() * 50)
    }
    await wait(220)
    p.textContent = cmd
  }

  const link = (href, text, ext) => `<a href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}>${text}</a>`

  const COMMANDS = {
    help() {
      return [
        '<span class="m">available commands</span>',
        ...[
          ['whoami', 'who is this'], ['status', 'what I am doing now'], ['projects', 'things I shipped'],
          ['open <name>', 'jump to a project'], ['stack', 'what I build with'], ['experience', 'git log of my career'],
          ['uptime', 'how long I have been shipping'], ['contact', 'ways to reach me'], ['theme', 'flip light / dark'], ['clear', 'clean the screen'],
        ].map(([c, d]) => `  <span class="a">${esc(pad(c, 14))}</span><span class="m">${d}</span>`),
      ].join('\n')
    },
    whoami: () => 'Salah Taha. Senior software engineer, Cairo.\n<span class="m">I take products from an empty repo to people\'s hands.</span>',
    status: () => [
      '{',
      '  <span class="k">"role"</span>: <span class="s">"Senior Software Engineer"</span>,',
      '  <span class="k">"company"</span>: <span class="s">"POSBANK"</span>,',
      '  <span class="k">"location"</span>: <span class="s">"Cairo, EG (UTC+2/+3)"</span>,',
      '  <span class="k">"focus"</span>: [<span class="s">"real-time"</span>, <span class="s">"offline-first"</span>, <span class="s">"mobile"</span>],',
      `  <span class="k">"shipped"</span>: <span class="n">15</span>,`,
      '  <span class="k">"open_to_talk"</span>: <span class="n">true</span>',
      '}',
    ].join('\n'),
    projects: () => [
      '<span class="m">7 projects, all in production</span>',
      ...PROJECTS.map(([n, h, d, s]) => `  ${link(h, n)}${' '.repeat(Math.max(1, 13 - n.length))}<span class="m">${d}</span>`),
      '<span class="m">tip: </span><span class="a">open batal</span>',
    ].join('\n'),
    open(arg) {
      const p = PROJECTS.find(([n]) => arg && n.startsWith(arg.toLowerCase()))
      if (!p) return `open: no project named "${esc(arg || '')}". try <span class="a">projects</span>`
      setTimeout(() => go(p[1]), 350)
      return `<span class="ok">✓</span> opening ${p[0]} <span class="m">(${p[3]})</span>`
    },
    cd(arg) {
      const s = SECTIONS.find((x) => arg && x.startsWith(arg.replace(/^[~/.]+/, '').toLowerCase()))
      if (!s) return `cd: ${esc(arg || '')}: no such section. try one of: ${SECTIONS.join(', ')}`
      setTimeout(() => go('#' + s), 250)
      return `<span class="ok">✓</span> ~/${s}`
    },
    ls: () => SECTIONS.map((s) => link('#' + s, s + '/')).join('  '),
    stack: () => [
      `<span class="k">apps    </span> Flutter · Dart · React · Kotlin`,
      `<span class="k">backend </span> .NET 8 · NestJS · Node.js · GraphQL · gRPC`,
      `<span class="k">realtime</span> WebSocket · MQTT · WebRTC · SignalR`,
      `<span class="k">data    </span> PostgreSQL · Redis · SQLite · MongoDB`,
      `<span class="k">cloud   </span> AWS · Docker · Cloudflare · CI/CD`,
    ].join('\n'),
    experience: () => [
      `<span class="n">c0ffee1</span> <span class="a">(HEAD → main)</span> 2022  Senior SWE @ POSBANK`,
      `<span class="n">7a3d9e2</span>              2020  SWE @ Jabal Soft, 10+ apps`,
      `<span class="n">4be81f0</span>              2020  Instructor, 200+ students`,
      `<span class="n">1f0a2b7</span> <span class="m">(tag: init)</span>   2019  B.Sc. CS &amp; AI, Helwan`,
    ].join('\n'),
    uptime: () => `shipping software for <span class="ok">${uptime()}</span>, load average: <span class="m">high, and liking it</span>`,
    contact: () => [
      `<span class="k">email   </span> ${link('mailto:' + EMAIL, EMAIL)}`,
      `<span class="k">linkedin</span> ${link('https://www.linkedin.com/in/salah-taha/', 'in/salah-taha', true)}`,
      `<span class="k">github  </span> ${link('https://github.com/salah-taha', 'salah-taha', true)}`,
    ].join('\n'),
    theme(arg) {
      const now = toggleTheme(arg)
      return `<span class="ok">✓</span> theme set to ${now}`
    },
    date: () => new Date().toLocaleString('en-GB', { timeZone: 'Africa/Cairo', dateStyle: 'full', timeStyle: 'short' }) + ' <span class="m">(Cairo)</span>',
    echo: (arg) => esc(arg || ''),
    sudo(arg) {
      if (!/^hire\b/.test(arg || '')) return 'sudo: this incident will be reported. <span class="m">(try sudo hire salah)</span>'
      setTimeout(() => { location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent("Let's work together") }, 1400)
      return '[sudo] password for you: ********\n<span class="ok">✓ access granted.</span> opening your mail client…'
    },
    exit: () => 'there is no exit. only shipping.',
    rm: () => '<span class="a">rm: permission denied.</span> this site runs in production.',
    vim: () => 'E37: No write since last change <span class="m">(add ! to override)</span>',
    clear() { body.innerHTML = ''; return null },
  }
  const ALIAS = { 'cat status.json': 'status', 'git log': 'experience', 'ls projects': 'projects', 'cat contact': 'contact', man: 'help', '?': 'help', hire: 'sudo hire', email: 'contact', work: 'projects', emacs: 'vim' }

  function run(raw) {
    let line = raw.trim()
    if (!line) return
    const head = line.split(/\s+/)[0]
    if (ALIAS[line]) line = ALIAS[line]
    else if (ALIAS[head]) line = ALIAS[head] + line.slice(head.length)
    const [name, ...rest] = line.split(/\s+/)
    const fn = COMMANDS[name.toLowerCase()]
    const out = fn ? fn(rest.join(' ')) : `command not found: ${esc(name)}. type <span class="a">help</span>`
    if (out) print(out)
  }

  // one command at a time, so the boot session and user input never interleave
  let queue = Promise.resolve()
  const exec = (cmd, { typed = false } = {}) => (queue = queue.then(async () => {
    if (!typed) await type(cmd)
    else print(esc(cmd), 'c')
    run(cmd)
  }))

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const v = input.value
    input.value = ''
    if (booting) skip = true
    if (v.trim()) { history.push(v); hi = history.length }
    exec(v, { typed: true })
  })
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && hi > 0) { input.value = history[--hi]; e.preventDefault() }
    else if (e.key === 'ArrowDown') { hi = Math.min(history.length, hi + 1); input.value = history[hi] ?? ''; e.preventDefault() }
    else if (e.key === 'Tab' && input.value) {
      const hit = Object.keys(COMMANDS).find((c) => c.startsWith(input.value))
      if (hit) { input.value = hit + ' '; e.preventDefault() }
    } else if (e.key === 'l' && e.ctrlKey) { body.innerHTML = ''; e.preventDefault() }
  })
  root.querySelectorAll('[data-cmd]').forEach((b) => b.addEventListener('click', () => {
    if (booting) skip = true
    exec(b.dataset.cmd)
  }))
  // click anywhere in the window to type, but never pop a phone keyboard uninvited
  body.addEventListener('click', (e) => {
    if (!e.target.closest('a') && matchMedia('(pointer: fine)').matches && !getSelection().toString()) input.focus({ preventScroll: true })
  })

  queue = queue.then(() => wait(700))
  exec('whoami')
  queue = queue.then(() => wait(500))
  exec('cat status.json')
  queue = queue.then(() => {
    print('<span class="m">type <span class="a">help</span> to look around, or tap a command below.</span>')
    booting = skip = false
  })

  return { focus: () => input.focus() }
}
