import { z } from "zod";
export const inquiryStages = ["new", "contacted", "viewing-requested", "closed"] as const;
export const inquiryStates = ["new", "reviewed", "archived"] as const;
export const inquiryFilters = z.object({
  query: z.string().max(200).default(""),
  status: z.enum(inquiryStates).optional(),
  stage: z.enum(inquiryStages).optional(),
  propertyId: z.string().max(120).optional(),
  page: z.coerce.number().int().min(1).max(10000).default(1),
});
export const inquiryPatch = z
  .object({
    status: z.enum(inquiryStates).optional(),
    stage: z.enum(inquiryStages).optional(),
    notes: z.string().max(4000).optional(),
    version: z.number().int().min(1).optional(),
  })
  .strict()
  .refine(
    (value) => value.status !== undefined || value.stage !== undefined || value.notes !== undefined,
    "Choose a field to update",
  )
  .refine(
    (value) =>
      (value.stage === undefined && value.notes === undefined) || value.version !== undefined,
    "A version is required when changing conversation details",
  );
export type InquiryStage = (typeof inquiryStages)[number];
export function stageLabel(stage: string) {
  return stage === "viewing-requested"
    ? "Viewing requested"
    : stage[0].toUpperCase() + stage.slice(1);
}
export function csvCell(value: unknown) {
  const text = String(value ?? "");
  let start = 0;
  while (start < text.length && (text.charCodeAt(start) <= 32 || /\s/u.test(text[start]))) start++;
  const formula =
    ["=", "+", "-", "@"].includes(text[start]) || ["\t", "\r", "\n"].includes(text[0]);
  const safe = formula ? "'" + text : text;
  return '"' + safe.replaceAll('"', '""') + '"';
}
