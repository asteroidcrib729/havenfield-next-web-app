export const storyHomes: Record<string, readonly string[]> = {
  "a-home-that-fits-your-everyday": ["hf-02", "hf-04"],
  "the-value-of-a-thoughtful-floor-plan": ["hf-01", "hf-03"],
  "a-clearer-guide-to-your-first-viewing": ["hf-01", "hf-02"],
  "daylight-through-the-seasons": ["hf-01", "hf-03"],
  "a-room-that-can-change-its-mind": ["hf-04", "hf-02"],
  "planting-for-an-unhurried-garden": ["hf-01", "hf-03"],
  "read-a-floor-plan-in-everyday-routes": ["hf-03", "hf-04"],
  "small-spaces-with-room-to-live": ["hf-04", "hf-02"],
  "a-viewing-checklist-you-will-actually-use": ["hf-01", "hf-02"],
};
export function relatedStorySlugs(id: string) {
  return Object.entries(storyHomes)
    .filter(([, ids]) => ids.includes(id))
    .map(([slug]) => slug);
}
