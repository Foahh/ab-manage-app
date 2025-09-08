import { z } from "zod";
import { Langs } from "@/lib/arcaea/langs-schema";

const BgDayNight = z.object({
  day: z.string(),
  night: z.string(),
});

const AdditionalFile = z.union([
  z.string(),
  z.object({
    file_name: z.string(),
    requirement: z.enum(["low_res", "hi_res", "required"]),
  }),
]);

export enum RatingClass {
  Past = 0,
  Present = 1,
  Future = 2,
  Beyond = 3,
  Eternal = 4,
}

const Difficulty = z
  .object({
    ratingClass: z.enum(RatingClass),
    chartDesigner: z.string().default(""),
    jacketDesigner: z.string().default(""),
    rating: z.number().int().default(-1),
    ratingPlus: z.boolean().optional(),
    legacy11: z.boolean().optional(),
    plusFingers: z.union([z.boolean(), z.literal(0), z.literal(1)]).optional(),
    jacketOverride: z.boolean().optional(),
    title_localized: z.partialRecord(Langs, z.string()).optional(),
    artist: z.string().optional(),
    artist_localized: z.partialRecord(Langs, z.string()).optional(),
    audioOverride: z.boolean().optional(),
    jacket_night: z.string().optional(),
    hidden_until_unlocked: z.boolean().optional(),
    hidden_until: z.enum(["none", "always", "difficulty", "song"]).optional(),
    world_unlock: z.boolean().optional(),
    bg: z.string().optional(),
    bg_inverse: z.string().optional(),
    bpm: z.string().optional(),
    bpm_base: z.number().optional(),
    version: z.string().optional(),
    date: z.number().int().min(0).optional(),
  })
  .required({
    ratingClass: true,
    chartDesigner: true,
    jacketDesigner: true,
    rating: true,
  });

enum Side {
  Light = 0,
  Conflict = 1,
  Colorless = 2,
  Lephon = 3,
}

export const SongMetadataSchema = z.object({
  id: z.string(),
  idx: z.number().optional(),
  deleted: z.boolean().optional(),
  title_localized: z.partialRecord(Langs, z.string()),
  jacket_localized: z.partialRecord(Langs, z.boolean()).optional(),
  artist: z.string(),
  artist_localized: z.partialRecord(Langs, z.string()).optional(),
  search_title: z.partialRecord(Langs, z.string()).optional(),
  search_artist: z.partialRecord(Langs, z.string()).optional(),
  bpm: z.string(),
  bpm_base: z.number().gt(0),
  set: z.string(),
  purchase: z.string(),
  audioPreview: z.number().int(),
  audioPreviewEnd: z.number().int(),
  side: z.enum(Side),
  world_unlock: z.boolean().optional(),
  byd_local_unlock: z.boolean().optional(),
  songlist_hidden: z.boolean().optional(),
  bg: z.string().optional(),
  bg_inverse: z.string().optional(),
  bg_daynight: BgDayNight.optional(),
  date: z.number().int().min(0),
  version: z.string(),
  remote_dl: z.boolean().optional(),
  source_localized: z.partialRecord(Langs, z.string()).optional(),
  source_copyright: z.string().optional(),
  no_stream: z.boolean().optional(),
  additional_files: z.array(AdditionalFile).optional(),
  difficulties: z
    .array(Difficulty)
    .transform((difficulties) => {
      const present = new Set(difficulties.map((d) => d.ratingClass));
      const result = [...difficulties];

      [0, 1, 2].forEach((ratingClass) => {
        if (!present.has(ratingClass)) {
          result.push({
            ratingClass: ratingClass as RatingClass,
            chartDesigner: "",
            jacketDesigner: "",
            rating: -1,
          });
        }
      });

      return result.sort((a, b) => a.ratingClass - b.ratingClass);
    })
    .refine(
      (difficulties) => {
        const shown = new Set<RatingClass>();
        for (const difficult of difficulties) {
          if (shown.has(difficult.ratingClass)) {
            return false;
          }
          shown.add(difficult.ratingClass);
        }
        return true;
      },
      { error: "存在多个相同的难度" },
    ),
});

export const SongListSchema = z.object({
  songs: z.array(SongMetadataSchema),
});

export type SongMetadata = z.infer<typeof SongMetadataSchema>;
