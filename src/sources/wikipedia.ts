import { getJSON } from "../http.js";

interface SummaryResp {
  title?: string;
  extract?: string;
  coordinates?: { lat: number; lon: number };
  originalimage?: { source: string };
  thumbnail?: { source: string };
  description?: string;
}

export interface CityBasics {
  intro: string;
  description: string;
  lat?: number;
  lon?: number;
}

/** REST summary endpoint: clean intro + coordinates for a Wikipedia title. */
export async function fetchCityBasics(title: string): Promise<CityBasics> {
  const url =
    "https://en.wikipedia.org/api/rest_v1/page/summary/" +
    encodeURIComponent(title.replace(/ /g, "_"));
  const data = await getJSON<SummaryResp>(url);
  return {
    intro: (data.extract || "").trim(),
    description: (data.description || "").trim(),
    lat: data.coordinates?.lat,
    lon: data.coordinates?.lon,
  };
}
