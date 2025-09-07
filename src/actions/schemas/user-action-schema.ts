import { z } from "zod";

const additional = {
  contact: z.string().nullish(),
  bilibili: z.string().nullish(),

  isJammer: z.boolean().optional(),
};

export const UserCreateSchema = z.object({
  name: z.string(),
  ...additional,
});

export const UserUpdateSchema = z.object({
  name: z.string().optional(),
  ...additional,
});
