import { spawnSync } from "node:child_process";
import { rm } from "node:fs/promises";

/**
 * Downscale an image to `cap` px on its longest side and convert it to WebP, to
 * keep the shareable zip small. WebP at ~q72 is ~90% smaller than the full-res
 * JPEGs Commons serves and works from file:// in every modern browser.
 *
 * macOS `sips` can't actually emit WebP (exits 13), so we downscale with `sips`
 * (always present) and encode with `cwebp` (brew install webp). If `cwebp` is
 * missing we still return the downscaled original — smaller, just not WebP.
 *
 * Returns the absolute path of the file the caller should keep (.webp on full
 * success, otherwise the downscaled original), or null if even downscaling fails.
 */
export async function downscaleToWebp(srcAbs: string, cap: number): Promise<string | null> {
  // 1) Downscale in place (longest side -> cap px).
  const down = spawnSync("sips", ["-Z", String(cap), srcAbs, "--out", srcAbs], { stdio: "ignore" });
  if (down.status !== 0) return null;

  // 2) Encode to WebP with cwebp.
  const outAbs = srcAbs.replace(/\.[^.]+$/, ".webp");
  const enc = spawnSync("cwebp", ["-quiet", "-q", "72", srcAbs, "-o", outAbs], { stdio: "ignore" });
  if (enc.status !== 0) return srcAbs; // cwebp unavailable; keep downscaled original

  if (outAbs !== srcAbs) await rm(srcAbs, { force: true }); // drop the JPEG
  return outAbs;
}
