import { z } from "zod";

export const langs = ["en", "ja", "ko", "zh-Hans", "zh-Hant"] as const;
export type Lang = (typeof langs)[number];
export const Langs = z.enum(langs);

export function getLocale(
  record?: Partial<Record<Lang, string>>,
  key: Lang = "en",
): string | undefined {
  if (!record) {
    return undefined;
  }

  const value = record[key];

  if (value !== undefined) {
    return value;
  }

  const entries = Object.entries(record);
  if (entries.length > 0) {
    const [, firstValue] = entries[0];
    return firstValue;
  }

  return undefined;
}
