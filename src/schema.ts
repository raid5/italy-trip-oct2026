export interface Photo {
  /** Relative path within the site, e.g. assets/photos/rome/colosseum.jpg */
  file: string;
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  /** Human-readable credit line shown in captions / credits page */
  credit: string;
}

export interface POI {
  id: string;
  name: string;
  category: string;
  blurb: string;
  lat?: number;
  lon?: number;
  photo?: Photo;
  hiddenGem?: boolean; // shown after the "known for" sights, as a local tip
}

export interface Weather {
  label: string; // "Early October"
  avgHighC: number;
  avgLowC: number;
  avgHighF: number;
  avgLowF: number;
  rainDayPct: number; // 0-100, share of early-Oct days with measurable rain
  seaTempC?: number;
  seaTempF?: number;
  sampleYears: string; // e.g. "2014–2024"
}

export interface Sun {
  sunrise: string; // "07:14"
  sunset: string; // "18:42"
  goldenHourEvening: string; // approx start of evening golden hour
}

export interface ItineraryDay {
  day: number;
  title: string;
  items: string[]; // POI names
}

/**
 * A pre-rendered, bundled basemap for a city (real OSM tiles stitched at build
 * time). The front-end overlays pins by reprojecting each POI's lat/lon into
 * this exact Web-Mercator window — so markers sit on real geography, offline.
 */
export interface MapBase {
  file: string; // relative path within the site, e.g. assets/maps/rome.webp
  z: number; // Web-Mercator zoom level the image was rendered at
  worldLeft: number; // world-pixel X (at z) of the image's left edge
  worldTop: number; // world-pixel Y (at z) of the image's top edge
  w: number; // image width in px (the projection window)
  h: number; // image height in px
  attribution: string; // "© OpenStreetMap contributors"
}

export interface City {
  slug: string;
  name: string;
  region: string;
  tagline: string;
  intro: string;
  lat: number;
  lon: number;
  hero?: Photo;
  weather?: Weather;
  sun?: Sun;
  map?: MapBase; // bundled OSM basemap for the orientation minimap
  pois: POI[];
  categories: string[]; // ordered list of categories actually present
  itinerary: ItineraryDay[];
  transport: string[]; // curated getting-around bullets
  foodNotes: string[]; // signature dishes / where-to-eat bullets
  beachNotes?: string[]; // coastal guide bullets (coastal cities only)
  generatedFrom: string; // attribution: "Wikivoyage / Wikipedia (CC BY-SA)"
}

export interface Phrase {
  it: string;
  en: string;
  say: string; // rough pronunciation
}

export interface SiteData {
  builtLabel: string;
  cities: City[];
  phrases: { group: string; items: Phrase[] }[];
  packingList: string[];
}
