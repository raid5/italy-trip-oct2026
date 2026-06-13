import { getJSON } from "../http.js";

export interface RawListing {
  type: string; // see | do | eat | drink | buy | sleep | listing | marker | go
  name: string;
  content: string;
  lat?: number;
  lon?: number;
  section: string; // nearest == Heading == above the listing
}

interface ParseResp {
  parse?: { wikitext?: { "*": string } };
}

interface AllPagesResp {
  query?: { allpages?: Array<{ title: string }> };
}

/** Fetch the raw wikitext for a Wikivoyage page title. */
async function fetchWikitext(title: string): Promise<string> {
  const url =
    "https://en.wikivoyage.org/w/api.php?action=parse&prop=wikitext&format=json&redirects=1&page=" +
    encodeURIComponent(title);
  const data = await getJSON<ParseResp>(url);
  const text = data.parse?.wikitext?.["*"];
  if (!text) throw new Error(`Wikivoyage: no wikitext for "${title}"`);
  return text;
}

/** District subpages for "huge city" articles, e.g. Rome/Colosseo. */
async function fetchSubpageTitles(title: string): Promise<string[]> {
  const url =
    "https://en.wikivoyage.org/w/api.php?action=query&list=allpages&format=json" +
    `&apprefix=${encodeURIComponent(title + "/")}&apnamespace=0&aplimit=30`;
  try {
    const data = await getJSON<AllPagesResp>(url);
    return (data.query?.allpages ?? [])
      .map((p) => p.title)
      .filter((t) => !/\/(Archive|sandbox)/i.test(t));
  } catch {
    return [];
  }
}

// Sections that are navigation / logistics, not attractions or food.
const SKIP_SECTION =
  /(get in|get around|get out|go next|nearby|cope|connect|understand|stay safe|stay healthy|respect|talk|learn|work|sleep|by plane|by train|by car|by bus|by boat|events|festivals|itiner)/i;

// Listings that aren't real sights/food no matter the section: services, transit
// nodes, rentals, shops, and one-off events/activities. Matched against the name.
const JUNK_NAME =
  /\b(embassy|consulate|post office|camera shop|bike rental|bike sharing|bike share|scooter|vespa|car rental|rent a (bike|car|scooter)|metro station|train station|bus station|stazione|water taxi|left luggage|atm|pharmacy|hospital|supermarket|laundr|tourist office|porta nolana|porta di massa|festival|biennale|expo|trade fair|conference|congress|scuba|diving|centro sub|dive (center|centre|shop)|cooking (class|course|school)|language school|driving school|dance (class|school)|gym|fitness|nightclub|disco|theme park|water ?park|amusement park|go.?kart|bowling|escape room|boat (tour|hire|rental)|kayak (hire|rental)|tour operator|travel agency)\b/i;

/** Split the top-level template body on `|`, ignoring pipes nested in {{ }} or [[ ]]. */
function splitTopLevel(body: string): string[] {
  const parts: string[] = [];
  let depthCurly = 0;
  let depthSquare = 0;
  let cur = "";
  for (let i = 0; i < body.length; i++) {
    const two = body.slice(i, i + 2);
    if (two === "{{") { depthCurly++; cur += two; i++; continue; }
    if (two === "}}") { depthCurly--; cur += two; i++; continue; }
    if (two === "[[") { depthSquare++; cur += two; i++; continue; }
    if (two === "]]") { depthSquare--; cur += two; i++; continue; }
    if (body[i] === "|" && depthCurly === 0 && depthSquare === 0) {
      parts.push(cur);
      cur = "";
      continue;
    }
    cur += body[i];
  }
  parts.push(cur);
  return parts;
}

/** Strip wiki markup down to readable plain text. */
export function stripWiki(s: string): string {
  return s
    .replace(/<ref[^>]*>.*?<\/ref>/gis, "")
    .replace(/<ref[^>]*\/>/gi, "")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/\[\[(?:[^\]|]*\|)?([^\]]+)\]\]/g, "$1") // [[a|b]] -> b
    .replace(/\[https?:\/\/\S+\s+([^\]]+)\]/g, "$1") // [url label] -> label
    .replace(/\[https?:\/\/\S+\]/g, "")
    .replace(/'''?/g, "")
    .replace(/\{\{[^{}]*\}\}/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const LISTING_TYPES = new Set([
  "see", "do", "eat", "drink", "buy", "sleep", "listing", "marker", "view", "go",
]);

async function fetchPageListings(title: string): Promise<{
  listings: RawListing[];
  lead: string;
}> {
  const wikitext = await fetchWikitext(title);

  // Lead paragraph: text before the first heading, cleaned.
  const beforeFirstHeading = wikitext.split(/\n==[^=]/)[0] ?? "";
  const lead = stripWiki(
    beforeFirstHeading
      .replace(/\{\{[^{}]*\}\}/g, "") // drop templates in the lead
      .split("\n")
      .filter((l) => l.trim() && !l.trim().startsWith("[[") && !l.trim().startsWith("|"))
      .join(" ")
  ).slice(0, 600);

  const listings: RawListing[] = [];
  let section = "";
  // Walk line by line to track the current == Heading == and capture templates.
  const lines = wikitext.split("\n");
  let buffer = "";
  let collecting = false;
  let depth = 0;

  const headingRe = /^==+\s*([^=].*?)\s*==+\s*$/;

  for (const line of lines) {
    const h = !collecting ? line.match(headingRe) : null;
    if (h) {
      section = h[1].trim();
      continue;
    }
    // Track template braces across lines.
    let i = 0;
    while (i < line.length) {
      const two = line.slice(i, i + 2);
      if (two === "{{") {
        if (depth === 0) collecting = true;
        depth++;
        buffer += two;
        i += 2;
        continue;
      }
      if (two === "}}") {
        depth--;
        buffer += two;
        i += 2;
        if (depth === 0 && collecting) {
          maybePush(buffer, section, listings);
          buffer = "";
          collecting = false;
        }
        continue;
      }
      if (collecting) buffer += line[i];
      i++;
    }
    if (collecting) buffer += "\n";
  }

  return { listings, lead };
}

/**
 * Fetch listings for a city. For "huge city" articles (Rome, Naples) the real
 * sights live on district subpages (e.g. Rome/Colosseo), so we fetch those too
 * and merge. Small towns (Positano) have no subpages and just use the main page.
 */
export async function fetchCityListings(
  title: string,
  maxSubpages = 12
): Promise<{ listings: RawListing[]; lead: string }> {
  const main = await fetchPageListings(title);
  const subTitles = (await fetchSubpageTitles(title)).slice(0, maxSubpages);
  const all = [...main.listings];
  for (const sub of subTitles) {
    try {
      const r = await fetchPageListings(sub);
      all.push(...r.listings);
    } catch {
      // skip an unreadable subpage
    }
  }
  return { listings: all, lead: main.lead };
}

function maybePush(raw: string, section: string, out: RawListing[]) {
  // raw looks like: {{see | name=... | lat=... | content=... }}
  const inner = raw.replace(/^\{\{/, "").replace(/\}\}$/, "");
  const parts = splitTopLevel(inner);
  const typeToken = (parts.shift() ?? "").trim().toLowerCase();
  if (!LISTING_TYPES.has(typeToken)) return;

  const fields: Record<string, string> = {};
  for (const p of parts) {
    const eq = p.indexOf("=");
    if (eq === -1) continue;
    const key = p.slice(0, eq).trim().toLowerCase();
    const val = p.slice(eq + 1).trim();
    if (key) fields[key] = val;
  }

  // Drop navigation/logistics sections (Get in, Go next, Sleep, Events, …).
  if (SKIP_SECTION.test(section)) return;
  // 'go' city links and 'sleep' hotels are noise wherever they appear.
  if (typeToken === "go" || typeToken === "sleep") return;

  const name = stripWiki(fields.name || fields.alt || "");
  if (!name) return;
  if (JUNK_NAME.test(name)) return;
  const content = stripWiki(fields.content || fields.description || "");
  const lat = parseFloat(fields.lat || fields.latitude || "");
  const lon = parseFloat(fields.long || fields.lon || fields.longitude || "");

  out.push({
    type: typeToken,
    name,
    content,
    lat: Number.isFinite(lat) ? lat : undefined,
    lon: Number.isFinite(lon) ? lon : undefined,
    section,
  });
}
