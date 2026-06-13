/**
 * Throwaway regen script: rebuild ONLY the basemaps for the starter cities,
 * without re-fetching photos/weather. Reads data/<slug>.json, re-renders the
 * OSM basemap via buildStaticMap, replaces city.map, writes the JSON back.
 *
 * Run: pnpm tsx src/remap.ts   (then `pnpm build` to refresh site/js/data.js)
 */
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFile, writeFile, rm } from "node:fs/promises";

import { buildStaticMap } from "./sources/staticmap.js";
import type { City } from "./schema.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = join(ROOT, "data");
const SITE_DIR = join(ROOT, "site");
const DIST_DIR = join(ROOT, "dist");
const TMP = join(DIST_DIR, ".maptmp");

const SLUGS = ["rome", "naples", "positano"];

async function main() {
  for (const slug of SLUGS) {
    const file = join(DATA_DIR, `${slug}.json`);
    const city = JSON.parse(await readFile(file, "utf8")) as City;
    console.log(`› remapping ${slug} (${city.pois.length} pois)…`);
    const map = await buildStaticMap(city.pois, slug, SITE_DIR, TMP);
    if (!map) {
      console.error(`  basemap failed for ${slug}; leaving map unchanged`);
      continue;
    }
    city.map = map;
    await writeFile(file, JSON.stringify(city, null, 2), "utf8");
    console.log(`  z${map.z} ${map.w}x${map.h} → ${map.file}`);
  }
  await rm(TMP, { recursive: true, force: true });
  console.log("Done. Run `pnpm build` to refresh site/js/data.js.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
