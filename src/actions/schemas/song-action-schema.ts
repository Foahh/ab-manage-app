﻿import { z } from "zod";
import { SongMetadataSchema } from "@/lib/arcaea/song-schema";

export const SongCreateSchema = z.object({
  metadata: SongMetadataSchema,
  isBonus: z.boolean().optional(),
  mysteryOrder: z.number().int().optional(),
});

export const SongUpdateSchema = SongCreateSchema.partial();
