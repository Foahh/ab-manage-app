import { z } from "zod";
import { IdSchema } from "@/actions/schemas/common-action-schema";

export const DesignerRoles = ["real", "fake_assigned", "fake_random"] as const;

export const DesignerRoleEnum = z.enum(DesignerRoles);

export const DesignerCreateSchema = z.object({
  songId: IdSchema,
  userId: IdSchema,
  role: DesignerRoleEnum,
});

export const DesignerUpdateSchema = DesignerCreateSchema.partial();

export const MultipleDesignersSchema = z
  .object({
    songId: IdSchema.optional(),
    designers: z.array(
      z.object({
        userId: IdSchema.optional(),
        role: DesignerRoleEnum,
        isNew: z.boolean().optional(),
      }),
    ),
  })
  .refine((data) => data.songId !== undefined, {
    message: "Song ID is required",
    path: ["songId"],
  });
