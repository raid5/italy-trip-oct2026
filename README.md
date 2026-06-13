# Andiamo — Italy Trip Guide (Early October 2026)

An interactive, **fully offline** travel guide for Rome, Naples & Positano. Built to be
**zipped and shared**: recipients unzip and double-click `index.html` — no install, no
server, no internet required.

## For people I share it with

1. Unzip `italy-trip-oct2026.zip`.
2. Open the `site` folder and double-click **`index.html`**.
3. Browse cities, switch the look with the **theme buttons** (top-right), and tap the
   **♥** on places you like — your favorites are saved in your browser.

(The little "Map ↗" links open Google Maps and need internet; everything else works offline.)

## For me (building / expanding it)

```bash
pnpm install

# Fetch + curate one city (real content + real photos):
pnpm city "Rome"
pnpm city "Naples"
pnpm city "Positano"

pnpm build      # render data/*.json -> site/js/data.js
pnpm package    # -> dist/italy-trip-oct2026.zip  (this is what you share)

# Or do all three starter cities end-to-end:
pnpm all
```

Add a new city by adding an entry to [`src/curated.ts`](src/curated.ts) (Wikivoyage +
Wikipedia titles, region, tagline, transport/food notes), then `pnpm city "<Name>"`.

### How it works

- **Generator** (`src/`, Node/TypeScript via `tsx`) pulls real, openly-licensed data:
  - **Wikivoyage** → things to do (See / Do / Eat / Drink), with coordinates
  - **Wikipedia** → city intro & coordinates
  - **Wikimedia Commons** → real photos, downloaded with author + license captured
  - **Open-Meteo** → early-October weather normals (+ sea temp for coastal towns)
- Each city is saved as a human-editable `data/<slug>.json` — tweak/reorder/trim, then
  re-run `pnpm build`.
- The **site** (`site/`) is plain HTML/CSS/JS. It reads a generated `js/data.js`
  (`window.__ITALY__ = {…}`) instead of `fetch()`, so it works from `file://`.

### Themes

Four built-in looks, switchable live (choice saved per-browser): **Coastal Mediterranean**,
**Editorial Magazine**, **Vintage Poster**, **Modern Dark**.

### Attribution

All photos are CC / public-domain images from Wikimedia Commons; text is from Wikivoyage &
Wikipedia (CC BY-SA). Full per-photo credits are on the in-site **Photo credits** page.
