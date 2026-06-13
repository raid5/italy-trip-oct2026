import type { Sun } from "./schema.js";

// NOAA solar position approximation. Good to ~1 minute, which is plenty here.
// Computes sunrise/sunset for a fixed date (Oct 5) at a given lat/lon,
// expressed in Europe/Rome local time (UTC+2 in early October, CEST).

const RAD = Math.PI / 180;

function dayOfYear(y: number, m: number, d: number): number {
  return Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / 86400000);
}

function hhmm(minutesFromMidnight: number): string {
  const total = Math.round(((minutesFromMidnight % 1440) + 1440) % 1440) % 1440;
  const h = Math.floor(total / 60);
  const m = total - h * 60;
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

/** Returns local clock times for Oct 5 at the given coordinates (CEST, UTC+2). */
export function sunTimes(lat: number, lon: number): Sun {
  const tzOffsetHours = 2; // CEST in early October
  const N = dayOfYear(2026, 10, 5);

  // Fractional year (radians)
  const gamma = ((2 * Math.PI) / 365) * (N - 1 + 0.5);
  // Equation of time (minutes)
  const eqTime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));
  // Solar declination (radians)
  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  function eventMinutes(zenithDeg: number, sunrise: boolean): number {
    const za = zenithDeg * RAD;
    const cosH =
      (Math.cos(za) - Math.sin(lat * RAD) * Math.sin(decl)) /
      (Math.cos(lat * RAD) * Math.cos(decl));
    const clamped = Math.max(-1, Math.min(1, cosH));
    let ha = Math.acos(clamped) / RAD; // degrees
    // Morning events are reached at a negative (eastward) hour angle; the
    // sunrise UTC formula below is 720 - 4*(lon + HA) with HA positive, so we
    // negate HA for the evening (sunset/golden-hour) events instead.
    if (!sunrise) ha = -ha;
    // UTC minutes, then shift to local tz.
    const utcMin = 720 - 4 * (lon + ha) - eqTime;
    return utcMin + tzOffsetHours * 60;
  }

  const sunrise = eventMinutes(90.833, true);
  const sunset = eventMinutes(90.833, false);
  // Golden hour (evening) ~ when sun is 6° above horizon before setting.
  const goldenStart = eventMinutes(84, false);

  return {
    sunrise: hhmm(sunrise),
    sunset: hhmm(sunset),
    goldenHourEvening: hhmm(goldenStart),
  };
}
