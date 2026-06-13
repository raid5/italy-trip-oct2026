import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const UA =
  "italy-site-generator/1.0 (personal travel guide; contact: local build)";

/** Fetch with retry/backoff on rate-limit (429) and transient 5xx errors. */
async function fetchRetry(url: string, accept?: string, tries = 4): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < tries; attempt++) {
    try {
      const headers: Record<string, string> = { "User-Agent": UA };
      if (accept) headers.Accept = accept;
      const res = await fetch(url, { headers });
      if (res.status === 429 || res.status === 503) {
        const retryAfter = Number(res.headers.get("retry-after")) || 0;
        await sleep(Math.max(retryAfter * 1000, 800 * (attempt + 1)));
        continue;
      }
      if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
      return res;
    } catch (e) {
      lastErr = e;
      await sleep(600 * (attempt + 1));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(`GET ${url} failed after ${tries} tries`);
}

export async function getJSON<T = any>(url: string): Promise<T> {
  const res = await fetchRetry(url, "application/json");
  return (await res.json()) as T;
}

export async function getText(url: string): Promise<string> {
  const res = await fetchRetry(url);
  return await res.text();
}

/** Download a binary asset to an absolute path. Returns bytes written. */
export async function download(url: string, absPath: string): Promise<number> {
  const res = await fetchRetry(url);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(dirname(absPath), { recursive: true });
  await writeFile(absPath, buf);
  return buf.length;
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
