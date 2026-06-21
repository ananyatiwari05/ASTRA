export function normalizeTag(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const normalized = normalizeTag(tag);
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      result.push(normalized);
    }
  }

  return result;
}

export function difficultyToNumber(
  difficulty: string | number | undefined,
): number {
  if (typeof difficulty === 'number') {
    return difficulty;
  }

  const map: Record<string, number> = {
    easy: 1,
    medium: 2,
    hard: 3,
  };

  return map[String(difficulty ?? '').toLowerCase()] ?? 0;
}

export function extractProblemId(
  platform: string,
  url: string,
  fallbackTitle?: string,
): string {
  const normalizedPlatform = platform.toLowerCase();

  if (normalizedPlatform === 'leetcode') {
    const match = url.match(/leetcode\.com\/problems\/([^/]+)/);
    if (match) return match[1];
  }

  if (normalizedPlatform === 'gfg' || normalizedPlatform === 'geeksforgeeks') {
    const match = url.match(/problems\/([^/]+)/);
    if (match) return match[1];
  }

  if (normalizedPlatform === 'codeforces') {
    const match = url.match(/problemset\/problem\/(\d+)\/([A-Z0-9]+)/i);
    if (match) return `${match[1]}-${match[2].toUpperCase()}`;
  }

  return normalizeTag(fallbackTitle ?? url);
}
