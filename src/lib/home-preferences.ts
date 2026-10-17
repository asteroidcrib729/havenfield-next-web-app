export const HOME_STORAGE_KEY = "havenfield.homes.v1";
export type HomeChoices = { version: 1; saved: string[]; compare: string[] };
const validId = (id: string) =>
  /^hf-(?:0[1-4]|[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12})$/.test(id);
export function parseHomeChoices(raw: string | null): HomeChoices {
  const empty: HomeChoices = { version: 1, saved: [], compare: [] };
  if (!raw || raw.length > 4000) return empty;
  try {
    const value = JSON.parse(raw);
    if (value?.version !== 1) return empty;
    const ids = (items: unknown, limit: number) =>
      Array.isArray(items)
        ? [
            ...new Set(items.filter((id): id is string => typeof id === "string" && validId(id))),
          ].slice(0, limit)
        : [];
    return {
      version: 1,
      saved: ids(value.saved, 50),
      compare: ids(value.compare, 3),
    };
  } catch {
    return empty;
  }
}
export function changeHomeChoice(state: HomeChoices, kind: "saved" | "compare", id: string) {
  if (!validId(id)) return { next: state, limited: false };
  const selected = state[kind].includes(id);
  if (!selected && state[kind].length >= (kind === "compare" ? 3 : 50))
    return { next: state, limited: true };
  return {
    next: {
      ...state,
      [kind]: selected ? state[kind].filter((value) => value !== id) : [...state[kind], id],
    },
    limited: false,
  };
}
