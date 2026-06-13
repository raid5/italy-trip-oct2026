import { spawnSync } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { download, sleep } from "../http.js";
import { downscaleToWebp } from "../image.js";
import type { MapBase } from "../schema.js";

const TILE = 256;

// Web-Mercator: lon/lat -> absolute world-pixel coordinates at zoom z.
function lonToPx(lon: number, z: number): number {
  return ((lon + 180) / 360) * Math.pow(2, z) * TILE;
}
function latToPx(lat: number, z: number): number {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * Math.pow(2, z) * TILE;
}

interface LatLon {
  lat?: number;
  lon?: number;
}

/**
 * Render a real OpenStreetMap basemap covering all coord-bearing POIs and save
 * it (as WebP) into the site, returning the Web-Mercator window so the
 * front-end can place pins on it. Tiles are fetched once at build time and
 * stitched with ImageMagick — the result is fully offline. Returns undefined if
 * fewer than one POI has coordinates or the tooling fails.
 *
 * `© OpenStreetMap contributors` (ODbL) — attribution is carried in MapBase and
 * must be shown wherever the map appears.
 */
export async function buildStaticMap(
  pois: LatLon[],
  citySlug: string,
  siteRoot: string,
  tmpRoot: string,
  W = 1600,
  H = 1200
): Promise<MapBase | undefined> {
  const pts = pois.filter(
    (p): p is { lat: number; lon: number } => typeof p.lat === "number" && typeof p.lon === "number"
  );
  if (pts.length < 1) return undefined;

  const lats = pts.map((p) => p.lat);
  const lons = pts.map((p) => p.lon);
  let minLat = Math.min(...lats), maxLat = Math.max(...lats);
  let minLon = Math.min(...lons), maxLon = Math.max(...lons);
  // Pad the bbox so pins aren't jammed against the frame; floor for a lone point.
  const padLat = (maxLat - minLat) * 0.18 || 0.004;
  const padLon = (maxLon - minLon) * 0.18 || 0.004;
  minLat -= padLat; maxLat += padLat; minLon -= padLon; maxLon += padLon;
  const centerLat = (minLat + maxLat) / 2;
  const centerLon = (minLon + maxLon) / 2;

  // Largest zoom at which the padded bbox still fits inside ~88% of the frame.
  let z = 16;
  for (; z >= 2; z--) {
    const spanX = Math.abs(lonToPx(maxLon, z) - lonToPx(minLon, z));
    const spanY = Math.abs(latToPx(minLat, z) - latToPx(maxLat, z));
    if (spanX <= W * 0.88 && spanY <= H * 0.88) break;
  }

  const cx = lonToPx(centerLon, z);
  const cy = latToPx(centerLat, z);
  const worldLeft = Math.round(cx - W / 2);
  const worldTop = Math.round(cy - H / 2);
  const n = Math.pow(2, z);
  const tx0 = Math.max(0, Math.floor(worldLeft / TILE));
  const tx1 = Math.min(n - 1, Math.floor((worldLeft + W - 1) / TILE));
  const ty0 = Math.max(0, Math.floor(worldTop / TILE));
  const ty1 = Math.min(n - 1, Math.floor((worldTop + H - 1) / TILE));
  const cols = tx1 - tx0 + 1;
  const rows = ty1 - ty0 + 1;

  const tmpDir = join(tmpRoot, `tiles-${citySlug}`);
  await mkdir(tmpDir, { recursive: true });

  // Fetch tiles in row-major order (montage consumes them that way).
  const tileFiles: string[] = [];
  for (let ty = ty0; ty <= ty1; ty++) {
    for (let tx = tx0; tx <= tx1; tx++) {
      const tf = join(tmpDir, `t_${z}_${tx}_${ty}.png`);
      const url = `https://tile.openstreetmap.org/${z}/${tx}/${ty}.png`;
      try {
        await download(url, tf);
      } catch {
        // Fall back to a sea-toned blank so the grid stays intact.
        spawnSync("magick", ["-size", "256x256", "xc:#dfe7ea", tf], { stdio: "ignore" });
      }
      tileFiles.push(tf);
      await sleep(120); // be polite to the OSM tile server
    }
  }

  const stitched = join(tmpDir, "stitched.png");
  const montage = spawnSync(
    "montage",
    [...tileFiles, "-tile", `${cols}x${rows}`, "-geometry", "256x256+0+0", "-background", "#dfe7ea", stitched],
    { stdio: "ignore" }
  );
  if (montage.status !== 0) {
    await rm(tmpDir, { recursive: true, force: true });
    return undefined;
  }

  const offX = worldLeft - tx0 * TILE;
  const offY = worldTop - ty0 * TILE;
  const rel = `assets/maps/${citySlug}.png`;
  const abs = join(siteRoot, rel);
  await mkdir(dirname(abs), { recursive: true });
  const crop = spawnSync("magick", [stitched, "-crop", `${W}x${H}+${offX}+${offY}`, "+repage", abs], {
    stdio: "ignore",
  });
  await rm(tmpDir, { recursive: true, force: true });
  if (crop.status !== 0) return undefined;

  let finalRel = rel;
  const optimized = await downscaleToWebp(abs, Math.max(W, H));
  if (optimized && optimized.endsWith(".webp")) finalRel = rel.replace(/\.png$/, ".webp");

  return {
    file: finalRel,
    z,
    worldLeft,
    worldTop,
    w: W,
    h: H,
    attribution: "© OpenStreetMap contributors",
  };
}
