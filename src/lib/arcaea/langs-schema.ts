import { type ZodType, z } from "zod";

export const langs = ["en", "ja", "ko", "zh-Hans", "zh-Hant"] as const;

export function LocalizedRecord(zodType: ZodType, partial = false) {
  return z.object(
    Object.fromEntries(
      langs.map((lang) => [
        lang,
        partial || lang !== "en" ? zodType.optional() : zodType,
      ]),
    ),
  );
}
