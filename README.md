# salah-taha-site

Personal site of Salah Taha, live at https://salah-taha.com.

Vanilla JS + Vite with GSAP for light motion. No framework, no images: the hero network
and project artwork are drawn in canvas / SVG.

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
- Hero constellation (the shipped products): `src/net.js`
- Project card artwork: `src/art.js`
