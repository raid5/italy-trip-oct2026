import type { CityConfig } from "./curated.js";
import type { CityBasics } from "./sources/wikipedia.js";
import type { RawListing } from "./sources/wikivoyage.js";
import type { City, POI, Weather, Sun } from "./schema.js";
import { categorize, CATEGORY_ORDER, CATEGORY_LABELS } from "./categorize.js";
import { slugify } from "./sources/commons.js";

// Show only what a city is best known for — a tight, top-N list — plus any
// hand-picked hidden gems (kept separately, not counted against the cap).
const KNOWN_FOR_CAP = 10;
// Specific food/drink venues are intentionally left out for now; a city's food
// identity is conveyed by the foodNotes summaries instead.
const POI_CATEGORIES = ["history", "art", "culture", "coastal", "outdoors"] as const;
// Coast, beaches, and viewpoints get a small ranking nudge so they're called out.
const ALWAYS_SHOW = new Set<string>(["coastal", "outdoors"]);

function normName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function score(l: RawListing): number {
  let s = 0;
  if (l.content) s += 2 + Math.min(l.content.length / 200, 4);
  if (l.lat != null && l.lon != null) s += 1;
  if (l.section && /see|do/i.test(l.section)) s += 0.5;
  return s;
}

export function transform(
  cfg: CityConfig,
  basics: CityBasics,
  listings: RawListing[],
  lead: string,
  weather: Weather | undefined,
  sun: Sun | undefined,
  lat: number,
  lon: number
): City {
  // Dedupe by normalized name, keep the higher-scoring entry.
  const byName = new Map<string, RawListing>();
  for (const l of listings) {
    const key = normName(l.name);
    if (!key) continue;
    const prev = byName.get(key);
    if (!prev || score(l) > score(prev)) byName.set(key, l);
  }

  // Hand-authored marquee POIs (forced category, always kept). hiddenGem ones
  // are surfaced separately as local tips and don't count against the cap.
  const curatedPois: POI[] = (cfg.curatedPois ?? []).map((c) => ({
    id: `${cfg.slug}-${slugify(c.name)}`,
    name: c.name,
    category: c.category,
    blurb: c.blurb,
    lat: c.lat,
    lon: c.lon,
    hiddenGem: c.hiddenGem,
  }));
  const curatedNames = new Set(curatedPois.map((p) => normName(p.name)));

  // Categorize scraped listings, keeping only the "known for" categories and
  // skipping any that duplicate a curated POI (the hand-authored copy wins).
  const buckets = new Map<string, RawListing[]>();
  for (const l of byName.values()) {
    if (curatedNames.has(normName(l.name))) continue;
    const cat = categorize(l, cfg.coastal);
    if (!(POI_CATEGORIES as readonly string[]).includes(cat)) continue;
    (buckets.get(cat) ?? buckets.set(cat, []).get(cat)!).push(l);
  }

  // Scraped sight candidates. Coast/beaches/views get a small score nudge so
  // they're still called out, but nothing is force-filled to a quota.
  const candidates: POI[] = [];
  for (const cat of POI_CATEGORIES) {
    for (const l of buckets.get(cat) ?? []) {
      candidates.push({
        id: `${cfg.slug}-${slugify(l.name)}`,
        name: l.name,
        category: cat,
        blurb: l.content || "",
        lat: l.lat,
        lon: l.lon,
      });
    }
  }
  const scoreOf = (p: POI): number =>
    score(byName.get(normName(p.name))!) + (ALWAYS_SHOW.has(p.category) ? 1.5 : 0);
  candidates.sort((a, b) => scoreOf(b) - scoreOf(a));

  // Curated marquee items always lead; valid scraped sights fill the rest up to
  // the cap. Hidden gems are shown after, as local tips.
  const curatedKnown = curatedPois.filter((p) => !p.hiddenGem);
  const curatedGems = curatedPois.filter((p) => p.hiddenGem);
  const room = Math.max(0, KNOWN_FOR_CAP - curatedKnown.length);
  const pois: POI[] = [...curatedKnown, ...candidates.slice(0, room), ...curatedGems];

  const categories = CATEGORY_ORDER.filter((c) => pois.some((p) => p.category === c));

  const intro =
    basics.intro && basics.intro.length > 80 ? basics.intro : lead || basics.intro;

  return {
    slug: cfg.slug,
    name: cfg.name,
    region: cfg.region,
    tagline: cfg.tagline,
    intro,
    lat,
    lon,
    weather,
    sun,
    pois,
    categories: [...categories],
    itinerary: [],
    transport: cfg.transport,
    foodNotes: cfg.foodNotes,
    beachNotes: cfg.beachNotes,
    generatedFrom: "Wikivoyage & Wikipedia (CC BY-SA); photos via Wikimedia Commons",
  };
}

export { CATEGORY_LABELS };
