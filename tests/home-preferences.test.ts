import { expect, it } from "vitest";
import {
  parseHomeChoices,
  changeHomeChoice,
  removeUnavailableChoices,
} from "../src/lib/home-preferences";
it("ignores malformed, oversized and unknown-version browser data and filters unknown identifiers", () => {
  for (const value of ["{", "x".repeat(5000), '{"version":2,"saved":["hf-01"]}'])
    expect(parseHomeChoices(value).saved).toEqual([]);
  expect(
    parseHomeChoices(
      JSON.stringify({
        version: 1,
        saved: ["hf-01", "hf-01", "../admin", 1],
        compare: ["hf-01", "hf-02", "hf-03", "hf-04"],
      }),
    ),
  ).toEqual({ version: 1, saved: ["hf-01"], compare: ["hf-01", "hf-02", "hf-03"] });
});
it("enforces three comparison slots while keeping saves independent and allowing removal", () => {
  let state = parseHomeChoices(null);
  for (const id of ["hf-01", "hf-02", "hf-03"]) state = changeHomeChoice(state, "compare", id).next;
  expect(changeHomeChoice(state, "compare", "hf-04").limited).toBe(true);
  state = changeHomeChoice(state, "saved", "hf-04").next;
  expect(state.saved).toEqual(["hf-04"]);
  state = changeHomeChoice(state, "compare", "hf-02").next;
  expect(changeHomeChoice(state, "compare", "hf-04").next.compare).toEqual([
    "hf-01",
    "hf-03",
    "hf-04",
  ]);
});

it("accepts managed property identities and caps browser-local saves", () => {
  const id = "hf-5ee692de-647d-4be2-9124-358922901c40";
  const next = changeHomeChoice(parseHomeChoices(null), "saved", id).next;
  expect(parseHomeChoices(JSON.stringify(next)).saved).toEqual([id]);
  expect(changeHomeChoice(next, "compare", id).next.compare).toEqual([id]);
  expect(changeHomeChoice(next, "saved", "hf-injected").next.saved).toEqual([id]);
});

it("removes unavailable saved and comparison identities without changing remaining order", () => {
  const state = {
    version: 1 as const,
    saved: ["hf-01", "hf-02"],
    compare: ["hf-02", "hf-03", "hf-01"],
  };
  expect(removeUnavailableChoices(state, ["hf-03", "hf-01"])).toEqual({
    version: 1,
    saved: ["hf-01"],
    compare: ["hf-03", "hf-01"],
  });
  expect(state.compare).toHaveLength(3);
});
