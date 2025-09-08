import { z } from "zod";
import { IdSchema } from "@/actions/schemas/common-action-schema";

export const SongerRoles = ["real", "fake_assigned", "fake_random"] as const;

export const SongerRoleEnum = z.enum(SongerRoles);

export const SongerCreateSchema = z.object({
  songId: IdSchema,
  userId: IdSchema,
  role: SongerRoleEnum,
});

export const SongerUpdateSchema = SongerCreateSchema.partial();

export const MultipleSongersSchema = z
  .object({
    songId: IdSchema.optional(),
    songers: z.array(
      z.object({
        userId: IdSchema.optional(),
        role: SongerRoleEnum,
        isNew: z.boolean().optional(),
      }),
    ),
  })
  .refine((data) => data.songId !== undefined, {
    message: "Song ID is required",
    path: ["songId"],
  });
