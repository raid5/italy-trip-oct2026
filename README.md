# Andiamo — Italy Trip Guide (Early October 2026)

An interactive travel guide for a Southern Italy trip, **hosted on GitHub Pages**:

**→ https://raid5.github.io/italy-trip-oct2026/**

Just open the link — no install, no server. The dates and destinations are proposed
ideas to react to, not a booked itinerary.

## For me (building / expanding it)

```bash
pnpm install

# Fetch + curate one city (real content + real photos):
pnpm city "Rome"

pnpm build      # render data/*.json -> site/js/data.js

# Or (re)generate every known city end-to-end, then build:
pnpm all
```

Push to `main` and GitHub Pages redeploys the `site/` folder automatically.

Add a new city by adding an entry to [`src/curated.ts`](src/curated.ts) (Wikivoyage +
Wikipedia titles, region, tagline, transport/food notes, curated POIs with pinned
Commons `File:` photos), add its slug to `CITY_ORDER` in
[`src/generate.ts`](src/generate.ts) and a fallback coordinate in
[`src/cli.ts`](src/cli.ts), then `pnpm city "<Name>"` and `pnpm build`.

### How it works

- **Generator** (`src/`, Node/TypeScript via `tsx`) pulls real, openly-licensed data:
  - **Wikivoyage** → things to do (See / Do / Eat / Drink), with coordinates
  - **Wikipedia** → city intro & coordinates
  - **Wikimedia Commons** → real photos, downloaded with author + license captured
  - **Open-Meteo** → early-October weather normals (+ sea temp for coastal towns)
- Each city is saved as a human-editable `data/<slug>.json` — tweak/reorder/trim, then
  re-run `pnpm build`.
- The **site** (`site/`) is plain HTML/CSS/JS. It reads a generated `js/data.js`
  (`window.__ITALY__ = {…}`) instead of `fetch()`, so it works from `file://` too.

### Themes

Two built-in looks, switchable live (choice saved per-browser): **Vintage Poster** and
**Field Guide**.

### Attribution

All photos are CC / public-domain images from Wikimedia Commons; text is from Wikivoyage &
Wikipedia (CC BY-SA). Full per-photo credits are on the in-site **Photo credits** page.
