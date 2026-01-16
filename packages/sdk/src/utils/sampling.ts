function fnv1aHash(str: string): number {
  let hash = 2166136261;

  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }

  return hash;
}

export function shouldTrackSession(sessionId: string, percentage: number): boolean {
  const hash = fnv1aHash(sessionId);
  const bucket = hash % 100;
  return bucket < percentage;
}
