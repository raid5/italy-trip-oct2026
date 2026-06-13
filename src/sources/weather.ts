import { getJSON } from "../http.js";
import type { Weather } from "../schema.js";

interface ArchiveResp {
  daily?: {
    time: string[];
    temperature_2m_max: (number | null)[];
    temperature_2m_min: (number | null)[];
    precipitation_sum: (number | null)[];
  };
}

interface MarineResp {
  daily?: {
    time: string[];
    sea_surface_temperature_max?: (number | null)[];
  };
}

const c2f = (c: number) => Math.round((c * 9) / 5 + 32);
const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1);

/** Average early-October (Oct 1–14) conditions over the last ~10 years. */
export async function fetchOctoberWeather(
  lat: number,
  lon: number,
  coastal: boolean
): Promise<Weather> {
  const startYear = 2014;
  const endYear = 2024;
  const url =
    "https://archive-api.open-meteo.com/v1/archive" +
    `?latitude=${lat}&longitude=${lon}` +
    `&start_date=${startYear}-10-01&end_date=${endYear}-10-14` +
    "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum" +
    "&timezone=Europe%2FRome";

  const data = await getJSON<ArchiveResp>(url);
  const d = data.daily;
  if (!d) throw new Error("Open-Meteo: no daily data");

  const highs: number[] = [];
  const lows: number[] = [];
  let rainDays = 0;
  let total = 0;
  for (let i = 0; i < d.time.length; i++) {
    const [, mm, dd] = d.time[i].split("-").map(Number);
    if (mm !== 10 || dd > 14) continue; // early October only
    const hi = d.temperature_2m_max[i];
    const lo = d.temperature_2m_min[i];
    const pr = d.precipitation_sum[i];
    if (hi == null || lo == null) continue;
    highs.push(hi);
    lows.push(lo);
    total++;
    if ((pr ?? 0) >= 1) rainDays++;
  }

  const avgHighC = Math.round(avg(highs));
  const avgLowC = Math.round(avg(lows));

  const weather: Weather = {
    label: "Early October",
    avgHighC,
    avgLowC,
    avgHighF: c2f(avgHighC),
    avgLowF: c2f(avgLowC),
    rainDayPct: total ? Math.round((rainDays / total) * 100) : 0,
    sampleYears: `${startYear}–${endYear}`,
  };

  if (coastal) {
    try {
      const murl =
        "https://marine-api.open-meteo.com/v1/marine" +
        `?latitude=${lat}&longitude=${lon}` +
        `&start_date=${endYear}-10-01&end_date=${endYear}-10-14` +
        "&daily=sea_surface_temperature_max&timezone=Europe%2FRome";
      const m = await getJSON<MarineResp>(murl);
      const temps = (m.daily?.sea_surface_temperature_max ?? []).filter(
        (t): t is number => typeof t === "number"
      );
      if (temps.length) {
        const sea = Math.round(avg(temps));
        weather.seaTempC = sea;
        weather.seaTempF = c2f(sea);
      }
    } catch {
      // sea temp is best-effort
    }
  }

  return weather;
}
