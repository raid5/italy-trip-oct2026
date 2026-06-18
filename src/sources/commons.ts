import { join } from "node:path";
import { getJSON, download } from "../http.js";
import { downscaleToWebp } from "../image.js";
import type { Photo } from "../schema.js";

interface CommonsResp {
  query?: {
    pages?: Record<
      string,
      {
        title: string;
        imageinfo?: Array<{
          thumburl?: string;
          url?: string;
          descriptionurl?: string;
          mime?: string;
          width?: number;
          height?: number;
          extmetadata?: Record<string, { value?: string }>;
        }>;
      }
    >;
  };
}

function cleanHtml(s: string | undefined): string {
  if (!s) return "";
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const OK_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

// Filenames that signal a non-photographic or off-subject image: maps, logos,
// diagrams, signage, artwork-of, documents. Heavily penalized in ranking.
const JUNK_IMAGE =
  /\b(map|mappa|plan|planimetr|diagram|schema|logo|seal|sigillo|coat[_ ]?of[_ ]?arms|stemma|blason|flag|bandiera|icon|symbol|sign|insegna|cartello|plaque|targa|lapide|menu|ticket|biglietto|graph|chart|svg|drawing|disegno|sketch|engraving|incision|manuscript|document|stamp|francobollo|coin|moneta|banknote|gpx|panoramica\.png|painting|dipinto|watercolo|acquerell|aquarell|lithograph|litografia|etching|acquaforte|veduta|gravure)\b/i;

function fieldText(meta: Record<string, { value?: string }>, key: string): string {
  return cleanHtml(meta[key]?.value).toLowerCase();
}

type ImageInfo = NonNullable<
  NonNullable<CommonsResp["query"]>["pages"]
>[string]["imageinfo"] extends Array<infer T> | undefined
  ? T
  : never;

// Rank a candidate image for how well it represents `query` as an epic photo.
function photoScore(title: string, info: ImageInfo, query: string): number {
  const meta = info.extmetadata ?? {};
  const hay = `${title} ${fieldText(meta, "ObjectName")} ${fieldText(meta, "Categories")}`.toLowerCase();
  const w = info.width ?? 0;
  const h = info.height ?? 0;

  let s = 0;
  // Resolution: bigger originals tend to be the "real" hero-grade shots.
  s += Math.min(w / 1000, 5);
  // Landscape orientation suits heroes and cards.
  if (w && h) s += w >= h ? 2 : -1;
  // Subject relevance: reward query words appearing in the filename/metadata.
  for (const term of query.toLowerCase().split(/\s+/)) {
    if (term.length >= 4 && hay.includes(term)) s += 1.5;
  }
  // Strongly demote maps, logos, signage, artwork-of, documents.
  if (JUNK_IMAGE.test(title)) s -= 8;
  // Mild demotion for night shots / interiors when a landmark exterior is wanted.
  if (/\bnight\b|notturn/i.test(hay)) s -= 0.5;
  return s;
}

/**
 * Search Commons for the best photo matching `query`, download a ~1200px copy
 * into the city's photo dir, and return Photo metadata (with attribution).
 * Ranks candidates by resolution, orientation, subject relevance, and a junk
 * penalty (maps/logos/signage) rather than taking the first search hit.
 * Returns undefined if nothing suitable is found.
 */
export async function findPhoto(
  query: string,
  citySlug: string,
  baseName: string,
  siteRoot: string,
  width = 1200
): Promise<Photo | undefined> {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json" +
    "&generator=search&gsrnamespace=6&gsrlimit=24" +
    `&gsrsearch=${encodeURIComponent(query + " -filetype:svg")}` +
    "&prop=imageinfo&iiprop=url|extmetadata|mime|size" +
    `&iiurlwidth=${width}`;

  let data: CommonsResp;
  try {
    data = await getJSON<CommonsResp>(url);
  } catch (e) {
    console.warn(`    ! photo search failed for "${query}": ${(e as Error).message}`);
    return undefined;
  }
  const pages = Object.values(data.query?.pages ?? {});
  const ranked = pages
    .filter((page) => {
      const info = page.imageinfo?.[0];
      if (!info?.thumburl) return false;
      if (info.mime && !OK_MIME.has(info.mime)) return false;
      if ((info.width ?? 0) < 800) return false; // skip tiny/icon images
      return true;
    })
    .sort((a, b) => photoScore(b.title, b.imageinfo![0], query) - photoScore(a.title, a.imageinfo![0], query));

  for (const page of ranked) {
    const photo = await downloadAndDescribe(page.imageinfo![0], page.title, citySlug, baseName, siteRoot, width);
    if (photo) return photo;
  }
  return undefined;
}

/**
 * Fetch one specific Commons file by its "File:…" title, bypassing search.
 * Use for marquee sights where keyword search returns the wrong subject
 * (an old engraving, a look-alike, a map). Returns undefined if it fails.
 */
export async function findPhotoByFile(
  fileTitle: string,
  citySlug: string,
  baseName: string,
  siteRoot: string,
  width = 1200
): Promise<Photo | undefined> {
  const title = fileTitle.startsWith("File:") ? fileTitle : `File:${fileTitle}`;
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json" +
    `&titles=${encodeURIComponent(title)}` +
    "&prop=imageinfo&iiprop=url|extmetadata|mime|size" +
    `&iiurlwidth=${width}`;

  let data: CommonsResp;
  try {
    data = await getJSON<CommonsResp>(url);
  } catch (e) {
    console.warn(`    ! photo fetch failed for "${title}": ${(e as Error).message}`);
    return undefined;
  }
  const page = Object.values(data.query?.pages ?? {})[0];
  const info = page?.imageinfo?.[0];
  if (!info?.thumburl) {
    console.warn(`    ! pinned file not found: "${title}"`);
    return undefined;
  }
  return downloadAndDescribe(info, page.title, citySlug, baseName, siteRoot, width);
}

// Download a chosen Commons image, optimize it, and build Photo attribution.
async function downloadAndDescribe(
  info: ImageInfo,
  pageTitle: string,
  citySlug: string,
  baseName: string,
  siteRoot: string,
  width: number
): Promise<Photo | undefined> {
  if (!info?.thumburl) return undefined;
  const meta = info.extmetadata ?? {};
  const author = cleanHtml(meta.Artist?.value) || "Unknown";
  const license =
    cleanHtml(meta.LicenseShortName?.value) ||
    cleanHtml(meta.License?.value) ||
    "see source";
  const licenseUrl = cleanHtml(meta.LicenseUrl?.value);
  const ext = info.mime === "image/png" ? "png" : info.mime === "image/webp" ? "webp" : "jpg";
  let rel = `assets/photos/${citySlug}/${slugify(baseName)}.${ext}`;
  let abs = join(siteRoot, rel);

  try {
    const bytes = await download(info.thumburl, abs);
    if (bytes < 3000) return undefined; // probably an error/placeholder
  } catch {
    return undefined;
  }

  // Downscale + convert to WebP to keep page weight low. The helper
  // returns a .webp path on success, or the downscaled original otherwise.
  const optimized = await downscaleToWebp(abs, width);
  if (optimized) {
    abs = optimized;
    if (optimized.endsWith(".webp")) rel = rel.replace(/\.[^.]+$/, ".webp");
  }

  return {
    file: rel,
    author,
    license,
    licenseUrl,
    sourceUrl: info.descriptionurl || pageTitle,
    credit: `${author} — ${license} (Wikimedia Commons)`,
  };
}
