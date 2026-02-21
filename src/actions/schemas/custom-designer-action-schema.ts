import { z } from "zod";
import { IdSchema } from "@/actions/schemas/common-action-schema";

export const CustomDesignerRoles = ["real", "fake"] as const;

export const CustomDesignerRoleEnum = z.enum(CustomDesignerRoles);

export const MultipleCustomDesignersSchema = z
  .object({
    songId: IdSchema.optional(),
    designers: z.array(
      z.object({
        label: z.string().min(1, "请填写谱师名称"),
        role: CustomDesignerRoleEnum,
      }),
    ),
  })
  .refine((data) => data.songId !== undefined, {
    message: "Song ID is required",
    path: ["songId"],
  });
