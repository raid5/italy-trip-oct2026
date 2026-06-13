import type { RawListing } from "./sources/wikivoyage.js";

// Display order on a city page. Coast/beaches and hikes/views lead, matching
// the trip's emphasis; history/art/culture follow.
export const CATEGORY_ORDER = [
  "coastal",
  "outdoors",
  "history",
  "art",
  "culture",
  "food",
  "drink",
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  history: "History & Landmarks",
  art: "Art & Museums",
  culture: "Culture & Squares",
  coastal: "Coast & Beaches",
  outdoors: "Outdoors & Views",
  food: "Food & Drink",
  drink: "Bars & Cafés",
};

// A bar/café/wine spot, even when Wikivoyage tags it as "eat".
const DRINK = /\b(bar|pub|brewery|birreria|enoteca|wine bar|winebar|caff[eè]|caf[eé]|tea room|tearoom|cocktail|aperitivo|gelater)/i;

// Keyword → category, evaluated in this order. History is checked before
// coastal so a seaside castle/church is filed as history, not "beach".
const KEYWORDS: Array<[string, RegExp]> = [
  ["history", /\b(church|chiesa|basilica|cathedral|duomo|ruin|archae|temple|forum|colosseum|amphitheatre|castle|castello|palazzo|palace|catacomb|ancient|roman|baths|necropolis|fort|tower|monument|mausoleum|obelisk|gate|porta|arch)\b/i],
  ["art", /\b(museum|museo|gallery|galleria|pinacoteca|art|painting|sculpture|fresco|exhibit)\b/i],
  ["coastal", /\b(beach|spiagg|lido|cove|grotto|grotta|snorkel|swim|seafront|waterfront|sunbath|bathing|ferry|sail)\b/i],
  ["outdoors", /\b(park|garden|giardin|hike|trail|walk|viewpoint|belvedere|panoram|hill|mount|volcano|crater|terrace|villa)\b/i],
  ["culture", /\b(piazza|square|market|mercato|fountain|fontana|theatre|teatro|auditorium|concert hall|opera|quarter|district|street|library|biblioteca)\b/i],
];

export function categorize(l: RawListing, allowCoastal: boolean): string {
  const hay = `${l.name} ${l.content}`;
  if (l.type === "drink") return "drink";
  if (l.type === "eat") return DRINK.test(l.name) ? "drink" : "food";

  for (const [cat, re] of KEYWORDS) {
    if (cat === "coastal" && !allowCoastal) continue; // inland cities have no beaches
    if (re.test(hay)) return cat;
  }
  if (l.type === "buy") return "culture";
  if (l.type === "do") return "outdoors";
  return "culture";
}
