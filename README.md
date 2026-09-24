# salah-taha-site

Personal site of Salah Taha, live at https://salah-taha.com.

Vanilla JS + Vite with GSAP for light motion. No framework. The background grid is a
canvas, the project artwork is generated SVG, and the hero terminal and the Ctrl/⌘+K
command palette are plain DOM.

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
- Hero terminal commands and output: `src/term.js`
- Command palette entries: `src/main.js` (the `initPalette` call)
- Background grid and packets: `src/field.js`
- Project card artwork: `src/art.js`
