# salah-taha-site

Personal site of Salah Taha. The concept: the portfolio is an MQTT broker. Visitors connect
(handshake preloader), packets route through a live network in the hero, work history is a
topic tree, and there is a small pretend MQTT client to subscribe to `salah/#`.

Vanilla JS + Vite, GSAP/ScrollTrigger, Lenis. No framework, no images.

```bash
npm install
npm run dev      # local dev
npm run build    # outputs dist/
npm run deploy   # manual deploy (normally not needed)
```

## Deploys

Hosted on Cloudflare Workers (static assets, see `wrangler.jsonc`). Workers Builds is
connected to this repo: every push to `main` runs `npm run build` and `npx wrangler deploy`.

## Editing content

- Copy, experience, projects: `index.html`
- Terminal topics: `src/terminal.js`
- Hero network node names: `src/net.js`
- Project card artwork: `src/art.js`
