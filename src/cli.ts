import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { writeFile, readFile, mkdir, access } from "node:fs/promises";

import { CITY_CONFIGS } from "./curated.js";
import { fetchCityBasics } from "./sources/wikipedia.js";
import { fetchCityListings } from "./sources/wikivoyage.js";
import { fetchOctoberWeather } from "./sources/weather.js";
import { findPhoto, findPhotoByFile } from "./sources/commons.js";
import { buildStaticMap } from "./sources/staticmap.js";
import { sunTimes } from "./sun.js";
import { transform } from "./transform.js";
import { buildSiteData, writeDataBundle } from "./generate.js";
import type { City } from "./schema.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = join(ROOT, "data");
const SITE_DIR = join(ROOT, "site");
const DIST_DIR = join(ROOT, "dist");

// Fallback coordinates if Wikipedia summary lacks them.
const FALLBACK_COORDS: Record<string, [number, number]> = {
  rome: [41.9028, 12.4964],
  naples: [40.8518, 14.2681],
  positano: [40.6281, 14.4847],
  sorrento: [40.626, 14.376],
  amalfi: [40.634, 14.602],
  pompeii: [40.7497, 14.4869],
  procida: [40.7585, 14.0244],
  tropea: [38.6776, 15.8986],
  bagnara: [38.287, 15.808],
  scilla: [38.253, 15.715],
  catania: [37.5023, 15.0873],
  capri: [40.5508, 14.2425],
  cagliari: [39.2238, 9.1217],
  alghero: [40.5589, 8.3155],
  villasimius: [39.1408, 9.5219],
  olbia: [41.05, 9.42],
};

// How many photos to fetch per category (keeps the page weight sensible).
const PHOTOS_PER_CATEGORY = 4;

function log(...a: unknown[]) {
  console.log("›", ...a);
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

// Run async thunks with a bounded concurrency limit. The http layer already
// backs off on 429/503, so a small pool keeps us polite to Wikimedia while
// fetching a city's photos in parallel instead of one-at-a-time.
async function runPool(tasks: Array<() => Promise<unknown>>, limit: number): Promise<void> {
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, async () => {
    while (true) {
      const i = next++;
      if (i >= tasks.length) break;
      await tasks[i]();
    }
  });
  await Promise.all(workers);
}

async function cityCommand(nameArg: string) {
  const key = nameArg.toLowerCase().trim();
  const cfg = CITY_CONFIGS[key];
  if (!cfg) {
    console.error(
      `Unknown city "${nameArg}". Known: ${Object.keys(CITY_CONFIGS).join(", ")}.\n` +
        "Add an entry to src/curated.ts to support a new city."
    );
    process.exit(1);
  }

  log(`Fetching ${cfg.name}…`);

  const basics = await fetchCityBasics(cfg.wikipedia).catch((e) => {
    log(`  wikipedia summary failed: ${e.message}`);
    return { intro: "", description: "", lat: undefined, lon: undefined };
  });

  const [flat, flon] = FALLBACK_COORDS[cfg.slug] ?? [41.9, 12.5];
  const lat = basics.lat ?? flat;
  const lon = basics.lon ?? flon;

  // Wikivoyage only scrapes supplementary "fill" sights; some small towns
  // (e.g. Bagnara, Scilla) have no English Wikivoyage article at all. A miss
  // must not abort a fully hand-curated city — fall back to no listings.
  let listings: Awaited<ReturnType<typeof fetchCityListings>>["listings"] = [];
  let lead = "";
  try {
    ({ listings, lead } = await fetchCityListings(cfg.wikivoyage));
  } catch (e) {
    log(`  wikivoyage unavailable (${(e as Error).message}); using curated POIs only`);
  }
  log(`  ${listings.length} listings from Wikivoyage (incl. district subpages)`);

  let weather = await fetchOctoberWeather(lat, lon, cfg.coastal).catch((e) => {
    log(`  weather failed: ${e.message}`);
    return undefined;
  });
  // Open-Meteo is occasionally unreachable. A transient fetch failure must not
  // wipe good climate data we already have on disk — reuse the prior city's
  // weather block rather than shipping a site with empty weather tables.
  if (!weather) {
    const prior = await readFile(join(DATA_DIR, `${cfg.slug}.json`), "utf8")
      .then((t) => JSON.parse(t) as City)
      .catch(() => undefined);
    if (prior?.weather) {
      weather = prior.weather;
      log("  reused prior weather from data/" + cfg.slug + ".json");
    }
  }
  const sun = sunTimes(lat, lon);

  const city: City = transform(cfg, basics, listings, lead, weather, sun, lat, lon);
  log(`  ${city.pois.length} curated POIs across ${city.categories.length} categories`);

  // Per-POI Commons overrides (curated). A pinned File: wins; else a tuned
  // search query; else the default "<name> <city>" search.
  const photoQueries = new Map<string, string>();
  const photoFiles = new Map<string, string>();
  for (const c of cfg.curatedPois ?? []) {
    if (c.photoQuery) photoQueries.set(c.name, c.photoQuery);
    if (c.photoFile) photoFiles.set(c.name, c.photoFile);
  }

  // Decide which POIs get a photo (top N per category), preserving order. This
  // selection is deterministic and independent of fetch order, so the actual
  // downloads can run in parallel.
  const counts: Record<string, number> = {};
  const toFetch = city.pois.filter((poi) => {
    counts[poi.category] = counts[poi.category] ?? 0;
    if (counts[poi.category] >= PHOTOS_PER_CATEGORY) return false;
    counts[poi.category]++;
    return true;
  });

  // Hero photo + POI photos + OSM basemap all run concurrently through a small
  // pool. The http layer backs off on 429/503, so we no longer hand-throttle
  // with per-photo sleeps. A hand-tuned heroQuery beats the generic search,
  // which can surface signage/maps instead of the landmark.
  const heroQuery = cfg.heroQuery ?? `${cfg.name} ${cfg.region} Italy`;
  log(`  fetching hero + ${toFetch.length} POI photos + basemap…`);

  const tasks: Array<() => Promise<unknown>> = [
    async () => {
      city.hero = cfg.heroFile
        ? await findPhotoByFile(cfg.heroFile, cfg.slug, `${cfg.slug}-hero`, SITE_DIR, 1200)
        : await findPhoto(heroQuery, cfg.slug, `${cfg.slug}-hero`, SITE_DIR, 1200);
    },
    // Real OSM basemap for the orientation minimap (stitched offline at build).
    async () => {
      city.map = await buildStaticMap(city.pois, cfg.slug, SITE_DIR, join(DIST_DIR, ".maptmp")).catch((e) => {
        log(`  basemap failed: ${e.message}`);
        return undefined;
      });
    },
    ...toFetch.map((poi) => async () => {
      const pinned = photoFiles.get(poi.name);
      const query = photoQueries.get(poi.name) ?? `${poi.name} ${cfg.name}`;
      const photo = pinned
        ? await findPhotoByFile(pinned, cfg.slug, poi.name, SITE_DIR, 800)
        : await findPhoto(query, cfg.slug, poi.name, SITE_DIR, 800);
      if (photo) poi.photo = photo;
    }),
  ];

  await runPool(tasks, 6);

  const fetched = toFetch.filter((poi) => poi.photo).length;
  log(
    `  downloaded ${fetched} POI photos${city.hero ? " + hero" : ""}` +
      `${city.map ? ` + basemap z${city.map.z}` : ""}`
  );

  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(join(DATA_DIR, `${cfg.slug}.json`), JSON.stringify(city, null, 2), "utf8");
  log(`  wrote data/${cfg.slug}.json`);
  log("Done. Run `pnpm build` to render into the site.");
}

async function buildCommand() {
  log("Building site data bundle…");
  const data = await buildSiteData(DATA_DIR);
  await writeDataBundle(data, join(SITE_DIR, "js"));
  log(`Wrote site/js/data.js (${data.cities.length} cities: ${data.cities.map((c) => c.name).join(", ")}).`);
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  switch (cmd) {
    case "city": {
      const name = rest.join(" ").trim();
      if (!name) {
        console.error('Usage: pnpm city "Rome"');
        process.exit(1);
      }
      await cityCommand(name);
      break;
    }
    case "build":
      await buildCommand();
      break;
    case "all": {
      // Ingest only cities that don't have data yet, then build. Existing
      // data/<slug>.json files are never clobbered — they're hand-tweakable,
      // so re-running `all` is safe and only fills in what's missing. To
      // refresh ONE existing city, use `pnpm city "Name"`. Pass `--force` to
      // re-fetch every city from scratch.
      const force = rest.includes("--force");
      for (const key of Object.keys(CITY_CONFIGS)) {
        const cfg = CITY_CONFIGS[key];
        if (!force && (await fileExists(join(DATA_DIR, `${cfg.slug}.json`)))) {
          log(`skipping ${cfg.name} (already ingested — \`pnpm city "${cfg.name}"\` to refresh)`);
          continue;
        }
        await cityCommand(key);
      }
      await buildCommand();
      break;
    }
    default:
      console.error(
        "Usage:\n" +
          '  pnpm city "Rome"     fetch + curate one city (creates or refreshes it)\n' +
          "  pnpm build           render data/*.json into the site\n" +
          "  pnpm all             ingest any cities missing data, then build (never clobbers existing)\n" +
          "  pnpm all --force     re-fetch every known city from scratch, then build"
      );
      process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
