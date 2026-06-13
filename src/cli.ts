import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { writeFile, readFile, mkdir, rm } from "node:fs/promises";
import { spawn } from "node:child_process";

import { CITY_CONFIGS } from "./curated.js";
import { fetchCityBasics } from "./sources/wikipedia.js";
import { fetchCityListings } from "./sources/wikivoyage.js";
import { fetchOctoberWeather } from "./sources/weather.js";
import { findPhoto, findPhotoByFile } from "./sources/commons.js";
import { buildStaticMap } from "./sources/staticmap.js";
import { sunTimes } from "./sun.js";
import { transform } from "./transform.js";
import { buildSiteData, writeDataBundle } from "./generate.js";
import { sleep } from "./http.js";
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
};

// How many photos to fetch per category (keeps the zip a sensible size).
const PHOTOS_PER_CATEGORY = 4;

function log(...a: unknown[]) {
  console.log("›", ...a);
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

  const { listings, lead } = await fetchCityListings(cfg.wikivoyage);
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

  // Hero photo. A hand-tuned heroQuery beats the generic "<city> <region>"
  // search, which can surface signage/maps instead of the landmark.
  log("  fetching hero photo…");
  const heroQuery = cfg.heroQuery ?? `${cfg.name} ${cfg.region} Italy`;
  city.hero = cfg.heroFile
    ? await findPhotoByFile(cfg.heroFile, cfg.slug, `${cfg.slug}-hero`, SITE_DIR, 1200)
    : await findPhoto(heroQuery, cfg.slug, `${cfg.slug}-hero`, SITE_DIR, 1200);
  await sleep(250);

  // Per-POI Commons overrides (curated). A pinned File: wins; else a tuned
  // search query; else the default "<name> <city>" search.
  const photoQueries = new Map<string, string>();
  const photoFiles = new Map<string, string>();
  for (const c of cfg.curatedPois ?? []) {
    if (c.photoQuery) photoQueries.set(c.name, c.photoQuery);
    if (c.photoFile) photoFiles.set(c.name, c.photoFile);
  }

  // POI photos: top N per category.
  const counts: Record<string, number> = {};
  let fetched = 0;
  for (const poi of city.pois) {
    counts[poi.category] = counts[poi.category] ?? 0;
    if (counts[poi.category] >= PHOTOS_PER_CATEGORY) continue;
    counts[poi.category]++;
    const pinned = photoFiles.get(poi.name);
    const query = photoQueries.get(poi.name) ?? `${poi.name} ${cfg.name}`;
    const photo = pinned
      ? await findPhotoByFile(pinned, cfg.slug, poi.name, SITE_DIR, 800)
      : await findPhoto(query, cfg.slug, poi.name, SITE_DIR, 800);
    if (photo) {
      poi.photo = photo;
      fetched++;
    }
    await sleep(200);
  }
  log(`  downloaded ${fetched} POI photos${city.hero ? " + hero" : ""}`);

  // Real OSM basemap for the orientation minimap (stitched offline at build).
  log("  rendering basemap…");
  city.map = await buildStaticMap(city.pois, cfg.slug, SITE_DIR, join(DIST_DIR, ".maptmp")).catch((e) => {
    log(`  basemap failed: ${e.message}`);
    return undefined;
  });
  if (city.map) log(`  basemap z${city.map.z} → ${city.map.file}`);

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

async function packageCommand(): Promise<void> {
  await mkdir(DIST_DIR, { recursive: true });
  const zipPath = join(DIST_DIR, "italy-trip-oct2026.zip");
  await rm(zipPath, { force: true }); // start fresh; `zip` updates in place otherwise
  log(`Packaging site/ → ${zipPath}`);
  await new Promise<void>((resolve, reject) => {
    // -r recursive, -X strip extra attrs, -q quiet, -x exclude macOS cruft.
    const child = spawn(
      "zip",
      ["-r", "-X", "-q", zipPath, ".", "-x", ".DS_Store", "-x", "*/.DS_Store"],
      { cwd: SITE_DIR }
    );
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`zip exited ${code}`));
    });
  });
  log("Packaged. This zip is what you text/email — recipients unzip and open index.html.");
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
    case "package":
      await packageCommand();
      break;
    case "all": {
      // Convenience: (re)generate the three starter cities, build, and package.
      for (const c of ["Rome", "Naples", "Positano"]) await cityCommand(c);
      await buildCommand();
      await packageCommand();
      break;
    }
    default:
      console.error(
        "Usage:\n  pnpm city \"Rome\"   fetch + curate one city\n  pnpm build          render data/*.json into the site\n  pnpm package        zip the site for sharing\n  pnpm all            do all of the above for the 3 starter cities"
      );
      process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
