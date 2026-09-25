# Sujatha S Iyer — React Portfolio

React + Vite portfolio, designed for GitHub and Cloudflare Pages. All portfolio content lives in `public/data.json`.

## Stack

- React 19
- Vite 7
- Lucide icons
- Plain CSS, no UI framework
- Lato typography with a custom SSI script wordmark
- Live YouTube thumbnails and website previews for writing/media cards
- Light and dark theme with persisted preference
- Multi-page static output: `index.html` and `writing.html`

## Content

- `public/data.json` — all editable portfolio data and the full writing/media dataset
- `public/profile.webp` — transparent profile portrait
- `public/favicon.png` — SSI script favicon
- `src/App.jsx` — components and page structure
- `src/styles.css` — visual system and themes
- `writing.html` — standalone Writing & Media entry page

Patent entries link to their public patent pages. No patent PDFs are bundled.

## Run locally

```bash
npm install
npm run dev
```

Homepage: `http://localhost:5173/`
Writing & Media: `http://localhost:5173/writing.html`

## Production build

```bash
npm install
npm run build
```

Build output: `dist/`

The build contains both `dist/index.html` and `dist/writing.html`, so reloading the Writing & Media page works without SPA routing rules.

## Deploy to Cloudflare Pages with Wrangler

First login once:

```bash
npx wrangler login
```

Then:

```bash
npm install
npm run build
npx wrangler pages deploy dist --project-name sujatha-portfolio
```

Or simply:

```bash
npm run deploy
```

## Cloudflare Pages via GitHub

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`
- Node version: `22`

`/writing` redirects permanently to `/writing.html` for backwards compatibility.
