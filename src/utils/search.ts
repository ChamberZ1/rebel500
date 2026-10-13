import type { MotorcyclePart } from '../types/motorcycle';

export interface SearchHit {
  part: MotorcyclePart;
  score: number;
}

/** Token must match at the start of a word ("hanger" must not match "exchanger"). */
const hasWord = (hay: string, token: string) => (' ' + hay).includes(' ' + token);

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9/.-]+/g, ' ').trim();

/** Token search over names, OEM identifiers and keywords. All tokens must match. */
export function searchParts(parts: Iterable<MotorcyclePart>, query: string, limit = 40): SearchHit[] {
  const q = norm(query);
  if (!q) return [];
  const tokens = q.split(/\s+/);
  const hits: SearchHit[] = [];
  for (const part of parts) {
    if (part.kind === 'root') continue;
    const name = norm(part.name);
    const oem = norm([part.oem?.ficheName, part.oem?.oemName, part.oem?.partNumber].filter(Boolean).join(' '));
    const kw = norm((part.keywords ?? []).join(' '));
    const desc = norm(part.description);
    let score = 0;
    let all = true;
    for (const t of tokens) {
      if (hasWord(name, t)) score += name.startsWith(t) ? 6 : 4;
      else if (hasWord(kw, t)) score += 3;
      else if (hasWord(oem, t)) score += 3;
      else if (hasWord(desc, t)) score += 1;
      else {
        all = false;
        break;
      }
    }
    if (!all) continue;
    if (name === q) score += 10;
    if (hasWord(kw, q)) score += 2;
    if (part.verification === '2026-oem-verified') score += 0.5;
    hits.push({ part, score });
  }
  return hits.sort((a, b) => b.score - a.score || a.part.name.localeCompare(b.part.name)).slice(0, limit);
}
