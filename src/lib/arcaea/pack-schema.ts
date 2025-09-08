import { z } from "zod";
import { Langs } from "@/lib/arcaea/langs-schema";

export const PackMetadataSchema = z.object({
  id: z.string(),
  section: z.enum(["archive", "free", "mainstory", "sidestory", "collab"]),
  cost: z.number().int().min(0).optional(),
  custom_banner: z.boolean().optional(),
  plus_character: z.number().int().min(-1).optional(),
  name_localized: z.partialRecord(Langs, z.string()),
  description_localized: z.partialRecord(Langs, z.string()).optional(),
  img: z.string().optional(),
});

export const PackListSchema = z.object({
  packs: z.array(PackMetadataSchema),
});

export type PackMetadata = z.infer<typeof PackMetadataSchema>;
